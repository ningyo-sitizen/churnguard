import hashlib
import logging
import os
import re
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from io import BytesIO
from time import time
import emoji
from deep_translator import GoogleTranslator
from fastapi import FastAPI, File, Form, UploadFile
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from google_play_scraper import Sort, reviews, search
import joblib
from keybert import KeyBERT
import nltk
from nltk.corpus import stopwords, wordnet
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag_sents
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Download NLTK Resources
for resource in ['stopwords', 'punkt', 'punkt_tab', 'wordnet', 'averaged_perceptron_tagger_eng']:
    nltk.download(resource, quiet=True)

stop_words = set(stopwords.words('english'))

words_to_retain = {
    'not', 'no', 'nor', 'don', 'doesn', 'didn', 'won', 'wouldn',
    'can', 'couldn', 'isn', 'aren', 'wasn', 'weren', 'hasn', 'haven',
    'hadn', 'shouldn', 'mustn', 'ain', 'mightn', 'needn', 'shan',

    # Kontraksi negasi
    "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "couldn't",
    "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't", "hadn't",
    "shouldn't", "mustn't", "shouldn't've", "should've", "mightn't",
    "mightn't've", "needn't", "shan't", "shan't've",

    # Intensifier
    'very', 'more', 'most',

    # Kontradiksi penting
    'but',

    # Negasi bentuk lain
    'd', 've', 'll', 's', 't', 're', 'm'
}
stop_words.difference_update(words_to_retain)

lemmatizer = WordNetLemmatizer()
wordnet_map = {"N": wordnet.NOUN, "V": wordnet.VERB, "J": wordnet.ADJ, "R": wordnet.ADV}

_RE_NON_ALPHA = re.compile(r'[^a-zA-Z_]')
_RE_APP_ID    = re.compile(r'^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$')

# Load Machine Learning Models
current_dir     = os.path.dirname(os.path.abspath(__file__))
model_path      = os.path.join(current_dir, 'app', 'model', 'SVMCW.pkl')
vectorizer_path = os.path.join(current_dir, 'app', 'model', 'vectorizer.pkl')

try:
    tfidf_loaded = joblib.load(vectorizer_path)
    svm_model    = joblib.load(model_path)
    MODELS_LOADED = True
    logger.info("Models loaded successfully.")
except Exception as e:
    logger.error(f"Models error: {e}")
    MODELS_LOADED = False

# Inisialisasi KeyBERT sekali saat startup agar tidak reload setiap request.
# Model 'all-MiniLM-L6-v2' dipilih karena ringan (80MB), cepat di CPU,
# dan akurasi semantiknya memadai untuk ekstraksi kata kunci ulasan aplikasi.
logger.info("Loading KeyBERT model...")
try:
    kw_model = KeyBERT(model='all-MiniLM-L6-v2')
    logger.info("KeyBERT model loaded successfully.")
except Exception as e:
    logger.error(f"KeyBERT model error: {e}")
    kw_model = None

MAX_TRANSLATE_WORKERS = 10

def _translate_single(text: str) -> str:
    try:
        text = str(text).strip()
        if not text:
            return text
        translated = GoogleTranslator(source='auto', target='en').translate(text)
        return translated if translated else text
    except Exception as e:
        logger.warning(f"Translation error: {e}")
        return str(text)

def translate_batch(texts: list[str]) -> list[str]:
    results = [None] * len(texts)
    with ThreadPoolExecutor(max_workers=MAX_TRANSLATE_WORKERS) as executor:
        future_to_idx = {executor.submit(_translate_single, t): i for i, t in enumerate(texts)}
        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            results[idx] = future.result()
    return results

def analyze_sentiment(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    logger.info("Starting parallel translation...")
    df['translated_content'] = translate_batch(df['content'].tolist())

    df['translated_content'] = df['translated_content'].str.replace("_", " ", regex=False)

    df['demojized_content'] = df['translated_content'].apply(
        lambda x: emoji.demojize(x, delimiters=(" ", " ")) if pd.notna(x) else x
    )

    # Ekstrak semua kata yang berasal dari deskripsi emoji sebelum teks dibersihkan.
    # Deskripsi emoji dari demojize mengandung underscore (misal: 'grinning_face', 'thumbs_up').
    # Underscore asli pada teks sudah dihapus di baris translated_content.str.replace("_", " "),
    # sehingga hanya deskripsi emoji yang masih berunderscore pada tahap ini.
    # Setiap segmen kata dalam deskripsi dipecah dan dikumpulkan ke dalam set,
    # misal: 'grinning_face' → {'grinning', 'face'}, 'thumbs_up' → {'thumbs', 'up'}, 'fire' → {'fire'}
    def _extract_emoji_words(text: str) -> set:
        words = set()
        for token in re.findall(r'[a-zA-Z]+(?:_[a-zA-Z]+)+', str(text)):
            words.update(token.lower().split('_'))
        return words

    df['emoji_words'] = df['demojized_content'].apply(
        lambda x: _extract_emoji_words(x) if pd.notna(x) else set()
    )

    df['cleaned_content'] = (
        df['demojized_content']
        .str.replace(_RE_NON_ALPHA, ' ', regex=True)
        .str.lower()
        .str.replace(r'\s+', ' ', regex=True)
        .str.strip()
    )

    df['tokens'] = df['cleaned_content'].apply(nltk.word_tokenize)

    df['filtered_tokens'] = df['tokens'].apply(
        lambda toks: [t for t in toks if t not in stop_words and '_' not in t]
    )

    logger.info("Batch POS tagging...")
    tagged_sentences = pos_tag_sents(df['filtered_tokens'].tolist())

    def lemmatize_tagged(tagged_tokens):
        return [
            lemmatizer.lemmatize(w, wordnet_map.get(p[0], wordnet.NOUN))
            for w, p in tagged_tokens
        ]

    df['lemmatized_tokens']  = [lemmatize_tagged(sent) for sent in tagged_sentences]
    df['lemmatized_content'] = df['lemmatized_tokens'].apply(' '.join)

    # pos_tags tidak disimpan sebagai kolom — hanya digunakan untuk lemmatisasi di atas

    X_final     = tfidf_loaded.transform(df['lemmatized_content'])
    predictions = svm_model.predict(X_final)

    sentiment_map = {0: 'negatif', 1: 'netral', 2: 'positif'}
    df['sentiment'] = [sentiment_map.get(p, p) for p in predictions]

    return df


def get_top_words(df: pd.DataFrame, sentiment: str, top_n: int = 20) -> list:

    if kw_model is None:
        logger.error("KeyBERT model tidak tersedia.")
        return []

    mask = df['sentiment'] == sentiment
    filtered_df = df[mask]

    if filtered_df.empty:
        return []

    # Kumpulkan semua kata asal emoji dari seluruh baris sentimen ini
    # agar frasa hasil KeyBERT yang mengandung kata emoji bisa disaring secara global
    all_emoji_words: set = set()
    for ew in filtered_df['emoji_words']:
        if isinstance(ew, set):
            all_emoji_words.update(ew)

    # Gabungkan seluruh lemmatized_content satu sentimen menjadi satu corpus tunggal.
    # KeyBERT bekerja optimal pada corpus yang cukup panjang karena embedding BERT
    # membutuhkan konteks yang kaya untuk mengukur relevansi semantik setiap frasa.
    corpus = " ".join(filtered_df['lemmatized_content'].dropna().tolist())

    if not corpus.strip():
        return []

    try:
        logger.info(f"Menjalankan KeyBERT untuk sentimen '{sentiment}'...")

        # Ekstrak kandidat keyphrase dengan KeyBERT:
        # - keyphrase_ngram_range=(1, 3) : izinkan unigram, bigram, trigram
        # - use_mmr=True                 : Maximal Marginal Relevance — memaksimalkan
        #                                  keberagaman frasa agar tidak redundan
        # - diversity=0.5                : keseimbangan antara relevansi & keberagaman (0–1)
        # - top_n * 2                    : ambil lebih banyak kandidat untuk buffer setelah
        #                                  emoji filtering
        raw_keywords = kw_model.extract_keywords(
            corpus,
            keyphrase_ngram_range=(1, 3),
            stop_words='english',
            use_mmr=True,
            diversity=0.5,
            top_n=top_n * 2
        )

        # Saring frasa yang mengandung kata asal emoji (multi-kata maupun satu kata)
        filtered_keywords = []
        for phrase, score in raw_keywords:
            phrase_tokens = phrase.lower().split()
            if any(t in all_emoji_words for t in phrase_tokens):
                continue
            filtered_keywords.append((phrase, score))
            if len(filtered_keywords) >= top_n:
                break

        if not filtered_keywords:
            return []

        # Bangun mapping frasa → ulasan asli yang mengandung frasa tersebut.
        # Pencocokan dilakukan pada lemmatized_content agar konsisten dengan
        # corpus yang diberikan ke KeyBERT.
        phrase_to_reviews: dict = defaultdict(list)
        for _, row in filtered_df.iterrows():
            content    = str(row['content'])
            lemmatized = str(row.get('lemmatized_content', '')).lower()
            for phrase, _ in filtered_keywords:
                if phrase.lower() in lemmatized:
                    if content not in phrase_to_reviews[phrase]:
                        phrase_to_reviews[phrase].append(content)

        # Susun output akhir dengan format yang sama seperti sebelumnya
        # agar kompatibel dengan konsumsi UI Frontend tanpa perubahan kontrak API
        top_phrases = []
        for phrase, score in filtered_keywords:
            raw_reviews = phrase_to_reviews.get(phrase, [])
            top_phrases.append([
                phrase,                  # Frasa kunci hasil KeyBERT
                round(float(score), 4),  # Skor cosine similarity frasa terhadap dokumen
                raw_reviews[:10]         # Maksimal 10 ulasan asli untuk fitur Accordion UI
            ])

        return top_phrases

    except Exception as e:
        logger.warning(f"Gagal memproses KeyBERT untuk top words sentimen '{sentiment}': {e}")
        return []


# Scraping Caching System
_scrape_cache: dict = {}
CACHE_TTL_SECONDS = 300

def _cache_key(app_id: str, start_date: str, end_date: str) -> str:
    raw = f"{app_id}|{start_date}|{end_date}"
    return hashlib.md5(raw.encode()).hexdigest()

def _get_cache(key: str):
    entry = _scrape_cache.get(key)
    if entry and (time() - entry['ts'] < CACHE_TTL_SECONDS):
        logger.info(f"Cache hit: {key}")
        return entry['value']
    return None

def _set_cache(key: str, value):
    _scrape_cache[key] = {'ts': time(), 'value': value}


@app.get("/")
def root():
    return {"status": "ok", "message": "Sentiment Analysis API (Optimized)"}


@app.post("/analyze-playstore")
async def analyze_playstore(
    app_name:   str = Form(...),
    app_id:     str = Form(None),
    start_date: str = Form("2026-05-01"),
    end_date:   str = Form(None),
):
    try:
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')

        title     = None
        icon      = None
        developer = None

        if app_id:
            logger.info(f"Using app_id from frontend: {app_id}")
            try:
                meta_results = search(app_id, lang='id', country='id', n_hits=1)
                if meta_results:
                    meta      = meta_results[0]
                    title     = meta.get('title', app_name)
                    icon      = meta.get('icon')
                    developer = meta.get('developer')
            except Exception as e:
                logger.warning(f"Could not fetch metadata for {app_id}: {e}")
            if not title:
                title = app_name
        else:
            logger.info(f"No app_id provided, searching by name: {app_name}")

            def get_app_id_from_name(query: str):
                if _RE_APP_ID.match(query.lower()):
                    return query.lower(), query, None, None
                results = search(query, lang='id', country='id', n_hits=5)
                for res in results:
                    if res.get('appId'):
                        return res['appId'], res['title'], res.get('icon'), res.get('developer')
                return None, None, None, None

            app_id, title, icon, developer = get_app_id_from_name(app_name)
            if not app_id:
                return {"status": "error", "message": f"Aplikasi '{app_name}' tidak ditemukan"}

        ckey   = _cache_key(app_id, start_date, end_date)
        cached = _get_cache(ckey)
        if cached:
            return cached

        scrape_count = 100
        logger.info(f"Scraping {scrape_count} reviews for app_id='{app_id}'")
        scraped_data, _ = reviews(app_id, lang='en', country='id', sort=Sort.NEWEST, count=scrape_count)

        if not scraped_data:
            return {"status": "error", "message": "Tidak ada review"}

        logger.info(f"Scraped {len(scraped_data)} reviews")

        start_dt = pd.to_datetime(start_date)
        end_dt   = pd.to_datetime(end_date)
        df_raw   = pd.DataFrame(scraped_data)
        df_raw['at'] = pd.to_datetime(df_raw['at'])

        df = df_raw[(df_raw['at'] >= start_dt) & (df_raw['at'] <= end_dt)].copy()
        after_filter_count = len(df)
        logger.info(f"After date filter: {after_filter_count} reviews")

        if df.empty:
            return {"status": "error", "message": "Tidak ada review dalam range tanggal"}

        df = df[['content']].dropna().drop_duplicates()
        logger.info(f"Processing {len(df)} reviews")

        if df.empty:
            return {"status": "error", "message": "Tidak ada review setelah filtering"}

        result_df = analyze_sentiment(df)

        sentiment_counts = result_df['sentiment'].value_counts().to_dict()
        total = len(result_df)

        top_words = {
            s: get_top_words(result_df, s, top_n=20) if s in result_df['sentiment'].values else []
            for s in ['negatif', 'netral', 'positif']
        }

        response_data = result_df[['content', 'sentiment']].to_dict(orient='records')

        response = {
            "status": "success",
            "app_id": app_id,
            "app_name": title,
            "icon": icon,
            "total_rows": total,
            "sentiment_counts": sentiment_counts,
            "top_words": top_words,
            "data": response_data,
            "developer": developer,
            "debug_info": {
                "scraped_count": len(scraped_data),
                "after_date_filter": after_filter_count,
                "final_count": total
            }
        }

        _set_cache(ckey, response)
        return response

    except Exception as e:
        logger.error(f"Error in analyze_playstore: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


@app.post("/analyze-csv")
async def analyze_csv(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df_raw   = pd.read_csv(BytesIO(contents))

        valid_columns  = ['content', 'review', 'comment', 'text']
        content_column = next((c for c in valid_columns if c in df_raw.columns), None)

        if not content_column:
            return {
                "status": "error",
                "message": f"File harus memiliki kolom: {', '.join(valid_columns)}"
            }

        df = df_raw[[content_column]].copy().rename(columns={content_column: 'content'})
        df = df.dropna().drop_duplicates()

        if df.empty:
            return {"status": "error", "message": "Tidak ada data valid di file"}

        result_df = analyze_sentiment(df)

        sentiment_counts = result_df['sentiment'].value_counts().to_dict()
        total = len(result_df)

        top_words = {
            s: get_top_words(result_df, s, top_n=20) if s in result_df['sentiment'].values else []
            for s in ['negatif', 'netral', 'positif']
        }

        return {
            "status": "success",
            "total_rows": total,
            "sentiment_counts": sentiment_counts,
            "top_words": top_words,
            "data": result_df[['content', 'sentiment']].to_dict(orient='records')
        }

    except Exception as e:
        logger.error(f"Error in analyze_csv: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


@app.post("/search-apps")
async def search_apps(query: str = Form(...), count: int = Form(5)):
    try:
        if not query or len(query.strip()) < 2:
            return {"status": "error", "message": "Query minimal 2 karakter"}

        query = query.strip()
        logger.info(f"Searching apps: {query}")
        results = search(query, lang='id', country='id', n_hits=count)

        app_list = []
        for res in results:
            if res.get('appId'):
                app_list.append({
                    "appId": res['appId'],
                    "title": res.get('title', ''),
                    "icon": res.get('icon', ''),
                    "developer": res.get('developer', '')
                })

        logger.info(f"Found {len(app_list)} apps for query: {query}")

        return {
            "status": "success",
            "results": app_list
        }
    except Exception as e:
        logger.error(f"Error in search_apps: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}

# ─────────────────────────────────────────────────────────────────────────────
# Request schema untuk endpoint analisis teks manual
# ─────────────────────────────────────────────────────────────────────────────
class TextRequest(BaseModel):
    text: str


@app.post("/analyze-text")
async def analyze_text(payload: TextRequest):
 
    try:
        text = payload.text.strip()

        # ── Validasi input ──────────────────────────────────────────────────
        if not text:
            return {
                "status": "error",
                "message": "Teks tidak boleh kosong."
            }

        if len(text) > 2000:
            return {
                "status": "error",
                "message": "Teks terlalu panjang. Maksimal 2.000 karakter."
            }

        if not MODELS_LOADED:
            return {
                "status": "error",
                "message": "Model ML tidak tersedia. Periksa file SVMCW.pkl dan vectorizer.pkl."
            }

        # ── 1. Translate (auto → en) ────────────────────────────────────────
        # Gunakan _translate_single() langsung — tidak perlu ThreadPoolExecutor
        # karena hanya satu teks, bukan batch.
        logger.info(f"[analyze-text] Step 1 | Translating ({len(text)} chars)...")
        translated = _translate_single(text)
        translated = translated.replace("_", " ")

        # ── 2. Preprocess ───────────────────────────────────────────────────
        logger.info("[analyze-text] Step 2 | Preprocessing...")

        # Demojize: ubah karakter emoji jadi deskripsi teks berunderscore,
        # misal 😊 → " smiling_face "  agar makna emosi tidak hilang
        demojized = emoji.demojize(translated, delimiters=(" ", " ")) if translated else translated

        # Hapus semua karakter non-alfabet (kecuali underscore dari emoji),
        # lowercase, normalisasi spasi berlebih
        cleaned = _RE_NON_ALPHA.sub(' ', demojized)
        cleaned = cleaned.lower()
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()

        # Tokenisasi menjadi list kata
        tokens = nltk.word_tokenize(cleaned)

        # Filter stopwords — pertahankan negasi, intensifier, kontraksi
        # yang ada di words_to_retain (misal: not, very, don't, but)
        filtered_tokens = [
            t for t in tokens
            if t not in stop_words and '_' not in t
        ]

        # ── 3. POS-tag (averaged_perceptron_tagger_eng) ─────────────────────
        # Gunakan nltk.pos_tag() untuk satu kalimat — lebih efisien daripada
        # pos_tag_sents() yang dirancang untuk batch list-of-list
        logger.info("[analyze-text] Step 3 | POS tagging...")
        tagged = nltk.pos_tag(filtered_tokens)

        # ── 4. Lemmatize (WordNetLemmatizer) ────────────────────────────────
        # Petakan tag POS Penn Treebank → konstanta WordNet:
        #   N→NOUN, V→VERB, J→ADJ, R→ADV; selain itu default NOUN
        logger.info("[analyze-text] Step 4 | Lemmatizing...")
        lemmatized_tokens = [
            lemmatizer.lemmatize(word, wordnet_map.get(pos[0], wordnet.NOUN))
            for word, pos in tagged
        ]
        lemmatized_text = ' '.join(lemmatized_tokens)

        # ── 5. Vectorize (TF-IDF) ───────────────────────────────────────────
        # transform() menerima iterable of strings — bungkus dalam list
        # agar menghasilkan sparse matrix shape (1, n_features)
        logger.info("[analyze-text] Step 5 | Vectorizing with TF-IDF...")
        X_vector = tfidf_loaded.transform([lemmatized_text])

        # ── 6. Predict (SVM) ────────────────────────────────────────────────
        # predict() mengembalikan array — ambil elemen pertama [0]
        logger.info("[analyze-text] Step 6 | Predicting with SVM...")
        raw_prediction = svm_model.predict(X_vector)[0]

        sentiment_map = {0: 'negatif', 1: 'netral', 2: 'positif'}
        sentiment = sentiment_map.get(int(raw_prediction), str(raw_prediction))

        logger.info(f"[analyze-text] Result | sentiment={sentiment}")

        return {
            "status":    "success",
            "text":      text,
            "sentiment": sentiment   # "positif" | "netral" | "negatif"
        }

    except Exception as e:
        logger.error(f"Error in analyze_text: {e}", exc_info=True)
        return {
            "status":  "error",
            "message": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)