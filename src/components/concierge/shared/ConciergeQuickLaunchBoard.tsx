/* ConciergeQuickLaunchBoard — Grouped sections of advanced action tiles */
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickLaunchSection {
  title: string;
  actions: { id: string; label: string; icon: LucideIcon; onClick?: () => void }[];
}

interface Props { sections: QuickLaunchSection[]; className?: string; }

export function ConciergeQuickLaunchBoard({ sections, className }: Props) {
  return (
    <div className={cn('space-y-5', className)}>
      {sections.map((sec) => (
        <div key={sec.title}>
          <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{sec.title}</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sec.actions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  onClick={a.onClick}
                  className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-background/80 px-3 py-2.5 text-left transition hover:border-primary/30 hover:shadow-sm dark:border-white/5 dark:bg-zinc-900/60"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs font-medium text-foreground">{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
