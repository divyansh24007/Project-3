-- ==============================================================================
-- AEGISOS Cybersecurity Platform - Database Migration 002
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- ==============================================================================
-- 1. Enable RLS on ALL Tables
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. SERVICE ROLE BYPASS POLICIES
-- Grants administrative backend services, workers, and secure API microservices
-- full read/write access when operating with the service_role key.
-- ==============================================================================
CREATE POLICY "Service role bypass on profiles"
    ON public.profiles FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass on devices"
    ON public.devices FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass on investigations"
    ON public.investigations FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass on threat_indicators"
    ON public.threat_indicators FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass on security_events"
    ON public.security_events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass on agent_executions"
    ON public.agent_executions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass on application_audits"
    ON public.application_audits FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass on network_events"
    ON public.network_events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass on notification_preferences"
    ON public.notification_preferences FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass on user_settings"
    ON public.user_settings FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- 3. PROFILES POLICIES
-- Users can only SELECT, INSERT, UPDATE, or DELETE their own profile
-- ==============================================================================
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- ==============================================================================
-- 4. DEVICES POLICIES
-- Users can only manage devices where user_id matches auth.uid()
-- ==============================================================================
CREATE POLICY "Users can view own devices"
    ON public.devices FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
    ON public.devices FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
    ON public.devices FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
    ON public.devices FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. INVESTIGATIONS POLICIES
-- Users can only manage investigations where user_id matches auth.uid()
-- ==============================================================================
CREATE POLICY "Users can view own investigations"
    ON public.investigations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investigations"
    ON public.investigations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investigations"
    ON public.investigations FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own investigations"
    ON public.investigations FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 6. THREAT INDICATORS POLICIES
-- Governed by parent investigation ownership:
-- Users can only access threat indicators if the parent investigation belongs to them
-- ==============================================================================
CREATE POLICY "Users can view own threat indicators"
    ON public.threat_indicators FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.investigations i
            WHERE i.id = threat_indicators.investigation_id
              AND i.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own threat indicators"
    ON public.threat_indicators FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.investigations i
            WHERE i.id = threat_indicators.investigation_id
              AND i.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own threat indicators"
    ON public.threat_indicators FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.investigations i
            WHERE i.id = threat_indicators.investigation_id
              AND i.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.investigations i
            WHERE i.id = threat_indicators.investigation_id
              AND i.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own threat indicators"
    ON public.threat_indicators FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.investigations i
            WHERE i.id = threat_indicators.investigation_id
              AND i.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 7. SECURITY EVENTS POLICIES
-- Users can only view and manage security events where user_id matches auth.uid()
-- ==============================================================================
CREATE POLICY "Users can view own security events"
    ON public.security_events FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security events"
    ON public.security_events FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own security events"
    ON public.security_events FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own security events"
    ON public.security_events FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 8. AGENT EXECUTIONS POLICIES
-- Governed by parent investigation ownership:
-- Users can only view or manage executions for their investigations
-- ==============================================================================
CREATE POLICY "Users can view own agent executions"
    ON public.agent_executions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.investigations i
            WHERE i.id = agent_executions.investigation_id
              AND i.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own agent executions"
    ON public.agent_executions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.investigations i
            WHERE i.id = agent_executions.investigation_id
              AND i.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own agent executions"
    ON public.agent_executions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.investigations i
            WHERE i.id = agent_executions.investigation_id
              AND i.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.investigations i
            WHERE i.id = agent_executions.investigation_id
              AND i.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own agent executions"
    ON public.agent_executions FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.investigations i
            WHERE i.id = agent_executions.investigation_id
              AND i.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 9. APPLICATION AUDITS POLICIES
-- Governed by parent device ownership:
-- Users can only view or audit apps on devices belonging to them
-- ==============================================================================
CREATE POLICY "Users can view own application audits"
    ON public.application_audits FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = application_audits.device_id
              AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own application audits"
    ON public.application_audits FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = application_audits.device_id
              AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own application audits"
    ON public.application_audits FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = application_audits.device_id
              AND d.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = application_audits.device_id
              AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own application audits"
    ON public.application_audits FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = application_audits.device_id
              AND d.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 10. NETWORK EVENTS POLICIES
-- Governed by parent device ownership:
-- Users can only view or manage network events from devices belonging to them
-- ==============================================================================
CREATE POLICY "Users can view own network events"
    ON public.network_events FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = network_events.device_id
              AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own network events"
    ON public.network_events FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = network_events.device_id
              AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own network events"
    ON public.network_events FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = network_events.device_id
              AND d.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = network_events.device_id
              AND d.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own network events"
    ON public.network_events FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.devices d
            WHERE d.id = network_events.device_id
              AND d.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 11. NOTIFICATION PREFERENCES POLICIES
-- Users can only view and modify their own notification settings
-- ==============================================================================
CREATE POLICY "Users can view own notification preferences"
    ON public.notification_preferences FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
    ON public.notification_preferences FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
    ON public.notification_preferences FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification preferences"
    ON public.notification_preferences FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 12. USER SETTINGS POLICIES
-- Users can only view and modify their own user settings
-- ==============================================================================
CREATE POLICY "Users can view own user settings"
    ON public.user_settings FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user settings"
    ON public.user_settings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user settings"
    ON public.user_settings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own user settings"
    ON public.user_settings FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
