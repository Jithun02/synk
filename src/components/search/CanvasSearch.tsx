'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Search, MapPin, X } from 'lucide-react';

interface CanvasSearchProps {
  onClose: () => void;
}

export const CanvasSearch: React.FC<CanvasSearchProps> = ({ onClose }) => {
  const { objects, focusObject } = useCanvasStore();
  const [query, setQuery] = useState('');

  const filtered = Object.values(objects).filter((o) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      o.text?.toLowerCase().includes(q) ||
      o.semanticRole?.toLowerCase().includes(q) ||
      o.type.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold">🔍 Canvas Object Search</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search objects, text labels, or roles (e.g. database)..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          autoFocus
        />

        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">No matching canvas objects found</div>
          ) : (
            filtered.map((obj) => (
              <div
                key={obj.id}
                onClick={() => {
                  focusObject(obj.id);
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition"
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: obj.strokeColor || '#3b82f6' }}
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-200">
                      {obj.text || `${obj.type.toUpperCase()} (${obj.id})`}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Role: {obj.semanticRole || 'generic'} • Type: {obj.type}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-blue-400 text-[11px] font-semibold">
                  <MapPin size={12} />
                  <span>Focus Camera</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
