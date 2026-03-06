/* ─── SchedulePage ─── Luxury 2040 weekly schedule with holographic session blocks ─── */
import { useState, useCallback } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  CalendarDays, Filter, Plus,
  BookOpen, FlaskConical, MessageSquare, FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/features/Calendar';
import { SessionDetailModal } from '@/components/features/SessionDetailModal';
import { useSchoolSessions } from '@/hooks/api';
import { useAuthStore } from '@/store/auth.store';
import type { CourseSession } from '@root/types';

const SESSION_TYPE_COLORS: Record<string, string> = {
  LECTURE: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/20',
  LAB: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
  TUTORIAL: 'bg-amber-500/15 text-amber-300 border-amber-400/20',
  EXAM: 'bg-rose-500/15 text-rose-300 border-rose-400/20',
};

const SESSION_ICONS: Record<string, typeof BookOpen> = {
  LECTURE: BookOpen, LAB: FlaskConical, TUTORIAL: MessageSquare, EXAM: FileCheck,
};

export function SchedulePage() {
  const { schoolId, user } = useAuthStore();
  const { data: sessions, isLoading, error } = useSchoolSessions(schoolId);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<CourseSession | null>(null);
  const containerRef = useStaggerAnimate<HTMLDivElement>([filterType, isLoading]);

  const canCreate = user && ['PROVIDER', 'ADMIN', 'TEACHER'].includes(user.role);
  const handleModalClose = useCallback((open: boolean) => { if (!open) setSelectedSession(null); }, []);

  const filteredSessions = (sessions ?? []).filter(s =>
    filterType === 'all' || s.type === filterType,
  );

  // Stat counts
  const typeCounts = (sessions ?? []).reduce<Record<string, number>>((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div ref={containerRef} className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3" data-animate>
        <div>
          <h1 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <CalendarDays className="size-5 text-indigo-400" /> Schedule
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            {sessions?.length ?? 0} sessions across your school
          </p>
        </div>
        {canCreate && (
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 gap-1.5">
            <Plus className="size-3.5" /> Add Session
          </Button>
        )}
      </div>

      {/* ── Session type stat badges ── */}
      <div className="flex items-center gap-2 flex-wrap" data-animate>
        {(['LECTURE', 'LAB', 'TUTORIAL', 'EXAM'] as const).map(type => {
          const Icon = SESSION_ICONS[type];
          return (
            <Badge
              key={type}
              variant="outline"
              className={`${SESSION_TYPE_COLORS[type]} gap-1.5 text-xs px-3 py-1 cursor-pointer transition-all hover:scale-105 ${filterType === type ? 'ring-1 ring-white/20' : ''}`}
              onClick={() => setFilterType(prev => prev === type ? 'all' : type)}
            >
              <Icon className="size-3" />
              {type.charAt(0) + type.slice(1).toLowerCase()}
              <span className="text-white/30 ml-1">{typeCounts[type] ?? 0}</span>
            </Badge>
          );
        })}
        {filterType !== 'all' && (
          <button
            className="text-[10px] text-white/40 hover:text-white/70 underline underline-offset-2 transition-colors"
            onClick={() => setFilterType('all')}
          >
            Clear filter
          </button>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3 flex-wrap" data-animate>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Filter className="size-3.5" /> View:
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36 h-9 bg-white/3 border-white/8 text-white/70 text-xs">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="LECTURE">Lectures</SelectItem>
            <SelectItem value="LAB">Labs</SelectItem>
            <SelectItem value="TUTORIAL">Tutorials</SelectItem>
            <SelectItem value="EXAM">Exams</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400" data-animate>
          Failed to load schedule. Please try again.
        </div>
      )}

      {/* ── Skeleton loading ── */}
      {isLoading ? (
        <div className="rounded-2xl border border-white/6 bg-white/2 backdrop-blur-xl p-4 space-y-3" data-animate>
          <div className="flex gap-3 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-12 flex-1 bg-white/4 rounded-lg" />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-white/3 rounded-lg" />
          ))}
        </div>
      ) : (
        /* ── Calendar grid ── */
        <Calendar
          sessions={filteredSessions}
          onSessionClick={setSelectedSession}
          className=""
        />
      )}

      {/* ── Empty state ── */}
      {!isLoading && filteredSessions.length === 0 && (
        <div className="py-16 text-center" data-animate>
          <CalendarDays className="mx-auto size-10 text-white/15 mb-3" />
          <p className="text-sm text-white/40">No sessions scheduled.</p>
          <p className="text-xs text-white/25 mt-1">
            {filterType !== 'all' ? 'Try clearing the filter or ' : ''}Add sessions to build your schedule.
          </p>
        </div>
      )}

      {/* ── Session detail modal ── */}
      <SessionDetailModal
        session={selectedSession}
        open={!!selectedSession}
        onOpenChange={handleModalClose}
      />
    </div>
  );
}
