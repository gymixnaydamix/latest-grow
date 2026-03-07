/* ─── Behavior Section ────────────────────────────────────────────
 * Routes: behavior_log (default) | add_note | praise_board
 * ──────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  AlertTriangle, Award, FileText,
  Plus, Search, Star, ThumbsUp, Trophy, User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigationStore } from '@/store/navigation.store';
import { useSaveBehaviorNote, useTeacherBehaviorNotes } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import {
  TeacherSectionShell, GlassCard, MetricCard, StatusBadge, EmptyState,
} from './shared';
import type { TeacherSectionProps } from './shared';
import {
  behaviorNotesDemo as FALLBACK_behaviorNotesDemo, attendanceStudentsDemo as FALLBACK_attendanceStudentsDemo,
  formatDateLabel, type BehaviorNoteDemo,
} from './teacher-demo-data';

/* ── Type styling ── */
const typeStyles: Record<string, { badge: string; icon: React.ReactNode; label: string; tone: 'good' | 'warn' | 'bad' }> = {
  positive: { badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400', icon: <ThumbsUp className="size-3.5" />, label: 'Positive', tone: 'good' },
  concern: { badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400', icon: <AlertTriangle className="size-3.5" />, label: 'Concern', tone: 'warn' },
  incident: { badge: 'border-rose-500/30 bg-rose-500/10 text-rose-400', icon: <FileText className="size-3.5" />, label: 'Incident', tone: 'bad' },
};

export function BehaviorSection(_props: TeacherSectionProps) {
  const { activeHeader, setHeader } = useNavigationStore();
  const header = activeHeader || 'behavior_log';
  const saveBehaviorNoteMut = useSaveBehaviorNote();
  const { data: apiBehaviorNotes } = useTeacherBehaviorNotes();

  const notes: BehaviorNoteDemo[] = (apiBehaviorNotes as unknown as BehaviorNoteDemo[]) ?? FALLBACK_behaviorNotesDemo;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  /* ── Add note form state ── */
  const [noteStudent, setNoteStudent] = useState('');
  const [noteType, setNoteType] = useState<'positive' | 'concern' | 'incident'>('positive');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteFollowUp, setNoteFollowUp] = useState(false);
  const [noteFollowUpText, setNoteFollowUpText] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  const positiveCount = notes.filter(n => n.type === 'positive').length;
  const concernCount = notes.filter(n => n.type === 'concern').length;
  const incidentCount = notes.filter(n => n.type === 'incident').length;

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (filterType !== 'all') result = result.filter(n => n.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(n =>
        n.studentName.toLowerCase().includes(q) ||
        n.note.toLowerCase().includes(q) ||
        n.className.toLowerCase().includes(q),
      );
    }
    return result;
  }, [notes, filterType, search]);

  const praiseNotes = notes.filter(n => n.type === 'positive');

  const matchingStudents = useMemo(() => {
    if (studentSearch.length < 2) return [];
    const q = studentSearch.toLowerCase();
    return FALLBACK_attendanceStudentsDemo.filter(s => s.name.toLowerCase().includes(q)).slice(0, 5);
  }, [studentSearch]);

  const handleAddNote = () => {
    if (!noteStudent || !noteDescription.trim()) return;
    saveBehaviorNoteMut.mutate(
      { studentName: noteStudent, className: '', classId: '', type: noteType, note: noteDescription, followUp: noteFollowUp ? noteFollowUpText : undefined },
      { onSuccess: () => {
        notifySuccess('Behavior note saved', `Note saved for ${noteStudent}`);
        setNoteStudent(''); setNoteType('concern'); setNoteDescription(''); setNoteFollowUp(false); setNoteFollowUpText('');
        setHeader('behavior_log');
      }}
    );
  };

  return (
    <TeacherSectionShell
      title="Behavior Tracking"
      description={`${notes.length} notes this period · ${positiveCount} positive · ${concernCount + incidentCount} concerns`}
      actions={
        <Button
          size="sm"
          className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
          onClick={() => setHeader('add_note')}
        >
          <Plus className="size-3.5" /> Add Note
        </Button>
      }
    >
      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-animate>
        <MetricCard label="Total Notes" value={notes.length} accent="#818cf8" />
        <MetricCard label="Positive" value={positiveCount} accent="#34d399" trend="up" />
        <MetricCard label="Concerns" value={concernCount} accent="#fbbf24" />
        <MetricCard label="Incidents" value={incidentCount} accent="#f87171" />
      </div>

      {/* ── BEHAVIOR LOG VIEW ── */}
      {header === 'behavior_log' && (
        <div className="space-y-4" data-animate>
          {/* Search + Filter */}
          <GlassCard className="flex flex-wrap items-center gap-3 p-3!">
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25" />
              <Input
                placeholder="Search notes by student, class..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white/3 border-white/8 text-white/80 placeholder:text-white/25"
              />
            </div>
            <div className="flex gap-1.5">
              {['all', 'positive', 'concern', 'incident'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    filterType === t
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-white/3 text-white/40 border border-white/6 hover:bg-white/5'
                  }`}
                >
                  {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Timeline */}
          {filteredNotes.length === 0 ? (
            <EmptyState title="No behavior notes" message="No notes match your search criteria." icon={<FileText className="size-8" />} />
          ) : (
            <div className="relative space-y-3">
              {/* Vertical timeline line */}
              <div className="absolute left-4.75 top-4 bottom-4 w-px bg-white/6" />

              {filteredNotes.map(note => {
                const style = typeStyles[note.type] ?? typeStyles.positive;
                return (
                  <div key={note.id} className="relative flex gap-4 pl-1">
                    {/* Timeline dot */}
                    <div className={`relative z-10 mt-4 shrink-0 flex items-center justify-center size-9.5 rounded-full border ${style.badge}`}>
                      {style.icon}
                    </div>

                    {/* Card */}
                    <div className="flex-1 rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Avatar className="size-6 border border-white/10">
                          <AvatarFallback className="text-[9px] bg-white/5 text-white/50">
                            {note.studentInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-white/75">{note.studentName}</span>
                        <Badge variant="outline" className="text-[9px] border-white/10 text-white/35">
                          {note.className}
                        </Badge>
                        <StatusBadge status={style.label} tone={style.tone} />
                        <span className="ml-auto text-[10px] text-white/25">{formatDateLabel(note.date)}</span>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed">{note.note}</p>
                      {note.followUp && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-400/70">
                          <AlertTriangle className="size-3" />
                          <span>Follow-up: {note.followUp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ADD NOTE VIEW ── */}
      {header === 'add_note' && (
        <GlassCard data-animate>
          <div className="flex items-center gap-2 mb-5">
            <FileText className="size-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white/80">Add Behavior Note</h3>
          </div>

          <div className="space-y-4">
            {/* Student Search */}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Student</Label>
              {noteStudent ? (
                <div className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2">
                  <User className="size-4 text-indigo-400" />
                  <span className="text-sm text-white/70 flex-1">{noteStudent}</span>
                  <button onClick={() => { setNoteStudent(''); setStudentSearch(''); }} className="text-xs text-white/30 hover:text-white/50">Change</button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25" />
                    <Input
                      placeholder="Search student name..."
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      className="pl-9 bg-white/3 border-white/8 text-white/80 placeholder:text-white/25"
                    />
                  </div>
                  {matchingStudents.length > 0 && (
                    <div className="rounded-lg border border-white/8 bg-white/3 p-1.5 space-y-0.5">
                      {matchingStudents.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setNoteStudent(s.name); setStudentSearch(''); }}
                          className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-white/60 rounded-md hover:bg-white/5 transition-colors"
                        >
                          <Avatar className="size-5 border border-white/10">
                            <AvatarFallback className="text-[8px] bg-white/5 text-white/40">{s.initials}</AvatarFallback>
                          </Avatar>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Note Type */}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Note Type</Label>
              <div className="flex gap-2">
                {(['positive', 'concern', 'incident'] as const).map(t => {
                  const style = typeStyles[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setNoteType(t)}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                        noteType === t
                          ? `${style.badge} ring-1 ring-white/10`
                          : 'border-white/6 bg-white/2 text-white/40 hover:bg-white/4'
                      }`}
                    >
                      {style.icon} {style.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Description</Label>
              <Textarea
                placeholder="Describe the behavior observation..."
                value={noteDescription}
                onChange={e => setNoteDescription(e.target.value)}
                rows={4}
                className="bg-white/3 border-white/8 text-white/80 placeholder:text-white/25 resize-none"
              />
            </div>

            {/* Follow-up */}
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox
                  checked={noteFollowUp}
                  onCheckedChange={v => setNoteFollowUp(!!v)}
                  className="border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                />
                <span className="text-sm text-white/60">Requires follow-up action</span>
              </label>
              {noteFollowUp && (
                <Input
                  placeholder="Follow-up action (e.g., Contact parent, Counselor referral)"
                  value={noteFollowUpText}
                  onChange={e => setNoteFollowUpText(e.target.value)}
                  className="bg-white/3 border-white/8 text-white/80 placeholder:text-white/25"
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/60" onClick={() => setHeader('behavior_log')}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                onClick={handleAddNote}
                disabled={!noteStudent || !noteDescription.trim()}
              >
                <Plus className="size-3.5" /> Save Note
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ── PRAISE BOARD VIEW ── */}
      {header === 'praise_board' && (
        <div className="space-y-4" data-animate>
          <GlassCard className="flex items-center gap-3 py-3!">
            <Trophy className="size-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-white/80">Praise Board</h3>
              <p className="text-xs text-white/35">Celebrating student achievements and positive behavior</p>
            </div>
            <Badge variant="outline" className="ml-auto text-[9px] border-emerald-500/30 text-emerald-400">{praiseNotes.length} recognitions</Badge>
          </GlassCard>

          {praiseNotes.length === 0 ? (
            <EmptyState title="No praise yet" message="Add positive behavior notes to populate the praise board." icon={<Star className="size-8" />} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {praiseNotes.map((note, i) => {
                const celebrationColors = [
                  'from-emerald-500/10 to-emerald-500/3 border-emerald-500/20',
                  'from-amber-500/10 to-amber-500/3 border-amber-500/20',
                  'from-indigo-500/10 to-indigo-500/3 border-indigo-500/20',
                  'from-pink-500/10 to-pink-500/3 border-pink-500/20',
                  'from-sky-500/10 to-sky-500/3 border-sky-500/20',
                ];
                const gradient = celebrationColors[i % celebrationColors.length];

                return (
                  <div
                    key={note.id}
                    className={`rounded-2xl border bg-linear-to-br ${gradient} backdrop-blur-xl p-5 transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="size-5 text-amber-400" />
                      <Avatar className="size-8 border border-white/10">
                        <AvatarFallback className="text-[10px] bg-white/5 text-white/60">
                          {note.studentInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-white/80">{note.studentName}</p>
                        <p className="text-[10px] text-white/35">{note.className}</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">{note.note}</p>
                    <p className="mt-3 text-[10px] text-white/25">{formatDateLabel(note.date)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </TeacherSectionShell>
  );
}
