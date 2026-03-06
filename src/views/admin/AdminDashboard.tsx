/* ─── AdminDashboard ─── School Management Operations Hub ────────────
 * Routes to 14 operational section modules via activeSection.
 * Each module handles its own header/subNav routing internally.
 * ──────────────────────────────────────────────────────────────────── */
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';

/* ── Section components ── */
import { ControlCenterSection } from './sections/ControlCenterSection';
import { AdmissionsSection } from './sections/AdmissionsSection';
import { StudentsSection } from './sections/StudentsSection';
import { AcademicsSection } from './sections/AcademicsSection';
import { AttendanceSection } from './sections/AttendanceSection';
import { ExamsSection } from './sections/ExamsSection';
import { FinanceSection } from './sections/FinanceSection';
import { StaffSection } from './sections/StaffSection';
import { AdminCommunicationSection } from './sections/AdminCommunicationSection';
import { TransportSection } from './sections/TransportSection';
import { FacilitiesSection } from './sections/FacilitiesSection';
import { ReportsSection } from './sections/ReportsSection';
import { AdminSettingsSection } from './sections/AdminSettingsSection';
import { AuditSection } from './sections/AuditSection';
import { AdminConciergeSection } from './concierge';

export function AdminDashboard() {
  const { activeSection } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeSection]);

  const content = (() => {
    switch (activeSection) {
      case 'admissions': return <AdmissionsSection />;
      case 'students': return <StudentsSection />;
      case 'academics': return <AcademicsSection />;
      case 'attendance': return <AttendanceSection />;
      case 'exams': return <ExamsSection />;
      case 'finance': return <FinanceSection />;
      case 'staff': return <StaffSection />;
      case 'communication': return <AdminCommunicationSection />;
      case 'transport': return <TransportSection />;
      case 'facilities': return <FacilitiesSection />;
      case 'reports': return <ReportsSection />;
      case 'settings': return <AdminSettingsSection />;
      case 'audit': return <AuditSection />;
      case 'concierge_ai': return <AdminConciergeSection />;
      default: return <ControlCenterSection />;
    }
  })();

  return (
    <div ref={containerRef} className="space-y-6">
      {content}
    </div>
  );
}
