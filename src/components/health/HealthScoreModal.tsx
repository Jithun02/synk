'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Activity, ShieldCheck, Zap, Cpu, Eye, Wand2, X } from 'lucide-react';

interface HealthScoreModalProps {
  onClose: () => void;
}

export const HealthScoreModal: React.FC<HealthScoreModalProps> = ({ onClose }) => {
  const { healthScore, fixHealthScore100 } = useCanvasStore();

  const handleAiFix = () => {
    fixHealthScore100();
    onClose();
  };

  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ARCHITECTURE HEALTH SCORE</h2>
              <p className="text-xs text-slate-400">Multi-Dimensional Engineering & Observability Score</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        {/* Overall Score Badge */}
        <div className="p-5 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Architecture Rating</div>
            <div className="text-3xl font-black text-white mt-1 flex items-baseline space-x-2">
              <span>{healthScore.overall}%</span>
              <span className="text-xs font-semibold text-emerald-400">Grade: A-</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Evaluated across 5 production engineering pillars</p>
          </div>
          <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center font-extrabold text-2xl shadow-inner ${getScoreColor(healthScore.overall)}`}>
            {healthScore.overall}%
          </div>
        </div>

        {/* 5 Pillars Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span className="flex items-center space-x-1"><ShieldCheck size={14} className="text-emerald-400" /><span>Security</span></span>
              <span className="text-emerald-400">{healthScore.security}%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full" style={{ width: `${healthScore.security}%` }} />
            </div>
          </div>

          <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span className="flex items-center space-x-1"><Zap size={14} className="text-blue-400" /><span>Reliability</span></span>
              <span className="text-blue-400">{healthScore.reliability}%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full" style={{ width: `${healthScore.reliability}%` }} />
            </div>
          </div>

          <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span className="flex items-center space-x-1"><Cpu size={14} className="text-amber-400" /><span>Scalability</span></span>
              <span className="text-amber-400">{healthScore.scalability}%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full" style={{ width: `${healthScore.scalability}%` }} />
            </div>
          </div>

          <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span className="flex items-center space-x-1"><Eye size={14} className="text-purple-400" /><span>Observability</span></span>
              <span className="text-purple-400">{healthScore.observability}%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-400 h-full" style={{ width: `${healthScore.observability}%` }} />
            </div>
          </div>
        </div>

        {/* Recommendations & Fix Button */}
        {healthScore.missingItems.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Identified Gaps</span>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs text-slate-300">
              {healthScore.missingItems.map((item, idx) => (
                <div key={idx}>{item}</div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleAiFix}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
        >
          <Wand2 size={16} />
          <span>Fix Weaknesses & Auto-Optimize with AI</span>
        </button>
      </div>
    </div>
  );
};
