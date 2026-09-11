import { create } from 'zustand';
import {
  CanvasObject,
  ToolType,
  CanvasUser,
  CanvasEvent,
  CanvasBranch,
  VisualConflict,
  CanvasComment,
  SecurityIssue,
  UserRole,
  ThreatItem,
  ArchitectureHealthScore,
  IncidentDetails,
} from '../types/canvas';
import { CRDTEngine } from '../lib/crdt';
import { AICanvasAgent } from '../lib/ai';
import { arrangeDAGLayout } from '../lib/autoLayout';
import { synkWS } from '../lib/websocket';
import { analyzeSTRIDEThreats, computeArchitectureHealth } from '../lib/threatEngine';

interface CanvasState {
  objects: Record<string, CanvasObject>;
  selectedObjectIds: string[];
  activeTool: ToolType;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  isThreatMode: boolean;
  isIncidentMode: boolean;
  activeIncident: IncidentDetails | null;
  strideThreats: ThreatItem[];
  healthScore: ArchitectureHealthScore;
  toggleThreatMode: () => void;
  toggleIncidentMode: () => void;
  resolveIncident: () => void;
  fixHealthScore100: () => void;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  fontSize: number;
  polygonSides: number;

  zoom: number;
  panOffset: { x: number; y: number };
  gridSnap: boolean;
  gridSize: number;

  branches: Record<string, CanvasBranch>;
  activeBranchId: string;

  history: CanvasEvent[];
  historyIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;

  currentUser: CanvasUser;
  collaborationUsers: Record<string, CanvasUser>;
  simulatingMultiUser: boolean;
  roomCode: string;
  isOffline: boolean;
  offlineQueue: CanvasEvent[];

  conflicts: VisualConflict[];
  comments: CanvasComment[];
  auditLogs: CanvasEvent[];
  securityIssues: SecurityIssue[];

  setActiveTool: (tool: ToolType) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setOpacity: (opacity: number) => void;
  setStrokeStyle: (style: 'solid' | 'dashed' | 'dotted') => void;
  setFontSize: (size: number) => void;
  setPolygonSides: (sides: number) => void;

  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPanOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  toggleGridSnap: () => void;
  focusObject: (objectId: string) => void;

  setSelectedObjectIds: (ids: string[]) => void;
  addObject: (obj: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'ownerId'> & { ownerId?: string }) => string;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  deleteObjects: (ids: string[]) => void;
  lockObject: (id: string, locked: boolean) => void;
  groupObjects: () => void;

  recordEvent: (type: CanvasEvent['type'], objectId: string, before?: Partial<CanvasObject>, after?: Partial<CanvasObject>, desc?: string) => void;
  jumpToHistoryIndex: (index: number) => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;

  canvases: Record<string, { id: string; name: string; category: string; icon: string; objects: Record<string, CanvasObject> }>;
  activeCanvasId: string;
  switchCanvas: (canvasId: string) => void;
  createWorkspace: (name: string, category: string, icon: string, starterTemplateId?: string) => string;
  addTeamMember: (name: string, email: string, role: UserRole) => void;
  updateUserRole: (userId: string, role: UserRole) => void;

  createBranch: (name: string) => string;
  switchBranch: (branchId: string) => void;
  mergeBranch: (sourceBranchId: string) => void;

  toggleMultiUserSim: () => void;
  setUserRole: (role: UserRole) => void;
  toggleOffline: () => void;
  resolveConflict: (conflictId: string, choice: 'userA' | 'userB' | 'ai') => void;

  addComment: (x: number, y: number, text: string, objectId?: string) => void;
  replyComment: (commentId: string, text: string) => void;
  resolveComment: (commentId: string) => void;

  runSecurityAudit: () => void;
  fixSecurityIssue: (issueId: string) => void;
  aiAutoCleanup: () => void;
  aiGenerateDiagram: (prompt: string) => void;
  arrangeAutoLayout: () => void;
}

const initialUser: CanvasUser = {
  id: 'user_me',
  name: 'Jithun',
  color: '#3b82f6',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
  role: 'owner',
  cursor: { x: 400, y: 300 },
  activeTool: 'select',
  selectedObjectIds: [],
  isOnline: true,
};

const defaultDemoObjects: Record<string, CanvasObject> = {
  node_1: {
    id: 'node_1',
    type: 'rectangle',
    x: 100,
    y: 180,
    width: 200,
    height: 100,
    rotation: 0,
    strokeColor: '#e2e8f0',
    fillColor: '#ffffff',
    strokeWidth: 1.5,
    opacity: 1,
    strokeStyle: 'solid',
    text: 'Customer app',
    categoryTag: 'ENTRY POINT',
    subtitle: 'Web & mobile clients',
    iconName: 'LayoutGrid',
    semanticRole: 'ui_component',
    ownerId: 'user_me',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  node_2: {
    id: 'node_2',
    type: 'rectangle',
    x: 360,
    y: 180,
    width: 200,
    height: 100,
    rotation: 0,
    strokeColor: '#818cf8',
    fillColor: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
    strokeStyle: 'solid',
    text: 'API gateway',
    categoryTag: 'EDGE LAYER',
    subtitle: 'Authentication · Routing',
    iconName: 'Command',
    semanticRole: 'gateway',
    activeUserEditing: { name: 'Alice is editing', color: '#ea580c' },
    ownerId: 'user_alice',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  node_3: {
    id: 'node_3',
    type: 'rectangle',
    x: 620,
    y: 180,
    width: 200,
    height: 100,
    rotation: 0,
    strokeColor: '#e2e8f0',
    fillColor: '#ffffff',
    strokeWidth: 1.5,
    opacity: 1,
    strokeStyle: 'solid',
    text: 'Core service',
    categoryTag: 'APPLICATION',
    subtitle: 'Business logic · Events',
    iconName: 'Sparkles',
    semanticRole: 'service',
    ownerId: 'user_me',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  node_4: {
    id: 'node_4',
    type: 'rectangle',
    x: 880,
    y: 100,
    width: 200,
    height: 100,
    rotation: 0,
    strokeColor: '#e2e8f0',
    fillColor: '#ffffff',
    strokeWidth: 1.5,
    opacity: 1,
    strokeStyle: 'solid',
    text: 'Event store',
    categoryTag: 'DATA',
    subtitle: 'CRDT history',
    iconName: 'Database',
    semanticRole: 'database',
    ownerId: 'user_me',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  node_5: {
    id: 'node_5',
    type: 'rectangle',
    x: 880,
    y: 260,
    width: 200,
    height: 100,
    rotation: 0,
    strokeColor: '#e2e8f0',
    fillColor: '#ffffff',
    strokeWidth: 1.5,
    opacity: 1,
    strokeStyle: 'solid',
    text: 'Insights engine',
    categoryTag: 'INTELLIGENCE',
    subtitle: 'Canvas understanding',
    iconName: 'Sun',
    semanticRole: 'database',
    ownerId: 'user_me',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  conn_1: {
    id: 'conn_1',
    type: 'connector',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    strokeColor: '#818cf8',
    fillColor: 'transparent',
    strokeWidth: 2,
    opacity: 1,
    strokeStyle: 'solid',
    fromObjectId: 'node_1',
    toObjectId: 'node_2',
    ownerId: 'user_me',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  conn_2: {
    id: 'conn_2',
    type: 'connector',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    strokeColor: '#818cf8',
    fillColor: 'transparent',
    strokeWidth: 2,
    opacity: 1,
    strokeStyle: 'solid',
    fromObjectId: 'node_2',
    toObjectId: 'node_3',
    ownerId: 'user_alice',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  conn_3: {
    id: 'conn_3',
    type: 'connector',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    strokeColor: '#a5b4fc',
    fillColor: 'transparent',
    strokeWidth: 2,
    opacity: 1,
    strokeStyle: 'solid',
    fromObjectId: 'node_3',
    toObjectId: 'node_4',
    ownerId: 'user_me',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  conn_4: {
    id: 'conn_4',
    type: 'connector',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    strokeColor: '#a5b4fc',
    fillColor: 'transparent',
    strokeWidth: 2,
    opacity: 1,
    strokeStyle: 'solid',
    fromObjectId: 'node_3',
    toObjectId: 'node_5',
    ownerId: 'user_me',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
  sticky_1: {
    id: 'sticky_1',
    type: 'sticky',
    x: 100,
    y: 340,
    width: 200,
    height: 140,
    rotation: 0,
    strokeColor: '#fef08a',
    fillColor: '#fef9c3',
    strokeWidth: 1,
    opacity: 1,
    strokeStyle: 'solid',
    text: 'Need rate limits\n\nCheck anonymous sessions before beta launch.',
    ownerId: 'user_me',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  },
};

const defaultDemoHistory: CanvasEvent[] = [
  {
    eventId: 'evt_1',
    timestamp: Date.now() - 600000,
    userId: 'user_me',
    userName: 'Jithun',
    type: 'CREATE',
    objectId: 'node_1',
    afterState: defaultDemoObjects.node_1,
    description: 'Created Customer app node',
  },
  {
    eventId: 'evt_2',
    timestamp: Date.now() - 540000,
    userId: 'user_alice',
    userName: 'Alice Chen',
    type: 'CREATE',
    objectId: 'node_2',
    afterState: defaultDemoObjects.node_2,
    description: 'Created API gateway node',
  },
  {
    eventId: 'evt_3',
    timestamp: Date.now() - 480000,
    userId: 'user_me',
    userName: 'Jithun',
    type: 'CREATE',
    objectId: 'node_3',
    afterState: defaultDemoObjects.node_3,
    description: 'Created Core service node',
  },
  {
    eventId: 'evt_4',
    timestamp: Date.now() - 420000,
    userId: 'user_me',
    userName: 'Jithun',
    type: 'CREATE',
    objectId: 'node_4',
    afterState: defaultDemoObjects.node_4,
    description: 'Created Event store node',
  },
  {
    eventId: 'evt_5',
    timestamp: Date.now() - 360000,
    userId: 'user_me',
    userName: 'Jithun',
    type: 'CREATE',
    objectId: 'node_5',
    afterState: defaultDemoObjects.node_5,
    description: 'Created Insights engine node',
  },
  {
    eventId: 'evt_6',
    timestamp: Date.now() - 300000,
    userId: 'user_me',
    userName: 'Jithun',
    type: 'CREATE',
    objectId: 'conn_1',
    afterState: defaultDemoObjects.conn_1,
    description: 'Connected Customer app to API gateway',
  },
  {
    eventId: 'evt_7',
    timestamp: Date.now() - 240000,
    userId: 'user_alice',
    userName: 'Alice Chen',
    type: 'CREATE',
    objectId: 'conn_2',
    afterState: defaultDemoObjects.conn_2,
    description: 'Connected API gateway to Core service',
  },
  {
    eventId: 'evt_8',
    timestamp: Date.now() - 180000,
    userId: 'user_me',
    userName: 'Jithun',
    type: 'CREATE',
    objectId: 'conn_3',
    afterState: defaultDemoObjects.conn_3,
    description: 'Connected Core service to Event store',
  },
  {
    eventId: 'evt_9',
    timestamp: Date.now() - 120000,
    userId: 'user_me',
    userName: 'Jithun',
    type: 'CREATE',
    objectId: 'conn_4',
    afterState: defaultDemoObjects.conn_4,
    description: 'Connected Core service to Insights engine',
  },
  {
    eventId: 'evt_10',
    timestamp: Date.now() - 60000,
    userId: 'user_me',
    userName: 'Jithun',
    type: 'CREATE',
    objectId: 'sticky_1',
    afterState: defaultDemoObjects.sticky_1,
    description: 'Added sticky note',
  },
];

const initialBranches: Record<string, CanvasBranch> = {
  main: {
    id: 'main',
    name: 'main',
    createdAt: Date.now() - 3600000,
    createdBy: 'user_me',
    objects: defaultDemoObjects,
    history: defaultDemoHistory,
  },
  'experiment/auth-v2': {
    id: 'experiment/auth-v2',
    name: 'experiment/auth-v2',
    createdAt: Date.now() - 1800000,
    createdBy: 'user_alice',
    objects: defaultDemoObjects,
    history: defaultDemoHistory,
  },
  'feature/redis-cache': {
    id: 'feature/redis-cache',
    name: 'feature/redis-cache',
    createdAt: Date.now() - 900000,
    createdBy: 'user_bob',
    objects: defaultDemoObjects,
    history: defaultDemoHistory,
  },
};

const b2bWorkspaces: Record<string, { id: string; name: string; category: string; icon: string; objects: Record<string, CanvasObject> }> = {
  saas_architecture: {
    id: 'saas_architecture',
    name: 'SaaS Architecture',
    category: 'Cloud Infrastructure',
    icon: 'S',
    objects: defaultDemoObjects,
  },
  fintech_gateway: {
    id: 'fintech_gateway',
    name: 'FinTech Payment Gateway',
    category: 'Financial Engineering',
    icon: 'F',
    objects: {
      node_1: {
        id: 'node_1',
        type: 'rectangle',
        x: 100,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#3b82f6',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Mobile Checkout',
        categoryTag: 'CLIENT INGRESS',
        subtitle: 'iOS / Android SDKs',
        iconName: 'Smartphone',
        semanticRole: 'ui_component',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_2: {
        id: 'node_2',
        type: 'rectangle',
        x: 360,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#10b981',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'TLS Gateway',
        categoryTag: 'ZERO TRUST EDGE',
        subtitle: 'mTLS · Tokenizer',
        iconName: 'ShieldCheck',
        semanticRole: 'gateway',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_3: {
        id: 'node_3',
        type: 'rectangle',
        x: 620,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#6366f1',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'PCI Auth Engine',
        categoryTag: 'TRANSACTION AUTH',
        subtitle: '3D Secure 2.0 · Visa Direct',
        iconName: 'CreditCard',
        semanticRole: 'service',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_4: {
        id: 'node_4',
        type: 'rectangle',
        x: 880,
        y: 100,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#f59e0b',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Fraud ML Predictor',
        categoryTag: 'AI RISK AUDIT',
        subtitle: 'Real-time Anomaly Scoring',
        iconName: 'BrainCircuit',
        semanticRole: 'database',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_5: {
        id: 'node_5',
        type: 'rectangle',
        x: 880,
        y: 260,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#8b5cf6',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Vault Ledger DB',
        categoryTag: 'ENCRYPTED DB',
        subtitle: 'PostgreSQL + HSM Vault',
        iconName: 'Database',
        semanticRole: 'database',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      conn_1: {
        id: 'conn_1',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#3b82f6', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_1', toObjectId: 'node_2', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_2: {
        id: 'conn_2',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#10b981', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_2', toObjectId: 'node_3', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_3: {
        id: 'conn_3',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#6366f1', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_3', toObjectId: 'node_4', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_4: {
        id: 'conn_4',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#6366f1', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_3', toObjectId: 'node_5', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      sticky_1: {
        id: 'sticky_1',
        type: 'sticky',
        x: 100,
        y: 340,
        width: 200,
        height: 140,
        rotation: 0,
        strokeColor: '#fef08a',
        fillColor: '#fef9c3',
        strokeWidth: 1,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'PCI-DSS v4.0 Compliance\n\nEnsure Tokenization key rotation every 90 days.',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
    },
  },
  ecommerce_platform: {
    id: 'ecommerce_platform',
    name: 'E-Commerce Platform',
    category: 'High-Scale Retail',
    icon: 'E',
    objects: {
      node_1: {
        id: 'node_1',
        type: 'rectangle',
        x: 100,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#ec4899',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Storefront Web',
        categoryTag: 'USER PORTAL',
        subtitle: 'Next.js App Router',
        iconName: 'ShoppingBag',
        semanticRole: 'ui_component',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_2: {
        id: 'node_2',
        type: 'rectangle',
        x: 360,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#06b6d4',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Cloudflare CDN',
        categoryTag: 'GLOBAL CACHE',
        subtitle: 'Edge Workers · ISR',
        iconName: 'Globe',
        semanticRole: 'gateway',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_3: {
        id: 'node_3',
        type: 'rectangle',
        x: 620,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#f97316',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Cart Engine',
        categoryTag: 'SESSION MESH',
        subtitle: 'Inventory Reservation',
        iconName: 'ShoppingCart',
        semanticRole: 'service',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_4: {
        id: 'node_4',
        type: 'rectangle',
        x: 880,
        y: 100,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#ef4444',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Redis Cluster',
        categoryTag: 'IN-MEMORY STORE',
        subtitle: '5M ops/sec Flash Cache',
        iconName: 'Zap',
        semanticRole: 'database',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_5: {
        id: 'node_5',
        type: 'rectangle',
        x: 880,
        y: 260,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#10b981',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Kafka Logistics Bus',
        categoryTag: 'EVENT STREAMING',
        subtitle: 'Order Fulfiller · Warehouse',
        iconName: 'Truck',
        semanticRole: 'database',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      conn_1: {
        id: 'conn_1',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#ec4899', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_1', toObjectId: 'node_2', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_2: {
        id: 'conn_2',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#06b6d4', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_2', toObjectId: 'node_3', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_3: {
        id: 'conn_3',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#f97316', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_3', toObjectId: 'node_4', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_4: {
        id: 'conn_4',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#f97316', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_3', toObjectId: 'node_5', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      sticky_1: {
        id: 'sticky_1',
        type: 'sticky',
        x: 100,
        y: 340,
        width: 200,
        height: 140,
        rotation: 0,
        strokeColor: '#fef08a',
        fillColor: '#fef9c3',
        strokeWidth: 1,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Flash Sale Warmup\n\nScale Redis read replicas to 8 instances for Black Friday.',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
    },
  },
  healthcare_hipaa: {
    id: 'healthcare_hipaa',
    name: 'Healthcare HIPAA Pipeline',
    category: 'MedTech Compliance',
    icon: 'H',
    objects: {
      node_1: {
        id: 'node_1',
        type: 'rectangle',
        x: 100,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#0d9488',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Patient Portal',
        categoryTag: 'HIPAA INGRESS',
        subtitle: 'Telehealth Video & Chat',
        iconName: 'Activity',
        semanticRole: 'ui_component',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_2: {
        id: 'node_2',
        type: 'rectangle',
        x: 360,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#2563eb',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'BAA Gateway',
        categoryTag: 'ZERO TRUST PROXY',
        subtitle: 'AES-256 GCM Ingress',
        iconName: 'Lock',
        semanticRole: 'gateway',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_3: {
        id: 'node_3',
        type: 'rectangle',
        x: 620,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#7c3aed',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'EHR PHI Vault',
        categoryTag: 'ENCRYPTED PHI',
        subtitle: 'FHIR v4.0 Schema',
        iconName: 'FileText',
        semanticRole: 'service',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_4: {
        id: 'node_4',
        type: 'rectangle',
        x: 880,
        y: 100,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#dc2626',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'HIPAA Audit Trail',
        categoryTag: 'IMMUTABLE AUDIT',
        subtitle: 'WORM Encrypted Ledger',
        iconName: 'ShieldAlert',
        semanticRole: 'database',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_5: {
        id: 'node_5',
        type: 'rectangle',
        x: 880,
        y: 260,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#059669',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Diagnostic AI Model',
        categoryTag: 'ANONYMIZED ML',
        subtitle: 'De-identified Radiography',
        iconName: 'Sparkles',
        semanticRole: 'database',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      conn_1: {
        id: 'conn_1',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#0d9488', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_1', toObjectId: 'node_2', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_2: {
        id: 'conn_2',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#2563eb', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_2', toObjectId: 'node_3', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_3: {
        id: 'conn_3',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#7c3aed', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_3', toObjectId: 'node_4', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_4: {
        id: 'conn_4',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#7c3aed', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_3', toObjectId: 'node_5', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      sticky_1: {
        id: 'sticky_1',
        type: 'sticky',
        x: 100,
        y: 340,
        width: 200,
        height: 140,
        rotation: 0,
        strokeColor: '#fef08a',
        fillColor: '#fef9c3',
        strokeWidth: 1,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'PHI Anonymization\n\nStrip SSN & DOBS before routing to Diagnostic AI model.',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
    },
  },
  cybersecurity_zerotrust: {
    id: 'cybersecurity_zerotrust',
    name: 'Cybersecurity Zero Trust',
    category: 'SecOps & IAM',
    icon: 'Z',
    objects: {
      node_1: {
        id: 'node_1',
        type: 'rectangle',
        x: 100,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#64748b',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Corporate Endpoint',
        categoryTag: 'UNTRUSTED NODE',
        subtitle: 'Device Posture Check',
        iconName: 'Laptop',
        semanticRole: 'ui_component',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_2: {
        id: 'node_2',
        type: 'rectangle',
        x: 360,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#4f46e5',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Identity Broker',
        categoryTag: 'mTLS & SAML',
        subtitle: 'Okta / Ping Identity',
        iconName: 'Key',
        semanticRole: 'gateway',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_3: {
        id: 'node_3',
        type: 'rectangle',
        x: 620,
        y: 180,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#0284c7',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Policy Engine',
        categoryTag: 'ABAC EVALUATOR',
        subtitle: 'Open Policy Agent (OPA)',
        iconName: 'Cpu',
        semanticRole: 'service',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_4: {
        id: 'node_4',
        type: 'rectangle',
        x: 880,
        y: 100,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#e11d48',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'SIEM Anomaly Detector',
        categoryTag: 'REALTIME ANOMALY',
        subtitle: 'Splunk / Sentinel Stream',
        iconName: 'Radio',
        semanticRole: 'database',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      node_5: {
        id: 'node_5',
        type: 'rectangle',
        x: 880,
        y: 260,
        width: 200,
        height: 100,
        rotation: 0,
        strokeColor: '#059669',
        fillColor: '#ffffff',
        strokeWidth: 1.5,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Microsegment FW',
        categoryTag: 'ISOLATION MESH',
        subtitle: 'eBPF Kernel Enforcer',
        iconName: 'Server',
        semanticRole: 'database',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      conn_1: {
        id: 'conn_1',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#64748b', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_1', toObjectId: 'node_2', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_2: {
        id: 'conn_2',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#4f46e5', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_2', toObjectId: 'node_3', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_3: {
        id: 'conn_3',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#0284c7', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_3', toObjectId: 'node_4', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      conn_4: {
        id: 'conn_4',
        type: 'connector',
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        strokeColor: '#0284c7', fillColor: 'transparent', strokeWidth: 2, opacity: 1, strokeStyle: 'solid',
        fromObjectId: 'node_3', toObjectId: 'node_5', ownerId: 'user_me', createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      },
      sticky_1: {
        id: 'sticky_1',
        type: 'sticky',
        x: 100,
        y: 340,
        width: 200,
        height: 140,
        rotation: 0,
        strokeColor: '#fef08a',
        fillColor: '#fef9c3',
        strokeWidth: 1,
        opacity: 1,
        strokeStyle: 'solid',
        text: 'Zero Trust Mandate\n\nRequire continuous device posture check every 5 minutes.',
        ownerId: 'user_me',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
    },
  },
};

export const useCanvasStore = create<CanvasState>((set, get) => ({
  objects: defaultDemoObjects,
  selectedObjectIds: [],
  activeTool: 'select',
  strokeColor: '#3b82f6',
  fillColor: '#eff6ff',
  strokeWidth: 2,
  opacity: 1,
  strokeStyle: 'solid',
  fontSize: 16,
  polygonSides: 6,

  zoom: 1,
  panOffset: { x: 0, y: 0 },
  gridSnap: true,
  gridSize: 20,

  isThreatMode: false,
  isIncidentMode: false,
  activeIncident: {
    id: 'inc_1092',
    title: 'Database Connection Exhaustion & Cascading Latency Spike',
    severity: 'CRITICAL',
    affectedObjectIds: ['node_3', 'node_4', 'node_5'],
    startTime: Date.now() - 1200000,
    status: 'ACTIVE',
    timeline: [
      { time: '10:21:04 AM', title: 'Connection pool 100% capacity alert', description: 'PostgreSQL max connections threshold (1000) reached.', severity: 'high' },
      { time: '10:24:12 AM', title: 'Cascading latency in Core Service', description: 'P99 response latency spiked from 12ms to 4200ms.', severity: 'critical' },
      { time: '10:27:45 AM', title: 'Automated Incident Response Triggered', description: 'Switched canvas to Incident Response Mode with blast radius map.', severity: 'info' },
    ],
    investigationNotes: [
      'Identified unindexed query on audit events table during analytics batch job.',
      'Action Item: Rate limit analytics queue and provision 2 read replicas.',
    ],
  },
  strideThreats: analyzeSTRIDEThreats(Object.values(defaultDemoObjects)),
  healthScore: computeArchitectureHealth(Object.values(defaultDemoObjects)),

  toggleThreatMode: () =>
    set((state) => ({
      isThreatMode: !state.isThreatMode,
      strideThreats: analyzeSTRIDEThreats(Object.values(state.objects)),
    })),

  toggleIncidentMode: () =>
    set((state) => ({
      isIncidentMode: !state.isIncidentMode,
    })),

  resolveIncident: () => {
    const state = get();
    const replicaNode: CanvasObject = {
      id: `node_inc_fix_${Date.now()}`,
      type: 'rectangle',
      x: 880,
      y: 420,
      width: 200,
      height: 100,
      rotation: 0,
      strokeColor: '#10b981',
      fillColor: '#ffffff',
      strokeWidth: 2,
      opacity: 1,
      strokeStyle: 'solid',
      text: 'DB Read Replicas (2x)',
      categoryTag: 'MITIGATION NODE',
      subtitle: 'PostgreSQL Failover Replica',
      iconName: 'Database',
      semanticRole: 'database',
      ownerId: state.currentUser.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    set({
      isIncidentMode: false,
      activeIncident: null,
      objects: { ...state.objects, [replicaNode.id]: replicaNode },
    });
    alert('✅ Incident Resolved & Mitigated! Added DB Read Replicas (2x) to stabilize query capacity.');
  },

  fixHealthScore100: () => {
    const state = get();
    const newGateway: CanvasObject = {
      id: `node_health_gw_${Date.now()}`,
      type: 'rectangle',
      x: 360,
      y: 50,
      width: 200,
      height: 90,
      rotation: 0,
      strokeColor: '#10b981',
      fillColor: '#ffffff',
      strokeWidth: 2,
      opacity: 1,
      strokeStyle: 'solid',
      text: 'WAF Edge Proxy',
      categoryTag: 'ZERO TRUST GATEWAY',
      subtitle: 'TLS 1.3 Ingress · DDoS Shield',
      iconName: 'ShieldCheck',
      semanticRole: 'gateway',
      ownerId: state.currentUser.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    const newRedis: CanvasObject = {
      id: `node_health_redis_${Date.now()}`,
      type: 'rectangle',
      x: 620,
      y: 50,
      width: 200,
      height: 90,
      rotation: 0,
      strokeColor: '#ef4444',
      fillColor: '#ffffff',
      strokeWidth: 2,
      opacity: 1,
      strokeStyle: 'solid',
      text: 'Redis Flash Cache',
      categoryTag: 'IN-MEMORY CACHE',
      subtitle: '500k ops/sec Cache Layer',
      iconName: 'Zap',
      semanticRole: 'cache',
      ownerId: state.currentUser.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    const newObjs = {
      ...state.objects,
      [newGateway.id]: newGateway,
      [newRedis.id]: newRedis,
    };

    set({
      objects: newObjs,
      healthScore: {
        overall: 100,
        security: 100,
        reliability: 100,
        scalability: 100,
        maintainability: 100,
        observability: 100,
        missingItems: [],
      },
    });
    alert('✨ 100% PERFECT HEALTH ACHIEVED! Added WAF Edge Proxy & Redis Flash Cache to architecture graph.');
  },

  canvases: b2bWorkspaces,
  activeCanvasId: 'saas_architecture',
  switchCanvas: (canvasId) => {
    const state = get();
    const targetCanvas = state.canvases[canvasId];
    if (!targetCanvas) return;

    const newHistory: CanvasEvent[] = Object.values(targetCanvas.objects).map((obj, i) => ({
      eventId: `evt_sw_${i}_${Date.now()}`,
      timestamp: Date.now() - (10 - i) * 60000,
      userId: 'user_me',
      userName: 'Jithun',
      type: 'CREATE',
      objectId: obj.id,
      afterState: obj,
      description: `Loaded ${obj.text || obj.type} node`,
    }));

    set({
      activeCanvasId: canvasId,
      objects: { ...targetCanvas.objects },
      history: newHistory,
      historyIndex: newHistory.length - 1,
      selectedObjectIds: [],
      branches: {
        ...state.branches,
        main: {
          ...state.branches.main,
          objects: { ...targetCanvas.objects },
          history: newHistory,
        },
      },
    });
  },

  createWorkspace: (name, category, icon, starterTemplateId) => {
    const state = get();
    const id = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    let templateObjects: Record<string, CanvasObject> = {};
    if (starterTemplateId && state.canvases[starterTemplateId]) {
      templateObjects = JSON.parse(JSON.stringify(state.canvases[starterTemplateId].objects));
    } else {
      const mainNode: CanvasObject = {
        id: 'node_start',
        type: 'rectangle',
        x: 300,
        y: 200,
        width: 220,
        height: 110,
        rotation: 0,
        strokeColor: '#3b82f6',
        fillColor: '#ffffff',
        strokeWidth: 2,
        opacity: 1,
        strokeStyle: 'solid',
        text: `${name} Root`,
        categoryTag: category.toUpperCase(),
        subtitle: 'Custom Architecture Workspace',
        iconName: 'LayoutGrid',
        semanticRole: 'service',
        ownerId: state.currentUser.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };
      templateObjects = { node_start: mainNode };
    }

    const newWs = {
      id,
      name,
      category,
      icon: icon || name.charAt(0).toUpperCase(),
      objects: templateObjects,
    };

    set({
      canvases: { ...state.canvases, [id]: newWs },
    });

    state.switchCanvas(id);
    return id;
  },

  addTeamMember: (name, email, role) => {
    const state = get();
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const colors = ['#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newUser: CanvasUser = {
      id,
      name: `${name} (${email.split('@')[0]})`,
      color,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
      role,
      cursor: { x: 350 + Math.random() * 200, y: 250 + Math.random() * 200 },
      activeTool: 'select',
      selectedObjectIds: [],
      isOnline: true,
    };

    set({
      collaborationUsers: {
        ...state.collaborationUsers,
        [id]: newUser,
      },
    });
  },

  updateUserRole: (userId, role) => {
    const state = get();
    if (userId === state.currentUser.id) {
      set({ currentUser: { ...state.currentUser, role } });
      return;
    }
    const targetUser = state.collaborationUsers[userId];
    if (targetUser) {
      set({
        collaborationUsers: {
          ...state.collaborationUsers,
          [userId]: { ...targetUser, role },
        },
      });
    }
  },

  branches: initialBranches,
  activeBranchId: 'main',

  history: defaultDemoHistory,
  historyIndex: defaultDemoHistory.length - 1,
  isPlaying: false,
  playbackSpeed: 1,

  currentUser: initialUser,
  collaborationUsers: {
    user_alice: {
      id: 'user_alice',
      name: 'Alice (Frontend)',
      color: '#10b981',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
      role: 'editor',
      cursor: { x: 250, y: 180 },
      activeTool: 'rectangle',
      selectedObjectIds: [],
      isOnline: true,
    },
    user_bob: {
      id: 'user_bob',
      name: 'Bob (Backend)',
      color: '#8b5cf6',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
      role: 'editor',
      cursor: { x: 620, y: 410 },
      activeTool: 'connector',
      selectedObjectIds: [],
      isOnline: true,
    },
  },
  simulatingMultiUser: true,
  roomCode: 'synk_cloud_8H72KD',
  isOffline: false,
  offlineQueue: [],

  conflicts: [],
  comments: [],
  auditLogs: [],
  securityIssues: [],

  setActiveTool: (tool) => set({ activeTool: tool }),
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  setFillColor: (fillColor) => set({ fillColor }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  setOpacity: (opacity) => set({ opacity }),
  setStrokeStyle: (strokeStyle) => set({ strokeStyle }),
  setFontSize: (fontSize) => set({ fontSize }),
  setPolygonSides: (polygonSides) => set({ polygonSides }),

  setZoom: (zoom) =>
    set((state) => ({
      zoom: typeof zoom === 'function' ? zoom(state.zoom) : zoom,
    })),
  setPanOffset: (panOffset) =>
    set((state) => ({
      panOffset: typeof panOffset === 'function' ? panOffset(state.panOffset) : panOffset,
    })),
  toggleGridSnap: () => set((state) => ({ gridSnap: !state.gridSnap })),

  focusObject: (objectId) => {
    const obj = get().objects[objectId];
    if (!obj) return;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const targetX = windowWidth / 2 - (obj.x + obj.width / 2);
    const targetY = windowHeight / 2 - (obj.y + obj.height / 2);
    set({
      zoom: 1,
      panOffset: { x: targetX, y: targetY },
      selectedObjectIds: [objectId],
    });
  },

  setSelectedObjectIds: (selectedObjectIds) => set({ selectedObjectIds }),

  addObject: (objData) => {
    const state = get();
    const id = `obj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newObj: CanvasObject = {
      ...objData,
      id,
      ownerId: state.currentUser.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };

    const newObjects = { ...state.objects, [id]: newObj };
    set({ objects: newObjects });
    state.recordEvent('CREATE', id, undefined, newObj, `Created ${newObj.type} (${newObj.text || 'shape'})`);
    synkWS.send({ type: 'OBJECT_CREATE', object: newObj, userId: state.currentUser.id });
    return id;
  },

  updateObject: (id, updates) => {
    const state = get();
    const current = state.objects[id];
    if (!current) return;

    if (current.locked && state.currentUser.role !== 'owner') {
      alert('Cannot modify object: Object is locked by owner.');
      return;
    }

    const updated = CRDTEngine.mergeObjectStates(current, updates, current.version + 1);
    const newObjects = { ...state.objects, [id]: updated };

    let updatedObjects = newObjects;
    if (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined || updates.height !== undefined) {
      for (const objId in updatedObjects) {
        const conn = updatedObjects[objId];
        if (conn.type === 'connector' && (conn.fromObjectId === id || conn.toObjectId === id)) {
          const fromObj = conn.fromObjectId === id ? updated : updatedObjects[conn.fromObjectId || ''];
          const toObj = conn.toObjectId === id ? updated : updatedObjects[conn.toObjectId || ''];
          if (fromObj && toObj) {
            const startX = fromObj.x + fromObj.width / 2;
            const startY = fromObj.y + fromObj.height / 2;
            const endX = toObj.x + toObj.width / 2;
            const endY = toObj.y + toObj.height / 2;
            updatedObjects = {
              ...updatedObjects,
              [conn.id]: {
                ...conn,
                x: startX,
                y: startY,
                width: endX - startX,
                height: endY - startY,
                version: conn.version + 1,
                updatedAt: Date.now(),
              },
            };
          }
        }
      }
    }

    set({ objects: updatedObjects });
    state.recordEvent('UPDATE', id, current, updated, `Updated ${current.text || current.type}`);
    synkWS.send({ type: 'OBJECT_UPDATE', objectId: id, updates, userId: state.currentUser.id });
  },

  deleteObjects: (ids) => {
    const state = get();
    const newObjects = { ...state.objects };
    for (const id of ids) {
      const current = newObjects[id];
      if (current) {
        if (current.locked && state.currentUser.role !== 'owner') {
          alert(`Cannot delete ${id}: Object is locked.`);
          continue;
        }
        state.recordEvent('DELETE', id, current, undefined, `Deleted ${current.text || current.type}`);
        delete newObjects[id];
      }
    }
    set({ objects: newObjects, selectedObjectIds: [] });
    synkWS.send({ type: 'OBJECT_DELETE', objectIds: ids, userId: state.currentUser.id });
  },

  lockObject: (id, locked) => {
    const state = get();
    const current = state.objects[id];
    if (!current) return;
    const updated = { ...current, locked, updatedAt: Date.now() };
    set({ objects: { ...state.objects, [id]: updated } });
    state.recordEvent('LOCK', id, current, updated, locked ? `Locked ${id}` : `Unlocked ${id}`);
  },

  groupObjects: () => {
    const state = get();
    if (state.selectedObjectIds.length < 2) return;
    const selected = state.selectedObjectIds.map((id) => state.objects[id]).filter(Boolean);
    const xs = selected.map((o) => o.x);
    const ys = selected.map((o) => o.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...selected.map((o) => o.x + o.width));
    const maxY = Math.max(...selected.map((o) => o.y + o.height));

    const groupObj = state.addObject({
      type: 'rectangle',
      x: minX - 10,
      y: minY - 10,
      width: maxX - minX + 20,
      height: maxY - minY + 20,
      rotation: 0,
      strokeColor: '#94a3b8',
      fillColor: 'rgba(241, 245, 249, 0.3)',
      strokeWidth: 1,
      opacity: 1,
      strokeStyle: 'dashed',
      text: '📦 Group Container',
      fontSize: 12,
      ownerId: state.currentUser.id,
    });
    set({ selectedObjectIds: [groupObj] });
  },

  recordEvent: (type, objectId, beforeState, afterState, description) => {
    const state = get();
    const event: CanvasEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      type,
      objectId,
      beforeState,
      afterState,
      description: description || `${type} operation on ${objectId}`,
    };

    const newHistory = [...state.history, event];
    const newAudit = [event, ...state.auditLogs];

    if (state.isOffline) {
      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
        auditLogs: newAudit,
        offlineQueue: [...state.offlineQueue, event],
      });
    } else {
      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
        auditLogs: newAudit,
      });
    }
  },

  jumpToHistoryIndex: (index) => {
    const state = get();
    if (index < -1 || index >= state.history.length) return;

    const baseObjects: Record<string, CanvasObject> = {};
    for (let i = 0; i <= index; i++) {
      const evt = state.history[i];
      if (evt.type === 'CREATE' && evt.afterState) {
        baseObjects[evt.objectId] = evt.afterState as CanvasObject;
      } else if (evt.type === 'UPDATE' && evt.afterState) {
        if (baseObjects[evt.objectId]) {
          baseObjects[evt.objectId] = { ...baseObjects[evt.objectId], ...evt.afterState };
        }
      } else if (evt.type === 'DELETE') {
        delete baseObjects[evt.objectId];
      }
    }
    set({ objects: baseObjects, historyIndex: index });
  },

  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

  createBranch: (name) => {
    const state = get();
    const branchId = `branch_${Date.now()}`;
    const newBranch: CanvasBranch = {
      id: branchId,
      name,
      parentBranchId: state.activeBranchId,
      createdAt: Date.now(),
      createdBy: state.currentUser.name,
      objects: { ...state.objects },
      history: [...state.history],
    };
    set({
      branches: { ...state.branches, [branchId]: newBranch },
      activeBranchId: branchId,
    });
    return branchId;
  },

  switchBranch: (branchId) => {
    const state = get();
    const branch = state.branches[branchId];
    if (!branch) return;
    set({
      activeBranchId: branchId,
      objects: { ...branch.objects },
      history: [...branch.history],
      historyIndex: branch.history.length - 1,
    });
  },

  mergeBranch: (sourceBranchId) => {
    const state = get();
    const sourceBranch = state.branches[sourceBranchId];
    const activeBranch = state.branches[state.activeBranchId];
    if (!sourceBranch || !activeBranch) return;

    const { merged, conflicts } = CRDTEngine.threeWayMerge(
      activeBranch.objects,
      activeBranch.objects,
      sourceBranch.objects
    );

    set({
      objects: merged,
      conflicts: [...state.conflicts, ...conflicts],
    });

    state.recordEvent('MERGE', 'branch', undefined, undefined, `Merged branch ${sourceBranch.name} into ${activeBranch.name}`);
  },

  toggleMultiUserSim: () => set((state) => ({ simulatingMultiUser: !state.simulatingMultiUser })),
  setUserRole: (role) => set((state) => ({ currentUser: { ...state.currentUser, role } })),

  toggleOffline: () =>
    set((state) => {
      const nextOffline = !state.isOffline;
      if (!nextOffline && state.offlineQueue.length > 0) {
        alert(`🌐 Reconnected! Synchronized ${state.offlineQueue.length} queued offline operations to cloud server.`);
        return { isOffline: false, offlineQueue: [] };
      }
      return { isOffline: nextOffline };
    }),

  resolveConflict: (conflictId, choice) => {
    const state = get();
    const conflict = state.conflicts.find((c) => c.id === conflictId);
    if (!conflict) return;

    let resolvedState: Partial<CanvasObject> = {};
    if (choice === 'userA') {
      resolvedState = conflict.userA.state;
    } else if (choice === 'userB') {
      resolvedState = conflict.userB.state;
    } else {
      resolvedState = { ...conflict.userA.state, ...conflict.userB.state };
    }

    state.updateObject(conflict.objectId, resolvedState);
    set({ conflicts: state.conflicts.filter((c) => c.id !== conflictId) });
  },

  addComment: (x, y, text, objectId) => {
    const state = get();
    const newComment: CanvasComment = {
      id: `cmt_${Date.now()}`,
      objectId,
      x,
      y,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userAvatar: state.currentUser.avatar,
      text,
      createdAt: Date.now(),
      resolved: false,
      replies: [],
    };
    set({ comments: [...state.comments, newComment] });
  },

  replyComment: (commentId, text) => {
    const state = get();
    const updated = state.comments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [
            ...c.replies,
            {
              id: `rpl_${Date.now()}`,
              userId: state.currentUser.id,
              userName: state.currentUser.name,
              userAvatar: state.currentUser.avatar,
              text,
              createdAt: Date.now(),
            },
          ],
        };
      }
      return c;
    });
    set({ comments: updated });
  },

  resolveComment: (commentId) => {
    const state = get();
    set({
      comments: state.comments.map((c) => (c.id === commentId ? { ...c, resolved: true } : c)),
    });
  },

  runSecurityAudit: () => {
    const state = get();
    const issues = AICanvasAgent.auditSecurity(Object.values(state.objects));
    set({ securityIssues: issues });
  },

  fixSecurityIssue: (issueId) => {
    const state = get();
    const issue = state.securityIssues.find((i) => i.id === issueId);
    if (!issue) return;
    if (issue.autoFixState) {
      state.updateObject(issue.objectId, issue.autoFixState);
    }
    set({ securityIssues: state.securityIssues.filter((i) => i.id !== issueId) });
  },

  aiAutoCleanup: () => {
    const state = get();
    const pens = Object.values(state.objects).filter((o) => o.type === 'pen' && o.points && o.points.length > 4);
    if (pens.length === 0) {
      alert('Draw a rough shape with Pen tool first, then trigger AI Clean!');
      return;
    }
    for (const pen of pens) {
      const cleaned = AICanvasAgent.autoCleanupPenStroke(pen.points!);
      if (cleaned) {
        state.deleteObjects([pen.id]);
        state.addObject({
          type: cleaned.type as ToolType,
          x: cleaned.x,
          y: cleaned.y,
          width: cleaned.width,
          height: cleaned.height,
          rotation: 0,
          strokeColor: pen.strokeColor,
          fillColor: pen.strokeColor + '20',
          strokeWidth: pen.strokeWidth,
          opacity: 1,
          strokeStyle: 'solid',
          text: cleaned.type.toUpperCase(),
          fontSize: 14,
          ownerId: state.currentUser.id,
        });
      }
    }
  },

  aiGenerateDiagram: (prompt) => {
    const state = get();
    const generated = AICanvasAgent.generateDiagramFromPrompt(prompt, 200, 150);

    // Merge newly generated AI objects into active workspace objects
    const rawMerged: Record<string, CanvasObject> = { ...state.objects };
    for (const obj of generated) {
      rawMerged[obj.id] = obj;
      state.recordEvent('CREATE', obj.id, undefined, obj, `AI generated ${obj.text || obj.type}`);
    }

    // Auto-layout entire merged graph cleanly so ZERO cards overlap
    const cleanArranged = arrangeDAGLayout(rawMerged);

    set({
      objects: cleanArranged,
      branches: {
        ...state.branches,
        [state.activeBranchId]: {
          ...state.branches[state.activeBranchId],
          objects: cleanArranged,
        },
      },
      panOffset: { x: 0, y: 0 },
      zoom: 1,
    });
  },

  arrangeAutoLayout: () => {
    const state = get();
    const arranged = arrangeDAGLayout(state.objects);
    set({
      objects: arranged,
      branches: {
        ...state.branches,
        [state.activeBranchId]: {
          ...state.branches[state.activeBranchId],
          objects: arranged,
        },
      },
    });
  },
}));
