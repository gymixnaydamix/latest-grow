/* ─── ProviderBillingSection ─── Split billing console pages ─── */
import { useNavigationStore } from '@/store/navigation.store';
import { PlansBillingPage } from './billing/PlansBillingPage';
import { SubscriptionsBillingPage } from './billing/SubscriptionsBillingPage';
import { InvoicesBillingPage } from './billing/InvoicesBillingPage';
import { DunningBillingPage } from './billing/DunningBillingPage';
import { ApprovalsBillingPage } from './billing/ApprovalsBillingPage';
import { RevenueBillingPage } from './billing/RevenueBillingPage';
import { PaymentsBillingPage } from './billing/PaymentsBillingPage';
import { CouponsBillingPage } from './billing/CouponsBillingPage';

export function ProviderBillingSection() {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'billing_plans':
      return <PlansBillingPage />;
    case 'billing_subscriptions':
      return <SubscriptionsBillingPage />;
    case 'billing_invoices':
      return <InvoicesBillingPage />;
    case 'billing_dunning':
      return <DunningBillingPage />;
    case 'billing_approvals':
      return <ApprovalsBillingPage />;
    case 'billing_revenue':
      return <RevenueBillingPage />;
    case 'billing_payments':
      return <PaymentsBillingPage />;
    case 'billing_coupons':
      return <CouponsBillingPage />;
    default:
      return <PlansBillingPage />;
  }
}
