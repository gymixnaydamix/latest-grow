/* ─── UserManagementSection ─── Thin router for user management views ─── */
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { AllUsersView } from './user-management/AllUsersView';
import { RolesView } from './user-management/RolesView';
import { BulkOpsView } from './user-management/BulkOpsView';

export function UserManagementSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);

  const view = (() => {
    switch (activeHeader) {
      case 'roles': return <RolesView subNav={activeSubNav} />;
      case 'bulk_ops': return <BulkOpsView subNav={activeSubNav} />;
      default: return <AllUsersView subNav={activeSubNav} />;
    }
  })();

  return <div ref={containerRef} className="h-full min-h-0 overflow-hidden">{view}</div>;
}
