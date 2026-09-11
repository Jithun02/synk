'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { STRIDECategory } from '../../types/canvas';
import { ShieldAlert, AlertTriangle, CheckCircle, X, ChevronRight, Cpu } from 'lucide-react';

interface ThreatModelingDrawerProps {
  onClose: () => void;
}

export const ThreatModelingDrawer: React.FC<ThreatModelingDrawerProps> = ({ onClose }) => {
  const { strideThreats, objects } = useCanvasStore();

  const strideCategories: STRIDECategory[] = [
    'Spoofing',
    'Tampering',
    'Repudiation',
    'Information Disclosure',
    'Denial of Service',
    'Elevation of Privilege',
  ];

  return (
    <div className="fixed right-4 top-20 bottom-6 z-40 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-5 flex flex-col space-y-4 select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">STRIDE THREAT MODEL</h3>
            <p className="text-[11px] text-slate-400">Cybersecurity Vulnerability Audit</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
          <X size={18} />
        </button>
      </div>

      {/* Mode Banner */}
      <div className="p-2.5 bg-red-950/50 border border-red-800/60 rounded-xl text-xs space-y-1">
        <div className="font-bold text-red-300 flex items-center justify-between">
          <span>🔍 Threat Modeling Mode Active</span>
          <span className="text-[10px] bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded">
            STRIDE Standard
          </span>
        </div>
        <p className="text-[11px] text-slate-300">
          Trust boundaries and attack surfaces highlighted. Review vulnerabilities below.
        </p>
      </div>

      {/* STRIDE Category Pills */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {strideCategories.map((cat) => {
          const count = strideThreats.filter((t) => t.strideCategory === cat).length;
          return (
            <span
              key={cat}
              className={`text-[10px] px-2 py-1 rounded-md border font-medium ${
                count > 0
                  ? 'bg-amber-950/60 border-amber-700/80 text-amber-200 font-bold'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
              }`}
            >
              {cat} ({count})
            </span>
          );
        })}
      </div>

      {/* Threat List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {strideThreats.map((threat, idx) => {
          const targetObj = objects[threat.objectId];
          return (
            <div
              key={`${threat.id}_${idx}`}
              className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs space-y-2 hover:border-red-500/50 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-300 flex items-center space-x-1">
                  <AlertTriangle size={13} className="text-red-400" />
                  <span>{threat.title}</span>
                </span>
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 text-[9px] font-bold rounded uppercase">
                  {threat.severity}
                </span>
              </div>

              <div className="text-[11px] text-slate-300">{threat.description}</div>

              <div className="text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800 space-y-1">
                <div><strong className="text-slate-200">Target Node:</strong> {targetObj?.text || 'Component'}</div>
                <div><strong className="text-slate-200">Boundary:</strong> {threat.trustBoundary}</div>
                <div className="text-emerald-400"><strong className="text-slate-200">Mitigation:</strong> {threat.mitigation}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
