import { useMemo, useState } from 'react';
import { BadgeDollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notifyError, notifySuccess } from '@/lib/notify';
import {
  useProviderBillingOverview,
  useUpdateProviderSubscriptionLifecycle,
} from '@/hooks/api/use-provider-console';
import { Panel, Row, SectionPageHeader, SectionShell, StatCard, StatusBadge, getAccent, reasonPrompt } from '../shared';
import { BillingLoadingState, billingSelectClass, formatCurrency, formatDate } from './shared';

export function SubscriptionsBillingPage() {
  const accent = getAccent('provider_billing');
  const { data, isLoading } = useProviderBillingOverview();
  const updateLifecycle = useUpdateProviderSubscriptionLifecycle();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const subscriptions = useMemo(() => {
    const rows = data?.subscriptions ?? [];
    return statusFilter === 'ALL' ? rows : rows.filter((row) => row.state === statusFilter);
  }, [data?.subscriptions, statusFilter]);

  const totals = useMemo(() => {
    const rows = data?.subscriptions ?? [];
    return {
      total: rows.length,
      active: rows.filter((row) => row.state === 'ACTIVE').length,
      trial: rows.filter((row) => row.state === 'TRIAL').length,
      atRisk: rows.filter((row) => row.collectionState === 'AT_RISK' || row.collectionState === 'SUSPENDED').length,
      mrr: rows.reduce((sum, row) => sum + row.monthlyPrice, 0),
    };
  }, [data?.subscriptions]);

  async function runAction(subscriptionId: string, action: 'ACTIVATE' | 'SUSPEND' | 'RESUME' | 'CANCEL', label: string) {
    const reason = reasonPrompt(`${label} subscription`);
    if (!reason) return;
    try {
      await updateLifecycle.mutateAsync({ subscriptionId, action, reason });
      notifySuccess('Subscription updated', `${label} completed successfully.`);
    } catch (error) {
      notifyError('Subscription update failed', error instanceof Error ? error.message : 'Unable to update subscription.');
    }
  }

  return (
    <SectionShell>
      <SectionPageHeader
        icon={BadgeDollarSign}
        title="Subscriptions"
        description="Tenant lifecycle control across active, trial, overdue, and suspended contracts."
        accent={accent}
      />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
        <StatCard label="Total" value={String(totals.total)} sub="All subscriptions" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Active" value={String(totals.active)} sub="Renewing normally" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Trial" value={String(totals.trial)} sub="Conversion window" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="At Risk" value={String(totals.atRisk)} sub="Collection pressure" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="MRR" value={formatCurrency(totals.mrr)} sub="Modeled recurring" gradient="from-violet-500/10 to-violet-500/5" />
      </div>

      <Panel
        title="Lifecycle Queue"
        subtitle={isLoading ? 'Loading subscriptions…' : `${subscriptions.length} subscriptions in view`}
        action={
          <select className={billingSelectClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">All states</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Trial</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        }
      >
        {isLoading ? (
          <BillingLoadingState />
        ) : (
          <div className="space-y-2">
            {subscriptions.map((subscription) => (
              <Row key={subscription.id}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-100">{subscription.tenantName}</p>
                      <StatusBadge status={subscription.state} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {subscription.planName} · {formatCurrency(subscription.monthlyPrice)}/mo · {subscription.seats.toLocaleString()} seats · Renews {formatDate(subscription.renewalAt)}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Admin: {subscription.adminEmail} · Collection state: {subscription.collectionState}
                      {subscription.trialEndsAt ? ` · Trial ends ${formatDate(subscription.trialEndsAt)}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(subscription.state === 'PAST_DUE' || subscription.state === 'SUSPENDED') && (
                      <Button size="sm" className="h-7 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => runAction(subscription.id, subscription.state === 'SUSPENDED' ? 'RESUME' : 'ACTIVATE', 'Resume')}>
                        Resume
                      </Button>
                    )}
                    {(subscription.state === 'ACTIVE' || subscription.state === 'TRIAL') && (
                      <Button size="sm" className="h-7 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={() => runAction(subscription.id, 'SUSPEND', 'Suspend')}>
                        Suspend
                      </Button>
                    )}
                    {subscription.state !== 'CANCELLED' && (
                      <Button size="sm" variant="outline" className="h-7 border-slate-500/30 text-slate-200" onClick={() => runAction(subscription.id, 'CANCEL', 'Cancel')}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Row>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}
