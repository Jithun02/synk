'use client';

import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { SemanticRole } from '../../types/canvas';
import {
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Circle,
  Command,
  Sliders,
  Type,
  Tag,
  FileText,
  Layers as LayersIcon,
  Palette,
  Trash2,
} from 'lucide-react';

interface RightSidebarProps {
  onClose?: () => void;
  onOpenSearch?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onClose, onOpenSearch }) => {
  const {
    objects,
    selectedObjectIds,
    setSelectedObjectIds,
    focusObject,
    collaborationUsers,
    strokeColor,
    fillColor,
    strokeWidth,
    opacity,
    setStrokeColor,
    setFillColor,
    setStrokeWidth,
    setOpacity,
    updateObject,
    deleteObjects,
  } = useCanvasStore();

  const [activeTab, setActiveTab] = useState<'layers' | 'properties' | 'activity'>('layers');
  const [archOpen, setArchOpen] = useState(true);
  const [flowOpen, setFlowOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-switch to Properties tab when an object is selected
  useEffect(() => {
    if (selectedObjectIds.length > 0) {
      setActiveTab('properties');
    }
  }, [selectedObjectIds]);

  const objectList = Object.values(objects);
  const filteredObjects = searchTerm
    ? objectList.filter(
        (o) =>
          o.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.categoryTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.semanticRole?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : objectList;

  const firstObj = selectedObjectIds.length > 0 ? objects[selectedObjectIds[0]] : null;

  const colorPresets = [
    '#0f172a',
    '#6366f1',
    '#22c55e',
    '#ec4899',
    '#a855f7',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
  ];

  const fillPresets = [
    'transparent',
    '#ffffff',
    '#f0f9ff',
    '#e0e7ff',
    '#dcfce7',
    '#f3e8ff',
    '#fef3c7',
    '#fef9c3',
    '#fee2e2',
  ];

  const semanticRoles: { role: SemanticRole; label: string }[] = [
    { role: 'generic', label: 'Generic Node' },
    { role: 'service', label: '⚙️ Microservice' },
    { role: 'database', label: '🛢️ Database Engine' },
    { role: 'gateway', label: '🛡️ API Gateway' },
    { role: 'ui_component', label: '📱 Client Frontend' },
    { role: 'cache', label: '⚡ Redis Cache' },
    { role: 'arrow_dependency', label: '➡️ Dependency Stream' },
  ];

  const handleDelete = () => {
    deleteObjects(selectedObjectIds);
    setSelectedObjectIds([]);
    setActiveTab('layers');
  };

  return (
    <aside className="w-80 h-full bg-white border-l border-slate-200 flex flex-col z-20 select-none shadow-sm">
      {/* Header Tabs */}
      <div className="h-12 px-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('layers')}
            className={`text-xs font-semibold pb-3 mt-3 transition border-b-2 ${
              activeTab === 'layers'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Layers
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`text-xs font-semibold pb-3 mt-3 transition border-b-2 flex items-center space-x-1 ${
              activeTab === 'properties'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>Properties</span>
            {selectedObjectIds.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`text-xs font-semibold pb-3 mt-3 transition border-b-2 ${
              activeTab === 'activity'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Activity
          </button>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs text-slate-700">
        {activeTab === 'properties' ? (
          /* PROPERTIES TAB */
          firstObj ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2 font-bold text-xs text-slate-900">
                  <Sliders size={15} className="text-indigo-600" />
                  <span>Card Settings</span>
                </div>
                <button
                  onClick={handleDelete}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded transition"
                  title="Delete Selected Node (Delete/Backspace)"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Title / Label Input */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold flex items-center space-x-1">
                  <Type size={13} />
                  <span>Title / Label</span>
                </label>
                <input
                  type="text"
                  value={firstObj.text || ''}
                  onChange={(e) => {
                    for (const id of selectedObjectIds) {
                      updateObject(id, { text: e.target.value });
                    }
                  }}
                  placeholder="Enter title..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Category Tag Input */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold flex items-center space-x-1">
                  <Tag size={13} />
                  <span>Category Tag (ALL CAPS)</span>
                </label>
                <input
                  type="text"
                  value={firstObj.categoryTag || ''}
                  onChange={(e) => {
                    for (const id of selectedObjectIds) {
                      updateObject(id, { categoryTag: e.target.value.toUpperCase() });
                    }
                  }}
                  placeholder="e.g. APPLICATION, EDGE LAYER"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Subtitle Input */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold flex items-center space-x-1">
                  <FileText size={13} />
                  <span>Subtitle / Description</span>
                </label>
                <input
                  type="text"
                  value={firstObj.subtitle || ''}
                  onChange={(e) => {
                    for (const id of selectedObjectIds) {
                      updateObject(id, { subtitle: e.target.value });
                    }
                  }}
                  placeholder="e.g. Authentication · Routing"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Semantic Role Selector */}
              <div className="space-y-1">
                <label className="text-slate-500 font-semibold flex items-center space-x-1">
                  <LayersIcon size={13} />
                  <span>Semantic Role</span>
                </label>
                <select
                  value={firstObj.semanticRole || 'generic'}
                  onChange={(e) => {
                    for (const id of selectedObjectIds) {
                      updateObject(id, { semanticRole: e.target.value as SemanticRole });
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {semanticRoles.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Border Color */}
              <div className="space-y-1.5">
                <label className="text-slate-500 font-semibold flex items-center space-x-1">
                  <Palette size={13} />
                  <span>Border Color</span>
                </label>
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        setStrokeColor(c);
                        for (const id of selectedObjectIds) {
                          updateObject(id, { strokeColor: c });
                        }
                      }}
                      className={`w-5 h-5 rounded-full border border-slate-200 transition hover:scale-110 ${
                        firstObj.strokeColor === c ? 'ring-2 ring-indigo-500' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Background Fill */}
              <div className="space-y-1.5">
                <label className="text-slate-500 font-semibold">Background Fill</label>
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  {fillPresets.map((c) => (
                    <button
                      key={c}
                      style={{ backgroundColor: c === 'transparent' ? '#f1f5f9' : c }}
                      onClick={() => {
                        setFillColor(c);
                        for (const id of selectedObjectIds) {
                          updateObject(id, { fillColor: c });
                        }
                      }}
                      className={`w-5 h-5 rounded-full border border-slate-200 transition hover:scale-110 ${
                        firstObj.fillColor === c ? 'ring-2 ring-indigo-500' : ''
                      }`}
                      title={c === 'transparent' ? 'No Fill' : c}
                    />
                  ))}
                </div>
              </div>

              {/* Change Impact & Dependency Graph Section */}
              <div className="border-t border-slate-100 pt-3 space-y-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center justify-between">
                  <span>🔥 Change Impact & Graph Dependencies</span>
                  <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono">
                    SEMANTIC ENGINE
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Blast Radius Risk:</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] rounded-full">
                      MEDIUM IMPACT
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 font-mono">
                    <div><strong className="text-slate-800 font-sans">Direct Dependents:</strong> 3 microservices</div>
                    <div><strong className="text-slate-800 font-sans">Affected Teams:</strong> Core Backend, SecOps</div>
                    <div><strong className="text-slate-800 font-sans">Upstream Entry:</strong> Edge API Gateway</div>
                  </div>

                  <button
                    onClick={() => {
                      alert(`🔥 Change Impact Simulation triggered for "${firstObj.text}"!\n\nAffected downstream nodes: Core service ➔ Event store ➔ Insights engine.`);
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg transition shadow-xs flex items-center justify-center space-x-1"
                  >
                    <span>Simulate Outage Blast Radius</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <Sliders size={24} className="mx-auto text-slate-300" />
              <div className="font-semibold text-xs text-slate-600">No Node Selected</div>
              <div className="text-[11px] text-slate-400">
                Click any card or element on the canvas to inspect and edit properties.
              </div>
            </div>
          )
        ) : activeTab === 'layers' ? (
          /* LAYERS TAB */
          <>
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search canvas"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-12 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
              <div className="absolute right-2.5 top-2 flex items-center space-x-0.5 text-[10px] text-slate-400 font-mono">
                <Command size={10} />
                <span>F</span>
              </div>
            </div>

            {/* STRUCTURE Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Structure
                </span>
                <button className="p-0.5 text-slate-400 hover:text-slate-700 transition">
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-1">
                {/* Architecture Group */}
                <div>
                  <button
                    onClick={() => setArchOpen(!archOpen)}
                    className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded-md transition text-slate-700 font-medium"
                  >
                    <div className="flex items-center space-x-2">
                      {archOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                      <span className="font-semibold text-slate-800">Architecture</span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {filteredObjects.length}
                    </span>
                  </button>

                  {archOpen && (
                    <div className="pl-6 pt-1 space-y-0.5">
                      {filteredObjects.map((obj) => {
                        const isSelected = selectedObjectIds.includes(obj.id);
                        return (
                          <div
                            key={obj.id}
                            onClick={() => {
                              setSelectedObjectIds([obj.id]);
                              focusObject(obj.id);
                              setActiveTab('properties');
                            }}
                            className={`group flex items-center justify-between px-2 py-1 rounded-md cursor-pointer transition ${
                              isSelected
                                ? 'bg-indigo-50 text-indigo-700 font-medium'
                                : 'hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                              <span className="truncate">
                                {obj.text || obj.categoryTag || obj.type}
                              </span>
                            </div>
                            <MoreHorizontal
                              size={14}
                              className="text-slate-400 opacity-0 group-hover:opacity-100 transition"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Product Flow Group */}
                <div>
                  <button
                    onClick={() => setFlowOpen(!flowOpen)}
                    className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded-md transition text-slate-700 font-medium"
                  >
                    <div className="flex items-center space-x-2">
                      {flowOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      <span className="font-semibold text-slate-800">Product flow</span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono">4</span>
                  </button>

                  {flowOpen && (
                    <div className="pl-6 pt-1 space-y-0.5">
                      {[
                        { id: 'flow_1', name: 'Cart checkout flow', targetId: 'node_1' },
                        { id: 'flow_2', name: 'Payment webhook service', targetId: 'node_2' },
                        { id: 'flow_3', name: 'Order confirmation worker', targetId: 'node_3' },
                        { id: 'flow_4', name: 'Shipping notification queue', targetId: 'node_4' },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (objects[item.targetId]) {
                              setSelectedObjectIds([item.targetId]);
                              focusObject(item.targetId);
                              setActiveTab('properties');
                            }
                          }}
                          className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-slate-50 text-slate-600 cursor-pointer transition"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Research Notes Group */}
                <div>
                  <button
                    onClick={() => setResearchOpen(!researchOpen)}
                    className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 rounded-md transition text-slate-700 font-medium"
                  >
                    <div className="flex items-center space-x-2">
                      {researchOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      <span className="font-semibold text-slate-800">Research notes</span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono">8</span>
                  </button>

                  {researchOpen && (
                    <div className="pl-6 pt-1 space-y-0.5">
                      {[
                        { id: 'note_1', name: 'OAuth2 PKCE Security Spec', targetId: 'sticky_1' },
                        { id: 'note_2', name: 'Redis Sentinel Failover Plan', targetId: 'node_5' },
                        { id: 'note_3', name: 'PostgreSQL Index Optimization', targetId: 'node_4' },
                        { id: 'note_4', name: 'Kafka Event Stream Partitioning', targetId: 'node_3' },
                        { id: 'note_5', name: 'Rate Limiting Token Bucket', targetId: 'sticky_1' },
                        { id: 'note_6', name: 'CRDT Vector Clock Merging', targetId: 'node_4' },
                        { id: 'note_7', name: 'WAF Rule Set Checklist', targetId: 'node_2' },
                        { id: 'note_8', name: 'Microservices SLA Metrics', targetId: 'node_3' },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (objects[item.targetId]) {
                              setSelectedObjectIds([item.targetId]);
                              focusObject(item.targetId);
                              setActiveTab('properties');
                            }
                          }}
                          className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-slate-50 text-slate-600 cursor-pointer transition"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-4" />

            {/* CONNECTED Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Connected
                </span>
                <button className="p-0.5 text-slate-400 hover:text-slate-700 transition">
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {/* You */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      J
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">You</div>
                      <div className="text-[10px] text-slate-400">Editing</div>
                    </div>
                  </div>
                  <Circle size={8} className="text-emerald-500 fill-emerald-500" />
                </div>

                {/* Alice Chen */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Alice Chen</div>
                      <div className="text-[10px] text-slate-400">Editing · API gateway</div>
                    </div>
                  </div>
                  <Circle size={8} className="text-emerald-500 fill-emerald-500" />
                </div>

                {/* Maya Patel */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      M
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Maya Patel</div>
                      <div className="text-[10px] text-slate-400">Viewing</div>
                    </div>
                  </div>
                  <Circle size={8} className="text-slate-300 fill-slate-300" />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* ACTIVITY TAB */
          <div className="space-y-3 text-slate-500">
            <div className="text-[11px] font-medium text-slate-400">RECENT CHANGES</div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <div className="font-semibold text-slate-700">Alice Chen updated API gateway</div>
              <div className="text-[10px] text-slate-400">2 minutes ago</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              <div className="font-semibold text-slate-700">You added sticky note</div>
              <div className="text-[10px] text-slate-400">5 minutes ago</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
