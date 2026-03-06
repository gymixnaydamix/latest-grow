/* ─── ParentDashboard ─── Holographic Parent portal ──────────────────
 * Student selector, KPI stat-cards with sparklines, Quick actions,
 * Upcoming events, Recent messages, Recent grades, grade-trend chart.
 * Per parent_dashboard.md §3.4.1
 * ──────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  GraduationCap, Clock, FileText, CreditCard,
  CalendarDays, Mail, ChevronRight,
  AlertTriangle, Activity,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useEvents, useMessageThreads, useParentDashboard, useChildProgress } from '@/hooks/api';
import type { SchoolEvent, MessageThread } from '@root/types';

/* ── Feature components ── */
import { StatCard } from '@/components/features/StatCard';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { PageHeader } from '@/components/layout/PageHeader';

/* ── Section components ── */
import { ParentMyChildrenSection } from './sections/ParentMyChildrenSection';
import { ParentCommunicationSection } from './sections/ParentCommunicationSection';
import { ConciergeAISection } from '@/views/shared/sections/ConciergeAISection';
import { AccountSection } from '@/views/shared/sections/AccountSection';

/* ── Grade helpers ── */
function gradeLabel(pct: number): string {
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  return 'D';
}
function gradeColor(pct: number): string {
  if (pct >= 85) return 'text-emerald-400';
  if (pct >= 70) return 'text-blue-400';
  return 'text-amber-400';
}

/* ── Fallback demo data (used when API returns empty) ── */
const fallbackChildren = [
  { id: '1', name: 'Jane Miller', grade: '10th Grade' },
  { id: '2', name: 'Tom Miller', grade: '7th Grade' },
];

const fallbackGradeTrend = [
  { name: 'Week 1', value: 84 }, { name: 'Week 2', value: 86 },
  { name: 'Week 3', value: 85 }, { name: 'Week 4', value: 88 },
  { name: 'Week 5', value: 90 }, { name: 'Week 6', value: 89 },
  { name: 'Week 7', value: 91 }, { name: 'Week 8', value: 88 },
];

/* ── Helpers ── */
function formatEventDate(startDate: string, endDate?: string): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (endDate && endDate !== startDate) return `${fmt(startDate)}–${fmt(endDate)}`;
  return fmt(startDate);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function ParentDashboardLegacy() {
  const { activeHeader, activeSection } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader, activeSection]);

  // ── API data ──
  const schoolId = useAuthStore((s) => s.schoolId);
  const { data: eventsData, isLoading: eventsLoading } = useEvents(schoolId);
  const { data: threadsData, isLoading: threadsLoading } = useMessageThreads(schoolId);
  const { data: dashboardData, isLoading: dashLoading } = useParentDashboard();

  // Derive children list from real API, fallback to demo data
  const apiChildren = useMemo(() => {
    const d = dashboardData as Record<string, unknown> | null | undefined;
    if (d && Array.isArray(d.children) && d.children.length > 0) {
      return (d.children as { id: string; firstName: string; lastName: string; gradeLevel?: string }[]).map(c => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        grade: c.gradeLevel ?? '',
      }));
    }
    return fallbackChildren;
  }, [dashboardData]);

  const [selectedChild, setSelectedChild] = useState(apiChildren[0]?.id ?? '1');

  // Fetch child-specific progress from real API
  const { data: progressRaw, isLoading: progressLoading } = useChildProgress(selectedChild);
  const progress = progressRaw as Record<string, unknown> | null | undefined;

  // Derive stats from API or fallback
  const childKpi = useMemo(() => {
    if (progress) {
      const gpa = Number(progress.gradeAverage ?? progress.gpa ?? 88);
      return {
        gpa,
        gpaLabel: gradeLabel(gpa),
        attendance: String(progress.attendanceSummary ?? `${Number(progress.absences ?? 1)} Absences`),
        absences: Number(progress.absences ?? 1),
        overdue: Number(progress.overdueAssignments ?? progress.overdue ?? 0),
        dueSoon: Number(progress.upcomingAssignments ?? progress.dueSoon ?? 3),
        sparkGpa: (Array.isArray(progress.gradeHistory) ? progress.gradeHistory : [82, 84, 85, 87, 86, gpa, gpa]) as number[],
        sparkAttendance: (Array.isArray(progress.attendanceHistory) ? progress.attendanceHistory : [97, 96, 98, 95, 97, 96, 97]) as number[],
      };
    }
    return {
      gpa: 88, gpaLabel: 'A-', attendance: '1 Absence, 0 Tardy',
      absences: 1, overdue: 0, dueSoon: 3,
      sparkGpa: [82, 84, 85, 87, 86, 88, 88],
      sparkAttendance: [97, 96, 98, 95, 97, 96, 97],
    };
  }, [progress]);

  // Derive recent grades from API
  const recentGrades = useMemo(() => {
    if (progress && Array.isArray(progress.recentGrades)) {
      return (progress.recentGrades as { assignment?: string; title?: string; score?: number; percentage?: number; course?: string }[]).map(g => {
        const pct = g.score ?? g.percentage ?? 0;
        return {
          assignment: g.assignment ?? g.title ?? 'Assignment',
          score: `${pct}% (${gradeLabel(pct)})`,
          course: g.course ?? '',
          color: gradeColor(pct),
        };
      });
    }
    return [
      { assignment: 'History Essay — WWII Causes', score: '92% (A-)', course: 'History 202', color: 'text-emerald-400' },
      { assignment: 'Math Quiz Ch. 5', score: '85% (B+)', course: 'Math 101', color: 'text-blue-400' },
      { assignment: 'Biology Lab Report', score: '95% (A)', course: 'Biology', color: 'text-emerald-400' },
      { assignment: 'English Vocab Test', score: '78% (C+)', course: 'English Lit', color: 'text-amber-400' },
    ];
  }, [progress]);

  // Derive grade trend from API
  const gradeTrend = useMemo(() => {
    if (progress && Array.isArray(progress.gradeTrend)) {
      return (progress.gradeTrend as { name?: string; week?: string; value: number }[]).map((p, i) => ({
        name: p.name ?? p.week ?? `Week ${i + 1}`,
        value: p.value,
      }));
    }
    return fallbackGradeTrend;
  }, [progress]);

  const events: SchoolEvent[] = (eventsData ?? []).slice(0, 5);
  const threads: MessageThread[] = (threadsData ?? []).slice(0, 5);

  // Route to section components for non-dashboard sections
  const sectionContent = (() => {
    switch (activeSection) {
      case 'school': return <ParentMyChildrenSection />;
      case 'communication': return <ParentCommunicationSection />;
      case 'concierge_ai': return <ConciergeAISection />;
      case 'setting': return <AccountSection />;
      default: return null;
    }
  })();

  if (sectionContent) {
    return <div ref={containerRef} className="space-y-6">{sectionContent}</div>;
  }

  const isLoading = dashLoading || progressLoading;
  const childName = apiChildren.find((c) => c.id === selectedChild)?.name ?? 'Student';

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ── Welcome Header + Child Selector ── */}
      <div data-animate className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          title="Parent Portal 👨‍👩‍👧‍👦"
          description={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          badge="Live"
          icon={<Activity className="size-5" />}
        />
        <div className="flex items-center gap-3">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-56 border-white/10 bg-white/5 text-white/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {apiChildren.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} — {c.grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Holographic KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-white/6 bg-white/3 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-5"><Skeleton className="h-3 w-24 mb-3" /><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-20" /></CardContent>
            </Card>
          ))
        ) : (
          <>
        <StatCard
          label="Grade Average"
          value={childKpi.gpa}
          suffix={`% (${childKpi.gpaLabel})`}
          trend={childKpi.gpa >= 85 ? 'up' : 'neutral'}
          trendLabel="Overall"
          icon={<GraduationCap className="size-5" />}
          accentColor="#60a5fa"
          sparklineData={childKpi.sparkGpa}
        />
        <StatCard
          label="Attendance"
          value={childKpi.sparkAttendance[childKpi.sparkAttendance.length - 1]}
          suffix="%"
          trend={childKpi.absences === 0 ? 'up' : 'neutral'}
          trendLabel={childKpi.attendance}
          icon={<Clock className="size-5" />}
          accentColor="#34d399"
          sparklineData={childKpi.sparkAttendance}
        />
        <StatCard
          label="Assignments"
          value={childKpi.overdue > 0 ? childKpi.overdue : 0}
          suffix={childKpi.overdue > 0 ? ' overdue' : ' — All clear'}
          trend={childKpi.overdue === 0 ? 'up' : 'down'}
          trendLabel={`${childKpi.dueSoon} due this week`}
          icon={<FileText className="size-5" />}
          accentColor={childKpi.overdue > 0 ? '#f87171' : '#34d399'}
          sparklineData={[3, 2, 1, 2, 1, childKpi.overdue, childKpi.overdue]}
        />
          </>
        )}
      </div>

      {/* ── Grade Trend Chart ── */}
      <div data-animate>
        <GlowLineChart
          title="Grade Trend"
          subtitle={`${childName}'s weekly average`}
          data={gradeTrend}
          dataKey="value"
          xAxisKey="name"
          color="#818cf8"
          height={220}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Quick Actions + Events */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base text-white/85">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[
                { label: 'Pay Tuition Bill', icon: CreditCard, color: 'text-indigo-400' },
                { label: 'Report an Absence', icon: AlertTriangle, color: 'text-amber-400' },
                { label: 'Message Teachers', icon: Mail, color: 'text-blue-400' },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Button key={a.label} variant="outline" className="w-full justify-start gap-2 text-sm border-white/6 bg-white/2 text-white/70 hover:bg-white/5 hover:border-white/12">
                    <Icon className={`size-4 ${a.color}`} />
                    {a.label}
                    <ChevronRight className="ml-auto size-3 opacity-40" />
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-indigo-400" />
                <CardTitle className="text-base text-white/85">Upcoming Events</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {eventsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))
              ) : events.length === 0 ? (
                <p className="text-sm text-white/30">No upcoming events.</p>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-3 transition-all hover:bg-white/4 hover:border-white/12">
                    <span className="flex-1 text-sm font-medium text-white/75">{ev.title}</span>
                    <Badge variant="outline" className={`text-[10px] ${ev.type === 'HOLIDAY' ? 'border-amber-500/30 text-amber-400' : 'border-white/10 text-white/40'}`}>
                      {formatEventDate(ev.startDate, ev.endDate)}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Messages + Grades */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-indigo-400" />
                <CardTitle className="text-base text-white/85">Recent Messages</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {threadsLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))
              ) : threads.length === 0 ? (
                <p className="text-sm text-white/30">No messages yet.</p>
              ) : (
                threads.map((thread) => {
                  const lastMsg = thread.messages?.at(-1);
                  const senderName = lastMsg?.sender
                    ? `${lastMsg.sender.firstName} ${lastMsg.sender.lastName}`
                    : 'Unknown';
                  return (
                    <div key={thread.id} className="flex flex-col gap-1 rounded-xl border border-white/6 bg-white/2 px-4 py-3 hover:bg-white/4 hover:border-white/12 cursor-pointer transition-all">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white/80">{senderName}</p>
                        <span className="text-[10px] text-white/30">
                          {timeAgo(thread.lastMessageAt ?? thread.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-white/60">{thread.subject}</p>
                      {lastMsg && (
                        <p className="text-xs text-white/30 line-clamp-1">{lastMsg.body}</p>
                      )}
                    </div>
                  );
                })
              )}
              <Button variant="ghost" size="sm" className="self-end text-xs text-white/40 hover:text-white/70">
                View All Messages <ChevronRight className="ml-1 size-3" />
              </Button>
            </CardContent>
          </Card>

          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-indigo-400" />
                <CardTitle className="text-base text-white/85">Recent Grades</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {recentGrades.map((g, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-3 transition-all hover:bg-white/4 hover:border-white/12">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/75">{g.assignment}</p>
                      <p className="text-xs text-white/35">{g.course}</p>
                    </div>
                    <Badge variant="outline" className={`text-sm font-semibold border-white/10 ${g.color}`}>{g.score}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
