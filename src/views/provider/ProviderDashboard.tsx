import { Loader2 } from 'lucide-react';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderHome, useProviderPermissionContext } from '@/hooks/api/use-provider-console';
import {
  ProviderBillingSection,
  ProviderUsageSection,
  ProviderTemplatesSection,
  ProviderIntegrationsSection,
  ProviderSecuritySection,
  ProviderTeamSection,
  ProviderSettingsSection,
  ProviderHomeSection,
  ProviderTenantsSection,
  ProviderOnboardingSection,
  ProviderSupportSection,
  ProviderIncidentsSection,
  ProviderReleasesSection,
  ProviderDataOpsSection,
  ProviderAuditSection,
  ProviderAnalyticsSection,
  ProviderCommsSection,
  ProviderNotificationsSection,
  ProviderBrandingSection,
  ProviderApiMgmtSection,
  ProviderBackupSection,
} from './sections/console';
import { ProviderConciergeSection } from './concierge';
import { Panel } from './sections/console/shared';

/* ══════════════════════════════════════════════════════════════ */
/*  PROVIDER DASHBOARD — Slim Section Router                    */
/* ══════════════════════════════════════════════════════════════ */

const SECTION_COMPONENT: Record<string, React.ComponentType> = {
  provider_home:          ProviderHomeSection,
  provider_tenants:       ProviderTenantsSection,
  provider_onboarding:    ProviderOnboardingSection,
  provider_billing:       ProviderBillingSection,
  provider_usage:         ProviderUsageSection,
  provider_support:       ProviderSupportSection,
  provider_incidents:     ProviderIncidentsSection,
  provider_releases:      ProviderReleasesSection,
  provider_templates:     ProviderTemplatesSection,
  provider_integrations:  ProviderIntegrationsSection,
  provider_security:      ProviderSecuritySection,
  provider_data_ops:      ProviderDataOpsSection,
  provider_team:          ProviderTeamSection,
  provider_settings:      ProviderSettingsSection,
  provider_audit:         ProviderAuditSection,
  provider_analytics:     ProviderAnalyticsSection,
  provider_comms:         ProviderCommsSection,
  provider_notifications: ProviderNotificationsSection,
  provider_branding:      ProviderBrandingSection,
  provider_api_mgmt:      ProviderApiMgmtSection,
  provider_backup:        ProviderBackupSection,
  concierge_ai:           ProviderConciergeSection,
};

export function ProviderDashboard() {
  const { activeSection } = useNavigationStore();
  const homeQuery = useProviderHome();
  const permQuery = useProviderPermissionContext();

  const permissions = permQuery.data?.permissions ?? [];
  const canRead = permissions.includes('*') || permissions.includes('provider.home.read');

  if (homeQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-100">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading provider console…
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="h-full min-h-0 overflow-auto text-slate-100">
        <Panel title="Permission Denied" accentBorder="border-red-500/20">
          <p className="text-xs text-red-200">Provider read scope missing for this account.</p>
        </Panel>
      </div>
    );
  }

  const SectionComponent = SECTION_COMPONENT[activeSection] ?? ProviderHomeSection;

  return (
    <div className="h-full min-h-0 overflow-auto text-slate-100">
      <SectionComponent />
    </div>
  );
}
