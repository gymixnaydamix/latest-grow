import { isParentPortalV2EnabledByDefault } from '@/config/parentPortalFlags';
import { ParentPortalV2 } from './ParentPortalV2';
import { ParentDashboardLegacy } from './ParentDashboardLegacy';

export function ParentDashboard() {
  if (!isParentPortalV2EnabledByDefault()) {
    return <ParentDashboardLegacy />;
  }

  return <ParentPortalV2 />;
}
