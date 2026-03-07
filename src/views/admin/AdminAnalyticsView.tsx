/* ─── AdminAnalyticsView ─── School admin analytics ─────────────── */
import { BarChart3, GraduationCap, BookOpen, Clock, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { StatCard } from '@/components/features/StatCard';
import { NeonBarChart } from '@/components/features/charts/BarChart';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { GlowPieChart } from '@/components/features/charts/PieChart';
import { useAnalyticsOverview } from '@/hooks/api';

const FALLBACK_ENROLLMENT = [
  { name: 'Aug', students: 480 },
  { name: 'Sep', students: 520 },
  { name: 'Oct', students: 535 },
  { name: 'Nov', students: 528 },
  { name: 'Dec', students: 540 },
  { name: 'Jan', students: 555 },
  { name: 'Feb', students: 562 },
  { name: 'Mar', students: 578 },
];

const FALLBACK_GRADES = [
  { name: 'A', value: 28, color: '#34d399' },
  { name: 'B', value: 35, color: '#818cf8' },
  { name: 'C', value: 22, color: '#fbbf24' },
  { name: 'D', value: 10, color: '#fb923c' },
  { name: 'F', value: 5, color: '#f87171' },
];

const FALLBACK_DEPTS = [
  { name: 'Math', avgGrade: 82, attendance: 94 },
  { name: 'Science', avgGrade: 85, attendance: 92 },
  { name: 'English', avgGrade: 78, attendance: 96 },
  { name: 'History', avgGrade: 80, attendance: 91 },
  { name: 'Arts', avgGrade: 90, attendance: 97 },
  { name: 'PE', avgGrade: 92, attendance: 88 },
];

const FALLBACK_ATTENDANCE = [
  { name: 'Sep', rate: 94 },
  { name: 'Oct', rate: 92 },
  { name: 'Nov', rate: 88 },
  { name: 'Dec', rate: 91 },
  { name: 'Jan', rate: 93 },
  { name: 'Feb', rate: 95 },
  { name: 'Mar', rate: 96 },
];

export default function AdminAnalyticsView() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const { data: apiAnalytics } = useAnalyticsOverview();

  const ENROLLMENT_TREND = apiAnalytics?.mrrData?.map(d => ({ name: d.month, students: d.mrr })) ?? FALLBACK_ENROLLMENT;
  const GRADE_DISTRIBUTION = FALLBACK_GRADES;
  const DEPT_PERFORMANCE = FALLBACK_DEPTS;
  const ATTENDANCE_TREND = FALLBACK_ATTENDANCE;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div data-animate className="flex items-center gap-2">
        <BarChart3 className="size-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white/90">School Analytics</h2>
        <Badge className="border-0 bg-indigo-400/10 text-indigo-400 text-[10px] ml-auto">2024–25 Academic Year</Badge>
      </div>

      <div data-animate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={578} trend="up" trendLabel="+22 this month" icon={<GraduationCap className="size-5" />} accentColor="#818cf8" sparklineData={ENROLLMENT_TREND.map(e => e.students)} />
        <StatCard label="Avg GPA" value={3.42} decimals={2} trend="up" trendLabel="+0.08" icon={<Award className="size-5" />} accentColor="#34d399" />
        <StatCard label="Attendance" value={96} suffix="%" trend="up" trendLabel="+1.5%" icon={<Clock className="size-5" />} accentColor="#fbbf24" sparklineData={ATTENDANCE_TREND.map(a => a.rate)} />
        <StatCard label="Course Completion" value={89} suffix="%" trend="up" trendLabel="+3% this semester" icon={<BookOpen className="size-5" />} accentColor="#f472b6" />
      </div>

      <div data-animate className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <NeonBarChart title="Department Performance" subtitle="Average grades & attendance by department" data={DEPT_PERFORMANCE.map(d => ({ name: d.name, primary: d.avgGrade, secondary: d.attendance }))} dataKey="primary" secondaryDataKey="secondary" xAxisKey="name" colors={['#818cf8']} secondaryColor="#34d399" height={280} />
        </div>
        <div className="lg:col-span-2">
          <GlowPieChart title="Grade Distribution" subtitle="School-wide letter grade breakdown" data={GRADE_DISTRIBUTION} height={280} />
        </div>
      </div>

      <div data-animate className="grid gap-4 lg:grid-cols-2">
        <GlowLineChart title="Enrollment Trend" subtitle="Monthly student count" data={ENROLLMENT_TREND} dataKey="students" xAxisKey="name" color="#818cf8" height={220} />
        <GlowLineChart title="Attendance Trend" subtitle="Monthly attendance rate" data={ATTENDANCE_TREND} dataKey="rate" xAxisKey="name" color="#34d399" height={220} />
      </div>
    </div>
  );
}
