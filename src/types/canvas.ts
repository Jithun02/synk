export type ToolType =
  | 'select'
  | 'pan'
  | 'pen'
  | 'pencil'
  | 'brush'
  | 'eraser'
  | 'highlighter'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'polygon'
  | 'text'
  | 'sticky'
  | 'connector'
  | 'image'
  | 'comment';

export type SemanticRole =
  | 'service'
  | 'database'
  | 'user'
  | 'gateway'
  | 'ui_component'
  | 'cache'
  | 'arrow_dependency'
  | 'queue'
  | 'generic';

export type UserRole = 'owner' | 'editor' | 'commenter' | 'viewer';

export interface Point {
  x: number;
  y: number;
}

export interface CanvasObject {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  text?: string;
  fontSize?: number;
  points?: Point[];
  polygonSides?: number;
  fromObjectId?: string;
  toObjectId?: string;
  semanticRole?: SemanticRole;
  locked?: boolean;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
  version: number;
  allowedUserIds?: string[];
  imageUrl?: string;
  categoryTag?: string;
  subtitle?: string;
  iconName?: string;
  activeUserEditing?: { name: string; color: string };
}

export interface CanvasUser {
  id: string;
  name: string;
  color: string;
  avatar: string;
  role: UserRole;
  cursor: Point;
  activeTool: ToolType;
  selectedObjectIds: string[];
  isOnline: boolean;
}

export interface CanvasEvent {
  eventId: string;
  timestamp: number;
  userId: string;
  userName: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE' | 'RESIZE' | 'LOCK' | 'MERGE';
  objectId: string;
  beforeState?: Partial<CanvasObject>;
  afterState?: Partial<CanvasObject>;
  description: string;
}

export interface CanvasBranch {
  id: string;
  name: string;
  parentBranchId?: string;
  createdAt: number;
  createdBy: string;
  objects: Record<string, CanvasObject>;
  history: CanvasEvent[];
}

export interface VisualConflict {
  id: string;
  objectId: string;
  userA: { userId: string; name: string; state: Partial<CanvasObject> };
  userB: { userId: string; name: string; state: Partial<CanvasObject> };
  baseState: Partial<CanvasObject>;
  timestamp: number;
}

export interface CanvasComment {
  id: string;
  objectId?: string;
  x: number;
  y: number;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: number;
  resolved: boolean;
  replies: {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    createdAt: number;
  }[];
}

export interface SecurityIssue {
  id: string;
  objectId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  fixSuggestion: string;
  autoFixState?: Partial<CanvasObject>;
}

export type STRIDECategory =
  | 'Spoofing'
  | 'Tampering'
  | 'Repudiation'
  | 'Information Disclosure'
  | 'Denial of Service'
  | 'Elevation of Privilege';

export interface ThreatItem {
  id: string;
  objectId: string;
  strideCategory: STRIDECategory;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  mitigation: string;
  trustBoundary: string;
}

export interface ArchitectureHealthScore {
  overall: number;
  security: number;
  reliability: number;
  scalability: number;
  maintainability: number;
  observability: number;
  missingItems: string[];
}

export interface IncidentTimelineEvent {
  time: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
}

export interface IncidentDetails {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  affectedObjectIds: string[];
  startTime: number;
  status: 'ACTIVE' | 'CONTAINED' | 'RESOLVED';
  timeline: IncidentTimelineEvent[];
  investigationNotes: string[];
}

export type IaCFormat = 'terraform' | 'kubernetes' | 'docker_compose';

