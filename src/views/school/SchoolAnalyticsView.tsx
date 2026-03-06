/* ─── SchoolAnalyticsView ─── School leader analytics dashboard ──── */
import { BarChart3, TrendingUp, Users, GraduationCap, DollarSign, Award, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { StatCard } from '@/components/features/StatCard';
import { NeonBarChart } from '@/components/features/charts/BarChart';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { GlowPieChart } from '@/components/features/charts/PieChart';

const ENROLLMENT_TREND = [
  { name: 'Aug', students: 480 },
  { name: 'Sep', students: 520 },
  { name: 'Oct', students: 535 },
  { name: 'Nov', students: 528 },
  { name: 'Dec', students: 540 },
  { name: 'Jan', students: 555 },
  { name: 'Feb', students: 562 },
  { name: 'Mar', students: 570 },
];

const GRADE_DISTRIBUTION = [
  { name: 'A', value: 28, color: '#34d399' },
  { name: 'B', value: 35, color: '#818cf8' },
  { name: 'C', value: 22, color: '#fbbf24' },
  { name: 'D', value: 10, color: '#fb923c' },
  { name: 'F', value: 5, color: '#f87171' },
];

const DEPT_PERFORMANCE = [
  { name: 'Math', avgGrade: 82, attendance: 94, satisfaction: 88 },
  { name: 'Science', avgGrade: 85, attendance: 92, satisfaction: 91 },
  { name: 'English', avgGrade: 78, attendance: 96, satisfaction: 85 },
  { name: 'History', avgGrade: 80, attendance: 91, satisfaction: 83 },
  { name: 'Arts', avgGrade: 90, attendance: 97, satisfaction: 95 },
  { name: 'PE', avgGrade: 92, attendance: 88, satisfaction: 94 },
];

const RECENT_ACHIEVEMENTS = [
  { title: 'Regional Science Fair — 1st Place', date: '2025-03-12', student: 'Emma Chen, Grade 10' },
  { title: 'State Debate Championship Qualifier', date: '2025-03-08', student: 'Debate Team' },
  { title: 'Perfect Attendance Award', date: '2025-03-01', student: '23 students' },
  { title: 'Math Olympiad Top 10', date: '2025-02-28', student: 'Alex Park, Grade 11' },
];

export default function SchoolAnalyticsView() {
  const containerRef = useStaggerAnimate([]);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div data-animate className="flex items-center gap-2">
        <BarChart3 className="size-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white/90">School Analytics</h2>
        <Badge className="border-0 bg-emerald-400/10 text-emerald-400 text-[10px] ml-2">2024-25</Badge>
      </div>

      {/* KPI row */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={570} icon={<Users className="size-5" />} trend="up" trendLabel="+5.2%" sparklineData={[480, 520, 535, 540, 555, 570]} />
        <StatCard label="Avg GPA" value={3.42} icon={<GraduationCap className="size-5" />} trend="up" trendLabel="+0.15%" sparklineData={[3.2, 3.25, 3.3, 3.35, 3.4, 3.42]} />
        <StatCard label="Attendance" value={93.2} suffix="%" icon={<Target className="size-5" />} trend="up" trendLabel="+1.1%" sparklineData={[90, 91, 92, 92, 93, 93.2]} />
        <StatCard label="Budget Used" value={72} suffix="%" icon={<DollarSign className="size-5" />} trend="up" trendLabel="+4%" sparklineData={[45, 52, 58, 63, 68, 72]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enrollment trend */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><TrendingUp className="size-4 text-emerald-400" />Enrollment Trend</CardTitle></CardHeader>
          <CardContent>
            <GlowLineChart data={ENROLLMENT_TREND} dataKey="students" xAxisKey="name" color="#818cf8" height={220} />
          </CardContent>
        </Card>

        {/* Grade distribution */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><GraduationCap className="size-4 text-violet-400" />Grade Distribution</CardTitle></CardHeader>
          <CardContent>
            <GlowPieChart data={GRADE_DISTRIBUTION} height={220} />
          </CardContent>
        </Card>
      </div>

      {/* Department performance */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><BarChart3 className="size-4 text-indigo-400" />Department Performance</CardTitle></CardHeader>
        <CardContent>
          <NeonBarChart data={DEPT_PERFORMANCE} dataKey="avgGrade" xAxisKey="name" height={220} colors={['#818cf8']} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {DEPT_PERFORMANCE.map((d) => (
              <div key={d.name} className="rounded-lg border border-white/6 bg-white/2 p-3 text-center">
                <p className="text-xs font-medium text-white/60">{d.name}</p>
                <div className="flex justify-center gap-3 mt-1.5 text-[10px]">
                  <div><span className="text-white/30">Grade</span><p className="text-white/70 font-mono">{d.avgGrade}%</p></div>
                  <div><span className="text-white/30">Attend</span><p className="text-white/70 font-mono">{d.attendance}%</p></div>
                  <div><span className="text-white/30">Satis</span><p className="text-white/70 font-mono">{d.satisfaction}%</p></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent achievements */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><Award className="size-4 text-amber-400" />Recent Achievements</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {RECENT_ACHIEVEMENTS.map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-white/4 bg-white/2 px-3 py-2">
              <Award className="size-4 text-amber-400 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-white/70">{a.title}</p>
                <p className="text-[10px] text-white/30">{a.student}</p>
              </div>
              <span className="text-[10px] text-white/25 flex items-center gap-1"><Calendar className="size-2.5" />{new Date(a.date).toLocaleDateString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
