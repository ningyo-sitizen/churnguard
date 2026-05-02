from fastapi import FastAPI
import pandas as pd
app = FastAPI()


@app.get("/")
def root():
    return {"message": "Python API is running 🚀"}

@app.get("/test")
def test():
    df = pd.read_csv("../backend/test(2).csv")
    df = df.round(2)
    print(df.head())
    return {
        "status": "success",
        "message": "Node berhasil connect ke Python! hehehe"
    }