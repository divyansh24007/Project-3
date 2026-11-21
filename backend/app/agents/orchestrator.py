"""Agent Orchestrator: Central AI cybersecurity investigation pipeline coordinating specialized agent teams."""

import json
import time
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.agents.ai_provider import AIProvider, get_ai_provider
from app.core.logging import logger
from app.ml.classifier import scam_classifier
from app.services.image_analyzer import ImageAnalyzer
from app.services.message_analyzer import MessageAnalyzer
from app.services.threat_intel import ThreatIntelligenceService
from app.services.url_analyzer import URLAnalyzer


@dataclass
class InvestigationResult:
    """Consolidated findings returned by the Agent Orchestrator."""
    investigation_id: str
    user_id: Optional[str]
    input_type: str
    input_data: str
    status: str
    risk_score: float
    risk_level: str
    threat_category: str
    summary: str
    agent_findings: Dict[str, Any]
    threat_indicators: List[Dict[str, Any]]
    recommendations: List[str]
    execution_time_ms: float
    created_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class AgentOrchestrator:
    """
    Central AI orchestration framework executing multi-agent security analysis.
    Coordinates Threat Detection, Web Intelligence, Social Engineering,
    Media Forensics, and Risk Assessment Agents.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or get_ai_provider()
        self.url_analyzer = URLAnalyzer()
        self.message_analyzer = MessageAnalyzer()
        self.image_analyzer = ImageAnalyzer()
        self.threat_intel = ThreatIntelligenceService()
        self.classifier = scam_classifier

    async def _safe_ai_json_call(
        self,
        system_prompt: str,
        user_prompt: str,
        context: Dict[str, Any],
        fallback_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Invoke AI provider and parse JSON output safely with automatic fallback."""
        try:
            raw_response = await self.ai.analyze_threat(
                prompt=user_prompt,
                context=context,
                system_prompt=system_prompt,
            )
            # Find JSON boundaries if markdown wrapped
            cleaned = raw_response.strip()
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0].strip()

            parsed = json.loads(cleaned)
            if isinstance(parsed, dict):
                return parsed
        except Exception as e:
            logger.debug("ai_agent_json_parse_fallback", error=str(e))

        return fallback_data

    async def run_threat_detection(
        self,
        input_type: str,
        input_data: str,
        preliminary_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Threat Detection Agent: Evaluates initial anomaly indicators and threat patterns."""
        sys_prompt = (
            "You are the AEGISOS Threat Detection Agent. Analyze the suspicious input "
            "and preliminary scan findings. Classify the exact threat mechanism. Output valid JSON."
        )
        user_prompt = (
            f"Analyze this {input_type} target for indicators of compromise and malicious intent.\n"
            f"Input target: {input_data}\n"
            "Return JSON with keys: detection_status, primary_threat, confidence, attack_vector, threat_summary"
        )
        fallback = {
            "detection_status": "flagged" if preliminary_data.get("risk_score", 0) > 30 else "clean",
            "primary_threat": preliminary_data.get("threat_category", "unknown"),
            "confidence": 0.9,
            "attack_vector": input_type,
            "threat_summary": preliminary_data.get("summary", "Heuristic scan executed."),
        }
        return await self._safe_ai_json_call(sys_prompt, user_prompt, preliminary_data, fallback)

    async def run_web_intelligence(
        self,
        urls: List[str],
        domains: List[str],
    ) -> Dict[str, Any]:
        """Web Intelligence Agent: Correlates domain reputation, DNS posture, and lexical structure."""
        if not urls and not domains:
            return {"status": "skipped", "findings": "No URLs or domains present"}

        domain_findings = []
        for d in domains[:5]:
            intel = self.threat_intel.check_domain(d)
            domain_findings.append(intel.to_dict())

        sys_prompt = (
            "You are the AEGISOS Web Intelligence Agent. Evaluate the network and domain footprint. "
            "Assess domain reputation, homograph spoofing, and hosting anomalies. Output JSON."
        )
        user_prompt = (
            "Evaluate these domains and URLs for phishing infrastructure, bulletproof hosting, or malicious DNS.\n"
            "Return JSON with keys: web_risk_level, targeted_brands, infrastructure_notes, domain_verdict"
        )
        fallback = {
            "web_risk_level": "high" if any(f["is_malicious"] for f in domain_findings) else "low",
            "targeted_brands": [f["target"] for f in domain_findings if "impersonation" in str(f.get("matched_rules", []))],
            "infrastructure_notes": "Automated DNS and WHOIS telemetry inspected.",
            "domain_verdict": "Malicious hosts identified" if any(f["is_malicious"] for f in domain_findings) else "Domains verified benign",
            "domain_details": domain_findings,
        }
        return await self._safe_ai_json_call(sys_prompt, user_prompt, {"domains": domain_findings, "urls": urls}, fallback)

    async def run_message_intelligence(self, text: str) -> Dict[str, Any]:
        """Social Engineering Agent: Evaluates psychological coercion, urgency, and deceit."""
        msg_result = self.message_analyzer.analyze_message(text)
        ml_cat = self.classifier.predict(text)
        ml_conf = self.classifier.get_confidence(text)

        sys_prompt = (
            "You are the AEGISOS Social Engineering Intelligence Agent. Analyze message intent, "
            "psychological pressure techniques, fake identity deception, and scam intent. Output JSON."
        )
        user_prompt = (
            f"Analyze the psychological vectors in this message:\n'{text}'\n"
            "Return JSON with keys: persuasion_tactics, urgency_rating, deceptive_pretext, safety_verdict"
        )
        fallback = {
            "persuasion_tactics": list(msg_result.detected_patterns.keys()),
            "urgency_rating": msg_result.urgency_score,
            "deceptive_pretext": msg_result.primary_threat,
            "ml_classification": ml_cat,
            "ml_confidence": ml_conf,
            "safety_verdict": "Suspicious communication" if msg_result.is_scam else "Likely authentic",
        }
        return await self._safe_ai_json_call(
            sys_prompt,
            user_prompt,
            {"message_heuristics": msg_result.to_dict(), "ml_prediction": ml_cat},
            fallback,
        )

    async def run_media_intelligence(self, image_bytes: bytes, filename: Optional[str] = None) -> Dict[str, Any]:
        """Media Intelligence Agent: Analyzes QR codes, visual fraud, and text payloads."""
        img_result = self.image_analyzer.analyze_image(image_bytes, filename=filename)
        return {
            "image_result": img_result.to_dict(),
            "has_qr": img_result.has_qr_code,
            "qr_payloads": img_result.qr_payloads,
            "ocr_text": img_result.extracted_text,
            "visual_risk": img_result.risk_level,
        }

    async def run_risk_assessment(self, findings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Risk Assessor Agent: Computes composite risk score, level, and actionable defensive posture."""
        sys_prompt = (
            "You are the Lead Risk Assessment Agent for AEGISOS. Synthesize findings across "
            "Threat Detection, Web Intel, and Social Engineering agents into a single actionable risk matrix. Output JSON."
        )
        user_prompt = (
            "Synthesize the following security agent findings into a final risk decision:\n"
            "Return JSON with keys: final_risk_score, final_risk_level, executive_summary, threat_category"
        )

        # Baseline heuristic calculation
        max_score = 0.0
        categories: List[str] = []
        for f in findings:
            score = float(f.get("risk_score", f.get("final_risk_score", 0.0)))
            if score > max_score:
                max_score = score
            cat = f.get("threat_category", f.get("primary_threat"))
            if cat and cat not in categories:
                categories.append(cat)

        if max_score >= 80.0:
            level = "critical"
        elif max_score >= 55.0:
            level = "high"
        elif max_score >= 25.0:
            level = "medium"
        elif max_score >= 10.0:
            level = "low"
        else:
            level = "safe"

        fallback = {
            "final_risk_score": max_score,
            "final_risk_level": level,
            "threat_category": categories[0] if categories else "unknown",
            "executive_summary": f"Investigation synthesized across agents. Risk score evaluated at {max_score:.1f}/100 ({level.upper()}).",
        }
        return await self._safe_ai_json_call(sys_prompt, user_prompt, {"agent_findings": findings}, fallback)

    def generate_recommendations(
        self,
        risk_level: str,
        threat_category: str,
        details: Dict[str, Any],
    ) -> List[str]:
        """Generate tactical defense recommendations based on threat profile."""
        recs: List[str] = []

        if risk_level in ("critical", "high"):
            recs.append("Immediate Action: Block destination domain and report sender handle.")
            recs.append("Do not click links, download attachments, or scan QR codes from this source.")
            recs.append("If credentials or OTP were entered, reset passwords immediately on an isolated device.")
        elif risk_level == "medium":
            recs.append("Exercise Caution: Verify authenticity of sender via trusted official helpline.")
            recs.append("Check the domain URL carefully for misspelled or substituted characters.")
        else:
            recs.append("No immediate threats identified. Continue observing standard cyber hygiene.")

        if threat_category == "upi_fraud":
            recs.append("Remember: Entering your UPI PIN is NEVER required to receive money or cashbacks.")
        elif threat_category == "kyc_scam":
            recs.append("Never update KYC, PAN, or SIM details through external links sent in SMS.")
        elif threat_category == "job_scam":
            recs.append("Legitimate corporate employers never demand upfront security deposits or Telegram tasks.")

        return recs

    async def investigate(
        self,
        input_type: str,
        input_data: str,
        user_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> InvestigationResult:
        """
        Execute end-to-end multi-agent security investigation.
        Supported input types: 'url', 'message', 'image', 'qr'.
        """
        start_time = time.perf_counter()
        inv_id = str(uuid.uuid4())
        meta = metadata or {}
        agent_findings: Dict[str, Any] = {}
        indicators: List[Dict[str, Any]] = []

        # Step 1: Input-specific deep analysis
        if input_type == "url":
            url_res = await self.url_analyzer.analyze_url(input_data)
            agent_findings["preliminary_scan"] = url_res.to_dict()
            indicators.extend(url_res.indicators)

            threat_agent = await self.run_threat_detection(input_type, input_data, url_res.to_dict())
            agent_findings["threat_detection_agent"] = threat_agent

            web_agent = await self.run_web_intelligence([input_data], [url_res.domain])
            agent_findings["web_intelligence_agent"] = web_agent

            risk_eval = await self.run_risk_assessment([url_res.to_dict(), threat_agent, web_agent])

        elif input_type in ("message", "text"):
            msg_res = self.message_analyzer.analyze_message(input_data, sender=meta.get("sender"), channel=meta.get("channel", "sms"))
            agent_findings["preliminary_scan"] = msg_res.to_dict()
            indicators.extend(msg_res.indicators)

            # Analyze extracted URLs if present
            if msg_res.extracted_urls:
                for u in msg_res.extracted_urls[:3]:
                    u_res = await self.url_analyzer.analyze_url(u)
                    indicators.extend(u_res.indicators)

            msg_agent = await self.run_message_intelligence(input_data)
            agent_findings["message_intelligence_agent"] = msg_agent

            threat_agent = await self.run_threat_detection(input_type, input_data, msg_res.to_dict())
            agent_findings["threat_detection_agent"] = threat_agent

            risk_eval = await self.run_risk_assessment([msg_res.to_dict(), msg_agent, threat_agent])

        elif input_type == "qr":
            # Direct QR content analysis (might be URL or UPI)
            if input_data.startswith(("http://", "https://")):
                url_res = await self.url_analyzer.analyze_url(input_data)
                agent_findings["preliminary_scan"] = url_res.to_dict()
                indicators.extend(url_res.indicators)
                threat_agent = await self.run_threat_detection("url", input_data, url_res.to_dict())
                agent_findings["threat_detection_agent"] = threat_agent
                risk_eval = await self.run_risk_assessment([url_res.to_dict(), threat_agent])
            else:
                msg_res = self.message_analyzer.analyze_message(input_data, channel="qr")
                agent_findings["preliminary_scan"] = msg_res.to_dict()
                indicators.extend(msg_res.indicators)
                threat_agent = await self.run_threat_detection("qr", input_data, msg_res.to_dict())
                agent_findings["threat_detection_agent"] = threat_agent
                risk_eval = await self.run_risk_assessment([msg_res.to_dict(), threat_agent])

        elif input_type == "image":
            # If input_data is base64
            import base64
            try:
                raw_bytes = base64.b64decode(input_data)
            except Exception:
                raw_bytes = b""
            media_agent = await self.run_media_intelligence(raw_bytes, filename=meta.get("filename"))
            agent_findings["media_intelligence_agent"] = media_agent
            img_res_dict = media_agent.get("image_result", {})
            indicators.extend(img_res_dict.get("indicators", []))

            # Run web intel if QR contained URLs
            urls = img_res_dict.get("extracted_urls", [])
            web_agent = await self.run_web_intelligence(urls, [])
            agent_findings["web_intelligence_agent"] = web_agent

            risk_eval = await self.run_risk_assessment([img_res_dict, web_agent])

        else:
            # Generic fallback
            risk_eval = {
                "final_risk_score": 0.0,
                "final_risk_level": "safe",
                "threat_category": "unknown",
                "executive_summary": "Unrecognized input format.",
            }

        # Step 2: Final synthesis
        risk_score = float(risk_eval.get("final_risk_score", risk_eval.get("risk_score", 0.0)))
        risk_level = str(risk_eval.get("final_risk_level", risk_eval.get("risk_level", "safe")))
        threat_cat = str(risk_eval.get("threat_category", risk_eval.get("primary_threat", "unknown")))
        summary = str(risk_eval.get("executive_summary", risk_eval.get("threat_summary", "Analysis completed.")))
        recommendations = self.generate_recommendations(risk_level, threat_cat, agent_findings)

        execution_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        now_iso = datetime.now(timezone.utc).isoformat()

        return InvestigationResult(
            investigation_id=inv_id,
            user_id=user_id,
            input_type=input_type,
            input_data=input_data[:2000],  # truncated for safety
            status="completed",
            risk_score=risk_score,
            risk_level=risk_level,
            threat_category=threat_cat,
            summary=summary,
            agent_findings=agent_findings,
            threat_indicators=indicators,
            recommendations=recommendations,
            execution_time_ms=execution_time_ms,
            created_at=now_iso,
        )


# Singleton orchestrator instance
orchestrator = AgentOrchestrator()
