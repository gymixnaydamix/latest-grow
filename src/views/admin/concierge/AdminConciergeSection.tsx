/* ══════════════════════════════════════════════════════════════════════
 * ADMIN CONCIERGE — Full school admin executive assistant
 * Headers: Assistant | Tasks | Approvals | Documents | Comms | Settings
 * ══════════════════════════════════════════════════════════════════════ */
import { useNavigationStore } from '@/store/navigation.store';
import { AdminConciergeAssistant } from './AdminConciergeAssistant';
import { AdminConciergeTasks } from './AdminConciergeTasks';
import { AdminConciergeApprovals } from './AdminConciergeApprovals';
import { AdminConciergeDocuments } from './AdminConciergeDocuments';
import { AdminConciergeComms } from './AdminConciergeComms';
import { AdminConciergeSettings } from './AdminConciergeSettings';

export function AdminConciergeSection() {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'c_tasks': return <AdminConciergeTasks />;
    case 'c_approvals': return <AdminConciergeApprovals />;
    case 'c_documents': return <AdminConciergeDocuments />;
    case 'c_comms': return <AdminConciergeComms />;
    case 'c_settings': return <AdminConciergeSettings />;
    default: return <AdminConciergeAssistant />;
  }
}
