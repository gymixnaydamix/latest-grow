/* ConciergeTodayStrip — Horizontal strip of actionable "today" chips */
import { cn } from '@/lib/utils';

export interface TodayChip {
  id: string;
  count: number;
  label: string;
  color?: string;
  onClick?: () => void;
}

interface Props { chips: TodayChip[]; className?: string; }

export function ConciergeTodayStrip({ chips, className }: Props) {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto py-1', className)}>
      {chips.map((c) => (
        <button
          key={c.id}
          onClick={c.onClick}
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border/40 px-3 py-1.5 text-xs font-medium transition hover:bg-muted/60 dark:border-white/10',
            c.color ?? 'bg-background text-foreground',
          )}
        >
          <span className="font-bold text-primary">{c.count}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}
