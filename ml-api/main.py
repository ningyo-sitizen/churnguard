from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Python API is running 🚀"}

@app.get("/test")
def test():
    return {
        "status": "success",
        "message": "Node berhasil connect ke Python! hehehe"
    }