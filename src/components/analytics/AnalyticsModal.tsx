'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { BarChart2, Users, Layers, Edit3, MessageSquare, Clock, X } from 'lucide-react';

interface AnalyticsModalProps {
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ onClose }) => {
  const { objects, history, collaborationUsers, comments, currentUser } = useCanvasStore();

  const activeUsersCount = Object.keys(collaborationUsers).length + 1;
  const objectList = Object.values(objects);
  const totalEdits = history.length;
  const totalComments = comments.length;

  const roleCounts: Record<string, number> = {};
  for (const obj of objectList) {
    const role = obj.semanticRole || 'generic';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-bold">📊 Real-Time Collaboration Analytics</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Users size={14} className="text-emerald-400" />
              <span>Active Users</span>
            </div>
            <div className="text-2xl font-extrabold text-white">{activeUsersCount}</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Layers size={14} className="text-blue-400" />
              <span>Canvas Objects</span>
            </div>
            <div className="text-2xl font-extrabold text-white">{objectList.length}</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Edit3 size={14} className="text-purple-400" />
              <span>Total Operations</span>
            </div>
            <div className="text-2xl font-extrabold text-white">{totalEdits}</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <MessageSquare size={14} className="text-amber-400" />
              <span>Comments</span>
            </div>
            <div className="text-2xl font-extrabold text-white">{totalComments}</div>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-800 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Semantic Element Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(roleCounts).map(([role, count]) => (
              <div
                key={role}
                className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl"
              >
                <span className="text-xs font-semibold capitalize text-slate-200">{role}</span>
                <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 font-mono text-xs rounded-full border border-blue-400/30">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
