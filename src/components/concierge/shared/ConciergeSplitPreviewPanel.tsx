/* ConciergeSplitPreviewPanel — Left editor / right live preview split */
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface Props {
  left: ReactNode;
  right: ReactNode;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export function ConciergeSplitPreviewPanel({ left, right, leftLabel = 'Editor', rightLabel = 'Preview', className }: Props) {
  return (
    <div className={cn('grid h-full grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/40 bg-border/20 dark:border-white/5', className)}>
      <div className="flex flex-col bg-background/90 dark:bg-zinc-900/80">
        <div className="border-b border-border/30 px-4 py-2 dark:border-white/5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{leftLabel}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{left}</div>
      </div>
      <div className="flex flex-col bg-muted/20 dark:bg-zinc-800/40">
        <div className="border-b border-border/30 px-4 py-2 dark:border-white/5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{rightLabel}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{right}</div>
      </div>
    </div>
  );
}
