/* ─── ConfirmDialog ─── Reusable confirmation dialog with holographic style ── */
import { type ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'destructive' | 'warning' | 'info';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  icon?: ReactNode;
  onConfirm: () => void;
  loading?: boolean;
}

const variantStyles: Record<Variant, { icon: typeof Info; color: string; btnClass: string }> = {
  destructive: {
    icon: Trash2,
    color: 'text-red-400',
    btnClass: 'bg-destructive hover:bg-destructive/90 text-white',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    btnClass: 'bg-amber-600 hover:bg-amber-500 text-white',
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    btnClass: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  icon,
  onConfirm,
  loading,
}: ConfirmDialogProps) {
  const vs = variantStyles[variant];
  const VIcon = vs.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-border bg-popover/95 text-popover-foreground backdrop-blur-xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn('flex size-10 items-center justify-center rounded-xl bg-muted/40', vs.color)}>
              {icon ?? <VIcon className="size-5" />}
            </div>
            <AlertDialogTitle className="text-foreground">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border text-muted-foreground hover:bg-accent hover:text-foreground">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className={cn(vs.btnClass, loading && 'opacity-50 pointer-events-none')}
          >
            {loading ? 'Processing...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
