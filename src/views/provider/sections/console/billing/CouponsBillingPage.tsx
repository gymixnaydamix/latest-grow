import { type FormEvent, useMemo, useState } from 'react';
import { Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { notifyError, notifySuccess } from '@/lib/notify';
import {
  useCreateProviderCoupon,
  useProviderBillingOverview,
  useUpdateProviderCoupon,
} from '@/hooks/api/use-provider-console';
import { Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, getAccent, reasonPrompt } from '../shared';
import { BillingLoadingState, billingInputClass, formatCurrency, formatDate } from './shared';

export function CouponsBillingPage() {
  const accent = getAccent('provider_billing');
  const { data, isLoading } = useProviderBillingOverview();
  const createCoupon = useCreateProviderCoupon();
  const updateCoupon = useUpdateProviderCoupon();
  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'PERCENT' as 'PERCENT' | 'FLAT',
    discountValue: '10',
    maxUses: '50',
    expiresAt: '',
    planCodes: 'starter, growth',
  });

  const coupons = data?.coupons ?? [];
  const stats = useMemo(() => ({
    total: coupons.length,
    active: coupons.filter((coupon) => coupon.status === 'ACTIVE').length,
    redeemed: coupons.reduce((sum, coupon) => sum + coupon.uses, 0),
    protectedRevenue: coupons.reduce((sum, coupon) => sum + Number(coupon.revenueProtected ?? 0), 0),
  }), [coupons]);

  async function handleCreateCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reason = reasonPrompt('Create coupon');
    if (!reason) return;
    try {
      await createCoupon.mutateAsync({
        code: form.code,
        description: form.description,
        type: form.type,
        discountValue: Number(form.discountValue),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
        planCodes: form.planCodes.split(',').map((entry) => entry.trim()).filter(Boolean),
        reason,
      });
      notifySuccess('Coupon created', `${form.code.toUpperCase()} is now available.`);
      setForm({
        code: '',
        description: '',
        type: 'PERCENT',
        discountValue: '10',
        maxUses: '50',
        expiresAt: '',
        planCodes: 'starter, growth',
      });
    } catch (error) {
      notifyError('Coupon creation failed', error instanceof Error ? error.message : 'Unable to create coupon.');
    }
  }

  async function handleUpdateCoupon(couponId: string, status: 'ACTIVE' | 'DISABLED', label: string) {
    const reason = reasonPrompt(label);
    if (!reason) return;
    try {
      await updateCoupon.mutateAsync({ couponId, status, reason });
      notifySuccess('Coupon updated', `${label} completed successfully.`);
    } catch (error) {
      notifyError('Coupon update failed', error instanceof Error ? error.message : 'Unable to update coupon.');
    }
  }

  return (
    <SectionShell>
      <SectionPageHeader
        icon={Percent}
        title="Coupons"
        description="Promotional programs, retention offers, and campaign discount governance."
        accent={accent}
      />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Coupons" value={String(stats.total)} sub="Total promotions" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Active" value={String(stats.active)} sub="Currently redeemable" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Redeemed" value={String(stats.redeemed)} sub="Total uses" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Protected" value={formatCurrency(stats.protectedRevenue)} sub="Modeled discount impact" gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.05fr_1.95fr]">
        <Panel title="Launch Promotion" subtitle="Create a new campaign coupon for target plan cohorts." accentBorder="border-emerald-500/20">
          <form className="space-y-3" onSubmit={handleCreateCoupon}>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input className={billingInputClass} placeholder="Coupon code" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} />
              <Input className={billingInputClass} placeholder="Type: PERCENT or FLAT" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value === 'FLAT' ? 'FLAT' : 'PERCENT' }))} />
              <Input className={billingInputClass} placeholder="Discount value" value={form.discountValue} onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))} />
              <Input className={billingInputClass} placeholder="Max uses" value={form.maxUses} onChange={(event) => setForm((current) => ({ ...current, maxUses: event.target.value }))} />
            </div>
            <Input className={billingInputClass} placeholder="Expiration ISO date (optional)" value={form.expiresAt} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))} />
            <Input className={billingInputClass} placeholder="Applies to plan codes" value={form.planCodes} onChange={(event) => setForm((current) => ({ ...current, planCodes: event.target.value }))} />
            <Textarea className={billingInputClass} placeholder="Campaign description and operator notes" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <Button type="submit" className="h-9 bg-emerald-600 text-white hover:bg-emerald-700" disabled={createCoupon.isPending}>
              {createCoupon.isPending ? 'Creating…' : 'Create Coupon'}
            </Button>
          </form>
        </Panel>

        <Panel title="Coupon Portfolio" subtitle={isLoading ? 'Loading coupons…' : `${coupons.length} coupons available`}>
          {isLoading ? (
            <BillingLoadingState />
          ) : (
            <div className="space-y-2">
              {coupons.map((coupon) => (
                <div key={coupon.id} className={`rounded-xl border p-3 text-xs ${coupon.status === 'ACTIVE' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-500/20 bg-slate-800/45'}`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-900 px-2 py-1 font-mono text-[11px] font-bold text-emerald-300">{coupon.code}</span>
                        <StatusBadge status={coupon.status === 'DISABLED' ? 'CLOSED' : coupon.status} />
                      </div>
                      <p className="mt-2 text-slate-300">{coupon.description ?? 'Promotional offer'}</p>
                      <p className="mt-1 text-slate-400">
                        {coupon.discount} · {coupon.uses}/{coupon.maxUses ?? '∞'} uses · Expires {formatDate(coupon.expires)}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Plans: {(coupon.planCodes ?? []).join(', ') || 'all'} · Protected {formatCurrency(Number(coupon.revenueProtected ?? 0))}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {coupon.status === 'ACTIVE' ? (
                        <Button size="sm" className="h-7 bg-red-500/20 text-red-100 hover:bg-red-500/30" onClick={() => handleUpdateCoupon(coupon.id, 'DISABLED', `Disable coupon ${coupon.code}`)}>
                          Disable
                        </Button>
                      ) : coupon.status !== 'EXPIRED' ? (
                        <Button size="sm" className="h-7 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleUpdateCoupon(coupon.id, 'ACTIVE', `Activate coupon ${coupon.code}`)}>
                          Activate
                        </Button>
                      ) : null}
                    </div>
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
