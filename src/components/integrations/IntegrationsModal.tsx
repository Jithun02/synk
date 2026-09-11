'use client';

import React, { useState } from 'react';
import { Globe, X, Check, Key, ShieldCheck, Server, Lock, AlertCircle, RefreshCw } from 'lucide-react';

interface IntegrationsModalProps {
  onClose: () => void;
}

interface IntegrationItem {
  id: string;
  name: string;
  desc: string;
  status: 'Connected' | 'Available';
  icon: string;
  fields: { key: string; label: string; placeholder: string; type?: string; value: string }[];
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'integrations' | 'pricing'>('integrations');
  const [selectedItem, setSelectedItem] = useState<IntegrationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    {
      id: 'github',
      name: 'GitHub',
      desc: 'Bi-directional architecture sync & PR checks',
      status: 'Connected',
      icon: '🐙',
      fields: [
        { key: 'repo', label: 'Repository (org/repo)', placeholder: 'acme-corp/infrastructure', value: 'synk-org/enterprise-arch' },
        { key: 'token', label: 'Personal Access Token / OAuth', placeholder: 'ghp_xxxxxxxxxxxx', type: 'password', value: 'ghp_9847291847291847918' },
        { key: 'branch', label: 'Default Architecture Branch', placeholder: 'main', value: 'main' },
      ],
    },
    {
      id: 'jira',
      name: 'Jira Software',
      desc: 'Sync canvas objects with Jira tickets',
      status: 'Connected',
      icon: '🔷',
      fields: [
        { key: 'domain', label: 'Jira Domain', placeholder: 'company.atlassian.net', value: 'enterprise.atlassian.net' },
        { key: 'apiToken', label: 'API Key / User Token', placeholder: 'ATATT3xFfGF0...', type: 'password', value: 'ATATT3xFfGF0_secret' },
        { key: 'projectKey', label: 'Default Project Key', placeholder: 'ARCH', value: 'SYNK' },
      ],
    },
    {
      id: 'slack',
      name: 'Slack',
      desc: 'Real-time security alert webhooks',
      status: 'Connected',
      icon: '💬',
      fields: [
        { key: 'webhook', label: 'Incoming Webhook URL', placeholder: 'https://hooks.slack.com/services/...', value: 'https://hooks.slack.com/services/T00/B00/X00' },
        { key: 'channel', label: 'Alert Channel', placeholder: '#security-alerts', value: '#synk-security-notifications' },
      ],
    },
    {
      id: 'aws',
      name: 'AWS Cloud',
      desc: 'Live CloudWatch & VPC topology import',
      status: 'Available',
      icon: '☁️',
      fields: [
        { key: 'region', label: 'AWS Region', placeholder: 'us-east-1', value: 'us-east-1' },
        { key: 'accessKey', label: 'AWS Access Key ID', placeholder: 'AKIAIOSFODNN7EXAMPLE', value: '' },
        { key: 'secretKey', label: 'AWS Secret Access Key', placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', type: 'password', value: '' },
        { key: 'roleArn', label: 'IAM Role ARN (Optional)', placeholder: 'arn:aws:iam::123456789012:role/SynkAuditor', value: '' },
      ],
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      desc: 'Istio & K8s cluster state sync',
      status: 'Available',
      icon: '☸️',
      fields: [
        { key: 'clusterUrl', label: 'Kubernetes API Server Endpoint', placeholder: 'https://10.0.0.1:6443', value: '' },
        { key: 'kubeconfig', label: 'Service Account Token / Kubeconfig', placeholder: 'eyJhbGciOiJSUzI1NiIs...', type: 'password', value: '' },
        { key: 'namespace', label: 'Target Namespace', placeholder: 'prod-architecture', value: 'default' },
      ],
    },
    {
      id: 'terraform',
      name: 'Terraform Cloud',
      desc: 'Automated state file locking & plan',
      status: 'Available',
      icon: '🏗️',
      fields: [
        { key: 'org', label: 'Terraform Organization', placeholder: 'my-org-name', value: '' },
        { key: 'workspace', label: 'Workspace Name', placeholder: 'prod-aws-infrastructure', value: '' },
        { key: 'token', label: 'User / Team API Token', placeholder: 'tfp_xxxxxxxxxxxx', type: 'password', value: '' },
      ],
    },
  ]);

  const handleFieldChange = (fieldKey: string, newValue: string) => {
    if (!selectedItem) return;
    setSelectedItem({
      ...selectedItem,
      fields: selectedItem.fields.map((f) => (f.key === fieldKey ? { ...f, value: newValue } : f)),
    });
  };

  const handleSaveConnection = () => {
    if (!selectedItem) return;
    setIntegrations((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? { ...selectedItem, status: 'Connected' } : item))
    );
    showToast(`Successfully connected ${selectedItem.name} to synk workspace!`);
    setSelectedItem(null);
  };

  const handleDisconnect = () => {
    if (!selectedItem) return;
    const updatedFields = selectedItem.fields.map((f) => ({ ...f, value: '' }));
    setIntegrations((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? { ...item, status: 'Available', fields: updatedFields } : item))
    );
    showToast(`Disconnected ${selectedItem.name} integration.`);
    setSelectedItem(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white p-6 space-y-5 max-h-[88vh] overflow-y-auto relative">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 right-14 bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xl flex items-center space-x-2 animate-in fade-in zoom-in duration-200 z-50">
            <Check size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Enterprise Integrations & SaaS Model</h2>
              <p className="text-xs text-slate-400">Connect AWS, GitHub, Slack, Jira, K8s & Terraform directly to synk</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'integrations'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🔌 Toolchain Integrations
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'pricing'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            💎 B2B SaaS Tiers
          </button>
        </div>

        {activeTab === 'integrations' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {integrations.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-xl flex items-center justify-between hover:border-blue-500/50 hover:bg-slate-800 cursor-pointer transition group"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-blue-400 transition">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.status === 'Connected'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    {item.status}
                  </span>
                  <button className="text-[10px] font-bold px-2 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition">
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {/* Free */}
            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
              <div className="font-bold text-slate-300 uppercase text-[10px]">Developer</div>
              <div className="text-xl font-extrabold text-white">Free</div>
              <ul className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-700">
                <li>✓ 1 Workspace</li>
                <li>✓ 3 Users</li>
                <li>✓ Basic Canvas</li>
              </ul>
            </div>

            {/* Pro */}
            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
              <div className="font-bold text-slate-300 uppercase text-[10px]">Pro</div>
              <div className="text-xl font-extrabold text-white">$29 <span className="text-xs text-slate-400">/mo</span></div>
              <ul className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-700">
                <li>✓ Unlimited Canvases</li>
                <li>✓ Version Control</li>
                <li>✓ AI Assistant</li>
              </ul>
            </div>

            {/* Business */}
            <div className="p-4 bg-indigo-950/60 border border-indigo-600/80 rounded-xl space-y-2 relative shadow-lg">
              <span className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                POPULAR
              </span>
              <div className="font-bold text-indigo-300 uppercase text-[10px]">Business</div>
              <div className="text-xl font-extrabold text-white">$79 <span className="text-xs text-slate-400">/user/mo</span></div>
              <ul className="space-y-1 text-[11px] text-slate-300 pt-2 border-t border-indigo-800">
                <li>✓ Team RBAC Permissions</li>
                <li>✓ Audit Logs & Export</li>
                <li>✓ STRIDE Threat Model</li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
              <div className="font-bold text-purple-400 uppercase text-[10px]">Enterprise</div>
              <div className="text-xl font-extrabold text-white">Custom</div>
              <ul className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-700">
                <li>✓ SAML / SSO ready</li>
                <li>✓ Dedicated VPC</li>
                <li>✓ 24/7 SLA Support</li>
              </ul>
            </div>
          </div>
        )}

        {/* Credentials Configuration Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-150">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{selectedItem.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Connect {selectedItem.name}</h3>
                    <p className="text-[11px] text-slate-400">Enter API keys or credentials to connect to your project</p>
                  </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {selectedItem.fields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>{field.label}</span>
                    </label>
                    <input
                      type={field.type || 'text'}
                      value={field.value}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                {selectedItem.status === 'Connected' ? (
                  <button
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg text-xs font-semibold transition"
                  >
                    Disconnect Integration
                  </button>
                ) : (
                  <div className="text-[10px] text-slate-500">256-bit encrypted credential vault</div>
                )}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveConnection}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center space-x-1"
                  >
                    <Check size={14} />
                    <span>Save & Connect</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

