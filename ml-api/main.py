from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import router kamu (kalau belum pakai router, bisa di-skip dulu)
# dari churn_service langsung juga bisa nanti dipindah
from churn_service import app as churn_app


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


# =========================
# INCLUDE CHURN SERVICE
# =========================
# kalau churn_service kamu masih 1 file besar (app = FastAPI())
# ini cara cepat jalan dulu:
app.mount("/churn", churn_app)