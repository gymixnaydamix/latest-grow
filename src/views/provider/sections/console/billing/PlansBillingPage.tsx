import { type FormEvent, useMemo, useState } from 'react';
import { Layers3, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { notifyError, notifySuccess } from '@/lib/notify';
import { useCreateProviderPlan, useProviderBillingOverview } from '@/hooks/api/use-provider-console';
import { Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, getAccent, reasonPrompt } from '../shared';
import { BillingLoadingState, billingInputClass, formatCurrency } from './shared';

export function PlansBillingPage() {
  const accent = getAccent('provider_billing');
  const { data, isLoading } = useProviderBillingOverview();
  const createPlan = useCreateProviderPlan();
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    basePrice: '499',
    perStudent: '1',
    perTeacher: '2.5',
    storageLimitGb: '100',
    modules: 'Admin, Teacher, Parent, Student',
  });

  const stats = useMemo(() => {
    const plans = data?.plans ?? [];
    const activeTenants = plans.reduce((sum, plan) => sum + plan.activeTenantCount, 0);
    const totalMrr = plans.reduce((sum, plan) => sum + plan.mrr, 0);
    const avgBase = plans.length > 0 ? Math.round(plans.reduce((sum, plan) => sum + plan.basePrice, 0) / plans.length) : 0;
    return { plans, activeTenants, totalMrr, avgBase };
  }, [data]);

  async function handleCreatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = reasonPrompt('Create billing plan');
    if (!reason) return;

    try {
      await createPlan.mutateAsync({
        name: form.name,
        code: form.code,
        description: form.description,
        basePrice: Number(form.basePrice),
        perStudent: Number(form.perStudent),
        perTeacher: Number(form.perTeacher),
        storageLimitGb: Number(form.storageLimitGb),
        modules: form.modules.split(',').map((entry) => entry.trim()).filter(Boolean),
        reason,
      });
      notifySuccess('Plan created', `${form.name} is now available as a draft plan.`);
      setForm({
        name: '',
        code: '',
        description: '',
        basePrice: '499',
        perStudent: '1',
        perTeacher: '2.5',
        storageLimitGb: '100',
        modules: 'Admin, Teacher, Parent, Student',
      });
    } catch (error) {
      notifyError('Plan creation failed', error instanceof Error ? error.message : 'Unable to create plan.');
    }
  }

  return (
    <SectionShell>
      <SectionPageHeader
        icon={SlidersHorizontal}
        title="Plans"
        description="Provider-managed pricing tiers, packaging rules, and module entitlements."
        accent={accent}
      />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Plans" value={String(stats.plans.length)} sub="Catalog entries" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Active Tenants" value={String(stats.activeTenants)} sub="Currently assigned" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="MRR" value={formatCurrency(stats.totalMrr)} sub="From current mix" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Avg Base" value={formatCurrency(stats.avgBase)} sub="Across plans" gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.1fr_1.9fr]">
        <Panel title="Create Pricing Plan" subtitle="Draft a new billing tier with storage and seat economics." accentBorder="border-emerald-500/20">
          <form className="space-y-3" onSubmit={handleCreatePlan}>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                className={billingInputClass}
                placeholder="Plan name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
              <Input
                className={billingInputClass}
                placeholder="plan_code"
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              />
              <Input
                className={billingInputClass}
                placeholder="Base monthly price"
                value={form.basePrice}
                onChange={(event) => setForm((current) => ({ ...current, basePrice: event.target.value }))}
              />
              <Input
                className={billingInputClass}
                placeholder="Storage limit GB"
                value={form.storageLimitGb}
                onChange={(event) => setForm((current) => ({ ...current, storageLimitGb: event.target.value }))}
              />
              <Input
                className={billingInputClass}
                placeholder="Per student"
                value={form.perStudent}
                onChange={(event) => setForm((current) => ({ ...current, perStudent: event.target.value }))}
              />
              <Input
                className={billingInputClass}
                placeholder="Per teacher"
                value={form.perTeacher}
                onChange={(event) => setForm((current) => ({ ...current, perTeacher: event.target.value }))}
              />
            </div>
            <Input
              className={billingInputClass}
              placeholder="Modules, comma separated"
              value={form.modules}
              onChange={(event) => setForm((current) => ({ ...current, modules: event.target.value }))}
            />
            <Textarea
              className={billingInputClass}
              placeholder="Plan positioning and rollout notes"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
            <Button type="submit" className="h-9 bg-emerald-600 text-white hover:bg-emerald-700" disabled={createPlan.isPending}>
              {createPlan.isPending ? 'Creating…' : 'Create Draft Plan'}
            </Button>
          </form>
        </Panel>

        <Panel title="Plan Catalog" subtitle={isLoading ? 'Loading plans…' : `${stats.plans.length} plans in catalog`}>
          {isLoading ? (
            <BillingLoadingState />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {stats.plans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-slate-500/20 bg-slate-800/55 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-100">{plan.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{plan.description}</p>
                    </div>
                    <StatusBadge status={plan.status} />
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-emerald-300">{formatCurrency(plan.basePrice)}</p>
                      <p className="text-[11px] text-slate-400">Base monthly fee</p>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <p>{plan.subscriberCount} subscriptions</p>
                      <p>{formatCurrency(plan.mrr)} MRR</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-900/50 p-2 text-xs">
                      <p className="text-slate-400">Per Student</p>
                      <p className="font-semibold text-slate-100">{formatCurrency(plan.perStudent)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/50 p-2 text-xs">
                      <p className="text-slate-400">Per Teacher</p>
                      <p className="font-semibold text-slate-100">{formatCurrency(plan.perTeacher)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/50 p-2 text-xs">
                      <p className="text-slate-400">Storage</p>
                      <p className="font-semibold text-slate-100">{plan.storageLimitGb} GB</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {plan.modules.map((module) => (
                      <span key={module} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
                        {module}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-500/20 bg-slate-900/40 px-3 py-2 text-xs">
                    <span className="flex items-center gap-2 text-slate-300">
                      <Layers3 className="size-3.5 text-emerald-300" />
                      {plan.activeTenantCount} active tenants
                    </span>
                    <span className="text-slate-400">{plan.seats.toLocaleString()} seats modeled</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </SectionShell>
  );
}
