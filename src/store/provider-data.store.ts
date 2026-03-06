/* ─── Provider Data Store ─── Zustand store for cross-component provider state ─── */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/* ══════════════════════════════════════════════════════════════════
 * Types
 * ══════════════════════════════════════════════════════════════════ */

export interface TenantSummary {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  totalRevenue: number;
}

export interface PlatformHealth {
  uptime: number;
  avgLatency: number;
  errorRate: number;
  activeUsers: number;
}

export interface ProviderAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ProviderDataState {
  /* ── Tenant summary ── */
  tenantSummary: TenantSummary;
  setTenantSummary: (summary: TenantSummary) => void;

  /* ── Platform health ── */
  platformHealth: PlatformHealth;
  setPlatformHealth: (health: PlatformHealth) => void;

  /* ── Alerts / notifications ── */
  alerts: ProviderAlert[];
  addAlert: (alert: Omit<ProviderAlert, 'id' | 'timestamp' | 'read'>) => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;

  /* ── Selected tenant context ── */
  selectedTenantId: string | null;
  setSelectedTenantId: (id: string | null) => void;

  /* ── Quick stats cache ── */
  quickStats: Record<string, number>;
  setQuickStat: (key: string, value: number) => void;
  setQuickStats: (stats: Record<string, number>) => void;
}

/* ══════════════════════════════════════════════════════════════════
 * Store
 * ══════════════════════════════════════════════════════════════════ */

export const useProviderStore = create<ProviderDataState>()(
  devtools(
    (set) => ({
      /* ── Tenant summary ── */
      tenantSummary: { totalTenants: 0, activeTenants: 0, trialTenants: 0, totalRevenue: 0 },
      setTenantSummary: (summary) => set({ tenantSummary: summary }, false, 'setTenantSummary'),

      /* ── Platform health ── */
      platformHealth: { uptime: 99.9, avgLatency: 45, errorRate: 0.1, activeUsers: 0 },
      setPlatformHealth: (health) => set({ platformHealth: health }, false, 'setPlatformHealth'),

      /* ── Alerts ── */
      alerts: [],
      addAlert: (alert) =>
        set(
          (state) => ({
            alerts: [
              {
                ...alert,
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                read: false,
              },
              ...state.alerts,
            ].slice(0, 50), // keep last 50
          }),
          false,
          'addAlert',
        ),
      markAlertRead: (id) =>
        set(
          (state) => ({
            alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
          }),
          false,
          'markAlertRead',
        ),
      clearAlerts: () => set({ alerts: [] }, false, 'clearAlerts'),

      /* ── Selected tenant ── */
      selectedTenantId: null,
      setSelectedTenantId: (id) => set({ selectedTenantId: id }, false, 'setSelectedTenantId'),

      /* ── Quick stats ── */
      quickStats: {},
      setQuickStat: (key, value) =>
        set(
          (state) => ({ quickStats: { ...state.quickStats, [key]: value } }),
          false,
          'setQuickStat',
        ),
      setQuickStats: (stats) => set({ quickStats: stats }, false, 'setQuickStats'),
    }),
    { name: 'provider-data-store' },
  ),
);
