"""AI Provider abstractions and implementations for Gemini, Groq, and Heuristic Fallback."""

import json
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

try:
    import httpx
    _HTTPX_AVAILABLE = True
except ImportError:
    _HTTPX_AVAILABLE = False

from app.core.config import settings
from app.core.logging import logger


class AIProvider(ABC):
    """Abstract Base Class for Cybersecurity AI reasoning engines."""

    @abstractmethod
    async def analyze_threat(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        system_prompt: Optional[str] = None,
    ) -> str:
        """Execute threat reasoning prompt and return raw or JSON response string."""
        pass


class GeminiProvider(AIProvider):
    """Google Gemini AI integration using direct REST API invocation."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-flash"):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    async def analyze_threat(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        system_prompt: Optional[str] = None,
    ) -> str:
        if not self.api_key or not _HTTPX_AVAILABLE:
            logger.warning("gemini_api_key_missing_using_fallback")
            return await FallbackProvider().analyze_threat(prompt, context, system_prompt)

        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        sys_instruction = system_prompt or "You are an expert AI Cybersecurity Intelligence Analyst for AEGISOS. Output clean JSON only."

        contents = []
        full_user_content = prompt
        if context:
            full_user_content += f"\n\nContext and Technical Findings:\n{json.dumps(context, indent=2)}"

        payload = {
            "contents": [
                {
                    "parts": [{"text": full_user_content}]
                }
            ],
            "systemInstruction": {
                "parts": [{"text": sys_instruction}]
            },
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            },
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        return text
                logger.warning(
                    "gemini_api_error_status",
                    status_code=response.status_code,
                    body=response.text[:200],
                )
        except Exception as err:
            logger.error("gemini_api_call_exception", error=str(err))

        # Seamless fallback if API fails or quota exceeded
        return await FallbackProvider().analyze_threat(prompt, context, system_prompt)


class GroqProvider(AIProvider):
    """Groq Cloud LPU integration using OpenAI-compatible chat completions."""

    def __init__(self, api_key: Optional[str] = None, model: str = "llama-3.3-70b-versatile"):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model
        self.endpoint = "https://api.groq.com/openai/v1/chat/completions"

    async def analyze_threat(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        system_prompt: Optional[str] = None,
    ) -> str:
        if not self.api_key or not _HTTPX_AVAILABLE:
            logger.warning("groq_api_key_missing_using_fallback")
            return await FallbackProvider().analyze_threat(prompt, context, system_prompt)

        sys_msg = system_prompt or "You are an expert Cybersecurity Intelligence Analyst. Output valid JSON only."
        user_content = prompt
        if context:
            user_content += f"\n\nContext Data:\n{json.dumps(context, indent=2)}"

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": sys_msg},
                {"role": "user", "content": user_content},
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(self.endpoint, json=payload, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "")
                logger.warning("groq_api_error_status", status_code=response.status_code)
        except Exception as err:
            logger.error("groq_api_call_exception", error=str(err))

        return await FallbackProvider().analyze_threat(prompt, context, system_prompt)


class FallbackProvider(AIProvider):
    """Deterministic, resilient rule-based heuristic synthesizer."""

    async def analyze_threat(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
        system_prompt: Optional[str] = None,
    ) -> str:
        ctx = context or {}
        risk_score = float(ctx.get("risk_score", ctx.get("final_risk_score", 0.0)))
        
        # Check nested contexts if risk_score is 0
        if risk_score == 0.0:
            if "agent_findings" in ctx and isinstance(ctx["agent_findings"], list):
                for item in ctx["agent_findings"]:
                    if isinstance(item, dict):
                        s = float(item.get("risk_score", item.get("final_risk_score", 0.0)))
                        if s > risk_score:
                            risk_score = s
            elif "message_heuristics" in ctx and isinstance(ctx["message_heuristics"], dict):
                risk_score = float(ctx["message_heuristics"].get("risk_score", 0.0))
            elif "image_result" in ctx and isinstance(ctx["image_result"], dict):
                risk_score = float(ctx["image_result"].get("risk_score", 0.0))

        input_type = ctx.get("input_type", "unknown")
        patterns = ctx.get("patterns", {})
        indicators = ctx.get("indicators", [])

        # Heuristic determination
        if risk_score >= 80.0:
            risk_level = "critical"
            threat_cat = "phishing" if "homograph" in str(ctx) or "phishing" in str(patterns) else "financial_scam"
            action = "Immediate Quarantine and Block"
            reasoning = "High-confidence malice indicators detected including credential theft markers and domain spoofing."
        elif risk_score >= 50.0:
            risk_level = "high"
            threat_cat = "social_engineering"
            action = "Warn and Restrict Access"
            reasoning = "Substantial deceptive patterns, urgent call-to-action, or unverified financial transaction requests."
        elif risk_score >= 25.0:
            risk_level = "medium"
            threat_cat = "suspicious"
            action = "Proceed with Caution"
            reasoning = "Multiple mild structural or lexical anomalies observed. Further validation recommended."
        else:
            risk_level = "safe"
            threat_cat = "legitimate"
            action = "Allow"
            reasoning = "No threat signatures, deceptive patterns, or known malicious indicators detected."

        synthesized = {
            "engine": "AEGISOS-Deterministic-Intelligence-Engine",
            "risk_score": risk_score,
            "final_risk_score": risk_score,
            "risk_level": risk_level,
            "final_risk_level": risk_level,
            "threat_category": threat_cat,
            "primary_threat": threat_cat,
            "executive_summary": reasoning,
            "recommended_action": action,
            "reasoning": reasoning,
            "key_indicators_found": len(indicators),
            "threat_summary": f"Automated analysis classified this {input_type} target as {risk_level.upper()} with a score of {risk_score}/100.",
            "defensive_guidance": [
                "Verify identity through independent, known-good channels.",
                "Do not submit passwords, PINs, or OTPs on unverified interfaces.",
                "Report suspicious communications to security personnel.",
            ],
        }
        return json.dumps(synthesized, indent=2)


def get_ai_provider(provider_name: Optional[str] = None) -> AIProvider:
    """Factory creating configured AI provider."""
    selected = (provider_name or settings.AI_PROVIDER).lower()
    if selected == "gemini":
        return GeminiProvider()
    elif selected == "groq":
        return GroqProvider()
    elif selected == "fallback":
        return FallbackProvider()
    return GeminiProvider()
