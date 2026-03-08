import { useMemo, useState } from 'react';
import { Calendar, Clock, MapPin, User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParentV2Events, useRsvpParentV2Event } from '@/hooks/api/use-parent-v2';
import { childDisplayName, filterByChild, formatDateLabel, parentEventsDemo as FALLBACK_EVENTS } from './parent-v2-demo-data';
import type { ParentEventDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, StatusBadge } from './shared';
import type { ParentSectionProps } from './shared';

const TYPE_FILTERS = ['ALL', 'MEETING', 'ACADEMIC', 'EVENT', 'FIELD_TRIP', 'HOLIDAY'] as const;

export function EventsMeetingsSection({ scope, childId }: ParentSectionProps) {
  const { data: rawRows } = useParentV2Events({ scope, childId });
  const rsvpMutation = useRsvpParentV2Event();
  const allRows: ParentEventDemo[] = (rawRows as ParentEventDemo[] | undefined) ?? filterByChild(FALLBACK_EVENTS, childId, scope);

  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>('ALL');

  const rows = useMemo(
    () => allRows.filter((r) => typeFilter === 'ALL' || r.type === typeFilter),
    [allRows, typeFilter],
  );

  const goingCount = allRows.filter((r) => r.rsvpStatus === 'GOING').length;
  const pendingCount = allRows.filter((r) => r.rsvpStatus === 'PENDING').length;

  return (
    <ParentSectionShell
      title="Events & Meetings"
      description="School events, parent-teacher conferences, workshops, and RSVP management."
    >
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-bold">{allRows.length}</p>
              <p className="text-xs text-muted-foreground">Total events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="size-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{goingCount}</p>
              <p className="text-xs text-muted-foreground">Going</p>
            </div>
          </CardContent>
        </Card>
        <Card className={pendingCount > 0 ? 'border-amber-500/20 bg-amber-500/5' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="size-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Awaiting RSVP</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              typeFilter === t ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Event List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Upcoming Events</CardTitle>
          <CardDescription>{rows.length} event(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.length === 0 ? (
            <EmptyActionState title="No events" message="No events match this filter." ctaLabel="Show all" onClick={() => setTypeFilter('ALL')} />
          ) : (
            rows.map((row) => {
              const hasDeadline = 'rsvpDeadline' in row && row.rsvpDeadline;
              const deadlineSoon = hasDeadline && new Date(row.rsvpDeadline as string).getTime() - Date.now() < 3 * 86400000;
              return (
                <div
                  key={row.id}
                  className={`rounded-lg border p-4 transition-all ${
                    row.rsvpStatus === 'PENDING' && deadlineSoon ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/60'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{row.title}</p>
                        <Badge variant="outline" className="text-xs">{row.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {row.childId ? childDisplayName(row.childId) : 'Family-wide'}
                      </p>
                    </div>
                    <StatusBadge status={row.rsvpStatus} tone={row.rsvpStatus === 'GOING' ? 'good' : row.rsvpStatus === 'NOT_GOING' ? 'bad' : 'warn'} />
                  </div>

                  {/* Description */}
                  {'description' in row && row.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{row.description}</p>
                  )}

                  {/* Event details */}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="size-3" />{formatDateLabel(row.date)}</span>
                    {'startTime' in row && row.startTime && (
                      <span className="flex items-center gap-1"><Clock className="size-3" />{row.startTime}{('endTime' in row && row.endTime) ? ` – ${row.endTime}` : ''}</span>
                    )}
                    <span className="flex items-center gap-1"><MapPin className="size-3" />{row.location}</span>
                    {'organizer' in row && row.organizer && (
                      <span className="flex items-center gap-1"><User className="size-3" />{row.organizer}</span>
                    )}
                  </div>

                  {/* RSVP Deadline */}
                  {hasDeadline && (
                    <p className={`mt-1.5 text-xs ${deadlineSoon ? 'font-medium text-amber-600' : 'text-muted-foreground'}`}>
                      RSVP Deadline: {formatDateLabel(row.rsvpDeadline as string)}
                      {deadlineSoon ? ' — respond soon!' : ''}
                    </p>
                  )}

                  {/* RSVP Actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={row.rsvpStatus === 'GOING' ? 'default' : 'outline'}
                      disabled={rsvpMutation.isPending}
                      onClick={() => rsvpMutation.mutate({ eventId: row.id, status: 'GOING' })}
                      className="gap-1.5"
                    >
                      <Users className="size-3.5" /> Going
                    </Button>
                    <Button
                      size="sm"
                      variant={row.rsvpStatus === 'NOT_GOING' ? 'destructive' : 'outline'}
                      disabled={rsvpMutation.isPending}
                      onClick={() => rsvpMutation.mutate({ eventId: row.id, status: 'NOT_GOING' })}
                    >
                      Not going
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </ParentSectionShell>
  );
}
