/* ══════════════════════════════════════════════════════════════════════
 * PARENT CONCIERGE — Full family assistant
 * Headers: Assistant | Family Tasks | Payments | Forms & Approvals | Comms | Settings
 * ══════════════════════════════════════════════════════════════════════ */
import { useNavigationStore } from '@/store/navigation.store';
import { ParentConciergeAssistant } from './ParentConciergeAssistant';
import { ParentConciergeFamilyTasks } from './ParentConciergeFamilyTasks';
import { ParentConciergePayments } from './ParentConciergePayments';
import { ParentConciergeForms } from './ParentConciergeForms';
import { ParentConciergeComms } from './ParentConciergeComms';
import { ParentConciergeSettings } from './ParentConciergeSettings';

export function ParentConciergeSection() {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'c_family_tasks': return <ParentConciergeFamilyTasks />;
    case 'c_payments': return <ParentConciergePayments />;
    case 'c_forms': return <ParentConciergeForms />;
    case 'c_comms': return <ParentConciergeComms />;
    case 'c_settings': return <ParentConciergeSettings />;
    default: return <ParentConciergeAssistant />;
  }
}
