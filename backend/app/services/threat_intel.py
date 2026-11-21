"""Threat Intelligence Service: Domain, IP, URL enrichment, DNS inspection, RDAP queries, and heuristic feeds."""

import ipaddress
import re
import socket
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
class ThreatIntelResult:
    """Structured threat intelligence response."""
    target: str
    target_type: str  # domain, ip, url
    is_malicious: bool
    risk_score: float  # 0 to 100
    categories: List[str]
    reputation: str  # clean, suspicious, malicious, unknown
    dns_records: Optional[Dict[str, Any]] = None
    rdap_info: Optional[Dict[str, Any]] = None
    matched_rules: List[str] = field(default_factory=list)
    details: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ThreatIntelligenceService:
    """Global threat intelligence intelligence service with offline heuristic database."""

    # Built-in blacklist of known malicious domains and hashes
    KNOWN_MALICIOUS_DOMAINS: Set[str] = {
        "secure-bank-login-verify.xyz",
        "update-kyc-pan-online.top",
        "free-giftcard-claim-now.site",
        "sbi-reward-points-redeem.club",
        "paytm-cashback-collect.xyz",
        "netflix-subscription-renew.biz",
        "telegram-crypto-task.icu",
        "appleid-verify-locked.com",
        "metamask-wallet-recover.io",
        "paypal-resolution-center-auth.net",
        "login-microsoftonline-account.link",
    }

    # Curated suspicious TLDs
    SUSPICIOUS_TLDS: Set[str] = {
        "top", "xyz", "buzz", "club", "work", "icu", "cam",
        "monster", "rest", "tk", "ml", "ga", "cf", "gq", "vip", "fit"
    }

    # Suspicious IP subnets/ranges (Tor exit nodes, bulletproof hosting, botnets)
    KNOWN_SUSPICIOUS_SUBNETS = [
        ipaddress.ip_network("185.220.101.0/24"),  # Tor exit nodes
        ipaddress.ip_network("194.26.29.0/24"),    # Known bulletproof
        ipaddress.ip_network("45.154.255.0/24"),
    ]

    def __init__(self, timeout: float = 5.0):
        self.timeout = timeout

    def check_domain(self, domain: str) -> ThreatIntelResult:
        """Query reputation and DNS telemetry for a target domain."""
        domain_clean = domain.strip().lower()
        matched_rules: List[str] = []
        categories: List[str] = []
        risk_score = 0.0

        # Exact match check
        if domain_clean in self.KNOWN_MALICIOUS_DOMAINS:
            risk_score = 95.0
            matched_rules.append(f"Domain '{domain_clean}' flagged in global threat feed")
            categories.append("known_phishing_host")

        # TLD check
        tld = domain_clean.split(".")[-1] if "." in domain_clean else ""
        if tld in self.SUSPICIOUS_TLDS:
            risk_score += 35.0
            matched_rules.append(f"High-abuse top level domain (.{tld})")
            categories.append("suspicious_tld")

        # Heuristic checks on domain labels
        if any(kw in domain_clean for kw in ("login", "verify", "secure", "update", "kyc", "banking", "wallet")):
            risk_score += 30.0
            matched_rules.append("Credential or financial phishing keywords embedded in domain")
            categories.append("brand_impersonation")

        # DNS enrichment
        dns_info = self.get_dns_info(domain_clean)
        if not dns_info.get("a_records"):
            risk_score += 10.0
            matched_rules.append("Domain has no active A records (NXDOMAIN or dead host)")

        # Cap score
        risk_score = min(max(round(risk_score, 1), 0.0), 100.0)
        reputation = "malicious" if risk_score >= 70.0 else "suspicious" if risk_score >= 35.0 else "clean"

        return ThreatIntelResult(
            target=domain_clean,
            target_type="domain",
            is_malicious=(risk_score >= 50.0),
            risk_score=risk_score,
            categories=categories or ["unclassified"],
            reputation=reputation,
            dns_records=dns_info,
            matched_rules=matched_rules,
            details={"tld": tld, "dns": dns_info},
        )

    def check_ip(self, ip_str: str) -> ThreatIntelResult:
        """Query reputation for an IPv4 or IPv6 address."""
        ip_clean = ip_str.strip()
        matched_rules: List[str] = []
        categories: List[str] = []
        risk_score = 0.0

        try:
            ip_obj = ipaddress.ip_address(ip_clean)
        except ValueError:
            return ThreatIntelResult(
                target=ip_clean,
                target_type="ip",
                is_malicious=False,
                risk_score=0.0,
                categories=["invalid_ip"],
                reputation="unknown",
                matched_rules=["Invalid IP address format provided"],
            )

        # Private / loopback / SSRF check
        if ip_obj.is_private or ip_obj.is_loopback:
            return ThreatIntelResult(
                target=ip_clean,
                target_type="ip",
                is_malicious=True,
                risk_score=90.0,
                categories=["private_network", "ssrf_target"],
                reputation="malicious",
                matched_rules=["IP address resides in private or internal network range (SSRF hazard)"],
            )

        # Check known malicious subnets
        for subnet in self.KNOWN_SUSPICIOUS_SUBNETS:
            if ip_obj in subnet:
                risk_score = 85.0
                matched_rules.append(f"IP belongs to known bulletproof or anonymization subnet ({subnet})")
                categories.append("tor_exit_or_bulletproof")
                break

        # Reverse DNS lookup
        reverse_dns = None
        try:
            reverse_dns, _, _ = socket.gethostbyaddr(ip_clean)
        except Exception:
            pass

        reputation = "malicious" if risk_score >= 70.0 else "suspicious" if risk_score >= 35.0 else "clean"

        return ThreatIntelResult(
            target=ip_clean,
            target_type="ip",
            is_malicious=(risk_score >= 50.0),
            risk_score=risk_score,
            categories=categories or ["benign_host"],
            reputation=reputation,
            matched_rules=matched_rules,
            details={"reverse_dns": reverse_dns, "is_global": ip_obj.is_global},
        )

    def check_url(self, url: str) -> ThreatIntelResult:
        """Evaluate full URL against threat intelligence signatures."""
        parsed = urlparse(url)
        domain = parsed.hostname or ""
        domain_intel = self.check_domain(domain)

        matched_rules = list(domain_intel.matched_rules)
        categories = list(domain_intel.categories)
        risk_score = domain_intel.risk_score

        # Check path and query
        if any(ext in parsed.path.lower() for ext in (".exe", ".apk", ".sh", ".vbs")):
            risk_score += 35.0
            matched_rules.append("URL targets executable or mobile package download")
            categories.append("malicious_download")

        risk_score = min(max(round(risk_score, 1), 0.0), 100.0)
        reputation = "malicious" if risk_score >= 70.0 else "suspicious" if risk_score >= 35.0 else "clean"

        return ThreatIntelResult(
            target=url,
            target_type="url",
            is_malicious=(risk_score >= 50.0),
            risk_score=risk_score,
            categories=categories,
            reputation=reputation,
            dns_records=domain_intel.dns_records,
            matched_rules=matched_rules,
            details={"domain": domain, "path": parsed.path},
        )

    def get_dns_info(self, domain: str) -> Dict[str, Any]:
        """Perform standard DNS resolution for A records."""
        a_records = []
        try:
            addr_info = socket.getaddrinfo(domain, 80)
            for item in addr_info:
                ip = item[4][0]
                a_records.append(ip)
        except Exception as e:
            logger.debug("dns_lookup_error", domain=domain, error=str(e))

        return {
            "domain": domain,
            "a_records": list(set(a_records)),
            "resolved": len(a_records) > 0,
        }

    async def get_rdap_info(self, entity: str, entity_type: str = "domain") -> Dict[str, Any]:
        """Query RDAP registry for domain or IP registration records."""
        endpoint = f"https://rdap.org/{entity_type}/{entity}"
        try:
            if _HTTPX_AVAILABLE:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.get(endpoint)
                    if resp.status_code == 200:
                        data = resp.json()
                        return {
                            "handle": data.get("handle"),
                            "status": data.get("status", []),
                            "events": data.get("events", []),
                            "notices": len(data.get("notices", [])),
                        }
            else:
                import json
                import urllib.request
                with urllib.request.urlopen(endpoint, timeout=self.timeout) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode())
                        return {
                            "handle": data.get("handle"),
                            "status": data.get("status", []),
                            "events": data.get("events", []),
                            "notices": len(data.get("notices", [])),
                        }
        except Exception as e:
            logger.debug("rdap_query_failed", error=str(e))

        return {"status": "unavailable", "entity": entity}
