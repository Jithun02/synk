'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { FolderPlus, Layers, Sparkles, X, Check } from 'lucide-react';

interface NewWorkspaceModalProps {
  onClose: () => void;
}

export const NewWorkspaceModal: React.FC<NewWorkspaceModalProps> = ({ onClose }) => {
  const { canvases, createWorkspace } = useCanvasStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Enterprise Architecture');
  const [icon, setIcon] = useState('N');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createWorkspace(name.trim(), category.trim(), icon.trim().toUpperCase() || 'W', selectedTemplateId || undefined);
    onClose();
  };

  const presetIcons = ['S', 'F', 'E', 'H', 'Z', 'A', 'M', 'D', 'C', 'R'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-900 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FolderPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create Custom Workspace</h2>
              <p className="text-xs text-slate-500">Design custom B2B system architectures</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Workspace Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI Customer Service Engine"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Category / Industry
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Cloud Security, SaaS, FinTech"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Icon Badge
            </label>
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              {presetIcons.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center transition ${
                    icon === ic
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-1'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Starter Template (Optional)
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 transition"
            >
              <option value="">✨ Blank Architecture Canvas</option>
              {Object.values(canvases).map((ws) => (
                <option key={ws.id} value={ws.id}>
                  Copy from: {ws.name} ({ws.category})
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm transition"
            >
              <Check size={14} />
              <span>Create Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
