from fastapi import FastAPI
import pandas as pd
app = FastAPI()
import pickle
import numpy as np
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))



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
    print("jowy")
    try:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))

        model = pickle.load(open(os.path.join(BASE_DIR, "app/model/model.pkl"), "rb"))
        print("model ke baca")

        scaler = pickle.load(open(os.path.join(BASE_DIR, "app/utils/scaler.pkl"), "rb"))
        print("scaler ke baca")

        kmeans = pickle.load(open(os.path.join(BASE_DIR, "app/model/kmeans.pkl"), "rb"))
        print("kmeans ke baca")
        
        content = await file.read()

        print("Nama file:", file.filename)
        
        df = pd.read_csv(BytesIO(content))
        print("Shape:", df.shape)
        print(df.head())
        df.info()
        df = df.copy()
        df = df.round(2)

        df['user_engagement'] = (
            (df['ViewingHoursPerWeek'] * 0.4) +
            (df['ContentDownloadsPerMonth'] * 0.3) +
            (df['WatchlistSize'] * 0.3)
        ).round(4)


        drop_cols = ["CustomerID","Gender","ParentalControl","SubtitlesEnabled","PaperlessBilling","GenrePreference","ContentType","DeviceRegistered","PaymentMethod","SubscriptionType","MultiDeviceAccess"]
        df.drop(drop_cols, axis=1, inplace=True)

        X_scaled =  scaler.transform(df)
        
        proba = model.predict_proba(X_scaled)[:, 1]
        
        threshold = 0.47
        pred = (proba >= threshold).astype(int)
        
        cluster = kmeans.predict(X_scaled)
        
        centers = kmeans.cluster_centers_
        
        centers_df = pd.DataFrame(centers, columns=scaler.feature_names_in_)
        
        sorted_clusters = centers_df["AccountAge"].argsort()
        
        cluster_map = {
        sorted_clusters[0]: "New User",
        sorted_clusters[1]: "Growing User",
        sorted_clusters[2]: "Loyal User"
        }
        
        score = (proba * 100).round(0).astype(int)
        
        def categorize(s):
            if s <= p33:
                return "Low"
            elif s <= p66:
                return "Medium"
            else:
                return "High"

        p33 = np.percentile(score, 33)
        p66 = np.percentile(score, 66)
        risk = pd.Series(score).apply(categorize)


        result_df = df.copy()

        result_df["Probability"] = proba
        result_df["Score"] = score
        result_df["Risk"] = risk
        result_df["Prediction"] = pred
        result_df["Cluster"] = cluster
        result_df["Segment"] = result_df["Cluster"].map(cluster_map)

        result_df = result_df.round(2)
        print(result_df.head())
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
