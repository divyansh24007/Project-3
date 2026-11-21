"""Tests for URL Analyzer: safe URLs, malicious URLs, homograph spoofing, and SSRF protection."""

try:
    import pytest
except ImportError:
    class _MockPytest:
        @staticmethod
        def fixture(func):
            return func
        class mark:
            @staticmethod
            def asyncio(func):
                return func
        @staticmethod
        def raises(expected_exception, match=None):
            class _RaisesContext:
                def __enter__(self):
                    return self
                def __exit__(self, exc_type, exc_val, exc_tb):
                    if exc_type is None:
                        raise AssertionError(f"Expected {expected_exception} but nothing was raised")
                    return issubclass(exc_type, expected_exception)
            return _RaisesContext()
    pytest = _MockPytest()
from app.services.url_analyzer import URLAnalyzer


@pytest.fixture
def analyzer() -> URLAnalyzer:
    return URLAnalyzer(timeout=3.0)


def test_ssrf_protection_private_ips(analyzer: URLAnalyzer):
    """Assert SSRF guard detects and blocks private, loopback, and metadata IP addresses."""
    # Loopback
    assert analyzer.is_private_or_restricted_ip("127.0.0.1") is True
    assert analyzer.is_private_or_restricted_ip("127.0.1.10") is True
    assert analyzer.is_private_or_restricted_ip("::1") is True

    # RFC 1918 Private Ranges
    assert analyzer.is_private_or_restricted_ip("10.0.0.1") is True
    assert analyzer.is_private_or_restricted_ip("172.16.0.1") is True
    assert analyzer.is_private_or_restricted_ip("172.31.255.255") is True
    assert analyzer.is_private_or_restricted_ip("192.168.1.1") is True

    # Cloud Metadata (AWS/GCP/Azure)
    assert analyzer.is_private_or_restricted_ip("169.254.169.254") is True

    # Public IP must not be restricted
    assert analyzer.is_private_or_restricted_ip("8.8.8.8") is False
    assert analyzer.is_private_or_restricted_ip("1.1.1.1") is False


def test_ssrf_host_resolution_rejection(analyzer: URLAnalyzer):
    """Assert resolving localhost or private IP raises ValueError."""
    with pytest.raises(ValueError, match="Restricted|private"):
        analyzer.validate_and_resolve_host("127.0.0.1")

    with pytest.raises(ValueError, match="Restricted|private"):
        analyzer.validate_and_resolve_host("169.254.169.254")


def test_homograph_detection(analyzer: URLAnalyzer):
    """Assert Cyrillic lookalikes mimicking PayPal or Google are caught."""
    # Cyrillic 'а' (\u0430) instead of ASCII 'a'
    spoofed_domain = "p\u0430ypal.com"
    res = analyzer.detect_homograph(spoofed_domain)

    assert res["has_homograph"] is True
    assert res["confusable_count"] >= 1
    assert res["targeted_brand"] == "paypal"
    assert res["normalized_domain"] == "paypal.com"


def test_homograph_safe_domain(analyzer: URLAnalyzer):
    """Assert legitimate pure ASCII domain has no homograph flags."""
    res = analyzer.detect_homograph("google.com")
    assert res["has_homograph"] is False
    assert res["confusable_count"] == 0


def test_url_structure_heuristics(analyzer: URLAnalyzer):
    """Assert lexical structure anomalies are correctly measured."""
    suspicious_url = "http://192.168.1.5:8080/admin/update/installer.exe"
    struct = analyzer.check_url_structure(suspicious_url)

    assert struct["is_ip_hostname"] is True
    assert struct["has_port_specified"] is True
    assert struct["port"] == 8080
    assert struct["suspicious_file_extension"] is True


def test_suspicious_patterns(analyzer: URLAnalyzer):
    """Assert brand targeting and phishing keyword combinations are identified."""
    url = "https://secure-login-verification-sbi.xyz/account/login"
    patterns = analyzer.check_suspicious_patterns(url)

    assert any("sbi" in p.lower() or "brand" in p.lower() for p in patterns)
    assert any("xyz" in p.lower() or "TLD" in p for p in patterns)
    assert any("login" in p.lower() or "verify" in p.lower() for p in patterns)


@pytest.mark.asyncio
async def test_analyze_url_safe(analyzer: URLAnalyzer):
    """Assert standard legitimate URL is rated safe."""
    # Test safe domain analysis
    result = await analyzer.analyze_url("https://example.com/search")
    assert result.is_safe is True
    assert result.risk_score < 40.0
    assert result.risk_level in ("safe", "low")


@pytest.mark.asyncio
async def test_analyze_url_ssrf_attempt(analyzer: URLAnalyzer):
    """Assert attack URL targeting internal loopback receives critical block."""
    result = await analyzer.analyze_url("http://127.0.0.1:8000/secret-keys")
    assert result.is_safe is False
    assert result.risk_score == 100.0
    assert result.risk_level == "critical"
    assert any(ind["type"] == "ssrf_violation" for ind in result.indicators)
