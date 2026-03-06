import { Card, CardContent } from '@/components/ui/card';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { ManageStaffSection } from './school/ManageStaffSection';
import { ManageStudentsSection } from './school/ManageStudentsSection';
import { ManageParentsSection } from './school/ManageParentsSection';
import { DepartmentsSection } from './school/DepartmentsSection';
import { CurriculumSection } from './school/CurriculumSection';
import { GradebookSection } from './school/GradebookSection';
import { TuitionBillingSection } from './school/TuitionBillingSection';
import { ExpenseTrackingSection } from './school/ExpenseTrackingSection';
import { FinancialReportingSection } from './school/FinancialReportingSection';
import { RoomBookingSection } from './school/RoomBookingSection';
import { MaintenanceSection } from './school/MaintenanceSection';
import { BusRoutesSection } from './school/BusRoutesSection';
import { StudentTrackingSection } from './school/StudentTrackingSection';
import { CatalogSection } from './school/CatalogSection';
import { CheckInOutSection } from './school/CheckInOutSection';
import WhiteLabelingSectionView from '@/views/admin/WhiteLabelingSection';

function OnboardingSection() {
  return (
    <Card>
      <CardContent className="space-y-2 p-6">
        <h2 className="text-lg font-semibold">School Onboarding</h2>
        <p className="text-sm text-muted-foreground">Use the left sub-navigation to configure users, academics, finance, facilities, transportation, and library workflows.</p>
      </CardContent>
    </Card>
  );
}

export function AdminSchoolSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);

  const content = (() => {
    if (activeHeader === 'onboarding') return <OnboardingSection />;

    if (activeHeader === 'users') {
      if (activeSubNav === 'manage_parents') return <ManageParentsSection />;
      if (activeSubNav === 'manage_students') return <ManageStudentsSection />;
      return <ManageStaffSection />;
    }

    if (activeHeader === 'academics') {
      if (activeSubNav === 'curriculum') return <CurriculumSection />;
      if (activeSubNav === 'gradebook') return <GradebookSection />;
      return <DepartmentsSection />;
    }

    if (activeHeader === 'finance') {
      if (activeSubNav === 'expense_tracking') return <ExpenseTrackingSection />;
      if (activeSubNav === 'financial_reporting') return <FinancialReportingSection />;
      return <TuitionBillingSection />;
    }

    if (activeHeader === 'facilities') {
      if (activeSubNav === 'maintenance') return <MaintenanceSection />;
      return <RoomBookingSection />;
    }

    if (activeHeader === 'transportation') {
      if (activeSubNav === 'student_tracking') return <StudentTrackingSection />;
      return <BusRoutesSection />;
    }

    if (activeHeader === 'library') {
      if (activeSubNav === 'check_in_out') return <CheckInOutSection />;
      return <CatalogSection />;
    }

    if (activeHeader === 'white_labeling') return <WhiteLabelingSectionView />;

    return <OnboardingSection />;
  })();

  return (
    <div ref={containerRef} className="space-y-6">
      {content}
    </div>
  );
}
