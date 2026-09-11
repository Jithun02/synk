'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { AlertTriangle, Sparkles, Check, X } from 'lucide-react';

export const ConflictModal: React.FC = () => {
  const { conflicts, resolveConflict } = useCanvasStore();

  if (conflicts.length === 0) return null;

  const current = conflicts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-6 space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-300">⚔️ Concurrent Edit Conflict Detected</h2>
            <p className="text-xs text-slate-400">
              Multiple users edited object <span className="font-mono text-slate-200">{current.objectId}</span> simultaneously.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-bold text-sm text-emerald-400">{current.userA.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">Option A</span>
            </div>
            <div className="text-xs space-y-1 font-mono text-slate-300">
              <div>Text: "{current.userA.state.text || 'N/A'}"</div>
              <div>X: {current.userA.state.x}, Y: {current.userA.state.y}</div>
              <div>Color: {current.userA.state.strokeColor || 'N/A'}</div>
            </div>
            <button
              onClick={() => resolveConflict(current.id, 'userA')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition"
            >
              Keep Option A ({current.userA.name})
            </button>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-bold text-sm text-purple-400">{current.userB.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">Option B</span>
            </div>
            <div className="text-xs space-y-1 font-mono text-slate-300">
              <div>Text: "{current.userB.state.text || 'N/A'}"</div>
              <div>X: {current.userB.state.x}, Y: {current.userB.state.y}</div>
              <div>Color: {current.userB.state.strokeColor || 'N/A'}</div>
            </div>
            <button
              onClick={() => resolveConflict(current.id, 'userB')}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow transition"
            >
              Keep Option B ({current.userB.name})
            </button>
          </div>
        </div>

        <button
          onClick={() => resolveConflict(current.id, 'ai')}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
        >
          <Sparkles size={16} className="text-cyan-300" />
          <span>AI Smart Merge (Combine both edits)</span>
        </button>
      </div>
    </div>
  );
};
