// AEGISOS Comprehensive Mock Data System
// Believable security monitoring scenario over 30 days with ~50 investigations

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'url' | 'message' | 'qr' | 'device' | 'network' | 'system';
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  source: string;
}

export interface ProtectionModule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'warning';
  lastActivity: string;
  iconName: string;
  threatsIntercepted: number;
}

export interface InvestigationStep {
  agent: string;
  role: string;
  finding: string;
  duration: string;
  status: 'complete' | 'running' | 'pending';
  severity: 'critical' | 'high' | 'warning' | 'info' | 'success';
}

export interface ThreatIndicator {
  type: 'domain' | 'ip' | 'hash' | 'pattern' | 'wallet';
  value: string;
  reputation: 'malicious' | 'suspicious' | 'clean';
  confidence: number;
  matchedList?: string;
}

export interface InvestigationItem {
  id: string;
  type: 'url' | 'message' | 'image' | 'qr' | 'app';
  inputPreview: string;
  fullInput?: string;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  threatCategory: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'flagged' | 'mitigated';
  summary: string;
  steps: InvestigationStep[];
  indicators: ThreatIndicator[];
  matchedPatterns: string[];
  recommendations: string[];
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'Android' | 'iOS' | 'macOS' | 'Windows';
  osVersion: string;
  model: string;
  status: 'protected' | 'warning' | 'vulnerable';
  lastSeen: string;
  ipAddress: string;
  battery: number;
  agentVersion: string;
  riskScore: number;
  appsAudited: number;
  riskyPermissionsCount: number;
  auditedApps: {
    name: string;
    packageName: string;
    risk: 'high' | 'medium' | 'low';
    permissions: string[];
    riskReason: string;
  }[];
  permissionRisks: {
    permission: string;
    severity: 'critical' | 'warning' | 'info';
    grantedAppsCount: number;
    description: string;
  }[];
  networkStatus: {
    ssid: string;
    bssid: string;
    security: 'WPA3' | 'WPA2' | 'Open' | 'WEP';
    isVpnActive: boolean;
    dnsOverHttps: boolean;
    threatsBlockedToday: number;
  };
}

export interface ThreatIntelligenceItem {
  id: string;
  type: 'domain' | 'url' | 'ip' | 'hash';
  value: string;
  category: string;
  severity: 'critical' | 'warning' | 'info';
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  tags: string[];
  source: string;
  status: 'active' | 'mitigated' | 'monitoring';
}

// -------------------------------------------------------------
// 1. Overview & Trust Score Data
// -------------------------------------------------------------
export const mockTrustScore = {
  current: 88,
  previous: 82,
  change: +6,
  grade: 'Optimal Security Posture',
  factors: [
    { name: 'DNS Filtering', score: 95, weight: 'High' },
    { name: 'Agent Consensus', score: 92, weight: 'High' },
    { name: 'Device Hardening', score: 85, weight: 'Medium' },
    { name: 'Threat Exposure Rate', score: 80, weight: 'Critical' },
  ],
};

export const mockOverviewStats = [
  {
    label: 'Total Investigations',
    value: 1284,
    change: '+14.2%',
    trend: 'up' as const,
    subtext: 'vs last month (1,124)',
    color: '#00E5FF',
  },
  {
    label: 'Threats Detected',
    value: 342,
    change: '-5.1%',
    trend: 'down' as const,
    subtext: '68 critical incidents',
    color: '#FFB020',
  },
  {
    label: 'Threats Blocked',
    value: 338,
    change: '+18.6%',
    trend: 'up' as const,
    subtext: '98.8% mitigation rate',
    color: '#00D68F',
  },
  {
    label: 'Active Protections',
    value: 6,
    max: 6,
    change: '100%',
    trend: 'up' as const,
    subtext: 'All security nodes online',
    color: '#7C4DFF',
  },
];

export const mockProtectionModules: ProtectionModule[] = [
  {
    id: 'webguard',
    name: 'WebGuard',
    description: 'Zero-day phishing & malicious DNS interception',
    status: 'active',
    lastActivity: '2 mins ago',
    iconName: 'Globe',
    threatsIntercepted: 142,
  },
  {
    id: 'messageguard',
    name: 'MessageGuard',
    description: 'Real-time SMS & messaging fraud heuristic analysis',
    status: 'active',
    lastActivity: '4 mins ago',
    iconName: 'MessageSquare',
    threatsIntercepted: 98,
  },
  {
    id: 'mediaguard',
    name: 'MediaGuard',
    description: 'QR Code payload analysis & visual steganography detection',
    status: 'active',
    lastActivity: '12 mins ago',
    iconName: 'QrCode',
    threatsIntercepted: 45,
  },
  {
    id: 'appguard',
    name: 'AppGuard',
    description: 'Android APK permission audit & runtime behavioral sandbox',
    status: 'active',
    lastActivity: '18 mins ago',
    iconName: 'Smartphone',
    threatsIntercepted: 27,
  },
  {
    id: 'networkguard',
    name: 'NetworkGuard',
    description: 'Rogue Wi-Fi access point & TLS MITM evasion firewall',
    status: 'active',
    lastActivity: '5 mins ago',
    iconName: 'Wifi',
    threatsIntercepted: 19,
  },
  {
    id: 'ai-engine',
    name: 'AI Engine',
    description: 'Multi-Agent LLM swarm consensus with low-latency voting',
    status: 'active',
    lastActivity: '1 min ago',
    iconName: 'Cpu',
    threatsIntercepted: 312,
  },
];

export const mockRecentEvents: SecurityEvent[] = [
  {
    id: 'EV-8821',
    timestamp: '2 mins ago',
    type: 'url',
    severity: 'critical',
    title: 'Credential Harvester Blocked',
    description: 'Intercepted spoofed login targeting login-chase-security-auth.net',
    source: 'WebGuard Gateway',
  },
  {
    id: 'EV-8820',
    timestamp: '14 mins ago',
    type: 'message',
    severity: 'critical',
    title: 'Smishing Campaign Quarantined',
    description: 'Detected urgent tax refund scam SMS impersonating IRS treasury notice',
    source: 'MessageGuard Heuristics',
  },
  {
    id: 'EV-8819',
    timestamp: '32 mins ago',
    type: 'qr',
    severity: 'warning',
    title: 'Suspicious QR Payment Payload',
    description: 'QR redirection chain detected masking crypto drainer contract',
    source: 'MediaGuard Scanner',
  },
  {
    id: 'EV-8818',
    timestamp: '1 hour ago',
    type: 'device',
    severity: 'warning',
    title: 'Excessive App Permissions Flagged',
    description: 'Package "FastClean_Pro.apk" requested accessibility and notification listener',
    source: 'AppGuard Android',
  },
  {
    id: 'EV-8817',
    timestamp: '2 hours ago',
    type: 'network',
    severity: 'info',
    title: 'TLS Downgrade Probe Rejected',
    description: 'Public Wi-Fi router attempted SSL stripping probe on gateway proxy',
    source: 'NetworkGuard',
  },
  {
    id: 'EV-8816',
    timestamp: '3 hours ago',
    type: 'url',
    severity: 'success',
    title: 'Clean Domain Verified',
    description: 'Automated deep check confirmed legitimacy of auth.stanford.edu/cas',
    source: 'AI Consensus Engine',
  },
  {
    id: 'EV-8815',
    timestamp: '5 hours ago',
    type: 'system',
    severity: 'info',
    title: 'Threat Intel Feed Updated',
    description: 'Synchronized 14,200 new domain indicators from global honey pots',
    source: 'Intelligence Ingestion',
  },
  {
    id: 'EV-8814',
    timestamp: '7 hours ago',
    type: 'message',
    severity: 'critical',
    title: 'Banking Impersonation Prevented',
    description: 'Blocked WhatsApp fake OTP prompt mimicking Wells Fargo fraud dept',
    source: 'MessageGuard',
  },
  {
    id: 'EV-8813',
    timestamp: '9 hours ago',
    type: 'url',
    severity: 'warning',
    title: 'Typosquatting Trap Intercepted',
    description: 'Domain "cornbase-verify.com" categorized as phishing clone',
    source: 'WebGuard DNS',
  },
  {
    id: 'EV-8812',
    timestamp: '11 hours ago',
    type: 'device',
    severity: 'info',
    title: 'Device Security Audit Completed',
    description: 'Pixel 8 Pro completed full APK hash registry scan: 0 critical vulnerabilities',
    source: 'AppGuard Android',
  },
];

export const mockThreatDistribution = [
  { name: 'Credential Harvesting', value: 124, percentage: 36, color: '#FF4560' },
  { name: 'SMS / Smishing Scams', value: 88, percentage: 26, color: '#00E5FF' },
  { name: 'Malicious QR Redirection', value: 45, percentage: 13, color: '#7C4DFF' },
  { name: 'Rogue APK & Malware', value: 38, percentage: 11, color: '#FFB020' },
  { name: 'Impersonation / Vishing', value: 29, percentage: 8, color: '#00D68F' },
  { name: 'Network MITM Probes', value: 18, percentage: 6, color: '#8794A8' },
];

export const mockRiskTrend30Days = [
  { date: 'Oct 23', riskScore: 24, threatsDetected: 8, investigationsCount: 38 },
  { date: 'Oct 24', riskScore: 28, threatsDetected: 11, investigationsCount: 42 },
  { date: 'Oct 25', riskScore: 22, threatsDetected: 7, investigationsCount: 36 },
  { date: 'Oct 26', riskScore: 35, threatsDetected: 14, investigationsCount: 48 },
  { date: 'Oct 27', riskScore: 40, threatsDetected: 19, investigationsCount: 52 },
  { date: 'Oct 28', riskScore: 31, threatsDetected: 12, investigationsCount: 45 },
  { date: 'Oct 29', riskScore: 26, threatsDetected: 9, investigationsCount: 40 },
  { date: 'Oct 30', riskScore: 29, threatsDetected: 10, investigationsCount: 43 },
  { date: 'Oct 31', riskScore: 48, threatsDetected: 22, investigationsCount: 65 },
  { date: 'Nov 01', riskScore: 42, threatsDetected: 18, investigationsCount: 58 },
  { date: 'Nov 02', riskScore: 33, threatsDetected: 13, investigationsCount: 49 },
  { date: 'Nov 03', riskScore: 25, threatsDetected: 8, investigationsCount: 39 },
  { date: 'Nov 04', riskScore: 20, threatsDetected: 6, investigationsCount: 35 },
  { date: 'Nov 05', riskScore: 28, threatsDetected: 11, investigationsCount: 44 },
  { date: 'Nov 06', riskScore: 38, threatsDetected: 16, investigationsCount: 54 },
  { date: 'Nov 07', riskScore: 32, threatsDetected: 12, investigationsCount: 48 },
  { date: 'Nov 08', riskScore: 29, threatsDetected: 10, investigationsCount: 41 },
  { date: 'Nov 09', riskScore: 21, threatsDetected: 7, investigationsCount: 37 },
  { date: 'Nov 10', riskScore: 19, threatsDetected: 5, investigationsCount: 34 },
  { date: 'Nov 11', riskScore: 27, threatsDetected: 10, investigationsCount: 42 },
  { date: 'Nov 12', riskScore: 34, threatsDetected: 15, investigationsCount: 50 },
  { date: 'Nov 13', riskScore: 46, threatsDetected: 20, investigationsCount: 61 },
  { date: 'Nov 14', riskScore: 52, threatsDetected: 24, investigationsCount: 68 },
  { date: 'Nov 15', riskScore: 39, threatsDetected: 17, investigationsCount: 55 },
  { date: 'Nov 16', riskScore: 30, threatsDetected: 12, investigationsCount: 46 },
  { date: 'Nov 17', riskScore: 23, threatsDetected: 8, investigationsCount: 39 },
  { date: 'Nov 18', riskScore: 18, threatsDetected: 6, investigationsCount: 33 },
  { date: 'Nov 19', riskScore: 22, threatsDetected: 8, investigationsCount: 41 },
  { date: 'Nov 20', riskScore: 15, threatsDetected: 4, investigationsCount: 36 },
  { date: 'Nov 21', riskScore: 12, threatsDetected: 3, investigationsCount: 29 },
];

// -------------------------------------------------------------
// 2. Realistic 50 Investigations Dataset
// -------------------------------------------------------------
const rawSampleTemplates = [
  {
    type: 'url' as const,
    inputPreview: 'https://login-chase-online-verify-security.cc/auth',
    fullInput: 'https://login-chase-online-verify-security.cc/auth?session=928a-f823&account_state=locked',
    riskScore: 96,
    riskLevel: 'critical' as const,
    threatCategory: 'Credential Harvester',
    summary: 'Detected active lookalike phishing campaign replicating Chase Online banking login. Features TLS certificate spoofing and malicious credential forwarding webhook.',
    indicators: [
      { type: 'domain' as const, value: 'login-chase-online-verify-security.cc', reputation: 'malicious' as const, confidence: 99, matchedList: 'PhishTank ZeroDay' },
      { type: 'ip' as const, value: '185.193.125.44', reputation: 'malicious' as const, confidence: 94, matchedList: 'AbuseIPDB Bulletproof ASN' },
      { type: 'pattern' as const, value: 'Discord Webhook Exfiltration Hook', reputation: 'malicious' as const, confidence: 98 },
    ],
    matchedPatterns: ['Lookalike Chase banking brand tokens', 'Recently registered registrar (< 48 hrs)', 'Cloudflare origin bypass attempts', 'Telegram bot automated credential collector'],
    recommendations: ['Block domain across enterprise DNS resolvers', 'Invalidate any active bank authentication tokens', 'Submit registrar takedown to NameCheap Abuse', 'Notify fraud security operations'],
  },
  {
    type: 'message' as const,
    inputPreview: 'USPS: We tried to deliver your parcel #US89218 but unpaid postage ($1.95) is required...',
    fullInput: 'USPS Alert: Your package #US89218 cannot be delivered due to an incomplete street address. Please update your details and pay the $1.95 redelivery charge within 12 hours: https://usps-redelivery-postage.top/track',
    riskScore: 92,
    riskLevel: 'critical' as const,
    threatCategory: 'Smishing Scam',
    summary: 'Widespread postal smishing scam exploiting artificial urgency and low-dollar payment traps to harvest primary credit card numbers and CVV codes.',
    indicators: [
      { type: 'domain' as const, value: 'usps-redelivery-postage.top', reputation: 'malicious' as const, confidence: 98, matchedList: 'USPS Impersonation Blacklist' },
      { type: 'pattern' as const, value: 'SMS Urgent Deadline Heuristic', reputation: 'suspicious' as const, confidence: 91 },
    ],
    matchedPatterns: ['High-frequency delivery scam lexicon', 'Unregistered top-level domain (.top)', 'Credit card input field injection in payload'],
    recommendations: ['Quarantine SMS sender on device', 'Do not click or enter billing information', 'Report sender phone number to 7726 (SPAM)', 'Enable carrier-level anti-smishing filter'],
  },
  {
    type: 'qr' as const,
    inputPreview: 'QR Code parsed: ethereum:0x71C.../transfer?amount=2.5&token=USDT',
    fullInput: 'ethereum:0x71C.../transfer?amount=2.5&token=USDT&redirect_url=https://airdrop-claim-dapp.io',
    riskScore: 89,
    riskLevel: 'critical' as const,
    threatCategory: 'Crypto Wallet Drainer',
    summary: 'QR code decodes to an obfuscated ERC-20 permit signature request designed to drain entire token balances upon transaction approval.',
    indicators: [
      { type: 'wallet' as const, value: '0x71C...B42E', reputation: 'malicious' as const, confidence: 96, matchedList: 'Chainalysis Scam Registry' },
      { type: 'domain' as const, value: 'airdrop-claim-dapp.io', reputation: 'malicious' as const, confidence: 93 },
    ],
    matchedPatterns: ['Permit2 gasless approval exploit', 'Disguised transfer recipient address', 'Obfuscated QR metadata tags'],
    recommendations: ['Reject transaction request in Web3 wallet', 'Revoke permissions using Revoke.cash', 'Report QR source poster', 'Add contract address to AEGISOS blacklist'],
  },
  {
    type: 'image' as const,
    inputPreview: 'Screenshot of urgent Microsoft 365 Password Expiration Notice',
    fullInput: 'OCR Text: "MICROSOFT CORP: Your work email password expires in 15 minutes. Scan below QR to authenticate: auth-m365-keepalive.me"',
    riskScore: 86,
    riskLevel: 'high' as const,
    threatCategory: 'Quishing / Visual Phishing',
    summary: 'Visual quishing email screenshot embedding QR code to bypass traditional text-based email perimeter filters.',
    indicators: [
      { type: 'domain' as const, value: 'auth-m365-keepalive.me', reputation: 'malicious' as const, confidence: 95 },
      { type: 'pattern' as const, value: 'Microsoft Brand Imagery Steal', reputation: 'suspicious' as const, confidence: 89 },
    ],
    matchedPatterns: ['Visual logo spoofing (Microsoft 365)', 'Embedded QR code bypassing NLP inspection', 'Urgent expiration timer tactic'],
    recommendations: ['Do not scan QR code with personal phone', 'Submit email artifact to SOC security mailbox', 'Reset corporate directory credentials if scanned'],
  },
  {
    type: 'url' as const,
    inputPreview: 'https://paypal-customer-resolution-center.info/dispute',
    fullInput: 'https://paypal-customer-resolution-center.info/dispute?case_id=PP-990-21&user_auth=required',
    riskScore: 94,
    riskLevel: 'critical' as const,
    threatCategory: 'Credential Harvester',
    summary: 'PayPal impersonation site mimicking security resolution center. Collects SSN, date of birth, and banking details.',
    indicators: [
      { type: 'domain' as const, value: 'paypal-customer-resolution-center.info', reputation: 'malicious' as const, confidence: 99 },
      { type: 'ip' as const, value: '91.215.85.12', reputation: 'malicious' as const, confidence: 90 },
    ],
    matchedPatterns: ['PayPal brand assets hosted on unauthorized CDN', 'Form input requesting full SSN', 'Let\'s Encrypt certificate generated 6 hours ago'],
    recommendations: ['Block URL on company gateway', 'Report to PayPal Anti-Phishing (spoof@paypal.com)', 'Verify account directly via paypal.com'],
  },
  {
    type: 'message' as const,
    inputPreview: 'MOM EMERGENCY: My phone broke and I am messaging from a friend. Please pay this bill urgently...',
    fullInput: 'Hi Mom, my phone fell into water and is completely dead. This is my temporary number. Can you please pay this urgent invoice of $840 for my rent before 5pm? Wire to account: 8820-1920-33',
    riskScore: 84,
    riskLevel: 'high' as const,
    threatCategory: 'Family Impersonation Scam',
    summary: 'High-sentiment social engineering scam targeting parental empathy with fake broken phone narrative and wire transfer request.',
    indicators: [
      { type: 'pattern' as const, value: 'Family Emergency Wire Heuristic', reputation: 'suspicious' as const, confidence: 95 },
      { type: 'pattern' as const, value: 'VoIP Virtual Number Carrier', reputation: 'suspicious' as const, confidence: 88 },
    ],
    matchedPatterns: ['Broken phone narrative trigger', 'Immediate peer-to-peer wire demand', 'Known WhatsApp family fraud vector'],
    recommendations: ['Call child on their regular phone or voice verify directly', 'Do not send funds via wire or Zelle', 'Block and report virtual phone number'],
  },
  {
    type: 'app' as const,
    inputPreview: 'CleanMaster_RAM_Booster.apk',
    fullInput: 'Package: com.clean.booster.fastram (SHA256: 4f9812ba...39c0)',
    riskScore: 78,
    riskLevel: 'high' as const,
    threatCategory: 'Adware & Excessive Permissions',
    summary: 'Disguised optimization utility requesting SYSTEM_ALERT_WINDOW, READ_SMS, and ACCESS_FINE_LOCATION without functional necessity.',
    indicators: [
      { type: 'hash' as const, value: '4f9812ba98...39c0', reputation: 'suspicious' as const, confidence: 85, matchedList: 'VirusTotal 14/70 engines' },
      { type: 'pattern' as const, value: 'Excessive SMS Access Requested', reputation: 'malicious' as const, confidence: 92 },
    ],
    matchedPatterns: ['Accessibility service keystroke logging capability', 'Background persistent foreground service without notification', 'Dynamic dex loading from remote C2'],
    recommendations: ['Uninstall APK immediately', 'Revoke Android Accessibility and SMS permissions', 'Run full local AppGuard filesystem audit'],
  },
  {
    type: 'url' as const,
    inputPreview: 'https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform',
    fullInput: 'https://docs.google.com/forms/d/e/1FAIpQLSc882.../viewform?usp=sf_link',
    riskScore: 68,
    riskLevel: 'medium' as const,
    threatCategory: 'Abuse of Legitimate SaaS',
    summary: 'Google Forms hosted document styled to collect internal employee corporate network credentials.',
    indicators: [
      { type: 'domain' as const, value: 'docs.google.com', reputation: 'clean' as const, confidence: 99 },
      { type: 'pattern' as const, value: 'Credential Harvesting on Public Form', reputation: 'suspicious' as const, confidence: 87 },
    ],
    matchedPatterns: ['Employee portal password field on public Google Form', 'Hosted on legitimate SaaS domain to bypass URL filter'],
    recommendations: ['Report Google Form for policy violation', 'Warn internal staff via Slack security channel', 'Ensure corporate SSO uses hardware security keys (FIDO2)'],
  },
  {
    type: 'url' as const,
    inputPreview: 'https://github.com/torvalds/linux/releases',
    fullInput: 'https://github.com/torvalds/linux/releases/tag/v6.8',
    riskScore: 4,
    riskLevel: 'safe' as const,
    threatCategory: 'Clean / Verified Resource',
    summary: 'Official GitHub repository release tag verified against cryptographic repository signatures and public reputation feeds.',
    indicators: [
      { type: 'domain' as const, value: 'github.com', reputation: 'clean' as const, confidence: 99 },
      { type: 'ip' as const, value: '140.82.112.4', reputation: 'clean' as const, confidence: 99 },
    ],
    matchedPatterns: ['Official organization repository', 'Valid Extended Validation TLS certificate', 'Zero malicious IOCs detected'],
    recommendations: ['Resource is safe to access', 'No further action required'],
  },
  {
    type: 'message' as const,
    inputPreview: 'Your Netflix membership is on hold. Update payment method within 24h: https://netflix-billing-renew.cx',
    fullInput: 'Netflix: We had trouble processing your monthly billing cycle. Your account will be closed unless you update payment now: https://netflix-billing-renew.cx',
    riskScore: 91,
    riskLevel: 'critical' as const,
    threatCategory: 'Subscription Phishing',
    summary: 'High-volume Netflix billing phishing vector utilizing lookalike branding and fake credit card gateway.',
    indicators: [
      { type: 'domain' as const, value: 'netflix-billing-renew.cx', reputation: 'malicious' as const, confidence: 97 },
      { type: 'pattern' as const, value: 'Payment Expired Urgency Pattern', reputation: 'suspicious' as const, confidence: 92 },
    ],
    matchedPatterns: ['Netflix trademark infringement', 'Recently registered TLD (.cx)', 'Credential exfiltration payload embedded'],
    recommendations: ['Block URL on endpoint and router', 'Verify Netflix subscription via official Netflix mobile app', 'Never click payment links in emails/SMS'],
  },
];

// Helper to generate 50 realistic investigations
export const mockInvestigations: InvestigationItem[] = Array.from({ length: 50 }, (_, i) => {
  const template = rawSampleTemplates[i % rawSampleTemplates.length];
  const idNum = 9450 - i;
  const dayOffset = Math.floor(i / 1.7);
  const hourOffset = (i * 3) % 24;
  const dateObj = new Date(2026, 10, 21 - dayOffset, 22 - hourOffset, (i * 17) % 60);

  const statuses: ('completed' | 'flagged' | 'mitigated' | 'in_progress')[] = ['completed', 'mitigated', 'completed', 'flagged'];
  const currentStatus = i === 0 ? 'completed' : statuses[i % statuses.length];

  const agentSteps: InvestigationStep[] = [
    {
      agent: 'Ingestion Sentinel',
      role: 'Artifact Capture & Decoding',
      finding: `Received ${template.type.toUpperCase()} artifact; parsed metadata and normalized payload encoding.`,
      duration: '42ms',
      status: 'complete',
      severity: 'info',
    },
    {
      agent: 'Heuristic Pattern Engine',
      role: 'NLP & Token Analysis',
      finding: template.riskScore > 50 ? 'Extracted 4 high-severity deceptive patterns and urgency keywords.' : 'Syntax and structural analysis verified neutral patterns.',
      duration: '118ms',
      status: 'complete',
      severity: template.riskScore > 75 ? 'critical' : template.riskScore > 40 ? 'warning' : 'success',
    },
    {
      agent: 'Threat Intel Matcher',
      role: 'Reputation Database Correlation',
      finding: template.indicators.length > 0 ? `Correlated against 18.4M threat records. Found matches in ${(template.indicators[0] as any)?.matchedList || 'global threat feed'}.` : 'No matches found in malicious IOC databases.',
      duration: '85ms',
      status: 'complete',
      severity: template.riskScore > 75 ? 'critical' : template.riskScore > 40 ? 'warning' : 'success',
    },
    {
      agent: 'Multi-Agent Consensus Swarm',
      role: 'LLM Reasoning & Final Scoring',
      finding: `Calculated definitive risk score of ${template.riskScore}/100. Category: ${template.threatCategory}.`,
      duration: '210ms',
      status: 'complete',
      severity: template.riskScore > 75 ? 'critical' : template.riskScore > 40 ? 'warning' : 'success',
    },
  ];

  return {
    id: `INV-${idNum}`,
    type: template.type,
    inputPreview: template.inputPreview,
    fullInput: template.fullInput,
    riskScore: template.riskScore,
    riskLevel: template.riskLevel,
    threatCategory: template.threatCategory,
    timestamp: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: currentStatus,
    summary: template.summary,
    steps: agentSteps,
    indicators: template.indicators,
    matchedPatterns: template.matchedPatterns,
    recommendations: template.recommendations,
  };
});

// -------------------------------------------------------------
// 3. Threat Intelligence Dataset
// -------------------------------------------------------------
export const mockThreatIntelligence = {
  stats: {
    totalIndicators: 18492,
    phishingDomains: 6840,
    maliciousUrls: 9112,
    suspiciousIps: 2540,
  },
  indicators: [
    {
      id: 'IOC-901',
      type: 'domain' as const,
      value: 'secure-login-chase-update.com',
      category: 'Banking Phishing',
      severity: 'critical' as const,
      confidence: 99,
      firstSeen: '2 hours ago',
      lastSeen: 'Just now',
      tags: ['Chase', 'Credential Harvest', 'Fast Flux'],
      source: 'AEGISOS HoneyNet',
      status: 'active' as const,
    },
    {
      id: 'IOC-902',
      type: 'url' as const,
      value: 'https://usps-parcel-redelivery-tax.top/track',
      category: 'Smishing Trap',
      severity: 'critical' as const,
      confidence: 97,
      firstSeen: '5 hours ago',
      lastSeen: '12 mins ago',
      tags: ['Postal', 'Credit Card Stealer'],
      source: 'MessageGuard Swarm',
      status: 'active' as const,
    },
    {
      id: 'IOC-903',
      type: 'ip' as const,
      value: '194.26.29.112',
      category: 'Bulletproof Hosting',
      severity: 'critical' as const,
      confidence: 94,
      firstSeen: '1 day ago',
      lastSeen: '1 hour ago',
      tags: ['C2 Server', 'Russian Federation', 'Phish Host'],
      source: 'Spamhaus DROP',
      status: 'active' as const,
    },
    {
      id: 'IOC-904',
      type: 'domain' as const,
      value: 'crypto-airdrop-arb-claim.io',
      category: 'Web3 Drainer',
      severity: 'critical' as const,
      confidence: 98,
      firstSeen: '6 hours ago',
      lastSeen: '34 mins ago',
      tags: ['Ethereum', 'Permit2 Exploit', 'Discord Spam'],
      source: 'ChainSec Feed',
      status: 'active' as const,
    },
    {
      id: 'IOC-905',
      type: 'url' as const,
      value: 'https://netflix-subscription-renew.cx/billing',
      category: 'Subscription Phishing',
      severity: 'high' as const,
      confidence: 92,
      firstSeen: '8 hours ago',
      lastSeen: '2 hours ago',
      tags: ['Netflix', 'Carding'],
      source: 'PhishTank',
      status: 'mitigated' as const,
    },
    {
      id: 'IOC-906',
      type: 'ip' as const,
      value: '45.154.255.89',
      category: 'Brute Force / Scanner',
      severity: 'warning' as const,
      confidence: 86,
      firstSeen: '2 days ago',
      lastSeen: '4 hours ago',
      tags: ['SSH Probe', 'Port Scanner'],
      source: 'GreyNoise',
      status: 'monitoring' as const,
    },
    {
      id: 'IOC-907',
      type: 'domain' as const,
      value: 'auth-microsoft-portal-verify.me',
      category: 'O365 Quishing',
      severity: 'critical' as const,
      confidence: 96,
      firstSeen: '12 hours ago',
      lastSeen: '50 mins ago',
      tags: ['Corporate SSO', 'Reverse Proxy MITM'],
      source: 'AEGISOS HoneyNet',
      status: 'active' as const,
    },
    {
      id: 'IOC-908',
      type: 'hash' as const,
      value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      category: 'Trojanized APK',
      severity: 'critical' as const,
      confidence: 99,
      firstSeen: '3 days ago',
      lastSeen: '1 day ago',
      tags: ['Anatsa Banker', 'Overlay Attack'],
      source: 'VirusTotal Intelligence',
      status: 'mitigated' as const,
    },
    {
      id: 'IOC-909',
      type: 'domain' as const,
      value: 'appleid-support-icloud-locked.com',
      category: 'Apple ID Phishing',
      severity: 'critical' as const,
      confidence: 95,
      firstSeen: '1 day ago',
      lastSeen: '3 hours ago',
      tags: ['FindMy Spoof', 'iCloud Credential'],
      source: 'WebGuard Sensor',
      status: 'active' as const,
    },
    {
      id: 'IOC-910',
      type: 'ip' as const,
      value: '185.220.101.5',
      category: 'Tor Exit Node / Relay',
      severity: 'info' as const,
      confidence: 75,
      firstSeen: '5 days ago',
      lastSeen: '10 mins ago',
      tags: ['Tor Network', 'Anonymizer'],
      source: 'Tor Project Directory',
      status: 'monitoring' as const,
    },
  ],
  categoryDistribution: [
    { category: 'Banking & Financial', count: 4820, fill: '#FF4560' },
    { category: 'Postal & Logistics', count: 3940, fill: '#00E5FF' },
    { category: 'SaaS / Enterprise SSO', count: 3210, fill: '#7C4DFF' },
    { category: 'Crypto & Web3', count: 2890, fill: '#FFB020' },
    { category: 'Streaming & Services', count: 2140, fill: '#00D68F' },
    { category: 'Government & Tax Impersonation', count: 1492, fill: '#8794A8' },
  ],
  knownPatterns: [
    {
      title: 'Punycode & Homoglyph Lookalikes',
      description: 'Attackers utilize Cyrillic characters (e.g. "a" -> U+0430) to create visually indistinguishable domains like "chаse.com".',
      threatType: 'Phishing',
      riskRating: 'Critical',
      signature: 'Regex: ^xn--.*',
    },
    {
      title: 'Reverse Proxy MITM (Evilginx3)',
      description: 'Intermediate proxy passes legitimate MFA prompts while harvesting session authentication cookies in real-time.',
      threatType: 'Session Hijack',
      riskRating: 'Critical',
      signature: 'Proxy header inspection & certificate mismatch',
    },
    {
      title: 'Permit2 Batch Token Approval Draing',
      description: 'Smart contract approval exploit disguised as free token airdrops with unlimited spending allowances.',
      threatType: 'Crypto Theft',
      riskRating: 'High',
      signature: 'ERC-20 permit opcode match (0xd505accf)',
    },
    {
      title: 'Quishing via Steganographic QR',
      description: 'QR codes encoded with noise layers to evade naive optical scanners while remaining decodable by smartphone cameras.',
      threatType: 'Quishing',
      riskRating: 'High',
      signature: 'Low-contrast high-frequency QR matrix density',
    },
    {
      title: 'Android Accessibility Overlay Injection',
      description: 'Malicious background service monitors foreground window and renders transparent overlays on banking applications.',
      threatType: 'Trojan Banker',
      riskRating: 'Critical',
      signature: 'Manifest permission BIND_ACCESSIBILITY_SERVICE',
    },
  ],
};

// -------------------------------------------------------------
// 4. Device Security Data
// -------------------------------------------------------------
export const mockDevices: DeviceInfo[] = [
  {
    id: 'DEV-PIXEL8-PRO',
    name: 'Google Pixel 8 Pro',
    platform: 'Android',
    osVersion: 'Android 15 (Build AP3A.241005.015)',
    model: 'Pixel 8 Pro (GP4BC)',
    status: 'protected',
    lastSeen: '1 minute ago',
    ipAddress: '192.168.1.145',
    battery: 84,
    agentVersion: 'v2.4.1-arm64',
    riskScore: 12,
    appsAudited: 148,
    riskyPermissionsCount: 2,
    auditedApps: [
      {
        name: 'QuickClean Boost',
        packageName: 'com.optimizer.quickclean',
        risk: 'medium',
        permissions: ['READ_PHONE_STATE', 'SYSTEM_ALERT_WINDOW', 'ACCESS_COARSE_LOCATION'],
        riskReason: 'Utility app requests system overlay and persistent background wakelock.',
      },
      {
        name: 'File Manager Plus',
        packageName: 'com.alphainc.fileexplorer',
        risk: 'low',
        permissions: ['MANAGE_EXTERNAL_STORAGE'],
        riskReason: 'Broad storage permission is legitimate for file manager scope.',
      },
      {
        name: 'Signal Messenger',
        packageName: 'org.thoughtcrime.securesms',
        risk: 'low',
        permissions: ['READ_CONTACTS', 'CAMERA', 'RECORD_AUDIO'],
        riskReason: 'Permissions align with secure messaging operational requirements.',
      },
    ],
    permissionRisks: [
      {
        permission: 'Accessibility Service (BIND_ACCESSIBILITY_SERVICE)',
        severity: 'critical',
        grantedAppsCount: 0,
        description: 'Grants ability to inspect and interact with entire screen content across all applications.',
      },
      {
        permission: 'Notification Listener (BIND_NOTIFICATION_LISTENER_SERVICE)',
        severity: 'warning',
        grantedAppsCount: 1,
        description: 'Allows reading incoming OTPs and private message notifications.',
      },
      {
        permission: 'Overlay Window (SYSTEM_ALERT_WINDOW)',
        severity: 'warning',
        grantedAppsCount: 2,
        description: 'Enables rendering drawing elements over other applications.',
      },
    ],
    networkStatus: {
      ssid: 'Corp_Secured_WPA3',
      bssid: '74:83:C2:90:FA:11',
      security: 'WPA3',
      isVpnActive: true,
      dnsOverHttps: true,
      threatsBlockedToday: 14,
    },
  },
  {
    id: 'DEV-GALAXY-S24',
    name: 'Samsung Galaxy S24 Ultra',
    platform: 'Android',
    osVersion: 'Android 14 (One UI 6.1)',
    model: 'SM-S928B',
    status: 'warning',
    lastSeen: '18 mins ago',
    ipAddress: '192.168.1.182',
    battery: 62,
    agentVersion: 'v2.4.0-arm64',
    riskScore: 38,
    appsAudited: 212,
    riskyPermissionsCount: 5,
    auditedApps: [
      {
        name: 'PDF Reader Lite',
        packageName: 'com.pdfreader.document.lite',
        risk: 'high',
        permissions: ['READ_SMS', 'RECEIVE_SMS', 'ACCESS_FINE_LOCATION'],
        riskReason: 'PDF viewer requests SMS reading and fine GPS coordinates. Unnecessary for document reading.',
      },
      {
        name: 'Smart Flashlight LED',
        packageName: 'com.tools.torch.ultra',
        risk: 'high',
        permissions: ['RECORD_AUDIO', 'SYSTEM_ALERT_WINDOW'],
        riskReason: 'Flashlight utility requests microphone audio recording access.',
      },
    ],
    permissionRisks: [
      {
        permission: 'SMS Access (READ_SMS, RECEIVE_SMS)',
        severity: 'critical',
        grantedAppsCount: 2,
        description: 'Exposes 2FA SMS tokens and banking transaction confirmations.',
      },
      {
        permission: 'Background Location (ACCESS_BACKGROUND_LOCATION)',
        severity: 'warning',
        grantedAppsCount: 4,
        description: 'Tracks device physical location continuously without user interaction.',
      },
    ],
    networkStatus: {
      ssid: 'CoffeeShop_Free_Guest',
      bssid: 'AA:11:BB:22:CC:33',
      security: 'Open',
      isVpnActive: true,
      dnsOverHttps: true,
      threatsBlockedToday: 23,
    },
  },
];

// -------------------------------------------------------------
// 5. Analytics Dataset
// -------------------------------------------------------------
export const mockAnalytics = {
  summary: {
    totalScans: 4890,
    threatRatio: '24.2%',
    meanResolutionTime: '180ms',
    accuracyRate: '99.4%',
  },
  detectionTrends: [
    { date: 'Day 1', phishing: 12, malware: 5, smishing: 8, network: 2 },
    { date: 'Day 3', phishing: 14, malware: 4, smishing: 10, network: 1 },
    { date: 'Day 5', phishing: 19, malware: 7, smishing: 12, network: 3 },
    { date: 'Day 7', phishing: 16, malware: 6, smishing: 14, network: 2 },
    { date: 'Day 9', phishing: 22, malware: 9, smishing: 18, network: 4 },
    { date: 'Day 11', phishing: 26, malware: 8, smishing: 15, network: 3 },
    { date: 'Day 13', phishing: 18, malware: 5, smishing: 12, network: 1 },
    { date: 'Day 15', phishing: 30, malware: 11, smishing: 22, network: 5 },
    { date: 'Day 17', phishing: 25, malware: 9, smishing: 19, network: 4 },
    { date: 'Day 19', phishing: 20, malware: 7, smishing: 14, network: 2 },
    { date: 'Day 21', phishing: 28, malware: 12, smishing: 20, network: 3 },
    { date: 'Day 23', phishing: 34, malware: 14, smishing: 25, network: 6 },
    { date: 'Day 25', phishing: 27, malware: 10, smishing: 18, network: 4 },
    { date: 'Day 27', phishing: 22, malware: 8, smishing: 16, network: 2 },
    { date: 'Day 30', phishing: 19, malware: 6, smishing: 13, network: 1 },
  ],
  scamCategories: [
    { name: 'Financial Credential Harvesting', count: 520, percent: 34 },
    { name: 'Delivery / Courier Smishing', count: 390, percent: 25 },
    { name: 'Crypto Drainers & Phishing', count: 240, percent: 16 },
    { name: 'Job & Employment Scams', count: 180, percent: 12 },
    { name: 'Family Impersonation / Urgency', count: 140, percent: 9 },
    { name: 'Subscription / Invoice Traps', count: 70, percent: 4 },
  ],
  severityDistribution: [
    { name: 'Critical', value: 340, color: '#FF4560' },
    { name: 'High', value: 480, color: '#FFB020' },
    { name: 'Medium', value: 720, color: '#00E5FF' },
    { name: 'Low', value: 950, color: '#7C4DFF' },
    { name: 'Safe / Clean', value: 2400, color: '#00D68F' },
  ],
  investigationVolume: [
    { day: 'Mon', volume: 184, threats: 42 },
    { day: 'Tue', volume: 210, threats: 51 },
    { day: 'Wed', volume: 245, threats: 63 },
    { day: 'Thu', volume: 290, threats: 74 },
    { day: 'Fri', volume: 310, threats: 82 },
    { day: 'Sat', volume: 160, threats: 28 },
    { day: 'Sun', volume: 140, threats: 24 },
  ],
  scoreHistory: [
    { week: 'Wk 1', score: 79 },
    { week: 'Wk 2', score: 81 },
    { week: 'Wk 3', score: 85 },
    { week: 'Wk 4', score: 88 },
  ],
};

// -------------------------------------------------------------
// 6. Demo Scenarios
// -------------------------------------------------------------
export interface DemoScenario {
  id: string;
  title: string;
  category: string;
  badge: string;
  preview: string;
  fullData: string;
  type: 'message' | 'url' | 'qr' | 'app';
  result: {
    riskScore: number;
    riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
    threatCategory: string;
    summary: string;
    steps: InvestigationStep[];
    indicators: ThreatIndicator[];
    recommendations: string[];
  };
}

export const mockDemoScenarios: DemoScenario[] = [
  {
    id: 'demo-1',
    title: 'Suspicious Banking SMS',
    category: 'Smishing Fraud',
    badge: 'Critical Risk',
    type: 'message',
    preview: 'CHASE-ALERT: Unusual sign-in attempt detected from IP 89.21.0.4. If this was not you, verify identity immediately: https://chase-auth-login.cc/v',
    fullData: 'CHASE-ALERT: Unusual sign-in attempt detected from IP 89.21.0.4. If this was not you, verify identity immediately: https://chase-auth-login.cc/v',
    result: {
      riskScore: 97,
      riskLevel: 'critical',
      threatCategory: 'Banking Credential Theft',
      summary: 'High-severity smishing vector spoofing Chase fraud alerts. Uses a newly registered domain (<24h) and exfiltrates input credentials to a remote Telegram Bot.',
      steps: [
        {
          agent: 'SMS Heuristic Analyzer',
          role: 'Urgency & Brand Spoofing Check',
          finding: 'Extracted high-urgency keywords ("Unusual sign-in", "verify identity immediately") and identified Chase brand impersonation.',
          duration: '38ms',
          status: 'complete',
          severity: 'critical',
        },
        {
          agent: 'Domain Reputation Sentinel',
          role: 'Whois & DNS Profiling',
          finding: 'chase-auth-login.cc registered 18 hours ago in Iceland with privacy redaction. Hosted on bulletproof ASN 49382.',
          duration: '82ms',
          status: 'complete',
          severity: 'critical',
        },
        {
          agent: 'Payload Sandbox Examiner',
          role: 'DOM Structure & Exfiltration Scan',
          finding: 'Found HTML clones of Chase mobile layout and active Javascript sending form fields to /api/hook.php endpoint.',
          duration: '144ms',
          status: 'complete',
          severity: 'critical',
        },
        {
          agent: 'Consensus Coordinator',
          role: 'Final Swarm Verdict',
          finding: 'Consensus reached: 100% agreement on critical phishing status. Threat intercepted and added to blocklist.',
          duration: '40ms',
          status: 'complete',
          severity: 'critical',
        },
      ],
      indicators: [
        { type: 'domain', value: 'chase-auth-login.cc', reputation: 'malicious', confidence: 99, matchedList: 'AEGISOS Live Phish Feed' },
        { type: 'ip', value: '185.220.101.44', reputation: 'malicious', confidence: 96, matchedList: 'AbuseIPDB Threat Fleet' },
      ],
      recommendations: [
        'Never click on links received via SMS purporting to be from financial institutions.',
        'Access banking services exclusively via official mobile apps or verified bookmarks.',
        'Report SMS to national shortcode 7726.',
      ],
    },
  },
  {
    id: 'demo-2',
    title: 'Fake University Portal',
    category: 'Credential Harvester',
    badge: 'Critical Risk',
    type: 'url',
    preview: 'https://stanford-portal-cas-auth.xyz/login?service=canvas_student_id',
    fullData: 'https://stanford-portal-cas-auth.xyz/login?service=canvas_student_id',
    result: {
      riskScore: 94,
      riskLevel: 'critical',
      threatCategory: 'Institutional SSO Phishing',
      summary: 'Deceptive domain mimicking Stanford University CAS Central Authentication Service with Canvas student learning management token harvesting.',
      steps: [
        {
          agent: 'URL Lexical Profiler',
          role: 'Homoglyph & Subdomain Parsing',
          finding: 'Stanford university name positioned in second-level domain on untrusted .xyz registry.',
          duration: '29ms',
          status: 'complete',
          severity: 'critical',
        },
        {
          agent: 'Certificate Validator',
          role: 'TLS & Issuer Audit',
          finding: 'Issued by Let\'s Encrypt 3 hours ago. True Stanford CAS uses InCommon / Sectigo Extended Validation certificate.',
          duration: '64ms',
          status: 'complete',
          severity: 'critical',
        },
        {
          agent: 'DOM Inspector',
          role: 'Visual Comparison Model',
          finding: 'Matches official Stanford University CAS theme with 97.4% pixel similarity; credential destination URL points to rogue server.',
          duration: '182ms',
          status: 'complete',
          severity: 'critical',
        },
        {
          agent: 'Consensus Coordinator',
          role: 'Final Swarm Verdict',
          finding: 'Assigned 94/100 risk score. Threat mitigation active.',
          duration: '45ms',
          status: 'complete',
          severity: 'critical',
        },
      ],
      indicators: [
        { type: 'domain', value: 'stanford-portal-cas-auth.xyz', reputation: 'malicious', confidence: 98 },
        { type: 'pattern', value: 'Stanford Shield Brand Asset Theft', reputation: 'malicious', confidence: 95 },
      ],
      recommendations: [
        'Block domain across campus and enterprise DNS servers.',
        'Enforce FIDO2 WebAuthn keys to render reverse proxy MITM harvesters ineffective.',
        'Contact University CISO incident response team.',
      ],
    },
  },
  {
    id: 'demo-3',
    title: 'Malicious QR Code',
    category: 'Crypto Drainer / Quishing',
    badge: 'High Risk',
    type: 'qr',
    preview: 'Decoded QR: ethereum:0x93B2.../approve?spender=0xDrainer&amount=unlimited',
    fullData: 'ethereum:0x93B221a8c0F54c3029.../approve?spender=0xDrainer9921&amount=115792089237316195423570985008687907853269984665640564039457584007913129639935',
    result: {
      riskScore: 89,
      riskLevel: 'critical',
      threatCategory: 'Web3 Token Drainer Permit',
      summary: 'Decoded QR payload requests unlimited ERC-20 token allowance to an unverified third-party smart contract known for drainer activity.',
      steps: [
        {
          agent: 'Media Decoder Agent',
          role: 'Optical Matrix Extraction',
          finding: 'Successfully parsed QR payload from high-resolution raster image; extracted Web3 transaction URI.',
          duration: '52ms',
          status: 'complete',
          severity: 'info',
        },
        {
          agent: 'Blockchain Contract Analyzer',
          role: 'Smart Contract Reputation',
          finding: 'Spender address 0xDrainer9921 flagged on Etherscan and ChainSec for 14 drainer transactions in last 48 hours.',
          duration: '115ms',
          status: 'complete',
          severity: 'critical',
        },
        {
          agent: 'Permission Risk Evaluator',
          role: 'Allowance Scope Audit',
          finding: 'Payload requests max uint256 token allowance (infinite spend permission).',
          duration: '46ms',
          status: 'complete',
          severity: 'critical',
        },
        {
          agent: 'Consensus Coordinator',
          role: 'Final Swarm Verdict',
          finding: 'Critical threat confirmed. User advised to reject wallet transaction.',
          duration: '32ms',
          status: 'complete',
          severity: 'critical',
        },
      ],
      indicators: [
        { type: 'wallet', value: '0xDrainer9921...39BA', reputation: 'malicious', confidence: 98, matchedList: 'Crypto Scam Database' },
        { type: 'pattern', value: 'Max Uint256 Unlimited Allowance Request', reputation: 'malicious', confidence: 99 },
      ],
      recommendations: [
        'Do not scan or approve this QR transaction in MetaMask, Phantom, or Coinbase Wallet.',
        'Check current approvals on Revoke.cash if previously interacted.',
        'Discard physical flyer or delete digital QR image.',
      ],
    },
  },
  {
    id: 'demo-4',
    title: 'Dangerous App Permissions',
    category: 'Rogue Android Package',
    badge: 'High Risk',
    type: 'app',
    preview: 'Package: com.battery.fastsaver.pro (14 permissions: BIND_ACCESSIBILITY, READ_SMS, SYSTEM_ALERT_WINDOW...)',
    fullData: 'com.battery.fastsaver.pro - Requests BIND_ACCESSIBILITY_SERVICE, READ_SMS, RECEIVE_SMS, SYSTEM_ALERT_WINDOW, ACCESS_FINE_LOCATION, RECORD_AUDIO',
    result: {
      riskScore: 82,
      riskLevel: 'high',
      threatCategory: 'Spyware / Excessive Privilege Abuse',
      summary: 'Battery optimizer utility bundle requests critical system privileges capable of monitoring user keystrokes, intercepting SMS verification codes, and recording ambient audio.',
      steps: [
        {
          agent: 'Android Manifest Parser',
          role: 'Permission Graph Extraction',
          finding: 'Identified 4 dangerous system level permissions completely outside the scope of a battery utility.',
          duration: '45ms',
          status: 'complete',
          severity: 'high',
        },
        {
          agent: 'Behavioral Signature Engine',
          role: 'Malware Family Correlator',
          finding: 'Permission combo (Accessibility + SMS + Overlay) matches banking trojan downloader patterns (Joker / Anatsa family).',
          duration: '128ms',
          status: 'complete',
          severity: 'critical',
        },
        {
          agent: 'Consensus Coordinator',
          role: 'Final Swarm Verdict',
          finding: 'High risk rating assigned. Recommended immediate removal and permission revocation.',
          duration: '39ms',
          status: 'complete',
          severity: 'high',
        },
      ],
      indicators: [
        { type: 'pattern', value: 'BIND_ACCESSIBILITY_SERVICE Abuse', reputation: 'malicious', confidence: 94 },
        { type: 'pattern', value: 'Disproportionate Permission Scope', reputation: 'suspicious', confidence: 91 },
      ],
      recommendations: [
        'Uninstall application immediately via Android Settings > Apps.',
        'Ensure Google Play Protect is enabled and perform full device scan.',
        'Review device accessibility settings and disable any unauthorized services.',
      ],
    },
  },
  {
    id: 'demo-5',
    title: 'Legitimate Website Check',
    category: 'Verified Safe Asset',
    badge: 'Safe & Clean',
    type: 'url',
    preview: 'https://developer.mozilla.org/en-US/docs/Web/API/Crypto',
    fullData: 'https://developer.mozilla.org/en-US/docs/Web/API/Crypto',
    result: {
      riskScore: 2,
      riskLevel: 'safe',
      threatCategory: 'Legitimate Educational Resource',
      summary: 'Mozilla Developer Network documentation portal. Verified trusted TLS certificates, reputable domain history (>20 years), and zero security flags.',
      steps: [
        {
          agent: 'Lexical & DNS Profiler',
          role: 'Domain Infrastructure Check',
          finding: 'Domain mozilla.org belongs to official Mozilla Foundation; authoritative Cloudflare enterprise infrastructure.',
          duration: '22ms',
          status: 'complete',
          severity: 'success',
        },
        {
          agent: 'TLS Security Auditor',
          role: 'Cipher Suite & Cert Validation',
          finding: 'Valid High-Grade TLS 1.3 certificate with HSTS enforcement and strict Content Security Policy.',
          duration: '41ms',
          status: 'complete',
          severity: 'success',
        },
        {
          agent: 'Global Intelligence Correlator',
          role: 'Threat Database Search',
          finding: 'Zero hits across 18.4M indicators in AEGISOS, VirusTotal, and Google Safe Browsing.',
          duration: '35ms',
          status: 'complete',
          severity: 'success',
        },
        {
          agent: 'Consensus Coordinator',
          role: 'Final Swarm Verdict',
          finding: 'Resource confirmed 100% safe. Trust score 99/100.',
          duration: '18ms',
          status: 'complete',
          severity: 'success',
        },
      ],
      indicators: [
        { type: 'domain', value: 'developer.mozilla.org', reputation: 'clean', confidence: 100 },
        { type: 'pattern', value: 'Strict HSTS & CSP Header Enforced', reputation: 'clean', confidence: 100 },
      ],
      recommendations: [
        'Destination is safe for normal web browsing and developer research.',
        'No defensive actions required.',
      ],
    },
  },
];
