/* ─── SchoolDashboard ─── School Leader strategic overview ───────────
 * Holographic KPIs, enrollment trend, strategic goals, announcements,
 * calendar events, AI-powered tools grid.
 * Per SCHOOL.md
 * ──────────────────────────────────────────────────────────────────── */
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  GraduationCap, Users, BookOpen, CalendarDays,
  Megaphone, TrendingUp, ArrowUpRight,
  Sparkles, FileText, ChevronRight, Lightbulb,
  Globe, Activity,
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useDashboardKPIs, useAnnouncements, useEvents, useGoals,
} from '@/hooks/api';

/* ── Feature components ── */
import { StatCard } from '@/components/features/StatCard';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { GlowPieChart } from '@/components/features/charts/PieChart';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/features/EmptyState';

/* ── Section components ── */
import { LeaderSchoolSection } from './sections/LeaderSchoolSection';
import { ConciergeAISection } from '../shared/sections/ConciergeAISection';
import { AccountSection } from '../shared/sections/AccountSection';
import SchoolAnalyticsView from '@/views/school/SchoolAnalyticsView';

/* ── Static data ── */
const FALLBACK_ENROLLMENT_TREND = [
  { name: '2020', value: 380 },
  { name: '2021', value: 420 },
  { name: '2022', value: 465 },
  { name: '2023', value: 510 },
  { name: '2024', value: 550 },
];

const FALLBACK_GRADE_DIST = [
  { name: 'Elementary', value: 35, color: '#818cf8' },
  { name: 'Middle', value: 30, color: '#34d399' },
  { name: 'High', value: 25, color: '#fbbf24' },
  { name: 'Pre-K', value: 10, color: '#f472b6' },
];

const FALLBACK_AI_TOOLS = [
  { name: 'Policy Generator', desc: 'AI-draft school policies from topics', icon: FileText },
  { name: 'Community Sentiment', desc: 'Analyse survey feedback at scale', icon: Megaphone },
  { name: 'Equity Heatmaps', desc: 'Demographic & performance gaps', icon: Globe },
  { name: 'Scenario Planning', desc: 'Model strategic decision outcomes', icon: Lightbulb },
];

const FALLBACK_KPI_SPARKLINES = {
  students: [380, 400, 420, 440, 465, 510, 550],
  staff: [38, 40, 42, 44, 46, 47],
  courses: [22, 25, 28, 30, 32, 34],
  attendance: [88, 90, 91, 93, 94, 95.2],
};

export function SchoolDashboard() {
  const { activeHeader, activeSection } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader, activeSection]);
  const { schoolId } = useAuthStore();

  const { data: kpiData, isLoading: kpiLoading } = useDashboardKPIs(schoolId);
  const { data: announcementsData, isLoading: annLoading } = useAnnouncements(schoolId);
  const { data: eventsData, isLoading: eventsLoading } = useEvents(schoolId);
  const { data: goalsData, isLoading: goalsLoading } = useGoals(schoolId);

  const kpiArr = kpiData ?? [];
  const announcements = announcementsData ?? [];
  const upcomingEvents = eventsData ?? [];
  const strategicGoals = goalsData ?? [];

  const enrollmentTrend = FALLBACK_ENROLLMENT_TREND;
  const gradeDistribution = FALLBACK_GRADE_DIST;
  const aiTools = FALLBACK_AI_TOOLS;
  const kpiSparklines = FALLBACK_KPI_SPARKLINES;

  // Route to section components for non-dashboard sections
  const sectionContent = (() => {
    switch (activeSection) {
      case 'school': return <LeaderSchoolSection />;
      case 'concierge_ai': return <ConciergeAISection />;
      case 'setting': return <AccountSection />;
      default: return null;
    }
  })();

  if (sectionContent) {
    return <div ref={containerRef} className="space-y-6">{sectionContent}</div>;
  }

  // Dashboard header-level routing
  if (activeHeader === 'analytics') {
    return <div ref={containerRef} className="space-y-6"><SchoolAnalyticsView /></div>;
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ── Welcome Header ── */}
      <PageHeader
        title="School Leadership Hub 🏫"
        description={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        badge="Live"
        icon={<Activity className="size-5" />}
      />

      {/* ── Holographic KPI Cards ── */}
      <div data-animate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-white/6 bg-white/3 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-5">
                <Skeleton className="h-3 w-24 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              label={kpiArr[0]?.label ?? 'Total Students'}
              value={Number(kpiArr[0]?.value) || 550}
              trend="up"
              trendLabel="+40 this year"
              icon={<GraduationCap className="size-5" />}
              accentColor="#818cf8"
              sparklineData={kpiSparklines.students}
            />
            <StatCard
              label={kpiArr[1]?.label ?? 'Total Staff'}
              value={Number(kpiArr[1]?.value) || 47}
              trend="up"
              trendLabel="+3 this year"
              icon={<Users className="size-5" />}
              accentColor="#34d399"
              sparklineData={kpiSparklines.staff}
            />
            <StatCard
              label={kpiArr[2]?.label ?? 'Active Courses'}
              value={Number(kpiArr[2]?.value) || 34}
              trend="up"
              trendLabel="+2 new"
              icon={<BookOpen className="size-5" />}
              accentColor="#fbbf24"
              sparklineData={kpiSparklines.courses}
            />
            <StatCard
              label={kpiArr[3]?.label ?? 'Attendance Rate'}
              value={Number(kpiArr[3]?.value) || 95.2}
              suffix="%"
              decimals={1}
              trend="up"
              trendLabel="+1.2%"
              icon={<TrendingUp className="size-5" />}
              accentColor="#f472b6"
              sparklineData={kpiSparklines.attendance}
            />
          </>
        )}
      </div>

      {/* ── Enrollment Trend + Grade Distribution ── */}
      <div data-animate className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <GlowLineChart
            title="Enrollment Trend"
            subtitle="5-year student count"
            data={enrollmentTrend}
            dataKey="value"
            xAxisKey="name"
            color="#818cf8"
            height={260}
          />
        </div>
        <div className="lg:col-span-2">
          <GlowPieChart
            title="Student Distribution"
            subtitle="By school level"
            data={gradeDistribution}
            centerLabel="Total"
            centerValue="550"
          />
        </div>
      </div>

      {/* ── Strategic Goals + Announcements ── */}
      <div data-animate className="grid gap-4 lg:grid-cols-5">
        {/* Strategic Goals */}
        <Card className="lg:col-span-2 border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base text-white/85">Strategic Goals</CardTitle>
            <CardDescription className="text-white/35">Progress towards annual targets</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {goalsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="mt-1.5 h-2 w-full" />
                </div>
              ))
            ) : strategicGoals.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/30">No strategic goals set yet.</p>
            ) : (
              strategicGoals.map((g) => (
                <div key={g.id}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white/80">{g.title}</p>
                    <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">
                      {new Date(g.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-white/6 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500 transition-all"
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-white/40 font-mono w-8 text-right">{g.progress}%</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="lg:col-span-3 border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Megaphone className="size-4 text-indigo-400" />
              <CardTitle className="text-base text-white/85">Recent Announcements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {annLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/6 px-4 py-3">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))
            ) : announcements.length === 0 ? (
              <EmptyState title="No announcements" description="Create your first announcement to share with the school." icon={<Megaphone className="size-8" />} />
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="group/row flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 px-4 py-3 transition-all hover:bg-white/4 hover:border-white/12 cursor-pointer">
                  <span className="flex-1 text-sm font-medium text-white/80">{a.title}</span>
                  <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400">{a.audience?.[0] ?? 'General'}</Badge>
                  <span className="text-xs text-white/30">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Draft'}
                  </span>
                  <ArrowUpRight className="size-3.5 text-white/20 opacity-0 transition-opacity group-hover/row:opacity-100" />
                </div>
              ))
            )}
            <Button variant="ghost" size="sm" className="self-end text-xs text-white/40 hover:text-white/60">
              View All <ChevronRight className="ml-1 size-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Upcoming Events ── */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-amber-400" />
            <CardTitle className="text-base text-white/85">Upcoming Events</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/6 p-4">
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/30">No upcoming events.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {upcomingEvents.slice(0, 8).map((ev) => (
                <div
                  key={ev.id}
                  className="group rounded-xl border border-white/6 bg-white/2 p-4 transition-all hover:border-white/12 hover:bg-white/4 cursor-pointer"
                >
                  <p className="text-sm font-medium text-white/80">{ev.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">{ev.type}</Badge>
                    <span className="text-xs text-white/30">
                      {new Date(ev.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── AI-Powered Strategic Tools ── */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-indigo-400" />
            <CardTitle className="text-base text-white/85">AI-Powered Strategic Tools</CardTitle>
          </div>
          <CardDescription className="text-white/35">Intelligent tools for school leadership decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {aiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.name}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-white/6 bg-white/2 p-5 text-center transition-all hover:border-indigo-500/30 hover:bg-white/4 cursor-pointer"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 transition-transform group-hover:scale-110">
                    <Icon className="size-5" />
                  </div>
                  <p className="text-sm font-semibold text-white/80">{tool.name}</p>
                  <p className="text-xs text-white/35">{tool.desc}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
