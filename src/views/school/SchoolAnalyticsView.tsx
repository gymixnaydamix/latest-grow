/* ─── SchoolAnalyticsView ─── School leader analytics dashboard ──── */
import { BarChart3, TrendingUp, Users, GraduationCap, DollarSign, Target, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { StatCard } from '@/components/features/StatCard';
import { NeonBarChart } from '@/components/features/charts/BarChart';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { GlowPieChart } from '@/components/features/charts/PieChart';
import { useAuthStore } from '@/store/auth.store';
import { useSchoolAnalytics } from '@/hooks/api';

/* ── Type for backend response ── */
interface AnalyticsData {
  totalStudents: number;
  avgGpa: number;
  attendanceRate: number;
  courseCompletionRate: number;
  enrollmentTrend: { name: string; students: number }[];
  attendanceTrend: { name: string; rate: number }[];
  gradeDistribution: { name: string; value: number; color: string }[];
  departmentPerformance: { name: string; avgGrade: number; attendance: number }[];
}

export default function SchoolAnalyticsView() {
  const containerRef = useStaggerAnimate([]);
  const { schoolId } = useAuthStore();
  const { data: rawData, isLoading, isError, refetch } = useSchoolAnalytics(schoolId);

  const analytics = rawData as AnalyticsData | undefined;

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div ref={containerRef} className="flex flex-col gap-6">
        <div data-animate className="flex items-center gap-2">
          <BarChart3 className="size-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white/90">School Analytics</h2>
        </div>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex items-center gap-2 py-8 text-sm text-white/40">
            <Loader2 className="size-4 animate-spin" /> Loading analytics…
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Error ── */
  if (isError) {
    return (
      <div ref={containerRef} className="flex flex-col gap-6">
        <div data-animate className="flex items-center gap-2">
          <BarChart3 className="size-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white/90">School Analytics</h2>
        </div>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex items-center justify-between gap-2 py-8">
            <div className="flex items-center gap-2 text-sm text-rose-400"><AlertTriangle className="size-4" /> Failed to load analytics</div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Empty ── */
  if (!analytics) {
    return (
      <div ref={containerRef} className="flex flex-col gap-6">
        <div data-animate className="flex items-center gap-2">
          <BarChart3 className="size-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white/90">School Analytics</h2>
        </div>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="py-8 text-center text-sm text-white/30">
            No analytics data available yet. Enroll students and record grades to generate insights.
          </CardContent>
        </Card>
      </div>
    );
  }

  const enrollmentTrend = analytics.enrollmentTrend ?? [];
  const gradeDistribution = analytics.gradeDistribution ?? [];
  const deptPerformance = analytics.departmentPerformance ?? [];

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div data-animate className="flex items-center gap-2">
        <BarChart3 className="size-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white/90">School Analytics</h2>
        <Badge className="border-0 bg-emerald-400/10 text-emerald-400 text-[10px] ml-2">Live</Badge>
      </div>

      {/* KPI row */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={analytics.totalStudents} icon={<Users className="size-5" />} trend="up" trendLabel="" sparklineData={enrollmentTrend.map(e => e.students)} />
        <StatCard label="Avg GPA" value={analytics.avgGpa} icon={<GraduationCap className="size-5" />} trend="up" trendLabel="" sparklineData={[]} />
        <StatCard label="Attendance" value={analytics.attendanceRate} suffix="%" icon={<Target className="size-5" />} trend="up" trendLabel="" sparklineData={(analytics.attendanceTrend ?? []).map(a => a.rate)} />
        <StatCard label="Completion" value={analytics.courseCompletionRate} suffix="%" icon={<DollarSign className="size-5" />} trend="up" trendLabel="" sparklineData={[]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enrollment trend */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><TrendingUp className="size-4 text-emerald-400" />Enrollment Trend</CardTitle></CardHeader>
          <CardContent>
            {enrollmentTrend.length > 0
              ? <GlowLineChart data={enrollmentTrend} dataKey="students" xAxisKey="name" color="#818cf8" height={220} />
              : <p className="py-8 text-center text-white/30 text-xs">No enrollment data</p>
            }
          </CardContent>
        </Card>

        {/* Grade distribution */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><GraduationCap className="size-4 text-violet-400" />Grade Distribution</CardTitle></CardHeader>
          <CardContent>
            {gradeDistribution.length > 0
              ? <GlowPieChart data={gradeDistribution} height={220} />
              : <p className="py-8 text-center text-white/30 text-xs">No grade data</p>
            }
          </CardContent>
        </Card>
      </div>

      {/* Department performance */}
      {deptPerformance.length > 0 && (
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><BarChart3 className="size-4 text-indigo-400" />Department Performance</CardTitle></CardHeader>
          <CardContent>
            <NeonBarChart data={deptPerformance} dataKey="avgGrade" xAxisKey="name" height={220} colors={['#818cf8']} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
              {deptPerformance.map((d) => (
                <div key={d.name} className="rounded-lg border border-white/6 bg-white/2 p-3 text-center">
                  <p className="text-xs font-medium text-white/60">{d.name}</p>
                  <div className="flex justify-center gap-3 mt-1.5 text-[10px]">
                    <div><span className="text-white/30">Grade</span><p className="text-white/70 font-mono">{d.avgGrade}%</p></div>
                    <div><span className="text-white/30">Attend</span><p className="text-white/70 font-mono">{d.attendance}%</p></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent achievements — removed hardcoded, would come from a separate API */}
    </div>
  );
}
