/* ConciergeContextBar — Top sticky zone showing role-specific working context */
import { Pin, X, ChevronDown, RotateCcw } from 'lucide-react';
import { useConciergeStore, type ConciergeContextField } from '@/store/concierge.store';
import { cn } from '@/lib/utils';

interface Props {
  fields: ConciergeContextField[];
  onFieldChange?: (key: string, value: string) => void;
  className?: string;
}

export function ConciergeContextBar({ fields, onFieldChange, className }: Props) {
  const { context, pinContext, clearContext, recentContexts, restoreContext } = useConciergeStore();
  const isPinned = !!context?.pinnedAt;

  return (
    <div className={cn(
      'sticky top-0 z-30 flex items-center gap-3 rounded-xl border border-border/40 bg-background/80 px-4 py-2.5 backdrop-blur-xl',
      'shadow-sm dark:border-white/5 dark:bg-zinc-900/80',
      className,
    )}>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Working on:</span>
      <div className="flex flex-1 items-center gap-2 overflow-x-auto">
        {fields.map((f) => (
          <button
            key={f.key}
            onClick={() => onFieldChange?.(f.key, f.value)}
            className="inline-flex items-center gap-1 rounded-lg border border-border/50 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-muted/80 dark:border-white/5"
          >
            <span className="text-muted-foreground">{f.label}:</span>
            <span>{f.value || '—'}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={pinContext}
          className={cn(
            'rounded-md p-1.5 text-muted-foreground transition hover:bg-muted/60',
            isPinned && 'text-amber-500',
          )}
          title="Pin context"
        >
          <Pin className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={clearContext}
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted/60"
          title="Clear context"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {recentContexts.length > 0 && (
          <button
            onClick={() => restoreContext(0)}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted/60"
            title="Restore recent"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
