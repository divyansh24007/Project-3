"""Image Analyzer Service: QR decoding, OCR text heuristics, metadata inspection, and visual security analysis."""

import base64
import io
import re
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional
from PIL import Image, ImageOps
from app.core.logging import logger

# Safe pyzbar import with graceful fallback
try:
    from pyzbar.pyzbar import decode as pyzbar_decode
    _PYZBAR_AVAILABLE = True
except Exception:
    _PYZBAR_AVAILABLE = False


@dataclass
class ImageAnalysisResult:
    """Structured result returned by ImageAnalyzer."""
    filename: Optional[str]
    image_format: str
    width: int
    height: int
    has_qr_code: bool
    qr_payloads: List[str]
    extracted_text: str
    extracted_urls: List[str]
    is_suspicious: bool
    risk_score: float  # 0 to 100
    risk_level: str  # safe, low, medium, high, critical
    threat_category: str
    summary: str
    findings: Dict[str, Any]
    indicators: List[Dict[str, Any]] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ImageAnalyzer:
    """Multi-modal visual inspection engine analyzing QR codes, OCR text, and payload markers."""

    SUSPICIOUS_PHRASES = [
        "scan to pay", "scan to receive", "lottery winner", "congratulations",
        "enter upi pin", "bank verification", "claim cashback", "kyc update",
        "urgent action", "account blocked", "limited time prize"
    ]

    def __init__(self) -> None:
        self.url_regex = re.compile(
            r"(?:https?://|www\.)[^\s<>{}\[\]\(\)\"\'`]+|[a-zA-Z0-9-]+\.(?:xyz|top|site|online|tk|ml|ga|cf|gq|club|buzz|cam|link)/[^\s]*",
            re.IGNORECASE,
        )

    def extract_qr_codes(self, image: Image.Image) -> List[Dict[str, Any]]:
        """Extract and decode all QR codes present within the image."""
        qr_results = []
        if not _PYZBAR_AVAILABLE:
            logger.debug("pyzbar_unavailable_skipping_native_qr")
            return qr_results

        try:
            # Convert to grayscale for reliable edge decoding
            gray = ImageOps.grayscale(image)
            decoded_objects = pyzbar_decode(gray)
            for obj in decoded_objects:
                payload = obj.data.decode("utf-8", errors="replace")
                qr_results.append({
                    "type": obj.type,
                    "data": payload,
                    "rect": {
                        "left": obj.rect.left,
                        "top": obj.rect.top,
                        "width": obj.rect.width,
                        "height": obj.rect.height,
                    },
                })
        except Exception as e:
            logger.warning("qr_decode_failed", error=str(e))

        return qr_results

    def extract_text_ocr(self, image: Image.Image) -> str:
        """
        Lightweight text extraction from image.
        Uses tesseract if available, else performs metadata & string heuristic extraction.
        """
        extracted = []
        # Check EXIF metadata for embedded text or comments
        try:
            info = image.info or {}
            for k in ("comment", "description", "Software", "Title", "Author"):
                if k in info and isinstance(info[k], str):
                    extracted.append(info[k])
        except Exception:
            pass

        # Check pytesseract if installed
        try:
            import pytesseract
            text = pytesseract.image_to_string(image)
            if text.strip():
                extracted.append(text.strip())
        except Exception:
            # pytesseract binary not present on path, silent fallback
            pass

        return "\n".join(extracted)

    def extract_urls_from_text(self, text: str) -> List[str]:
        """Extract embedded hyperlinks from decoded text."""
        matches = self.url_regex.findall(text)
        cleaned = []
        for m in matches:
            u = m.strip(".,;:?!'\"")
            if u:
                if not u.startswith(("http://", "https://")):
                    u = "https://" + u
                cleaned.append(u)
        return list(dict.fromkeys(cleaned))

    def detect_suspicious_content(self, ocr_text: str, qr_payloads: List[str]) -> Dict[str, Any]:
        """Identify fraudulent or deceptive signals in OCR and QR content."""
        findings: List[str] = []
        combined_text = (ocr_text + " " + " ".join(qr_payloads)).lower()

        for phrase in self.SUSPICIOUS_PHRASES:
            if phrase in combined_text:
                findings.append(f"Deceptive phrase detected: '{phrase}'")

        # Check for UPI reverse payment trap in QR payloads
        upi_pay_traps = []
        for q in qr_payloads:
            if q.startswith("upi://pay"):
                # Check for suspicious parameters
                if "am=" in q and ("pa=" in q):
                    findings.append("Static payment request QR (demands fixed debit sum)")
                upi_pay_traps.append(q)

        return {
            "findings": findings,
            "has_deceptive_phrases": len(findings) > 0,
            "upi_payloads": upi_pay_traps,
        }

    def analyze_image(
        self,
        image_bytes: bytes,
        filename: Optional[str] = None,
    ) -> ImageAnalysisResult:
        """Execute full visual security inspection."""
        try:
            img = Image.open(io.BytesIO(image_bytes))
            img_format = img.format or "UNKNOWN"
            width, height = img.size
        except Exception as err:
            logger.error("image_load_failed", error=str(err))
            return ImageAnalysisResult(
                filename=filename,
                image_format="CORRUPTED",
                width=0,
                height=0,
                has_qr_code=False,
                qr_payloads=[],
                extracted_text="",
                extracted_urls=[],
                is_suspicious=True,
                risk_score=75.0,
                risk_level="high",
                threat_category="malware",
                summary="Invalid or malformed image data stream.",
                findings={"error": str(err)},
                recommendations=["Do not open or execute file."],
            )

        # 1. QR Code analysis
        qr_objects = self.extract_qr_codes(img)
        qr_payloads = [obj["data"] for obj in qr_objects]

        # 2. Text extraction
        ocr_text = self.extract_text_ocr(img)

        # 3. URL extraction
        all_text = ocr_text + "\n" + "\n".join(qr_payloads)
        extracted_urls = self.extract_urls_from_text(all_text)

        # 4. Content analysis
        suspicious_eval = self.detect_suspicious_content(ocr_text, qr_payloads)

        # Compute risk score
        risk_score = 0.0
        indicators: List[Dict[str, Any]] = []
        recommendations: List[str] = []

        if qr_payloads:
            for p in qr_payloads:
                indicators.append({
                    "type": "qr_payload",
                    "value": p[:100],
                    "severity": "medium",
                    "confidence": 1.0,
                    "description": "Decoded QR code target",
                    "source": "qr_decoder",
                })
                # Check if payload is UPI
                if p.startswith("upi://pay"):
                    if "am=" in p:
                        risk_score += 45.0
                        recommendations.append("CRITICAL: This QR code is configured to DEBIT money from your bank account, not credit you.")
                    else:
                        risk_score += 20.0

        if extracted_urls:
            for u in extracted_urls:
                indicators.append({
                    "type": "extracted_url",
                    "value": u,
                    "severity": "medium",
                    "confidence": 0.9,
                    "description": "Hyperlink detected in image content",
                    "source": "image_ocr",
                })
                if any(x in u for x in [".xyz", ".top", "bit.ly", "tinyurl.com"]):
                    risk_score += 30.0

        for f in suspicious_eval["findings"]:
            risk_score += 25.0
            indicators.append({
                "type": "suspicious_visual_marker",
                "value": f,
                "severity": "high",
                "confidence": 0.85,
                "description": f,
                "source": "visual_heuristics",
            })

        # Cap risk score
        risk_score = min(max(round(risk_score, 1), 0.0), 100.0)

        # Level determination
        if risk_score >= 70.0:
            risk_level = "critical" if risk_score >= 85.0 else "high"
            threat_cat = "upi_fraud" if suspicious_eval["upi_payloads"] else "phishing"
            summary = "High Risk Image: Malicious QR payment redirection or deceptive scam content identified."
        elif risk_score >= 35.0:
            risk_level = "medium"
            threat_cat = "suspicious"
            summary = "Suspicious Image: Embedded links or financial keywords warrant verification."
        else:
            risk_level = "safe"
            threat_cat = "legitimate"
            summary = "Safe: Image inspection revealed no deceptive QR codes or social engineering markers."

        return ImageAnalysisResult(
            filename=filename,
            image_format=img_format,
            width=width,
            height=height,
            has_qr_code=len(qr_payloads) > 0,
            qr_payloads=qr_payloads,
            extracted_text=ocr_text,
            extracted_urls=extracted_urls,
            is_suspicious=(risk_score >= 40.0),
            risk_score=risk_score,
            risk_level=risk_level,
            threat_category=threat_cat,
            summary=summary,
            findings=suspicious_eval,
            indicators=indicators,
            recommendations=recommendations,
        )
