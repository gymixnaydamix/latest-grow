/* ConciergeImpactPreviewPanel — Preview of affected entities before execution */
import { AlertCircle, Users, Server, Building, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImpactItem { icon?: 'users' | 'server' | 'building' | 'billing'; label: string; value: string; risk?: 'low' | 'medium' | 'high'; }

interface Props { items: ImpactItem[]; rollbackNote?: string; className?: string; }

const iconMap = { users: Users, server: Server, building: Building, billing: CreditCard };
const riskColor: Record<string, string> = { low: 'text-zinc-500', medium: 'text-amber-500', high: 'text-red-500' };

export function ConciergeImpactPreviewPanel({ items, rollbackNote, className }: Props) {
  return (
    <div className={cn('rounded-xl border border-border/40 bg-background/80 p-4 dark:border-white/5 dark:bg-zinc-900/60', className)}>
      <div className="mb-3 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Impact Preview</h4>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => {
          const Icon = it.icon ? iconMap[it.icon] : AlertCircle;
          return (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3.5 w-3.5" />{it.label}</span>
              <span className={cn('font-medium', it.risk ? riskColor[it.risk] : 'text-foreground')}>{it.value}</span>
            </div>
          );
        })}
      </div>
      {rollbackNote && (
        <p className="mt-3 rounded-lg bg-muted/40 px-3 py-1.5 text-[10px] text-muted-foreground dark:bg-zinc-800/40">
          Rollback: {rollbackNote}
        </p>
      )}
    </div>
  );
}
