from fastapi.testclient import TestClient
from app.main import app
from app.tests.test_fixtures import build_two_router_static_lab

client = TestClient(app)


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["features"]["deterministic_vlsm"] is True


def test_api_device_catalog():
    response = client.get("/api/catalog/devices")
    assert response.status_code == 200
    catalog = response.json()
    assert "Cisco 1941" in catalog
    assert "Cisco 2960-24TT" in catalog
    assert "Standard PC" in catalog


def test_api_validate_topology():
    topo = build_two_router_static_lab()
    response = client.post("/api/topology/validate", json=topo.model_dump())
    assert response.status_code == 200
    report = response.json()
    assert report["is_valid"] is True
    assert len(report["errors"]) == 0


def test_api_vlsm_planning():
    payload = {
        "major_network": "172.16.0.0/16",
        "requirements": [
            {"name": "Subnet-A", "required_hosts": 500},
            {"name": "Subnet-B", "required_hosts": 100},
            {"name": "WAN-1", "required_hosts": 2},
        ]
    }
    response = client.post("/api/topology/ip-plan/vlsm", json=payload)
    assert response.status_code == 200
    subnets = response.json()
    assert len(subnets) == 3
    assert subnets[0]["name"] == "Subnet-A"
    assert subnets[0]["prefix_length"] == 23  # 500 hosts needs /23 (510 hosts)


def test_api_configure():
    topo = build_two_router_static_lab()
    response = client.post("/api/topology/configure", json=topo.model_dump())
    assert response.status_code == 200
    configs = response.json()
    assert "R1" in configs
    assert "hostname R1" in configs["R1"]
    assert "ip address 192.168.1.1 255.255.255.0" in configs["R1"]


def test_api_pkt_feasibility():
    response = client.get("/api/export/feasibility/pkt")
    assert response.status_code == 200
    data = response.json()
    assert data["pkt_supported"] is False
    assert "Cisco IOS CLI scripts" in str(data["supported_alternatives"])

