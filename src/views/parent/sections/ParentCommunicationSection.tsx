/* ─── ParentCommunicationSection ─── Messages, feedback, volunteer (custom) */
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  ThumbsUp, Hand, Send,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useMessageThreads } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';

export function ParentCommunicationSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader]);

  const view = (() => {
    switch (activeHeader) {
      case 'messages': return <MessagesView />;
      case 'feedback': return <FeedbackView />;
      case 'volunteer': return <VolunteerView />;
      default: return <MessagesView />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── Messages ──────────────────────────────────────────────────── */
function MessagesView() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const { data: threads = [], isLoading } = useMessageThreads(schoolId);

  if (isLoading) {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold">Messages</h2></div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="py-3"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
      </>
    );
  }

  if (threads.length === 0) {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold">Messages</h2></div>
        <Card data-animate>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">No messages yet</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">Messages</h2></div>
      <div className="space-y-2" data-animate>
        {threads.map((t) => {
          const lastMsg = t.messages?.[t.messages.length - 1];
          const sender = lastMsg?.sender;
          const fromName = sender ? `${sender.firstName} ${sender.lastName}` : t.participants?.[0] ? `${t.participants[0].firstName} ${t.participants[0].lastName}` : 'Unknown';
          const initials = fromName.split(' ').map((w: string) => w[0]).join('');
          return (
            <Card key={t.id} className="cursor-pointer hover:border-primary/40 transition-colors">
              <CardContent className="flex items-center gap-3 py-3">
                <Avatar className="size-8"><AvatarFallback className="text-[10px]">{initials}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{fromName}</p>
                    <span className="text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card data-animate>
        <CardContent className="pt-6 flex gap-2">
          <Input placeholder="Write a message…" className="flex-1" />
          <Button size="sm"><Send className="mr-1 size-3" /> Send</Button>
        </CardContent>
      </Card>
    </>
  );
}

/* ── Feedback ──────────────────────────────────────────────────── */
function FeedbackView() {
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">Feedback &amp; Surveys</h2></div>
      <div className="space-y-2" data-animate>
        {[
          { title: 'Spring Semester Survey', desc: 'Rate your experience this semester', deadline: 'May 20', status: 'open' },
          { title: 'Teacher Evaluation — Emily', desc: 'Annual teacher feedback', deadline: 'May 25', status: 'open' },
          { title: 'Cafeteria Satisfaction', desc: 'Help us improve school meals', deadline: 'Completed', status: 'done' },
          { title: 'Bus Route Feedback', desc: 'Transportation quality survey', deadline: 'Completed', status: 'done' },
        ].map((s) => (
          <Card key={s.title}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="rounded bg-primary/10 p-2">
                  <ThumbsUp className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc} · {s.deadline}</p>
                </div>
              </div>
              <Badge variant={s.status === 'open' ? 'default' : 'outline'} className="text-[10px]">
                {s.status === 'open' ? 'Fill Out' : 'Completed'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ── Volunteer ─────────────────────────────────────────────────── */
function VolunteerView() {
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">Volunteer Opportunities</h2></div>
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {[
          { label: 'Hours This Year', value: '24', color: 'text-primary' },
          { label: 'Events Helped', value: '8', color: 'text-emerald-500' },
          { label: 'Upcoming Signups', value: '2', color: 'text-amber-500' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-2" data-animate>
        {[
          { title: 'Science Fair Judges Needed', date: 'May 23, 9:00 AM', spots: 5, signed: false },
          { title: 'Library Reading Program', date: 'May 26, 2:00 PM', spots: 3, signed: true },
          { title: 'Spring Carnival Setup', date: 'Jun 1, 8:00 AM', spots: 12, signed: true },
          { title: 'Graduation Ceremony Ushers', date: 'Jun 10, 5:00 PM', spots: 8, signed: false },
        ].map((v) => (
          <Card key={v.title}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="rounded bg-primary/10 p-2">
                  <Hand className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{v.title}</p>
                  <p className="text-xs text-muted-foreground">{v.date} · {v.spots} spots left</p>
                </div>
              </div>
              <Button size="sm" variant={v.signed ? 'outline' : 'default'}>
                {v.signed ? 'Signed Up' : 'Sign Up'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
