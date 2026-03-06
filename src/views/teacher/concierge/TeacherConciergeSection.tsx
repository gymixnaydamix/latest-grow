/* ══════════════════════════════════════════════════════════════════════
 * TEACHER CONCIERGE — Full classroom assistant
 * Headers: Assistant | Class Tasks | Attendance | Grading | Comms | Settings
 * ══════════════════════════════════════════════════════════════════════ */
import { useNavigationStore } from '@/store/navigation.store';
import { TeacherConciergeAssistant } from './TeacherConciergeAssistant';
import { TeacherConciergeClassTasks } from './TeacherConciergeClassTasks';
import { TeacherConciergeAttendance } from './TeacherConciergeAttendance';
import { TeacherConciergeGrading } from './TeacherConciergeGrading';
import { TeacherConciergeComms } from './TeacherConciergeComms';
import { TeacherConciergeSettings } from './TeacherConciergeSettings';

export function TeacherConciergeSection() {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'c_class_tasks': return <TeacherConciergeClassTasks />;
    case 'c_attendance': return <TeacherConciergeAttendance />;
    case 'c_grading': return <TeacherConciergeGrading />;
    case 'c_comms': return <TeacherConciergeComms />;
    case 'c_settings': return <TeacherConciergeSettings />;
    default: return <TeacherConciergeAssistant />;
  }
}
