/* ConciergeQuickActionGrid — Grid of premium action tiles */
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  color?: string;
  onClick?: () => void;
}

interface Props { actions: QuickAction[]; columns?: number; className?: string; }

export function ConciergeQuickActionGrid({ actions, columns = 4, className }: Props) {
  return (
    <div className={cn('grid gap-3', className)} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.id}
            onClick={a.onClick}
            className={cn(
              'group flex flex-col items-center gap-2.5 rounded-2xl border border-border/40 bg-background/80 p-5 text-center shadow-sm transition hover:shadow-md hover:border-primary/30 dark:border-white/5 dark:bg-zinc-900/60 dark:hover:border-primary/20',
            )}
          >
            <div className={cn('rounded-xl p-2.5 transition group-hover:scale-110', a.color ?? 'bg-primary/10 text-primary')}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-foreground">{a.label}</span>
          </button>
        );
      })}
    </div>
  );
}
