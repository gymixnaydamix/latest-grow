/* ══════════════════════════════════════════════════════════════════════
 * STUDENT CONCIERGE — Full academic assistant
 * Headers: Assistant | Study Tasks | Assignments | Exams & Results | Comms | Settings
 * ══════════════════════════════════════════════════════════════════════ */
import { useNavigationStore } from '@/store/navigation.store';
import { StudentConciergeAssistant } from './StudentConciergeAssistant';
import { StudentConciergeStudyTasks } from './StudentConciergeStudyTasks';
import { StudentConciergeAssignments } from './StudentConciergeAssignments';
import { StudentConciergeExams } from './StudentConciergeExams';
import { StudentConciergeComms } from './StudentConciergeComms';
import { StudentConciergeSettings } from './StudentConciergeSettings';

export function StudentConciergeSection() {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'c_study_tasks': return <StudentConciergeStudyTasks />;
    case 'c_assignments': return <StudentConciergeAssignments />;
    case 'c_exams': return <StudentConciergeExams />;
    case 'c_comms': return <StudentConciergeComms />;
    case 'c_settings': return <StudentConciergeSettings />;
    default: return <StudentConciergeAssistant />;
  }
}
