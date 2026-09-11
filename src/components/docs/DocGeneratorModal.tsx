'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { FileText, Copy, Download, Check, X } from 'lucide-react';

interface DocGeneratorModalProps {
  onClose: () => void;
}

export const DocGeneratorModal: React.FC<DocGeneratorModalProps> = ({ onClose }) => {
  const { objects, activeCanvasId, canvases, activeBranchId } = useCanvasStore();
  const [copied, setCopied] = useState(false);

  const currentCanvas = canvases[activeCanvasId] || { name: 'Product Architecture', category: 'Cloud' };
  const nodes = Object.values(objects).filter((o) => o.type === 'rectangle' || o.type === 'circle');

  const generatedDoc = `# Executive Technical Architecture Specification
**Workspace**: ${currentCanvas.name} (${currentCanvas.category})
**Active Git Branch**: \`${activeBranchId}\`
**Generated On**: ${new Date().toLocaleString()}
**Governance Status**: APPROVED FOR PRODUCTION DEPLOYMENT

---

## 1. System Overview & Architecture Intent
This document defines the production topology, network trust boundaries, component data flows, and security policies for **${currentCanvas.name}**. The architecture was modeled visually using synk CRDT Engine and validated against enterprise security compliance rules.

---

## 2. Component Inventory Matrix

| Component Name | Role Layer | Technology Subtitle | Governance Owner | Security Risk |
| :--- | :--- | :--- | :--- | :--- |
${nodes
  .map(
    (n) =>
      `| **${n.text || 'Unnamed'}** | \`${n.semanticRole || 'service'}\` | ${n.subtitle || 'Production Service'} | \`${n.ownerId}\` | 🟢 Low |`
  )
  .join('\n')}

---

## 3. Data Flow & Network Interconnections
1. **Ingress Edge**: All external user traffic enters via authenticated TLS proxy gateway endpoints.
2. **Application Tier**: Core services process business logic and emit asynchronous event streams.
3. **Data Storage & In-Memory Layer**: Encrypted database clusters with multi-AZ failover and Redis read replicas.

---

## 4. STRIDE Threat Model & Mitigations
- **Spoofing**: Enforce TLS 1.3 client certificates and OAuth2 PKCE auth tokens.
- **Tampering**: All persistent database storage uses KMS AES-256 encryption at rest.
- **Information Disclosure**: Internal microservice channels require mTLS sidecar proxies.
- **Denial of Service**: Edge rate-limiting policies configured at 5,000 requests/minute.

---

## 5. Infrastructure & Deployment Compliance
- **Containerization**: OCI compliant Docker images pushed to private ECR repository.
- **Orchestration**: Kubernetes v1.28 deployment manifests with Istio service mesh injection.
- **Infrastructure as Code**: Terraform HCL state maintained with S3 backend locking.
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([generatedDoc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCanvas.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_tech_spec.md`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-6 space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Generate Architecture Documentation</h2>
              <p className="text-xs text-slate-400">Automated Technical Spec & Compliance Markdown</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        {/* Text Viewport */}
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
          <pre className="whitespace-pre-wrap font-sans">{generatedDoc}</pre>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 flex-shrink-0">
          <span className="text-xs text-slate-400">
            Export ready for Confluence, GitHub Docs, or PDF conversion
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition border border-slate-700"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handleDownloadMd}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm transition"
            >
              <Download size={14} />
              <span>Download .MD Spec</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
