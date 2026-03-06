/* ConciergeActionCard — Inline action card within conversation with preview/confirm/cancel */
import { Eye, Check, X, Shield, AlertTriangle, Zap } from 'lucide-react';
import type { ConciergeActionCardData } from '@/store/concierge.store';
import { cn } from '@/lib/utils';

interface Props {
  card: ConciergeActionCardData;
  onPreview?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  pending: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  confirmed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  executed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-zinc-400/10 text-zinc-500',
};

export function ConciergeActionCard({ card, onPreview, onConfirm, onCancel, className }: Props) {
  return (
    <div className={cn(
      'rounded-xl border border-border/40 bg-background/90 p-4 shadow-sm backdrop-blur-lg dark:border-white/5 dark:bg-zinc-900/60',
      className,
    )}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
        </div>
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', statusColors[card.status] ?? statusColors.draft)}>
          {card.status}
        </span>
      </div>

      {/* Linked entities */}
      {card.linkedEntities.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {card.linkedEntities.map((e) => (
            <span key={e.id} className="inline-flex items-center rounded-md bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-zinc-800/50">
              {e.type}: {e.label}
            </span>
          ))}
        </div>
      )}

      {/* Editable fields */}
      <div className="mb-3 space-y-1.5">
        {card.fields.map((f) => (
          <div key={f.key} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{f.label}</span>
            <span className="font-medium text-foreground">{f.value}</span>
          </div>
        ))}
      </div>

      {/* Permission + audit badges */}
      <div className="mb-3 flex items-center gap-2">
        {card.permissionChip && (
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <Shield className="h-2.5 w-2.5" /> {card.permissionChip}
          </span>
        )}
        {card.auditWarning && (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-2.5 w-2.5" /> {card.auditWarning}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button onClick={onPreview} className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted/60 dark:border-white/10">
          <Eye className="h-3 w-3" /> Preview
        </button>
        <button onClick={onConfirm} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90">
          <Check className="h-3 w-3" /> Confirm
        </button>
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted/60 dark:border-white/10">
          <X className="h-3 w-3" /> Cancel
        </button>
      </div>
    </div>
  );
}
