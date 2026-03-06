/* ConciergeExecutionReceipt — Premium receipt card after action execution */
import { CheckCircle, ExternalLink, RotateCcw, Clock, User } from 'lucide-react';
import type { ConciergeReceipt } from '@/store/concierge.store';
import { cn } from '@/lib/utils';

interface Props { receipt: ConciergeReceipt; className?: string; }

export function ConciergeExecutionReceipt({ receipt, className }: Props) {
  return (
    <div className={cn(
      'rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:border-emerald-400/10 dark:bg-emerald-500/5',
      className,
    )}>
      <div className="mb-2 flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{receipt.action}</h4>
      </div>
      <div className="mb-2 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{receipt.by}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{receipt.when}</span>
      </div>
      {receipt.changedRecords.length > 0 && (
        <div className="mb-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Changed records</p>
          <div className="flex flex-wrap gap-1">
            {receipt.changedRecords.map((r) => (
              <span key={r.id} className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground dark:bg-zinc-800/60">
                <ExternalLink className="h-2.5 w-2.5" /> {r.type}: {r.label}
              </span>
            ))}
          </div>
        </div>
      )}
      {receipt.nextSteps.length > 0 && (
        <div className="mb-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Next steps</p>
          <div className="flex flex-wrap gap-1.5">
            {receipt.nextSteps.map((s, i) => (
              <button key={i} className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 transition hover:bg-emerald-500/10 dark:text-emerald-400">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
      {receipt.undoSupported && (
        <button className="mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-muted-foreground transition hover:bg-muted/60">
          <RotateCcw className="h-3 w-3" /> Undo
        </button>
      )}
    </div>
  );
}
