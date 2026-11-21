"""SQLAlchemy models representing the AEGISOS database schema.

Note: As per architecture specifications, these models serve as the schema authority
and metadata reference. Active database operations in endpoints use the Supabase client.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import JSON


class Base(DeclarativeBase):
    """Base declarative class for all models."""
    pass


def utc_now() -> datetime:
    """Return current UTC timestamp with timezone."""
    return datetime.now(timezone.utc)


class Profile(Base):
    """User profile associated with Supabase auth.users."""

    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="analyst", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    devices: Mapped[List["Device"]] = relationship("Device", back_populates="user", cascade="all, delete-orphan")
    investigations: Mapped[List["Investigation"]] = relationship("Investigation", back_populates="user", cascade="all, delete-orphan")
    security_events: Mapped[List["SecurityEvent"]] = relationship("SecurityEvent", back_populates="user", cascade="all, delete-orphan")
    notification_preferences: Mapped[Optional["NotificationPreference"]] = relationship(
        "NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    user_settings: Mapped[Optional["UserSetting"]] = relationship(
        "UserSetting", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class Device(Base):
    """Enrolled endpoints, mobile devices, and workstations."""

    __tablename__ = "devices"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    device_name: Mapped[str] = mapped_column(String(255), nullable=False)
    device_type: Mapped[str] = mapped_column(String(50), default="android", nullable=False)  # android, ios, desktop
    os_version: Mapped[str] = mapped_column(String(100), nullable=False)
    app_version: Mapped[str] = mapped_column(String(50), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    security_posture: Mapped[Dict[str, Any]] = mapped_column(
        JSON, default=dict, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    # Relationships
    user: Mapped["Profile"] = relationship("Profile", back_populates="devices")
    security_events: Mapped[List["SecurityEvent"]] = relationship("SecurityEvent", back_populates="device", cascade="all, delete-orphan")
    application_audits: Mapped[List["ApplicationAudit"]] = relationship("ApplicationAudit", back_populates="device", cascade="all, delete-orphan")
    network_events: Mapped[List["NetworkEvent"]] = relationship("NetworkEvent", back_populates="device", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_device_user_active", "user_id", "is_active"),
    )


class Investigation(Base):
    """Security investigations triggered by URL, Message, Media, or Automated Scans."""

    __tablename__ = "investigations"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    input_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # url, message, image, qr, etc.
    input_data: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="completed", nullable=False, index=True
    )  # pending, in_progress, completed, failed
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False, index=True)
    risk_level: Mapped[str] = mapped_column(
        String(50), default="safe", nullable=False, index=True
    )  # safe, low, medium, high, critical
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    full_report: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    user: Mapped[Optional["Profile"]] = relationship("Profile", back_populates="investigations")
    threat_indicators: Mapped[List["ThreatIndicator"]] = relationship(
        "ThreatIndicator", back_populates="investigation", cascade="all, delete-orphan"
    )
    agent_executions: Mapped[List["AgentExecution"]] = relationship(
        "AgentExecution", back_populates="investigation", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_investigation_risk", "risk_level", "risk_score"),
        Index("idx_investigation_created", "created_at"),
    )


class ThreatIndicator(Base):
    """Indicators of Compromise (IoCs) extracted during investigations."""

    __tablename__ = "threat_indicators"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    investigation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("investigations.id", ondelete="CASCADE"), nullable=True, index=True
    )
    indicator_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # domain, ip, url, hash, phone, email, keyword
    indicator_value: Mapped[str] = mapped_column(String(1024), nullable=False, index=True)
    confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    severity: Mapped[str] = mapped_column(
        String(50), default="medium", nullable=False, index=True
    )  # low, medium, high, critical
    source: Mapped[str] = mapped_column(String(100), default="heuristics", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    # Relationships
    investigation: Mapped[Optional["Investigation"]] = relationship(
        "Investigation", back_populates="threat_indicators"
    )

    __table_args__ = (
        Index("idx_ioc_type_val", "indicator_type", "indicator_value"),
    )


class SecurityEvent(Base):
    """Real-time security telemetry and alert events."""

    __tablename__ = "security_events"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    device_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("devices.id", ondelete="SET NULL"), nullable=True, index=True
    )
    event_type: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )  # scan_detected, threat_blocked, phishing_alert, app_anomaly
    severity: Mapped[str] = mapped_column(String(50), default="low", nullable=False, index=True)
    details: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False, index=True
    )

    # Relationships
    user: Mapped[Optional["Profile"]] = relationship("Profile", back_populates="security_events")
    device: Mapped[Optional["Device"]] = relationship("Device", back_populates="security_events")


class AgentExecution(Base):
    """Audit log of AI agents invoked during analysis."""

    __tablename__ = "agent_executions"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    investigation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="success", nullable=False)
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    output_data: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    execution_time_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    # Relationships
    investigation: Mapped["Investigation"] = relationship(
        "Investigation", back_populates="agent_executions"
    )


class ApplicationAudit(Base):
    """Installed app scans and permission anomaly audits."""

    __tablename__ = "application_audits"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    device_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    package_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    app_name: Mapped[str] = mapped_column(String(255), nullable=False)
    version_name: Mapped[str] = mapped_column(String(100), default="1.0", nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    permissions: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    anomalies_found: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    # Relationships
    device: Mapped["Device"] = relationship("Device", back_populates="application_audits")


class NetworkEvent(Base):
    """Network connection telemetry recorded on devices."""

    __tablename__ = "network_events"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    device_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    destination_ip: Mapped[str] = mapped_column(String(45), nullable=False, index=True)
    destination_domain: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    destination_port: Mapped[int] = mapped_column(Integer, nullable=False)
    protocol: Mapped[str] = mapped_column(String(20), default="TCP", nullable=False)
    bytes_sent: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    bytes_received: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    is_suspicious: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    threat_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False, index=True
    )

    # Relationships
    device: Mapped["Device"] = relationship("Device", back_populates="network_events")


class NotificationPreference(Base):
    """User alert channel preferences."""

    __tablename__ = "notification_preferences"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    email_alerts: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    push_alerts: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sms_alerts: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    min_severity_alert: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    user: Mapped["Profile"] = relationship("Profile", back_populates="notification_preferences")


class UserSetting(Base):
    """User-specific cybersecurity workbench settings."""

    __tablename__ = "user_settings"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    theme: Mapped[str] = mapped_column(String(50), default="dark", nullable=False)
    ai_analysis_depth: Mapped[str] = mapped_column(String(50), default="standard", nullable=False)
    auto_quarantine: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    telemetry_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    custom_config: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    # Relationships
    user: Mapped["Profile"] = relationship("Profile", back_populates="user_settings")
