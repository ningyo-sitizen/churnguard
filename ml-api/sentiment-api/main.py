from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import router kamu (kalau belum pakai router, bisa di-skip dulu)
# dari churn_service langsung juga bisa nanti dipindah
from sentiment_service import app as sentiment_service


app = FastAPI(
    title="ML API (Churn + Sentiment)",
    version="1.0.0"
)

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # nanti bisa dibatasi domain frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {
        "message": "ML API running 🚀",
        "status": "ok"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}


app.mount("/sentimen", sentiment_service)