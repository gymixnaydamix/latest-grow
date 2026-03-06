/* ConciergeHistoryTimeline — Full action trail timeline */
import { Clock, ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { ConciergeHistoryItem } from '@/store/concierge.store';
import { cn } from '@/lib/utils';

interface Props { items: ConciergeHistoryItem[]; onOpenReceipt?: (id: string) => void; className?: string; }

const statusIcons = {
  success: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />,
  failed: <XCircle className="h-3.5 w-3.5 text-red-500" />,
  pending: <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />,
};

export function ConciergeHistoryTimeline({ items, onOpenReceipt, className }: Props) {
  return (
    <div className={cn('space-y-2', className)}>
      {items.map((h) => (
        <div key={h.id} className="flex items-start gap-3 rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5 dark:bg-zinc-900/50">
          <div className="mt-0.5">{statusIcons[h.status]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h5 className="truncate text-xs font-semibold text-foreground">{h.title}</h5>
              <span className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{h.actionType}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{h.timestamp}</span>
              <span>{h.user}</span>
            </div>
            {h.linkedRecords.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {h.linkedRecords.map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-0.5 rounded bg-muted/40 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                    <ExternalLink className="h-2 w-2" /> {r.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => onOpenReceipt?.(h.id)} className="rounded-lg border border-border/40 px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60 dark:border-white/10">
            Receipt
          </button>
        </div>
      ))}
      {items.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No actions yet</p>}
    </div>
  );
}
