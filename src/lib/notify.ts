/* ─── Notify ─── Premium toast helpers wrapping Sonner with glow effects ─── */
import { toast } from 'sonner';
import type { Notification } from '@root/types';

// ---------------------------------------------------------------------------
// Styled toast wrappers
// ---------------------------------------------------------------------------

const glowStyles = {
  success: {
    style: {
      border: '1px solid oklch(0.72 0.19 195 / 0.3)',
      boxShadow: '0 0 20px oklch(0.72 0.19 195 / 0.15), 0 4px 12px oklch(0 0 0 / 0.2)',
      background: 'oklch(0.2 0.02 195 / 0.95)',
      backdropFilter: 'blur(12px)',
    },
  },
  error: {
    style: {
      border: '1px solid oklch(0.65 0.25 25 / 0.3)',
      boxShadow: '0 0 20px oklch(0.65 0.25 25 / 0.15), 0 4px 12px oklch(0 0 0 / 0.2)',
      background: 'oklch(0.2 0.04 25 / 0.95)',
      backdropFilter: 'blur(12px)',
    },
  },
  info: {
    style: {
      border: '1px solid oklch(0.7 0.15 250 / 0.3)',
      boxShadow: '0 0 20px oklch(0.7 0.15 250 / 0.15), 0 4px 12px oklch(0 0 0 / 0.2)',
      background: 'oklch(0.2 0.03 250 / 0.95)',
      backdropFilter: 'blur(12px)',
    },
  },
  warning: {
    style: {
      border: '1px solid oklch(0.75 0.18 75 / 0.3)',
      boxShadow: '0 0 20px oklch(0.75 0.18 75 / 0.15), 0 4px 12px oklch(0 0 0 / 0.2)',
      background: 'oklch(0.2 0.04 75 / 0.95)',
      backdropFilter: 'blur(12px)',
    },
  },
};

/** Success toast with cyan neon glow */
export function notifySuccess(title: string, description?: string) {
  return toast.success(title, {
    description,
    ...glowStyles.success,
    duration: 4000,
  });
}

/** Error toast with red neon glow */
export function notifyError(title: string, description?: string) {
  return toast.error(title, {
    description,
    ...glowStyles.error,
    duration: 6000,
  });
}

/** Info toast with blue neon glow */
export function notifyInfo(title: string, description?: string) {
  return toast.info(title, {
    description,
    ...glowStyles.info,
    duration: 4000,
  });
}

/** Warning toast with amber neon glow */
export function notifyWarning(title: string, description?: string) {
  return toast.warning(title, {
    description,
    ...glowStyles.warning,
    duration: 5000,
  });
}

/** Show a toast from a notification object */
export function notifyFromNotification(notification: Notification) {
  const typeMap: Record<string, (t: string, d?: string) => void> = {
    SUCCESS: notifySuccess,
    ERROR: notifyError,
    WARNING: notifyWarning,
    INFO: notifyInfo,
    ANNOUNCEMENT: notifyInfo,
    GRADE: notifySuccess,
    ATTENDANCE: notifyInfo,
    ASSIGNMENT: notifyWarning,
    MESSAGE: notifyInfo,
    SYSTEM: notifyInfo,
  };

  const handler = typeMap[notification.type] ?? notifyInfo;
  handler(notification.title, notification.message);
}
