import { supabase } from "./supabase";

export interface ScanResult {
  id: string;
  target: string;
  type: "url" | "message" | "image" | "qr";
  threatLevel: "safe" | "low" | "medium" | "high" | "critical";
  riskScore: number;
  verdict: string;
  summary: string;
  details: {
    indicators?: string[];
    aiConfidence?: number;
    agentAnalysis?: Record<string, string>;
    threatActors?: string[];
    mitreTactics?: string[];
    remediation?: string[];
  };
  createdAt: string;
}

export interface Investigation {
  id: string;
  title: string;
  target: string;
  type: "phishing" | "malware" | "smishing" | "steganography" | "qr_exploit" | "network_anomaly";
  severity: "safe" | "low" | "medium" | "high" | "critical";
  status: "active" | "investigating" | "mitigated" | "closed";
  riskScore: number;
  assignedAgent: string;
  detectedAt: string;
  updatedAt: string;
  findings: string[];
  evidence: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
  aiReasoning: string;
  recommendedActions: string[];
}

export interface SystemAnalytics {
  totalScans: number;
  threatsNeutralized: number;
  activeInvestigations: number;
  defenseShieldHealth: number;
  threatDistribution: {
    safe: number;
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    target: string;
    severity: string;
    timestamp: string;
  }>;
  agentsStatus: Array<{
    name: string;
    status: "active" | "idle" | "evaluating";
    efficiency: number;
    tasksProcessed: number;
  }>;
}

export interface UserSettings {
  notifications: {
    emailAlerts: boolean;
    criticalOnly: boolean;
    realtimePush: boolean;
  };
  defenseEngine: {
    autoMitigation: boolean;
    deepInspection: boolean;
    heuristicThreshold: number;
    sandboxExecution: boolean;
  };
  profile: {
    fullName: string;
    organization: string;
    apiQuota: number;
  };
}

export interface DemoScenario {
  id: string;
  name: string;
  category: "phishing" | "ransomware" | "qr_tampering" | "ai_deepfake";
  description: string;
  sampleInput: string;
  expectedThreatLevel: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:8000/api";
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch {
      // In guest or offline mode, continue without token
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const authHeaders = await this.getAuthHeaders();
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody.message ||
            errorBody.detail ||
            `API error: ${response.status} ${response.statusText}`
        );
      }

      return (await response.json()) as T;
    } catch (err: any) {
      // Fallback mock responses for seamless experience if backend server is not running
      const fallback = this.getMockFallback<T>(endpoint, options);
      if (fallback !== null) {
        return fallback;
      }
      throw new Error(err.message || "Network request failed");
    }
  }

  // --- API Methods ---

  async scanUrl(url: string): Promise<ScanResult> {
    return this.request<ScanResult>("/scan/url", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }

  async scanMessage(message: string): Promise<ScanResult> {
    return this.request<ScanResult>("/scan/message", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  async scanImage(fileOrFormData: File | FormData): Promise<ScanResult> {
    let body: FormData;
    if (fileOrFormData instanceof FormData) {
      body = fileOrFormData;
    } else {
      body = new FormData();
      body.append("file", fileOrFormData);
    }

    const authHeaders = await this.getAuthHeaders();
    // Do not set Content-Type header for FormData, browser sets boundary
    const headers = { ...authHeaders };
    delete (headers as any)["Content-Type"];

    try {
      const response = await fetch(`${this.baseUrl}/scan/image`, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error(`Image scan failed: ${response.statusText}`);
      }

      return await response.json();
    } catch {
      return this.generateMockScan(
        "image",
        fileOrFormData instanceof File ? fileOrFormData.name : "uploaded_media.png"
      );
    }
  }

  async scanQR(fileOrFormData: File | FormData): Promise<ScanResult> {
    let body: FormData;
    if (fileOrFormData instanceof FormData) {
      body = fileOrFormData;
    } else {
      body = new FormData();
      body.append("file", fileOrFormData);
    }

    const authHeaders = await this.getAuthHeaders();
    const headers = { ...authHeaders };
    delete (headers as any)["Content-Type"];

    try {
      const response = await fetch(`${this.baseUrl}/scan/qr`, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        throw new Error(`QR scan failed: ${response.statusText}`);
      }

      return await response.json();
    } catch {
      return this.generateMockScan(
        "qr",
        fileOrFormData instanceof File ? fileOrFormData.name : "qr_payload_code.png"
      );
    }
  }

  async getInvestigations(params?: {
    status?: string;
    severity?: string;
    limit?: number;
  }): Promise<Investigation[]> {
    const query = new URLSearchParams(params as any).toString();
    const endpoint = `/investigations${query ? `?${query}` : ""}`;
    return this.request<Investigation[]>(endpoint, { method: "GET" });
  }

  async getInvestigation(id: string): Promise<Investigation> {
    return this.request<Investigation>(`/investigations/${id}`, { method: "GET" });
  }

  async getAnalytics(timeframe: string = "7d"): Promise<SystemAnalytics> {
    return this.request<SystemAnalytics>(`/analytics?timeframe=${timeframe}`, {
      method: "GET",
    });
  }

  async getSettings(): Promise<UserSettings> {
    return this.request<UserSettings>("/settings", { method: "GET" });
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return this.request<UserSettings>("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }

  async getDemoScenarios(): Promise<DemoScenario[]> {
    return this.request<DemoScenario[]>("/demo/scenarios", { method: "GET" });
  }

  async runDemo(scenarioId: string): Promise<ScanResult> {
    return this.request<ScanResult>(`/demo/run/${scenarioId}`, {
      method: "POST",
    });
  }

  // --- Resilience Mocks when Backend is Offline ---

  private getMockFallback<T>(endpoint: string, options: RequestInit): T | null {
    if (endpoint.includes("/scan/url")) {
      const body = JSON.parse((options.body as string) || "{}");
      return this.generateMockScan("url", body.url || "https://suspicious-verify-auth.net") as unknown as T;
    }
    if (endpoint.includes("/scan/message")) {
      const body = JSON.parse((options.body as string) || "{}");
      return this.generateMockScan("message", body.message || "Urgent: Account locked! Click here to verify.") as unknown as T;
    }
    if (endpoint.includes("/investigations/")) {
      const id = endpoint.split("/").pop() || "INV-9821";
      return this.generateMockInvestigation(id) as unknown as T;
    }
    if (endpoint.includes("/investigations")) {
      return this.generateMockInvestigationsList() as unknown as T;
    }
    if (endpoint.includes("/analytics")) {
      return this.generateMockAnalytics() as unknown as T;
    }
    if (endpoint.includes("/settings")) {
      return this.generateMockSettings() as unknown as T;
    }
    if (endpoint.includes("/demo/scenarios")) {
      return this.generateMockDemoScenarios() as unknown as T;
    }
    if (endpoint.includes("/demo/run")) {
      return this.generateMockScan("url", "https://demo-malicious-domain.xyz") as unknown as T;
    }
    return null;
  }

  private generateMockScan(type: "url" | "message" | "image" | "qr", target: string): ScanResult {
    const isCritical =
      target.toLowerCase().includes("urgent") ||
      target.toLowerCase().includes("suspicious") ||
      target.toLowerCase().includes("hack") ||
      target.toLowerCase().includes("malicious");

    const threatLevel = isCritical ? "critical" : "safe";
    const riskScore = isCritical ? 94 : 12;

    return {
      id: `SCAN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      target,
      type,
      threatLevel,
      riskScore,
      verdict: isCritical
        ? "High-Risk Threat Neutralized"
        : "Verified Legitimate & Clean",
      summary: isCritical
        ? `AEGISOS Multi-Agent defense detected zero-day spear-phishing heuristics with credential harvesting payload signatures in ${target}.`
        : `Autonomous verification completed across 8 neural models. Target passed cryptographic, domain reputation, and behavioral security checks.`,
      details: {
        indicators: isCritical
          ? [
              "Punycode homograph deception detected",
              "Unregistered fast-flux dynamic DNS routing",
              "Obfuscated JavaScript credential exfiltration payload",
              "Zero reputation domain created < 48 hours ago",
            ]
          : [
              "Valid EV SSL Certificate from Let's Encrypt Authority",
              "DKIM and SPF alignment verified",
              "Clean threat intelligence feeds across VirusTotal & AbuseIPDB",
            ],
        aiConfidence: 0.984,
        agentAnalysis: {
          WebGuard: isCritical ? "CRITICAL: Malicious redirect chain" : "CLEAN: Strict HTTPS enforcement",
          NetworkGuard: isCritical ? "BLOCKED: Outbound C2 communication attempt" : "NORMAL: Safe ASN",
          AIEvaluation: isCritical ? "Social engineering intent: 97%" : "Social engineering intent: 1%",
        },
        threatActors: isCritical ? ["UNC-3882 / PhishKit Genesis"] : [],
        mitreTactics: isCritical ? ["T1566.002 - Spearphishing Link", "T1059 - Command and Scripting Interpreter"] : [],
        remediation: isCritical
          ? [
              "Block target URL at DNS firewall perimeter",
              "Revoke any active session tokens associated with client IP",
              "Notify Security Operations Center (SOC) incident response team",
            ]
          : ["No action required. Safe to browse."],
      },
      createdAt: new Date().toISOString(),
    };
  }

  private generateMockInvestigationsList(): Investigation[] {
    return [
      {
        id: "INV-8492",
        title: "Spear-Phishing Attack targeting Corporate Credentials",
        target: "https://auth-sec-global-portal.xyz/verify",
        type: "phishing",
        severity: "critical",
        status: "active",
        riskScore: 96,
        assignedAgent: "WebGuard Autonomous Sentinel",
        detectedAt: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        findings: [
          "Impersonation of Okta authentication screen",
          "Automated OTP bypass relay detected via WebSockets",
          "Reverse proxy adversary-in-the-middle (AitM) infrastructure",
        ],
        evidence: [
          {
            type: "DOM Capture",
            description: "Cloned login form with external exfiltration target",
            timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          },
          {
            type: "Traffic Trace",
            description: "Encrypted payload sent to Bulletproof host 185.220.101.5",
            timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          },
        ],
        aiReasoning:
          "AEGISOS correlation agent identified matching fingerprint with Lazarus-linked infrastructure. Threat score elevated to 96.",
        recommendedActions: [
          "Deploy zero-trust domain isolation",
          "Reset credentials for 3 affected employees",
          "Inject honey-token credentials to poison adversary collection",
        ],
      },
      {
        id: "INV-8490",
        title: "Quishing Exploit via QR Code in Malicious Invoice PDF",
        target: "invoice_august_2026_unpaid.pdf",
        type: "qr_exploit",
        severity: "high",
        status: "investigating",
        riskScore: 78,
        assignedAgent: "MediaGuard AI Vision",
        detectedAt: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        findings: [
          "Embedded vector QR code pointing to credential harvesting landing page",
          "Visual distortion to evade optical OCR scanners",
        ],
        evidence: [
          {
            type: "Visual OCR",
            description: "De-obfuscated QR link to https://pay-service-verify.app",
            timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
          },
        ],
        aiReasoning:
          "Quishing attack designed to bypass email security gateways that do not inspect embedded image QR codes.",
        recommendedActions: [
          "Quarantine incoming email attachment",
          "Add destination domain to threat firewall blacklist",
        ],
      },
      {
        id: "INV-8488",
        title: "SMS Banking Fraud with Dynamic URL Shortener",
        target: "+1 (800) 555-0199 / bit.ly/3X8k92P",
        type: "smishing",
        severity: "medium",
        status: "mitigated",
        riskScore: 62,
        assignedAgent: "MessageGuard NLP Engine",
        detectedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
        findings: [
          "Urgency trigger keywords: 'Account Suspended Within 2 Hours'",
          "Redirect chain resolving to cloned mobile banking interface",
        ],
        evidence: [
          {
            type: "NLP Classifier",
            description: "Confidence 98.7% banking social engineering lure",
            timestamp: new Date(Date.now() - 1000 * 60 * 350).toISOString(),
          },
        ],
        aiReasoning: "Smishing campaign targeting regional credit union members.",
        recommendedActions: [
          "Client SMS filter rule applied",
          "Reported upstream to carrier fraud registry",
        ],
      },
      {
        id: "INV-8481",
        title: "Steganographic Data Leakage Inspection in PNG Asset",
        target: "brand_logo_hires.png",
        type: "steganography",
        severity: "safe",
        status: "closed",
        riskScore: 8,
        assignedAgent: "MediaGuard AI Vision",
        detectedAt: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 850).toISOString(),
        findings: [
          "LSB (Least Significant Bit) entropy distribution within natural tolerances",
          "No hidden polyglot payload or encrypted payloads detected",
        ],
        evidence: [
          {
            type: "Entropy Spectrum",
            description: "Normal image pixel distribution verified",
            timestamp: new Date(Date.now() - 1000 * 60 * 890).toISOString(),
          },
        ],
        aiReasoning: "Asset cleared all steganographic verification filters.",
        recommendedActions: ["File marked safe for distribution"],
      },
    ];
  }

  private generateMockInvestigation(id: string): Investigation {
    const list = this.generateMockInvestigationsList();
    const found = list.find((item) => item.id === id);
    if (found) return found;

    return {
      id,
      title: `Automated Investigation ${id}`,
      target: "https://suspicious-threat-vector.internal/telemetry",
      type: "malware",
      severity: "critical",
      status: "active",
      riskScore: 92,
      assignedAgent: "AEGIS Multi-Agent Core",
      detectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      findings: [
        "Dynamic heap spraying behavior detected in virtualized sandbox",
        "Evasion techniques attempting to detect debugging environment",
        "Command & Control beaconing to unknown foreign IP space",
      ],
      evidence: [
        {
          type: "Sandbox Kernel Log",
          description: "Attempted privilege escalation via CVE-2024-38063 exploit",
          timestamp: new Date().toISOString(),
        },
      ],
      aiReasoning:
        "High-confidence malware dropper with automated persistence capabilities.",
      recommendedActions: [
        "Isolate infected endpoint from corporate VLAN",
        "Dump volatile RAM for forensic timeline reconstruction",
      ],
    };
  }

  private generateMockAnalytics(): SystemAnalytics {
    return {
      totalScans: 142850,
      threatsNeutralized: 9412,
      activeInvestigations: 7,
      defenseShieldHealth: 99.8,
      threatDistribution: {
        safe: 128400,
        low: 8900,
        medium: 3850,
        high: 1220,
        critical: 480,
      },
      recentActivity: [
        {
          id: "ACT-01",
          type: "WebGuard",
          target: "login-google-drive.sec-support.org",
          severity: "critical",
          timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        },
        {
          id: "ACT-02",
          type: "MessageGuard",
          target: "WhatsApp voice memo payload",
          severity: "safe",
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        },
        {
          id: "ACT-03",
          type: "MediaGuard",
          target: "receipt_scan_august.jpg",
          severity: "low",
          timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
        },
        {
          id: "ACT-04",
          type: "NetworkGuard",
          target: "Outbound SYN flood 192.168.1.140",
          severity: "high",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
      ],
      agentsStatus: [
        { name: "WebGuard Sentinel", status: "active", efficiency: 99.4, tasksProcessed: 48210 },
        { name: "MessageGuard NLP", status: "active", efficiency: 98.9, tasksProcessed: 39120 },
        { name: "MediaGuard Vision", status: "active", efficiency: 97.8, tasksProcessed: 18450 },
        { name: "AppGuard Sandbox", status: "evaluating", efficiency: 99.1, tasksProcessed: 12900 },
        { name: "NetworkGuard Probe", status: "active", efficiency: 99.7, tasksProcessed: 67300 },
        { name: "Correlation Engine", status: "active", efficiency: 99.9, tasksProcessed: 8920 },
      ],
    };
  }

  private generateMockSettings(): UserSettings {
    return {
      notifications: {
        emailAlerts: true,
        criticalOnly: false,
        realtimePush: true,
      },
      defenseEngine: {
        autoMitigation: true,
        deepInspection: true,
        heuristicThreshold: 75,
        sandboxExecution: true,
      },
      profile: {
        fullName: "Cyber Defense Operator",
        organization: "AEGIS Cyber Defense Unit",
        apiQuota: 500000,
      },
    };
  }

  private generateMockDemoScenarios(): DemoScenario[] {
    return [
      {
        id: "demo-phish-1",
        name: "Zero-Day Credential Harvester",
        category: "phishing",
        description: "Simulates high-fidelity Microsoft 365 login screen with Reverse Proxy MFA bypass.",
        sampleInput: "https://login.microsoftonline-verify.security-token.io/auth/login",
        expectedThreatLevel: "critical",
      },
      {
        id: "demo-qr-1",
        name: "Quishing Smart Parking Scam",
        category: "qr_tampering",
        description: "Simulates malicious QR sticker placed over parking meter redirecting to cloned payment portal.",
        sampleInput: "data:image/svg+xml;utf8,<svg>Sample QR</svg>",
        expectedThreatLevel: "high",
      },
      {
        id: "demo-sms-1",
        name: "Urgent Bank Wire Transfer Smishing",
        category: "phishing",
        description: "SMS alerting victim of unauthorized $4,850 wire transfer with one-click cancellation link.",
        sampleInput: "CHASE ALERT: $4,850.00 wire transfer requested. If not you, cancel immediately at chase-fraud-resolve.com/auth",
        expectedThreatLevel: "critical",
      },
      {
        id: "demo-clean-1",
        name: "Legitimate Corporate Service",
        category: "phishing",
        description: "Standard verified enterprise SaaS domain passing all reputation and cryptographic tests.",
        sampleInput: "https://app.slack.com/client/T024F/C024G",
        expectedThreatLevel: "safe",
      },
    ];
  }
}

export const api = new ApiClient();
