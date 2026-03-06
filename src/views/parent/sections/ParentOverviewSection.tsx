/* ─── ParentOverviewSection ─── Dashboard overview ────────────────────
 * Child selector, KPI stat-cards, grade trend chart, quick actions,
 * upcoming events, recent messages, recent grades, daily digest.
 * Uses parent data store with API integration fallbacks.
 * ──────────────────────────────────────────────────────────────────── */
import { useMemo } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  GraduationCap, Clock, FileText, CreditCard,
  CalendarDays, Mail, ChevronRight,
  AlertTriangle, Activity, Star, TrendingUp,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigationStore } from '@/store/navigation.store';
import { useParentStore } from '@/store/parent-data.store';

/* ── Feature components ── */
import { StatCard } from '@/components/features/StatCard';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { PageHeader } from '@/components/layout/PageHeader';

export function ParentOverviewSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const store = useParentStore();
  const child = store.getChild(store.selectedChildId);
  const grades = store.childGrades(store.selectedChildId);
  const assignments = store.childAssignments(store.selectedChildId);
  const attendance = store.childAttendance(store.selectedChildId);
  const digest = store.digest.filter(d => d.childId === store.selectedChildId);

  /* ── Derived KPIs ── */
  const gradeAvg = useMemo(() => {
    if (!grades.length) return 0;
    return Math.round(grades.reduce((s, g) => s + g.currentGrade, 0) / grades.length);
  }, [grades]);

  const attendancePct = useMemo(() => {
    if (!attendance.length) return 100;
    const present = attendance.filter(a => a.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  }, [attendance]);

  const overdueCount = assignments.filter(a => a.status === 'missing' || a.status === 'late').length;
  const dueSoonCount = assignments.filter(a => a.status === 'upcoming').length;

  const gradeTrend = useMemo(() => {
    if (!grades.length) return [];
    const maxLen = Math.max(...grades.map(g => g.trend.length));
    return Array.from({ length: maxLen }, (_, i) => {
      const vals = grades.map(g => g.trend[i]).filter(Boolean);
      const avg = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0;
      return { name: `Week ${i + 1}`, value: avg };
    });
  }, [grades]);

  const recentGrades = useMemo(() => {
    return grades.slice(0, 5).flatMap(g =>
      g.recentWork.slice(0, 1).map(w => ({
        assignment: w.title,
        score: `${w.score}/${w.maxScore}`,
        course: g.subject,
        color: w.score / w.maxScore >= 0.85 ? 'text-emerald-400' : w.score / w.maxScore >= 0.7 ? 'text-blue-400' : 'text-amber-400',
      }))
    );
  }, [grades]);

  const childName = child ? `${child.firstName} ${child.lastName}` : 'Student';

  const digestIcons: Record<string, typeof Star> = {
    achievement: Star,
    alert: AlertTriangle,
    improvement: TrendingUp,
    attendance: Clock,
  };
  const digestColors: Record<string, string> = {
    achievement: 'text-amber-400',
    alert: 'text-red-400',
    improvement: 'text-emerald-400',
    attendance: 'text-blue-400',
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ── Welcome Header + Child Selector ── */}
      <div data-animate className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          title="Parent Portal"
          description={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          badge="Live"
          icon={<Activity className="size-5" />}
        />
        <div className="flex items-center gap-3">
          <Select value={store.selectedChildId} onValueChange={store.selectChild}>
            <SelectTrigger className="w-56 border-white/10 bg-white/5 text-white/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {store.children.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} — {c.grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        <StatCard
          label="Grade Average"
          value={gradeAvg}
          suffix={`%`}
          trend={gradeAvg >= 85 ? 'up' : 'neutral'}
          trendLabel="Overall"
          icon={<GraduationCap className="size-5" />}
          accentColor="#60a5fa"
          sparklineData={grades[0]?.trend ?? []}
        />
        <StatCard
          label="Attendance"
          value={attendancePct}
          suffix="%"
          trend={attendancePct >= 95 ? 'up' : 'neutral'}
          trendLabel={`${attendance.filter(a => a.status === 'absent').length} absences`}
          icon={<Clock className="size-5" />}
          accentColor="#34d399"
          sparklineData={[97, 96, 98, 95, 97, attendancePct, attendancePct]}
        />
        <StatCard
          label="Assignments"
          value={overdueCount > 0 ? overdueCount : 0}
          suffix={overdueCount > 0 ? ' overdue' : ' — All clear'}
          trend={overdueCount === 0 ? 'up' : 'down'}
          trendLabel={`${dueSoonCount} due this week`}
          icon={<FileText className="size-5" />}
          accentColor={overdueCount > 0 ? '#f87171' : '#34d399'}
          sparklineData={[3, 2, 1, 2, 1, overdueCount, overdueCount]}
        />
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
        {/* Quick Actions + Events + Digest */}
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
              {store.events.length === 0 ? (
                <p className="text-sm text-white/30">No upcoming events.</p>
              ) : (
                store.events.slice(0, 4).map((ev) => (
                  <div key={ev.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-3 transition-all hover:bg-white/4 hover:border-white/12">
                    <span className="flex-1 text-sm font-medium text-white/75">{ev.title}</span>
                    <Badge variant="outline" className={`text-[10px] ${ev.type === 'holiday' ? 'border-amber-500/30 text-amber-400' : 'border-white/10 text-white/40'}`}>
                      {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Daily Digest */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="size-4 text-amber-400" />
                <CardTitle className="text-base text-white/85">Daily Digest</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {digest.map((d, i) => {
                const DigestIcon = digestIcons[d.type] ?? Star;
                return (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/2 px-4 py-3">
                    <DigestIcon className={`mt-0.5 size-4 shrink-0 ${digestColors[d.type] ?? 'text-white/40'}`} />
                    <p className="text-sm text-white/70">{d.message}</p>
                  </div>
                );
              })}
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
              {store.messages.length === 0 ? (
                <p className="text-sm text-white/30">No messages yet.</p>
              ) : (
                store.messages.slice(0, 4).map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => store.markMessageRead(msg.id)}
                    className="flex flex-col gap-1 rounded-xl border border-white/6 bg-white/2 px-4 py-3 hover:bg-white/4 hover:border-white/12 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/80">
                        {msg.from}
                        {!msg.read && <span className="ml-2 inline-block size-2 rounded-full bg-blue-400" />}
                      </p>
                      <span className="text-[10px] text-white/30">{msg.date}</span>
                    </div>
                    <p className="text-sm text-white/60">{msg.subject}</p>
                    <p className="text-xs text-white/30 line-clamp-1">{msg.preview}</p>
                  </div>
                ))
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
