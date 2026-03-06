/* --- TenantManagementSection --- Slim router to split view files --- */
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { TenantsView } from './TenantsView';
import { PlansView } from './PlansView';
import { InvoicesView } from './InvoicesView';
import { GatewaysView } from './GatewaysView';

/* -- Main Export -- */
export function TenantManagementSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);

  const view = (() => {
    switch (activeHeader) {
      case 'tenants': return <TenantsView subNav={activeSubNav} />;
      case 'platform_billing': return <PlatformBillingView subNav={activeSubNav} />;
      default: return <TenantsView subNav={activeSubNav} />;
    }
  })();

  return <div ref={containerRef} className="h-full min-h-0 overflow-hidden">{view}</div>;
}

/* -- PlatformBillingView -- Sub-routes to Plans / Invoices / Gateways -- */
function PlatformBillingView({ subNav }: { subNav: string }) {
  switch (subNav) {
    case 'plans': return <PlansView />;
    case 'invoices': return <InvoicesView />;
    case 'gateways': return <GatewaysView />;
    default: return <PlansView />;
  }
}
