import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "Mall_Customers.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

FEATURES = ["Annual Income (k$)", "Spending Score (1-100)"]
REQUIRED_COLUMNS = [
    "CustomerID",
    "Gender",
    "Age",
    "Annual Income (k$)",
    "Spending Score (1-100)",
]

def validate_dataset(df: pd.DataFrame) -> None:
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")
    if df[FEATURES].isnull().any().any():
        raise ValueError("Income/spending contains missing values.")
    if df.duplicated().any():
        print("Warning: duplicate rows detected. Keeping them because the notebook reports zero duplicates.")

def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"{DATA_PATH} not found. Copy your Mall_Customers.csv into backend/data/"
        )

    df = pd.read_csv(DATA_PATH)
    validate_dataset(df)

    X = df[FEATURES].astype(float)

    # Same preprocessing as the uploaded notebook.
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Evaluate K=2..10, matching the notebook.
    evaluations = []
    for k in range(2, 11):
        model = KMeans(
            n_clusters=k,
            init="k-means++",
            n_init=10,
            random_state=42,
        )
        labels = model.fit_predict(X_scaled)
        evaluations.append({
            "k": k,
            "inertia": float(model.inertia_),
            "silhouette": float(silhouette_score(X_scaled, labels)),
        })

    # Project specification: K=5.
    final_model = KMeans(
        n_clusters=5,
        init="k-means++",
        n_init=10,
        random_state=42,
    )
    df["Cluster"] = final_model.fit_predict(X_scaled)

    score = silhouette_score(X_scaled, df["Cluster"])

    summary = (
        df.groupby("Cluster")
        .agg(
            Customer_Count=("CustomerID", "count"),
            Average_Age=("Age", "mean"),
            Average_Income=("Annual Income (k$)", "mean"),
            Average_Spending_Score=("Spending Score (1-100)", "mean"),
        )
        .round(2)
        .reset_index()
    )

    # Stable business names based on centroid/profile characteristics.
    labels = {}
    for _, row in summary.iterrows():
        income = row["Average_Income"]
        spend = row["Average_Spending_Score"]
        cluster = int(row["Cluster"])

        if income >= 70 and spend >= 60:
            name = "High Income • High Spending"
            strategy = "VIP loyalty, early access, premium offers and retention rewards."
        elif income >= 70 and spend < 40:
            name = "High Income • Low Spending"
            strategy = "Use feedback, personalized offers and premium-product discovery campaigns."
        elif income < 40 and spend >= 60:
            name = "Low Income • High Spending"
            strategy = "Use value bundles, discounts and affordable loyalty incentives."
        elif income < 40 and spend < 40:
            name = "Low Income • Low Spending"
            strategy = "Use low-cost awareness campaigns and avoid high acquisition spend."
        else:
            name = "Moderate Income • Moderate Spending"
            strategy = "Use broad seasonal promotions and gradual upsell campaigns."

        labels[str(cluster)] = {"name": name, "strategy": strategy}

    # Save artifacts.
    joblib.dump(final_model, MODEL_DIR / "kmeans.joblib")
    joblib.dump(scaler, MODEL_DIR / "scaler.joblib")

    # Save labeled dataset for dashboard.
    df.to_csv(MODEL_DIR / "customers_with_clusters.csv", index=False)

    metadata = {
        "features": FEATURES,
        "n_clusters": 5,
        "init": "k-means++",
        "n_init": 10,
        "random_state": 42,
        "silhouette_score": round(float(score), 4),
        "evaluations": evaluations,
        "cluster_labels": labels,
        "dataset_rows": int(len(df)),
        "note": "Silhouette score is clustering quality, not classification accuracy.",
    }

    (MODEL_DIR / "metadata.json").write_text(
        json.dumps(metadata, indent=2),
        encoding="utf-8",
    )
    summary.to_json(MODEL_DIR / "cluster_summary.json", orient="records", indent=2)

    print("Training complete.")
    print(f"Rows: {len(df)}")
    print(f"K: 5")
    print(f"Silhouette Score: {score:.4f}")
    print("Artifacts saved in backend/models/")

if __name__ == "__main__":
    main()
