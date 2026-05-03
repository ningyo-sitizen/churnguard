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

# main.py
from fastapi import FastAPI
import pandas as pd

from fastapi import FastAPI, UploadFile, File

app = FastAPI()

from fastapi import FastAPI, UploadFile, File
import pandas as pd
from io import BytesIO

app = FastAPI()

@app.post("/test-upload")
async def test_upload(file: UploadFile = File(...)):
    try:
        content = await file.read()

        df = pd.read_csv(BytesIO(content))

        print("Nama file:", file.filename)
        print("Shape:", df.shape)
        print(df.head())
        df.info()

        return {
            "status": "success",    
            "rows": df.shape[0],
            "cols": df.shape[1]
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
