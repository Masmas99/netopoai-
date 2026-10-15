'use client';

import React, { useState } from 'react';
import { ValidationReport, Topology } from '@/types/topology';
import {
  ChevronUp,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Terminal,
  Table as TableIcon,
  Copy,
  Check,
  Download,
} from 'lucide-react';

interface ValidationDrawerProps {
  report: ValidationReport | null;
  topology: Topology;
  cliConfigs: Record<string, string>;
  onRunValidation: () => void;
}

export function ValidationDrawer({
  report,
  topology,
  cliConfigs,
  onRunValidation,
}: ValidationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'validation' | 'cli' | 'ip'>('validation');
  const [selectedDeviceCli, setSelectedDeviceCli] = useState<string>(
    topology.devices[0]?.hostname || ''
  );
  const [copied, setCopied] = useState(false);

  const errorsCount = report?.errors?.length || 0;
  const warningsCount = report?.warnings?.length || 0;
  const infoCount = report?.info?.length || 0;

  const handleCopyCli = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCli = (hostname: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hostname}_config.cfg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentCli =
    cliConfigs[selectedDeviceCli] ||
    cliConfigs[topology.devices[0]?.hostname] ||
    '! No configuration generated yet.';

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 transition-all duration-200 flex flex-col shadow-2xl ${
        isOpen ? 'h-72' : 'h-11'
      }`}
    >
      {/* Drawer Bar Header */}
      <div className="h-11 px-4 flex items-center justify-between bg-slate-950 border-b border-slate-800/80 select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span>Diagnostic & Output Panel</span>
          </button>

          {/* Status Badges */}
          <div className="flex items-center gap-2 text-xs">
            {errorsCount > 0 ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertCircle className="w-3 h-3" /> {errorsCount} Error{errorsCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Topology Valid
              </span>
            )}
            {warningsCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-3 h-3" /> {warningsCount} Warning{warningsCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Tab Switcher & Validate Button */}
        <div className="flex items-center gap-2">
          {isOpen && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('validation')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'validation'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Validation ({errorsCount + warningsCount})
              </button>
              <button
                onClick={() => setActiveTab('cli')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'cli'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3 h-3" /> Cisco CLI
              </button>
              <button
                onClick={() => setActiveTab('ip')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'ip'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TableIcon className="w-3 h-3" /> IP Addressing
              </button>
            </div>
          )}
          <button
            onClick={onRunValidation}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Re-validate
          </button>
        </div>
      </div>

      {/* Drawer Content Body */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900/90 text-xs">
          {/* TAB 1: VALIDATION REPORT */}
          {activeTab === 'validation' && (
            <div className="space-y-2">
              {errorsCount === 0 && warningsCount === 0 && infoCount === 0 ? (
                <div className="flex items-center gap-2 text-emerald-400 p-3 bg-emerald-950/20 border border-emerald-800/40 rounded">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    No validation issues detected! Physical connections, port compatibility, and IP subnets are consistent.
                  </span>
                </div>
              ) : (
                <>
                  {report?.errors?.map((err, idx) => (
                    <div
                      key={`err_${idx}`}
                      className="p-2.5 bg-rose-950/30 border border-rose-800/50 rounded flex items-start gap-2.5 text-rose-200"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-rose-300">
                          [{err.code}] {err.message}
                        </div>
                        {err.suggestion && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Fix suggestion: {err.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {report?.warnings?.map((warn, idx) => (
                    <div
                      key={`warn_${idx}`}
                      className="p-2.5 bg-amber-950/30 border border-amber-800/50 rounded flex items-start gap-2.5 text-amber-200"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-amber-300">
                          [{warn.code}] {warn.message}
                        </div>
                        {warn.suggestion && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Fix suggestion: {warn.suggestion}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* TAB 2: CISCO CLI CONFIGURATIONS */}
          {activeTab === 'cli' && (
            <div className="h-full flex flex-col space-y-2">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Select Device:</span>
                  <select
                    value={selectedDeviceCli || topology.devices[0]?.hostname}
                    onChange={(e) => setSelectedDeviceCli(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 font-mono text-slate-100"
                  >
                    {topology.devices.map((d) => (
                      <option key={d.id} value={d.hostname}>
                        {d.hostname} ({d.model})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCli(currentCli)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy CLI'}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadCli(selectedDeviceCli || topology.devices[0]?.hostname, currentCli)
                    }
                    className="flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 rounded text-white font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .cfg</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-y-auto whitespace-pre">
                {currentCli}
              </div>
            </div>
          )}

          {/* TAB 3: IP ADDRESSING TABLE */}
          {activeTab === 'ip' && (
            <div className="space-y-3">
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2">Subnet Name</th>
                      <th className="p-2">Network CIDR</th>
                      <th className="p-2">Subnet Mask</th>
                      <th className="p-2">Usable Host Range</th>
                      <th className="p-2">Gateway IP</th>
                      <th className="p-2">Broadcast</th>
                      <th className="p-2">Usable Hosts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {topology.subnets.length > 0 ? (
                      topology.subnets.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-800/40">
                          <td className="p-2 font-bold text-sky-400">{sub.name}</td>
                          <td className="p-2">{sub.network_address}/{sub.prefix_length}</td>
                          <td className="p-2">{sub.subnet_mask}</td>
                          <td className="p-2 text-emerald-400">
                            {sub.usable_host_start} - {sub.usable_host_end}
                          </td>
                          <td className="p-2 text-amber-300">{sub.gateway_ip || 'N/A'}</td>
                          <td className="p-2">{sub.broadcast_address}</td>
                          <td className="p-2">{sub.total_usable_hosts}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-500 italic">
                          No subnets allocated yet. Use the IP planner to calculate VLSM subnets.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

