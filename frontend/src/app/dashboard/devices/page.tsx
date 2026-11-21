'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Wifi,
  Lock,
  BatteryCharging,
  Cpu,
  Layers,
  CheckCircle,
  Plus,
  QrCode,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Radio,
  FileCode,
} from 'lucide-react';

import { mockDevices, DeviceInfo } from '@/lib/mockData';

export default function DeviceSecurityPage() {
  const [devices, setDevices] = useState<DeviceInfo[]>(mockDevices);
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);
  const [showPairModal, setShowPairModal] = useState(false);

  const selectedDevice = devices[selectedDeviceIndex] || null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
              Endpoint Protection
            </span>
            <span className="text-xs text-[#8794A8] font-mono">AppGuard Android Sentinel</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F4F7FB] mt-1 tracking-tight">
            Device Security
          </h1>
          <p className="text-xs md:text-sm text-[#8794A8]">
            Audit installed Android packages, monitor dangerous permissions, and inspect Wi-Fi network encryption.
          </p>
        </div>

        <button
          onClick={() => setShowPairModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-[#080B12] text-xs font-bold hover:opacity-95 shadow-[0_0_15px_rgba(0,229,255,0.2)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Device</span>
        </button>
      </div>

      {/* If No Devices Registered: Empty State */}
      {devices.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] border border-[#00E5FF]/20">
            <Smartphone className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[#F4F7FB]">
            Connect your Android device to get started
          </h2>
          <p className="text-xs text-[#8794A8] max-w-md">
            Install the AEGISOS Android companion APK and pair using the device sentinel QR code to monitor real-time app permissions and SMS threats.
          </p>
          <button
            onClick={() => setShowPairModal(true)}
            className="px-6 py-2.5 rounded-xl bg-[#00E5FF] text-[#080B12] font-bold text-xs"
          >
            Pair Android Device
          </button>
        </div>
      ) : (
        <>
          {/* Registered Devices List (Cards) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-[#8794A8]">
                Registered Sentinel Endpoints ({devices.length})
              </h3>
              <span className="text-xs font-mono text-[#00D68F]">All Telemetry Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device, idx) => {
                const isSelected = selectedDeviceIndex === idx;
                const isProtected = device.status === 'protected';

                return (
                  <motion.div
                    key={device.id}
                    onClick={() => setSelectedDeviceIndex(idx)}
                    whileHover={{ y: -2 }}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#151E2D] border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.1)]'
                        : 'bg-[#151E2D]/70 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF]" />
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl ${
                            isSelected
                              ? 'bg-[#00E5FF]/15 text-[#00E5FF]'
                              : 'bg-white/5 text-[#8794A8]'
                          }`}
                        >
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#F4F7FB]">{device.name}</h4>
                          <span className="text-[11px] font-mono text-[#8794A8]">
                            {device.osVersion}
                          </span>
                        </div>
                      </div>

                      {/* Protection Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          isProtected
                            ? 'bg-[#00D68F]/15 text-[#00D68F] border-[#00D68F]/30'
                            : 'bg-[#FFB020]/15 text-[#FFB020] border-[#FFB020]/30'
                        }`}
                      >
                        {device.status}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="bg-[#080B12] p-2 rounded-lg">
                        <span className="text-[9px] text-[#8794A8] block">RISK SCORE</span>
                        <span
                          className={`font-bold ${
                            device.riskScore > 30 ? 'text-[#FFB020]' : 'text-[#00D68F]'
                          }`}
                        >
                          {device.riskScore}/100
                        </span>
                      </div>
                      <div className="bg-[#080B12] p-2 rounded-lg">
                        <span className="text-[9px] text-[#8794A8] block">AUDITED</span>
                        <span className="font-bold text-[#F4F7FB]">{device.appsAudited} apps</span>
                      </div>
                      <div className="bg-[#080B12] p-2 rounded-lg">
                        <span className="text-[9px] text-[#8794A8] block">LAST SEEN</span>
                        <span className="text-[10px] text-[#00E5FF]">{device.lastSeen}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Selected Device Deep Audit Details */}
          {selectedDevice && (
            <div className="space-y-6">
              {/* Network Protection Status Card */}
              <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-[#00E5FF]" />
                    <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
                      Network Protection Status ({selectedDevice.name})
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#00D68F] bg-[#00D68F]/10 px-2 py-0.5 rounded">
                    Encrypted Tunnel
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-xl bg-[#080B12] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-[#8794A8]">Wi-Fi Network</span>
                    <p className="text-sm font-bold text-[#F4F7FB] font-mono">
                      {selectedDevice.networkStatus.ssid}
                    </p>
                    <span className="text-[10px] text-[#00E5FF]">
                      Security: {selectedDevice.networkStatus.security}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#080B12] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-[#8794A8]">AEGISOS WireGuard VPN</span>
                    <p className="text-sm font-bold text-[#00D68F] font-mono flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{selectedDevice.networkStatus.isVpnActive ? 'Active & Tunneling' : 'Disabled'}</span>
                    </p>
                    <span className="text-[10px] text-[#8794A8]">AES-256-GCM Hardware Encrypted</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#080B12] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-[#8794A8]">DNS over HTTPS (DoH)</span>
                    <p className="text-sm font-bold text-[#00E5FF] font-mono">
                      {selectedDevice.networkStatus.dnsOverHttps ? 'Enabled (Quad9)' : 'Standard DNS'}
                    </p>
                    <span className="text-[10px] text-[#8794A8]">Zero DNS Leakage Verified</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#080B12] border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-[#8794A8]">Threats Blocked Today</span>
                    <p className="text-sm font-bold text-[#FFB020] font-mono">
                      {selectedDevice.networkStatus.threatsBlockedToday} requests
                    </p>
                    <span className="text-[10px] text-[#8794A8]">Rogue DNS queries dropped</span>
                  </div>
                </div>
              </div>

              {/* Permission Risk Analysis & Application Audit Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Permission Risk Analysis */}
                <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <ShieldAlert className="w-4 h-4 text-[#FFB020]" />
                    <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
                      Permission Risk Analysis
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {selectedDevice.permissionRisks.map((risk, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#080B12] border border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#F4F7FB] font-mono">
                            {risk.permission}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                              risk.severity === 'critical'
                                ? 'bg-[#FF4560]/15 text-[#FF4560]'
                                : 'bg-[#FFB020]/15 text-[#FFB020]'
                            }`}
                          >
                            {risk.severity}
                          </span>
                        </div>
                        <p className="text-xs text-[#8794A8]">{risk.description}</p>
                        <div className="text-[10px] font-mono text-[#00E5FF]">
                          Granted to {risk.grantedAppsCount} installed app(s)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Application Audit Results */}
                <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-[#7C4DFF]" />
                      <h3 className="text-sm font-semibold text-[#F4F7FB] tracking-wide uppercase">
                        Application Audit Results
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-[#8794A8]">
                      {selectedDevice.auditedApps.length} Flagged
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedDevice.auditedApps.map((app, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#080B12] border border-white/5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-[#F4F7FB]">{app.name}</h4>
                            <span className="text-[10px] font-mono text-[#8794A8]">
                              {app.packageName}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                              app.risk === 'high'
                                ? 'bg-[#FF4560]/15 text-[#FF4560]'
                                : 'bg-[#FFB020]/15 text-[#FFB020]'
                            }`}
                          >
                            {app.risk} risk
                          </span>
                        </div>

                        <p className="text-xs text-[#8794A8]">{app.riskReason}</p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {app.permissions.map((perm, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-[#00E5FF]"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Pair New Device Modal Simulation */}
      {showPairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-[#151E2D] border border-white/10 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-base font-bold text-[#F4F7FB]">Pair Android Sentinel Device</h3>
              <button
                onClick={() => setShowPairModal(false)}
                className="text-[#8794A8] hover:text-[#F4F7FB] text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-6 bg-[#080B12] rounded-xl border border-white/5">
              <div className="w-48 h-48 rounded-xl bg-white p-3 flex items-center justify-center shadow-lg">
                <QrCode className="w-full h-full text-[#080B12]" />
              </div>
              <p className="text-xs text-[#8794A8] text-center mt-3">
                Scan this QR code with the AEGISOS Android app to securely link device telemetry via end-to-end encrypted channel.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPairModal(false)}
                className="px-4 py-2 rounded-lg bg-white/5 text-xs text-[#F4F7FB] font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPairModal(false);
                  alert('Device paired successfully! Telemetry stream established.');
                }}
                className="px-4 py-2 rounded-lg bg-[#00E5FF] text-[#080B12] text-xs font-bold"
              >
                Simulate Successful Pairing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
