'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Bell,
  Lock,
  Key,
  Shield,
  Sliders,
  Save,
  CheckCircle2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<
    'profile' | 'notifications' | 'privacy' | 'api' | 'protection' | 'account'
  >('profile');

  // Form states
  const [profile, setProfile] = useState({
    name: 'Alex Mercer',
    email: 'alex.mercer@aegisos.cybersec',
    role: 'Lead SecOps Engineer',
  });

  const [notifications, setNotifications] = useState({
    threatAlerts: true,
    securityUpdates: true,
    emailDigest: false,
    pushNotifications: true,
  });

  const [privacy, setPrivacy] = useState({
    privacyMode: true,
    dataRetention: '30',
    telemetrySharing: false,
  });

  const [apiKey, setApiKey] = useState('aegis_sec_live_99f82b71940a4e21a8d');
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const [protection, setProtection] = useState({
    webGuard: true,
    messageGuard: true,
    mediaGuard: true,
    appGuard: true,
    networkGuard: true,
    aiConsensus: true,
    sensitivity: 85,
    swarmDepth: 'thorough',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Settings successfully saved to AEGISOS node');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = `aegis_sec_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 10)}`;
    setApiKey(newKey);
    setToastMessage('New API Key generated successfully');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#00D68F] text-[#080B12] font-semibold text-xs shadow-[0_0_25px_rgba(0,214,143,0.4)]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
            Node Configuration
          </span>
          <span className="text-xs text-[#8794A8] font-mono">System Preferences</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F4F7FB] mt-1 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs md:text-sm text-[#8794A8]">
          Configure your operator identity, notification routing, API integrations, and autonomous protection sensitivity.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-2">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'privacy', label: 'Privacy & Retention', icon: Lock },
          { id: 'api', label: 'API & Integrations', icon: Key },
          { id: 'protection', label: 'Protection & AI', icon: Shield },
          { id: 'account', label: 'Account & Security', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 shadow-[0_0_12px_rgba(0,229,255,0.1)]'
                  : 'text-[#8794A8] hover:text-[#F4F7FB] hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Content Area */}
      <form onSubmit={handleSave}>
        <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl space-y-6">
          {/* PROFILE SECTION */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FB]">
                  Operator Profile
                </h3>
                <p className="text-xs text-[#8794A8]">Manage your SecOps credentials and platform display identity.</p>
              </div>

              {/* Avatar row */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-[#7C4DFF] p-[2px]">
                  <div className="w-full h-full rounded-[14px] bg-[#080B12] flex items-center justify-center font-mono font-black text-xl text-[#00E5FF]">
                    AM
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => alert('Avatar upload modal opened')}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#F4F7FB] border border-white/10"
                  >
                    Change Avatar
                  </button>
                  <p className="text-[11px] text-[#8794A8] mt-1">Recommended: 256x256 PNG or SVG</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8794A8] mb-1.5 uppercase font-mono">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B12] border border-white/10 text-xs md:text-sm text-[#F4F7FB] focus:outline-none focus:border-[#00E5FF]/40 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8794A8] mb-1.5 uppercase font-mono">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B12] border border-white/10 text-xs md:text-sm text-[#F4F7FB] focus:outline-none focus:border-[#00E5FF]/40 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8794A8] mb-1.5 uppercase font-mono">
                  Operational Role
                </label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B12] border border-white/10 text-xs md:text-sm text-[#F4F7FB] focus:outline-none focus:border-[#00E5FF]/40 font-mono"
                />
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FB]">
                  Notification Channels & Alerts
                </h3>
                <p className="text-xs text-[#8794A8]">Specify threshold triggers for threat escalations and digests.</p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: 'threatAlerts',
                    title: 'Critical Threat Alerts',
                    description: 'Immediate high-priority alert when credential harvesters or smishing attacks are detected.',
                  },
                  {
                    key: 'securityUpdates',
                    title: 'Autonomous Sentinel Updates',
                    description: 'Notify when threat feeds, agent swarms, or signatures synchronize.',
                  },
                  {
                    key: 'emailDigest',
                    title: 'Weekly SOC Digest Email',
                    description: 'Receive weekly overview report covering threat mitigation stats and trust score history.',
                  },
                  {
                    key: 'pushNotifications',
                    title: 'Android Companion Push Notifications',
                    description: 'Send mobile notifications to paired Pixel/Galaxy devices during active intercept.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-xl bg-[#080B12] border border-white/5"
                  >
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-[#F4F7FB]">{item.title}</h4>
                      <p className="text-xs text-[#8794A8] mt-0.5">{item.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev: any) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        (notifications as any)[item.key] ? 'bg-[#00E5FF]' : 'bg-white/10'
                      }`}
                    >
                      <motion.div
                        animate={{ x: (notifications as any)[item.key] ? 24 : 2 }}
                        className="w-5 h-5 rounded-full bg-[#080B12] shadow"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRIVACY SECTION */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FB]">
                  Data Privacy & Telemetry Retention
                </h3>
                <p className="text-xs text-[#8794A8]">Manage zero-knowledge privacy policies and log expiration.</p>
              </div>

              <div className="p-4 rounded-xl bg-[#080B12] border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-[#F4F7FB]">Zero-Knowledge Privacy Mode</h4>
                  <p className="text-xs text-[#8794A8] mt-0.5">
                    Hash all scanned URLs, SMS bodies, and OCR texts client-side before transmission.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacy({ ...privacy, privacyMode: !privacy.privacyMode })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    privacy.privacyMode ? 'bg-[#00D68F]' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    animate={{ x: privacy.privacyMode ? 24 : 2 }}
                    className="w-5 h-5 rounded-full bg-[#080B12] shadow"
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8794A8] mb-1.5 uppercase font-mono">
                  Audit Log Data Retention Period
                </label>
                <select
                  value={privacy.dataRetention}
                  onChange={(e) => setPrivacy({ ...privacy, dataRetention: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B12] border border-white/10 text-xs md:text-sm text-[#F4F7FB] focus:outline-none focus:border-[#00E5FF]/40 font-mono"
                >
                  <option value="7">7 Days (Ephemeral Storage)</option>
                  <option value="30">30 Days (Standard Compliance)</option>
                  <option value="90">90 Days (Enterprise Forensic Window)</option>
                  <option value="365">1 Year (Long-term Archival)</option>
                </select>
                <p className="text-[11px] text-[#8794A8] mt-1">Logs past retention limit are permanently purged with DoD 5220.22-M zero-wipe.</p>
              </div>
            </div>
          )}

          {/* API SECTION */}
          {activeSection === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FB]">
                  API Keys & Enterprise Integrations
                </h3>
                <p className="text-xs text-[#8794A8]">Connect AEGISOS intelligence feeds into SIEM, SOAR, or custom webhooks.</p>
              </div>

              {/* API Key Box */}
              <div className="p-4 rounded-xl bg-[#080B12] border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-mono text-[#8794A8]">Primary Live API Key</span>
                <div className="flex items-center gap-2">
                  <input
                    type={showKey ? 'text' : 'password'}
                    readOnly
                    value={apiKey}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#151E2D] border border-white/10 text-xs font-mono text-[#00E5FF] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8794A8] hover:text-[#F4F7FB]"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#8794A8] hover:text-[#00E5FF]"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateKey}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#7C4DFF]/20 text-[#7C4DFF] hover:bg-[#7C4DFF]/30 text-xs font-mono font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                </div>
                {copiedKey && <span className="text-[10px] text-[#00D68F] font-mono">Copied to clipboard!</span>}
              </div>

              {/* Connected Integrations list */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-[#F4F7FB] uppercase tracking-wider block">
                  Active Integrations
                </span>
                {[
                  { name: 'Splunk Cloud SIEM', status: 'Connected', ping: '12ms', type: 'Syslog / HEC' },
                  { name: 'CrowdStrike Falcon Sensor', status: 'Connected', ping: '24ms', type: 'EDR Feed' },
                  { name: 'Slack Security Webhook', status: 'Active', ping: '40ms', type: 'Alert Channel' },
                ].map((integ, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#080B12] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00D68F]" />
                      <span className="font-semibold text-[#F4F7FB]">{integ.name}</span>
                      <span className="text-[#8794A8] font-mono">({integ.type})</span>
                    </div>
                    <span className="text-[#00E5FF] font-mono text-[11px]">{integ.ping}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROTECTION SECTION */}
          {activeSection === 'protection' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FB]">
                  Protection Modules & Sensitivity
                </h3>
                <p className="text-xs text-[#8794A8]">Fine-tune autonomous heuristic thresholds and swarm depth.</p>
              </div>

              {/* Module Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'webGuard', name: 'WebGuard (DNS & URL)' },
                  { key: 'messageGuard', name: 'MessageGuard (SMS & Chat)' },
                  { key: 'mediaGuard', name: 'MediaGuard (QR & Stego)' },
                  { key: 'appGuard', name: 'AppGuard (APK Sentinels)' },
                  { key: 'networkGuard', name: 'NetworkGuard (Wi-Fi MITM)' },
                  { key: 'aiConsensus', name: 'AI Consensus Engine' },
                ].map((mod) => (
                  <div
                    key={mod.key}
                    className="p-3.5 rounded-xl bg-[#080B12] border border-white/5 flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-[#F4F7FB]">{mod.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setProtection((prev: any) => ({
                          ...prev,
                          [mod.key]: !prev[mod.key],
                        }))
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        (protection as any)[mod.key] ? 'bg-[#00E5FF]' : 'bg-white/10'
                      }`}
                    >
                      <motion.div
                        animate={{ x: (protection as any)[mod.key] ? 20 : 2 }}
                        className="w-4 h-4 rounded-full bg-[#080B12]"
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Sensitivity Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#8794A8] uppercase font-semibold">
                    Heuristic Detection Sensitivity
                  </span>
                  <span className="text-[#00E5FF] font-bold">{protection.sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={protection.sensitivity}
                  onChange={(e) =>
                    setProtection({ ...protection, sensitivity: parseInt(e.target.value) })
                  }
                  className="w-full accent-[#00E5FF] bg-[#080B12] h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8794A8] font-mono">
                  <span>Balanced (Low False Positives)</span>
                  <span>Paranoid Zero-Day Shield</span>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT SECTION */}
          {activeSection === 'account' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FB]">
                  Account Credentials & Destruction
                </h3>
                <p className="text-xs text-[#8794A8]">Update master authentication credentials or decommission account.</p>
              </div>

              {/* Password Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8794A8] mb-1 uppercase font-mono">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B12] border border-white/10 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#00E5FF]/40"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#8794A8] mb-1 uppercase font-mono">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={passwords.next}
                      onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B12] border border-white/10 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#00E5FF]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8794A8] mb-1 uppercase font-mono">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B12] border border-white/10 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#00E5FF]/40"
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="p-4 rounded-xl border border-[#FF4560]/20 bg-[#FF4560]/5 space-y-3">
                <div className="flex items-center gap-2 text-[#FF4560]">
                  <AlertTriangle className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h4>
                </div>
                <p className="text-xs text-[#8794A8]">
                  Permanently wipe all security audit records, device pairings, API keys, and operator identity.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 rounded-lg bg-[#FF4560] text-[#F4F7FB] text-xs font-bold hover:bg-[#FF4560]/80 transition-colors"
                >
                  Delete Account & Wipe Data
                </button>
              </div>
            </div>
          )}

          {/* Action Footer: Save Button */}
          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-[#080B12] font-bold text-xs md:text-sm hover:opacity-95 shadow-[0_0_20px_rgba(0,229,255,0.25)] transition-opacity"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-[#151E2D] border border-[#FF4560]/30 p-6 shadow-2xl space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FF4560]/10 flex items-center justify-center text-[#FF4560]">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#F4F7FB]">Confirm Account Destruction</h3>
            <p className="text-xs text-[#8794A8] leading-relaxed">
              This action cannot be undone. All telemetry archives, cryptographic certificates, and historical IOC matches will be purged permanently.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-white/5 text-xs text-[#F4F7FB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  alert('Account deletion initiated. Session terminated.');
                }}
                className="px-4 py-2 rounded-lg bg-[#FF4560] text-[#F4F7FB] text-xs font-bold"
              >
                Yes, Destroy Account
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
