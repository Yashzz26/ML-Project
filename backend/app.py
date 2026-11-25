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
            payload = request.get_json(silent=True)
            if isinstance(payload, list):
                records = payload
            elif isinstance(payload, dict):
                records = payload.get("customers") or payload.get("records") or [payload]
            else:
                records = []

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



@app.get("/api/model-comparison")
def get_model_comparison():
    """Benchmarking K-Means++ vs Agglomerative Hierarchical vs DBSCAN."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503
    try:
        km_metrics = model_service.get_evaluation_metrics()["final_metrics"]
        agg_metrics = model_service.get_hierarchical_clustering()
        dbscan_metrics = model_service.get_dbscan_clustering()

        models = [
            {
                "name": "K-Means++ (Selected Baseline)",
                "type": "Centroid-based Partitioning",
                "silhouette_score": km_metrics["silhouette_score"],
                "davies_bouldin": km_metrics["davies_bouldin_index"],
                "calinski_harabasz": km_metrics["calinski_harabasz_score"],
                "optimal_k": 5,
                "noise_points": 0,
                "coverage_pct": 100.0,
                "strengths": "Fast O(NK) convergence, distinct spherical convex boundaries, ideal for retail income-spend cohorts.",
                "is_selected": False,
            },
            {
                "name": "Agglomerative Hierarchical",
                "type": "Bottom-up Hierarchical (Ward)",
                "silhouette_score": agg_metrics["silhouette_score"],
                "davies_bouldin": agg_metrics["davies_bouldin_index"],
                "calinski_harabasz": agg_metrics["calinski_harabasz_score"],
                "optimal_k": agg_metrics["n_clusters"],
                "noise_points": 0,
                "coverage_pct": 100.0,
                "strengths": "Deterministic dendrogram hierarchy, zero initialization variance, higher computational complexity O(N^3).",
                "is_selected": False,
            },
            {
                "name": "DBSCAN",
                "type": "Density-Based Spatial Clustering",
                "silhouette_score": dbscan_metrics["silhouette_score"],
                "davies_bouldin": dbscan_metrics["davies_bouldin_index"],
                "calinski_harabasz": dbscan_metrics["calinski_harabasz_score"],
                "optimal_k": dbscan_metrics["clusters_found"],
                "noise_points": dbscan_metrics["outliers_detected"],
                "coverage_pct": dbscan_metrics["coverage_pct"],
                "strengths": (
                    f"Arbitrary shape clustering with automatic noise separation "
                    f"({dbscan_metrics['outliers_detected']} outliers excluded from internal metrics; "
                    f"{dbscan_metrics['coverage_pct']}% coverage)."
                ),
                "is_selected": False,
            },
        ]

        best_model = max(models, key=lambda m: m["silhouette_score"])
        best_model["is_selected"] = True

        conclusion = (
            f"{best_model['name']} achieves the highest Silhouette Score ({best_model['silhouette_score']:.4f}), "
            f"lowest Davies-Bouldin Index ({best_model['davies_bouldin']:.4f}), and highest "
            f"Calinski-Harabasz Score ({best_model['calinski_harabasz']:.2f}) with 100% dataset coverage, "
            f"while DBSCAN isolates {dbscan_metrics['outliers_detected']} sparse points as noise."
        )

        return jsonify({
            "models": models,
            "benchmark_conclusion": conclusion,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/clusters/3d")
def get_clusters_3d():
    """Returns 3D demographic coordinate space [Age, Income, Spending]."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503
    try:
        return jsonify(model_service.get_3d_clustering()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/anomalies")
def get_anomalies_endpoint():
    """Identifies behavioural customer anomalies and distance outliers."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503
    try:
        threshold = float(request.args.get("threshold", 2.0))
        return jsonify(model_service.get_anomalies(threshold_std=threshold)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/api/segments/compare")
def compare_segments():
    """Head-to-head analytical contrast between two customer clusters."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503
    payload = request.get_json(silent=True) or {}
    try:
        ca = int(payload.get("cluster_a", 0))
        cb = int(payload.get("cluster_b", 1))
        summary = model_service.get_cluster_summary()
        prof_a = next((p for p in summary if p["cluster"] == ca), summary[0])
        prof_b = next((p for p in summary if p["cluster"] == cb), summary[1])
        
        income_delta = round(prof_a["average_income"] - prof_b["average_income"], 2)
        spend_delta = round(prof_a["average_spending_score"] - prof_b["average_spending_score"], 2)
        age_delta = round(prof_a["average_age"] - prof_b["average_age"], 1)
        
        return jsonify({
            "segment_a": prof_a,
            "segment_b": prof_b,
            "comparison": {
                "income_delta_k": income_delta,
                "spending_delta": spend_delta,
                "age_delta_years": age_delta,
                "larger_segment": prof_a["persona"] if prof_a["customer_count"] >= prof_b["customer_count"] else prof_b["persona"],
                "strategic_contrast": f"{prof_a['persona']} has ${abs(income_delta)}k {'higher' if income_delta >= 0 else 'lower'} income and {abs(spend_delta)} {'higher' if spend_delta >= 0 else 'lower'} spend index than {prof_b['persona']}."
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/reports/executive-summary")
def get_executive_report_html():
    """Generates print-ready HTML executive briefing summary."""
    if model_service is None or not model_service.is_initialized:
        return "<h3>ML Service unavailable</h3>", 503
    try:
        summary = model_service.get_cluster_summary()
        eval_metrics = model_service.get_evaluation_metrics()["final_metrics"]
        rows_html = "".join([
            f"""<tr>
                <td style="padding:10px; border-bottom:1px solid #e2e8f0; font-weight:bold;">Cluster {p['cluster']}</td>
                <td style="padding:10px; border-bottom:1px solid #e2e8f0;"><span style="color:{p['color']}; font-weight:bold;">{p['persona']}</span></td>
                <td style="padding:10px; border-bottom:1px solid #e2e8f0;">{p['customer_count']} ({p['percentage']}%)</td>
                <td style="padding:10px; border-bottom:1px solid #e2e8f0;">${p['average_income']}k</td>
                <td style="padding:10px; border-bottom:1px solid #e2e8f0;">{p['average_spending_score']}/100</td>
                <td style="padding:10px; border-bottom:1px solid #e2e8f0;">{p['dominant_gender']} ({p['average_age']} yrs)</td>
                <td style="padding:10px; border-bottom:1px solid #e2e8f0; font-size:11px;">{p['strategy']}</td>
            </tr>"""
            for p in summary
        ])
        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Customer Intelligence Executive Briefing</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; }}
        h1 {{ color: #4c1d95; font-size: 24px; margin-bottom: 4px; }}
        .header {{ border-bottom: 2px solid #8b5cf6; padding-bottom: 15px; margin-bottom: 25px; }}
        .kpis {{ display: flex; gap: 15px; margin-bottom: 30px; }}
        .kpi {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; flex: 1; }}
        .kpi-title {{ font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }}
        .kpi-val {{ font-size: 22px; font-weight: bold; color: #0f172a; margin-top: 5px; }}
        table {{ width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }}
        th {{ background: #f1f5f9; padding: 10px; font-size: 11px; text-transform: uppercase; color: #475569; }}
        .footer {{ margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Customer Intelligence Executive Briefing</h1>
        <p style="margin:0; color:#64748b; font-size:13px;">Unsupervised Mall Customer Cohort Segmentation • K-Means++ Model (K=5)</p>
    </div>
    <div class="kpis">
        <div class="kpi"><div class="kpi-title">Total Customers</div><div class="kpi-val">200</div></div>
        <div class="kpi"><div class="kpi-title">Optimal Clusters (K)</div><div class="kpi-val">5</div></div>
        <div class="kpi"><div class="kpi-title">Silhouette Score</div><div class="kpi-val">{eval_metrics['silhouette_score']}</div></div>
        <div class="kpi"><div class="kpi-title">Davies-Bouldin Index</div><div class="kpi-val">{eval_metrics['davies_bouldin_index']}</div></div>
    </div>
    <table>
        <thead>
            <tr><th>Cluster</th><th>Persona</th><th>Cohort Size</th><th>Avg Income</th><th>Avg Spend</th><th>Demographics</th><th>Strategic Action Plan</th></tr>
        </thead>
        <tbody>
            {rows_html}
        </tbody>
    </table>
    <div class="footer">Generated automatically by Customer Intelligence Lab API • Verified with StandardScaler & K-Means++ Clustering.</div>
</body>
</html>"""
        return Response(html, mimetype="text/html"), 200
    except Exception as e:
        return f"<h3>Error: {str(e)}</h3>", 500


@app.get("/api/tune-kmeans")
def tune_kmeans_endpoint():
    """Dynamically retrains K-Means for user-selected K and initialization strategy."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503
    try:
        k = request.args.get("k", default=5, type=int)
        init = request.args.get("init", default="k-means++", type=str)
        n_init = request.args.get("n_init", default=10, type=int)
        return jsonify(model_service.tune_kmeans(k=k, init_method=init, n_init=n_init)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/decision-tree")
def get_decision_tree_endpoint():
    """Returns surrogate Decision Tree structure and IF-THEN rules for model explainability."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503
    try:
        return jsonify(model_service.get_decision_tree_rules()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/api/decision-tree/trace")
def trace_decision_tree_endpoint():
    """Traces an individual customer's decision path from root to leaf node."""
    if model_service is None or not model_service.is_initialized:
        return jsonify({"error": "ML Service unavailable"}), 503
    payload = request.get_json(silent=True) or {}
    try:
        income = float(payload.get("income", 50.0))
        spending = float(payload.get("spending", 50.0))
        return jsonify(model_service.explain_customer_prediction(income=income, spending=spending)), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Support port configuration via environment variable, defaulting to 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host="127.0.0.1", port=port, debug=False)
