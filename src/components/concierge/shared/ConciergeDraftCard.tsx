/* ConciergeDraftCard — Compact draft card for utility rail */
import { FileEdit, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  type: string;
  updatedAt: string;
  linkedEntity?: string;
  onOpen?: () => void;
  className?: string;
}

export function ConciergeDraftCard({ title, type, updatedAt, linkedEntity, onOpen, className }: Props) {
  return (
    <button onClick={onOpen} className={cn(
      'flex w-full items-start gap-2.5 rounded-xl border border-border/30 bg-background/70 p-2.5 text-left transition hover:bg-muted/40 dark:border-white/5 dark:bg-zinc-900/50',
      className,
    )}>
      <div className="rounded-lg bg-amber-500/10 p-1.5">
        <FileEdit className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="truncate text-xs font-medium text-foreground">{title}</h5>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{type}</span>
          {linkedEntity && <span>· {linkedEntity}</span>}
        </div>
        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <Clock className="h-2.5 w-2.5" /> {updatedAt}
        </span>
      </div>
    </button>
  );
}
