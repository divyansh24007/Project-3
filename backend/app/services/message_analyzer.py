"""Message Analyzer Service: Heuristic detection of Banking, UPI, KYC, Job, and Lottery scams."""

import re
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional, Set
from app.core.logging import logger


@dataclass
class MessageAnalysisResult:
    """Structured result returned by MessageAnalyzer."""
    message: str
    sender: Optional[str]
    channel: str
    is_scam: bool
    risk_score: float  # 0 to 100
    risk_level: str  # safe, low, medium, high, critical
    threat_categories: List[str]
    primary_threat: str
    summary: str
    detected_patterns: Dict[str, List[str]]
    urgency_score: float  # 0 to 10
    extracted_urls: List[str]
    extracted_phone_numbers: List[str]
    extracted_upi_ids: List[str]
    recommendations: List[str] = field(default_factory=list)
    indicators: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class MessageAnalyzer:
    """Intelligent rule-based and regex engine for social engineering analysis."""

    # Categorized scam signatures and high-risk phrases
    BANKING_SCAM_PATTERNS = [
        r"\b(?:account|card|debit card|credit card)\s+(?:blocked|suspended|deactivated|frozen|locked)\b",
        r"\bunauthorized\s+(?:transaction|debit|payment|withdrawal)\s+of\b",
        r"\bverify\s+(?:your\s+)?(?:bank|account|card|details)\s+to\s+(?:unblock|continue|restore)\b",
        r"\bclick\s+(?:here|link)\s+to\s+(?:unblock|activate|verify)\b",
        r"\b(?:sbi|hdfc|icici|axis|pnb|kotak|bob)\s+(?:alert|notice|customer)\b",
        r"\bdeducted\s+rs\.?\s*\d+.*contact\s+helpline\b",
    ]

    UPI_FRAUD_PATTERNS = [
        r"\benter\s+(?:your\s+)?upi\s*pin\s+to\s+(?:receive|credit|accept|claim)\b",
        r"\bpin\s+daalo\s+paise\s+(?:aayenge|milenge)\b",
        r"\breceive\s+rs\.?\s*\d+\s+cashback\s+via\s+(?:phonepe|gpay|paytm|upi)\b",
        r"\bapprove\s+(?:collect\s+)?request\s+to\s+receive\b",
        r"\brefund\s+initiated.*enter\s+pin\b",
        r"\b(?:gpay|google\s*pay|phonepe|paytm)\s+scratch\s*card\s+worth\b",
    ]

    KYC_SCAM_PATTERNS = [
        r"\bkyc\s+(?:has\s+)?(?:expired|suspended|pending|mandatory)\b",
        r"\bupdate\s+(?:your\s+)?(?:kyc|pan|aadhaar)\s+immediately\b",
        r"\bsim\s+(?:will\s+be\s+)?(?:blocked|deactivated|disconnected)\s+within\s+\d+\s*(?:hrs|hours)\b",
        r"\bclick\s+link\s+to\s+update\s+pan\b",
        r"\bavoid\s+(?:account|sim)\s+suspension.*kyc\b",
    ]

    LOTTERY_PRIZE_PATTERNS = [
        r"\bcongratulations!?\s+you(?:\s+have)?\s+(?:won|selected)\b",
        r"\bwon\s+(?:a\s+)?(?:lottery|prize|car|iphone|reward|lucky\s+draw)\b",
        r"\bkaun\s+banega\s+crorepati|kbc\s+lottery\b",
        r"\bclaim\s+(?:your\s+)?prize\s+money\b",
        r"\btransfer\s+fee\s+required\s+to\s+release\b",
        r"\bwon\s+rs\.?\s*[\d,]+.*whatsapp\s+number\b",
    ]

    JOB_SCAM_PATTERNS = [
        r"\bwork\s+from\s+home\s+(?:earn|salary)\s+(?:daily|per\s+day)\b",
        r"\bearn\s+rs\.?\s*\d+\s*-\s*\d+\s*(?:daily|per\s+day|monthly)\b",
        r"\byoutube\s+video\s+like\s+and\s+subscribe\s+job\b",
        r"\bpart\s*time\s+job\s+for\s+students\b",
        r"\bcontact\s+telegram\s+manager\b",
        r"\btask\s+based\s+earning\s+crypto\b",
    ]

    PHISHING_PATTERNS = [
        r"\bsecurity\s+alert:?\s+someone\s+tried\s+to\s+log\s+in\b",
        r"\bpassword\s+expires\s+today\b",
        r"\bclick\s+here\s+to\s+keep\s+your\s+password\b",
        r"\breset\s+password\s+using\s+this\s+link\b",
        r"\byour\s+mailbox\s+is\s+full\s+and\s+will\s+be\s+closed\b",
    ]

    URGENCY_PATTERNS = [
        r"\bimmediately\b",
        r"\bwithin\s+\d+\s*(?:hours|hrs|minutes|mins)\b",
        r"\btoday\s+only\b",
        r"\blast\s+warning\b",
        r"\burgent\s+action\s+required\b",
        r"\bavoid\s+legal\s+action\b",
        r"\baccount\s+will\s+be\s+terminated\b",
        r"\bfinal\s+notice\b",
    ]

    def __init__(self) -> None:
        self.url_regex = re.compile(
            r"(?:https?://|www\.)[^\s<>{}\[\]\(\)\"\'`]+|[a-zA-Z0-9-]+\.(?:xyz|top|site|online|tk|ml|ga|cf|gq|club|buzz|cam|link)/[^\s]*",
            re.IGNORECASE,
        )
        self.phone_regex = re.compile(
            r"(?:\+?91[\s-]?)?[6-9]\d{9}|\b(?:\+?1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b"
        )
        self.upi_regex = re.compile(
            r"\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b"
        )

    def extract_urls(self, text: str) -> List[str]:
        """Extract all potential HTTP/HTTPS/obscure URLs from text."""
        matches = self.url_regex.findall(text)
        cleaned = []
        for m in matches:
            u = m.strip(".,;:?!'\"")
            if u:
                if not u.startswith(("http://", "https://")):
                    u = "https://" + u
                cleaned.append(u)
        return list(dict.fromkeys(cleaned))

    def extract_phone_numbers(self, text: str) -> List[str]:
        """Extract Indian and International contact telephone numbers."""
        matches = self.phone_regex.findall(text)
        cleaned = [re.sub(r"[\s\-\(\)]", "", m) for m in matches if len(re.sub(r"\D", "", m)) >= 10]
        return list(dict.fromkeys(cleaned))

    def extract_upi_ids(self, text: str) -> List[str]:
        """Extract UPI Virtual Payment Addresses (VPAs)."""
        matches = self.upi_regex.findall(text)
        excluded_handles = {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"}
        return [m for m in matches if m.split("@")[-1].lower() not in excluded_handles]

    def detect_urgency(self, text: str) -> float:
        """Score psychological urgency and artificial pressure on a scale of 0 to 10."""
        text_lower = text.lower()
        score = 0.0
        for pattern in self.URGENCY_PATTERNS:
            if re.search(pattern, text_lower):
                score += 2.5
        # Exclamation mark repetition and caps lock ratio
        exclamations = text.count("!")
        if exclamations >= 2:
            score += 1.5
        caps = sum(1 for c in text if c.isupper())
        if len(text) > 20 and (caps / len(text)) > 0.35:
            score += 2.0
        return min(round(score, 1), 10.0)

    def detect_scam_patterns(self, text: str) -> Dict[str, Any]:
        """Run regex battery across threat categories."""
        text_lower = text.lower()
        matches_by_cat: Dict[str, List[str]] = {}

        category_rules = {
            "banking_scam": self.BANKING_SCAM_PATTERNS,
            "upi_fraud": self.UPI_FRAUD_PATTERNS,
            "kyc_scam": self.KYC_SCAM_PATTERNS,
            "lottery_scam": self.LOTTERY_PRIZE_PATTERNS,
            "job_scam": self.JOB_SCAM_PATTERNS,
            "phishing": self.PHISHING_PATTERNS,
        }

        for cat, patterns in category_rules.items():
            matched_items = []
            for pattern in patterns:
                m = re.search(pattern, text_lower)
                if m:
                    matched_items.append(m.group(0))
            if matched_items:
                matches_by_cat[cat] = matched_items

        return matches_by_cat

    def calculate_risk_score(self, findings: Dict[str, Any]) -> float:
        """Compute composite risk score (0 - 100)."""
        score = 0.0
        matches = findings.get("patterns", {})
        urgency = findings.get("urgency_score", 0.0)
        urls = findings.get("urls", [])
        phones = findings.get("phones", [])
        upis = findings.get("upis", [])

        # UPI or Banking fraud is high penalty
        if "upi_fraud" in matches:
            score += 65.0 + (len(matches["upi_fraud"]) * 10.0)
        if "banking_scam" in matches:
            score += 60.0 + (len(matches["banking_scam"]) * 10.0)
        if "kyc_scam" in matches:
            score += 55.0 + (len(matches["kyc_scam"]) * 10.0)
        if "job_scam" in matches:
            score += 50.0 + (len(matches["job_scam"]) * 8.0)
        if "lottery_scam" in matches:
            score += 55.0 + (len(matches["lottery_scam"]) * 8.0)
        if "phishing" in matches:
            score += 45.0 + (len(matches["phishing"]) * 8.0)

        # Multipliers
        score += urgency * 2.5
        if urls:
            score += 15.0
            # Check suspicious shorteners or TLDs in extracted URLs
            for u in urls:
                if any(x in u for x in ["bit.ly", "tinyurl.com", "cutt.ly", ".xyz", ".top", "t.me"]):
                    score += 15.0

        if upis and ("upi_fraud" in matches or "lottery_scam" in matches):
            score += 20.0

        return min(max(round(score, 1), 0.0), 100.0)

    def analyze_message(
        self,
        message: str,
        sender: Optional[str] = None,
        channel: str = "sms",
    ) -> MessageAnalysisResult:
        """Analyze message payload for fraud patterns and deceptive vectors."""
        extracted_urls = self.extract_urls(message)
        extracted_phones = self.extract_phone_numbers(message)
        extracted_upis = self.extract_upi_ids(message)
        urgency_score = self.detect_urgency(message)
        patterns_found = self.detect_scam_patterns(message)

        findings = {
            "patterns": patterns_found,
            "urgency_score": urgency_score,
            "urls": extracted_urls,
            "phones": extracted_phones,
            "upis": extracted_upis,
        }

        risk_score = self.calculate_risk_score(findings)

        # Build indicators
        indicators: List[Dict[str, Any]] = []
        for cat, list_p in patterns_found.items():
            for p in list_p:
                indicators.append({
                    "type": "scam_phrase",
                    "value": p,
                    "severity": "high" if cat in ("upi_fraud", "banking_scam", "kyc_scam") else "medium",
                    "confidence": 0.9,
                    "description": f"Triggered pattern in category '{cat}'",
                    "source": "message_heuristics",
                })

        for u in extracted_urls:
            indicators.append({
                "type": "embedded_url",
                "value": u,
                "severity": "medium",
                "confidence": 1.0,
                "description": "Extracted web link inside message body",
                "source": "message_extractor",
            })

        for upi in extracted_upis:
            indicators.append({
                "type": "vpa_address",
                "value": upi,
                "severity": "high" if "upi_fraud" in patterns_found else "low",
                "confidence": 1.0,
                "description": "Extracted payment VPA handle",
                "source": "message_extractor",
            })

        threat_categories = list(patterns_found.keys())
        if not threat_categories:
            primary_threat = "legitimate" if risk_score < 25.0 else "social_engineering"
        else:
            primary_threat = threat_categories[0]

        recommendations: List[str] = []
        if "upi_fraud" in threat_categories:
            recommendations.append("NEVER enter your UPI PIN to receive money. UPI PIN is solely required for sending funds.")
        if "kyc_scam" in threat_categories:
            recommendations.append("Banks and telecom providers NEVER demand immediate KYC updates via SMS links. Visit your branch directly.")
        if "banking_scam" in threat_categories:
            recommendations.append("Do not click links or call numbers provided in the text. Dial the official phone number printed on your physical card.")
        if extracted_urls:
            recommendations.append("Avoid opening links received from unverified senders.")

        # Determine level & summary
        if risk_score >= 80.0:
            risk_level = "critical"
            summary = f"CRITICAL SCAM ALERT: High-probability fraudulent message identified ({primary_threat})."
        elif risk_score >= 55.0:
            risk_level = "high"
            summary = f"High Risk: Deceptive manipulation tactics and unverified financial calls-to-action detected."
        elif risk_score >= 30.0:
            risk_level = "medium"
            summary = "Suspicious Message: Unverified requests or potential phishing markers found."
        elif risk_score >= 10.0:
            risk_level = "low"
            summary = "Low Risk: Minor promotional or urgency markers found, likely marketing."
        else:
            risk_level = "safe"
            summary = "Safe: No indicators of social engineering, fraud, or phishing detected."

        return MessageAnalysisResult(
            message=message,
            sender=sender,
            channel=channel,
            is_scam=(risk_score >= 45.0),
            risk_score=risk_score,
            risk_level=risk_level,
            threat_categories=threat_categories or ["legitimate"],
            primary_threat=primary_threat,
            summary=summary,
            detected_patterns=patterns_found,
            urgency_score=urgency_score,
            extracted_urls=extracted_urls,
            extracted_phone_numbers=extracted_phones,
            extracted_upi_ids=extracted_upis,
            recommendations=recommendations,
            indicators=indicators,
        )
