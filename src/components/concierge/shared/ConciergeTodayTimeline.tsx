/* ConciergeTodayTimeline — Operations timeline (not analytics) */
import { ChevronRight } from 'lucide-react';
import type { ConciergeTodayItem } from '@/store/concierge.store';
import { cn } from '@/lib/utils';

interface Props { items: ConciergeTodayItem[]; onAction?: (id: string, action: string) => void; className?: string; }

const priorityBorder: Record<string, string> = {
  low: 'border-l-zinc-400',
  medium: 'border-l-blue-500',
  high: 'border-l-amber-500',
  urgent: 'border-l-red-500',
};

export function ConciergeTodayTimeline({ items, onAction, className }: Props) {
  return (
    <div className={cn('space-y-2', className)}>
      {items.map((it) => (
        <div key={it.id} className={cn(
          'flex items-center gap-3 rounded-xl border border-border/30 border-l-4 bg-background/70 p-3 dark:border-white/5 dark:bg-zinc-900/50',
          priorityBorder[it.priority],
        )}>
          <span className="w-12 shrink-0 text-[10px] font-medium text-muted-foreground">{it.time}</span>
          <div className="flex-1 min-w-0">
            <h5 className="truncate text-xs font-semibold text-foreground">{it.title}</h5>
            {it.entity && <span className="text-[10px] text-muted-foreground">{it.entity}</span>}
          </div>
          <div className="flex items-center gap-1">
            {it.actions.slice(0, 2).map((a) => (
              <button
                key={a}
                onClick={() => onAction?.(it.id, a)}
                className="rounded-lg border border-border/40 px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60 dark:border-white/10"
              >
                {a}
              </button>
            ))}
            {it.actions.length > 2 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nothing scheduled for today</p>}
    </div>
  );
}
