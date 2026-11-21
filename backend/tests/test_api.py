"""Tests for API Endpoints using FastAPI TestClient: Health, Scans, Demo, Analytics, and Intel."""

try:
    import pytest
except ImportError:
    class _MockPytest:
        @staticmethod
        def fixture(func):
            return func
    pytest = _MockPytest()
from starlette.testclient import TestClient

from app.core.config import settings
from app.main import app

# Enable debug mode for tests so mock auth passes seamlessly
settings.DEBUG = True

client = TestClient(app)


def test_health_check_endpoints():
    """Verify both /health and /api/v1/health respond with 200 OK."""
    resp1 = client.get("/health")
    assert resp1.status_code == 200
    assert resp1.json()["status"] == "healthy"

    resp2 = client.get("/api/v1/health")
    assert resp2.status_code == 200
    assert resp2.json()["status"] == "healthy"


def test_scan_url_endpoint():
    """Verify POST /api/v1/scan/url handles scan requests."""
    payload = {
        "url": "https://secure-login-bank-verification.xyz/verify",
        "depth": "standard",
    }
    resp = client.post("/api/v1/scan/url", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert "scan_id" in data
    assert data["target_type"] == "url"
    assert "risk_score" in data
    assert "risk_level" in data
    assert isinstance(data["indicators"], list)
    assert isinstance(data["recommendations"], list)


def test_scan_message_endpoint():
    """Verify POST /api/v1/scan/message flags scam messages."""
    payload = {
        "message": "Enter your UPI PIN to receive Rs 5000 cashback from Google Pay immediately.",
        "channel": "sms",
    }
    resp = client.post("/api/v1/scan/message", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert "scan_id" in data
    assert data["target_type"] == "message"
    assert data["risk_score"] > 50.0
    assert data["risk_level"] in ("high", "critical")


def test_scan_qr_endpoint():
    """Verify POST /api/v1/scan/qr analyzes QR content."""
    payload = {
        "qr_content": "upi://pay?pa=scammer@okaxis&pn=Cashback&am=5000",
    }
    resp = client.post("/api/v1/scan/qr", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert "scan_id" in data
    assert data["target_type"] == "qr"


def test_demo_scenarios_endpoints():
    """Verify GET /api/v1/demo/scenarios and POST /api/v1/demo/run/{id}."""
    list_resp = client.get("/api/v1/demo/scenarios")
    assert list_resp.status_code == 200
    scenarios = list_resp.json()
    assert len(scenarios) == 5

    # Run scenario-1 (KYC phishing)
    run_resp = client.post("/api/v1/demo/run/scenario-1")
    assert run_resp.status_code == 200
    run_data = run_resp.json()
    assert run_data["scenario_id"] == "scenario-1"
    assert run_data["scan_result"]["risk_level"] in ("high", "critical")


def test_intelligence_endpoints():
    """Verify Domain, IP, and URL intelligence endpoints."""
    # Domain Intel
    dom_resp = client.post("/api/v1/intelligence/domain", json={"domain": "secure-bank-login-verify.xyz"})
    assert dom_resp.status_code == 200
    assert dom_resp.json()["target_type"] == "domain"

    # IP Intel
    ip_resp = client.post("/api/v1/intelligence/ip", json={"ip": "127.0.0.1"})
    assert ip_resp.status_code == 200
    assert ip_resp.json()["is_malicious"] is True  # flagged as SSRF / private

    # URL Intel
    url_resp = client.post("/api/v1/intelligence/url", json={"url": "https://paypal-verify.xyz/login.exe"})
    assert url_resp.status_code == 200
    assert url_resp.json()["target_type"] == "url"


def test_analytics_endpoints():
    """Verify analytics overview and threat breakdown endpoints."""
    headers = {"Authorization": "Bearer test-token"}

    resp1 = client.get("/api/v1/analytics/overview", headers=headers)
    assert resp1.status_code == 200
    assert "total_scans" in resp1.json()

    resp2 = client.get("/api/v1/analytics/threats", headers=headers)
    assert resp2.status_code == 200
    assert "risk_levels" in resp2.json()


def test_devices_and_settings_endpoints():
    """Verify device registration and user settings."""
    headers = {"Authorization": "Bearer test-token"}

    # Register device
    dev_payload = {
        "device_name": "Test Pixel Device",
        "device_type": "android",
        "os_version": "Android 14",
        "app_version": "1.0.0",
        "security_posture": {"rooted": False},
    }
    dev_resp = client.post("/api/v1/devices/register", json=dev_payload, headers=headers)
    assert dev_resp.status_code == 201
    device_id = dev_resp.json()["id"]

    # Check security status
    sec_resp = client.get(f"/api/v1/devices/{device_id}/security", headers=headers)
    assert sec_resp.status_code == 200
    assert "health_score" in sec_resp.json()

    # Get settings
    settings_resp = client.get("/api/v1/settings", headers=headers)
    assert settings_resp.status_code == 200
    assert "theme" in settings_resp.json()
