"""URL Analyzer Service: Safe request handling, SSRF defense, homograph checks, and heuristic scoring."""

import ipaddress
import re
import socket
import ssl
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional, Set
from urllib.parse import urlparse

try:
    import httpx
    _HTTPX_AVAILABLE = True
except ImportError:
    _HTTPX_AVAILABLE = False

from app.core.logging import logger


@dataclass
class URLAnalysisResult:
    """Structured result returned by URLAnalyzer."""
    url: str
    domain: str
    is_safe: bool
    risk_score: float  # 0 to 100
    risk_level: str  # safe, low, medium, high, critical
    threat_category: str
    summary: str
    homograph_detected: bool
    homograph_details: Dict[str, Any]
    structure_analysis: Dict[str, Any]
    suspicious_patterns: List[str]
    ssl_analysis: Dict[str, Any]
    status_code: Optional[int] = None
    final_destination: Optional[str] = None
    indicators: List[Dict[str, Any]] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class URLAnalyzer:
    """High-assurance URL security analyzer with strict SSRF defense."""

    SUSPICIOUS_TLDS: Set[str] = {
        "tk", "ml", "ga", "cf", "gq", "top", "xyz", "buzz", "club",
        "work", "icu", "cam", "monster", "rest", "vip", "fit", "surf",
        "cn", "ru", "su", "country", "kim", "party", "science", "cricket"
    }

    TARGET_BRANDS: List[str] = [
        "paypal", "apple", "google", "microsoft", "amazon", "netflix",
        "chase", "wellsfargo", "bankofamerica", "citi", "binance", "coinbase",
        "sbi", "hdfc", "icici", "axisbank", "paytm", "phonepe", "gpay",
        "metamask", "blockchain", "steam", "instagram", "facebook", "whatsapp"
    ]

    SUSPICIOUS_KEYWORDS: List[str] = [
        "login", "verify", "update", "account", "secure", "security",
        "signin", "authenticate", "wallet", "banking", "confirm", "kyc",
        "pan-card", "aadhaar", "otp", "recovery", "unblock", "suspended",
        "free-gift", "claim-reward", "lottery", "cashback", "refund"
    ]

    # Cyrillic and Greek lookalike character mapping to Latin
    CONFUSABLE_CHARS: Dict[str, str] = {
        "\u0430": "a", "\u0435": "e", "\u043e": "o", "\u0440": "p", "\u0441": "c",
        "\u0443": "y", "\u0445": "x", "\u0456": "i", "\u0458": "j", "\u0410": "A",
        "\u0412": "B", "\u0415": "E", "\u041a": "K", "\u041c": "M", "\u041d": "H",
        "\u041e": "O", "\u0420": "P", "\u0421": "C", "\u0422": "T", "\u0423": "Y",
        "\u0425": "X", "\u03bf": "o", "\u03c1": "p", "\u03bd": "v", "\u0391": "A",
        "\u0392": "B", "\u0395": "E", "\u0397": "H", "\u0399": "I", "\u039a": "K",
        "\u039c": "M", "\u039d": "N", "\u039f": "O", "\u03a1": "P", "\u03a4": "T"
    }

    def __init__(self, timeout: float = 2.0):
        self.timeout = timeout

    @staticmethod
    def is_private_or_restricted_ip(ip_str: str) -> bool:
        """
        SSRF Guard: Verify whether an IP address belongs to private,
        loopback, link-local, multicast, or cloud metadata ranges.
        """
        try:
            ip = ipaddress.ip_address(ip_str)
            return (
                ip.is_private or
                ip.is_loopback or
                ip.is_link_local or
                ip.is_multicast or
                ip.is_reserved or
                ip.is_unspecified or
                # Explicit check for AWS/GCP/Azure link-local metadata 169.254.169.254
                str(ip) == "169.254.169.254"
            )
        except ValueError:
            return True

    def validate_and_resolve_host(self, hostname: str) -> List[str]:
        """
        Resolve domain to IP addresses and assert none are internal/SSRF targets.
        Raises ValueError if hostname resolves to restricted IP.
        """
        # If hostname is an IP string
        try:
            ip = ipaddress.ip_address(hostname)
            if self.is_private_or_restricted_ip(str(ip)):
                raise ValueError(f"Restricted private or loopback IP destination blocked: {hostname}")
            return [str(ip)]
        except ValueError as e:
            if "Restricted" in str(e):
                raise
            # Not an IP literal, proceed to DNS resolution

        resolved_ips: List[str] = []
        try:
            # Resolve IPv4 and IPv6
            addr_info = socket.getaddrinfo(hostname, None)
            for item in addr_info:
                ip_cand = item[4][0]
                if self.is_private_or_restricted_ip(ip_cand):
                    raise ValueError(f"Host {hostname} resolved to restricted/private IP: {ip_cand}")
                resolved_ips.append(ip_cand)
        except socket.gaierror:
            # Domain cannot be resolved (may be inactive or newly registered malicious domain)
            logger.debug("dns_resolution_failed", hostname=hostname)
        return list(set(resolved_ips))

    def detect_homograph(self, domain: str) -> Dict[str, Any]:
        """Detect IDN homograph and lookalike character spoofing."""
        is_punycode = domain.startswith("xn--") or ".xn--" in domain
        detected_chars: List[Dict[str, str]] = []
        normalized_str = []

        for char in domain:
            if char in self.CONFUSABLE_CHARS:
                detected_chars.append({
                    "char": char,
                    "confused_with": self.CONFUSABLE_CHARS[char],
                    "unicode": f"U+{ord(char):04X}",
                })
                normalized_str.append(self.CONFUSABLE_CHARS[char])
            else:
                normalized_str.append(char)

        normalized_domain = "".join(normalized_str)
        is_homograph = is_punycode or len(detected_chars) > 0

        # Check if normalized domain targets a known brand
        targeted_brand = None
        for brand in self.TARGET_BRANDS:
            if brand in normalized_domain and brand not in domain:
                targeted_brand = brand
                break

        return {
            "has_homograph": is_homograph,
            "is_punycode": is_punycode,
            "confusable_count": len(detected_chars),
            "detected_characters": detected_chars,
            "normalized_domain": normalized_domain,
            "targeted_brand": targeted_brand,
        }

    def check_url_structure(self, url: str) -> Dict[str, Any]:
        """Analyze lexical and structural anomalies in the URL."""
        parsed = urlparse(url)
        hostname = parsed.hostname or ""
        path = parsed.path or ""
        query = parsed.query or ""

        # IP as hostname
        is_ip_host = False
        try:
            ipaddress.ip_address(hostname)
            is_ip_host = True
        except ValueError:
            pass

        # Subdomain count
        domain_parts = [p for p in hostname.split(".") if p]
        subdomain_count = max(0, len(domain_parts) - 2)

        # High entropy or long random segments
        has_at_symbol = "@" in url
        path_depth = len([p for p in path.split("/") if p])
        has_hex_encoding = bool(re.search(r"%[0-9a-fA-F]{2}", url))
        has_port_specified = parsed.port is not None and parsed.port not in (80, 443)

        # Suspicious extensions
        suspicious_ext = bool(re.search(r"\.(exe|apk|sh|scr|vbs|bat|msi|zip|iso|dmg)$", path, re.IGNORECASE))

        return {
            "is_ip_hostname": is_ip_host,
            "subdomain_count": subdomain_count,
            "has_at_symbol": has_at_symbol,
            "path_depth": path_depth,
            "has_hex_encoding": has_hex_encoding,
            "has_port_specified": has_port_specified,
            "port": parsed.port,
            "suspicious_file_extension": suspicious_ext,
            "url_length": len(url),
            "hostname_length": len(hostname),
        }

    def check_suspicious_patterns(self, url: str) -> List[str]:
        """Match domain and path against phishing keywords and brand targeting."""
        patterns: List[str] = []
        parsed = urlparse(url)
        netloc = (parsed.netloc or "").lower()
        path = (parsed.path or "").lower()
        full_lower = url.lower()

        # Check suspicious TLD
        tld = netloc.split(".")[-1] if "." in netloc else ""
        if tld in self.SUSPICIOUS_TLDS:
            patterns.append(f"Suspicious high-abuse TLD (.{tld})")

        # Brand spoofing in domain or path
        for brand in self.TARGET_BRANDS:
            if brand in netloc:
                # Check if it's the genuine domain
                legit_suffixes = (f"{brand}.com", f"{brand}.org", f"{brand}.net", f"{brand}.co.in", f"{brand}.in")
                if not any(netloc == l or netloc.endswith("." + l) for l in legit_suffixes):
                    patterns.append(f"Impersonation of brand '{brand}' in host '{netloc}'")

        # Security/credential keywords
        for kw in self.SUSPICIOUS_KEYWORDS:
            if f"-{kw}" in netloc or f"{kw}-" in netloc or f".{kw}." in netloc or f"/{kw}" in path:
                patterns.append(f"Suspicious credential/action keyword detected: '{kw}'")

        # Free tier dynamic DNS/tunnels
        dynamic_dns = ["duckdns.org", "ngrok.io", "localtunnel.me", "serveo.net", "pagekite.me", "glitch.me"]
        for ddns in dynamic_dns:
            if ddns in netloc:
                patterns.append(f"Hosted on dynamic tunnel / ephemeral service: {ddns}")

        return patterns

    def check_domain_reputation(self, domain: str) -> Dict[str, Any]:
        """Assess domain reputation based on structure, TLD, and known patterns."""
        score = 0.0
        reasons = []

        parts = domain.lower().split(".")
        tld = parts[-1] if parts else ""

        if tld in self.SUSPICIOUS_TLDS:
            score += 35.0
            reasons.append(f"TLD .{tld} associated with high abuse rates")

        if len(parts) > 3:
            score += 20.0
            reasons.append("Excessive subdomain delegation")

        # Hyphen stuffing (e.g. secure-login-bank-verification.com)
        hyphen_count = domain.count("-")
        if hyphen_count >= 3:
            score += 25.0
            reasons.append(f"Hyphen stuffing detected ({hyphen_count} hyphens)")

        # Digits in domain
        digits = sum(c.isdigit() for c in domain)
        if digits > 4:
            score += 15.0
            reasons.append("High ratio of numeric characters in domain")

        return {
            "reputation_score": min(score, 100.0),
            "reasons": reasons,
        }

    def check_ssl_certificate(self, domain: str, port: int = 443) -> Dict[str, Any]:
        """Inspect SSL/TLS certificate metadata safely."""
        ctx = ssl.create_default_context()
        ctx.check_hostname = True
        ctx.verify_mode = ssl.CERT_REQUIRED

        try:
            with socket.create_connection((domain, port), timeout=3.0) as sock:
                with ctx.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    subject = dict(x[0] for x in cert.get("subject", []))
                    issuer = dict(x[0] for x in cert.get("issuer", []))
                    return {
                        "valid": True,
                        "subject": subject.get("commonName", ""),
                        "issuer": issuer.get("organizationName", issuer.get("commonName", "")),
                        "expires": cert.get("notAfter", ""),
                    }
        except Exception as e:
            return {
                "valid": False,
                "error": str(e),
                "issuer": "Unknown",
            }

    async def analyze_url(self, url: str) -> URLAnalysisResult:
        """Perform comprehensive URL security analysis."""
        parsed = urlparse(url)
        domain = parsed.hostname or ""
        indicators: List[Dict[str, Any]] = []
        recommendations: List[str] = []
        risk_score = 0.0

        # Step 1: SSRF Verification
        ssrf_blocked = False
        try:
            self.validate_and_resolve_host(domain)
        except ValueError as ssrf_err:
            ssrf_blocked = True
            risk_score = 100.0
            indicators.append({
                "type": "ssrf_violation",
                "value": str(ssrf_err),
                "severity": "critical",
                "confidence": 1.0,
                "description": "Destination targets restricted loopback or internal infrastructure.",
                "source": "ssrf_guard",
            })
            recommendations.append("Immediate block: Target points to private internal network.")

        # Step 2: Homograph detection
        homograph_info = self.detect_homograph(domain)
        if homograph_info["has_homograph"]:
            risk_score += 45.0
            indicators.append({
                "type": "homograph_spoofing",
                "value": domain,
                "severity": "high",
                "confidence": 0.95,
                "description": f"Domain utilizes confusable internationalized characters resembling '{homograph_info['normalized_domain']}'",
                "source": "homograph_detector",
            })
            recommendations.append("Do not enter credentials: Domain uses character spoofing to mimic another organization.")

        # Step 3: URL Structure Analysis
        struct_info = self.check_url_structure(url)
        if struct_info["is_ip_hostname"]:
            risk_score += 35.0
            indicators.append({
                "type": "ip_as_hostname",
                "value": domain,
                "severity": "medium",
                "confidence": 1.0,
                "description": "Direct IP address used instead of reputable domain name.",
                "source": "lexical_analyzer",
            })
        if struct_info["has_at_symbol"]:
            risk_score += 40.0
            indicators.append({
                "type": "url_obfuscation_at",
                "value": url,
                "severity": "high",
                "confidence": 0.9,
                "description": "URL includes '@' credential obfuscation character.",
                "source": "lexical_analyzer",
            })
        if struct_info["suspicious_file_extension"]:
            risk_score += 30.0
            indicators.append({
                "type": "malicious_download",
                "value": parsed.path,
                "severity": "high",
                "confidence": 0.85,
                "description": "Direct download of potentially executable or archived script file.",
                "source": "lexical_analyzer",
            })

        # Step 4: Pattern Matching & Brand Impersonation
        patterns = self.check_suspicious_patterns(url)
        for pattern in patterns:
            risk_score += 20.0
            indicators.append({
                "type": "suspicious_pattern",
                "value": pattern,
                "severity": "high" if "Impersonation" in pattern else "medium",
                "confidence": 0.8,
                "description": pattern,
                "source": "pattern_matcher",
            })

        # Step 5: Domain Reputation
        reputation = self.check_domain_reputation(domain)
        risk_score += reputation["reputation_score"] * 0.4

        # Step 6: Safe HTTP Probe (Only if SSRF check passed)
        status_code = None
        final_dest = url
        ssl_info = {"valid": False, "note": "Unchecked"}

        if not ssrf_blocked and domain:
            try:
                # SSL Check
                if parsed.scheme == "https":
                    ssl_info = self.check_ssl_certificate(domain)

                # HTTP HEAD / GET probe with strict timeouts and redirect limitation
                if _HTTPX_AVAILABLE:
                    async with httpx.AsyncClient(
                        verify=False,
                        timeout=self.timeout,
                        follow_redirects=True,
                        max_redirects=3,
                        headers={"User-Agent": "AEGISOS-ThreatIntel-Probe/1.0"}
                    ) as client:
                        resp = await client.head(url)
                        status_code = resp.status_code
                        final_dest = str(resp.url)
                        # Check if redirected to private IP
                        final_host = urlparse(final_dest).hostname or ""
                        self.validate_and_resolve_host(final_host)
                else:
                    import urllib.request
                    req = urllib.request.Request(url, headers={"User-Agent": "AEGISOS-ThreatIntel-Probe/1.0"})
                    with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                        status_code = resp.status
                        final_dest = resp.geturl()
            except Exception as net_err:
                logger.debug("safe_probe_failed", error=str(net_err), target=url)

        # Cap risk score
        risk_score = min(max(round(risk_score, 1), 0.0), 100.0)

        # Determine level and category
        if risk_score >= 80.0 or ssrf_blocked:
            risk_level = "critical"
            threat_cat = "phishing" if homograph_info["has_homograph"] or patterns else "malware"
            summary = f"CRITICAL THREAT: Identified high-confidence security risk in URL ({domain})."
            recommendations.append("Block domain across organization firewalls and endpoint DNS filters.")
        elif risk_score >= 60.0:
            risk_level = "high"
            threat_cat = "phishing"
            summary = f"High Risk: Suspicious lexical markers and brand imitation patterns found on {domain}."
            recommendations.append("Warn users and isolate browsing session in sandboxed container.")
        elif risk_score >= 30.0:
            risk_level = "medium"
            threat_cat = "suspicious"
            summary = f"Medium Risk: Multiple abnormal structural indicators present on {domain}."
            recommendations.append("Proceed with caution. Verify sender authenticity before interacting.")
        elif risk_score >= 10.0:
            risk_level = "low"
            threat_cat = "legitimate"
            summary = f"Low Risk: Minor structural anomalies observed, but no active threat signatures detected."
        else:
            risk_level = "safe"
            threat_cat = "legitimate"
            summary = f"Safe: URL ({domain}) appears legitimate and adheres to standard security practices."

        return URLAnalysisResult(
            url=url,
            domain=domain,
            is_safe=(risk_score < 40.0),
            risk_score=risk_score,
            risk_level=risk_level,
            threat_category=threat_cat,
            summary=summary,
            homograph_detected=homograph_info["has_homograph"],
            homograph_details=homograph_info,
            structure_analysis=struct_info,
            suspicious_patterns=patterns,
            ssl_analysis=ssl_info,
            status_code=status_code,
            final_destination=final_dest,
            indicators=indicators,
            recommendations=recommendations,
        )
