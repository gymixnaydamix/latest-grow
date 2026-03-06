/* ─── TimelineEvent ─── Activity feed timeline item ─────────────────── */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TimelineEventProps {
  time: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  color?: string;
  isLast?: boolean;
  children?: ReactNode;
  className?: string;
}

export function TimelineEvent({
  time,
  title,
  description,
  icon,
  color = 'bg-indigo-400',
  isLast = false,
  children,
  className,
}: TimelineEventProps) {
  return (
    <div className={cn('relative flex gap-4', className)}>
      {/* Line + Dot */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div className={cn('relative z-10 mt-1 flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 shrink-0')}>
          {icon ?? <div className={cn('size-2.5 rounded-full', color)} />}
        </div>
        {/* Connect line */}
        {!isLast && (
          <div className="flex-1 w-px bg-white/6 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <span className="shrink-0 text-[10px] text-white/30 tabular-nums">{time}</span>
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-white/40">{description}</p>
        )}
        {children && (
          <div className="mt-2">{children}</div>
        )}
      </div>
    </div>
  );
}

/* ── Timeline wrapper ──────────────────────────────────────────────── */
interface TimelineProps {
  children: ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {children}
    </div>
  );
}
