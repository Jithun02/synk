import { CanvasObject, CanvasUser } from '../types/canvas';

export type WebSocketMessage =
  | { type: 'OBJECT_CREATE'; object: CanvasObject; userId: string; roomCode?: string }
  | { type: 'OBJECT_UPDATE'; objectId: string; updates: Partial<CanvasObject>; userId: string; roomCode?: string }
  | { type: 'OBJECT_DELETE'; objectIds: string[]; userId: string; roomCode?: string }
  | { type: 'CURSOR_MOVE'; cursor: { x: number; y: number }; userId: string; userName: string; color: string; roomCode?: string }
  | { type: 'PRESENCE_HEARTBEAT'; user: CanvasUser; roomCode?: string }
  | { type: 'FULL_SNAPSHOT'; objects: Record<string, CanvasObject>; roomCode?: string }
  | { type: 'BRANCH_SWITCH'; branchId: string; userId: string }
  | { type: 'BRANCH_MERGE'; sourceBranchId: string; mergedState: Record<string, CanvasObject>; userId: string }
  | { type: 'USER_JOINED'; userId: string; presence: any[] }
  | { type: 'USER_DISCONNECT'; userId: string };

export class SynkWebSocketClient {
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private roomId: string = 'synk_cloud_8H72KD';
  private userId: string = 'user_me';
  private userName: string = 'Jithun';
  private userColor: string = '#6366f1';
  private listeners: Set<(msg: WebSocketMessage) => void> = new Set();
  private isConnected: boolean = false;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(roomId: string = 'synk_cloud_8H72KD', userId: string = 'user_me', userName: string = 'Jithun', userColor: string = '#6366f1') {
    this.roomId = roomId;
    this.userId = userId;
    this.userName = userName;
    this.userColor = userColor;
  }

  public connect(roomId?: string, user?: CanvasUser): void {
    if (typeof window === 'undefined') return;
    if (roomId) this.roomId = roomId;
    if (user) {
      this.userId = user.id;
      this.userName = user.name;
      this.userColor = user.color || '#6366f1';
    }

    // 1. BroadcastChannel for local same-tab / same-browser instant sync
    try {
      if (!this.broadcastChannel) {
        this.broadcastChannel = new BroadcastChannel(`synk_room_${this.roomId}`);
        this.broadcastChannel.onmessage = (evt) => {
          if (evt.data) {
            this.notifyListeners(evt.data);
          }
        };
      }
    } catch (e) {
      console.warn('[BroadcastChannel] Not supported or error:', e);
    }

    // 2. ntfy.sh SSE for cross-laptop internet real-time pub/sub sync
    if (!this.eventSource) {
      try {
        const topicUrl = `https://ntfy.sh/${this.roomId}_sync/sse`;
        this.eventSource = new EventSource(topicUrl);

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.message) {
              const msg: WebSocketMessage = JSON.parse(data.message);
              this.notifyListeners(msg);
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        this.eventSource.onerror = () => {
          this.isConnected = false;
        };

        this.isConnected = true;
      } catch (e) {
        console.warn('[SSE] EventSource connection failed:', e);
      }
    }

    // 3. Optional WebSocket server if NEXT_PUBLIC_WS_SERVER is configured
    const wsServer = process.env.NEXT_PUBLIC_WS_SERVER;
    if (wsServer && !this.ws) {
      try {
        const url = `${wsServer}/ws/${this.roomId}/${this.userId}`;
        this.ws = new WebSocket(url);
        this.ws.onmessage = (event) => {
          try {
            const msg: WebSocketMessage = JSON.parse(event.data);
            this.notifyListeners(msg);
          } catch (e) {}
        };
      } catch (e) {}
    }

    // Start Presence Heartbeat loop every 3 seconds
    if (!this.heartbeatTimer) {
      this.startHeartbeat(user);
    }
  }

  public startHeartbeat(user?: CanvasUser): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (user) {
        this.send({
          type: 'PRESENCE_HEARTBEAT',
          user: {
            ...user,
            isOnline: true,
          },
          roomCode: this.roomId,
        });
      }
    }, 3000);
  }

  public subscribe(callback: (msg: WebSocketMessage) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(msg: WebSocketMessage): void {
    this.listeners.forEach((fn) => fn(msg));
  }

  public send(msg: WebSocketMessage): void {
    const payload = JSON.stringify(msg);

    // 1. Send to local BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch (e) {}
    }

    // 2. Publish to ntfy.sh SSE cloud topic for other laptops
    try {
      fetch(`https://ntfy.sh/${this.roomId}_sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      }).catch(() => {});
    } catch (e) {}

    // 3. Send over WebSocket if available
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(payload);
      } catch (e) {}
    }
  }

  public async fetchSnapshot(roomId: string = this.roomId): Promise<Record<string, CanvasObject> | null> {
    try {
      const res = await fetch(`https://ntfy.sh/${roomId}_snapshot/json?poll=1`);
      if (!res.ok) return null;
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        const data = JSON.parse(lastLine);
        if (data.message) {
          const snapshot = JSON.parse(data.message);
          return snapshot.objects || null;
        }
      }
    } catch (e) {
      console.warn('[Snapshot] Error fetching cloud snapshot:', e);
    }
    return null;
  }

  public publishSnapshot(objects: Record<string, CanvasObject>, roomId: string = this.roomId): void {
    try {
      const payload = JSON.stringify({ objects, timestamp: Date.now() });
      fetch(`https://ntfy.sh/${roomId}_snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      }).catch(() => {});

      // Also update local API route
      fetch('/api/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, snapshot: { objects } }),
      }).catch(() => {});
    } catch (e) {}
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

export const synkWS = new SynkWebSocketClient();

