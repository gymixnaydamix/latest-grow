import { useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useParentV2Timetable } from '@/hooks/api/use-parent-v2';
import { childDisplayName, filterByChild, parentTimetableDemo as FALLBACK_TIMETABLE } from './parent-v2-demo-data';
import type { ParentTimetableItemDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, StatusBadge } from './shared';
import type { ParentSectionProps } from './shared';

const WEEKDAY_FILTERS = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export function TimetableSection({ scope, childId }: ParentSectionProps) {
  const { data: rawData } = useParentV2Timetable({ scope, childId });
  const allRows: ParentTimetableItemDemo[] = (rawData as ParentTimetableItemDemo[] | undefined) ?? filterByChild(FALLBACK_TIMETABLE, childId, scope);

  const [weekday, setWeekday] = useState<(typeof WEEKDAY_FILTERS)[number]>('All');
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () =>
      allRows.filter((row) => {
        const weekdayMatch = weekday === 'All' || row.weekday === weekday;
        const searchMatch =
          query.trim().length === 0 ||
          `${row.subject} ${row.teacher} ${childDisplayName(row.childId)}`.toLowerCase().includes(query.toLowerCase());
        return weekdayMatch && searchMatch;
      }),
    [allRows, weekday, query],
  );

  // Group by time slot for better visual display
  const grouped = useMemo(() => {
    const map = new Map<string, ParentTimetableItemDemo[]>();
    for (const r of rows) {
      const key = `${r.weekday} ${r.startTime}`;
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  const cancelledCount = allRows.filter((r) => r.status === 'CANCELLED').length;
  const substituteCount = allRows.filter((r) => r.status === 'SUBSTITUTE').length;

  return (
    <ParentSectionShell
      title="Timetable"
      description="Daily and weekly class flow by child with room, teacher, and schedule change visibility."
    >
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-bold">{allRows.length}</p>
              <p className="text-xs text-muted-foreground">Total sessions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="size-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{new Set(allRows.map((r) => r.subject)).size}</p>
              <p className="text-xs text-muted-foreground">Subjects</p>
            </div>
          </CardContent>
        </Card>
        {cancelledCount > 0 && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="size-2 rounded-full bg-red-500" />
              <div>
                <p className="text-2xl font-bold">{cancelledCount}</p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
            </CardContent>
          </Card>
        )}
        {substituteCount > 0 && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="size-2 rounded-full bg-amber-500" />
              <div>
                <p className="text-2xl font-bold">{substituteCount}</p>
                <p className="text-xs text-muted-foreground">Substitute</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {WEEKDAY_FILTERS.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setWeekday(entry)}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              weekday === entry ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
            }`}
          >
            {entry}
          </button>
        ))}
        <Input
          className="max-w-xs"
          placeholder="Search subject, teacher, child"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Schedule Board</CardTitle>
          <CardDescription>{rows.length} session(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {grouped.length === 0 ? (
            <EmptyActionState title="No sessions" message="No sessions match your filter." ctaLabel="Show all" onClick={() => { setWeekday('All'); setQuery(''); }} />
          ) : (
            <div className="space-y-3">
              {grouped.map(([slot, items]) => (
                <div key={slot}>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">{slot}</p>
                  <div className="space-y-2">
                    {items.map((entry) => (
                      <div
                        key={entry.id}
                        className={`rounded-lg border p-3 transition-all ${
                          entry.status === 'CANCELLED'
                            ? 'border-red-500/30 bg-red-500/5 line-through opacity-70'
                            : entry.status === 'SUBSTITUTE'
                              ? 'border-amber-500/30 bg-amber-500/5'
                              : 'border-border/60'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`size-2.5 rounded-full ${
                                entry.status === 'CANCELLED' ? 'bg-red-500' : entry.status === 'SUBSTITUTE' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                            <p className="text-sm font-medium">{entry.subject}</p>
                            <Badge variant="outline" className="text-xs">{childDisplayName(entry.childId)}</Badge>
                          </div>
                          <StatusBadge
                            status={entry.status}
                            tone={entry.status === 'CANCELLED' ? 'bad' : entry.status === 'SUBSTITUTE' ? 'warn' : 'good'}
                          />
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="size-3" />{entry.startTime} – {entry.endTime}</span>
                          <span className="flex items-center gap-1"><User className="size-3" />{entry.teacher}</span>
                          <span className="flex items-center gap-1"><MapPin className="size-3" />Room {entry.room}</span>
                        </div>
                        {'note' in entry && entry.note && (
                          <p className="mt-1.5 rounded bg-muted/30 px-2 py-1 text-xs italic text-muted-foreground">
                            📋 {entry.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ParentSectionShell>
  );
}
