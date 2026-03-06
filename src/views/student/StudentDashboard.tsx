/* ─── StudentDashboard ─── Full hierarchical section router ──────────
 * Routes activeSection → activeHeader → activeSubNav to all student views
 * Matches spec: Dashboard, Academics, Wellness, Tools, Communication,
 * Concierge AI, Setting — with headers and sub-nav pages.
 * ─────────────────────────────────────────────────────────────────────── */
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';

/* ── Dashboard (default) ── */
import { MyDaySection } from './sections/MyDaySection';

/* ── Academics section components ── */
import { StudentAcademicsSection } from './sections/StudentAcademicsSection';
import CoursesOverviewPage from './pages/CoursesOverviewPage';
import GradebookPage from './pages/GradebookPage';
import UpcomingPage from './pages/UpcomingPage';
import AIStudyHubOverviewPage from './pages/AIStudyHubOverviewPage';
import AITutorPage from './pages/AITutorPage';
import PlannerPage from './pages/PlannerPage';
import VisualizerPage from './pages/VisualizerPage';
import LearningPathOverviewPage from './pages/LearningPathOverviewPage';
import MyJourneyPage from './pages/MyJourneyPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PortfolioOverviewPage from './pages/PortfolioOverviewPage';
import MySkillsPage from './pages/MySkillsPage';
import ShowcasePage from './pages/ShowcasePage';
import CareerCompassPage from './pages/CareerCompassPage';
import DeptRequestsOverviewPage from './pages/DeptRequestsOverviewPage';
import DeptFinancePage from './pages/DeptFinancePage';
import HumanResourcesPage from './pages/HumanResourcesPage';
import DeptMarketingPage from './pages/DeptMarketingPage';
import InquiriesPage from './pages/InquiriesPage';

/* ── Wellness ── */
import WellnessDashboardPage from './pages/WellnessDashboardPage';
import ResourcesPage from './pages/ResourcesPage';
import JournalPage from './pages/JournalPage';
import GoalsPage from './pages/GoalsPage';

/* ── Tools ── */
import ProductivityOverviewPage from './pages/ProductivityOverviewPage';
import FocusTimerPage from './pages/FocusTimerPage';
import MindMapperPage from './pages/MindMapperPage';
import CitationGeneratorPage from './pages/CitationGeneratorPage';
import SkillLabsOverviewPage from './pages/SkillLabsOverviewPage';
import DebateSimulatorPage from './pages/DebateSimulatorPage';
import VirtualLabsPage from './pages/VirtualLabsPage';
import ARLabPage from './pages/ARLabPage';
import FinanceSimPage from './pages/FinanceSimPage';

/* ── Communication ── */
import EmailOverviewPage from './pages/EmailOverviewPage';
import InboxPage from './pages/InboxPage';
import StarredPage from './pages/StarredPage';
import ComposePage from './pages/ComposePage';
import CommunityOverviewPage from './pages/CommunityOverviewPage';
import GeneralCommunityPage from './pages/GeneralCommunityPage';
import AnnouncementsCommunityPage from './pages/AnnouncementsCommunityPage';

/* ── Concierge AI ── */
import { StudentConciergeSection } from './concierge';

/* ── Setting ── */
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import BillingSettingsPage from './pages/BillingSettingsPage';

/* ── Sub-nav route maps for each header ── */
const ACADEMIC_ROUTES: Record<string, Record<string, React.ReactNode>> = {
  courses:             { courses_overview: <CoursesOverviewPage />, _default: <CoursesOverviewPage /> },
  grades_assignments:  { gradebook: <GradebookPage />, upcoming: <UpcomingPage />, _default: <GradebookPage /> },
  ai_study_hub:        { ai_tutor: <AITutorPage />, planner: <PlannerPage />, visualizer: <VisualizerPage />, _default: <AIStudyHubOverviewPage /> },
  learning_path:       { my_journey: <MyJourneyPage />, leaderboards: <LeaderboardPage />, _default: <LearningPathOverviewPage /> },
  portfolio:           { my_skills: <MySkillsPage />, showcase: <ShowcasePage />, career_compass: <CareerCompassPage />, _default: <PortfolioOverviewPage /> },
  department_requests: { dept_finance: <DeptFinancePage />, dept_hr: <HumanResourcesPage />, dept_marketing: <DeptMarketingPage />, dept_inquiries: <InquiriesPage />, _default: <DeptRequestsOverviewPage /> },
};

const WELLNESS_ROUTES: Record<string, Record<string, React.ReactNode>> = {
  mind_body: { wellness_dashboard: <WellnessDashboardPage />, resources: <ResourcesPage />, journal: <JournalPage />, goals: <GoalsPage />, _default: <WellnessDashboardPage /> },
};

const TOOLS_ROUTES: Record<string, Record<string, React.ReactNode>> = {
  productivity: { focus_timer: <FocusTimerPage />, mind_mapper: <MindMapperPage />, citation_generator: <CitationGeneratorPage />, _default: <ProductivityOverviewPage /> },
  skill_labs:   { debate_simulator: <DebateSimulatorPage />, virtual_labs: <VirtualLabsPage />, ar_lab: <ARLabPage />, finance_sim: <FinanceSimPage />, _default: <SkillLabsOverviewPage /> },
};

const COMMUNICATION_ROUTES: Record<string, Record<string, React.ReactNode>> = {
  email:     { compose: <ComposePage />, inbox: <InboxPage />, starred: <StarredPage />, _default: <EmailOverviewPage /> },
  community: { general: <GeneralCommunityPage />, community_announcements: <AnnouncementsCommunityPage />, _default: <CommunityOverviewPage /> },
};

const SETTING_ROUTES: Record<string, Record<string, React.ReactNode>> = {
  account: { profile_settings: <ProfileSettingsPage />, notification_settings: <NotificationSettingsPage />, billing_settings: <BillingSettingsPage />, _default: <ProfileSettingsPage /> },
};

function resolveSubNav(routeMap: Record<string, Record<string, React.ReactNode>>, header: string | null, subNav: string | null, fallback: React.ReactNode): React.ReactNode {
  const h = header ?? Object.keys(routeMap)[0];
  const hRoutes = routeMap[h];
  if (!hRoutes) return fallback;
  if (subNav && hRoutes[subNav]) return hRoutes[subNav];
  return hRoutes._default ?? fallback;
}

export function StudentDashboard() {
  const { activeHeader, activeSection, activeSubNav } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader, activeSection, activeSubNav]);

  const content = (() => {
    switch (activeSection) {
      /* ── Academics ── */
      case 'school':
        return resolveSubNav(ACADEMIC_ROUTES, activeHeader, activeSubNav, <StudentAcademicsSection />);

      /* ── Wellness ── */
      case 'wellness':
        return resolveSubNav(WELLNESS_ROUTES, activeHeader, activeSubNav, <WellnessDashboardPage />);

      /* ── Tools ── */
      case 'tools':
        return resolveSubNav(TOOLS_ROUTES, activeHeader, activeSubNav, <ProductivityOverviewPage />);

      /* ── Communication ── */
      case 'communication':
        return resolveSubNav(COMMUNICATION_ROUTES, activeHeader, activeSubNav, <EmailOverviewPage />);

      /* ── Concierge AI ── */
      case 'concierge_ai':
        return <StudentConciergeSection />;

      /* ── Setting ── */
      case 'setting':
        return resolveSubNav(SETTING_ROUTES, activeHeader, activeSubNav, <ProfileSettingsPage />);

      /* ── Dashboard (default) ── */
      default:
        return <MyDaySection />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{content}</div>;
}
