/* ─── EmptyState ─── Placeholder for empty data views ──────────────── */
import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title = 'No data yet',
  description = 'Items will appear here once they are added.',
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/8 bg-white/2 px-8 py-14 text-center',
        className,
      )}
    >
      {/* Icon */}
      <div className="flex size-14 items-center justify-center rounded-2xl bg-white/5">
        {icon ?? <Inbox className="size-7 text-white/20" />}
      </div>

      {/* Copy */}
      <div className="max-w-xs space-y-1">
        <p className="text-sm font-semibold text-white/60">{title}</p>
        <p className="text-xs text-white/30">{description}</p>
      </div>

      {/* CTA */}
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="border-white/10 text-white/60 hover:text-white hover:border-white/20"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
