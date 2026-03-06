/* --- TeacherSchoolSection --- Slim router for school sub-views -- */
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';

import { MyClassesView } from './school/MyClassesView';
import { LessonPlannerView } from './school/LessonPlannerView';
import { GradebookView } from './school/GradebookView';
import { AttendanceView } from './school/AttendanceView';
import { ResourceLibraryView } from './school/ResourceLibraryView';
import { StudentAnalyticsView } from './school/StudentAnalyticsView';
import { ParentCommsView } from './school/ParentCommsView';

export function TeacherSchoolSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const { schoolId, user } = useAuthStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);
  const teacherId = user?.id ?? null;

  const view = (() => {
    switch (activeHeader) {
      case 'my_classes': return <MyClassesView schoolId={schoolId} teacherId={teacherId} />;
      case 'lesson_planner': return <LessonPlannerView subNav={activeSubNav} />;
      case 'gradebook': return <GradebookView subNav={activeSubNav} schoolId={schoolId} teacherId={teacherId} />;
      case 'attendance': return <AttendanceView subNav={activeSubNav} schoolId={schoolId} teacherId={teacherId} />;
      case 'resource_library': return <ResourceLibraryView subNav={activeSubNav} />;
      case 'student_analytics': return <StudentAnalyticsView subNav={activeSubNav} />;
      case 'parent_comms': return <ParentCommsView subNav={activeSubNav} />;
      default: return <MyClassesView schoolId={schoolId} teacherId={teacherId} />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}
