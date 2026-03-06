/* ─── AttendancePage ─── Luxury 2040 attendance tracker with bulk actions ─── */
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  ClipboardCheck, CheckCircle2, XCircle, Clock, ShieldAlert,
  Search, Users, Save, Check, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourses, useCourseStudents, useMarkAttendance, useCourseAttendance } from '@/hooks/api';
import { useAuthStore } from '@/store/auth.store';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

interface StudentRecord {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: AttendanceStatus;
  note: string;
}

const STATUS_CONFIG: Record<AttendanceStatus, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  PRESENT: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/12 border-emerald-400/20 hover:bg-emerald-500/20' },
  ABSENT:  { icon: XCircle,      color: 'text-rose-400',    bg: 'bg-rose-500/12 border-rose-400/20 hover:bg-rose-500/20' },
  LATE:    { icon: Clock,         color: 'text-amber-400',   bg: 'bg-amber-500/12 border-amber-400/20 hover:bg-amber-500/20' },
  EXCUSED: { icon: ShieldAlert,   color: 'text-violet-400',  bg: 'bg-violet-500/12 border-violet-400/20 hover:bg-violet-500/20' },
};

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

function formatDateForInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function AttendancePage() {
  const [searchParams] = useSearchParams();
  const { schoolId } = useAuthStore();
  const { data: courses } = useCourses(schoolId);
  const [courseId, setCourseId] = useState(searchParams.get('courseId') ?? '');
  const [date, setDate] = useState(formatDateForInput(new Date()));
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: enrollments, isLoading: studentsLoading } = useCourseStudents(courseId || null);
  const { data: existingAttendance } = useCourseAttendance(courseId || null);
  const markAttendance = useMarkAttendance(courseId);
  const containerRef = useStaggerAnimate<HTMLDivElement>([courseId, date, studentsLoading]);

  // Initialize records from enrollments
  useEffect(() => {
    if (!enrollments) return;
    const existing = existingAttendance?.filter(a => a.date.startsWith(date)) ?? [];
    const existingMap = new Map(existing.map(a => [a.studentId, a]));

    setRecords(
      enrollments.map(e => {
        const ex = existingMap.get(e.student?.id ?? e.studentId);
        return {
          studentId: e.student?.id ?? e.studentId,
          firstName: e.student?.firstName ?? '',
          lastName: e.student?.lastName ?? '',
          email: e.student?.email ?? '',
          status: (ex?.status as AttendanceStatus) ?? 'PRESENT',
          note: '',
        };
      }),
    );
  }, [enrollments, existingAttendance, date]);

  // Filtered records by search
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return records.filter(r =>
      !s || r.firstName.toLowerCase().includes(s) || r.lastName.toLowerCase().includes(s),
    );
  }, [records, search]);

  // Stat counts
  const stats = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    records.forEach(r => counts[r.status]++);
    return counts;
  }, [records]);

  // Update a record
  const updateRecord = useCallback((studentId: string, updates: Partial<StudentRecord>) => {
    setRecords(prev => prev.map(r =>
      r.studentId === studentId ? { ...r, ...updates } : r,
    ));
    setSaveSuccess(false);
  }, []);

  // Bulk actions
  const markAll = useCallback((status: AttendanceStatus) => {
    setRecords(prev => prev.map(r => ({ ...r, status })));
    setSaveSuccess(false);
  }, []);

  // Save
  const handleSave = async () => {
    if (!courseId || records.length === 0) return;
    setIsSaving(true);
    try {
      await markAttendance.mutateAsync({
        date,
        records: records.map(r => ({ studentId: r.studentId, status: r.status })),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // error handled by react-query
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = records.length > 0;

  return (
    <div ref={containerRef} className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3" data-animate>
        <div>
          <h1 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <ClipboardCheck className="size-5 text-emerald-400" /> Attendance
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Mark and track student attendance</p>
        </div>
        <Button
          className={`text-xs h-9 gap-1.5 transition-all duration-300 ${
            saveSuccess
              ? 'bg-emerald-600 hover:bg-emerald-500'
              : 'bg-indigo-600 hover:bg-indigo-500'
          } text-white`}
          disabled={isSaving || !hasChanges || !courseId}
          onClick={handleSave}
        >
          {saveSuccess ? (
            <><Check className="size-3.5" /> Saved!</>
          ) : isSaving ? (
            <><div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            <><Save className="size-3.5" /> Save Attendance</>
          )}
        </Button>
      </div>

      {/* ── Course + Date selector ── */}
      <div className="flex items-center gap-3 flex-wrap" data-animate>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="w-60 h-9 bg-white/3 border-white/8 text-white/70 text-xs">
            <SelectValue placeholder="Select a course..." />
          </SelectTrigger>
          <SelectContent>
            {(courses ?? []).map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-40 h-9 bg-white/3 border-white/8 text-white/70 text-xs scheme-dark"
        />

        <div className="relative flex-1 min-w-40 max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/25" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-white/3 border-white/8 text-white/80 placeholder:text-white/25 h-9"
          />
        </div>
      </div>

      {/* ── Quick stats ── */}
      {records.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap" data-animate>
          {STATUSES.map(status => {
            const cfg = STATUS_CONFIG[status];
            const Icon = cfg.icon;
            return (
              <Badge
                key={status}
                variant="outline"
                className={`${cfg.bg} ${cfg.color} gap-1 text-xs px-3 py-1 border`}
              >
                <Icon className="size-3" />
                {status.charAt(0) + status.slice(1).toLowerCase()}: {stats[status]}
              </Badge>
            );
          })}
          <span className="text-white/20 text-[10px] mx-1">|</span>
          <span className="text-xs text-white/30">
            <Users className="size-3 inline mr-1" />{records.length} total
          </span>
        </div>
      )}

      {/* ── Bulk actions ── */}
      {records.length > 0 && (
        <div className="flex items-center gap-2" data-animate>
          <span className="text-xs text-white/35 mr-1">Quick:</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10"
            onClick={() => markAll('PRESENT')}
          >
            <CheckCircle2 className="size-3 mr-1" /> All Present
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10"
            onClick={() => markAll('ABSENT')}
          >
            <XCircle className="size-3 mr-1" /> All Absent
          </Button>
        </div>
      )}

      {/* ── No course selected ── */}
      {!courseId && (
        <div className="py-16 text-center" data-animate>
          <ClipboardCheck className="mx-auto size-10 text-white/15 mb-3" />
          <p className="text-sm text-white/40">Select a course to begin</p>
          <p className="text-xs text-white/25 mt-1">Choose a course from the dropdown above.</p>
        </div>
      )}

      {/* ── Loading ── */}
      {courseId && studentsLoading && (
        <div className="space-y-2" data-animate>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full bg-white/3 rounded-xl" />
          ))}
        </div>
      )}

      {/* ── Student list ── */}
      {courseId && !studentsLoading && (
        <div className="space-y-1.5" data-animate>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto size-8 text-white/15 mb-2" />
              <p className="text-sm text-white/40">No students found.</p>
            </div>
          ) : (
            filtered.map((record) => {
              const currentCfg = STATUS_CONFIG[record.status];
              const CurrentIcon = currentCfg.icon;
              return (
                <div
                  key={record.studentId}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-white/2 backdrop-blur-sm hover:bg-white/4 transition-all duration-200 group"
                >
                  {/* Avatar */}
                  <div className="size-9 rounded-full bg-indigo-500/15 flex items-center justify-center text-xs font-semibold text-indigo-300 shrink-0">
                    {record.firstName.charAt(0)}{record.lastName.charAt(0)}
                  </div>

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white/80 truncate">
                      {record.firstName} {record.lastName}
                    </p>
                    <p className="text-[10px] text-white/30 truncate">{record.email}</p>
                  </div>

                  {/* Status indicator */}
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${currentCfg.color}`}>
                    <CurrentIcon className="size-3.5" />
                    {record.status.charAt(0) + record.status.slice(1).toLowerCase()}
                  </div>

                  {/* Status toggles */}
                  <div className="flex items-center gap-1">
                    {STATUSES.map(status => {
                      const cfg = STATUS_CONFIG[status];
                      const Icon = cfg.icon;
                      const active = record.status === status;
                      return (
                        <button
                          key={status}
                          className={`
                            size-8 rounded-lg flex items-center justify-center border transition-all duration-200
                            ${active
                              ? `${cfg.bg} ${cfg.color} scale-110 shadow-lg`
                              : 'border-white/6 bg-white/2 text-white/25 hover:bg-white/5 hover:text-white/50'
                            }
                          `}
                          title={status}
                          onClick={() => updateRecord(record.studentId, { status })}
                        >
                          <Icon className="size-3.5" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Note field (expandable) */}
                  <div className="relative group/note">
                    <button
                      className="size-8 rounded-lg flex items-center justify-center border border-white/6 bg-white/2 text-white/25 hover:bg-white/5 hover:text-white/50 transition-colors"
                      title="Add note"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
