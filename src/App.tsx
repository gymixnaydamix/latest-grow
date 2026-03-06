import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/layout/LoadingScreen';

/* ── Lazy-loaded layout (defers radix + icons + navigation from critical path) */
const AppLayout = lazy(() => import('./components/layout/AppLayout').then(m => ({ default: m.AppLayout })));
const AuthGuard = lazy(() => import('./components/guards/AuthGuard').then(m => ({ default: m.AuthGuard })));
const RoleGuard = lazy(() => import('./components/guards/RoleGuard').then(m => ({ default: m.RoleGuard })));

/* ── Lazy-loaded views (code-split per route) ──────────────────── */
const LoginPage = lazy(() => import('./views/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./views/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./views/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./views/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

const ProviderDashboard = lazy(() => import('./views/provider/ProviderDashboard').then(m => ({ default: m.ProviderDashboard })));
const AdminDashboard = lazy(() => import('./views/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const TeacherDashboard = lazy(() => import('./views/teacher/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const StudentDashboard = lazy(() => import('./views/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const ParentDashboard = lazy(() => import('./views/parent/ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const FinanceDashboard = lazy(() => import('./views/finance/FinanceDashboard').then(m => ({ default: m.FinanceDashboard })));
const MarketingDashboard = lazy(() => import('./views/marketing/MarketingDashboard').then(m => ({ default: m.MarketingDashboard })));
const SchoolDashboard = lazy(() => import('./views/school/SchoolDashboard').then(m => ({ default: m.SchoolDashboard })));

const AnnouncementsPage = lazy(() => import('./views/shared/AnnouncementsPage').then(m => ({ default: m.AnnouncementsPage })));
const MessagesPage = lazy(() => import('./views/shared/MessagesPage').then(m => ({ default: m.MessagesPage })));
const CoursesPage = lazy(() => import('./views/shared/CoursesPage').then(m => ({ default: m.CoursesPage })));
const CourseDetailPage = lazy(() => import('./views/shared/CourseDetailPage').then(m => ({ default: m.CourseDetailPage })));
const CourseFormPage = lazy(() => import('./views/shared/CourseFormPage').then(m => ({ default: m.CourseFormPage })));
const SettingsPage = lazy(() => import('./views/shared/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SchedulePage = lazy(() => import('./views/shared/SchedulePage').then(m => ({ default: m.SchedulePage })));
const AttendancePage = lazy(() => import('./views/shared/AttendancePage').then(m => ({ default: m.AttendancePage })));
const AttendanceReportsPage = lazy(() => import('./views/shared/AttendanceReportsPage').then(m => ({ default: m.AttendanceReportsPage })));
const NotificationsPage = lazy(() => import('./views/shared/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const NotFoundPage = lazy(() => import('./views/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ProfilePage = lazy(() => import('./views/shared/ProfilePage'));
const HelpPage = lazy(() => import('./views/shared/HelpPage'));
const GradesPage = lazy(() => import('./views/shared/GradesPage'));
const LibraryPage = lazy(() => import('./views/shared/LibraryPage'));
const CalendarPage = lazy(() => import('./views/shared/CalendarPage'));

/* ── Student sub-pages (split-view content) ──────────────────────── */
const GradebookPage = lazy(() => import('./views/student/pages/GradebookPage'));
const UpcomingPage = lazy(() => import('./views/student/pages/UpcomingPage'));
const AITutorPage = lazy(() => import('./views/student/pages/AITutorPage'));
const PlannerPage = lazy(() => import('./views/student/pages/PlannerPage'));
const VisualizerPage = lazy(() => import('./views/student/pages/VisualizerPage'));
const MyJourneyPage = lazy(() => import('./views/student/pages/MyJourneyPage'));
const LeaderboardPage = lazy(() => import('./views/student/pages/LeaderboardPage'));
const MySkillsPage = lazy(() => import('./views/student/pages/MySkillsPage'));
const ShowcasePage = lazy(() => import('./views/student/pages/ShowcasePage'));
const CareerCompassPage = lazy(() => import('./views/student/pages/CareerCompassPage'));

/* ── Student department request sub-pages ─────────────────────────── */
const DeptFinancePage = lazy(() => import('./views/student/pages/DeptFinancePage'));
const HumanResourcesPage = lazy(() => import('./views/student/pages/HumanResourcesPage'));
const DeptMarketingPage = lazy(() => import('./views/student/pages/DeptMarketingPage'));
const InquiriesPage = lazy(() => import('./views/student/pages/InquiriesPage'));

/* ── Student header-level overview pages ──────────────────────────── */
const CoursesOverviewPage = lazy(() => import('./views/student/pages/CoursesOverviewPage'));
const GradesOverviewPage = lazy(() => import('./views/student/pages/GradesOverviewPage'));
const AIStudyHubOverviewPage = lazy(() => import('./views/student/pages/AIStudyHubOverviewPage'));
const LearningPathOverviewPage = lazy(() => import('./views/student/pages/LearningPathOverviewPage'));
const PortfolioOverviewPage = lazy(() => import('./views/student/pages/PortfolioOverviewPage'));
const DeptRequestsOverviewPage = lazy(() => import('./views/student/pages/DeptRequestsOverviewPage'));

/* ── Student settings sub-pages ───────────────────────────────────── */
const ProfileSettingsPage = lazy(() => import('./views/student/pages/ProfileSettingsPage'));
const NotificationSettingsPage = lazy(() => import('./views/student/pages/NotificationSettingsPage'));
const BillingSettingsPage = lazy(() => import('./views/student/pages/BillingSettingsPage'));

/* ── Student wellness & tools sub-pages ──────────────────────────── */
const WellnessDashboardPage = lazy(() => import('./views/student/pages/WellnessDashboardPage'));
const ResourcesPage = lazy(() => import('./views/student/pages/ResourcesPage'));
const JournalPage = lazy(() => import('./views/student/pages/JournalPage'));
const GoalsPage = lazy(() => import('./views/student/pages/GoalsPage'));
const FocusTimerPage = lazy(() => import('./views/student/pages/FocusTimerPage'));
const MindMapperPage = lazy(() => import('./views/student/pages/MindMapperPage'));
const CitationGeneratorPage = lazy(() => import('./views/student/pages/CitationGeneratorPage'));
const DebateSimulatorPage = lazy(() => import('./views/student/pages/DebateSimulatorPage'));
const VirtualLabsPage = lazy(() => import('./views/student/pages/VirtualLabsPage'));
const ARLabPage = lazy(() => import('./views/student/pages/ARLabPage'));
const FinanceSimPage = lazy(() => import('./views/student/pages/FinanceSimPage'));

/* ── Student communication sub-pages ─────────────────────────────── */
const ComposePage = lazy(() => import('./views/student/pages/ComposePage'));
const InboxPage = lazy(() => import('./views/student/pages/InboxPage'));
const StarredPage = lazy(() => import('./views/student/pages/StarredPage'));
const GeneralCommunityPage = lazy(() => import('./views/student/pages/GeneralCommunityPage'));
const AnnouncementsCommunityPage = lazy(() => import('./views/student/pages/AnnouncementsCommunityPage'));
const EmailOverviewPage = lazy(() => import('./views/student/pages/EmailOverviewPage'));
const CommunityOverviewPage = lazy(() => import('./views/student/pages/CommunityOverviewPage'));

/* ── Student tools header-level overview pages ───────────────────── */
const ProductivityOverviewPage = lazy(() => import('./views/student/pages/ProductivityOverviewPage'));
const SkillLabsOverviewPage = lazy(() => import('./views/student/pages/SkillLabsOverviewPage'));

export default function App() {
  const user = useAuthStore((s) => s.user);

  function getDashboardRedirect() {
    if (!user) return '/login';
    const map: Record<string, string> = {
      PROVIDER: '/provider/home',
      ADMIN: '/admin',
      TEACHER: '/teacher',
      STUDENT: '/student',
      PARENT: '/parent/home/overview',
      FINANCE: '/finance',
      MARKETING: '/marketing',
      SCHOOL: '/school-leader',
    };
    return map[user.role] || '/login';
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen message="Loading dashboard…" />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected — inside AppLayout shell */}
          <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
            {/* Root redirect */}
            <Route index element={<Navigate to={getDashboardRedirect()} replace />} />

            {/* Provider */}
            <Route path="provider/*" element={<RoleGuard roles={['PROVIDER']}><ProviderDashboard /></RoleGuard>} />

            {/* Admin */}
            <Route path="admin" element={<RoleGuard roles={['ADMIN', 'PROVIDER']}><AdminDashboard /></RoleGuard>} />

            {/* Teacher */}
            <Route path="teacher" element={<RoleGuard roles={['TEACHER']}><TeacherDashboard /></RoleGuard>} />

            {/* Student */}
            <Route path="student" element={<RoleGuard roles={['STUDENT']}><StudentDashboard /></RoleGuard>} />
            <Route path="student/gradebook" element={<RoleGuard roles={['STUDENT']}><GradebookPage /></RoleGuard>} />
            <Route path="student/upcoming" element={<RoleGuard roles={['STUDENT']}><UpcomingPage /></RoleGuard>} />
            <Route path="student/ai-tutor" element={<RoleGuard roles={['STUDENT']}><AITutorPage /></RoleGuard>} />
            <Route path="student/planner" element={<RoleGuard roles={['STUDENT']}><PlannerPage /></RoleGuard>} />
            <Route path="student/visualizer" element={<RoleGuard roles={['STUDENT']}><VisualizerPage /></RoleGuard>} />
            <Route path="student/my-journey" element={<RoleGuard roles={['STUDENT']}><MyJourneyPage /></RoleGuard>} />
            <Route path="student/leaderboard" element={<RoleGuard roles={['STUDENT']}><LeaderboardPage /></RoleGuard>} />
            <Route path="student/my-skills" element={<RoleGuard roles={['STUDENT']}><MySkillsPage /></RoleGuard>} />
            <Route path="student/showcase" element={<RoleGuard roles={['STUDENT']}><ShowcasePage /></RoleGuard>} />
            <Route path="student/career-compass" element={<RoleGuard roles={['STUDENT']}><CareerCompassPage /></RoleGuard>} />
            <Route path="student/dept-finance" element={<RoleGuard roles={['STUDENT']}><DeptFinancePage /></RoleGuard>} />
            <Route path="student/human-resources" element={<RoleGuard roles={['STUDENT']}><HumanResourcesPage /></RoleGuard>} />
            <Route path="student/dept-marketing" element={<RoleGuard roles={['STUDENT']}><DeptMarketingPage /></RoleGuard>} />
            <Route path="student/inquiries" element={<RoleGuard roles={['STUDENT']}><InquiriesPage /></RoleGuard>} />
            <Route path="student/wellness-dashboard" element={<RoleGuard roles={['STUDENT']}><WellnessDashboardPage /></RoleGuard>} />
            <Route path="student/resources" element={<RoleGuard roles={['STUDENT']}><ResourcesPage /></RoleGuard>} />
            <Route path="student/journal" element={<RoleGuard roles={['STUDENT']}><JournalPage /></RoleGuard>} />
            <Route path="student/goals" element={<RoleGuard roles={['STUDENT']}><GoalsPage /></RoleGuard>} />
            <Route path="student/focus-timer" element={<RoleGuard roles={['STUDENT']}><FocusTimerPage /></RoleGuard>} />
            <Route path="student/mind-mapper" element={<RoleGuard roles={['STUDENT']}><MindMapperPage /></RoleGuard>} />
            <Route path="student/citation-generator" element={<RoleGuard roles={['STUDENT']}><CitationGeneratorPage /></RoleGuard>} />
            <Route path="student/debate-simulator" element={<RoleGuard roles={['STUDENT']}><DebateSimulatorPage /></RoleGuard>} />
            <Route path="student/virtual-labs" element={<RoleGuard roles={['STUDENT']}><VirtualLabsPage /></RoleGuard>} />
            <Route path="student/ar-lab" element={<RoleGuard roles={['STUDENT']}><ARLabPage /></RoleGuard>} />
            <Route path="student/finance-sim" element={<RoleGuard roles={['STUDENT']}><FinanceSimPage /></RoleGuard>} />
            <Route path="student/courses-overview" element={<RoleGuard roles={['STUDENT']}><CoursesOverviewPage /></RoleGuard>} />
            <Route path="student/grades-overview" element={<RoleGuard roles={['STUDENT']}><GradesOverviewPage /></RoleGuard>} />
            <Route path="student/ai-hub-overview" element={<RoleGuard roles={['STUDENT']}><AIStudyHubOverviewPage /></RoleGuard>} />
            <Route path="student/learning-path-overview" element={<RoleGuard roles={['STUDENT']}><LearningPathOverviewPage /></RoleGuard>} />
            <Route path="student/portfolio-overview" element={<RoleGuard roles={['STUDENT']}><PortfolioOverviewPage /></RoleGuard>} />
            <Route path="student/dept-requests-overview" element={<RoleGuard roles={['STUDENT']}><DeptRequestsOverviewPage /></RoleGuard>} />
            <Route path="student/profile-settings" element={<RoleGuard roles={['STUDENT']}><ProfileSettingsPage /></RoleGuard>} />
            <Route path="student/notification-settings" element={<RoleGuard roles={['STUDENT']}><NotificationSettingsPage /></RoleGuard>} />
            <Route path="student/billing-settings" element={<RoleGuard roles={['STUDENT']}><BillingSettingsPage /></RoleGuard>} />
            <Route path="student/compose" element={<RoleGuard roles={['STUDENT']}><ComposePage /></RoleGuard>} />
            <Route path="student/inbox" element={<RoleGuard roles={['STUDENT']}><InboxPage /></RoleGuard>} />
            <Route path="student/starred" element={<RoleGuard roles={['STUDENT']}><StarredPage /></RoleGuard>} />
            <Route path="student/general" element={<RoleGuard roles={['STUDENT']}><GeneralCommunityPage /></RoleGuard>} />
            <Route path="student/community-announcements" element={<RoleGuard roles={['STUDENT']}><AnnouncementsCommunityPage /></RoleGuard>} />
            <Route path="student/email-overview" element={<RoleGuard roles={['STUDENT']}><EmailOverviewPage /></RoleGuard>} />
            <Route path="student/community-overview" element={<RoleGuard roles={['STUDENT']}><CommunityOverviewPage /></RoleGuard>} />
            <Route path="student/productivity-overview" element={<RoleGuard roles={['STUDENT']}><ProductivityOverviewPage /></RoleGuard>} />
            <Route path="student/skill-labs-overview" element={<RoleGuard roles={['STUDENT']}><SkillLabsOverviewPage /></RoleGuard>} />

            {/* Parent */}
            <Route path="parent/*" element={<RoleGuard roles={['PARENT']}><ParentDashboard /></RoleGuard>} />

            {/* Finance */}
            <Route path="finance" element={<RoleGuard roles={['FINANCE', 'PROVIDER', 'ADMIN']}><FinanceDashboard /></RoleGuard>} />

            {/* Marketing */}
            <Route path="marketing" element={<RoleGuard roles={['MARKETING', 'PROVIDER', 'ADMIN']}><MarketingDashboard /></RoleGuard>} />

            {/* School Leader */}
            <Route path="school-leader" element={<RoleGuard roles={['SCHOOL', 'PROVIDER', 'ADMIN']}><SchoolDashboard /></RoleGuard>} />

            {/* Shared pages */}
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/new" element={<RoleGuard roles={['PROVIDER', 'ADMIN', 'TEACHER']}><CourseFormPage /></RoleGuard>} />
            <Route path="courses/:id/edit" element={<RoleGuard roles={['PROVIDER', 'ADMIN', 'TEACHER']}><CourseFormPage /></RoleGuard>} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="attendance/reports" element={<AttendanceReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="grades" element={<GradesPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
