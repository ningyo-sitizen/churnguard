from fastapi import FastAPI, UploadFile, File
import pandas as pd
import numpy as np
import pickle
import os
from io import BytesIO

app = FastAPI()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = pickle.load(open(os.path.join(BASE_DIR, "app/model/model.pkl"), "rb"))
scaler_model = pickle.load(open(os.path.join(BASE_DIR, "app/utils/scaler_model.pkl"), "rb"))
scaler_cluster = pickle.load(open(os.path.join(BASE_DIR, "app/utils/scaler_cluster.pkl"), "rb"))
kmeans = pickle.load(open(os.path.join(BASE_DIR, "app/model/kmeans.pkl"), "rb"))

@app.get("/")
def root():
    return {"message": "Python API is running 🚀"}

@app.get("/test")
def test():
    return {"status": "success"}

@app.post("/test-upload")
async def test_upload(file: UploadFile = File(...)):

    try:
        content = await file.read()
        df = pd.read_csv(BytesIO(content))
        df = df.round(2)
        df_full = df.copy()

        df['user_engagement'] = (
            df['ViewingHoursPerWeek'] * 0.4 +
            df['ContentDownloadsPerMonth'] * 0.3 +
            df['WatchlistSize'] * 0.3
        ).round(4)

        drop_cols = [
            "CustomerID","Gender","ParentalControl","SubtitlesEnabled",
            "PaperlessBilling","GenrePreference","ContentType",
            "DeviceRegistered","PaymentMethod","SubscriptionType",
            "MultiDeviceAccess","email"
        ]

        df.drop(columns=drop_cols, inplace=True)

        X_model = df[scaler_model.feature_names_in_]
        X_scaled = scaler_model.transform(X_model)

        proba = model.predict_proba(X_scaled)[:, 1]

        threshold = 0.47
        pred = (proba >= threshold).astype(int)

        cluster_features = [
            "AccountAge",
            "AverageViewingDuration",
            "SupportTicketsPerMonth",
            "TotalCharges"
        ]

        X_cluster = df[cluster_features]
        X_cluster_scaled = scaler_cluster.transform(X_cluster)

        cluster = kmeans.predict(X_cluster_scaled)

        score = (proba * 100).astype(int)

        risk = pd.cut(
        score,
        bins=[0, 30, 60, 100],
        labels=["Low", "Medium", "High"]
        )
        centers = pd.DataFrame(kmeans.cluster_centers_, columns=cluster_features)

        cluster_order = centers["TotalCharges"].argsort().values

        cluster_map = {
            cluster_order[0]: "Basic user",
            cluster_order[1]: "Basic Frustrated user",
            cluster_order[2]: "Experienced user"
        }

        result_df = df_full.copy()

        result_df["Probability"] = proba
        result_df["Score"] = score
        result_df["Risk"] = risk.astype(str)
        result_df["Prediction"] = pred
        result_df["Cluster"] = cluster
        result_df["Segment"] = result_df["Cluster"].map(cluster_map)
        
        return {
            "status": "success",
            "rows": len(result_df),
            "columns": result_df.shape[1],
            "sample": result_df.head(12).to_dict(orient="records")
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }