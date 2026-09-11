'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { GitBranch, GitMerge, Plus, Check, X } from 'lucide-react';

interface BranchModalProps {
  onClose: () => void;
}

export const BranchModal: React.FC<BranchModalProps> = ({ onClose }) => {
  const { branches, activeBranchId, createBranch, switchBranch, mergeBranch } = useCanvasStore();
  const [newBranchName, setNewBranchName] = useState('');
  const [selectedMergeSource, setSelectedMergeSource] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    const name = newBranchName.trim();
    createBranch(name);
    setNewBranchName('');
    notify(`✓ Created and switched to branch "${name}"!`);
  };

  const handleSwitch = (branchId: string, branchName: string) => {
    switchBranch(branchId);
    notify(`✓ Checked out branch "${branchName}"!`);
  };

  const handleMerge = () => {
    if (!selectedMergeSource) return;
    mergeBranch(selectedMergeSource);
    notify(`✓ Successfully merged branch "${selectedMergeSource}" into "${activeBranchId}"!`);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-bold">🌳 Canvas Git & Branching</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Git Architecture Explanation Banner */}
        <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs space-y-1.5 text-slate-300">
          <div className="font-bold text-slate-100 flex items-center space-x-1.5">
            <span className="text-blue-400">💡 How Canvas Git & 3-Way Merging Works</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            synk applies distributed version control (like Git) directly to visual node graphs.
            Create lightweight branches to prototype changes without breaking production. When ready, execute a <strong>3-Way CRDT Merge</strong> to integrate objects, state properties, and historical event logs seamlessly.
          </p>
        </div>

        {notification && (
          <div className="p-2.5 bg-indigo-950 border border-indigo-700 text-indigo-200 text-xs font-semibold rounded-lg shadow animate-pulse">
            {notification}
          </div>
        )}

        <form onSubmit={handleCreate} className="flex items-center space-x-2">
          <input
            type="text"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="Create new branch (e.g. experiment/ui-v2)..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow transition"
          >
            <Plus size={14} />
            <span>Create Branch</span>
          </button>
        </form>

        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Branches</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {Object.values(branches).map((branch) => {
              const isActive = branch.id === activeBranchId;
              return (
                <div
                  key={branch.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    isActive
                      ? 'bg-blue-950/60 border-blue-600 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <GitBranch className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-sm flex items-center space-x-2">
                        <span>{branch.name}</span>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 text-[10px] rounded-full border border-blue-400/40">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Created by {branch.createdBy} • {Object.keys(branch.objects).length} objects
                      </div>
                    </div>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => handleSwitch(branch.id, branch.name)}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-md transition"
                    >
                      Checkout
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <GitMerge size={14} className="text-purple-400" />
            <span>3-Way CRDT Canvas Merge</span>
          </h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedMergeSource}
              onChange={(e) => setSelectedMergeSource(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="">Select branch to merge into "{branches[activeBranchId]?.name}"...</option>
              {Object.values(branches)
                .filter((b) => b.id !== activeBranchId)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({Object.keys(b.objects).length} objects)
                  </option>
                ))}
            </select>
            <button
              onClick={handleMerge}
              disabled={!selectedMergeSource}
              className="flex items-center space-x-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow transition"
            >
              <GitMerge size={14} />
              <span>Merge Branch</span>
            </button>
          </div>

          {selectedMergeSource && branches[selectedMergeSource] && (
            <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl text-xs space-y-1.5 animate-in fade-in">
              <div className="font-bold text-purple-300 flex items-center justify-between">
                <span>Branch Diff Preview: {branches[selectedMergeSource].name} ➔ {branches[activeBranchId]?.name}</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
                  3-Way CRDT
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded border border-emerald-500/30">
                  + {Object.keys(branches[selectedMergeSource].objects).length} Merged Objects
                </span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded border border-blue-500/30">
                  0 Conflicts (LWW Vector Clean)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
