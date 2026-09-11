'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { History, CheckCircle2 } from 'lucide-react';

export const Minimap: React.FC = () => {
  const { objects, zoom, panOffset } = useCanvasStore();
  const objList = Object.values(objects);

  return (
    <div className="fixed right-84 bottom-6 z-20 flex flex-col items-end space-y-2 select-none pointer-events-auto">
      {/* Floating Minimap Thumbnail Box */}
      <div className="w-36 h-24 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-md p-2 relative overflow-hidden">
        <div className="w-full h-full relative bg-slate-50/50 rounded-lg border border-slate-100">
          {objList.map((obj) => {
            const minX = Math.min(...objList.map((o) => o.x));
            const maxX = Math.max(...objList.map((o) => o.x + o.width));
            const minY = Math.min(...objList.map((o) => o.y));
            const maxY = Math.max(...objList.map((o) => o.y + o.height));
            const rangeX = Math.max(1, maxX - minX);
            const rangeY = Math.max(1, maxY - minY);

            const normX = ((obj.x - minX) / rangeX) * 100;
            const normY = ((obj.y - minY) / rangeY) * 100;
            const normW = Math.max(8, (obj.width / rangeX) * 100);
            const normH = Math.max(6, (obj.height / rangeY) * 100);

            return (
              <div
                key={obj.id}
                className="absolute rounded-xs bg-indigo-500/70 border border-indigo-600/40"
                style={{
                  left: `${Math.min(80, Math.max(5, normX))}%`,
                  top: `${Math.min(80, Math.max(5, normY))}%`,
                  width: `${Math.min(40, normW)}%`,
                  height: `${Math.min(30, normH)}%`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center space-x-4 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 shadow-xs text-[11px] text-slate-500 font-medium">
        <div className="flex items-center space-x-1 text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>All changes synced</span>
        </div>
        <div className="w-px h-3 bg-slate-200" />
        <div className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 cursor-pointer transition">
          <History size={12} />
          <span>History</span>
        </div>
      </div>
    </div>
  );
};
