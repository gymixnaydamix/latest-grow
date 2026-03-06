/* ConciergeAuditNotice — Slim audit warning strip */
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { message: string; className?: string; }

export function ConciergeAuditNotice({ message, className }: Props) {
  return (
    <div className={cn(
      'flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-[11px] font-medium text-amber-700 dark:border-amber-400/10 dark:text-amber-300',
      className,
    )}>
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
