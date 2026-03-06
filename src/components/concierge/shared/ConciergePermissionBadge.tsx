/* ConciergePermissionBadge — Pill displaying permission state */
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { granted?: boolean; label?: string; className?: string; }

export function ConciergePermissionBadge({ granted = true, label, className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium',
      granted ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400',
      className,
    )}>
      {granted ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
      {label ?? (granted ? 'Permitted' : 'Restricted')}
    </span>
  );
}
