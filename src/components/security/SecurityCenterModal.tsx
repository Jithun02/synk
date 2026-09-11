'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Shield, AlertTriangle, CheckCircle, Activity, Lock, Key, RefreshCw, X } from 'lucide-react';

interface SecurityCenterModalProps {
  onClose: () => void;
}

export const SecurityCenterModal: React.FC<SecurityCenterModalProps> = ({ onClose }) => {
  const { securityIssues, objects, healthScore } = useCanvasStore();

  const mockAuditEvents = [
    { id: '1', user: 'Alice Chen', action: 'Modified TLS Certificate', target: 'API Gateway', time: '10:24 AM', risk: 'LOW' },
    { id: '2', user: 'Bob (Backend)', action: 'Deleted WAF Proxy', target: 'Edge Ingress', time: '10:21 AM', risk: 'HIGH' },
    { id: '3', user: 'Jithun (Owner)', action: 'Restored WAF Rule #892', target: 'Edge Ingress', time: '10:19 AM', risk: 'INFO' },
    { id: '4', user: 'AI Agent', action: 'Applied Auto-Fix Encryption', target: 'Event Store', time: '10:15 AM', risk: 'MEDIUM' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>SECURITY CENTER</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full border border-emerald-400/30 font-mono">
                  ACTIVE GOVERNANCE
                </span>
              </h2>
              <p className="text-xs text-slate-400">Enterprise Security Dashboard & Audit Governance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Security Score
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 flex items-baseline space-x-1">
              <span>92</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-medium">✓ SOC2 & ISO 27001 Compliant</div>
          </div>

          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Critical Findings
            </div>
            <div className="text-2xl font-extrabold text-red-400">
              {securityIssues.length > 0 ? securityIssues.length : 1}
            </div>
            <div className="text-[10px] text-red-400 mt-1 font-medium">Requires immediate mitigation</div>
          </div>

          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Active Sessions
            </div>
            <div className="text-2xl font-extrabold text-blue-400">24</div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">3 active webhooks</div>
          </div>

          <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Failed Logins (24h)
            </div>
            <div className="text-2xl font-extrabold text-amber-400">3</div>
            <div className="text-[10px] text-amber-400 mt-1 font-medium">IP Blocklist enforced</div>
          </div>
        </div>

        {/* Security Recommendations & AI Audit Engine */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Activity size={14} className="text-indigo-400" />
              <span>Real-Time Security Rules Engine Findings</span>
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              Semantic Graph Scan
            </span>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-bold text-red-300 flex items-center justify-between">
                  <span>HIGH — Database Edge Exposure Warning</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] rounded">HIGH RISK</span>
                </div>
                <p className="text-slate-300 mt-1">
                  Architecture exposes database node directly without WAF / API Gateway boundary.
                </p>
                <div className="mt-2 font-mono text-[11px] bg-slate-900/80 p-2 rounded text-slate-400 border border-slate-800">
                  <strong className="text-emerald-400">Recommended Architecture:</strong> Internet ➔ WAF ➔ API Gateway ➔ Core Service ➔ Database
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Immutable Audit Log Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Lock size={14} className="text-purple-400" />
            <span>Immutable Governance Audit Log</span>
          </h3>

          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">User</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Target Component</th>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {mockAuditEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-2.5 font-semibold text-slate-100">{evt.user}</td>
                    <td className="p-2.5">{evt.action}</td>
                    <td className="p-2.5 font-mono text-slate-400">{evt.target}</td>
                    <td className="p-2.5 text-slate-400">{evt.time}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.risk === 'HIGH' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {evt.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
