/* ══════════════════════════════════════════════════════════════════════
 * PROVIDER CONCIERGE — Platform provider executive assistant
 * Headers: Assistant | Tenants | Operations | Development | Comms | Settings
 * ══════════════════════════════════════════════════════════════════════ */
import { useNavigationStore } from '@/store/navigation.store';
import { ProviderConciergeAssistant } from './ProviderConciergeAssistant';
import { ProviderConciergeTenants } from './ProviderConciergeTenants';
import { ProviderConciergeOps } from './ProviderConciergeOps';
import { ProviderConciergeDev } from './ProviderConciergeDev';
import { ProviderConciergeComms } from './ProviderConciergeComms';
import { ProviderConciergeSettings } from './ProviderConciergeSettings';

export function ProviderConciergeSection() {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'c_tenants': return <ProviderConciergeTenants />;
    case 'c_operations': return <ProviderConciergeOps />;
    case 'c_development': return <ProviderConciergeDev />;
    case 'c_comms': return <ProviderConciergeComms />;
    case 'c_settings': return <ProviderConciergeSettings />;
    default: return <ProviderConciergeAssistant />;
  }
}
