/* ─── SubjectsSection ─── Subject workspace ───────────────────────────
 * Subject list, detail pages with overview, lessons, assignments, grades,
 * attendance, tests per subject
 * ─────────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  BookOpen, ArrowLeft, User, Award, CalendarCheck, ClipboardList,
  ChevronRight, Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useStudentStore, type Subject } from '@/store/student-data.store';
import { EmptyState } from '@/components/features/EmptyState';

type SubjectTab = 'overview' | 'lessons' | 'assignments' | 'tests' | 'grades' | 'attendance' | 'updates';

export function SubjectsSection() {
  const store = useStudentStore();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SubjectTab>('overview');

  const selectedSubject = selectedSubjectId ? store.getSubject(selectedSubjectId) : null;

  if (selectedSubject) {
    return (
      <SubjectDetail
        subject={selectedSubject}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={() => { setSelectedSubjectId(null); setActiveTab('overview'); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white/90">My Subjects</h2>
        <p className="text-sm text-white/40">{store.subjects.length} enrolled subjects this semester</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {store.subjects.map(subj => {
          const teacher = store.getTeacher(subj.teacherId);
          const assignmentCount = store.assignments.filter(a => a.subjectId === subj.id && ['not_started', 'in_progress'].includes(a.status)).length;
          const avgGrade = getAvgGrade(store.grades.filter(g => g.subjectId === subj.id));

          return (
            <Card key={subj.id} className="border-white/8 bg-white/[0.02] hover:border-white/12 transition-all cursor-pointer group"
              onClick={() => setSelectedSubjectId(subj.id)}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${subj.color}15` }}>
                    <BookOpen className="size-5" style={{ color: subj.color }} />
                  </div>
                  <ChevronRight className="size-4 text-white/15 group-hover:text-white/40 transition-colors" />
                </div>
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-white/85">{subj.name}</h3>
                  <p className="text-[11px] text-white/40 mt-0.5">{subj.code} · {subj.credits} credits</p>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <User className="size-3 text-white/30" />
                  <span className="text-[11px] text-white/40">{teacher?.name}</span>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/35">Progress</span>
                    <span className="text-white/50">{subj.progress}%</span>
                  </div>
                  <Progress value={subj.progress} className="h-1.5" />
                </div>
                <Separator className="my-3 bg-white/6" />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/40">{assignmentCount} pending tasks</span>
                  {avgGrade !== null && (
                    <Badge variant="outline" className="text-[9px] border-white/10 text-white/50">{avgGrade}% avg</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ── Subject Detail ── */
function SubjectDetail({ subject, activeTab, onTabChange, onBack }: {
  subject: Subject;
  activeTab: SubjectTab;
  onTabChange: (tab: SubjectTab) => void;
  onBack: () => void;
}) {
  const store = useStudentStore();
  const teacher = store.getTeacher(subject.teacherId);
  const subGrades = useMemo(() => store.grades.filter(g => g.subjectId === subject.id), [store.grades, subject.id]);
  const subAssignments = useMemo(() => store.assignments.filter(a => a.subjectId === subject.id), [store.assignments, subject.id]);
  const subExams = useMemo(() => store.exams.filter(e => e.subjectId === subject.id), [store.exams, subject.id]);
  const subAttendance = useMemo(() => store.attendance.filter(a => a.subjectId === subject.id), [store.attendance, subject.id]);
  const subFeedback = useMemo(() => store.feedback.filter(f => f.subjectId === subject.id), [store.feedback, subject.id]);

  const tabs: { id: SubjectTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'tests', label: 'Tests' },
    { id: 'grades', label: 'Grades' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'updates', label: 'Updates' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={onBack} className="text-white/40">
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex size-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${subject.color}15` }}>
          <BookOpen className="size-5" style={{ color: subject.color }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white/90">{subject.name}</h2>
          <p className="text-[11px] text-white/40">{subject.code} · {teacher?.name} · {subject.room}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(t => (
          <Button key={t.id} size="sm" variant={activeTab === t.id ? 'default' : 'ghost'}
            onClick={() => onTabChange(t.id)} className={cn('text-xs flex-shrink-0', activeTab !== t.id && 'text-white/40')}>
            {t.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-white/8 bg-white/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white/80">Syllabus Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subject.syllabus.map((unit, i) => {
                  const isCurrent = unit === subject.currentUnit;
                  const isPast = i < subject.syllabus.indexOf(subject.currentUnit);
                  return (
                    <div key={unit} className="flex items-center gap-3">
                      <div className={cn(
                        'flex size-7 items-center justify-center rounded-full text-[10px] font-bold',
                        isPast ? 'bg-emerald-500/20 text-emerald-400' :
                        isCurrent ? 'bg-indigo-500/20 text-indigo-400' :
                        'bg-white/5 text-white/30',
                      )}>
                        {isPast ? '✓' : i + 1}
                      </div>
                      <span className={cn('text-sm', isCurrent ? 'text-white/85 font-medium' : isPast ? 'text-white/50' : 'text-white/30')}>
                        {unit}
                      </span>
                      {isCurrent && <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-[8px]">CURRENT</Badge>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[10px] text-white/35">
                  <span>Overall Progress</span>
                  <span>{subject.progress}%</span>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-white/8 bg-white/[0.02]">
              <CardContent className="pt-5">
                <div className="grid grid-cols-2 gap-4">
                  <QuickStat icon={<Award className="size-4" />} label="Average" value={getAvgGrade(subGrades) !== null ? `${getAvgGrade(subGrades)}%` : 'N/A'} color={subject.color} />
                  <QuickStat icon={<ClipboardList className="size-4" />} label="Pending" value={`${subAssignments.filter(a => ['not_started', 'in_progress'].includes(a.status)).length}`} color="#f97316" />
                  <QuickStat icon={<Target className="size-4" />} label="Exams" value={`${subExams.filter(e => e.status === 'upcoming').length}`} color="#f472b6" />
                  <QuickStat icon={<CalendarCheck className="size-4" />} label="Credits" value={`${subject.credits}`} color="#34d399" />
                </div>
              </CardContent>
            </Card>

            {subFeedback.length > 0 && (
              <Card className="border-white/8 bg-white/[0.02]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-white/60">Latest Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[12px] text-white/50 line-clamp-3">{subFeedback[0].message}</p>
                  <p className="text-[10px] text-white/30 mt-1">— {subFeedback[0].from}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'lessons' && (
        <Card className="border-white/8 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-base text-white/85">Lesson Resources</CardTitle>
            <CardDescription className="text-white/35">Materials and resources for {subject.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subject.syllabus.map((unit, i) => (
                <div key={unit} className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-white/50">{i + 1}</div>
                      <div>
                        <p className="text-sm font-medium text-white/75">{unit}</p>
                        <p className="text-[11px] text-white/35">{3 + i} resources available</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs text-white/40"
                      onClick={() => window.open(`#resource-${subject.id}-${i}`, '_self')}>View</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-3">
          {subAssignments.length === 0 ? (
            <EmptyState title="No assignments" description={`No assignments for ${subject.name} yet.`} />
          ) : subAssignments.map(a => (
            <Card key={a.id} className="border-white/8 bg-white/[0.02]">
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">{a.title}</p>
                  <p className="text-[11px] text-white/35">Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {a.maxScore} pts</p>
                </div>
                <StatusBadge status={a.status} />
                {a.score !== undefined && <span className="text-sm font-semibold text-white/70">{a.score}/{a.maxScore}</span>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="space-y-3">
          {subExams.length === 0 ? (
            <EmptyState title="No exams" description={`No exams scheduled for ${subject.name}.`} />
          ) : subExams.map(e => (
            <Card key={e.id} className="border-white/8 bg-white/[0.02]">
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <div className="flex flex-col items-center min-w-[50px]">
                  <span className="text-xs text-white/40">{new Date(e.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-xl font-bold text-white/80">{new Date(e.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80">{e.title}</p>
                  <p className="text-[11px] text-white/35">{e.startTime}–{e.endTime} · {e.venue}</p>
                </div>
                <StatusBadge status={e.status} />
                {e.score !== undefined && <span className="text-sm font-semibold text-white/70">{e.score}/{e.maxScore}</span>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="space-y-3">
          {subGrades.length === 0 ? (
            <EmptyState title="No grades yet" description={`Grades for ${subject.name} will appear here.`} />
          ) : subGrades.map(g => (
            <Card key={g.id} className="border-white/8 bg-white/[0.02]">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">{g.title}</p>
                    <p className="text-[11px] text-white/35 capitalize">{g.type} · {new Date(g.gradedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white/85">{g.score}/{g.maxScore}</span>
                    <span className="block text-[11px] text-white/40">{g.grade} · {g.percentage}%</span>
                  </div>
                </div>
                {g.feedback && <p className="text-[11px] text-white/40 mt-2 italic">"{g.feedback}"</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'attendance' && (
        <Card className="border-white/8 bg-white/[0.02]">
          <CardContent className="pt-5">
            {subAttendance.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-8">Subject-level attendance tracking coming soon.</p>
            ) : (
              <div className="space-y-2">
                {subAttendance.map(a => (
                  <div key={a.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-white/40 w-20">{new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <StatusBadge status={a.status} />
                    {a.remark && <span className="text-[10px] text-white/30">{a.remark}</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'updates' && (
        <div className="space-y-3">
          {subFeedback.length === 0 ? (
            <EmptyState title="No updates" description={`No recent updates for ${subject.name}.`} />
          ) : subFeedback.map(f => (
            <Card key={f.id} className="border-white/8 bg-white/[0.02]">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white/70">{f.from}</span>
                  <Badge variant="outline" className="text-[9px] capitalize border-white/10 text-white/40">{f.type}</Badge>
                </div>
                <p className="text-[12px] text-white/50">{f.message}</p>
                <p className="text-[10px] text-white/25 mt-1">{new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* Helpers */
function getAvgGrade(grades: { percentage: number }[]): number | null {
  if (grades.length === 0) return null;
  return Math.round(grades.reduce((s, g) => s + g.percentage, 0) / grades.length);
}

function QuickStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/6 bg-white/[0.02] p-3">
      <div className="flex size-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15`, color }}>{icon}</div>
      <div>
        <p className="text-sm font-bold text-white/80">{value}</p>
        <p className="text-[10px] text-white/35">{label}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    not_started: 'bg-white/5 text-white/40 border-white/10',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    submitted: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    under_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    graded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    returned: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    missing: 'bg-red-500/10 text-red-400 border-red-500/20',
    late: 'bg-red-500/10 text-red-400 border-red-500/20',
    upcoming: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    result_published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    present: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    absent: 'bg-red-500/10 text-red-400 border-red-500/20',
    excused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <Badge variant="outline" className={cn('text-[9px] capitalize', map[status] ?? map.not_started)}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
