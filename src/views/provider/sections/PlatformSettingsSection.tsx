/* --- PlatformSettingsSection --- Thin router to split section files */
import { useNavigationStore } from '@/store/navigation.store';
import { ConfigurationSection } from './settings/ConfigurationSection';
import { FeatureFlagsSection } from './settings/FeatureFlagsSection';
import { IntegrationsSection } from './settings/IntegrationsSection';
import { SecuritySection } from './settings/SecuritySection';
import { LegalSection } from './settings/LegalSection';

/* Main Export */
export function PlatformSettingsSection() {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'feature_flags':         return <FeatureFlagsSection />;
    case 'platform_integrations': return <IntegrationsSection />;
    case 'security_access':       return <SecuritySection />;
    case 'legal':                 return <LegalSection />;
    default:                      return <ConfigurationSection />;
  }
}

