import { type FormEvent, useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { notifyError, notifySuccess } from '@/lib/notify';
import {
  useCreateProviderGateway,
  useProviderBillingOverview,
  useUpdateProviderGateway,
} from '@/hooks/api/use-provider-console';
import { Panel, Row, SectionPageHeader, SectionShell, StatCard, StatusBadge, getAccent, reasonPrompt } from '../shared';
import { BillingLoadingState, billingInputClass, formatCurrency, formatDate } from './shared';

export function PaymentsBillingPage() {
  const accent = getAccent('provider_billing');
  const { data, isLoading } = useProviderBillingOverview();
  const createGateway = useCreateProviderGateway();
  const updateGateway = useUpdateProviderGateway();
  const [form, setForm] = useState({
    name: '',
    type: 'CARD',
    settlementDays: '2',
    methods: 'CARD, ACH',
    primary: true,
  });

  const gatewayStats = useMemo(() => {
    const gateways = data?.gateways ?? [];
    const avgSuccess = gateways.length > 0 ? gateways.reduce((sum, gateway) => sum + gateway.successRate, 0) / gateways.length : 0;
    const totalVolume = gateways.reduce((sum, gateway) => sum + Number(String(gateway.monthlyVolume).replace(/[^\d.]/g, '') || 0), 0);
    const primary = gateways.find((gateway) => gateway.primary);
    return { gateways, avgSuccess, totalVolume, primary };
  }, [data?.gateways]);

  async function handleCreateGateway(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = reasonPrompt('Create payment gateway');
    if (!reason) return;
    try {
      await createGateway.mutateAsync({
        name: form.name,
        type: form.type,
        settlementDays: Number(form.settlementDays),
        methods: form.methods.split(',').map((entry) => entry.trim().toUpperCase()).filter(Boolean),
        primary: form.primary,
        reason,
      });
      notifySuccess('Gateway created', `${form.name} is now part of the payment stack.`);
      setForm({ name: '', type: 'CARD', settlementDays: '2', methods: 'CARD, ACH', primary: false });
    } catch (error) {
      notifyError('Gateway creation failed', error instanceof Error ? error.message : 'Unable to create gateway.');
    }
  }

  async function handleGatewayUpdate(gatewayId: string, payload: { status?: 'ACTIVE' | 'DEGRADED' | 'DISABLED'; primary?: boolean }, label: string) {
    const reason = reasonPrompt(label);
    if (!reason) return;
    try {
      await updateGateway.mutateAsync({ gatewayId, ...payload, reason });
      notifySuccess('Gateway updated', `${label} completed successfully.`);
    } catch (error) {
      notifyError('Gateway update failed', error instanceof Error ? error.message : 'Unable to update gateway.');
    }
  }

  return (
    <SectionShell>
      <SectionPageHeader
        icon={CreditCard}
        title="Payments"
        description="Gateway orchestration, payment activity, and settlement posture across the platform."
        accent={accent}
      />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Gateways" value={String(gatewayStats.gateways.length)} sub="Configured providers" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Primary" value={gatewayStats.primary?.name ?? '—'} sub="Default processor" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Avg Success" value={`${gatewayStats.avgSuccess.toFixed(1)}%`} sub="Across gateways" gradient="from-cyan-500/10 to-cyan-500/5" />
        <StatCard label="Volume" value={formatCurrency(gatewayStats.totalVolume)} sub="Monthly processed" gradient="from-violet-500/10 to-violet-500/5" />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.05fr_1.95fr]">
        <Panel title="Add Gateway" subtitle="Register a payment processor and choose its methods." accentBorder="border-emerald-500/20">
          <form className="space-y-3" onSubmit={handleCreateGateway}>
            <Input className={billingInputClass} placeholder="Gateway name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input className={billingInputClass} placeholder="Gateway type" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} />
              <Input className={billingInputClass} placeholder="Settlement days" value={form.settlementDays} onChange={(event) => setForm((current) => ({ ...current, settlementDays: event.target.value }))} />
            </div>
            <Input className={billingInputClass} placeholder="Methods, comma separated" value={form.methods} onChange={(event) => setForm((current) => ({ ...current, methods: event.target.value }))} />
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input type="checkbox" checked={form.primary} onChange={(event) => setForm((current) => ({ ...current, primary: event.target.checked }))} />
              Set as primary gateway
            </label>
            <Button type="submit" className="h-9 bg-emerald-600 text-white hover:bg-emerald-700" disabled={createGateway.isPending}>
              {createGateway.isPending ? 'Creating…' : 'Create Gateway'}
            </Button>
          </form>
        </Panel>

        <Panel title="Gateway Operations" subtitle={isLoading ? 'Loading gateways…' : `${gatewayStats.gateways.length} providers configured`}>
          {isLoading ? (
            <BillingLoadingState />
          ) : (
            <div className="space-y-2">
              {gatewayStats.gateways.map((gateway) => (
                <div key={gateway.id} className="rounded-xl border border-slate-500/20 bg-slate-800/55 p-3 text-xs">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-100">{gateway.name}</p>
                        {gateway.primary && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-200">Primary</span>}
                        <StatusBadge status={gateway.status} />
                      </div>
                      <p className="mt-1 text-slate-400">
                        {gateway.type} · {gateway.monthlyVolume} volume · {gateway.successRate}% success · {gateway.settlementDays} day settlement
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Methods: {(gateway.methods ?? []).join(', ') || 'CARD'} · Regions: {(gateway.supportedRegions ?? []).join(', ') || 'US'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!gateway.primary && (
                        <Button size="sm" variant="outline" className="h-7 border-emerald-500/30 text-emerald-100" onClick={() => handleGatewayUpdate(gateway.id, { primary: true }, `Set ${gateway.name} as primary`)}>
                          Make Primary
                        </Button>
                      )}
                      {gateway.status !== 'DISABLED' ? (
                        <Button size="sm" className="h-7 bg-red-500/20 text-red-100 hover:bg-red-500/30" onClick={() => handleGatewayUpdate(gateway.id, { status: 'DISABLED' }, `Disable ${gateway.name}`)}>
                          Disable
                        </Button>
                      ) : (
                        <Button size="sm" className="h-7 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleGatewayUpdate(gateway.id, { status: 'ACTIVE' }, `Activate ${gateway.name}`)}>
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Payment Activity" subtitle={isLoading ? 'Loading payments…' : `${data?.payments.length ?? 0} recent payment events`}>
        {isLoading ? (
          <BillingLoadingState />
        ) : (
          <div className="space-y-2">
            {(data?.payments ?? []).map((payment) => (
              <Row key={payment.id}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-100">{payment.tenantName} · {formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-slate-400">
                      {payment.gatewayName} · {payment.method} · Ref {payment.providerRef} · {formatDate(payment.attemptedAt)}
                    </p>
                    {payment.failureReason && <p className="mt-1 text-[11px] text-red-300">{payment.failureReason}</p>}
                  </div>
                  <StatusBadge status={payment.state} />
                </div>
              </Row>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}
