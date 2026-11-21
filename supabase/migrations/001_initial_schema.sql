-- ==============================================================================
-- AEGISOS Cybersecurity Platform - Database Migration 001
-- Initial Schema: Tables, Constraints, Indexes, and Lifecycle Triggers
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Profiles Table
-- Linked directly to Supabase auth.users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile information synchronized with auth.users';

-- ==============================================================================
-- 2. Devices Table
-- Endpoints and devices monitored or secured by AEGISOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    platform TEXT NOT NULL, -- e.g., 'android', 'windows', 'macos', 'linux', 'ios'
    os_version TEXT,
    protection_status TEXT NOT NULL DEFAULT 'active' CHECK (protection_status IN ('active', 'degraded', 'vulnerable', 'offline', 'disabled')),
    last_seen TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.devices IS 'Monitored endpoints and hardware devices registered to users';

-- ==============================================================================
-- 3. Investigations Table
-- Security analysis and triage investigations initiated by users or automated agents
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    input_type TEXT NOT NULL, -- 'url', 'ip', 'domain', 'file_hash', 'apk', 'text', 'network', etc.
    input_reference TEXT,     -- The target URL, IP address, file hash, or artifact identifier
    threat_category TEXT,     -- e.g., 'phishing', 'malware', 'ransomware', 'c2', 'spyware', 'benign'
    risk_level TEXT CHECK (risk_level IN ('safe', 'low', 'medium', 'high', 'critical')),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    summary TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.investigations IS 'Core threat investigation cases tracked across the platform';

-- ==============================================================================
-- 4. Threat Indicators Table
-- Specific IOCs (Indicators of Compromise) discovered during investigations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.threat_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    indicator_type TEXT NOT NULL, -- 'url', 'domain', 'ip', 'sha256', 'md5', 'cve', 'yara_rule', 'permission'
    indicator_value TEXT NOT NULL,
    reputation TEXT,              -- 'malicious', 'suspicious', 'clean', 'unknown'
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence REAL CHECK (confidence >= 0.0 AND confidence <= 1.0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.threat_indicators IS 'Indicators of compromise (IOCs) associated with an investigation';

-- ==============================================================================
-- 5. Security Events Table
-- Real-time security telemetry, alerts, and incident logs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'threat_detected', 'policy_violation', 'network_anomaly', 'auth_failure', etc.
    severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.security_events IS 'Security events and telemetry records for monitored devices and users';

-- ==============================================================================
-- 6. Agent Executions Table
-- Log of autonomous AI agent actions, intermediate steps, and reasoning outputs
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL, -- e.g., 'TriageAgent', 'ThreatIntelAgent', 'SandboxAgent', 'NetworkAnalysisAgent'
    execution_status TEXT NOT NULL DEFAULT 'pending' CHECK (execution_status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    execution_time REAL, -- Duration in seconds
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.agent_executions IS 'Execution logs and reasoning data for AI agents analyzing investigations';

-- ==============================================================================
-- 7. Application Audits Table
-- Security inspection of installed packages/applications on endpoint devices
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.application_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    application_name TEXT NOT NULL,
    package_name TEXT NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_level TEXT CHECK (risk_level IN ('safe', 'low', 'medium', 'high', 'critical')),
    audit_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.application_audits IS 'Installed application security evaluations and permission audit records';

-- ==============================================================================
-- 8. Network Events Table
-- Packet inspection, outbound/inbound connections, and firewall telemetry
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.network_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'dns_query', 'tcp_connect', 'udp_traffic', 'tls_handshake', 'blocked_connection'
    risk_level TEXT CHECK (risk_level IN ('safe', 'low', 'medium', 'high', 'critical')),
    action_taken TEXT NOT NULL, -- 'allowed', 'blocked', 'flagged', 'quarantined'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.network_events IS 'Network telemetry and firewall actions recorded for devices';

-- ==============================================================================
-- 9. Notification Preferences Table
-- User-specific alert and messaging dispatch preferences
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    threat_alerts BOOLEAN NOT NULL DEFAULT true,
    security_updates BOOLEAN NOT NULL DEFAULT true,
    email_notifications BOOLEAN NOT NULL DEFAULT false,
    push_notifications BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notification_preferences IS 'Per-user notification delivery channels and frequency rules';

-- ==============================================================================
-- 10. User Settings Table
-- General application preferences, UI themes, and protection levels
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'dark',
    privacy_mode BOOLEAN NOT NULL DEFAULT false,
    protection_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_settings IS 'User configurations, interface settings, and protection preferences';

-- ==============================================================================
-- INDEXES
-- Optimized for high query throughput, foreign key lookups, and time-series sorting
-- ==============================================================================

-- Foreign key indexes (user_id)
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_investigations_user_id ON public.investigations(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Foreign key indexes (device_id)
CREATE INDEX IF NOT EXISTS idx_investigations_device_id ON public.investigations(device_id);
CREATE INDEX IF NOT EXISTS idx_security_events_device_id ON public.security_events(device_id);
CREATE INDEX IF NOT EXISTS idx_application_audits_device_id ON public.application_audits(device_id);
CREATE INDEX IF NOT EXISTS idx_network_events_device_id ON public.network_events(device_id);

-- Foreign key indexes (investigation_id)
CREATE INDEX IF NOT EXISTS idx_threat_indicators_investigation_id ON public.threat_indicators(investigation_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_investigation_id ON public.agent_executions(investigation_id);

-- Time-series indexes (created_at descending for chronological feeds)
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devices_created_at ON public.devices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON public.investigations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_created_at ON public.threat_indicators(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_executions_created_at ON public.agent_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_audits_created_at ON public.application_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_network_events_created_at ON public.network_events(created_at DESC);

-- Composite & specialized lookup indexes
CREATE INDEX IF NOT EXISTS idx_investigations_user_created ON public.investigations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_risk_level ON public.investigations(risk_level);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_type_val ON public.threat_indicators(indicator_type, indicator_value);
CREATE INDEX IF NOT EXISTS idx_security_events_user_severity ON public.security_events(user_id, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devices_protection ON public.devices(user_id, protection_status);

-- ==============================================================================
-- TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 1. Automatic updated_at column updater
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_devices_updated_at ON public.devices;
CREATE TRIGGER trg_devices_updated_at
    BEFORE UPDATE ON public.devices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER trg_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Trigger function to auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        avatar_url,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            ''
        ),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = CASE 
            WHEN public.profiles.full_name IS NULL OR public.profiles.full_name = '' 
            THEN EXCLUDED.full_name 
            ELSE public.profiles.full_name 
        END,
        updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Trigger function to auto-create notification_preferences and user_settings on profile insert
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically seed default notification preferences
    INSERT INTO public.notification_preferences (
        user_id,
        threat_alerts,
        security_updates,
        email_notifications,
        push_notifications,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        true,
        true,
        false,
        true,
        now(),
        now()
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Automatically seed default user settings
    INSERT INTO public.user_settings (
        user_id,
        theme,
        privacy_mode,
        protection_preferences,
        updated_at
    )
    VALUES (
        NEW.id,
        'dark',
        false,
        '{"real_time_scanning": true, "cloud_lookup": true, "auto_isolate_critical": false}'::jsonb,
        now()
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();
