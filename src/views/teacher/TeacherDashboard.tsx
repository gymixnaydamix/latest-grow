/* ─── TeacherDashboard ─── Premium Teaching Command Center (V2) ──────
 * 14-module teacher portal with action-first layout.
 * Routes via useNavigationStore activeSection → module component.
 * ──────────────────────────────────────────────────────────────────── */
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';

/* ── V2 Section modules ── */
import { TodaySection } from './sections/v2/TodaySection';
import { MyClassesSection } from './sections/v2/MyClassesSection';
import { AttendanceSection } from './sections/v2/AttendanceSection';
import { LessonsSection } from './sections/v2/LessonsSection';
import { AssignmentsSection } from './sections/v2/AssignmentsSection';
import { GradebookSection } from './sections/v2/GradebookSection';
import { ExamsSection } from './sections/v2/ExamsSection';
import { MessagesSection } from './sections/v2/MessagesSection';
import { AnnouncementsSection } from './sections/v2/AnnouncementsSection';
import { BehaviorSection } from './sections/v2/BehaviorSection';
import { MeetingsSection } from './sections/v2/MeetingsSection';
import { ReportsSection } from './sections/v2/ReportsSection';
import { ProfileSettingsSection } from './sections/v2/ProfileSettingsSection';
import { SupportSection } from './sections/v2/SupportSection';

export function TeacherDashboard() {
  const { activeSection } = useNavigationStore();
  const { schoolId, user } = useAuthStore();
  const containerRef = useStaggerAnimate([activeSection]);

  const sp = { schoolId: schoolId ?? null, teacherId: user?.id ?? null };

  const section = (() => {
    switch (activeSection) {
      case 'today':            return <TodaySection {...sp} />;
      case 'my_classes':       return <MyClassesSection {...sp} />;
      case 'attendance':       return <AttendanceSection {...sp} />;
      case 'lessons':          return <LessonsSection {...sp} />;
      case 'assignments':      return <AssignmentsSection {...sp} />;
      case 'gradebook':        return <GradebookSection {...sp} />;
      case 'exams':            return <ExamsSection {...sp} />;
      case 'messages':         return <MessagesSection {...sp} />;
      case 'announcements':    return <AnnouncementsSection {...sp} />;
      case 'behavior':         return <BehaviorSection {...sp} />;
      case 'meetings':         return <MeetingsSection {...sp} />;
      case 'reports':          return <ReportsSection {...sp} />;
      case 'profile_settings': return <ProfileSettingsSection {...sp} />;
      case 'support':          return <SupportSection {...sp} />;
      default:                 return <TodaySection {...sp} />;
    }
  })();

  return (
    <div ref={containerRef} className="space-y-6">
      {section}
    </div>
  );
}
