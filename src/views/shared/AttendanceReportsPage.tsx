/* ─── AttendanceReportsPage ─── Luxury 2040 attendance analytics + heatmap + charts ─── */
import { useState, useMemo } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  BarChart3, TrendingUp, Users, CalendarDays, Download,
  CheckCircle2, XCircle, Clock, ShieldAlert, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { HeatMap } from '@/components/features/charts/HeatMap';
import { useCourses, useCourseAttendance, useCourseStudents } from '@/hooks/api';
import { useAuthStore } from '@/store/auth.store';

// ── Circular progress ring SVG ─────────────
function CircularProgress({ value, size = 100, stroke = 8, color = '#818cf8', label, sublabel }: {
  value: number; size?: number; stroke?: number; color?: string; label: string; sublabel?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, value / 100)));

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="text-center -mt-[calc(50%+0.75rem)] mb-6">
        <p className="text-2xl font-bold text-white/90">{Math.round(value)}%</p>
        {sublabel && <p className="text-[10px] text-white/35 mt-0.5">{sublabel}</p>}
      </div>
      <p className="text-xs text-white/50 font-medium">{label}</p>
    </div>
  );
}

export function AttendanceReportsPage() {
  const { schoolId } = useAuthStore();
  const { data: courses } = useCourses(schoolId);
  const [courseId, setCourseId] = useState('');
  const { data: attendance, isLoading } = useCourseAttendance(courseId || null);
  const { data: enrollments } = useCourseStudents(courseId || null);
  const containerRef = useStaggerAnimate<HTMLDivElement>([courseId, isLoading]);

  // ── Computed analytics ─────────────────
  const analytics = useMemo(() => {
    if (!attendance || attendance.length === 0) {
      return {
        total: 0, present: 0, absent: 0, late: 0, excused: 0,
        rate: 0, lateRate: 0,
        trend: [] as { name: string; rate: number; present: number }[],
        heatmapData: [] as { date: string; value: number }[],
        studentStats: [] as { id: string; name: string; present: number; absent: number; late: number; excused: number; total: number; rate: number }[],
        missedClasses: [] as { date: string; count: number }[],
      };
    }

    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const absent = attendance.filter(a => a.status === 'ABSENT').length;
    const late = attendance.filter(a => a.status === 'LATE').length;
    const excused = attendance.filter(a => a.status === 'EXCUSED').length;
    const rate = total > 0 ? ((present + late) / total) * 100 : 0;
    const lateRate = total > 0 ? (late / total) * 100 : 0;

    // Trend by date (last 30 unique dates)
    const byDate = new Map<string, { total: number; present: number }>();
    attendance.forEach(a => {
      const d = (a.date as string).slice(0, 10);
      const existing = byDate.get(d) ?? { total: 0, present: 0 };
      existing.total++;
      if (a.status === 'PRESENT' || a.status === 'LATE') existing.present++;
      byDate.set(d, existing);
    });
    const sortedDates = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-30);
    const trend = sortedDates.map(([d, v]) => ({
      name: new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rate: Math.round((v.present / v.total) * 100),
      present: v.present,
    }));

    // Heatmap data
    const heatmapData = sortedDates.map(([d, v]) => ({
      date: d,
      value: Math.round((v.present / v.total) * 100),
    }));

    // Per-student stats
    const studentMap = new Map<string, { name: string; present: number; absent: number; late: number; excused: number; total: number }>();
    attendance.forEach(a => {
      const key = a.studentId;
      const existing = studentMap.get(key) ?? { name: '', present: 0, absent: 0, late: 0, excused: 0, total: 0 };
      existing.total++;
      if (a.status === 'PRESENT') existing.present++;
      else if (a.status === 'ABSENT') existing.absent++;
      else if (a.status === 'LATE') existing.late++;
      else if (a.status === 'EXCUSED') existing.excused++;
      // Try to get name from enrollments
      const enrollment = enrollments?.find(e => (e.student?.id ?? e.studentId) === key);
      if (enrollment?.student) {
        existing.name = `${enrollment.student.firstName} ${enrollment.student.lastName}`;
      }
      studentMap.set(key, existing);
    });
    const studentStats = [...studentMap.entries()].map(([id, v]) => ({
      id,
      ...v,
      rate: Math.round(((v.present + v.late) / v.total) * 100),
    })).sort((a, b) => a.rate - b.rate);

    // Missed classes (dates with >50% absent)
    const missedClasses = sortedDates
      .filter(([, v]) => (1 - v.present / v.total) > 0.5)
      .map(([d, v]) => ({ date: d, count: v.total - v.present }));

    return { total, present, absent, late, excused, rate, lateRate, trend, heatmapData, studentStats, missedClasses };
  }, [attendance, enrollments]);

  // ── Export CSV ─────────────────
  const handleExport = () => {
    if (!attendance || attendance.length === 0) return;
    const headers = 'Date,Student ID,Status\n';
    const rows = attendance.map(a =>
      `${(a.date as string).slice(0, 10)},${a.studentId},${a.status}`,
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-report-${courseId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const courseName = courses?.find(c => c.id === courseId)?.name;

  return (
    <div ref={containerRef} className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3" data-animate>
        <div>
          <h1 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <BarChart3 className="size-5 text-violet-400" /> Attendance Reports
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Analytics and insights on attendance patterns</p>
        </div>
        <Button
          variant="outline"
          className="text-xs h-9 gap-1.5 border-white/8 bg-white/3 text-white/60 hover:text-white/80"
          disabled={!attendance || attendance.length === 0}
          onClick={handleExport}
        >
          <Download className="size-3.5" /> Export CSV
        </Button>
      </div>

      {/* ── Course selector ── */}
      <div className="flex items-center gap-3" data-animate>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="w-72 h-9 bg-white/3 border-white/8 text-white/70 text-xs">
            <SelectValue placeholder="Select a course to view reports..." />
          </SelectTrigger>
          <SelectContent>
            {(courses ?? []).map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {courseName && (
          <Badge variant="outline" className="bg-white/4 text-white/50 border-white/8 text-xs">
            {courseName}
          </Badge>
        )}
      </div>

      {/* ── No course ── */}
      {!courseId && (
        <div className="py-16 text-center" data-animate>
          <BarChart3 className="mx-auto size-10 text-white/15 mb-3" />
          <p className="text-sm text-white/40">Select a course to view reports</p>
        </div>
      )}

      {/* ── Loading ── */}
      {courseId && isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 bg-white/3 rounded-2xl" />
          ))}
        </div>
      )}

      {/* ── Reports ── */}
      {courseId && !isLoading && analytics.total > 0 && (
        <>
          {/* ── KPI Rings ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
            <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardContent className="p-5 flex flex-col items-center">
                <CircularProgress value={analytics.rate} color="#34d399" label="Attendance Rate" sublabel="Present + Late" />
              </CardContent>
            </Card>
            <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardContent className="p-5 flex flex-col items-center">
                <CircularProgress value={analytics.lateRate} color="#fbbf24" size={90} label="Late Rate" sublabel="Late arrivals" />
              </CardContent>
            </Card>
            <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardContent className="p-5 flex flex-col items-center">
                <CircularProgress value={100 - analytics.rate} color="#f87171" size={90} label="Absence Rate" sublabel="Absent + Excused" />
              </CardContent>
            </Card>
            <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white/80 flex items-center gap-1.5">
                  <Users className="size-4 text-indigo-400" /> Summary
                </h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 flex items-center gap-1"><CheckCircle2 className="size-3 text-emerald-400" /> Present</span>
                    <span className="text-white/70 font-medium">{analytics.present}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 flex items-center gap-1"><XCircle className="size-3 text-rose-400" /> Absent</span>
                    <span className="text-white/70 font-medium">{analytics.absent}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 flex items-center gap-1"><Clock className="size-3 text-amber-400" /> Late</span>
                    <span className="text-white/70 font-medium">{analytics.late}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 flex items-center gap-1"><ShieldAlert className="size-3 text-violet-400" /> Excused</span>
                    <span className="text-white/70 font-medium">{analytics.excused}</span>
                  </div>
                  <div className="border-t border-white/6 pt-1.5 flex justify-between text-xs">
                    <span className="text-white/30">Total records</span>
                    <span className="text-white/50">{analytics.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Trend chart + Heatmap ── */}
          <div className="grid gap-4 lg:grid-cols-2" data-animate>
            <GlowLineChart
              title="Attendance Trend"
              subtitle="Daily attendance rate over time"
              data={analytics.trend}
              dataKey="rate"
              xAxisKey="name"
              color="#818cf8"
              height={240}
            />
            <HeatMap
              title="Attendance Heatmap"
              subtitle="Daily pattern visualization"
              data={analytics.heatmapData}
              color="#34d399"
              weeks={15}
            />
          </div>

          {/* ── Missed classes ── */}
          {analytics.missedClasses.length > 0 && (
            <Card className="border-white/6 bg-white/3 backdrop-blur-xl" data-animate>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-white/80 flex items-center gap-1.5 mb-3">
                  <AlertTriangle className="size-4 text-amber-400" /> Low Attendance Days
                </h3>
                <div className="space-y-1.5">
                  {analytics.missedClasses.map(mc => (
                    <div key={mc.date} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/2 border border-white/4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-3.5 text-amber-400/70" />
                        <span className="text-xs text-white/60">
                          {new Date(mc.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-300 border-rose-400/20 text-[10px]">
                        {mc.count} absent
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Student comparison table ── */}
          <Card className="border-white/6 bg-white/3 backdrop-blur-xl" data-animate>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-1.5 mb-3">
                <TrendingUp className="size-4 text-indigo-400" /> Student Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/6">
                      <th className="text-left text-white/35 font-medium py-2 px-2">Student</th>
                      <th className="text-center text-white/35 font-medium py-2 px-2">Present</th>
                      <th className="text-center text-white/35 font-medium py-2 px-2">Absent</th>
                      <th className="text-center text-white/35 font-medium py-2 px-2">Late</th>
                      <th className="text-center text-white/35 font-medium py-2 px-2">Excused</th>
                      <th className="text-right text-white/35 font-medium py-2 px-2">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.studentStats.map(st => (
                      <tr key={st.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-indigo-500/15 flex items-center justify-center text-[10px] font-semibold text-indigo-300 shrink-0">
                              {st.name.split(' ').map(n => n.charAt(0)).join('') || '?'}
                            </div>
                            <span className="text-white/70 truncate max-w-32">{st.name || st.id.slice(0, 8)}</span>
                          </div>
                        </td>
                        <td className="text-center text-emerald-400/80 py-2">{st.present}</td>
                        <td className="text-center text-rose-400/80 py-2">{st.absent}</td>
                        <td className="text-center text-amber-400/80 py-2">{st.late}</td>
                        <td className="text-center text-violet-400/80 py-2">{st.excused}</td>
                        <td className="text-right py-2 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${st.rate}%`,
                                  background: st.rate >= 80 ? '#34d399' : st.rate >= 60 ? '#fbbf24' : '#f87171',
                                }}
                              />
                            </div>
                            <span className={`font-medium ${
                              st.rate >= 80 ? 'text-emerald-400' : st.rate >= 60 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {st.rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Empty state ── */}
      {courseId && !isLoading && analytics.total === 0 && (
        <div className="py-16 text-center" data-animate>
          <BarChart3 className="mx-auto size-10 text-white/15 mb-3" />
          <p className="text-sm text-white/40">No attendance data yet.</p>
          <p className="text-xs text-white/25 mt-1">Start recording attendance to see analytics.</p>
        </div>
      )}
    </div>
  );
}
