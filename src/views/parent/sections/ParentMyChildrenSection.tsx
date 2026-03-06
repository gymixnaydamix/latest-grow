/* ─── ParentMyChildrenSection ─── Progress, billing, events, digest */
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Calendar, TrendingUp, Star,
  CheckCircle, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useEvents } from '@/hooks/api';

export function ParentMyChildrenSection() {
  const { activeHeader } = useNavigationStore();
  const { schoolId } = useAuthStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader]);

  const view = (() => {
    switch (activeHeader) {
      case 'child_progress': return <ChildProgressView />;
      case 'billing': return <BillingView />;
      case 'events': return <EventsView schoolId={schoolId} />;
      case 'digest': return <DigestView />;
      default: return <ChildProgressView />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── Child Progress ────────────────────────────────────────────── */
function ChildProgressView() {
  /* NOTE: useChildProgress(studentId) fetches progress per-child only.
     A "list my children" endpoint is not yet available, so the children
     list below is kept as demo data until a parent-children listing API
     is implemented. Wire individual child cards with useChildProgress
     once child IDs are available. */
  const children = [
    {
      name: 'Emily Johnson', grade: '10th', school: 'Lincoln High', gpa: 3.7,
      courses: [
        { name: 'AP English', grade: 'A-', teacher: 'Ms. Rodriguez' },
        { name: 'Algebra II', grade: 'B+', teacher: 'Mr. Thompson' },
        { name: 'Chemistry', grade: 'A', teacher: 'Dr. Patel' },
      ],
      attendance: 96,
      alerts: ['Missing assignment in History'],
    },
    {
      name: 'Jake Johnson', grade: '7th', school: 'Lincoln Middle', gpa: 3.4,
      courses: [
        { name: 'English 7', grade: 'B+', teacher: 'Mrs. Lee' },
        { name: 'Pre-Algebra', grade: 'B', teacher: 'Mr. Garcia' },
        { name: 'Life Science', grade: 'A-', teacher: 'Ms. Park' },
      ],
      attendance: 98,
      alerts: [],
    },
  ];

  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">Child Progress</h2></div>
      {children.map((child) => (
        <Card key={child.name} data-animate>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="size-10"><AvatarFallback>{child.name.split(' ').map(w => w[0]).join('')}</AvatarFallback></Avatar>
              <div>
                <CardTitle className="text-sm">{child.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{child.grade} · {child.school} · GPA {child.gpa}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {child.alerts.length > 0 && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-destructive" />
                <span className="text-xs text-destructive">{child.alerts[0]}</span>
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-3">
              {child.courses.map((c) => (
                <div key={c.name} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{c.name}</span>
                    <span className="text-sm font-bold text-primary">{c.grade}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{c.teacher}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="size-3 text-emerald-500" />
              Attendance: {child.attendance}%
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

/* ── Billing ───────────────────────────────────────────────────── */
function BillingView() {
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">Billing & Payments</h2></div>
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {[
          { label: 'Current Balance', value: '$2,450.00', color: 'text-destructive' },
          { label: 'Next Payment', value: 'Jun 1, 2025', color: '' },
          { label: 'YTD Paid', value: '$18,750.00', color: 'text-emerald-500' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card data-animate>
        <CardHeader><CardTitle className="text-sm">Recent Invoices</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { desc: 'Tuition — May 2025', amount: '$2,450.00', status: 'due', date: 'May 1' },
              { desc: 'Tuition — Apr 2025', amount: '$2,450.00', status: 'paid', date: 'Apr 1' },
              { desc: 'Activity Fee — Spring', amount: '$350.00', status: 'paid', date: 'Mar 15' },
              { desc: 'Tuition — Mar 2025', amount: '$2,450.00', status: 'paid', date: 'Mar 1' },
            ].map((inv) => (
              <div key={inv.desc} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{inv.desc}</p>
                  <p className="text-xs text-muted-foreground">{inv.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{inv.amount}</span>
                  <Badge variant={inv.status === 'paid' ? 'default' : 'destructive'} className="text-[10px]">{inv.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

/* ── Events ────────────────────────────────────────────────────── */
function EventsView({ schoolId }: { schoolId: string | null }) {
  const { data, isLoading } = useEvents(schoolId);
  const events = data;

  /* ── demo fallback when API returns empty ── */
  const fallbackEvents = [
    { id: '1', title: 'Parent-Teacher Conference', date: 'May 16, 3:00 PM', location: 'Room 204', type: 'Conference', rsvp: true },
    { id: '2', title: 'Spring Band Concert', date: 'May 20, 7:00 PM', location: 'Auditorium', type: 'Performance', rsvp: false },
    { id: '3', title: 'Science Fair', date: 'May 23, 10:00 AM', location: 'Gymnasium', type: 'Academic', rsvp: false },
    { id: '4', title: 'Senior Awards Night', date: 'May 28, 6:00 PM', location: 'Auditorium', type: 'Ceremony', rsvp: true },
    { id: '5', title: 'Last Day of School', date: 'Jun 5', location: '', type: 'Calendar', rsvp: false },
  ];

  const displayEvents = events?.length
    ? events.map((e: any) => ({
        id: e.id,
        title: e.title ?? e.name ?? 'Event',
        date: e.date ? new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        location: e.location ?? '',
        type: e.type ?? 'Event',
        rsvp: false,
      }))
    : fallbackEvents;

  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">Upcoming Events</h2></div>

      {isLoading ? (
        <div className="space-y-2" data-animate>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2" data-animate>
          {displayEvents.map((e: any) => (
            <Card key={e.id ?? e.title}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded bg-primary/10 p-2">
                    <Calendar className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.date}{e.location ? ` · ${e.location}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
                  {e.rsvp && <Badge className="text-[10px]">RSVP'd</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Weekly Digest ─────────────────────────────────────────────── */
function DigestView() {
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">Weekly Digest</h2></div>
      <Card data-animate>
        <CardHeader>
          <CardTitle className="text-sm">Week of May 12–16, 2025</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Emily — 10th Grade</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><Star className="size-3 text-amber-500" /> Got an A on Chemistry lab report</div>
              <div className="flex items-center gap-2"><AlertTriangle className="size-3 text-destructive" /> Missing History assignment (due May 15)</div>
              <div className="flex items-center gap-2"><TrendingUp className="size-3 text-emerald-500" /> Math grade improved from B to B+</div>
              <div className="flex items-center gap-2"><CheckCircle className="size-3 text-emerald-500" /> Perfect attendance this week</div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Jake — 7th Grade</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><Star className="size-3 text-amber-500" /> Selected for Science Fair finals</div>
              <div className="flex items-center gap-2"><CheckCircle className="size-3 text-emerald-500" /> All assignments submitted on time</div>
              <div className="flex items-center gap-2"><CheckCircle className="size-3 text-emerald-500" /> Perfect attendance — 15 day streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
