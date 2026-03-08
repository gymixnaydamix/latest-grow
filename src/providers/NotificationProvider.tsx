/* ─── NotificationProvider ─── Bridges WebSocket ↔ Zustand store ↔ Toasts ─── */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { wsService, type ConnectionStatus } from '@/services/websocket';
import { useNotificationStore } from '@/store/notification.store';
import { useAuthStore } from '@/store/auth.store';
import { notifyFromNotification } from '@/lib/notify';
import type { Notification } from '@root/types';

// ---------------------------------------------------------------------------
// Hook — exposes WS connection status to any consumer
// ---------------------------------------------------------------------------

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(wsService.status);

  useEffect(() => {
    return wsService.onStatusChange(setStatus);
  }, []);

  return status;
}

// ---------------------------------------------------------------------------
// Provider — manages lifecycle
// ---------------------------------------------------------------------------

export function NotificationProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const addNotificationRef = useRef(addNotification);
  addNotificationRef.current = addNotification;

  // Connect/disconnect WS on auth state changes
  useEffect(() => {
    if (user) {
      // Pass user ID as token for WS authentication
      // The backend WS server can use this to identify the connection.
      // If the backend solely relies on cookies, this is a safe no-op fallback.
      wsService.connect(user.id);
    } else {
      wsService.disconnect();
    }

    return () => {
      wsService.disconnect();
    };
  }, [user]);

  // Listen for incoming notifications
  useEffect(() => {
    const unsubscribe = wsService.on('notification:new', (data) => {
      const notification = data as Notification;
      addNotificationRef.current(notification);
      notifyFromNotification(notification);
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
}
