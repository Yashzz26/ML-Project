import os
import io
from pathlib import Path
import pandas as pd
from flask import Flask, jsonify, request, Response
from flask_cors import CORS

from model.segmentation import get_model_service

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "Mall_Customers.csv"

app = Flask(__name__)
# Enable CORS for all routes so Vite dev server (e.g. port 5173) can communicate seamlessly
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize ML service
try:
    model_service = get_model_service(DATA_PATH)
except Exception as e:
    model_service = None
    init_error = str(e)
else:
    init_error = None


@app.get("/api/health")
def health():
    """Health check endpoint exposing ML pipeline operational status."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({
            "status": "degraded",
            "model_loaded": False,
            "error": init_error or (model_service.init_error if model_service else "Service not initialized"),
        }), 503

    return jsonify(model_service.get_health_status()), 200


@app.get("/api/dashboard")
def get_dashboard():
    """Consolidated overview metrics for the executive dashboard."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        clusters_data = model_service.get_clusters_data()
        summary = model_service.get_cluster_summary()
        stats = model_service.get_statistics()
        silhouette_data = model_service.get_silhouette_data()

        counts = {str(p["cluster"]): p["customer_count"] for p in summary}

        return jsonify({
            "total_customers": stats["total_customers"],
            "n_clusters": 5,
            "silhouette_score": silhouette_data["optimal_score"],
            "features_used": stats["features_used"],
            "cluster_counts": counts,
            "cluster_summary": summary,
            "model_status": "Active & Validated",
            "algorithm": "K-Means++ with StandardScaler",
            "explanation": "Using K-Means++, customers are grouped according to annual income and spending behaviour.",
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/dataset")
def get_dataset():
    """Returns dataset with filtering, pagination, sorting, and search."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        page = request.args.get("page", default=1, type=int)
        page_size = request.args.get("page_size", default=20, type=int)
        sort_by = request.args.get("sort_by", default="CustomerID", type=str)
        sort_order = request.args.get("sort_order", default="asc", type=str)
        search = request.args.get("search", default="", type=str)
        gender_filter = request.args.get("gender", default="", type=str)
        cluster_filter = request.args.get("cluster", default=None, type=lambda v: int(v) if v != "" and v is not None else None)

        result = model_service.get_dataset(
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
            search=search,
            gender_filter=gender_filter,
            cluster_filter=cluster_filter,
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/statistics")
def get_statistics():
    """Returns dataset descriptive statistics."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        return jsonify(model_service.get_statistics()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/eda")
def get_eda():
    """Interactive chart datasets for Exploratory Data Analysis."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        return jsonify(model_service.get_eda()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/elbow")
def get_elbow():
    """Returns inertia values for K=1 to 10."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        return jsonify(model_service.get_elbow_data()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/silhouette")
def get_silhouette():
    """Returns silhouette scores for K=2 to 10."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        return jsonify(model_service.get_silhouette_data()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/evaluation-metrics")
def get_evaluation_metrics():
    """Comprehensive clustering validation (Silhouette, Davies-Bouldin, Calinski-Harabasz)."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        return jsonify(model_service.get_evaluation_metrics()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/clusters")
def get_clusters():
    """Returns 2D cluster points and centroids for visualization."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        return jsonify(model_service.get_clusters_data()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/cluster-summary")
def get_cluster_summary():
    """Returns dynamically derived cluster business profiles and strategies."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        return jsonify(model_service.get_cluster_summary()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/clv-analysis")
def get_clv_analysis():
    """Customer Lifetime Value (CLV) and revenue projections per segment."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        return jsonify(model_service.get_clv_projections()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/api/predict")
def predict():
    """Infers customer segment using the fitted scaler and trained K-Means++ model."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    payload = request.get_json(silent=True) or {}

    try:
        prediction_result = model_service.predict_segment(payload)
        return jsonify(prediction_result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Inference failure: {str(e)}"}), 500


@app.post("/api/batch-predict")
def predict_batch():
    """Vectorized batch prediction via uploaded CSV file or JSON customer list."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        if "file" in request.files:
            file = request.files["file"]
            if file.filename == "":
                return jsonify({"error": "No selected file"}), 400
            file_stream = io.StringIO(file.stream.read().decode("utf-8", errors="replace"))
            df_upload = pd.read_csv(file_stream)
            records = df_upload.to_dict(orient="records")
        else:
            payload = request.get_json(silent=True) or {}
            records = payload.get("customers") or payload.get("records") or payload
            if isinstance(records, dict):
                records = [records]

        result = model_service.predict_batch(records)
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Batch inference failure: {str(e)}"}), 500


@app.post("/api/campaign-simulator")
def simulate_campaign():
    """Simulates marketing campaign reach, conversions, ROAS, and profit per segment."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    payload = request.get_json(silent=True) or {}

    try:
        cluster_id = int(payload.get("cluster_id", 0))
        budget = float(payload.get("budget", 1500.0))
        discount_pct = float(payload.get("discount_pct", 10.0))
        channel = str(payload.get("channel", "email"))

        sim_result = model_service.simulate_campaign(
            cluster_id=cluster_id,
            budget=budget,
            discount_pct=discount_pct,
            channel=channel,
        )
        return jsonify(sim_result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Simulation failure: {str(e)}"}), 500


@app.get("/api/results/export")
def export_results():
    """Exports CSV containing clustered dataset or summary table."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503

    try:
        export_type = request.args.get("type", "customers").lower()
        csv_content = model_service.export_csv_content(export_type)

        filename = (
            "Cluster_Summary.csv"
            if export_type == "summary"
            else "Customer_Segmentation_Results.csv"
        )

        return Response(
            csv_content,
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Support port configuration via environment variable, defaulting to 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host="127.0.0.1", port=port, debug=False)
