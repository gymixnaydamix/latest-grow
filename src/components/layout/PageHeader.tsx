/* ─── PageHeader ─── Top section of any page/section ──────────────── */
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, badge, icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-center gap-3">
        {icon && <span className="text-indigo-400">{icon}</span>}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white/90 tracking-tight">{title}</h1>
            {badge && (
              <Badge className="border-0 bg-indigo-500/20 text-indigo-300 text-[10px]">{badge}</Badge>
            )}
          </div>
          {description && <p className="text-xs text-white/40 max-w-lg">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 mt-2 sm:mt-0">{actions}</div>}
    </div>
  );
}
