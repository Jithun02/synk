'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { UserRole } from '../../types/canvas';
import { Users, UserPlus, Shield, Check, X, Lock, Eye, MessageSquare, Edit3, Crown, Mail } from 'lucide-react';

interface TeamPermissionsModalProps {
  onClose: () => void;
}

export const TeamPermissionsModal: React.FC<TeamPermissionsModalProps> = ({ onClose }) => {
  const {
    currentUser,
    collaborationUsers,
    addTeamMember,
    updateUserRole,
    setUserRole,
  } = useCanvasStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('editor');

  const [activeTab, setActiveTab] = useState<'members' | 'test_role'>('members');
  const [notification, setNotification] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const [isSendingMail, setIsSendingMail] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    addTeamMember(name.trim(), email.trim(), selectedRole);

    const link = typeof window !== 'undefined'
      ? `${window.location.origin}/?join=true&userName=${encodeURIComponent(name.trim())}&userRole=${selectedRole}&room=synk_cloud_8H72KD`
      : '';

    if (navigator.clipboard && link) {
      navigator.clipboard.writeText(link);
    }

    setIsSendingMail(true);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role: selectedRole,
          joinUrl: link,
          inviterName: currentUser.name,
        }),
      });

      const data = await res.json();
      if (data.mailtoUrl && typeof window !== 'undefined') {
        window.open(data.mailtoUrl, '_blank');
      }
      notify(`📧 Invitation email prepared for ${email} & join link copied to clipboard!`);
    } catch (err) {
      notify(`✓ Invited ${name} & copied join link!`);
    } finally {
      setIsSendingMail(false);
    }

    setName('');
    setEmail('');
  };

  const copyMemberLink = (memberName: string, memberRole: UserRole) => {
    const link = typeof window !== 'undefined'
      ? `${window.location.origin}/?join=true&userName=${encodeURIComponent(memberName)}&userRole=${memberRole}&room=synk_cloud_8H72KD`
      : '';
    if (navigator.clipboard && link) {
      navigator.clipboard.writeText(link);
      notify(`✓ Copied join link for ${memberName}!`);
    }
  };

  const allMembers = [currentUser, ...Object.values(collaborationUsers)];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full flex items-center space-x-1 border border-amber-200"><Crown size={10} /><span>OWNER</span></span>;
      case 'editor':
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full flex items-center space-x-1 border border-indigo-200"><Edit3 size={10} /><span>EDITOR</span></span>;
      case 'commenter':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full flex items-center space-x-1 border border-purple-200"><MessageSquare size={10} /><span>COMMENTER</span></span>;
      case 'viewer':
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full flex items-center space-x-1 border border-slate-200"><Eye size={10} /><span>VIEWER</span></span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-900 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Workspace Team & RBAC Permissions</h2>
              <p className="text-xs text-slate-500">Manage member roles and access controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {notification && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
            {notification}
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
            <UserPlus size={14} className="text-indigo-600" />
            <span>Invite Collaborator</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
            <div className="flex items-center space-x-1.5">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="owner">Owner (Full)</option>
                <option value="editor">Editor (Can edit)</option>
                <option value="commenter">Commenter</option>
                <option value="viewer">Viewer (Read-only)</option>
              </select>
              <button
                type="submit"
                disabled={isSendingMail}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1 whitespace-nowrap"
              >
                <Mail size={12} />
                <span>{isSendingMail ? 'Sending...' : 'Email Invite'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Member List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Team Members ({allMembers.length})
            </span>
            <span className="text-[11px] text-slate-400">Live Role-Based Access Control</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {allMembers.map((user) => {
              const isSelf = user.id === currentUser.id;
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center text-white ring-2 ring-slate-100"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                        <span>{user.name}</span>
                        {isSelf && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {user.isOnline ? '🟢 Online' : '⚪ Offline'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getRoleBadge(user.role)}
                    <button
                      type="button"
                      onClick={() => copyMemberLink(user.name, user.role)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] rounded-lg transition"
                      title="Copy Shareable Join Link for this teammate"
                    >
                      🔗 Copy Link
                    </button>
                    <select
                      value={user.role}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        updateUserRole(user.id, newRole);
                        notify(`Updated ${user.name}'s role to ${newRole.toUpperCase()}`);
                      }}
                      className="bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="owner">Owner</option>
                      <option value="editor">Editor</option>
                      <option value="commenter">Commenter</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Permissions Matrix Legend */}
        <div className="border-t border-slate-100 pt-3 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
            <Shield size={12} className="text-indigo-600" />
            <span>RBAC Permissions Legend</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <strong className="text-slate-900 block font-semibold">👑 Owner:</strong> Full admin access. Create, edit, delete, branch, and manage permissions.
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <strong className="text-slate-900 block font-semibold">✏️ Editor:</strong> Create & move nodes, edit text, auto-layout, connect architecture shapes.
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <strong className="text-slate-900 block font-semibold">💬 Commenter:</strong> Read-only architecture view with permission to leave sticky feedback notes.
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <strong className="text-slate-900 block font-semibold">🔒 Viewer:</strong> Strict read-only mode. Drawing tools disabled.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
