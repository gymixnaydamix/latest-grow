/* Parent Concierge › Comms — Teacher Messages, School Notices, Event Updates, Feedback, Emergency Alerts, Sent */
import { useNavigationStore } from '@/store/navigation.store';
import { Send, Calendar, Star, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParentV2MessageThreads, useParentV2Announcements, useParentV2Events, useParentV2Feedback, useParentV2Notifications } from '@/hooks/api/use-parent-v2';
import { useAuthStore } from '@/store/auth.store';

/* ── Teacher messages ── */
const FALLBACK_TEACHER_MESSAGES = [
  { id: 'tm1', teacher: 'Mrs. Priya Gupta', child: 'Aarav Sharma — Grade 5', subject: 'Aarav\'s excellent performance in the science project', date: 'Today', status: 'Unread', preview: 'I wanted to let you know that Aarav did a wonderful job on his solar system model. He was one of the top 3 presenters in class.' },
  { id: 'tm2', teacher: 'Ms. Anita Desai', child: 'Meera Sharma — Grade 2', subject: 'Meera\'s reading progress this week', date: 'Today', status: 'Unread', preview: 'Meera has completed Level 4 of the reading program. She is now ready for more challenging books.' },
  { id: 'tm3', teacher: 'Mrs. Priya Gupta', child: 'Aarav Sharma — Grade 5', subject: 'Homework not submitted — Mathematics', date: 'Yesterday', status: 'Read', preview: 'Aarav did not submit his fractions worksheet due yesterday. Could you please ensure it is completed tonight?' },
  { id: 'tm4', teacher: 'Ms. Anita Desai', child: 'Meera Sharma — Grade 2', subject: 'Field trip consent reminder', date: 'Yesterday', status: 'Replied', preview: 'Just a reminder that the consent form for the Annual Day rehearsal trip is due by March 8th.' },
  { id: 'tm5', teacher: 'Mr. Ravi Krishnan (Sports)', child: 'Aarav Sharma — Grade 5', subject: 'Cricket team selection update', date: 'Mar 3', status: 'Read', preview: 'Aarav has been selected for the inter-school cricket tournament. Please ensure the medical fitness certificate is submitted by March 20.' },
];

/* ── School notices ── */
const FALLBACK_SCHOOL_NOTICES = [
  { id: 'sn1', title: 'Annual Day Celebration — Schedule & Guidelines', from: 'Principal\'s Office', date: 'Today', priority: 'high', read: false, summary: 'Annual Day will be held on March 25, 2026 at the City Auditorium. Parents are invited. Dress code and timing details enclosed.' },
  { id: 'sn2', title: 'Term 3 Examination Schedule Released', from: 'Academic Office', date: 'Yesterday', priority: 'high', read: false, summary: 'Final exams for all grades will begin March 28. Detailed subject-wise schedule available on the parent portal.' },
  { id: 'sn3', title: 'Summer Camp Registrations Open', from: 'Co-curricular Department', date: 'Mar 3', priority: 'medium', read: true, summary: 'Summer camp runs from May 15 to June 15. Activities include robotics, art, swimming, and cricket. Early bird discount until March 20.' },
  { id: 'sn4', title: 'School Holiday — Holi Festival', from: 'Admin Office', date: 'Mar 1', priority: 'low', read: true, summary: 'School will remain closed on March 14 for Holi. Classes resume March 15.' },
  { id: 'sn5', title: 'PTA Meeting — March 15', from: 'PTA Committee', date: 'Feb 28', priority: 'medium', read: true, summary: 'Quarterly PTA meeting to discuss school infrastructure improvements and upcoming academic calendar changes.' },
];

/* ── Event updates ── */
const FALLBACK_EVENT_UPDATES = [
  { id: 'eu1', event: 'Annual Day Celebration', date: 'Mar 25, 2026', venue: 'City Auditorium', time: '4:00 PM', child: 'Aarav (Dance) & Meera (Choir)', status: 'Confirmed' },
  { id: 'eu2', event: 'Science Museum Field Trip', date: 'Mar 14, 2026', venue: 'National Science Centre, Delhi', time: '9:00 AM', child: 'Aarav Sharma — Grade 5', status: 'Consent Pending' },
  { id: 'eu3', event: 'Parent-Teacher Meeting', date: 'Mar 8, 2026', venue: 'Meeting Room A', time: '2:30 PM', child: 'Aarav Sharma — Grade 5', status: 'Confirmed' },
  { id: 'eu4', event: 'Inter-School Cricket Tournament', date: 'Mar 22, 2026', venue: 'DPS Sports Complex', time: '8:00 AM', child: 'Aarav Sharma — Grade 5', status: 'Selected' },
  { id: 'eu5', event: 'Grade 2 Art Exhibition', date: 'Mar 28, 2026', venue: 'School Atrium', time: '10:00 AM', child: 'Meera Sharma — Grade 2', status: 'Participating' },
];

/* ── Feedback ── */
const FALLBACK_FEEDBACK_ITEMS = [
  { id: 'fb1', topic: 'School Bus Safety — Route #14', category: 'Transport', submitted: 'Feb 25, 2026', status: 'Under Review', response: '' },
  { id: 'fb2', topic: 'Canteen food quality has improved', category: 'Facilities', submitted: 'Feb 10, 2026', status: 'Acknowledged', response: 'Thank you for your positive feedback. We will continue to maintain quality standards.' },
  { id: 'fb3', topic: 'Request for more parent volunteering opportunities', category: 'Community', submitted: 'Jan 15, 2026', status: 'Resolved', response: 'We have added a volunteer sign-up section to the parent portal. Thank you for your suggestion.' },
];

/* ── Emergency alerts ── */
const FALLBACK_EMERGENCY_ALERTS = [
  { id: 'ea1', title: 'Heavy Rain Advisory — Early Dismissal', date: 'Today, 12:30 PM', severity: 'high', message: 'Due to IMD weather warning for heavy rainfall, school will dismiss at 1:00 PM. School buses will depart at 1:15 PM. Please arrange early pickup if using private transport.', acknowledged: false },
  { id: 'ea2', title: 'Water Supply Disruption — Carry Water Bottles', date: 'Mar 4, 2026', severity: 'medium', message: 'Due to maintenance work, water supply may be limited on March 5. Please ensure children carry sufficient drinking water.', acknowledged: true },
  { id: 'ea3', title: 'COVID-19 Case Advisory — Grade 5 Section B', date: 'Feb 20, 2026', severity: 'high', message: 'A student in Grade 5B has tested positive. Grade 5 parents please monitor for symptoms. No school closure at this time.', acknowledged: true },
];

/* ── Sent messages ── */
const FALLBACK_SENT_MESSAGES = [
  { id: 'sm1', to: 'Mrs. Priya Gupta', subject: 'Aarav will be late tomorrow', date: 'Today', status: 'Delivered' },
  { id: 'sm2', to: 'Ms. Anita Desai', subject: 'Meera\'s allergy medication update', date: 'Yesterday', status: 'Read' },
  { id: 'sm3', to: 'Transport Desk', subject: 'Bus Route #14 — stop timing concern', date: 'Mar 3', status: 'Read' },
  { id: 'sm4', to: 'Mrs. Priya Gupta', subject: 'Request for extra homework for revision', date: 'Mar 1', status: 'Read' },
  { id: 'sm5', to: 'Admin Office', subject: 'Fee receipt copy request', date: 'Feb 28', status: 'Delivered' },
];

const priorityColor: Record<string, string> = {
  high: 'bg-red-500/10 text-red-600',
  medium: 'bg-amber-500/10 text-amber-600',
  low: 'bg-blue-500/10 text-blue-600',
};

export function ParentConciergeComms() {
  const { activeSubNav } = useNavigationStore();
  useAuthStore((s) => s.schoolId);

  const { data: apiMessages } = useParentV2MessageThreads();
  const { data: apiAnnouncements } = useParentV2Announcements();
  const { data: apiEvents } = useParentV2Events();
  const { data: apiFeedback } = useParentV2Feedback();
  const { data: apiNotifications } = useParentV2Notifications();

  const teacherMessages = (apiMessages as any[]) ?? FALLBACK_TEACHER_MESSAGES;
  const schoolNotices = (apiAnnouncements as any[]) ?? FALLBACK_SCHOOL_NOTICES;
  const eventUpdates = (apiEvents as any[]) ?? FALLBACK_EVENT_UPDATES;
  const feedbackItems = (apiFeedback as any[]) ?? FALLBACK_FEEDBACK_ITEMS;
  const emergencyAlerts = (apiNotifications as any[])?.filter((n: any) => n.type === 'EMERGENCY' || n.type === 'ALERT') ?? FALLBACK_EMERGENCY_ALERTS;
  const sentMessages = (apiMessages as any[])?.filter((m: any) => m.direction === 'SENT' || m.sentByMe) ?? FALLBACK_SENT_MESSAGES;

  /* ── Teacher Messages (default) ── */
  if (!activeSubNav || activeSubNav === 'c_teacher_messages') {
    const children = [...new Set(teacherMessages.map((m) => m.child))];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Teacher Messages</h3>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Send className="h-3.5 w-3.5" /> New Message
          </button>
        </div>
        {children.map((child) => (
          <div key={child} className="space-y-2">
            <h4 className="text-xs font-semibold text-primary/80">{child}</h4>
            {teacherMessages.filter((m) => m.child === child).map((m) => (
              <div key={m.id} className={cn(
                'rounded-xl border p-3 dark:border-white/5',
                m.status === 'Unread' ? 'border-primary/20 bg-primary/5' : 'border-border/30 bg-background/70',
              )}>
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-xs font-medium text-foreground">
                    {m.teacher}
                    {m.status === 'Unread' && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />}
                  </h5>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{m.date}</span>
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      m.status === 'Unread' ? 'bg-blue-500/10 text-blue-600'
                        : m.status === 'Read' ? 'bg-zinc-500/10 text-zinc-500'
                        : 'bg-emerald-500/10 text-emerald-600',
                    )}>
                      {m.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-medium text-foreground/90 mb-0.5">{m.subject}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{m.preview}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  /* ── School Notices ── */
  if (activeSubNav === 'c_school_notices') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">School Notices</h3>
        <div className="space-y-2">
          {schoolNotices.map((n) => (
            <div key={n.id} className={cn(
              'rounded-xl border p-3 dark:border-white/5',
              !n.read ? 'border-primary/20 bg-primary/5' : 'border-border/30 bg-background/70',
            )}>
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">
                  {n.title}
                  {!n.read && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />}
                </h5>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', priorityColor[n.priority])}>
                  {n.priority}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                <span>{n.from}</span>
                <span>·</span>
                <span>{n.date}</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2">{n.summary}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Event Updates ── */
  if (activeSubNav === 'c_event_updates') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Upcoming Events</h3>
        <div className="space-y-2">
          {eventUpdates.map((e) => (
            <div key={e.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{e.event}</h5>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  e.status === 'Confirmed' || e.status === 'Selected' || e.status === 'Participating'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-amber-500/10 text-amber-600',
                )}>
                  {e.status}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-0.5">{e.child}</div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{e.date}</span>
                <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{e.time}</span>
                <span>{e.venue}</span>
              </div>
              {e.status === 'Consent Pending' && (
                <button className="mt-2 rounded-lg bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90">
                  Give Consent
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Feedback ── */
  if (activeSubNav === 'c_feedback') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Feedback & Suggestions</h3>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Star className="h-3.5 w-3.5" /> New Feedback
          </button>
        </div>
        <div className="space-y-2">
          {feedbackItems.map((f) => (
            <div key={f.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{f.topic}</h5>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  f.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600'
                    : f.status === 'Acknowledged' ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-amber-500/10 text-amber-600',
                )}>
                  {f.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                <span>{f.category}</span>
                <span>·</span>
                <span>{f.submitted}</span>
              </div>
              {f.response && (
                <div className="mt-1 rounded-lg bg-muted/30 p-2">
                  <p className="text-[10px] text-foreground/80 italic">{f.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Emergency Alerts ── */
  if (activeSubNav === 'c_emergency_alerts') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Emergency Alerts</h3>
        <div className="space-y-2">
          {emergencyAlerts.map((a) => (
            <div key={a.id} className={cn(
              'rounded-xl border p-3 dark:border-white/5',
              a.severity === 'high' && !a.acknowledged
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-border/30 bg-background/70',
            )}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className={cn('h-3.5 w-3.5', a.severity === 'high' ? 'text-red-600' : 'text-amber-600')} />
                  <h5 className="text-xs font-medium text-foreground">{a.title}</h5>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', priorityColor[a.severity])}>
                  {a.severity}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1">{a.date}</p>
              <p className="text-xs text-foreground/80">{a.message}</p>
              {!a.acknowledged && (
                <button className="mt-2 rounded-lg bg-red-600 px-3 py-1 text-[10px] font-medium text-white hover:bg-red-700">
                  Acknowledge
                </button>
              )}
              {a.acknowledged && (
                <span className="mt-2 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                  Acknowledged
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Sent ── */
  if (activeSubNav === 'c_sent') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Sent Messages</h3>
        <div className="space-y-2">
          {sentMessages.map((s) => (
            <div key={s.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">To: {s.to}</h5>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{s.date}</span>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    s.status === 'Read' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600',
                  )}>
                    {s.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-foreground/80">{s.subject}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
