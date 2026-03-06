/* ─────────────────────────────────────────────────────────────────────
 * Concierge Store — Shared state for all role concierges
 * Manages context session, conversations, drafts, shortcuts, history
 * ───────────────────────────────────────────────────────────────────── */
import { create } from 'zustand';

/* ── Types ── */
export interface ConciergeContextField {
  key: string;
  label: string;
  value: string;
  options?: string[];
}

export interface ConciergeContextSession {
  role: string;
  fields: ConciergeContextField[];
  pinnedAt?: string;
}

export interface ConciergeMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  actionCard?: ConciergeActionCardData;
  receipt?: ConciergeReceipt;
}

export interface ConciergeActionCardData {
  id: string;
  type: string;
  title: string;
  status: 'draft' | 'pending' | 'confirmed' | 'executed' | 'cancelled';
  linkedEntities: { type: string; label: string; id: string }[];
  fields: { key: string; label: string; value: string; editable?: boolean }[];
  permissionChip?: string;
  auditWarning?: string;
  impactPreview?: string;
}

export interface ConciergeReceipt {
  id: string;
  action: string;
  by: string;
  when: string;
  changedRecords: { type: string; label: string; id: string }[];
  nextSteps: string[];
  undoSupported?: boolean;
}

export interface ConciergeDraft {
  id: string;
  type: string;
  title: string;
  updatedAt: string;
  linkedEntity?: string;
}

export interface ConciergeShortcut {
  id: string;
  label: string;
  icon?: string;
  action: string;
}

export interface ConciergeHistoryItem {
  id: string;
  actionType: string;
  title: string;
  linkedRecords: { type: string; label: string; id: string }[];
  user: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
}

export interface ConciergeTodayItem {
  id: string;
  time: string;
  title: string;
  entity?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions: string[];
}

export interface ConciergeSearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  actions: string[];
}

export interface ConciergeNotification {
  id: string;
  title: string;
  timestamp: string;
  read: boolean;
}

export interface WizardStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface WizardState {
  open: boolean;
  title: string;
  steps: WizardStep[];
  currentStep: number;
  data: Record<string, unknown>;
}

/* ── Store ── */
interface ConciergeState {
  /* Context */
  context: ConciergeContextSession | null;
  recentContexts: ConciergeContextSession[];
  setContext: (ctx: ConciergeContextSession) => void;
  pinContext: () => void;
  clearContext: () => void;
  restoreContext: (idx: number) => void;

  /* Conversation */
  messages: ConciergeMessage[];
  addMessage: (msg: ConciergeMessage) => void;
  clearMessages: () => void;

  /* Drafts */
  drafts: ConciergeDraft[];
  addDraft: (d: ConciergeDraft) => void;
  removeDraft: (id: string) => void;

  /* Shortcuts */
  shortcuts: ConciergeShortcut[];
  setShortcuts: (s: ConciergeShortcut[]) => void;

  /* History */
  history: ConciergeHistoryItem[];
  addHistoryItem: (h: ConciergeHistoryItem) => void;

  /* Today */
  todayItems: ConciergeTodayItem[];
  setTodayItems: (items: ConciergeTodayItem[]) => void;

  /* Search */
  searchQuery: string;
  searchResults: ConciergeSearchResult[];
  setSearchQuery: (q: string) => void;
  setSearchResults: (r: ConciergeSearchResult[]) => void;

  /* Notifications */
  notifications: ConciergeNotification[];
  setNotifications: (n: ConciergeNotification[]) => void;

  /* Wizard */
  wizard: WizardState;
  openWizard: (title: string, steps: WizardStep[]) => void;
  closeWizard: () => void;
  nextWizardStep: () => void;
  prevWizardStep: () => void;
  setWizardData: (data: Record<string, unknown>) => void;
  completeWizardStep: (stepIdx: number) => void;

  /* Command */
  commandInput: string;
  setCommandInput: (v: string) => void;
  recentCommands: string[];
  addRecentCommand: (cmd: string) => void;
}

export const useConciergeStore = create<ConciergeState>((set) => ({
  /* Context */
  context: null,
  recentContexts: [],
  setContext: (ctx) =>
    set((s) => ({
      context: ctx,
      recentContexts: [ctx, ...s.recentContexts.filter((c) => JSON.stringify(c) !== JSON.stringify(ctx))].slice(0, 10),
    })),
  pinContext: () =>
    set((s) => ({
      context: s.context ? { ...s.context, pinnedAt: new Date().toISOString() } : null,
    })),
  clearContext: () => set({ context: null }),
  restoreContext: (idx) =>
    set((s) => {
      const ctx = s.recentContexts[idx];
      return ctx ? { context: ctx } : {};
    }),

  /* Conversation */
  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),

  /* Drafts */
  drafts: [],
  addDraft: (d) => set((s) => ({ drafts: [d, ...s.drafts] })),
  removeDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),

  /* Shortcuts */
  shortcuts: [],
  setShortcuts: (s) => set({ shortcuts: s }),

  /* History */
  history: [],
  addHistoryItem: (h) => set((s) => ({ history: [h, ...s.history].slice(0, 200) })),

  /* Today */
  todayItems: [],
  setTodayItems: (items) => set({ todayItems: items }),

  /* Search */
  searchQuery: '',
  searchResults: [],
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSearchResults: (r) => set({ searchResults: r }),

  /* Notifications */
  notifications: [],
  setNotifications: (n) => set({ notifications: n }),

  /* Wizard */
  wizard: { open: false, title: '', steps: [], currentStep: 0, data: {} },
  openWizard: (title, steps) =>
    set({ wizard: { open: true, title, steps, currentStep: 0, data: {} } }),
  closeWizard: () =>
    set({ wizard: { open: false, title: '', steps: [], currentStep: 0, data: {} } }),
  nextWizardStep: () =>
    set((s) => ({
      wizard: { ...s.wizard, currentStep: Math.min(s.wizard.currentStep + 1, s.wizard.steps.length - 1) },
    })),
  prevWizardStep: () =>
    set((s) => ({
      wizard: { ...s.wizard, currentStep: Math.max(s.wizard.currentStep - 1, 0) },
    })),
  setWizardData: (data) =>
    set((s) => ({ wizard: { ...s.wizard, data: { ...s.wizard.data, ...data } } })),
  completeWizardStep: (stepIdx) =>
    set((s) => ({
      wizard: {
        ...s.wizard,
        steps: s.wizard.steps.map((st, i) => (i === stepIdx ? { ...st, completed: true } : st)),
      },
    })),

  /* Command */
  commandInput: '',
  setCommandInput: (v) => set({ commandInput: v }),
  recentCommands: [],
  addRecentCommand: (cmd) =>
    set((s) => ({ recentCommands: [cmd, ...s.recentCommands.filter((c) => c !== cmd)].slice(0, 20) })),
}));
