'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { ToolType } from '../../types/canvas';
import {
  MousePointer,
  Hand,
  Pen,
  Square,
  ArrowUpRight,
  Type,
  StickyNote,
  HelpCircle,
  Minus,
  Plus,
  Grid,
  Undo2,
  Redo2,
  Wand2,
} from 'lucide-react';

export const MainToolbar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    zoom,
    setZoom,
    gridSnap,
    toggleGridSnap,
    historyIndex,
    history,
    jumpToHistoryIndex,
    arrangeAutoLayout,
    currentUser,
  } = useCanvasStore();

  const isReadOnly = currentUser.role === 'viewer';
  const isCommentOnly = currentUser.role === 'commenter';

  const tools: { type: ToolType; icon: React.ReactNode; label: string }[] = [
    { type: 'select', icon: <MousePointer size={18} />, label: 'Select (V)' },
    { type: 'pen', icon: <Pen size={18} />, label: 'Pen (P)' },
    { type: 'rectangle', icon: <Square size={18} />, label: 'Rectangle (R)' },
    { type: 'connector', icon: <ArrowUpRight size={18} />, label: 'Connector (C)' },
    { type: 'text', icon: <Type size={18} />, label: 'Text (T)' },
    { type: 'sticky', icon: <StickyNote size={18} />, label: 'Sticky Note (S)' },
    { type: 'pan', icon: <Hand size={18} />, label: 'Pan (H)' },
  ];

  return (
    <>
      {/* Left Floating Vertical Dock */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-1 bg-white p-1.5 rounded-xl shadow-lg border border-slate-200 select-none">
        {tools.map((t) => {
          const isActive = activeTool === t.type;
          const isDisabled = (isReadOnly || isCommentOnly) && t.type !== 'select' && t.type !== 'pan' && (t.type !== 'sticky' || isReadOnly);
          return (
            <button
              key={t.type}
              disabled={isDisabled}
              onClick={() => setActiveTool(t.type)}
              className={`p-2.5 rounded-lg transition relative group ${
                isActive
                  ? 'bg-purple-100 text-purple-700 font-semibold'
                  : isDisabled
                  ? 'opacity-30 cursor-not-allowed text-slate-400'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
              title={isDisabled ? `🔒 Locked for role "${currentUser.role.toUpperCase()}"` : t.label}
            >
              {t.icon}
              <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded shadow-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-30">
                {isDisabled ? `🔒 Read-only for ${currentUser.role}` : t.label}
              </span>
            </button>
          );
        })}

        <div className="h-px bg-slate-100 my-1" />

        {/* Auto-Layout Wand Button */}
        <button
          onClick={arrangeAutoLayout}
          className="p-2.5 rounded-lg text-purple-600 hover:bg-purple-50 transition relative group"
          title="Auto-Layout Graph (Align Tier DAG)"
        >
          <Wand2 size={18} />
          <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded shadow-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-30">
            Auto-Layout Diagram
          </span>
        </button>

        <div className="h-px bg-slate-100 my-1" />

        {/* Undo / Redo */}
        <button
          onClick={() => historyIndex > 0 && jumpToHistoryIndex(historyIndex - 1)}
          disabled={historyIndex <= 0}
          className="p-2.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-30 disabled:hover:bg-transparent"
          title="Undo"
        >
          <Undo2 size={18} />
        </button>

        <button
          onClick={() =>
            historyIndex < history.length - 1 && jumpToHistoryIndex(historyIndex + 1)
          }
          disabled={historyIndex >= history.length - 1}
          className="p-2.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-30 disabled:hover:bg-transparent"
          title="Redo"
        >
          <Redo2 size={18} />
        </button>
      </div>

      {/* Bottom Left Dock: Help, Zoom, Grid */}
      <div className="fixed left-4 bottom-6 z-20 flex items-center space-x-2 select-none">
        {/* Help Button */}
        <button
          className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-lg shadow-md border border-slate-200 transition"
          title="Help & Shortcuts (?)"
        >
          <HelpCircle size={16} />
        </button>

        {/* Zoom Controller & Grid */}
        <div className="flex items-center space-x-2 bg-white px-2.5 py-1.5 rounded-lg shadow-md border border-slate-200 text-xs font-semibold text-slate-700">
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
            className="p-1 text-slate-500 hover:text-slate-800 transition"
          >
            <Minus size={14} />
          </button>

          <span className="w-12 text-center font-mono">{Math.round(zoom * 100)}%</span>

          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            className="p-1 text-slate-500 hover:text-slate-800 transition"
          >
            <Plus size={14} />
          </button>

          <div className="w-px h-4 bg-slate-200 mx-1" />

          <button
            onClick={toggleGridSnap}
            className={`p-1 rounded transition ${
              gridSnap ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Toggle Dot Grid (#)"
          >
            <Grid size={14} />
          </button>
        </div>
      </div>
    </>
  );
};
