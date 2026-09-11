'use client';

import React, { useState, useEffect } from 'react';
import { Bot, Command, Wand2, ArrowRight } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

interface AIFloatingBarProps {
  onOpenAI: () => void;
}

export const AIFloatingBar: React.FC<AIFloatingBarProps> = ({ onOpenAI }) => {
  const { aiGenerateDiagram } = useCanvasStore();
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenAI();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAI]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      onOpenAI();
      return;
    }
    aiGenerateDiagram(prompt.trim());
    setPrompt('');
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-full max-w-xl px-4">
      <form
        onSubmit={handleSubmit}
        className="flex items-center space-x-2 px-3 py-2 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-2xl shadow-2xl border border-slate-800 transition focus-within:border-purple-500/70"
      >
        <button
          type="button"
          onClick={onOpenAI}
          className="flex items-center space-x-1.5 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 transition shrink-0"
        >
          <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="font-bold text-[11px]">synk AI</span>
        </button>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask synk AI (e.g. AWS Serverless, Healthcare HIPAA, Fintech Payment)..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none px-1"
        />

        <button
          type="submit"
          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1 shrink-0"
        >
          <Wand2 size={13} />
          <span>Generate</span>
        </button>

        <button
          type="button"
          onClick={onOpenAI}
          title="Open Full AI Suite (Cmd+K)"
          className="flex items-center space-x-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-[10px] font-mono shrink-0 transition"
        >
          <Command size={10} />
          <span>K</span>
        </button>
      </form>
    </div>
  );
};

