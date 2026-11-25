import pytest
from pathlib import Path
import pandas as pd
from model.segmentation import CustomerSegmentationModel

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "Mall_Customers.csv"

@pytest.fixture
def model_service():
    return CustomerSegmentationModel(DATA_PATH)

def test_pipeline_initialization(model_service):
    assert model_service.is_initialized is True
    assert model_service.model is not None
    assert model_service.scaler is not None
    assert len(model_service.cluster_profiles) == 5

def test_evaluation_metrics(model_service):
    metrics = model_service.get_evaluation_metrics()
    assert "elbow" in metrics
    assert "silhouette" in metrics
    assert "multimetric" in metrics
    assert metrics["final_metrics"]["silhouette_score"] > 0.50

def test_clv_projections(model_service):
    clv = model_service.get_clv_projections()
    assert "clusters" in clv
    assert len(clv["clusters"]) == 5
    assert clv["portfolio_summary"]["total_customers"] == 200

def test_hierarchical_clustering(model_service):
    res = model_service.get_hierarchical_clustering()
    assert res["n_clusters"] == 5
    assert res["silhouette_score"] > 0.40

def test_anomalies_detection(model_service):
    anom = model_service.get_anomalies(threshold_std=2.0)
    assert "anomalies" in anom
    assert isinstance(anom["anomalies"], list)

def test_batch_prediction(model_service):
    test_records = [
        {"income": 80, "spending_score": 80},
        {"income": 20, "spending_score": 20},
    ]
    res = model_service.predict_batch(test_records)
    assert res["total_processed"] == 2

def test_tune_kmeans(model_service):
    res_k4 = model_service.tune_kmeans(k=4)
    assert res_k4["k"] == 4
    assert len(res_k4["centroids"]) == 4
    assert res_k4["silhouette_score"] > 0.40

    res_k5 = model_service.tune_kmeans(k=5)
    assert res_k5["k"] == 5
    assert len(res_k5["centroids"]) == 5

def test_decision_tree_rules(model_service):
    tree_data = model_service.get_decision_tree_rules()
    assert tree_data["fidelity_accuracy_pct"] >= 95.0
    assert len(tree_data["rules"]) > 0
    assert "Annual Income (k$)" in tree_data["feature_importances"]

def test_explain_customer_prediction(model_service):
    explanation = model_service.explain_customer_prediction(income=85.0, spending=80.0)
    assert "path_steps" in explanation
    assert len(explanation["path_steps"]) > 0
    assert explanation["predicted_cluster"] in [0, 1, 2, 3, 4]
    assert len(explanation["explanation_narrative"]) > 0

def test_dbscan_calculated_metrics(model_service):
    db = model_service.get_dbscan_clustering()
    assert db["noise_excluded_from_metrics"] is True
    assert db["outliers_detected"] == 9
    assert db["davies_bouldin_index"] > 0
    assert db["calinski_harabasz_score"] > 0
    assert db["coverage_pct"] == 95.5

def test_pca_age_aware_projection(model_service):
    pca = model_service.get_pca_projections()
    assert pca["features_used"] == ["Age", "Annual Income (k$)", "Spending Score (1-100)"]
    assert 75.0 <= pca["total_variance_explained"] <= 80.0
    assert len(pca["points"]) == 200

def test_decision_tree_holdout_and_persistence(model_service):
    tree_data = model_service.get_decision_tree_rules()
    holdout = tree_data["holdout_evaluation"]
    assert holdout["train_records"] == 150
    assert holdout["test_records"] == 50
    assert holdout["accuracy_vs_teacher_pct"] >= 90.0
    assert holdout["macro_f1_vs_teacher"] >= 0.90
    assert (model_service.model_dir / "kmeans.joblib").exists()
    assert (model_service.model_dir / "scaler.joblib").exists()
    assert (model_service.model_dir / "decision_tree_surrogate.joblib").exists()

def test_predict_includes_surrogate_explanation(model_service):
    pred = model_service.predict_segment({"income": 85, "spending_score": 82, "age": 30, "gender": "Female"})
    assert "surrogate_explanation" in pred
    assert pred["surrogate_explanation"]["agrees_with_kmeans"] is True
    assert len(pred["surrogate_explanation"]["path_steps"]) > 0

