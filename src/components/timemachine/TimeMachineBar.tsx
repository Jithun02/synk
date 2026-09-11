'use client';

import React, { useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Play, Pause, RotateCcw, GitBranch, X, FastForward } from 'lucide-react';

interface TimeMachineBarProps {
  onClose: () => void;
}

export const TimeMachineBar: React.FC<TimeMachineBarProps> = ({ onClose }) => {
  const {
    history,
    historyIndex,
    isPlaying,
    playbackSpeed,
    jumpToHistoryIndex,
    togglePlayback,
    setPlaybackSpeed,
    createBranch,
  } = useCanvasStore();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      const intervalMs = Math.max(1000 / playbackSpeed, 100);
      timer = setInterval(() => {
        const next = historyIndex + 1;
        if (next < history.length) {
          jumpToHistoryIndex(next);
        } else {
          togglePlayback();
        }
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, historyIndex, history.length, jumpToHistoryIndex, togglePlayback]);

  const currentEvent = historyIndex >= 0 ? history[historyIndex] : null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-3xl bg-slate-900/95 backdrop-blur-lg border border-slate-800 p-4 rounded-2xl shadow-2xl text-white space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h3 className="font-bold text-sm text-amber-300">⏪ Canvas Time Machine</h3>
          <span className="text-xs text-slate-400 font-mono">
            {historyIndex + 1} / {history.length} Events
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const name = prompt('Enter new branch name from this point in history:', `replay_${Date.now()}`);
              if (name) {
                createBranch(name);
                alert(`Created new canvas branch "${name}" from this replay snapshot!`);
              }
            }}
            className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 text-xs font-semibold rounded-md border border-indigo-700 transition"
          >
            <GitBranch size={13} />
            <span>Branch From Here</span>
          </button>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <input
          type="range"
          min="-1"
          max={history.length - 1}
          value={historyIndex}
          onChange={(e) => jumpToHistoryIndex(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>START (00:00)</span>
          <span>{currentEvent ? `${currentEvent.userName}: ${currentEvent.description}` : 'NOW'}</span>
          <span>NOW</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => jumpToHistoryIndex(-1)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition"
            title="Reset to Start"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={togglePlayback}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-md transition shadow"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Replay Session'}</span>
          </button>

          <div className="flex items-center space-x-1 bg-slate-800 rounded-md px-1.5 py-1">
            <FastForward size={13} className="text-slate-400" />
            {[0.5, 1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                  playbackSpeed === s ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => jumpToHistoryIndex(history.length - 1)}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md transition"
        >
          Jump to Now
        </button>
      </div>
    </div>
  );
};
