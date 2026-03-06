/* ConciergeWelcomeBlock — Premium short welcome with context and suggested actions */
import { Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion { label: string; icon?: LucideIcon; onClick?: () => void; }
interface Props { greeting: string; contextSummary: string; suggestions: Suggestion[]; className?: string; }

export function ConciergeWelcomeBlock({ greeting, contextSummary, suggestions, className }: Props) {
  return (
    <div className={cn(
      'rounded-2xl border border-border/30 bg-gradient-to-br from-primary/5 via-background to-background p-5 dark:border-white/5 dark:from-primary/10',
      className,
    )}>
      <div className="mb-2 flex items-center gap-2">
        <div className="rounded-xl bg-primary/10 p-2">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{greeting}</h3>
          <p className="text-[11px] text-muted-foreground">{contextSummary}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={s.onClick}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/60 dark:border-white/10"
            >
              {Icon && <Icon className="h-3 w-3 text-primary" />}
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
