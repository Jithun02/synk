'use client';

import React, { useState } from 'react';
import { CanvasEngine } from '../components/canvas/CanvasEngine';
import { TopNavbar } from '../components/toolbar/TopNavbar';
import { MainToolbar } from '../components/toolbar/MainToolbar';
import { StylePropertiesPanel } from '../components/toolbar/StylePropertiesPanel';
import { TimeMachineBar } from '../components/timemachine/TimeMachineBar';
import { BranchModal } from '../components/git/BranchModal';
import { AIAgentModal } from '../components/ai/AIAgentModal';
import { AIFloatingBar } from '../components/ai/AIFloatingBar';
import { ConflictModal } from '../components/conflict/ConflictModal';
import { CanvasSearch } from '../components/search/CanvasSearch';
import { Minimap } from '../components/search/Minimap';
import { AnalyticsModal } from '../components/analytics/AnalyticsModal';
import { AuditLogModal } from '../components/analytics/AuditLogModal';
import { RightSidebar } from '../components/sidebar/RightSidebar';

export default function Home() {
  const [showAI, setShowAI] = useState(false);
  const [showBranching, setShowBranching] = useState(false);
  const [showTimeMachine, setShowTimeMachine] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-50 font-sans">
      <TopNavbar
        onOpenAI={() => setShowAI(true)}
        onOpenBranching={() => setShowBranching(true)}
        onOpenTimeMachine={() => setShowTimeMachine(true)}
        onOpenAnalytics={() => setShowAnalytics(true)}
        onOpenAuditLog={() => setShowAuditLog(true)}
        onOpenSearch={() => setShowSearch(true)}
      />

      <div className="relative flex-1 w-full h-full overflow-hidden flex flex-row">
        {/* Canvas Engine */}
        <div className="relative flex-1 h-full overflow-hidden">
          <CanvasEngine />
          <MainToolbar />
          <StylePropertiesPanel />
          <AIFloatingBar onOpenAI={() => setShowAI(true)} />
          <Minimap />

          {showTimeMachine && <TimeMachineBar onClose={() => setShowTimeMachine(false)} />}
        </div>

        {/* Right Layers & Connected Sidebar */}
        <RightSidebar onOpenSearch={() => setShowSearch(true)} />
      </div>

      {showBranching && <BranchModal onClose={() => setShowBranching(false)} />}
      {showAI && <AIAgentModal onClose={() => setShowAI(false)} />}
      {showAnalytics && <AnalyticsModal onClose={() => setShowAnalytics(false)} />}
      {showAuditLog && <AuditLogModal onClose={() => setShowAuditLog(false)} />}
      {showSearch && <CanvasSearch onClose={() => setShowSearch(false)} />}

      <ConflictModal />
    </main>
  );
}
