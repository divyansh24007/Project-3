"""Tests for Message Analyzer: banking scams, UPI fraud, KYC, job scams, and legitimate messages."""

try:
    import pytest
except ImportError:
    class _MockPytest:
        @staticmethod
        def fixture(func):
            return func
    pytest = _MockPytest()
from app.services.message_analyzer import MessageAnalyzer


@pytest.fixture
def analyzer() -> MessageAnalyzer:
    return MessageAnalyzer()


def test_banking_scam_detection(analyzer: MessageAnalyzer):
    """Assert detection of suspended bank accounts and unblock links."""
    msg = "Dear customer, your SBI account ending in 9812 has been suspended. Click link to verify card and unblock."
    res = analyzer.analyze_message(msg)

    assert res.is_scam is True
    assert res.risk_score >= 50.0
    assert "banking_scam" in res.threat_categories
    assert res.risk_level in ("high", "critical")


def test_upi_fraud_detection(analyzer: MessageAnalyzer):
    """Assert detection of UPI reverse payment PIN fraud."""
    msg = "Congratulations! You won Rs 5000 cashback on Google Pay. Enter your UPI PIN to receive money in your bank account."
    res = analyzer.analyze_message(msg)

    assert res.is_scam is True
    assert res.risk_score >= 60.0
    assert "upi_fraud" in res.threat_categories
    assert any("UPI PIN" in rec for rec in res.recommendations)


def test_kyc_scam_detection(analyzer: MessageAnalyzer):
    """Assert detection of urgent KYC / SIM deactivation threats."""
    msg = "Urgent: Your Airtel SIM KYC has expired. Update your PAN card immediately within 24 hours to avoid suspension."
    res = analyzer.analyze_message(msg)

    assert res.is_scam is True
    assert "kyc_scam" in res.threat_categories
    assert res.urgency_score > 3.0


def test_lottery_scam_detection(analyzer: MessageAnalyzer):
    """Assert Kaun Banega Crorepati and cash lottery detection."""
    msg = "Congratulations! You have won Rs 25,00,000 in KBC lottery. Contact WhatsApp manager to claim prize."
    res = analyzer.analyze_message(msg)

    assert res.is_scam is True
    assert "lottery_scam" in res.threat_categories


def test_job_scam_detection(analyzer: MessageAnalyzer):
    """Assert work-from-home YouTube like and Telegram scams are flagged."""
    msg = "Work from home part-time job: Earn Rs 5,000 daily by liking YouTube videos. Contact Telegram manager @EarnDaily"
    res = analyzer.analyze_message(msg)

    assert res.is_scam is True
    assert "job_scam" in res.threat_categories


def test_legitimate_message(analyzer: MessageAnalyzer):
    """Assert standard conversational communication is classified safe."""
    msg = "Hey Sarah, are we still meeting for lunch at 1 PM today? Let me know if the Italian place works."
    res = analyzer.analyze_message(msg)

    assert res.is_scam is False
    assert res.risk_score < 25.0
    assert res.risk_level == "safe"
    assert len(res.threat_categories) == 1 and res.threat_categories[0] == "legitimate"


def test_url_and_phone_extraction(analyzer: MessageAnalyzer):
    """Assert robust extraction of hyperlinks and telephone numbers."""
    msg = "Call our official helpline at +91 9876543210 or visit https://verify-bank.com/login for details."
    urls = analyzer.extract_urls(msg)
    phones = analyzer.extract_phone_numbers(msg)

    assert len(urls) >= 1
    assert "https://verify-bank.com/login" in urls
    assert len(phones) >= 1
    assert any("9876543210" in p for p in phones)


def test_urgency_pressure_scoring(analyzer: MessageAnalyzer):
    """Assert urgency score scales with artificial panic triggers."""
    urgent_msg = "IMMEDIATELY ACT! Your account will be terminated within 2 hours! Final warning!"
    calm_msg = "Here are the notes from yesterday's team catch-up when you have time."

    assert analyzer.detect_urgency(urgent_msg) > analyzer.detect_urgency(calm_msg)
