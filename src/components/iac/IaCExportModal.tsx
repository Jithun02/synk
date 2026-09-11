'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { IaCFormat } from '../../types/canvas';
import { generateIaC } from '../../lib/codeGen';
import { Code2, Copy, Download, Check, X, Terminal, Cpu } from 'lucide-react';

interface IaCExportModalProps {
  onClose: () => void;
}

export const IaCExportModal: React.FC<IaCExportModalProps> = ({ onClose }) => {
  const { objects, activeCanvasId, canvases } = useCanvasStore();
  const [selectedFormat, setSelectedFormat] = useState<IaCFormat>('terraform');
  const [copied, setCopied] = useState(false);

  const currentCanvas = canvases[activeCanvasId] || { name: 'Architecture' };
  const generatedCode = generateIaC(Object.values(objects), selectedFormat);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = selectedFormat === 'terraform' ? 'tf' : selectedFormat === 'kubernetes' ? 'yaml' : 'yml';
    const filename = `${currentCanvas.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_iac.${ext}`;
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-6 space-y-5 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <Code2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Architecture ➔ Code / IaC Generator</span>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded-full border border-purple-400/30">
                  DEVOPS READY
                </span>
              </h2>
              <p className="text-xs text-slate-400">Compile visual semantic models directly into infrastructure code</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 flex-shrink-0">
          <button
            onClick={() => setSelectedFormat('terraform')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedFormat === 'terraform'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Terminal size={14} />
            <span>Terraform (main.tf)</span>
          </button>

          <button
            onClick={() => setSelectedFormat('kubernetes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedFormat === 'kubernetes'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Cpu size={14} />
            <span>Kubernetes (deployment.yaml)</span>
          </button>

          <button
            onClick={() => setSelectedFormat('docker_compose')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              selectedFormat === 'docker_compose'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Code2 size={14} />
            <span>Docker Compose (docker-compose.yml)</span>
          </button>
        </div>

        {/* Code Editor Viewport */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-purple-200 leading-relaxed shadow-inner">
          <pre className="whitespace-pre-wrap">{generatedCode}</pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 flex-shrink-0">
          <span className="text-xs text-slate-400 font-mono">
            Output validated against AWS & Cloud Native Cloud Foundation specifications
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition border border-slate-700"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg shadow-sm transition"
            >
              <Download size={14} />
              <span>Download IaC Spec</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
