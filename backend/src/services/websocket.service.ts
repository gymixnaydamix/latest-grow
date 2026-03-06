/* ─── WebSocket Service ─── Real-time notification broadcasting ──────
 * Manages WS connections, JWT-based auth on upgrade, user tracking,
 * heartbeat, and targeted/broadcast message delivery.
 * ──────────────────────────────────────────────────────────────────── */
import { type Server as HTTPServer } from 'node:http';
import { WebSocketServer, WebSocket, type RawData } from 'ws';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WsClient {
  ws: WebSocket;
  userId: string;
  role: string;
  schoolId?: string;
  isAlive: boolean;
}

interface WsMessage {
  event: string;
  data: unknown;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, Set<WsClient>>();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  /** Attach WS upgrade handler to an existing HTTP server */
  init(server: HTTPServer) {
    this.wss = new WebSocketServer({ noServer: true });

    // ── HTTP Upgrade handler — authenticate via JWT in query string ──
    server.on('upgrade', (req, socket, head) => {
      // Only handle /ws path
      const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
      if (url.pathname !== '/ws') {
        socket.destroy();
        return;
      }

      const token = url.searchParams.get('token');
      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      try {
        const payload = jwt.verify(token, config.jwtSecret) as {
          userId: string;
          role: string;
          schoolId?: string;
        };

        this.wss!.handleUpgrade(req, socket, head, (ws) => {
          this.wss!.emit('connection', ws, payload);
        });
      } catch {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    });

    // ── Connection handler ──
    this.wss.on(
      'connection',
      (ws: WebSocket, payload: { userId: string; role: string; schoolId?: string }) => {
        const client: WsClient = {
          ws,
          userId: payload.userId,
          role: payload.role,
          schoolId: payload.schoolId,
          isAlive: true,
        };

        // Track client by userId (supports multiple tabs/devices)
        if (!this.clients.has(payload.userId)) {
          this.clients.set(payload.userId, new Set());
        }
        this.clients.get(payload.userId)!.add(client);

        logger.info(`[WS] Client connected: ${payload.userId} (${payload.role})`);

        // Send welcome
        this.sendTo(ws, {
          event: 'connected',
          data: { message: 'Welcome to GROW YouR NEED real-time service' },
          timestamp: new Date().toISOString(),
        });

        // ── Message handling ──
        ws.on('message', (raw: RawData) => {
          try {
            const msg: WsMessage = JSON.parse(raw.toString());

            // Heartbeat
            if (msg.event === 'ping') {
              client.isAlive = true;
              this.sendTo(ws, {
                event: 'pong',
                data: {},
                timestamp: new Date().toISOString(),
              });
              return;
            }

            // Future: handle other client-to-server events here
            logger.debug(`[WS] Message from ${payload.userId}: ${msg.event}`);
          } catch {
            logger.warn('[WS] Invalid message received');
          }
        });

        // ── Cleanup on close ──
        ws.on('close', () => {
          this.clients.get(payload.userId)?.delete(client);
          if (this.clients.get(payload.userId)?.size === 0) {
            this.clients.delete(payload.userId);
          }
          logger.info(`[WS] Client disconnected: ${payload.userId}`);
        });

        ws.on('error', (err) => {
          logger.error(`[WS] Error for ${payload.userId}:`, { error: err.message });
        });
      },
    );

    // ── Heartbeat: prune dead connections every 30s ──
    this.heartbeatInterval = setInterval(() => {
      for (const [userId, clientSet] of this.clients) {
        for (const client of clientSet) {
          if (!client.isAlive) {
            client.ws.terminate();
            clientSet.delete(client);
            logger.debug(`[WS] Terminated dead connection for ${userId}`);
          } else {
            client.isAlive = false;
          }
        }
        if (clientSet.size === 0) this.clients.delete(userId);
      }
    }, 30_000);

    logger.info('[WS] WebSocket server initialized');
  }

  // ── Send helpers ──

  private sendTo(ws: WebSocket, message: WsMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /** Send a message to all connections of a specific user */
  sendToUser(userId: string, event: string, data: unknown) {
    const clientSet = this.clients.get(userId);
    if (!clientSet) return;

    const message: WsMessage = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    for (const client of clientSet) {
      this.sendTo(client.ws, message);
    }
  }

  /** Send a notification event to a specific user */
  notifyUser(userId: string, notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    metadata?: Record<string, unknown>;
  }) {
    this.sendToUser(userId, 'notification', {
      ...notification,
      userId,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  /** Broadcast to all connections in a school */
  broadcastToSchool(schoolId: string, event: string, data: unknown) {
    const message: WsMessage = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    for (const clientSet of this.clients.values()) {
      for (const client of clientSet) {
        if (client.schoolId === schoolId) {
          this.sendTo(client.ws, message);
        }
      }
    }
  }

  /** Broadcast to all connections with a specific role in a school */
  broadcastToRole(schoolId: string, role: string, event: string, data: unknown) {
    const message: WsMessage = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    for (const clientSet of this.clients.values()) {
      for (const client of clientSet) {
        if (client.schoolId === schoolId && client.role === role) {
          this.sendTo(client.ws, message);
        }
      }
    }
  }

  /** Broadcast to all connected clients */
  broadcastAll(event: string, data: unknown) {
    const message: WsMessage = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    for (const clientSet of this.clients.values()) {
      for (const client of clientSet) {
        this.sendTo(client.ws, message);
      }
    }
  }

  /** Get count of connected users */
  get connectedUsers(): number {
    return this.clients.size;
  }

  /** Graceful shutdown */
  close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.wss?.close();
    this.clients.clear();
    logger.info('[WS] WebSocket server closed');
  }
}

// ── Singleton export ──
export const wsService = new WebSocketService();
