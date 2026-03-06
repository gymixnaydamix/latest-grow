/* ConciergeContextSwitcher — Quick context switching dropdown */
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useConciergeStore } from '@/store/concierge.store';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Props { className?: string; }

export function ConciergeContextSwitcher({ className }: Props) {
  const { recentContexts, restoreContext, context } = useConciergeStore();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border/40 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-xl dark:border-white/5"
      >
        <RotateCcw className="h-3 w-3 text-muted-foreground" />
        Recent Contexts
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && recentContexts.length > 0 && (
        <div className="absolute right-0 top-full z-20 mt-1 w-72 rounded-xl border border-border/40 bg-background/95 p-2 shadow-lg backdrop-blur-xl dark:border-white/5">
          {recentContexts.map((ctx, i) => (
            <button
              key={i}
              onClick={() => { restoreContext(i); setOpen(false); }}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs hover:bg-muted/60',
                JSON.stringify(ctx) === JSON.stringify(context) && 'bg-muted/40',
              )}
            >
              <span className="truncate text-foreground">
                {ctx.fields.map((f) => `${f.label}: ${f.value}`).join(' / ')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
