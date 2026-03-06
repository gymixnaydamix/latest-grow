/* ─── AssignmentsSection ─── Real assignment center ───────────────────
 * All, due soon, completed, missing, by subject, calendar views
 * File upload, status tracking, feedback, resubmission
 * ─────────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  FileText, Search, Upload, ChevronRight, Paperclip, RotateCcw,
  ArrowLeft, Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useStudentStore, type StudentAssignment } from '@/store/student-data.store';
import { EmptyState } from '@/components/features/EmptyState';

type ViewFilter = 'all' | 'due_soon' | 'completed' | 'missing' | 'by_subject';

export function AssignmentsSection() {
  const store = useStudentStore();
  const [filter, setFilter] = useState<ViewFilter>('all');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedAssignment = selectedId ? store.assignments.find(a => a.id === selectedId) : null;

  const filtered = useMemo(() => {
    let list = store.assignments;

    // Text search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || store.getSubject(a.subjectId)?.name.toLowerCase().includes(q));
    }

    // Subject filter
    if (subjectFilter) {
      list = list.filter(a => a.subjectId === subjectFilter);
    }

    // View filter
    switch (filter) {
      case 'due_soon': {
        const limit = new Date();
        limit.setDate(limit.getDate() + 3);
        list = list.filter(a => ['not_started', 'in_progress'].includes(a.status) && new Date(a.dueDate) <= limit);
        break;
      }
      case 'completed':
        list = list.filter(a => ['submitted', 'graded', 'under_review'].includes(a.status));
        break;
      case 'missing':
        list = list.filter(a => a.status === 'missing' || a.status === 'late');
        break;
      case 'by_subject':
        break; // subject filter handled above
    }

    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [store, filter, search, subjectFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: store.assignments.length,
    pending: store.assignments.filter(a => ['not_started', 'in_progress'].includes(a.status)).length,
    submitted: store.assignments.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
    graded: store.assignments.filter(a => a.status === 'graded').length,
    missing: store.assignments.filter(a => a.status === 'missing' || a.status === 'late').length,
  }), [store.assignments]);

  if (selectedAssignment) {
    return <AssignmentDetail assignment={selectedAssignment} onBack={() => setSelectedId(null)} />;
  }

  const filters: { id: ViewFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: store.assignments.length },
    { id: 'due_soon', label: 'Due Soon', count: stats.pending },
    { id: 'completed', label: 'Completed', count: stats.submitted + stats.graded },
    { id: 'missing', label: 'Missing', count: stats.missing },
    { id: 'by_subject', label: 'By Subject', count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white/90">Assignments</h2>
          <p className="text-sm text-white/40">{stats.pending} pending · {stats.submitted} submitted · {stats.graded} graded</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MiniStat label="Total" value={stats.total} color="#818cf8" />
        <MiniStat label="Pending" value={stats.pending} color="#f97316" />
        <MiniStat label="Submitted" value={stats.submitted} color="#38bdf8" />
        <MiniStat label="Graded" value={stats.graded} color="#34d399" />
        <MiniStat label="Missing" value={stats.missing} color="#f43f5e" />
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 overflow-x-auto">
          {filters.map(f => (
            <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'ghost'}
              onClick={() => { setFilter(f.id); if (f.id !== 'by_subject') setSubjectFilter(null); }}
              className={cn('text-xs flex-shrink-0', filter !== f.id && 'text-white/40')}>
              {f.label} {f.count > 0 && <span className="ml-1 text-[10px] opacity-60">({f.count})</span>}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments..."
            className="pl-9 h-8 text-xs bg-white/[0.03] border-white/8" />
        </div>
      </div>

      {/* Subject pills when by_subject */}
      {filter === 'by_subject' && (
        <div className="flex flex-wrap gap-2">
          {store.subjects.map(s => (
            <Button key={s.id} size="sm" variant={subjectFilter === s.id ? 'default' : 'outline'}
              onClick={() => setSubjectFilter(subjectFilter === s.id ? null : s.id)}
              className={cn('text-xs', subjectFilter !== s.id && 'border-white/10 text-white/40')}>
              <div className="size-2 rounded-full mr-1.5" style={{ backgroundColor: s.color }} />
              {s.name}
            </Button>
          ))}
        </div>
      )}

      {/* Assignment list */}
      {filtered.length === 0 ? (
        <EmptyState title="No assignments found" description="Try adjusting your filters or search query." />
      ) : (
        <div className="space-y-2">
          {filtered.map(a => {
            const subj = store.getSubject(a.subjectId);
            const isOverdue = new Date(a.dueDate) < new Date() && ['not_started', 'in_progress'].includes(a.status);
            return (
              <Card key={a.id} className={cn(
                'border-white/8 bg-white/[0.02] cursor-pointer hover:border-white/12 transition-all group',
                isOverdue && 'border-red-500/10',
              )} onClick={() => setSelectedId(a.id)}>
                <CardContent className="flex items-center gap-4 py-3 px-4">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03]" style={{ borderColor: `${subj?.color}30` }}>
                    <FileText className="size-4" style={{ color: subj?.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white/80 truncate">{a.title}</p>
                      <AssignmentTypeBadge type={a.type} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-white/35">
                      <span className="flex items-center gap-1">
                        <div className="size-2 rounded-full" style={{ backgroundColor: subj?.color }} />
                        {subj?.name}
                      </span>
                      <span>Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>{a.maxScore} pts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={a.priority} />
                    <StatusBadge status={a.status} />
                    {a.score !== undefined && (
                      <span className="text-sm font-semibold text-white/70">{a.score}/{a.maxScore}</span>
                    )}
                    <ChevronRight className="size-4 text-white/15 group-hover:text-white/30 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Assignment Detail ── */
function AssignmentDetail({ assignment: a, onBack }: { assignment: StudentAssignment; onBack: () => void }) {
  const store = useStudentStore();
  const subj = store.getSubject(a.subjectId);
  const teacher = subj ? store.getTeacher(subj.teacherId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={onBack} className="text-white/40"><ArrowLeft className="size-5" /></Button>
        <div>
          <h2 className="text-lg font-bold text-white/90">{a.title}</h2>
          <p className="text-[11px] text-white/40">{subj?.name} · {teacher?.name}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-white/8 bg-white/[0.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-white/85">Instructions</CardTitle>
                <StatusBadge status={a.status} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/60 leading-relaxed">{a.instructions}</p>
              <p className="text-sm text-white/50 mt-3">{a.description}</p>
            </CardContent>
          </Card>

          {/* Rubric */}
          {a.rubric && a.rubric.length > 0 && (
            <Card className="border-white/8 bg-white/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white/85">Rubric / Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {a.rubric.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-sm text-white/70">{r.criterion}</p>
                        {r.comment && <p className="text-[10px] text-white/35 italic">{r.comment}</p>}
                      </div>
                      <span className="text-sm font-semibold text-white/60">
                        {r.points !== undefined ? `${r.points}/${r.maxPoints}` : `— / ${r.maxPoints}`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
          {a.feedback && (
            <Card className="border-emerald-500/10 bg-emerald-500/[0.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-emerald-400">Teacher Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/60 italic">"{a.feedback}"</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-white/8 bg-white/[0.02]">
            <CardContent className="pt-5 space-y-4">
              <InfoRow label="Status"><StatusBadge status={a.status} /></InfoRow>
              <InfoRow label="Priority"><PriorityBadge priority={a.priority} /></InfoRow>
              <InfoRow label="Type"><AssignmentTypeBadge type={a.type} /></InfoRow>
              <InfoRow label="Due Date"><span className="text-sm text-white/60">{new Date(a.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></InfoRow>
              <InfoRow label="Assigned"><span className="text-sm text-white/60">{new Date(a.assignedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></InfoRow>
              <InfoRow label="Max Score"><span className="text-sm font-semibold text-white/70">{a.maxScore} pts</span></InfoRow>
              {a.score !== undefined && (
                <InfoRow label="Score"><span className="text-lg font-bold text-emerald-400">{a.score}/{a.maxScore}</span></InfoRow>
              )}
              {a.submittedAt && (
                <InfoRow label="Submitted"><span className="text-sm text-white/60">{new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></InfoRow>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          {a.attachments.length > 0 && (
            <Card className="border-white/8 bg-white/[0.02]">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-white/60">Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {a.attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-white/6 bg-white/[0.02] p-2">
                      <Paperclip className="size-3 text-white/30" />
                      <span className="text-xs text-white/50 flex-1 truncate">{att}</span>
                      <Download className="size-3 text-white/30 cursor-pointer hover:text-white/60" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit / Resubmit */}
          {(['not_started', 'in_progress'].includes(a.status) || (a.allowResubmit && a.status === 'returned')) && (
            <Button className="w-full gap-2" onClick={() => store.updateAssignmentStatus(a.id, 'submitted')}>
              <Upload className="size-4" /> Submit Assignment
            </Button>
          )}
          {a.status === 'missing' && a.allowResubmit && (
            <Button variant="outline" className="w-full gap-2 border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
              onClick={() => store.updateAssignmentStatus(a.id, 'submitted')}>
              <RotateCcw className="size-4" /> Late Submission
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="size-2 rounded-full" style={{ backgroundColor: color }} />
      <div>
        <span className="text-lg font-bold text-white/85">{value}</span>
        <span className="text-[10px] text-white/35 ml-1.5">{label}</span>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-white/35">{label}</span>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    not_started: 'bg-white/5 text-white/40 border-white/10',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    submitted: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    under_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    graded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    returned: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    missing: 'bg-red-500/10 text-red-400 border-red-500/20',
    late: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return <Badge variant="outline" className={cn('text-[9px] capitalize', m[status] ?? m.not_started)}>{status.replace(/_/g, ' ')}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const m: Record<string, string> = {
    high: 'text-red-400 bg-red-500/10 border-red-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };
  return <Badge variant="outline" className={cn('text-[9px] capitalize', m[priority])}>{priority}</Badge>;
}

function AssignmentTypeBadge({ type }: { type: string }) {
  return <Badge variant="outline" className="text-[9px] capitalize border-white/10 text-white/40">{type.replace(/_/g, ' ')}</Badge>;
}
