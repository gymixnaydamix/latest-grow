/* ConciergeTaskCard — Task card with checklist progress and actions */
import { Clock, CheckSquare, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  linkedEntity?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  owner?: string;
  checklistTotal?: number;
  checklistDone?: number;
  isBlocked?: boolean;
  blockedReason?: string;
  onOpen?: () => void;
  onComplete?: () => void;
  className?: string;
}

const priorityColors: Record<string, string> = {
  low: 'text-zinc-500',
  medium: 'text-blue-500',
  high: 'text-amber-500',
  urgent: 'text-red-500',
};

export function ConciergeTaskCard({
  title, linkedEntity, dueDate, priority = 'medium', owner,
  checklistTotal = 0, checklistDone = 0, isBlocked, blockedReason,
  onOpen, onComplete, className,
}: Props) {
  const pct = checklistTotal > 0 ? (checklistDone / checklistTotal) * 100 : 0;

  return (
    <div className={cn(
      'rounded-xl border border-border/40 bg-background/80 p-3.5 shadow-sm transition hover:shadow-md dark:border-white/5 dark:bg-zinc-900/60',
      className,
    )}>
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {linkedEntity && <p className="text-[10px] text-muted-foreground">{linkedEntity}</p>}
        </div>
        <button className="rounded-md p-1 text-muted-foreground hover:bg-muted/60"><MoreHorizontal className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mb-2 flex items-center gap-3 text-[10px] text-muted-foreground">
        {dueDate && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{dueDate}</span>}
        <span className={priorityColors[priority]}>{priority.toUpperCase()}</span>
        {owner && <span>{owner}</span>}
      </div>
      {checklistTotal > 0 && (
        <div className="mb-2">
          <div className="mb-0.5 flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">{checklistDone}/{checklistTotal}</span>
            <span className="text-muted-foreground">{Math.round(pct)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted/40">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      {isBlocked && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3" /> {blockedReason ?? 'Blocked'}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button onClick={onOpen} className="rounded-lg border border-border/50 px-2.5 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60 dark:border-white/10">Open</button>
        <button onClick={onComplete} className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/20">
          <CheckSquare className="mr-1 inline h-3 w-3" />Complete
        </button>
      </div>
    </div>
  );
}
