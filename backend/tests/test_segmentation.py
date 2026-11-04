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
