import { Loader2 } from 'lucide-react';

export const billingInputClass =
  'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-300 dark:bg-white dark:text-slate-900';

export const billingSelectClass =
  'h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-300 dark:bg-white dark:text-slate-900';

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0,
  );
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function BillingLoadingState({ className = 'text-emerald-400' }: { className?: string }) {
  return (
    <div className="flex items-center justify-center py-14">
      <Loader2 className={`size-6 animate-spin ${className}`} />
    </div>
  );
}
