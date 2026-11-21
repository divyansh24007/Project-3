"""Pydantic request models with comprehensive validation."""

import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class URLScanRequest(BaseModel):
    """Request payload for URL safety scanning."""

    url: str = Field(
        ...,
        description="The target web URL to inspect",
        examples=["https://secure-login.bank-update.xyz/verify"],
    )
    depth: Optional[str] = Field(
        default="standard",
        description="Depth of scan: quick, standard, or deep",
    )
    tags: Optional[List[str]] = Field(
        default_factory=list,
        description="Optional tracking or categorization tags",
    )

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("URL must not be empty")
        # Match standard HTTP/HTTPS schemes or raw domains
        url_pattern = re.compile(
            r"^(https?://)?"
            r"([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]{2,}"
            r"(/.*)?$",
            re.IGNORECASE,
        )
        # Check IP address based URLs
        ip_pattern = re.compile(
            r"^(https?://)?"
            r"(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[[0-9a-fA-F:]+\])"
            r"(:\d+)?"
            r"(/.*)?$"
        )
        if not (url_pattern.match(v) or ip_pattern.match(v)):
            raise ValueError("Invalid URL or host format provided")
        
        # Ensure scheme
        if not v.startswith(("http://", "https://")):
            v = "https://" + v
        return v

    @field_validator("depth")
    @classmethod
    def validate_depth(cls, v: Optional[str]) -> str:
        if v and v.lower() not in ("quick", "standard", "deep"):
            return "standard"
        return (v or "standard").lower()


class MessageScanRequest(BaseModel):
    """Request payload for SMS/Chat/Email message analysis."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=15000,
        description="Message content to analyze for social engineering or fraud",
    )
    sender: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Sender ID, phone number, email address, or handle",
    )
    channel: Optional[str] = Field(
        default="sms",
        description="Origin channel: sms, whatsapp, telegram, email, upi, or chat",
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Additional context such as timestamp or location",
    )

    @field_validator("channel")
    @classmethod
    def validate_channel(cls, v: Optional[str]) -> str:
        valid_channels = {"sms", "whatsapp", "telegram", "email", "upi", "chat", "other"}
        if v and v.lower() in valid_channels:
            return v.lower()
        return "sms"


class ImageScanRequest(BaseModel):
    """Request payload for base64-encoded image scanning."""

    image_base64: str = Field(
        ...,
        description="Base64 encoded image string (JPEG, PNG, WebP)",
    )
    filename: Optional[str] = Field(
        default="image.png",
        description="Original or inferred filename",
    )
    check_qr: Optional[bool] = Field(
        default=True,
        description="Extract and analyze embedded QR codes",
    )
    run_ocr: Optional[bool] = Field(
        default=True,
        description="Perform text extraction and threat keyword analysis",
    )


class QRScanRequest(BaseModel):
    """Request payload for direct QR code string analysis."""

    qr_content: Optional[str] = Field(
        default=None,
        description="Decoded QR payload (e.g. UPI link, URL, or plain text)",
    )
    image_base64: Optional[str] = Field(
        default=None,
        description="Optional base64 image containing the QR code to decode",
    )

    @field_validator("qr_content")
    @classmethod
    def validate_qr_input(cls, v: Optional[str], info: Any) -> Optional[str]:
        return v


class DeviceRegisterRequest(BaseModel):
    """Request payload for enrolling or updating a client device."""

    device_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Human-readable device identifier",
    )
    device_type: str = Field(
        default="android",
        description="Device form factor: android, ios, desktop, or server",
    )
    os_version: str = Field(
        ...,
        max_length=100,
        description="Operating system release version",
    )
    app_version: str = Field(
        ...,
        max_length=50,
        description="AEGISOS agent build version",
    )
    fcm_token: Optional[str] = Field(
        default=None,
        description="Firebase or push notification token",
    )
    security_posture: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Device telemetry (e.g. root status, SELinux state, encryption)",
    )


class SettingsUpdateRequest(BaseModel):
    """Request payload to update user configuration."""

    theme: Optional[str] = Field(default=None, description="UI theme: dark, light, system")
    ai_analysis_depth: Optional[str] = Field(default=None, description="quick, standard, deep")
    auto_quarantine: Optional[bool] = Field(default=None, description="Automatically isolate malicious indicators")
    telemetry_enabled: Optional[bool] = Field(default=None, description="Share anonymized telemetry")
    email_alerts: Optional[bool] = Field(default=None, description="Enable email alerts")
    push_alerts: Optional[bool] = Field(default=None, description="Enable push alerts")
    sms_alerts: Optional[bool] = Field(default=None, description="Enable SMS notifications")
    custom_config: Optional[Dict[str, Any]] = Field(default=None, description="Additional custom settings")


class DomainIntelRequest(BaseModel):
    """Request payload for domain intelligence lookup."""

    domain: str = Field(
        ...,
        min_length=3,
        max_length=255,
        description="Domain name to investigate (e.g., example.com)",
    )


class IPIntelRequest(BaseModel):
    """Request payload for IP address intelligence lookup."""

    ip: str = Field(
        ...,
        description="IPv4 or IPv6 address to investigate",
    )


class URLIntelRequest(BaseModel):
    """Request payload for URL intelligence lookup."""

    url: str = Field(
        ...,
        description="Full URL to investigate",
    )
