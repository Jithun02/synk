'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { AICanvasAgent } from '../../lib/ai';
import { Bot, Shield, Cpu, CheckCircle, Wand2, X, AlertTriangle, BrainCircuit } from 'lucide-react';

interface AIAgentModalProps {
  onClose: () => void;
}

export const AIAgentModal: React.FC<AIAgentModalProps> = ({ onClose }) => {
  const { objects, securityIssues, aiGenerateDiagram, runSecurityAudit, fixSecurityIssue } = useCanvasStore();
  const [promptInput, setPromptInput] = useState('');
  const [activeTab, setActiveTab] = useState<'generate' | 'explain' | 'audit'>('generate');
  const [explanationText, setExplanationText] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    aiGenerateDiagram(promptInput.trim());
    setPromptInput('');
    onClose();
  };

  const handleExplain = () => {
    const text = AICanvasAgent.explainCanvas(Object.values(objects));
    setExplanationText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-purple-400 animate-pulse" />
            <h2 className="text-lg font-bold">🤖 synk AI Agent</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex border-b border-slate-800 space-x-4">
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'generate' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🪄 Prompt → Canvas
          </button>
          <button
            onClick={() => {
              setActiveTab('explain');
              handleExplain();
            }}
            className={`pb-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'explain' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🧠 Explain Canvas
          </button>
          <button
            onClick={() => {
              setActiveTab('audit');
              runSecurityAudit();
            }}
            className={`pb-2 text-xs font-bold border-b-2 transition flex items-center space-x-1 ${
              activeTab === 'audit' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={14} />
            <span>Security Audit</span>
            {securityIssues.length > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] rounded-full">
                {securityIssues.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'generate' && (
          <div className="space-y-4">
            <form onSubmit={handleGenerate} className="space-y-3">
              <label className="text-xs font-bold text-slate-300">
                Enter your architectural or visual prompt:
              </label>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Create a microservices e-commerce architecture with Auth Service, Order Service, API Gateway, and PostgreSQL database..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition"
                >
                  <Wand2 size={15} />
                  <span>Generate AI Diagram</span>
                </button>
              </div>
            </form>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400">Preset Architecture Templates:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Healthcare HIPAA Pipeline',
                  'AWS Cloud Serverless Stack',
                  'Fintech Payment Gateway',
                  'Kubernetes Cluster Deployment',
                  'Microservices E-Commerce Stack',
                  'Auth Pipeline & OAuth Gateway',
                ].map((tpl) => (
                  <button
                    key={tpl}
                    onClick={() => {
                      aiGenerateDiagram(tpl);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-medium rounded-lg border border-slate-700 hover:border-purple-500/50 transition"
                  >
                    + {tpl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'explain' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
              {explanationText}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-3">
            {securityIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-xl border border-slate-700 text-slate-400 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400 mb-2" />
                <span className="font-bold text-slate-200">No Security Vulnerabilities Detected!</span>
                <span className="text-xs">Your system architecture adheres to gateway separation best practices.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {securityIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start justify-between p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs space-x-3"
                  >
                    <div className="flex items-start space-x-2.5">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold text-red-300 flex items-center space-x-2">
                          <span>{issue.title}</span>
                          <span className="px-1.5 py-0.5 bg-red-600/50 text-red-200 text-[9px] rounded font-mono uppercase">
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-slate-300">{issue.description}</p>
                        <p className="text-slate-400 text-[11px]">💡 {issue.fixSuggestion}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => fixSecurityIssue(issue.id)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow shrink-0 transition"
                    >
                      Fix Issue
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
