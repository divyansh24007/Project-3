"""Pydantic response models, Enums, and standardized API return payloads."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    """Overall threat risk evaluation levels."""
    SAFE = "safe"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ThreatCategory(str, Enum):
    """Classified cyber threat categories."""
    PHISHING = "phishing"
    MALWARE = "malware"
    FINANCIAL_SCAM = "financial_scam"
    UPI_FRAUD = "upi_fraud"
    IDENTITY_THEFT = "identity_theft"
    SPAM = "spam"
    LEGITIMATE = "legitimate"
    UNKNOWN = "unknown"
    RANSOMWARE = "ransomware"
    SOCIAL_ENGINEERING = "social_engineering"


class ScanStatus(str, Enum):
    """Processing status of an analysis task."""
    PENDING = "pending"
    SCANNING = "scanning"
    COMPLETED = "completed"
    FAILED = "failed"


class ThreatIndicatorResponse(BaseModel):
    """Indicator of compromise identified during analysis."""
    type: str = Field(..., description="Indicator type: domain, ip, url, phone, etc.")
    value: str = Field(..., description="Observed threat value")
    severity: str = Field(default="medium", description="Severity: low, medium, high, critical")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence score")
    description: Optional[str] = Field(default=None, description="Explanatory details")
    source: str = Field(default="heuristics", description="Origin agent or detection engine")


class ScanResult(BaseModel):
    """Standardized response for scanning endpoints."""
    scan_id: str = Field(..., description="Unique investigation identifier")
    target: str = Field(..., description="Target scanned")
    target_type: str = Field(..., description="Target type: url, message, image, qr")
    status: ScanStatus = Field(default=ScanStatus.COMPLETED)
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Composite risk score (0-100)")
    risk_level: RiskLevel = Field(..., description="Evaluated risk classification")
    threat_category: ThreatCategory = Field(default=ThreatCategory.UNKNOWN)
    summary: str = Field(..., description="Human-readable executive summary")
    indicators: List[ThreatIndicatorResponse] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    details: Dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(..., description="ISO 8601 creation timestamp")


class InvestigationResponse(BaseModel):
    """Detailed investigation record."""
    id: str = Field(..., description="Investigation UUID")
    user_id: Optional[str] = None
    title: str
    input_type: str
    input_data: str
    status: str
    risk_score: float
    risk_level: str
    summary: Optional[str] = None
    full_report: Dict[str, Any] = Field(default_factory=dict)
    threat_indicators: List[ThreatIndicatorResponse] = Field(default_factory=list)
    created_at: str
    updated_at: str


class SecurityEventResponse(BaseModel):
    """Security alert or audit event."""
    id: str
    user_id: Optional[str] = None
    device_id: Optional[str] = None
    event_type: str
    severity: str
    details: Dict[str, Any]
    created_at: str


class AnalyticsOverview(BaseModel):
    """High-level metrics for security posture."""
    total_scans: int
    threats_blocked: int
    clean_items: int
    avg_risk_score: float
    critical_alerts: int


class AnalyticsResponse(BaseModel):
    """Dashboard analytics and trend distribution."""
    overview: AnalyticsOverview
    threat_distribution: Dict[str, int]
    risk_levels: Dict[str, int]
    recent_activity: List[Dict[str, Any]]


class DeviceResponse(BaseModel):
    """Registered client device details."""
    id: str
    user_id: str
    device_name: str
    device_type: str
    os_version: str
    app_version: str
    is_active: bool
    last_active_at: str
    security_status: Dict[str, Any]
    created_at: str


class SettingsResponse(BaseModel):
    """User preferences and configuration."""
    user_id: str
    theme: str
    ai_analysis_depth: str
    auto_quarantine: bool
    telemetry_enabled: bool
    notification_preferences: Dict[str, Any]
    custom_config: Dict[str, Any]


class ThreatIntelResult(BaseModel):
    """Intelligence query result for domain, IP, or URL."""
    target: str
    target_type: str
    is_malicious: bool
    risk_score: float
    categories: List[str]
    reputation: str
    dns_records: Optional[Dict[str, Any]] = None
    rdap_info: Optional[Dict[str, Any]] = None
    matched_rules: List[str] = Field(default_factory=list)
    details: Dict[str, Any] = Field(default_factory=dict)


class DemoScenario(BaseModel):
    """Simulated scenario definition."""
    id: str
    title: str
    description: str
    target_type: str
    sample_data: str
    expected_threat: str
    severity: str


class DemoRunResponse(BaseModel):
    """Result of running a demo scenario."""
    scenario_id: str
    title: str
    scan_result: ScanResult
