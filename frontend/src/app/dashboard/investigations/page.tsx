'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Globe,
  MessageSquare,
  Image as ImageIcon,
  QrCode,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  ArrowRight,
  Layers,
} from 'lucide-react';

import { mockInvestigations, InvestigationItem } from '@/lib/mockData';

const typeIcons: Record<string, any> = {
  url: Globe,
  message: MessageSquare,
  image: ImageIcon,
  qr: QrCode,
  app: Smartphone,
};

export default function InvestigationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter investigations
  const filteredInvestigations = useMemo(() => {
    return mockInvestigations.filter((item) => {
      // Search matching
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.inputPreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.threatCategory.toLowerCase().includes(searchQuery.toLowerCase());

      // Risk matching
      const matchesRisk =
        selectedRisk === 'all' || item.riskLevel.toLowerCase() === selectedRisk.toLowerCase();

      // Type matching
      const matchesType =
        selectedType === 'all' || item.type.toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesRisk && matchesType;
    });
  }, [searchQuery, selectedRisk, selectedType, selectedDateRange]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredInvestigations.length / itemsPerPage));
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvestigations.slice(start, start + itemsPerPage);
  }, [filteredInvestigations, currentPage]);

  const toggleExpand = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
            Forensic Audit Trail
          </span>
          <span className="text-xs text-[#8794A8] font-mono">Telemetry & Swarm Logs</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F4F7FB] mt-1 tracking-tight">
          Investigation History
        </h1>
        <p className="text-xs md:text-sm text-[#8794A8]">
          Review past multi-agent analyses, extracted forensic evidence, and threat mitigation logs.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 p-4 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8794A8] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, keyword, domain, category..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080B12] border border-white/10 text-xs md:text-sm text-[#F4F7FB] placeholder-[#8794A8] focus:outline-none focus:border-[#00E5FF]/50 font-mono"
            />
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#8794A8] shrink-0">
            <span>Showing:</span>
            <span className="text-[#00E5FF] font-bold">{filteredInvestigations.length}</span>
            <span>of {mockInvestigations.length}</span>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center gap-1.5 text-[#8794A8]">
            <Filter className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">Filters:</span>
          </div>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => {
              setSelectedRisk(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#080B12] border border-white/10 text-[#F4F7FB] focus:outline-none focus:border-[#00E5FF]/40 font-mono"
          >
            <option value="all">Risk: All Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="safe">Safe / Clean</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#080B12] border border-white/10 text-[#F4F7FB] focus:outline-none focus:border-[#00E5FF]/40 font-mono"
          >
            <option value="all">Type: All Vectors</option>
            <option value="url">URL</option>
            <option value="message">Message / SMS</option>
            <option value="image">Image / OCR</option>
            <option value="qr">QR Code</option>
            <option value="app">Android App</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={selectedDateRange}
            onChange={(e) => {
              setSelectedDateRange(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#080B12] border border-white/10 text-[#F4F7FB] focus:outline-none focus:border-[#00E5FF]/40 font-mono"
          >
            <option value="all">Date: Last 30 Days</option>
            <option value="7d">Last 7 Days</option>
            <option value="24h">Last 24 Hours</option>
          </select>

          {(selectedRisk !== 'all' || selectedType !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedRisk('all');
                setSelectedType('all');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-xs text-[#00E5FF] hover:underline ml-auto font-mono"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Investigations Table / List */}
      <div className="rounded-2xl bg-[#151E2D]/80 backdrop-blur-xl border border-white/5 shadow-xl overflow-hidden">
        {filteredInvestigations.length === 0 ? (
          /* Empty State */
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#8794A8] border border-white/10">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#F4F7FB]">No investigations match your filters</h3>
            <p className="text-xs text-[#8794A8] max-w-sm">
              Try adjusting your search criteria or resetting filters to see the full security audit trail.
            </p>
            <button
              onClick={() => {
                setSelectedRisk('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 text-xs font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101725]/80 text-[#8794A8] font-mono uppercase text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Investigation ID</th>
                  <th className="py-3 px-4">Artifact / Input Preview</th>
                  <th className="py-3 px-4">Threat Category</th>
                  <th className="py-3 px-4">Risk Severity</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentItems.map((inv) => {
                  const Icon = typeIcons[inv.type] || Globe;
                  const isExpanded = expandedRow === inv.id;

                  let riskColor = 'text-[#00D68F] bg-[#00D68F]/15 border-[#00D68F]/30';
                  if (inv.riskLevel === 'critical') {
                    riskColor = 'text-[#FF4560] bg-[#FF4560]/15 border-[#FF4560]/30';
                  } else if (inv.riskLevel === 'high') {
                    riskColor = 'text-[#FFB020] bg-[#FFB020]/15 border-[#FFB020]/30';
                  } else if (inv.riskLevel === 'medium') {
                    riskColor = 'text-[#00E5FF] bg-[#00E5FF]/15 border-[#00E5FF]/30';
                  }

                  let statusColor = 'text-[#00D68F] bg-[#00D68F]/10';
                  if (inv.status === 'flagged') {
                    statusColor = 'text-[#FFB020] bg-[#FFB020]/10';
                  } else if (inv.status === 'mitigated') {
                    statusColor = 'text-[#7C4DFF] bg-[#7C4DFF]/10';
                  }

                  return (
                    <React.Fragment key={inv.id}>
                      <tr
                        onClick={() => toggleExpand(inv.id)}
                        className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${
                          isExpanded ? 'bg-white/[0.03]' : ''
                        }`}
                      >
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#F4F7FB]">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-white/5 text-[#00E5FF]">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span>{inv.id}</span>
                          </div>
                        </td>

                        {/* Input Preview */}
                        <td className="py-3.5 px-4 max-w-xs truncate text-[#F4F7FB] font-mono">
                          {inv.inputPreview}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-[#8794A8] font-medium">
                          {inv.threatCategory}
                        </td>

                        {/* Risk Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${riskColor}`}
                          >
                            {inv.riskScore} - {inv.riskLevel}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#8794A8]">
                          {inv.timestamp}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${statusColor}`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        {/* Expand / View Details */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[#8794A8] hover:text-[#00E5FF]">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row Detail View */}
                      {isExpanded && (
                        <tr className="bg-[#080B12]/80 border-b border-white/5">
                          <td colSpan={7} className="p-4">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-2">
                                  <h4 className="text-xs font-bold text-[#F4F7FB] uppercase tracking-wider">
                                    Forensic Summary
                                  </h4>
                                  <p className="text-xs text-[#8794A8] leading-relaxed">
                                    {inv.summary}
                                  </p>

                                  {inv.matchedPatterns.length > 0 && (
                                    <div className="pt-2">
                                      <span className="text-[10px] font-mono text-[#8794A8] uppercase block mb-1">
                                        Matched Signatures:
                                      </span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {inv.matchedPatterns.map((pat, i) => (
                                          <span
                                            key={i}
                                            className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[#00E5FF]"
                                          >
                                            {pat}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-3 flex flex-col justify-between p-3 rounded-lg bg-[#151E2D] border border-white/5">
                                  <div>
                                    <span className="text-[10px] text-[#8794A8] uppercase font-mono block">
                                      Consensus Duration
                                    </span>
                                    <span className="text-sm font-bold font-mono text-[#00D68F]">
                                      455ms across 4 swarms
                                    </span>
                                  </div>

                                  <Link
                                    href={`/dashboard/investigations/${inv.id}`}
                                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-[#080B12] text-xs font-bold hover:opacity-95 transition-opacity"
                                  >
                                    <span>Open Full Investigation</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredInvestigations.length > 0 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-[#8794A8]">
            <span className="font-mono">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[#F4F7FB]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono transition-colors ${
                    currentPage === page
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF] font-bold border border-[#00E5FF]/40'
                      : 'hover:bg-white/5 text-[#8794A8]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[#F4F7FB]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
