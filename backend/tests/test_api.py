import pytest
from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.get_json()["status"] == "healthy"

def test_dashboard_endpoint(client):
    res = client.get("/api/dashboard")
    assert res.status_code == 200

def test_model_comparison_endpoint(client):
    res = client.get("/api/model-comparison")
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["models"]) == 3
    dbscan_entry = next(m for m in data["models"] if m["name"] == "DBSCAN")
    assert dbscan_entry["noise_points"] == 9
    assert dbscan_entry["davies_bouldin"] != 0.884
    assert dbscan_entry["calinski_harabasz"] != 112.4

def test_predict_endpoint_with_explanation(client):
    res = client.post("/api/predict", json={
        "income": 85,
        "spending_score": 82,
        "age": 32,
        "gender": "Female"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert "surrogate_explanation" in data
    assert data["surrogate_explanation"]["agrees_with_kmeans"] is True

def test_clv_analysis_endpoint(client):
    res = client.get("/api/clv-analysis")
    assert res.status_code == 200

def test_anomalies_endpoint(client):
    res = client.get("/api/anomalies")
    assert res.status_code == 200

def test_campaign_simulator_endpoint(client):
    res = client.post("/api/campaign-simulator", json={
        "cluster_id": 0,
        "budget": 2000,
        "discount_pct": 10,
        "channel": "email"
    })
    assert res.status_code == 200
    assert "metrics" in res.get_json()

def test_batch_predict_endpoint(client):
    res = client.post("/api/batch-predict", json=[
        {"income": 75, "spending_score": 75}
    ])
    assert res.status_code == 200
