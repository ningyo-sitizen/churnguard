import nltk
import pandas as pd
import re
from datetime import datetime
from google_play_scraper import Sort, reviews, search
from nltk.corpus import stopwords
from nltk import pos_tag
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import matplotlib.pyplot as plt
from collections import Counter
import os

# Download NLTK data
nltk.download('stopwords', quiet=True)
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('averaged_perceptron_tagger_eng', quiet=True)

# 1. User Inputs
user_input = input("Masukkan nama aplikasia") or "WhatsApp"
limit_input = int(input("Masukkan jumlah maksimal review yang ditarik (misal: 1000): ") or 1000)
start_date_str = input("Masukkan tanggal mulai (YYYY-MM-DD): ") or "2024-01-01"
end_date_str = input("Masukkan tanggal selesai (YYYY-MM-DD): ") or datetime.now().strftime('%Y-%m-%d')

def get_app_id(query):
    if re.match(r'^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$', query.lower()):
        return query.lower(), query
    print(f"\nMencari ID aplikasi untuk '{query}'...")
    results = search(query, lang='id', country='id', n_hits=5)
    for res in results:
        if res.get('appId'):
            return res['appId'], res['title']
    return None, None

try:
    app_id, title = get_app_id(user_input)
    start_date = pd.to_datetime(start_date_str)
    end_date = pd.to_datetime(end_date_str)

    if not app_id:
        print("[ERROR] Aplikasi tidak ditemukan.")
    else:
        print(f"[INFO] Menggunakan ID: {app_id} ({title})")
        print(f"[INFO] Memulai scraping... (Maksimal {limit_input} data)")

        # 2. Proses Scraping
        scraped_data, _ = reviews(
            app_id,
            lang='en',
            country='id',
            sort=Sort.NEWEST,
            count=limit_input
        )

        # 3. Konversi dan Filter berdasarkan Tanggal
        if scraped_data:
            df_raw = pd.DataFrame(scraped_data)
            # Pastikan kolom 'at' adalah datetime
            df_raw['at'] = pd.to_datetime(df_raw['at'])

            # Filter berdasarkan rentang tanggal
            df = df_raw[(df_raw['at'] >= start_date) & (df_raw['at'] <= end_date)].copy()

            if not df.empty:
                print(f"\n--- Preview Data ({start_date_str} s/d {end_date_str}) ---")
                print(df.head())
                print(f"\n[SUKSES] {len(df)} data dalam rentang waktu tersebut berhasil disimpan ke DataFrame 'df'.")
                display(df)
            else:
                print(f"\n[WARNING] Tidak ada review ditemukan antara {start_date_str} dan {end_date_str}.")
        else:
            print("[WARNING] Tidak ada review yang ditemukan.")

except Exception as e:
    print(f"[ERROR] Terjadi kesalahan: {e}")

df = df[['content']]

df = df.dropna(subset=['content'])

df = df.drop_duplicates(subset='content')

def preprocess_text(content):
    cleaned_text = str(content)
    cleaned_text = re.sub('[^a-zA-Z]',' ',cleaned_text)
    cleaned_text = cleaned_text.lower()
    return cleaned_text

df['cleaned_content'] = df['content'].apply(preprocess_text)
df.head()

def tokenize_text(cleaned_content):
    tokens = nltk.word_tokenize(cleaned_content)
    return tokens

df['tokens'] = df['cleaned_content'].apply(tokenize_text)
df.head()

stop_words = set(stopwords.words('english'))

def remove_stopwords(tokens):
    filtered_tokens = [token for token in tokens if token not in stop_words]
    return filtered_tokens

df['filtered_tokens'] = df['tokens'].apply(remove_stopwords)
df.head()



lemmatizer = WordNetLemmatizer()
wordnet_map = {"N": wordnet.NOUN, "V": wordnet.VERB, "J": wordnet.ADJ, "R": wordnet.ADV}

def lemmatize_words(tokens):
    pos_tagged_text = pos_tag(tokens)
    return [lemmatizer.lemmatize(word, wordnet_map.get(pos[0], wordnet.NOUN)) for word, pos in pos_tagged_text]

df['lemmatized_tokens'] = df['filtered_tokens'].apply(lemmatize_words)

# Join tokens back into strings for TF-IDF Vectorizer
df['lemmatized_content'] = df['lemmatized_tokens'].apply(lambda x: ' '.join(x))

# Initialize and fit TF-IDF Vectorizer
tfidf = TfidfVectorizer()
X_tfidf = tfidf.fit_transform(df['lemmatized_content'])
df.head()

# Define model and vectorizer paths (local environment)
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'app', 'model', 'SVMCW.pkl')
vectorizer_path = os.path.join(current_dir, 'app', 'model', 'vectorizer.pkl')

try:
    # 1. Load the original vectorizer
    print(f"[INFO] Loading vectorizer from {vectorizer_path}...")
    tfidf_loaded = joblib.load(vectorizer_path)

    # 2. Transform the data using the loaded vectorizer
    X_final = tfidf_loaded.transform(df['lemmatized_content'])

    # 3. Load the pre-trained model
    print(f"[INFO] Loading model from {model_path}...")
    svm_model = joblib.load(model_path)

    print(f"\n[ANALYSIS] Input features: {X_final.shape[1]}")

    # 4. Perform Prediction
    predictions = svm_model.predict(X_final)

    # 5. Map numerical labels to text labels
    sentiment_map = {0: 'negatif', 1: 'netral', 2: 'positif'}
    df['sentiment'] = [sentiment_map.get(pred, pred) for pred in predictions]

    print("\n[SUCCESS] Predictions completed with labeled categories!")
    display(df[['content', 'sentiment']].head(10))

except Exception as e:
    print(f"[ERROR] Prediction failed: {e}")
    print("Ensure both .pkl files are the ones used during the original training.")

# Menghitung jumlah masing-masing sentimen
sentiment_counts = df['sentiment'].value_counts()

# Menentukan urutan dan warna sesuai permintaan
# negatif=merah, netral=biru, positif=hijau
colors_map = {'negatif': '#ff9999', 'netral': '#66b3ff', 'positif': '#99ff99'}

# Pastikan label ada dalam data sebelum mengambil warna
labels = sentiment_counts.index
colors = [colors_map.get(label, 'grey') for label in labels]

# Membuat Pie Chart
plt.figure(figsize=(8, 6))
plt.pie(sentiment_counts, labels=labels, autopct='%1.1f%%', startangle=140, colors=colors)
plt.title('Distribusi Analisis Sentimen')
plt.axis('equal') # Memastikan lingkaran proposional
plt.show()

def get_top_words(df, sentiment, top_n=10):
    # Mengumpulkan semua token untuk sentimen tertentu
    all_tokens = [token for sublist in df[df['sentiment'] == sentiment]['lemmatized_tokens'] for token in sublist]
    return Counter(all_tokens).most_common(top_n)

sentiments = ['negatif', 'netral', 'positif']

print("--- Top 10 Kata Berdasarkan Sentimen ---\n")

for sentiment in sentiments:
    print(f"Sentimen: {sentiment.upper()}")
    top_words = get_top_words(df, sentiment)

    if top_words:
        for i, (word, count) in enumerate(top_words, 1):
            print(f"{i}. {word}: {count}")
    else:
        print("Tidak ada data.")
    print("-" * 30)