/* ─── Notification Store ─── Zustand store with localStorage persistence ─── */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Notification, NotificationType } from '@root/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationFilter = 'all' | 'unread' | 'read' | NotificationType;

interface NotificationState {
  notifications: Notification[];
  filter: NotificationFilter;

  // ── Derived (computed in selectors) ──
  unreadCount: () => number;
  filtered: () => Notification[];

  // ── Actions ──
  addNotification: (notification: Notification) => void;
  addNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAll: () => void;
  setFilter: (filter: NotificationFilter) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      filter: 'all',

      unreadCount: () => get().notifications.filter((n) => !n.read).length,

      filtered: () => {
        const { notifications, filter } = get();
        switch (filter) {
          case 'all':
            return notifications;
          case 'unread':
            return notifications.filter((n) => !n.read);
          case 'read':
            return notifications.filter((n) => n.read);
          default:
            // Filter by NotificationType enum value
            return notifications.filter((n) => n.type === filter);
        }
      },

      addNotification: (notification) =>
        set((s) => ({
          notifications: [notification, ...s.notifications].slice(0, 200), // cap at 200
        })),

      addNotifications: (newNotifications) =>
        set((s) => {
          const existingIds = new Set(s.notifications.map((n) => n.id));
          const unique = newNotifications.filter((n) => !existingIds.has(n.id));
          return {
            notifications: [...unique, ...s.notifications]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 200),
          };
        }),

      markAsRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      deleteNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),

      deleteAll: () => set({ notifications: [] }),

      setFilter: (filter) => set({ filter }),
    }),
    {
      name: 'grow-notifications',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
