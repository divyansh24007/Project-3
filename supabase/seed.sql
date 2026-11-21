-- ==============================================================================
-- AEGISOS Cybersecurity Platform - Demo & Development Seed Data
-- Clearly Labeled Demo/Sample Data with Predictable Fixed UUIDs
-- ==============================================================================

-- Clean up any existing sample demo data to allow clean re-seeding
DO $$
BEGIN
    DELETE FROM public.investigations WHERE id IN (
        'e0000000-0000-0000-0000-000000000001',
        'e0000000-0000-0000-0000-000000000002',
        'e0000000-0000-0000-0000-000000000003',
        'e0000000-0000-0000-0000-000000000004',
        'e0000000-0000-0000-0000-000000000005'
    );
    DELETE FROM public.devices WHERE id IN (
        'd0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000003'
    );
    DELETE FROM public.security_events WHERE id IN (
        '70000000-0000-0000-0000-000000000001',
        '70000000-0000-0000-0000-000000000002',
        '70000000-0000-0000-0000-000000000003',
        '70000000-0000-0000-0000-000000000004',
        '70000000-0000-0000-0000-000000000005'
    );
END $$;

-- ==============================================================================
-- 1. Demo Auth Users & Profiles
-- Seed primary SecOps lead user into auth.users (if auth schema exists)
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            'a0000000-0000-0000-0000-000000000001',
            'authenticated',
            'authenticated',
            'demo.analyst@aegisos.cyber',
            crypt('AegisDemo2026!', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Alex Mercer (SecOps Lead)","avatar_url":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"}',
            now() - interval '30 days',
            now(),
            '', '', '', ''
        ) ON CONFLICT (id) DO NOTHING;

        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            'a0000000-0000-0000-0000-000000000002',
            'authenticated',
            'authenticated',
            'sarah.chen@aegisos.cyber',
            crypt('AegisDemo2026!', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Sarah Chen (Threat Hunter)","avatar_url":"https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80"}',
            now() - interval '14 days',
            now(),
            '', '', '', ''
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Ensure profiles exist (trigger on auth.users will handle this, or upsert directly for idempotency)
INSERT INTO public.profiles (id, full_name, email, avatar_url, created_at, updated_at)
VALUES 
    (
        'a0000000-0000-0000-0000-000000000001',
        'Alex Mercer (SecOps Lead)',
        'demo.analyst@aegisos.cyber',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        now() - interval '30 days',
        now()
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'Sarah Chen (Threat Hunter)',
        'sarah.chen@aegisos.cyber',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
        now() - interval '14 days',
        now()
    )
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();

-- Update or insert preferences and settings for demo users
INSERT INTO public.notification_preferences (user_id, threat_alerts, security_updates, email_notifications, push_notifications)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', true, true, true, true),
    ('a0000000-0000-0000-0000-000000000002', true, true, false, true)
ON CONFLICT (user_id) DO UPDATE SET
    threat_alerts = EXCLUDED.threat_alerts,
    security_updates = EXCLUDED.security_updates,
    email_notifications = EXCLUDED.email_notifications,
    push_notifications = EXCLUDED.push_notifications,
    updated_at = now();

INSERT INTO public.user_settings (user_id, theme, privacy_mode, protection_preferences)
VALUES 
    (
        'a0000000-0000-0000-0000-000000000001',
        'dark',
        false,
        '{"ai_triage_auto_dispatch": true, "real_time_edr": true, "deep_packet_inspection": true, "quarantine_threshold": 80}'::jsonb
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'dark',
        true,
        '{"ai_triage_auto_dispatch": true, "real_time_edr": true, "deep_packet_inspection": false, "quarantine_threshold": 90}'::jsonb
    )
ON CONFLICT (user_id) DO UPDATE SET
    theme = EXCLUDED.theme,
    privacy_mode = EXCLUDED.privacy_mode,
    protection_preferences = EXCLUDED.protection_preferences,
    updated_at = now();

-- ==============================================================================
-- 2. Demo Devices
-- Registered endpoints across Windows, Android, and macOS
-- ==============================================================================
INSERT INTO public.devices (id, user_id, device_name, platform, os_version, protection_status, last_seen, created_at, updated_at)
VALUES 
    (
        'd0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'SecOps-Workstation-Alpha',
        'windows',
        'Windows 11 Enterprise 23H2 (Build 22631.3296)',
        'active',
        now() - interval '2 minutes',
        now() - interval '25 days',
        now()
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'AEGIS-Field-Pixel8Pro',
        'android',
        'Android 14 (Security Patch Level 2026-02-05)',
        'active',
        now() - interval '14 minutes',
        now() - interval '20 days',
        now()
    ),
    (
        'd0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'MacBook-Pro-Forensics',
        'macos',
        'macOS Sonoma 14.4.1 (Darwin 23.4.0)',
        'degraded',
        now() - interval '3 hours',
        now() - interval '15 days',
        now()
    )
ON CONFLICT (id) DO UPDATE SET
    device_name = EXCLUDED.device_name,
    platform = EXCLUDED.platform,
    os_version = EXCLUDED.os_version,
    protection_status = EXCLUDED.protection_status,
    last_seen = EXCLUDED.last_seen;

-- ==============================================================================
-- 3. Demo Investigations
-- Rich security investigation cases spanning URL, APK, IP, Hash, and Domain inputs
-- ==============================================================================
INSERT INTO public.investigations (
    id, user_id, device_id, input_type, input_reference, threat_category,
    risk_level, risk_score, summary, status, created_at, completed_at
)
VALUES 
    (
        'e0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'url',
        'https://secure-login-office365-verify.workers.dev/auth/v2',
        'phishing',
        'critical',
        96,
        'Targeted reverse-proxy phishing attack using Cloudflare Workers to bypass geo-restrictions and intercept Microsoft 365 MFA session cookies.',
        'completed',
        now() - interval '4 hours',
        now() - interval '3 hours 58 minutes'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000002',
        'apk',
        'com.android.sysopt.batteryplus.apk',
        'trojan_spyware',
        'high',
        85,
        'Malicious Android APK masquerading as system battery optimizer. Contains dynamic DEX payload that exfiltrates incoming SMS, contact lists, and requests accessibility overlays.',
        'completed',
        now() - interval '18 hours',
        now() - interval '17 hours 52 minutes'
    ),
    (
        'e0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'ip',
        '194.26.29.112',
        'c2_beaconing',
        'high',
        78,
        'Outbound beaconing detected to known bulletproof hosting network in Eastern Europe. Periodic 60s jitter indicates active C2 channel.',
        'completed',
        now() - interval '1 day',
        now() - interval '23 hours 55 minutes'
    ),
    (
        'e0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000003',
        'file_hash',
        'b799b6c4597b6fa75494d930f78c8577eb0c822e1b12b2e811c015b637f5979b',
        'benign',
        'safe',
        4,
        'Verified clean binary for VSCode binary update. Valid Microsoft cryptographic digital signature and zero detections across threat intelligence feeds.',
        'completed',
        now() - interval '2 days',
        now() - interval '2 days'
    ),
    (
        'e0000000-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'domain',
        'telemetry-sync-auth.top',
        'malware_distribution',
        'medium',
        64,
        'Newly registered domain (18 hours old) using dynamic DNS entropy. Investigating passive DNS resolution and staged secondary payloads.',
        'analyzing',
        now() - interval '20 minutes',
        NULL
    )
ON CONFLICT (id) DO UPDATE SET
    risk_level = EXCLUDED.risk_level,
    risk_score = EXCLUDED.risk_score,
    summary = EXCLUDED.summary,
    status = EXCLUDED.status,
    completed_at = EXCLUDED.completed_at;

-- ==============================================================================
-- 4. Demo Threat Indicators (IOCs)
-- Detailed indicators linked to the demo investigations
-- ==============================================================================
INSERT INTO public.threat_indicators (
    id, investigation_id, indicator_type, indicator_value, reputation, evidence, confidence, created_at
)
VALUES 
    -- Indicators for Investigation 1 (Phishing URL)
    (
        'f0000000-0000-0000-0000-000000000001',
        'e0000000-0000-0000-0000-000000000001',
        'url',
        'https://secure-login-office365-verify.workers.dev/auth/v2',
        'malicious',
        '{"domain_age_days": 2, "ssl_issuer": "Let''s Encrypt", "virustotal_score": "14/89", "phish_tank_id": "8492019"}'::jsonb,
        0.98,
        now() - interval '3 hours 59 minutes'
    ),
    (
        'f0000000-0000-0000-0000-000000000002',
        'e0000000-0000-0000-0000-000000000001',
        'domain',
        'secure-login-office365-verify.workers.dev',
        'malicious',
        '{"dns_type": "CNAME", "registrar": "Cloudflare Inc.", "brand_impersonation": "Microsoft 365"}'::jsonb,
        0.95,
        now() - interval '3 hours 59 minutes'
    ),
    (
        'f0000000-0000-0000-0000-000000000003',
        'e0000000-0000-0000-0000-000000000001',
        'yara_rule',
        'SUSP_HTML_EvilProxy_MFA_Bypass',
        'malicious',
        '{"matched_strings": ["login.microsoftonline.com", "token_relay", "cookie_stealer"], "threat_group": "Scattered Spider"}'::jsonb,
        0.92,
        now() - interval '3 hours 58 minutes'
    ),

    -- Indicators for Investigation 2 (Trojan APK)
    (
        'f0000000-0000-0000-0000-000000000004',
        'e0000000-0000-0000-0000-000000000002',
        'sha256',
        '4f81a7b8e90a51c9d2f3e8201a61c56b98e1a2f304d9b1a5e7c8f9012345678a',
        'malicious',
        '{"detection_name": "Android.Trojan.BankBot.GY", "signer": "CN=Android Debug,O=Android,C=US", "dex_classes_count": 482}'::jsonb,
        0.94,
        now() - interval '17 hours 55 minutes'
    ),
    (
        'f0000000-0000-0000-0000-000000000005',
        'e0000000-0000-0000-0000-000000000002',
        'permission',
        'android.permission.RECEIVE_SMS',
        'suspicious',
        '{"danger_level": "dangerous", "reason": "Application requests interception of 2FA SMS tokens without messaging functionality"}'::jsonb,
        0.89,
        now() - interval '17 hours 54 minutes'
    ),
    (
        'f0000000-0000-0000-0000-000000000006',
        'e0000000-0000-0000-0000-000000000002',
        'permission',
        'android.permission.SYSTEM_ALERT_WINDOW',
        'suspicious',
        '{"danger_level": "high", "reason": "Overlay permission used to render transparent phish screens over banking apps"}'::jsonb,
        0.91,
        now() - interval '17 hours 54 minutes'
    ),

    -- Indicators for Investigation 3 (C2 IP)
    (
        'f0000000-0000-0000-0000-000000000007',
        'e0000000-0000-0000-0000-000000000003',
        'ip',
        '194.26.29.112',
        'malicious',
        '{"asn": "AS48693", "asn_org": "Hostinger International", "abuse_reports_last_30_days": 142, "cobalt_strike_beacon": true}'::jsonb,
        0.88,
        now() - interval '23 hours 58 minutes'
    ),

    -- Indicators for Investigation 4 (Safe Hash)
    (
        'f0000000-0000-0000-0000-000000000008',
        'e0000000-0000-0000-0000-000000000004',
        'sha256',
        'b799b6c4597b6fa75494d930f78c8577eb0c822e1b12b2e811c015b637f5979b',
        'clean',
        '{"verified_publisher": "Microsoft Corporation", "authenticode_status": "Valid", "threat_intel_positives": 0}'::jsonb,
        0.99,
        now() - interval '2 days'
    ),

    -- Indicators for Investigation 5 (Suspicious Domain)
    (
        'f0000000-0000-0000-0000-000000000009',
        'e0000000-0000-0000-0000-000000000005',
        'domain',
        'telemetry-sync-auth.top',
        'suspicious',
        '{"entropy_score": 4.12, "nameservers": ["ns1.topdns.me", "ns2.topdns.me"], "first_seen": "2026-11-21T02:00:00Z"}'::jsonb,
        0.72,
        now() - interval '18 minutes'
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 5. Demo Security Events
-- Chronological security alerts and telemetry for SecOps timeline
-- ==============================================================================
INSERT INTO public.security_events (
    id, user_id, device_id, event_type, severity, description, metadata, created_at
)
VALUES 
    (
        '70000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'phishing_blocked',
        'critical',
        'Outbound connection to malicious reverse-proxy portal intercepted and blocked by DNS shield.',
        '{"target_url": "https://secure-login-office365-verify.workers.dev/auth/v2", "threat_actor": "DEV-0537", "auto_isolated": false}'::jsonb,
        now() - interval '3 hours 57 minutes'
    ),
    (
        '70000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000002',
        'malware_quarantined',
        'high',
        'High-risk application com.android.sysopt.batteryplus identified requesting unauthorized SMS eavesdropping permissions.',
        '{"package": "com.android.sysopt.batteryplus", "signature": "unsigned_ad_hoc", "quarantined": true}'::jsonb,
        now() - interval '17 hours 50 minutes'
    ),
    (
        '70000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'c2_traffic_blocked',
        'high',
        'Periodic TLS beacon traffic matching Cobalt Strike malleable profile dropped at endpoint firewall.',
        '{"destination_ip": "194.26.29.112", "port": 443, "frequency_sec": 60}'::jsonb,
        now() - interval '23 hours 50 minutes'
    ),
    (
        '70000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000003',
        'agent_health_check',
        'info',
        'Endpoint security agent routine telemetry report received. All cryptographic modules intact.',
        '{"agent_version": "2.4.1", "tamper_protection": "enabled", "uptime_hours": 142}'::jsonb,
        now() - interval '2 hours'
    ),
    (
        '70000000-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'dns_anomaly',
        'medium',
        'Endpoint generated query for high-entropy newly registered domain telemetry-sync-auth.top.',
        '{"query": "telemetry-sync-auth.top", "entropy": 4.12, "action": "flagged_for_investigation"}'::jsonb,
        now() - interval '22 minutes'
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 6. Demo Agent Executions
-- Demonstrating the multi-agent AI orchestration pipeline
-- ==============================================================================
INSERT INTO public.agent_executions (
    id, investigation_id, agent_name, execution_status, input_data, output_data, execution_time, created_at
)
VALUES 
    -- Executions for Investigation 1
    (
        '80000000-0000-0000-0000-000000000001',
        'e0000000-0000-0000-0000-000000000001',
        'TriageAgent',
        'completed',
        '{"target": "https://secure-login-office365-verify.workers.dev/auth/v2", "mode": "deep_scan"}'::jsonb,
        '{"verdict": "phishing", "risk_score": 96, "confidence": 0.98, "recommendation": "block_domain"}'::jsonb,
        1.42,
        now() - interval '3 hours 59 minutes'
    ),
    (
        '80000000-0000-0000-0000-000000000002',
        'e0000000-0000-0000-0000-000000000001',
        'ThreatIntelAgent',
        'completed',
        '{"lookup_keys": ["secure-login-office365-verify.workers.dev"]}'::jsonb,
        '{"sources": ["VirusTotal", "AlienVault OTX", "PhishTank"], "reputation": "malicious", "tags": ["office365", "mfa_relay"]}'::jsonb,
        2.18,
        now() - interval '3 hours 58 minutes'
    ),
    (
        '80000000-0000-0000-0000-000000000003',
        'e0000000-0000-0000-0000-000000000001',
        'RemediationAgent',
        'completed',
        '{"actions": ["isolate_ip", "sinkhole_dns", "revoke_user_tokens"]}'::jsonb,
        '{"status": "dispatched", "rules_pushed": 1, "session_revocation_count": 1}'::jsonb,
        0.84,
        now() - interval '3 hours 57 minutes'
    ),

    -- Executions for Investigation 2
    (
        '80000000-0000-0000-0000-000000000004',
        'e0000000-0000-0000-0000-000000000002',
        'StaticAnalysisAgent',
        'completed',
        '{"file": "com.android.sysopt.batteryplus.apk", "decompile_dex": true}'::jsonb,
        '{"dangerous_permissions": 5, "hardcoded_c2_endpoints": ["http://91.240.118.42/api/gate.php"]}'::jsonb,
        4.65,
        now() - interval '17 hours 53 minutes'
    ),

    -- Executions for Investigation 5 (Running)
    (
        '80000000-0000-0000-0000-000000000005',
        'e0000000-0000-0000-0000-000000000005',
        'DNSForensicsAgent',
        'running',
        '{"domain": "telemetry-sync-auth.top", "resolve_depth": 3}'::jsonb,
        '{"interim_step": "querying_authoritative_nameservers"}'::jsonb,
        NULL,
        now() - interval '15 minutes'
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 7. Demo Application Audits
-- Audited apps on demo mobile and workstation devices
-- ==============================================================================
INSERT INTO public.application_audits (
    id, device_id, application_name, package_name, permissions, risk_level, audit_result, created_at
)
VALUES 
    (
        '90000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000002',
        'Battery Plus Optimizer',
        'com.android.sysopt.batteryplus',
        '["android.permission.RECEIVE_SMS", "android.permission.READ_CONTACTS", "android.permission.SYSTEM_ALERT_WINDOW", "android.permission.INTERNET"]'::jsonb,
        'critical',
        '{"threat_type": "BankingTrojan", "unnecessary_permissions": ["RECEIVE_SMS", "SYSTEM_ALERT_WINDOW"], "action": "quarantine_recommended"}'::jsonb,
        now() - interval '17 hours 51 minutes'
    ),
    (
        '90000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000002',
        'Signal Secure Messenger',
        'org.thoughtcrime.securesms',
        '["android.permission.CAMERA", "android.permission.RECORD_AUDIO", "android.permission.READ_CONTACTS", "android.permission.INTERNET"]'::jsonb,
        'safe',
        '{"threat_type": "None", "code_integrity": "verified_reproducible_build", "privacy_rating": "A+"}'::jsonb,
        now() - interval '3 days'
    ),
    (
        '90000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000001',
        'PowerShell 7.4',
        'Microsoft.PowerShell',
        '["FullFileSystemAccess", "NetworkSocketCreation", "ProcessInjectionPrivilege"]'::jsonb,
        'low',
        '{"threat_type": "AdministrativeTool", "script_block_logging": "enabled", "amsi_status": "enforcing"}'::jsonb,
        now() - interval '5 days'
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 8. Demo Network Events
-- Outbound/inbound network traffic telemetry
-- ==============================================================================
INSERT INTO public.network_events (
    id, device_id, destination, event_type, risk_level, action_taken, created_at
)
VALUES 
    (
        'a1000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'secure-login-office365-verify.workers.dev:443',
        'tls_handshake',
        'critical',
        'blocked',
        now() - interval '3 hours 57 minutes'
    ),
    (
        'a1000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000001',
        '194.26.29.112:443',
        'tcp_connect',
        'high',
        'blocked',
        now() - interval '23 hours 52 minutes'
    ),
    (
        'a1000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000001',
        'telemetry-sync-auth.top:53',
        'dns_query',
        'medium',
        'flagged',
        now() - interval '21 minutes'
    ),
    (
        'a1000000-0000-0000-0000-000000000004',
        'd0000000-0000-0000-0000-000000000002',
        'api.github.com:443',
        'tls_handshake',
        'safe',
        'allowed',
        now() - interval '10 minutes'
    ),
    (
        'a1000000-0000-0000-0000-000000000005',
        'd0000000-0000-0000-0000-000000000003',
        'vscode-update.azurewebsites.net:443',
        'tls_handshake',
        'safe',
        'allowed',
        now() - interval '2 days'
    )
ON CONFLICT (id) DO NOTHING;
