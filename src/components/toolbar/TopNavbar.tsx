'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { NewWorkspaceModal } from '../workspace/NewWorkspaceModal';
import { TeamPermissionsModal } from '../team/TeamPermissionsModal';
import { SecurityCenterModal } from '../security/SecurityCenterModal';
import { ThreatModelingDrawer } from '../threat/ThreatModelingDrawer';
import { DocGeneratorModal } from '../docs/DocGeneratorModal';
import { IaCExportModal } from '../iac/IaCExportModal';
import { HealthScoreModal } from '../health/HealthScoreModal';
import { IncidentModeBanner } from '../incident/IncidentModeBanner';
import { IntegrationsModal } from '../integrations/IntegrationsModal';
import {
  Sparkles,
  GitBranch,
  History,
  Shield,
  Search,
  Share2,
  ChevronDown,
  Download,
  Plus,
  Users,
  Crown,
  Edit3,
  Eye,
  MessageSquare,
  Lock,
  ShieldAlert,
  AlertCircle,
  Activity,
  FileText,
  Code2,
  Globe,
} from 'lucide-react';

interface TopNavbarProps {
  onOpenAI: () => void;
  onOpenBranching: () => void;
  onOpenTimeMachine: () => void;
  onOpenAnalytics: () => void;
  onOpenAuditLog: () => void;
  onOpenSearch: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenAI,
  onOpenBranching,
  onOpenTimeMachine,
  onOpenAnalytics,
  onOpenAuditLog,
  onOpenSearch,
}) => {
  const {
    roomCode,
    activeBranchId,
    branches,
    securityIssues,
    objects,
    canvases,
    activeCanvasId,
    switchCanvas,
    currentUser,
    collaborationUsers,
    isThreatMode,
    toggleThreatMode,
    isIncidentMode,
    toggleIncidentMode,
    healthScore,
  } = useCanvasStore();

  const [copied, setCopied] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isNewWorkspaceModalOpen, setIsNewWorkspaceModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isSecurityCenterOpen, setIsSecurityCenterOpen] = useState(false);
  const [isDocGenOpen, setIsDocGenOpen] = useState(false);
  const [isIaCExportOpen, setIsIaCExportOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);

  const currentCanvas = canvases[activeCanvasId] || {
    id: 'saas_architecture',
    name: 'SaaS Architecture',
    category: 'Cloud Infrastructure',
    icon: 'S',
  };

  const handleShare = () => {
    setIsTeamModalOpen(true);
  };

  const handleExportPDF = () => {
    const mainCanvas = document.querySelector('canvas');
    if (!mainCanvas) return;

    const pdfCanvas = document.createElement('canvas');
    pdfCanvas.width = mainCanvas.width || 1920;
    pdfCanvas.height = (mainCanvas.height || 1080) + 90;
    const ctx = pdfCanvas.getContext('2d');
    if (!ctx) return;

    // Pure White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);

    // Header Title & Metadata
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText(`synk · ${currentCanvas.name}`, 40, 42);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`Exported: ${new Date().toLocaleString()} | Active Branch: ${activeBranchId}`, 40, 64);

    // Divider Line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 78);
    ctx.lineTo(pdfCanvas.width - 40, 78);
    ctx.stroke();

    // Draw main canvas content
    ctx.drawImage(mainCanvas, 0, 90);

    const dataUrl = pdfCanvas.toDataURL('image/png');
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>synk Architecture Export</title>
            <style>
              body { margin: 0; padding: 20px; background: #ffffff; font-family: sans-serif; text-align: center; }
              img { max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
              @media print {
                body { padding: 0; }
                img { border: none; box-shadow: none; width: 100%; }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="setTimeout(function(){ window.print(); }, 500);" />
          </body>
        </html>
      `);
      printWin.document.close();
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `synk_${activeBranchId}_${Date.now()}.png`;
      a.click();
    }
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'owner':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold rounded-full flex items-center space-x-1"><Crown size={10} /><span>OWNER</span></span>;
      case 'editor':
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-extrabold rounded-full flex items-center space-x-1"><Edit3 size={10} /><span>EDITOR</span></span>;
      case 'commenter':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-extrabold rounded-full flex items-center space-x-1"><MessageSquare size={10} /><span>COMMENTER</span></span>;
      case 'viewer':
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-extrabold rounded-full flex items-center space-x-1"><Lock size={10} /><span>READ ONLY</span></span>;
    }
  };

  return (
    <>
      {isIncidentMode && <IncidentModeBanner />}
      <header className="h-14 px-4 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between z-30 select-none shadow-xs">
        {/* Left Branding & Document Switcher */}
        <div className="flex items-center space-x-4">
          {/* synk Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-0.5">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block" />
              <span className="w-1.5 h-3 bg-indigo-400 rounded-full inline-block" />
              <span className="w-1.5 h-5 bg-indigo-600 rounded-full inline-block" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 font-sans flex items-center space-x-1">
              <span>synk</span>
              <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-mono font-normal">
                ENTERPRISE
              </span>
            </span>
          </div>

          {/* Document Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer transition text-left"
            >
              <div className="w-5 h-5 rounded bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                {currentCanvas.icon || 'S'}
              </div>
              <span className="font-semibold text-xs text-slate-800">{currentCanvas.name}</span>
              <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-medium ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Saved</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-1" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Select B2B Architecture Workspace
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                    {Object.keys(canvases).length} Workspaces
                  </span>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {Object.values(canvases).map((ws) => {
                    const isActive = ws.id === activeCanvasId;
                    return (
                      <button
                        key={ws.id}
                        onClick={() => {
                          switchCanvas(ws.id);
                          setIsWorkspaceMenuOpen(false);
                        }}
                        className={`w-full text-left flex items-center justify-between p-2 rounded-lg transition ${
                          isActive
                            ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium'
                            : 'hover:bg-slate-50 border border-transparent text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center ${
                              isActive
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {ws.icon}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{ws.name}</div>
                            <div className="text-[10px] text-slate-500">{ws.category}</div>
                          </div>
                        </div>
                        {isActive && (
                          <span className="text-indigo-600 text-xs font-bold bg-indigo-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Create Custom Workspace Action */}
                <div className="border-t border-slate-100 pt-1.5 mt-1">
                  <button
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      setIsNewWorkspaceModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition border border-indigo-200"
                  >
                    <Plus size={14} />
                    <span>+ Create Custom Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current User Role Badge */}
          {getRoleBadge()}
        </div>

        {/* Center Enterprise Action Modules */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={toggleThreatMode}
            className={`flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition ${
              isThreatMode
                ? 'bg-red-600 text-white border-red-700 shadow-sm'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
            }`}
            title="Toggle STRIDE Threat Modeling Mode"
          >
            <ShieldAlert size={14} />
            <span>STRIDE Threats</span>
          </button>

          <button
            onClick={toggleIncidentMode}
            className={`flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition ${
              isIncidentMode
                ? 'bg-red-700 text-white border-red-800 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Toggle Incident Response Mode"
          >
            <AlertCircle size={14} className="text-red-500" />
            <span>Incident Mode</span>
          </button>

          <button
            onClick={() => setIsHealthModalOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition"
            title="Architecture Health Score"
          >
            <Activity size={14} className="text-emerald-600" />
            <span>Health {healthScore.overall}%</span>
          </button>

          <button
            onClick={() => setIsDocGenOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg border border-indigo-200 transition"
            title="Generate Technical Spec & Documentation"
          >
            <FileText size={14} className="text-indigo-600" />
            <span>Spec Docs</span>
          </button>

          <button
            onClick={() => setIsIaCExportOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-lg border border-purple-200 transition"
            title="Export Terraform, Kubernetes, and Docker Compose Code"
          >
            <Code2 size={14} className="text-purple-600" />
            <span>Export IaC</span>
          </button>

          <button
            onClick={onOpenBranching}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition"
            title="Git Branches"
          >
            <GitBranch size={14} className="text-indigo-600" />
            <span>{activeBranchId}</span>
          </button>

          <button
            onClick={() => setIsSecurityCenterOpen(true)}
            className="p-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition relative shadow-xs"
            title="Enterprise Security Center"
          >
            <Shield size={15} className="text-emerald-400" />
          </button>
        </div>

        {/* Right User Stack & Integrations */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsIntegrationsModalOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
            title="Integrations & SaaS Tiers"
          >
            <Globe size={14} className="text-blue-600" />
            <span>Integrations</span>
          </button>

          {/* Collaborator Avatars */}
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="flex items-center -space-x-1.5 hover:opacity-90 transition cursor-pointer"
            title="Manage Team & RBAC Permissions"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">
              J
            </div>
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">
              A
            </div>
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white">
              M
            </div>
          </button>

          {/* Share & Manage Team Button */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <Users size={13} />
            <span>Team</span>
          </button>

          {/* Export PDF (White Background) */}
          <button
            onClick={handleExportPDF}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition"
            title="Export White Background PDF / Image"
          >
            <Download size={15} />
          </button>
        </div>

        {/* Modals & Drawers */}
        {isNewWorkspaceModalOpen && (
          <NewWorkspaceModal onClose={() => setIsNewWorkspaceModalOpen(false)} />
        )}
        {isTeamModalOpen && (
          <TeamPermissionsModal onClose={() => setIsTeamModalOpen(false)} />
        )}
        {isSecurityCenterOpen && (
          <SecurityCenterModal onClose={() => setIsSecurityCenterOpen(false)} />
        )}
        {isThreatMode && (
          <ThreatModelingDrawer onClose={toggleThreatMode} />
        )}
        {isDocGenOpen && (
          <DocGeneratorModal onClose={() => setIsDocGenOpen(false)} />
        )}
        {isIaCExportOpen && (
          <IaCExportModal onClose={() => setIsIaCExportOpen(false)} />
        )}
        {isHealthModalOpen && (
          <HealthScoreModal onClose={() => setIsHealthModalOpen(false)} />
        )}
        {isIntegrationsModalOpen && (
          <IntegrationsModal onClose={() => setIsIntegrationsModalOpen(false)} />
        )}
      </header>
    </>
  );
};


