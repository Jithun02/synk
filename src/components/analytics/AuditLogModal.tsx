'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Shield, Clock, X } from 'lucide-react';

interface AuditLogModalProps {
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ onClose }) => {
  const { auditLogs } = useCanvasStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-bold">🧾 Immutable Canvas Audit Log</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No operations recorded yet</div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.eventId}
                className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-1 bg-slate-700 font-mono text-[10px] text-blue-300 font-bold rounded">
                    {log.type}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-200">{log.description}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Author: {log.userName} ({log.userId})
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-slate-400 font-mono text-[10px]">
                  <Clock size={12} />
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
