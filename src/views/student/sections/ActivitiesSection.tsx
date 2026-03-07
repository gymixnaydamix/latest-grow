/* ─── ActivitiesSection ─── Events, clubs, competitions ──────────────
 * School calendar, clubs, competitions, trips, registration
 * ─────────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  Calendar, Trophy, Users, MapPin, Clock, Star, Search,
  CheckCircle2, Ticket, Music,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type SchoolEvent } from '@/store/student-data.store';
import { useStudentData } from '@/hooks/use-student-data';
import { EmptyState } from '@/components/features/EmptyState';

type EventFilter = 'all' | 'upcoming' | 'registered' | 'club' | 'competition' | 'trip' | 'workshop';

const EVENT_TYPE_CONFIG: Record<string, { icon: typeof Calendar; color: string }> = {
  club: { icon: Users, color: '#818cf8' },
  competition: { icon: Trophy, color: '#f97316' },
  trip: { icon: MapPin, color: '#34d399' },
  workshop: { icon: Star, color: '#38bdf8' },
  sports: { icon: Trophy, color: '#f43f5e' },
  cultural: { icon: Music, color: '#a78bfa' },
  academic: { icon: Calendar, color: '#fbbf24' },
};

export function ActivitiesSection() {
  const store = useStudentData();
  const [filter, setFilter] = useState<EventFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = store.events;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e: SchoolEvent) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    switch (filter) {
      case 'upcoming': list = list.filter((e: SchoolEvent) => new Date(e.date) >= new Date()); break;
      case 'registered': list = list.filter((e: SchoolEvent) => e.registered); break;
      case 'club': case 'competition': case 'trip': case 'workshop':
        list = list.filter((e: SchoolEvent) => e.type === filter); break;
    }
    return list.sort((a: SchoolEvent, b: SchoolEvent) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [store.events, filter, search]);

  const selected = selectedId ? store.events.find((e: SchoolEvent) => e.id === selectedId) : null;
  const registeredCount = store.events.filter((e: SchoolEvent) => e.registered).length;
  const upcomingCount = store.events.filter((e: SchoolEvent) => new Date(e.date) >= new Date()).length;

  const filters: { id: EventFilter; label: string }[] = [
    { id: 'all', label: 'All Events' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'registered', label: 'Registered' },
    { id: 'club', label: 'Clubs' },
    { id: 'competition', label: 'Competitions' },
    { id: 'trip', label: 'Trips' },
    { id: 'workshop', label: 'Workshops' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white/90">Activities & Events</h2>
        <p className="text-sm text-white/40">{upcomingCount} upcoming · {registeredCount} registered</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={Calendar} label="Total" value={store.events.length} color="#818cf8" />
        <MiniStat icon={Clock} label="Upcoming" value={upcomingCount} color="#38bdf8" />
        <MiniStat icon={CheckCircle2} label="Registered" value={registeredCount} color="#34d399" />
        <MiniStat icon={Trophy} label="Competitions" value={store.events.filter((e: SchoolEvent) => e.type === 'competition').length} color="#f97316" />
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 overflow-x-auto">
          {filters.map(f => (
            <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'ghost'}
              onClick={() => setFilter(f.id)}
              className={cn('text-xs flex-shrink-0', filter !== f.id && 'text-white/40')}>
              {f.label}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
            className="pl-9 h-8 text-xs bg-white/[0.03] border-white/8" />
        </div>
      </div>

      {/* Event list */}
      {filtered.length === 0 ? (
        <EmptyState title="No events found" description="Check back later for new activities." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((event: SchoolEvent) => (
            <EventCard key={event.id} event={event} onSelect={() => setSelectedId(event.id)} />
          ))}
        </div>
      )}

      {/* Event detail modal-like */}
      {selected && <EventDetail event={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

/* ── Event Card ── */
function EventCard({ event, onSelect }: { event: SchoolEvent; onSelect: () => void }) {
  const cfg = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.academic;
  const Icon = cfg.icon;
  const isPast = new Date(event.date) < new Date();
  const days = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000);

  return (
    <Card className={cn(
      'border-white/8 bg-white/[0.02] cursor-pointer hover:border-white/12 transition-all group',
      isPast && 'opacity-60',
    )} onClick={onSelect}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl border border-white/8 bg-white/[0.03]" style={{ borderColor: `${cfg.color}30` }}>
            <Icon className="size-4" style={{ color: cfg.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-white/80 truncate">{event.title}</p>
              {event.registered && <Badge className="text-[8px] bg-emerald-500/15 text-emerald-400 border-0">Registered</Badge>}
            </div>
            <p className="text-[10px] text-white/35 line-clamp-2 mb-2">{event.description}</p>
            <div className="flex items-center gap-3 text-[10px] text-white/30">
              <Badge variant="outline" className="text-[8px] capitalize" style={{ color: cfg.color, borderColor: `${cfg.color}30` }}>{event.type}</Badge>
              <span className="flex items-center gap-1"><Calendar className="size-3" />{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              {event.startTime && <span className="flex items-center gap-1"><Clock className="size-3" />{event.startTime}</span>}
              <span className="flex items-center gap-1"><MapPin className="size-3" />{event.location}</span>
            </div>
          </div>
          {!isPast && days >= 0 && (
            <span className={cn('text-xs font-semibold flex-shrink-0', days <= 3 ? 'text-amber-400' : 'text-white/30')}>
              {days === 0 ? 'Today' : `${days}d`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Event Detail ── */
function EventDetail({ event, onClose }: { event: SchoolEvent; onClose: () => void }) {
  const store = useStudentData();
  const cfg = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.academic;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <Card className="border-white/10 bg-zinc-900 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center" style={{ borderColor: `${cfg.color}30` }}>
              {(() => { const Icon = cfg.icon; return <Icon className="size-4" style={{ color: cfg.color }} />; })()}
            </div>
            <div className="flex-1">
              <CardTitle className="text-base text-white/90">{event.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[8px] capitalize" style={{ color: cfg.color, borderColor: `${cfg.color}30` }}>{event.type}</Badge>
                {event.registered && <Badge className="text-[8px] bg-emerald-500/15 text-emerald-400 border-0">Registered</Badge>}
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={onClose} className="text-white/40 text-xs">Close</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-white/55 leading-relaxed">{event.description}</p>

          <div className="space-y-2 text-sm text-white/50">
            <div className="flex items-center gap-3"><Calendar className="size-4 text-white/30" />{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
            {event.startTime && <div className="flex items-center gap-3"><Clock className="size-4 text-white/30" />{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</div>}
            <div className="flex items-center gap-3"><MapPin className="size-4 text-white/30" />{event.location}</div>
          </div>

          {event.capacity && (
            <div className="flex items-center justify-between text-[11px] text-white/35 bg-white/[0.02] rounded-lg p-2 border border-white/5">
              <span>Capacity</span>
              <span className="font-semibold text-white/50">{event.enrolled || 0} / {event.capacity} registered</span>
            </div>
          )}

          {!isPast && !event.registered && event.registrationOpen && (
            <Button className="w-full gap-2" onClick={() => store.registerForEvent(event.id)}>
              <Ticket className="size-4" /> Register Now
            </Button>
          )}
          {event.registered && !isPast && (
            <div className="text-center py-2">
              <CheckCircle2 className="size-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs text-emerald-400">You're registered for this event</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Helpers ── */
function MiniStat({ icon: Icon, label, value, color }: { icon: typeof Calendar; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="flex items-center justify-center size-8 rounded-lg bg-white/[0.03]"><Icon className="size-4" style={{ color }} /></div>
      <div>
        <span className="text-lg font-bold text-white/85">{value}</span>
        <span className="text-[10px] text-white/35 ml-1.5">{label}</span>
      </div>
    </div>
  );
}
