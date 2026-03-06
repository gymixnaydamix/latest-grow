/* ─── BulkActionBar ─── Sticky bottom bar for bulk operations ──── */
import { cn } from '@/lib/utils';
import { X, Trash2, Download, Tag, Share2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  onClick: (selectedIds: string[]) => void;
}

interface BulkActionBarProps {
  selectedCount: number;
  selectedIds: string[];
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll?: () => void;
  actions?: BulkAction[];
  className?: string;
}

const DEFAULT_ACTIONS: (onSelect: (ids: string[]) => void) => BulkAction[] = () => [
  { id: 'export', label: 'Export', icon: <Download className="size-3" />, variant: 'default', onClick: () => {} },
  { id: 'tag', label: 'Tag', icon: <Tag className="size-3" />, variant: 'default', onClick: () => {} },
  { id: 'share', label: 'Share', icon: <Share2 className="size-3" />, variant: 'default', onClick: () => {} },
  { id: 'delete', label: 'Delete', icon: <Trash2 className="size-3" />, variant: 'destructive', onClick: () => {} },
];

export function BulkActionBar({
  selectedCount,
  selectedIds,
  totalCount,
  onClearSelection,
  onSelectAll,
  actions,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  const resolvedActions = actions ?? DEFAULT_ACTIONS(() => {});

  return (
    <div className={cn(
      'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
      'flex items-center gap-3 rounded-xl border border-white/10 bg-black/80 backdrop-blur-2xl px-4 py-2.5 shadow-2xl shadow-black/50',
      'animate-in slide-in-from-bottom-4 fade-in duration-200',
      className,
    )}>
      {/* Count */}
      <div className="flex items-center gap-2 border-r border-white/6 pr-3">
        <div className="size-5 rounded bg-indigo-400/20 flex items-center justify-center">
          <CheckSquare className="size-3 text-indigo-400" />
        </div>
        <span className="text-xs font-medium text-white/70">{selectedCount} selected</span>
        {onSelectAll && selectedCount < totalCount && (
          <button onClick={onSelectAll} className="text-[10px] text-indigo-400 hover:underline ml-1">Select all {totalCount}</button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {resolvedActions.map(action => (
          <Button
            key={action.id}
            size="sm"
            variant="ghost"
            className={cn(
              'text-xs gap-1.5 h-7 px-2.5',
              action.variant === 'destructive'
                ? 'text-rose-400 hover:bg-rose-400/10 hover:text-rose-300'
                : 'text-white/50 hover:bg-white/5 hover:text-white/70',
            )}
            onClick={() => action.onClick(selectedIds)}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>

      {/* Close */}
      <div className="border-l border-white/6 pl-2">
        <Button variant="ghost" size="icon" className="size-6 text-white/25 hover:text-white/50" onClick={onClearSelection}>
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default BulkActionBar;
