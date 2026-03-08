/* ─── WebSocket Service ─── Manages real-time connection with auto-reconnect ─── */
import type { Notification, WebSocketEvent } from '@root/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
type EventHandler = (data: unknown) => void;
type StatusHandler = (status: ConnectionStatus) => void;

// ---------------------------------------------------------------------------
// WebSocket Service (Singleton)
// ---------------------------------------------------------------------------

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private enabled: boolean;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private token: string | null = null;

  private eventHandlers = new Map<string, Set<EventHandler>>();
  private statusHandlers = new Set<StatusHandler>();
  private _status: ConnectionStatus = 'disconnected';

  constructor() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiBase = import.meta.env.VITE_API_URL as string | undefined;
    const wsEnv = import.meta.env.VITE_WS_URL as string | undefined;
    const wsDisabled = import.meta.env.VITE_WS_ENABLED === 'false';

    if (wsDisabled) {
      // Explicitly disabled via env
      this.url = '';
      this.enabled = false;
    } else if (wsEnv) {
      // Explicit WS URL takes priority
      this.url = wsEnv;
      this.enabled = true;
    } else if (import.meta.env.PROD && apiBase) {
      // Production with API base — derive WS URL
      try {
        const parsed = new URL(apiBase);
        const wsp = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
        this.url = `${wsp}//${parsed.host}/ws`;
        this.enabled = true;
      } catch {
        this.url = `${wsProtocol}//${window.location.host}/ws`;
        this.enabled = true;
      }
    } else if (import.meta.env.PROD) {
      // Production — assume same origin
      this.url = `${wsProtocol}//${window.location.host}/ws`;
      this.enabled = true;
    } else {
      // Dev with no explicit VITE_WS_URL — don't attempt connections
      // (backend may not have a WS server; avoids console error spam)
      this.url = '';
      this.enabled = false;
    }
  }

  // ── Status ──

  get status(): ConnectionStatus {
    return this._status;
  }

  private setStatus(status: ConnectionStatus) {
    this._status = status;
    this.statusHandlers.forEach((handler) => handler(status));
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    // Immediately fire current status
    handler(this._status);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  // ── Event subscription ──

  on(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  private emit(event: string, data: unknown) {
    this.eventHandlers.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (err) {
        console.error(`[WS] Error in handler for "${event}":`, err);
      }
    });
  }

  // ── Connection lifecycle ──

  connect(token?: string) {
    if (token) this.token = token;
    if (!this.enabled) return;              // No WS endpoint configured
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.cleanup();
    this.setStatus('connecting');

    try {
      const urlWithAuth = this.token ? `${this.url}?token=${encodeURIComponent(this.token)}` : this.url;
      this.ws = new WebSocket(urlWithAuth);

      this.ws.onopen = () => {
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.startHeartbeat();
        console.info('[WS] Connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketEvent = JSON.parse(event.data);
          this.emit(message.event, message.data);

          // Auto-emit 'notification' events through the general handler too
          if (message.event === 'notification') {
            this.emit('notification:new', message.data as Notification);
          }
        } catch {
          console.warn('[WS] Failed to parse message:', event.data);
        }
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        this.setStatus('disconnected');
        // Only auto-reconnect for abnormal closures
        if (event.code !== 1000) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        // Don't spam the console in dev when no WS server is available
        if (this.reconnectAttempts === 0) {
          console.warn('[WS] Connection failed — will retry with backoff');
        }
        this.setStatus('error');
      };
    } catch (err) {
      console.error('[WS] Connection error:', err);
      this.setStatus('error');
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.cleanup();
    this.reconnectAttempts = this.maxReconnectAttempts; // prevent auto-reconnect
    this.setStatus('disconnected');
  }

  send(event: string, data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data, timestamp: new Date().toISOString() }));
    }
  }

  // ── Reconnection ──

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[WS] Max reconnect attempts reached');
      this.setStatus('error');
      return;
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.info(`[WS] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // ── Heartbeat ──

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send('ping', {});
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ── Cleanup ──

  private cleanup() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000);
      }
      this.ws = null;
    }
  }
}

// ── Singleton export ──
export const wsService = new WebSocketService();
