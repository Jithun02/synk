import { CanvasEvent, CanvasObject } from '../types/canvas';

export type WebSocketMessage =
  | { type: 'OBJECT_CREATE'; object: CanvasObject; userId: string }
  | { type: 'OBJECT_UPDATE'; objectId: string; updates: Partial<CanvasObject>; userId: string }
  | { type: 'OBJECT_DELETE'; objectIds: string[]; userId: string }
  | { type: 'CURSOR_MOVE'; cursor: { x: number; y: number }; userId: string; userName: string; color: string }
  | { type: 'BRANCH_SWITCH'; branchId: string; userId: string }
  | { type: 'BRANCH_MERGE'; sourceBranchId: string; mergedState: Record<string, CanvasObject>; userId: string }
  | { type: 'USER_JOINED'; userId: string; presence: any[] }
  | { type: 'USER_DISCONNECT'; userId: string };

export class SynkWebSocketClient {
  private ws: WebSocket | null = null;
  private roomId: string;
  private userId: string;
  private userName: string;
  private userColor: string;
  private serverUrl: string;
  private listeners: Set<(msg: WebSocketMessage) => void> = new Set();
  private isConnected: boolean = false;
  private offlineQueue: WebSocketMessage[] = [];

  constructor(roomId: string = 'room_demo', userId: string = 'user_me', userName: string = 'Jithun', userColor: string = '#6366f1') {
    this.roomId = roomId;
    this.userId = userId;
    this.userName = userName;
    this.userColor = userColor;
    this.serverUrl = process.env.NEXT_PUBLIC_WS_SERVER || 'ws://localhost:8000';
  }

  public connect(): void {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = `${this.serverUrl}/ws/${this.roomId}/${this.userId}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.flushOfflineQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WebSocketMessage = JSON.parse(event.data);
          this.notifyListeners(msg);
        } catch (e) {
          console.warn('[WebSocket] Failed to parse message:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };
    } catch (e) {
      console.warn('[WebSocket] Connection failed, operating in fallback mode');
    }
  }

  public subscribe(callback: (msg: WebSocketMessage) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(msg: WebSocketMessage): void {
    this.listeners.forEach((fn) => fn(msg));
  }

  public send(msg: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      this.offlineQueue.push(msg);
    }
  }

  private flushOfflineQueue(): void {
    while (this.offlineQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = this.offlineQueue.shift();
      if (msg) this.send(msg);
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const synkWS = new SynkWebSocketClient();
