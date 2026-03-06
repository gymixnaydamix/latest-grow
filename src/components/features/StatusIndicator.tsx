/* ─── StatusIndicator ─── Live / Offline / Away status dot ─────────── */
import { cn } from '@/lib/utils';

type Status = 'online' | 'offline' | 'away' | 'busy' | 'dnd';

interface StatusIndicatorProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  label?: boolean;
  pulse?: boolean;
  className?: string;
}

const statusConfig: Record<Status, { color: string; ring: string; label: string }> = {
  online: { color: 'bg-emerald-400', ring: 'ring-emerald-400/30', label: 'Online' },
  offline: { color: 'bg-zinc-500', ring: 'ring-zinc-500/30', label: 'Offline' },
  away: { color: 'bg-amber-400', ring: 'ring-amber-400/30', label: 'Away' },
  busy: { color: 'bg-red-400', ring: 'ring-red-400/30', label: 'Busy' },
  dnd: { color: 'bg-red-500', ring: 'ring-red-500/30', label: 'Do Not Disturb' },
};

const sizeMap = {
  sm: 'size-2',
  md: 'size-2.5',
  lg: 'size-3.5',
};

const textSize = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
};

export function StatusIndicator({
  status,
  size = 'md',
  label: showLabel = false,
  pulse = true,
  className,
}: StatusIndicatorProps) {
  const cfg = statusConfig[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative inline-flex">
        <span
          className={cn(
            'inline-block rounded-full ring-2',
            cfg.color,
            cfg.ring,
            sizeMap[size],
          )}
        />
        {pulse && status === 'online' && (
          <span
            className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-50',
              cfg.color,
              sizeMap[size],
            )}
          />
        )}
      </span>
      {showLabel && (
        <span className={cn('font-medium text-white/50', textSize[size])}>
          {cfg.label}
        </span>
      )}
    </span>
  );
}
