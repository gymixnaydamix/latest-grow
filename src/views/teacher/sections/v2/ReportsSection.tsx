/* ─── Reports & Analytics Section ─────────────────────────────────
 * Routes: class_analytics (default) | student_progress | at_risk
 * ──────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  ChevronRight, Search,
  TrendingDown, TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useTeacherClassPerformance } from '@/hooks/api/use-teacher';
import { useNavigationStore } from '@/store/navigation.store';
import {
  TeacherSectionShell, GlassCard, MetricCard, StatusBadge, UrgentInline,
} from './shared';
import type { TeacherSectionProps } from './shared';
import {
  classPerformanceDemo as FALLBACK_classPerformanceDemo, teacherClassesDemo as FALLBACK_teacherClassesDemo,
  gradebookStudentsDemo as FALLBACK_gradebookStudentsDemo, type ClassPerformanceDemo,
} from './teacher-demo-data';

/* ── Grade letter helper ── */
function gradeColor(avg: number): string {
  if (avg >= 90) return 'text-emerald-400';
  if (avg >= 80) return 'text-sky-400';
  if (avg >= 70) return 'text-amber-400';
  return 'text-rose-400';
}

function letterGrade(avg: number): string {
  if (avg >= 93) return 'A';
  if (avg >= 90) return 'A-';
  if (avg >= 87) return 'B+';
  if (avg >= 83) return 'B';
  if (avg >= 80) return 'B-';
  if (avg >= 77) return 'C+';
  if (avg >= 73) return 'C';
  if (avg >= 70) return 'C-';
  if (avg >= 67) return 'D+';
  if (avg >= 63) return 'D';
  return 'F';
}

/* ── Bar chart (pure div) ── */
function BarChart({ value, max, accent }: { value: number; max: number; accent: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-3 flex-1 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: accent }} />
      </div>
      <span className="text-xs font-mono text-white/50 w-10 text-right">{value}%</span>
    </div>
  );
}

/* ── Student row for progress table ── */
interface StudentProgress {
  id: string;
  name: string;
  initials: string;
  average: number;
  letterGrade: string;
  trend: 'up' | 'down' | 'flat';
  attendanceRate: number;
  assignmentCompletion: number;
}

const studentProgressDemo: StudentProgress[] = FALLBACK_gradebookStudentsDemo.map(s => ({
  id: s.id,
  name: s.name,
  initials: s.initials,
  average: s.average,
  letterGrade: s.letterGrade,
  trend: s.trend,
  attendanceRate: 85 + Math.floor(Math.random() * 15),
  assignmentCompletion: s.scores.hw1 !== null ? 90 + Math.floor(Math.random() * 10) : 60 + Math.floor(Math.random() * 20),
}));

/* ── At-risk students with reasons ── */
interface AtRiskStudent {
  id: string;
  name: string;
  initials: string;
  className: string;
  reasons: string[];
  severity: 'high' | 'medium';
  actions: string[];
}

const atRiskStudentsDemo: AtRiskStudent[] = [
  {
    id: 'ar1', name: 'Jordan Kim', initials: 'JK', className: 'Pre-Algebra',
    reasons: ['3 missing assignments', 'Grade at D (61.7%)', 'Behavioral incident noted'],
    severity: 'high',
    actions: ['Parent conference scheduled Mar 6', 'Counselor referral submitted', 'Create assignment completion plan'],
  },
  {
    id: 'ar2', name: 'Maria Garcia', initials: 'MG', className: 'Geometry',
    reasons: ['Grade dropped 12% in 2 weeks (B+ → C)', 'Withdrawn in class', 'Not participating'],
    severity: 'high',
    actions: ['Private check-in with student', 'Coordinate with counselor', 'Monitor for 1 more week'],
  },
  {
    id: 'ar3', name: 'Tyler Brooks', initials: 'TB', className: 'Pre-Algebra',
    reasons: ['78% attendance rate', 'Frequently off-task on device', 'Below-average quiz scores'],
    severity: 'medium',
    actions: ['Contact parent about attendance', 'Assign front-row seating', 'Weekly check-ins'],
  },
  {
    id: 'ar4', name: 'Chen Wei', initials: 'CW', className: 'Physics Honors',
    reasons: ['Absent 3 times this week', 'Possible illness — confirmed flu'],
    severity: 'medium',
    actions: ['Make-up work packet prepared', 'Parent confirmed return Monday', 'Peer notes shared'],
  },
];

export function ReportsSection(_props: TeacherSectionProps) {
  const { activeHeader } = useNavigationStore();
  const header = activeHeader || 'class_analytics';

  const { data: apiClassPerformance } = useTeacherClassPerformance();
  const classes: ClassPerformanceDemo[] = (apiClassPerformance as unknown as ClassPerformanceDemo[]) ?? FALLBACK_classPerformanceDemo;
  const [search, setSearch] = useState('');

  const overallAvg = classes.reduce((sum, c) => sum + c.avgGrade, 0) / classes.length;
  const overallPassRate = classes.reduce((sum, c) => sum + c.passRate, 0) / classes.length;
  const atRiskCount = atRiskStudentsDemo.length;

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return studentProgressDemo;
    const q = search.toLowerCase();
    return studentProgressDemo.filter(s => s.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <TeacherSectionShell
      title="Reports & Analytics"
      description={`${classes.length} classes · ${overallAvg.toFixed(1)}% avg · ${atRiskCount} at-risk students`}
    >
      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-animate>
        <MetricCard label="Overall Average" value={`${overallAvg.toFixed(1)}%`} accent="#818cf8" />
        <MetricCard label="Pass Rate" value={`${overallPassRate.toFixed(0)}%`} accent="#34d399" trend="up" />
        <MetricCard label="At-Risk Students" value={atRiskCount} accent="#f87171" />
        <MetricCard label="Classes" value={classes.length} accent="#fbbf24" />
      </div>

      {/* ── CLASS ANALYTICS VIEW ── */}
      {header === 'class_analytics' && (
        <div className="space-y-4" data-animate>
          <div className="grid gap-4 lg:grid-cols-2">
            {classes.map(cls => {
              const tc = FALLBACK_teacherClassesDemo.find(t => t.id === cls.classId);
              const accent = tc?.color ?? '#818cf8';
              return (
                <GlassCard key={cls.classId}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full" style={{ backgroundColor: accent }} />
                      <h4 className="text-sm font-semibold text-white/80">{cls.className}</h4>
                    </div>
                    <span className={`text-lg font-bold ${gradeColor(cls.avgGrade)}`}>
                      {letterGrade(cls.avgGrade)}
                    </span>
                  </div>

                  {/* Bar charts using divs */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-white/40 mb-1">
                        <span>Average Grade</span>
                        <span className={gradeColor(cls.avgGrade)}>{cls.avgGrade}%</span>
                      </div>
                      <BarChart value={cls.avgGrade} max={100} accent={accent} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-white/40 mb-1">
                        <span>Pass Rate</span>
                        <span>{cls.passRate}%</span>
                      </div>
                      <BarChart value={cls.passRate} max={100} accent="#34d399" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-white/40 mb-1">
                        <span>Attendance</span>
                        <span>{cls.attendanceRate}%</span>
                      </div>
                      <BarChart value={cls.attendanceRate} max={100} accent="#818cf8" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-white/40 mb-1">
                        <span>Assignment Completion</span>
                        <span>{cls.assignmentCompletion}%</span>
                      </div>
                      <BarChart value={cls.assignmentCompletion} max={100} accent="#fbbf24" />
                    </div>
                  </div>

                  {/* Top / At-risk */}
                  <div className="mt-4 pt-3 border-t border-white/6 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-semibold text-emerald-400/60 uppercase tracking-wide mb-1">Top Students</p>
                      <div className="space-y-0.5">
                        {cls.topStudents.map(s => (
                          <p key={s} className="text-xs text-white/50">{s}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-rose-400/60 uppercase tracking-wide mb-1">At-Risk</p>
                      <div className="space-y-0.5">
                        {cls.atRiskStudents.length > 0 ? (
                          cls.atRiskStudents.map(s => (
                            <p key={s} className="text-xs text-rose-400/70">{s}</p>
                          ))
                        ) : (
                          <p className="text-xs text-white/25 italic">None</p>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STUDENT PROGRESS VIEW ── */}
      {header === 'student_progress' && (
        <div className="space-y-4" data-animate>
          {/* Search */}
          <GlassCard className="p-3!">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white/3 border-white/8 text-white/80 placeholder:text-white/25"
              />
            </div>
          </GlassCard>

          {/* Student Table */}
          <GlassCard className="p-0! overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/6 text-[10px] font-semibold text-white/30 uppercase tracking-wide">
              <div className="col-span-3">Student</div>
              <div className="col-span-2 text-center">Average</div>
              <div className="col-span-1 text-center">Grade</div>
              <div className="col-span-1 text-center">Trend</div>
              <div className="col-span-2 text-center">Attendance</div>
              <div className="col-span-3 text-center">Assignments</div>
            </div>

            {/* Rows */}
            {filteredStudents.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-white/25">No students match your search.</div>
            ) : (
              filteredStudents.map(student => (
                <div
                  key={student.id}
                  className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/4 items-center hover:bg-white/2 transition-colors"
                >
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <Avatar className="size-7 shrink-0 border border-white/10">
                      <AvatarFallback className="text-[9px] bg-white/5 text-white/50">{student.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white/70 truncate">{student.name}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-sm font-semibold ${gradeColor(student.average)}`}>{student.average.toFixed(1)}%</span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className={`text-sm font-bold ${gradeColor(student.average)}`}>{student.letterGrade}</span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {student.trend === 'up' && <TrendingUp className="size-4 text-emerald-400" />}
                    {student.trend === 'down' && <TrendingDown className="size-4 text-rose-400" />}
                    {student.trend === 'flat' && <span className="text-xs text-white/30">→</span>}
                  </div>
                  <div className="col-span-2">
                    <BarChart value={student.attendanceRate} max={100} accent="#818cf8" />
                  </div>
                  <div className="col-span-3">
                    <BarChart value={student.assignmentCompletion} max={100} accent="#34d399" />
                  </div>
                </div>
              ))
            )}
          </GlassCard>
        </div>
      )}

      {/* ── AT-RISK VIEW ── */}
      {header === 'at_risk' && (
        <div className="space-y-4" data-animate>
          {atRiskStudentsDemo.filter(s => s.severity === 'high').length > 0 && (
            <UrgentInline
              message={`${atRiskStudentsDemo.filter(s => s.severity === 'high').length} students require immediate attention`}
            />
          )}

          <div className="space-y-3">
            {atRiskStudentsDemo.map(student => (
              <GlassCard key={student.id} className={student.severity === 'high' ? 'border-rose-500/20! bg-rose-500/3!' : ''}>
                <div className="flex items-start gap-3">
                  <Avatar className={`size-10 border shrink-0 ${
                    student.severity === 'high' ? 'border-rose-500/30' : 'border-amber-500/30'
                  }`}>
                    <AvatarFallback className={`text-xs ${
                      student.severity === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {student.initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-white/80">{student.name}</span>
                      <Badge variant="outline" className="text-[9px] border-white/10 text-white/35">{student.className}</Badge>
                      <StatusBadge
                        status={student.severity === 'high' ? 'High Risk' : 'Monitor'}
                        tone={student.severity === 'high' ? 'bad' : 'warn'}
                      />
                    </div>

                    {/* Reasons */}
                    <div className="mb-3">
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wide mb-1">Risk Factors</p>
                      <div className="space-y-1">
                        {student.reasons.map((reason, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                            <div className={`size-1.5 rounded-full shrink-0 ${student.severity === 'high' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    <div>
                      <p className="text-[10px] font-semibold text-emerald-400/60 uppercase tracking-wide mb-1">Recommended Actions</p>
                      <div className="space-y-1">
                        {student.actions.map((action, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-emerald-400/60">
                            <ChevronRight className="size-3 shrink-0" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </TeacherSectionShell>
  );
}
