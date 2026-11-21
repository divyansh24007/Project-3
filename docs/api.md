# AEGISOS REST API Specification

> **Base URL:** `http://localhost:8000/api/v1` (or your configured `BACKEND_URL`)  
> **API Version:** `1.0.0`  
> **Protocol:** HTTP/1.1 and HTTP/2 over TLS  
> **Content-Type:** `application/json` (or `multipart/form-data` for file uploads)

---

## 1. Authentication & Authorization

AEGISOS utilizes **Supabase JWTs (JSON Web Tokens)** for authenticated endpoints. Pass your token in the `Authorization` header using the `Bearer` scheme.

```http
Authorization: Bearer <your-supabase-jwt-token>
```

### Authentication Rules:
* **Public / Optional Endpoints**: Endpoints under `/scan/*`, `/intelligence/*`, `/demo/*`, and `/health` accept optional authentication. If no token is provided, the scan executes anonymously without linking to a user profile. In `DEBUG=true` mode, unauthenticated requests automatically map to a mock analyst identity (`00000000-0000-0000-0000-000000000001`).
* **Protected Endpoints**: Endpoints under `/investigations/*`, `/devices/*`, `/analytics/*`, and `/settings` require a valid JWT with `sub` matching the Supabase user UUID.
* **Development Tokens**: In non-production environments, passing `Authorization: Bearer demo-token` grants access as the default demo security officer (`11111111-1111-1111-1111-111111111111`).

---

## 2. Rate Limiting

Rate limiting is enforced at the API gateway layer via **SlowAPI**:
* **Standard Limit:** `60 requests per minute` per client IP address.
* When rate limits are breached, the API returns HTTP `429 Too Many Requests`.

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60

{
  "error": "Rate limit exceeded: 60 per 1 minute"
}
```

---

## 3. Standard Response Envelope & Error Format

All error responses return a standardized JSON object:

```json
{
  "detail": "Descriptive human-readable explanation of the validation or system error"
}
```

### Standard HTTP Status Codes:
* `200 OK`: Request succeeded.
* `201 Created`: Resource successfully registered or created.
* `400 Bad Request`: Invalid payload parameters, empty inputs, or failed validation.
* `401 Unauthorized`: Missing, invalid, or expired Bearer token.
* `403 Forbidden`: Authenticated user lacks permission to access this resource.
* `404 Not Found`: Target entity (investigation ID, device ID, scenario ID) does not exist.
* `413 Payload Too Large`: Uploaded file exceeds the 10MB maximum size limit.
* `429 Too Many Requests`: Client IP exceeded the rate limit threshold.
* `500 Internal Server Error`: Unhandled server exception (sanitized in production).

---

## 4. Endpoint Reference & JSON Examples

### 4.1 System & Health

#### `GET /health` or `GET /api/v1/health`
Verify server operational status, ML classifier readiness, and active AI provider.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-11-21T22:30:00.000000Z",
  "ai_provider": "gemini",
  "classifier_ready": true
}
```

---

### 4.2 Threat Scanning (`/api/v1/scan`)

#### `POST /api/v1/scan/url`
Scan a web URL or domain name for phishing indicators, homograph lookalike spoofing, and malicious hosting.

**Request:**
```json
{
  "url": "https://secure-login-pаypal.com/verify-account",
  "depth": "standard",
  "tags": ["email-link", "urgent"]
}
```

**Response:** `200 OK`
```json
{
  "scan_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "target": "https://secure-login-pаypal.com/verify-account",
  "target_type": "url",
  "status": "completed",
  "risk_score": 92.5,
  "risk_level": "critical",
  "threat_category": "phishing",
  "summary": "High-confidence brand impersonation targeting PayPal. Cyrillic homograph character detected in domain label.",
  "indicators": [
    {
      "type": "domain",
      "value": "secure-login-pаypal.com",
      "severity": "critical",
      "confidence": 0.98,
      "description": "Unicode homograph confusable '\\u0430' (Cyrillic Small Letter A) used in place of Latin 'a'.",
      "source": "URLAnalyzer"
    },
    {
      "type": "url",
      "value": "https://secure-login-pаypal.com/verify-account",
      "severity": "high",
      "confidence": 0.90,
      "description": "Embedded credential harvesting keywords ('login', 'verify', 'account').",
      "source": "WebIntelligenceAgent"
    }
  ],
  "recommendations": [
    "Immediate Action: Block destination domain and report sender handle.",
    "Do not click links, download attachments, or scan QR codes from this source.",
    "If credentials or OTP were entered, reset passwords immediately on an isolated device."
  ],
  "details": {
    "agent_findings": {
      "threat_detection_agent": {
        "detection_status": "flagged",
        "primary_threat": "phishing",
        "confidence": 0.95
      }
    },
    "execution_time_ms": 342.18
  },
  "created_at": "2026-11-21T22:30:15.123456Z"
}
```

---

#### `POST /api/v1/scan/message`
Analyze SMS, WhatsApp, Telegram, or email text for social engineering, financial fraud, and coercive urgency.

**Request:**
```json
{
  "message": "Dear SBI customer, your savings account #4102 has been suspended due to expired KYC. Update your PAN card immediately to avoid permanent closure: http://sbi-pan-update.xyz/verify",
  "sender": "VK-SBIINB",
  "channel": "sms",
  "metadata": {
    "sim_slot": 1
  }
}
```

**Response:** `200 OK`
```json
{
  "scan_id": "c4a71f8b-209a-4c22-b5e1-923f1a04d2e8",
  "target": "Dear SBI customer, your savings account #4102 has been suspended due to expired KYC...",
  "target_type": "message",
  "status": "completed",
  "risk_score": 88.0,
  "risk_level": "critical",
  "threat_category": "financial_scam",
  "summary": "Urgent banking deactivation pretext detected. Message contains unverified external link on suspicious .xyz TLD.",
  "indicators": [
    {
      "type": "phone",
      "value": "VK-SBIINB",
      "severity": "medium",
      "confidence": 0.85,
      "description": "Suspicious commercial SMS header impersonating State Bank of India.",
      "source": "MessageAnalyzer"
    },
    {
      "type": "url",
      "value": "http://sbi-pan-update.xyz/verify",
      "severity": "critical",
      "confidence": 0.99,
      "description": "Phishing URL hosted on high-abuse .xyz domain extension.",
      "source": "URLAnalyzer"
    }
  ],
  "recommendations": [
    "Never update KYC, PAN, or SIM details through external links sent in SMS.",
    "Legitimate banks never threaten immediate account suspension via unauthenticated SMS."
  ],
  "details": {
    "ml_prediction": "financial_scam",
    "ml_confidence": 0.94,
    "urgency_score": 9.2,
    "execution_time_ms": 284.50
  },
  "created_at": "2026-11-21T22:30:30.456789Z"
}
```

---

#### `POST /api/v1/scan/image`
Upload an image file (`multipart/form-data`) or provide base64 image data in JSON for QR code payload extraction and OCR text analysis.

**Option A: Multipart Form Data Request:**
```http
POST /api/v1/scan/image HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="suspicious_qr.png"
Content-Type: image/png

<binary data up to 10MB>
------WebKitFormBoundary--
```

**Option B: JSON Base64 Payload Request:**
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "filename": "payment_prompt.png",
  "check_qr": true,
  "run_ocr": true
}
```

**Response:** `200 OK`
```json
{
  "scan_id": "fa21bc82-0193-4a11-8729-19a9d20c54bb",
  "target": "iVBORw0KGgoAAAANSUhEUgAA...",
  "target_type": "image",
  "status": "completed",
  "risk_score": 85.0,
  "risk_level": "critical",
  "threat_category": "upi_fraud",
  "summary": "QR code payload decodes to an unauthorized UPI debit request masquerading as a cashback credit.",
  "indicators": [
    {
      "type": "url",
      "value": "upi://pay?pa=refund-agent@okaxis&pn=CashbackDesk&am=5000",
      "severity": "critical",
      "confidence": 0.95,
      "description": "Reverse-payment trap: Scanning this QR code prompts for a UPI PIN to debit Rs 5,000.",
      "source": "MediaGuard"
    }
  ],
  "recommendations": [
    "Remember: Entering your UPI PIN is NEVER required to receive money or cashbacks.",
    "Do not authorize or confirm transactions on your UPI app from this prompt."
  ],
  "details": {
    "image_format": "PNG",
    "width": 512,
    "height": 512,
    "qr_payloads": [
      "upi://pay?pa=refund-agent@okaxis&pn=CashbackDesk&am=5000"
    ],
    "execution_time_ms": 412.08
  },
  "created_at": "2026-11-21T22:31:00.000000Z"
}
```

---

#### `POST /api/v1/scan/qr`
Inspect raw decoded QR strings directly (e.g., extracted on mobile endpoints before transmission).

**Request:**
```json
{
  "qr_content": "upi://pay?pa=refund-agent@okaxis&pn=CashbackDesk&am=5000"
}
```

**Response:** `200 OK`
```json
{
  "scan_id": "771e84a2-4a01-4478-8319-e932b781a919",
  "target": "upi://pay?pa=refund-agent@okaxis&pn=CashbackDesk&am=5000",
  "target_type": "qr",
  "status": "completed",
  "risk_score": 85.0,
  "risk_level": "critical",
  "threat_category": "upi_fraud",
  "summary": "Reverse-credit trap identified. User is being tricked into authorizing a fund debit.",
  "indicators": [
    {
      "type": "upi",
      "value": "refund-agent@okaxis",
      "severity": "critical",
      "confidence": 0.95,
      "description": "Flagged fraudulent payment handle.",
      "source": "HeuristicEngine"
    }
  ],
  "recommendations": [
    "Entering your UPI PIN is NEVER required to receive money."
  ],
  "details": {},
  "created_at": "2026-11-21T22:31:15.000000Z"
}
```

---

#### `GET /api/v1/scan/{scan_id}`
Retrieve a stored investigation report and its indicators by scan ID.

**Response:** `200 OK`
```json
{
  "scan_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "target": "https://secure-login-pаypal.com/verify-account",
  "target_type": "url",
  "status": "completed",
  "risk_score": 92.5,
  "risk_level": "critical",
  "threat_category": "unknown",
  "summary": "High-confidence brand impersonation targeting PayPal.",
  "indicators": [
    {
      "type": "domain",
      "value": "secure-login-pаypal.com",
      "severity": "critical",
      "confidence": 0.98,
      "description": "Unicode homograph confusable.",
      "source": "URLAnalyzer"
    }
  ],
  "recommendations": [],
  "details": {},
  "created_at": "2026-11-21T22:30:15.123456Z"
}
```

---

### 4.3 Investigations (`/api/v1/investigations`)

#### `GET /api/v1/investigations`
Retrieve a paginated list of security investigations for the authenticated user.

**Query Parameters:**
* `page` (integer, default: `1`): Page number.
* `limit` (integer, default: `20`, max: `100`): Results per page.
* `risk_level` (string, optional): Filter by `safe`, `low`, `medium`, `high`, or `critical`.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "e0000000-0000-0000-0000-000000000001",
    "user_id": "a0000000-0000-0000-0000-000000000001",
    "title": "URL Scan: https://secure-login-pаypal.com/verify-account",
    "input_type": "url",
    "input_data": "https://secure-login-pаypal.com/verify-account",
    "status": "completed",
    "risk_score": 92.5,
    "risk_level": "critical",
    "summary": "High-confidence brand impersonation targeting PayPal.",
    "full_report": {
      "execution_time_ms": 342.18
    },
    "threat_indicators": [],
    "created_at": "2026-11-21T22:00:00Z",
    "updated_at": "2026-11-21T22:00:00Z"
  }
]
```

---

#### `GET /api/v1/investigations/{investigation_id}`
Drilldown into a specific case to view all associated Indicators of Compromise (IoCs).

**Response:** `200 OK`
```json
{
  "id": "e0000000-0000-0000-0000-000000000001",
  "user_id": "a0000000-0000-0000-0000-000000000001",
  "title": "URL Scan: https://secure-login-pаypal.com/verify-account",
  "input_type": "url",
  "input_data": "https://secure-login-pаypal.com/verify-account",
  "status": "completed",
  "risk_score": 92.5,
  "risk_level": "critical",
  "summary": "High-confidence brand impersonation targeting PayPal.",
  "full_report": {
    "execution_time_ms": 342.18
  },
  "threat_indicators": [
    {
      "type": "domain",
      "value": "secure-login-pаypal.com",
      "severity": "critical",
      "confidence": 0.98,
      "description": "Cyrillic homograph detected.",
      "source": "heuristics"
    }
  ],
  "created_at": "2026-11-21T22:00:00Z",
  "updated_at": "2026-11-21T22:00:00Z"
}
```

---

#### `DELETE /api/v1/investigations/{investigation_id}`
Permanently remove an investigation record and its cascaded indicators.

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Investigation e0000000-0000-0000-0000-000000000001 successfully deleted."
}
```

---

### 4.4 Threat Intelligence (`/api/v1/intelligence`)

#### `POST /api/v1/intelligence/domain`
Lookup domain reputation, DNS posture, and high-risk TLD heuristics.

**Request:**
```json
{
  "domain": "update-kyc-pan-online.top"
}
```

**Response:** `200 OK`
```json
{
  "target": "update-kyc-pan-online.top",
  "target_type": "domain",
  "is_malicious": true,
  "risk_score": 100.0,
  "categories": [
    "known_phishing_host",
    "suspicious_tld",
    "brand_impersonation"
  ],
  "reputation": "malicious",
  "dns_records": {
    "a_records": ["194.26.29.112"]
  },
  "rdap_info": null,
  "matched_rules": [
    "Domain 'update-kyc-pan-online.top' flagged in global threat feed",
    "High-abuse top level domain (.top)",
    "Credential or financial phishing keywords embedded in domain"
  ],
  "details": {}
}
```

---

#### `POST /api/v1/intelligence/ip`
Audit an IPv4 or IPv6 address against bulletproof hosting ranges, Tor exit nodes, and private subnet ranges.

**Request:**
```json
{
  "ip": "185.220.101.5"
}
```

**Response:** `200 OK`
```json
{
  "target": "185.220.101.5",
  "target_type": "ip",
  "is_malicious": true,
  "risk_score": 85.0,
  "categories": [
    "tor_exit_node",
    "anonymization_proxy"
  ],
  "reputation": "malicious",
  "dns_records": null,
  "rdap_info": null,
  "matched_rules": [
    "IP matches known Tor exit node or bulletproof subnet (185.220.101.0/24)"
  ],
  "details": {
    "ip_version": 4,
    "is_private": false
  }
}
```

---

#### `POST /api/v1/intelligence/url`
Enrich full URL with domain telemetry, directory depth risk, and suspicious download signatures.

**Request:**
```json
{
  "url": "http://telegram-crypto-task.icu/claim.apk"
}
```

**Response:** `200 OK`
```json
{
  "target": "http://telegram-crypto-task.icu/claim.apk",
  "target_type": "url",
  "is_malicious": true,
  "risk_score": 100.0,
  "categories": [
    "known_phishing_host",
    "suspicious_tld",
    "malicious_download"
  ],
  "reputation": "malicious",
  "dns_records": null,
  "rdap_info": null,
  "matched_rules": [
    "URL links directly to executable or installer payload (.apk)",
    "Domain flagged in global threat feed"
  ],
  "details": {}
}
```

---

### 4.5 Devices & Endpoint Posture (`/api/v1/devices`)

#### `POST /api/v1/devices/register`
Enroll a new mobile client or update hardware posture telemetry.

**Request:**
```json
{
  "device_name": "Pixel 8 Pro (Primary)",
  "device_type": "android",
  "os_version": "Android 14 (API 34)",
  "app_version": "1.0.0",
  "fcm_token": "fcm_token_sample_abc123",
  "security_posture": {
    "is_rooted": false,
    "selinux_enforcing": true,
    "developer_options_enabled": false,
    "verified_boot_state": "green"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "d0000000-0000-0000-0000-000000000001",
  "user_id": "a0000000-0000-0000-0000-000000000001",
  "device_name": "Pixel 8 Pro (Primary)",
  "device_type": "android",
  "os_version": "Android 14 (API 34)",
  "app_version": "1.0.0",
  "is_active": true,
  "last_active_at": "2026-11-21T22:35:00.000000Z",
  "security_status": {
    "is_rooted": false,
    "selinux_enforcing": true,
    "developer_options_enabled": false,
    "verified_boot_state": "green"
  },
  "created_at": "2026-11-21T22:35:00.000000Z"
}
```

---

#### `GET /api/v1/devices`
List all devices registered to the current authenticated account.

**Response:** `200 OK`
```json
[
  {
    "id": "d0000000-0000-0000-0000-000000000001",
    "user_id": "a0000000-0000-0000-0000-000000000001",
    "device_name": "Pixel 8 Pro (Primary)",
    "device_type": "android",
    "os_version": "Android 14 (API 34)",
    "app_version": "1.0.0",
    "is_active": true,
    "last_active_at": "2026-11-21T22:35:00.000000Z",
    "security_status": {
      "is_rooted": false
    },
    "created_at": "2026-11-21T22:35:00.000000Z"
  }
]
```

---

#### `GET /api/v1/devices/{device_id}/security`
Retrieve dynamic device health score and active endpoint alerts.

**Response:** `200 OK`
```json
{
  "device_id": "d0000000-0000-0000-0000-000000000001",
  "device_name": "Pixel 8 Pro (Primary)",
  "posture_score": 95,
  "status": "healthy",
  "anomalies": [],
  "audited_applications_count": 48,
  "last_telemetry_sync": "2026-11-21T22:35:00.000000Z"
}
```

---

### 4.6 Analytics & Posture Metrics (`/api/v1/analytics`)

#### `GET /api/v1/analytics/overview`
High-level security KPIs for the user dashboard.

**Response:** `200 OK`
```json
{
  "total_scans": 1284,
  "threats_blocked": 338,
  "clean_items": 942,
  "avg_risk_score": 28.4,
  "critical_alerts": 68
}
```

---

#### `GET /api/v1/analytics/threats`
Breakdown of detected threat categories, risk tiers, and input formats.

**Response:** `200 OK`
```json
{
  "risk_levels": {
    "safe": 820,
    "low": 122,
    "medium": 76,
    "high": 198,
    "critical": 68
  },
  "threat_categories": {
    "phishing": 142,
    "upi_fraud": 98,
    "banking_scam": 54,
    "kyc_scam": 32,
    "job_scam": 16,
    "lottery_scam": 0,
    "legitimate": 942
  },
  "input_types": {
    "url": 612,
    "message": 450,
    "image": 140,
    "qr": 82
  },
  "total_analyzed": 1284
}
```

---

#### `GET /api/v1/analytics/history`
Chronological activity feed of recent security evaluations.

**Response:** `200 OK`
```json
[
  {
    "id": "e0000000-0000-0000-0000-000000000001",
    "title": "URL Scan: https://secure-login-pаypal.com/verify-account",
    "input_type": "url",
    "risk_score": 92.5,
    "risk_level": "critical",
    "summary": "High-confidence brand impersonation targeting PayPal.",
    "created_at": "2026-11-21T22:00:00Z"
  }
]
```

---

### 4.7 User Settings (`/api/v1/settings`)

#### `GET /api/v1/settings`
Retrieve interface preferences and alert dispatch thresholds.

**Response:** `200 OK`
```json
{
  "user_id": "a0000000-0000-0000-0000-000000000001",
  "theme": "dark",
  "ai_analysis_depth": "standard",
  "auto_quarantine": false,
  "telemetry_enabled": true,
  "notification_preferences": {
    "email_alerts": true,
    "push_alerts": true,
    "sms_alerts": false,
    "min_severity_alert": "medium"
  },
  "custom_config": {}
}
```

---

#### `PUT /api/v1/settings`
Update workbench parameters and alert rules.

**Request:**
```json
{
  "theme": "dark",
  "ai_analysis_depth": "deep",
  "auto_quarantine": true,
  "email_alerts": true,
  "push_alerts": true
}
```

**Response:** `200 OK`
```json
{
  "user_id": "a0000000-0000-0000-0000-000000000001",
  "theme": "dark",
  "ai_analysis_depth": "deep",
  "auto_quarantine": true,
  "telemetry_enabled": true,
  "notification_preferences": {
    "email_alerts": true,
    "push_alerts": true,
    "sms_alerts": false,
    "min_severity_alert": "medium"
  },
  "custom_config": {}
}
```

---

### 4.8 Demonstration Battery (`/api/v1/demo`)

#### `GET /api/v1/demo/scenarios`
Retrieve catalog of built-in cybersecurity demonstration scenarios for hackathon presentations.

**Response:** `200 OK`
```json
[
  {
    "id": "scenario-1",
    "title": "Urgent Banking KYC Deactivation Phishing",
    "description": "High-severity SMS scam claiming bank account deactivation with an obfuscated external verification link.",
    "target_type": "message",
    "sample_data": "Dear SBI customer, your savings account #4102 has been suspended due to expired KYC...",
    "expected_threat": "kyc_scam",
    "severity": "critical"
  },
  {
    "id": "scenario-2",
    "title": "Deceptive UPI Cashback Reverse-Payment Trap",
    "description": "Exploits psychological urgency and reverse UPI PIN confusion to initiate unauthorized fund debits.",
    "target_type": "message",
    "sample_data": "Congratulations! You have received a cashback of Rs 5,000 on Google Pay for Diwali...",
    "expected_threat": "upi_fraud",
    "severity": "critical"
  },
  {
    "id": "scenario-3",
    "title": "Work-From-Home Telegram Task Investment Scam",
    "description": "Unsolicited part-time employment offer directing victim to encrypted channels for dummy task deposits.",
    "target_type": "message",
    "sample_data": "Amazon Hiring: Earn Rs 3,000 to Rs 8,000 daily part-time from home...",
    "expected_threat": "job_scam",
    "severity": "high"
  },
  {
    "id": "scenario-4",
    "title": "Cyrillic IDN Homograph PayPal Brand Impersonation",
    "description": "Lookalike domain spoofing PayPal using Unicode confusable Cyrillic small 'а' instead of ASCII 'a'.",
    "target_type": "url",
    "sample_data": "https://secure-login-pаypal.com/verify-account",
    "expected_threat": "phishing",
    "severity": "critical"
  },
  {
    "id": "scenario-5",
    "title": "Authentic Multi-Factor Authentication Verification",
    "description": "Clean, legitimate enterprise login OTP with clear expiration guidance and no phishing markers.",
    "target_type": "message",
    "sample_data": "Your Google verification code is 629401. It will expire in 10 minutes. Do not share this code with anyone.",
    "expected_threat": "legitimate",
    "severity": "safe"
  }
]
```

---

#### `POST /api/v1/demo/run/{scenario_id}`
Trigger live end-to-end swarm investigation on a selected scenario.

**Response:** `200 OK`
```json
{
  "scenario_id": "scenario-4",
  "title": "Cyrillic IDN Homograph PayPal Brand Impersonation",
  "scan_result": {
    "scan_id": "f5194a02-53b1-419b-a010-023a1990bc12",
    "target": "https://secure-login-pаypal.com/verify-account",
    "target_type": "url",
    "status": "completed",
    "risk_score": 92.5,
    "risk_level": "critical",
    "threat_category": "phishing",
    "summary": "Cyrillic homograph impersonation detected.",
    "indicators": [],
    "recommendations": [
      "Immediate Action: Block destination domain and report sender handle."
    ],
    "details": {},
    "created_at": "2026-11-21T22:36:00.000000Z"
  }
}
```
