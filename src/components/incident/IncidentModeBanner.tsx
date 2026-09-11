'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert, X } from 'lucide-react';

export const IncidentModeBanner: React.FC = () => {
  const { activeIncident, toggleIncidentMode, resolveIncident } = useCanvasStore();
  const [isMitigateModalOpen, setIsMitigateModalOpen] = React.useState(false);

  if (!activeIncident) return null;

  return (
    <>
      <div className="bg-red-950/90 border-b border-red-800 text-white px-4 py-2.5 flex items-center justify-between z-30 select-none shadow-md backdrop-blur-sm animate-in slide-in-from-top duration-150">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-black animate-pulse">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xs uppercase tracking-wider text-red-200">
                🚨 ACTIVE INCIDENT RESPONSE MODE
              </span>
              <span className="px-2 py-0.5 bg-red-500 text-white font-extrabold text-[10px] rounded-full border border-red-400">
                {activeIncident.severity}
              </span>
            </div>
            <p className="text-xs text-red-100 font-semibold">{activeIncident.title}</p>
          </div>
        </div>

        {/* Timeline Highlights */}
        <div className="hidden md:flex items-center space-x-4 text-xs text-red-200">
          <div className="flex items-center space-x-1 font-mono">
            <Clock size={13} className="text-red-300" />
            <span>Elapsed: 20m 14s</span>
          </div>
          <div className="flex items-center space-x-1 font-semibold">
            <ShieldAlert size={13} className="text-red-300" />
            <span>Affected Nodes: {activeIncident.affectedObjectIds.length}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMitigateModalOpen(true)}
            className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg transition shadow-md border border-emerald-400 flex items-center space-x-1"
          >
            <CheckCircle2 size={14} />
            <span>🛡️ Solve & Mitigate Incident</span>
          </button>
          <button
            onClick={() => alert('✓ Incident Logged & Post-Mortem Exported to Security Center!')}
            className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition border border-red-600"
          >
            Export Log
          </button>
          <button
            onClick={toggleIncidentMode}
            className="p-1 text-red-300 hover:text-white rounded-lg hover:bg-red-900/60 transition"
            title="Exit Incident Mode"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Incident Mitigation Modal */}
      {isMitigateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150 text-white">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">AI Incident Root Cause & Mitigation Spec</h3>
                  <p className="text-xs text-slate-400">Automated Remediation Plan</p>
                </div>
              </div>
              <button
                onClick={() => setIsMitigateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl space-y-1">
                <div className="font-bold text-red-300">Root Cause Diagnosis:</div>
                <p className="text-slate-300">
                  Unindexed analytics batch query exhausted PostgreSQL connection pool (1000/1000 conns) causing cascading P99 latency spike to 4,200ms.
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1">
                <div className="font-bold text-emerald-400">Automated AI Solution:</div>
                <ul className="list-disc pl-4 text-slate-300 space-y-1">
                  <li>Provision 2x PostgreSQL Failover Read Replicas on active canvas.</li>
                  <li>Rate-limit incoming analytics batch request stream.</li>
                  <li>Clear latency alert status across Core Service nodes.</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsMitigateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resolveIncident();
                  setIsMitigateModalOpen(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center space-x-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Execute 1-Click Mitigation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
