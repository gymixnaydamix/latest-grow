/* ─── TeacherDashboardAnalytics ─── Teacher performance analytics ── */
import { BarChart3, TrendingUp, Users, BookOpen, Clock, Award, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { StatCard } from '@/components/features/StatCard';
import { NeonBarChart } from '@/components/features/charts/BarChart';
import { GlowLineChart } from '@/components/features/charts/LineChart';

const WEEKLY_DATA = [
  { name: 'Mon', classes: 5, avgScore: 82 },
  { name: 'Tue', classes: 4, avgScore: 78 },
  { name: 'Wed', classes: 6, avgScore: 85 },
  { name: 'Thu', classes: 5, avgScore: 88 },
  { name: 'Fri', classes: 3, avgScore: 90 },
];

const MONTHLY_TREND = [
  { name: 'Sep', attendance: 94, grades: 78, engagement: 82 },
  { name: 'Oct', attendance: 92, grades: 80, engagement: 85 },
  { name: 'Nov', attendance: 88, grades: 82, engagement: 78 },
  { name: 'Dec', attendance: 91, grades: 85, engagement: 88 },
  { name: 'Jan', attendance: 93, grades: 83, engagement: 90 },
  { name: 'Feb', attendance: 95, grades: 87, engagement: 92 },
  { name: 'Mar', attendance: 96, grades: 89, engagement: 94 },
];

const TOP_STUDENTS = [
  { name: 'Emma Wilson', grade: 'A+', change: '+3%', trend: 'up' },
  { name: 'Liam Chen', grade: 'A', change: '+5%', trend: 'up' },
  { name: 'Sofia Martinez', grade: 'A', change: '+2%', trend: 'up' },
  { name: 'Noah Johnson', grade: 'A-', change: '-1%', trend: 'down' },
  { name: 'Ava Patel', grade: 'B+', change: '+8%', trend: 'up' },
];

const CLASS_PERFORMANCE = [
  { name: 'Math 101', students: 28, avgGrade: 85, attendance: 94 },
  { name: 'Math 201', students: 22, avgGrade: 78, attendance: 91 },
  { name: 'AP Calculus', students: 15, avgGrade: 82, attendance: 97 },
  { name: 'Statistics', students: 30, avgGrade: 76, attendance: 88 },
];

export default function TeacherDashboardAnalytics() {
  const containerRef = useStaggerAnimate([]);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Header */}
      <div data-animate className="flex items-center gap-2">
        <BarChart3 className="size-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white/90">Teaching Analytics</h2>
        <Badge className="border-0 bg-emerald-400/10 text-emerald-400 text-[10px] ml-2">This Semester</Badge>
      </div>

      {/* KPI Cards */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={95} icon={<Users className="size-5" />} trend="up" trendLabel="+12%" sparklineData={[80, 85, 88, 90, 92, 95]} />
        <StatCard label="Avg Grade" value={84.5} suffix="%" icon={<Award className="size-5" />} trend="up" trendLabel="+3.2%" sparklineData={[78, 80, 81, 83, 84, 84.5]} />
        <StatCard label="Attendance Rate" value={94.2} suffix="%" icon={<Target className="size-5" />} trend="up" trendLabel="+1.5%" sparklineData={[91, 92, 93, 94, 94, 94.2]} />
        <StatCard label="Classes This Week" value={23} icon={<BookOpen className="size-5" />} trend="up" trendLabel="+2%" sparklineData={[18, 20, 21, 22, 23, 23]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly schedule load */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><Clock className="size-4 text-indigo-400" />Weekly Teaching Load</CardTitle></CardHeader>
          <CardContent>
            <NeonBarChart data={WEEKLY_DATA} dataKey="classes" xAxisKey="name" height={220} colors={['#818cf8']} />
          </CardContent>
        </Card>

        {/* Monthly trends */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><TrendingUp className="size-4 text-emerald-400" />Semester Trends</CardTitle></CardHeader>
          <CardContent>
            <GlowLineChart
              data={MONTHLY_TREND}
              dataKey="attendance"
              xAxisKey="name"
              secondaryDataKey="grades"
              secondaryColor="#34d399"
              height={220}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Class performance */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><BookOpen className="size-4 text-violet-400" />Class Performance</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/6 text-white/40">
                  <th className="px-3 py-2 text-left font-medium">Class</th>
                  <th className="px-3 py-2 text-center font-medium">Students</th>
                  <th className="px-3 py-2 text-center font-medium">Avg Grade</th>
                  <th className="px-3 py-2 text-center font-medium">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {CLASS_PERFORMANCE.map((cls) => (
                  <tr key={cls.name} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <td className="px-3 py-2.5 text-white/70 font-medium">{cls.name}</td>
                    <td className="px-3 py-2.5 text-center text-white/50 tabular-nums">{cls.students}</td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge className={cn('border-0 text-[10px]', cls.avgGrade >= 80 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400')}>
                        {cls.avgGrade}%
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-center text-white/50 tabular-nums">{cls.attendance}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Top students */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><Award className="size-4 text-amber-400" />Top Performing Students</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {TOP_STUDENTS.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3 rounded-lg border border-white/4 bg-white/2 px-3 py-2">
                <span className="text-[10px] text-white/20 font-mono w-4">#{i + 1}</span>
                <div className="size-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {s.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/70 font-medium">{s.name}</p>
                </div>
                <Badge className="border-0 bg-emerald-400/10 text-emerald-400 text-[10px]">{s.grade}</Badge>
                <span className={cn('flex items-center gap-0.5 text-[10px]', s.trend === 'up' ? 'text-emerald-400' : 'text-red-400')}>
                  {s.trend === 'up' ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {s.change}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
