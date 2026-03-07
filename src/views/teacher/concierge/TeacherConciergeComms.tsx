/* Teacher Concierge › Comms — Parent Notes, Announcements, Messages, Meeting Requests, Templates, Sent Log */
import { useNavigationStore } from '@/store/navigation.store';
import { ConciergeTemplatePicker } from '@/components/concierge/shared';
import { Send, Megaphone, Calendar, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTeacherMessages, useTeacherAnnouncements, useTeacherMeetings, useScheduleMeeting } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';

/* ── Parent notes ── */
const FALLBACK_PARENT_NOTES = [
  { id: 'pn1', parent: 'Mrs. Sara Al-Farsi', student: 'Omar Al-Farsi', subject: 'Homework completion has dropped this week', date: 'Today', status: 'Unread', priority: 'high' },
  { id: 'pn2', parent: 'Mr. Hasan Yousef', student: 'Khalid Yousef', subject: 'Son was sick — will be back Monday', date: 'Today', status: 'Read', priority: 'medium' },
  { id: 'pn3', parent: 'Mrs. Layla Bakr', student: 'Amira Bakr', subject: 'Request for extra study materials for math', date: 'Yesterday', status: 'Replied', priority: 'low' },
  { id: 'pn4', parent: 'Mr. Ahmed Noor', student: 'Hassan Noor', subject: 'Concerned about son\u2019s declining grades', date: 'Yesterday', status: 'Unread', priority: 'high' },
  { id: 'pn5', parent: 'Mrs. Fatima Saleh', student: 'Amina Saleh', subject: 'Thank you for the extra tutoring support', date: 'Jun 10', status: 'Read', priority: 'low' },
];

/* ── Announcements ── */
const FALLBACK_ANNOUNCEMENTS = [
  { id: 'ca1', title: 'Unit 5 test rescheduled to Thursday', audience: 'Grade 5A parents', date: 'Today', status: 'Sent' },
  { id: 'ca2', title: 'Science fair project guidelines', audience: 'Grade 4C parents', date: 'Yesterday', status: 'Sent' },
  { id: 'ca3', title: 'Report card distribution next Friday', audience: 'All my classes', date: 'Jun 10', status: 'Scheduled' },
  { id: 'ca4', title: 'Summer reading list available', audience: 'Grade 5A & 5B parents', date: 'Jun 8', status: 'Sent' },
];

/* ── Direct messages ── */
const FALLBACK_MESSAGES = [
  { id: 'dm1', with: 'Mrs. Sara Al-Farsi', lastMessage: 'I will follow up with Omar tonight about the homework.', date: 'Today', unread: true },
  { id: 'dm2', with: 'Mr. Hasan Yousef', lastMessage: 'Thank you for letting me know. Wishing Khalid a quick recovery.', date: 'Today', unread: false },
  { id: 'dm3', with: 'Ms. Rania (Co-teacher)', lastMessage: 'Can you cover my 10:30 slot on Friday?', date: 'Yesterday', unread: true },
  { id: 'dm4', with: 'Mr. Ahmed Noor', lastMessage: 'Let\u2019s schedule a meeting to discuss Hassan\u2019s progress.', date: 'Yesterday', unread: false },
];

/* ── Meeting requests ── */
const FALLBACK_MEETING_REQUESTS = [
  { id: 'mr1', parent: 'Mrs. Sara Al-Farsi', student: 'Omar Al-Farsi', topic: 'Behaviour and homework concerns', requested: 'Jun 12', proposed: 'Jun 14, 2:00 PM', status: 'Confirmed' },
  { id: 'mr2', parent: 'Mr. Ahmed Noor', student: 'Hassan Noor', topic: 'Declining grades in mathematics', requested: 'Jun 11', proposed: 'Jun 16, 3:00 PM', status: 'Pending' },
  { id: 'mr3', parent: 'Mrs. Fatima Saleh', student: 'Amina Saleh', topic: 'Gifted program recommendation', requested: 'Jun 9', proposed: 'Jun 13, 1:00 PM', status: 'Confirmed' },
  { id: 'mr4', parent: 'Mrs. Layla Bakr', student: 'Amira Bakr', topic: 'Attendance improvement plan', requested: 'Jun 8', proposed: '', status: 'Awaiting teacher slot' },
];

/* ── Sent log ── */
const FALLBACK_SENT_LOG = [
  { id: 'sl1', title: 'Unit 5 test rescheduled', channel: 'In-App + Email', queued: 30, sent: 30, delivered: 29, failed: 1, opened: 25 },
  { id: 'sl2', title: 'Science fair guidelines', channel: 'Email', queued: 28, sent: 28, delivered: 28, failed: 0, opened: 22 },
  { id: 'sl3', title: 'Report card distribution', channel: 'In-App', queued: 120, sent: 0, delivered: 0, failed: 0, opened: 0 },
  { id: 'sl4', title: 'Summer reading list', channel: 'Email + SMS', queued: 60, sent: 60, delivered: 58, failed: 2, opened: 45 },
];

/* ── Templates ── */
const FALLBACK_COMMS_TEMPLATES = [
  { id: 'ct1', name: 'Homework Reminder', type: 'Parent Note', lastUsed: 'Yesterday', fieldCount: 3 },
  { id: 'ct2', name: 'Meeting Invitation', type: 'Meeting', lastUsed: '3 days ago', fieldCount: 5 },
  { id: 'ct3', name: 'Progress Update', type: 'Report', lastUsed: '1 week ago', fieldCount: 4 },
  { id: 'ct4', name: 'Behaviour Notice', type: 'Behaviour', lastUsed: '2 days ago', fieldCount: 4 },
  { id: 'ct5', name: 'Absence Follow-up', type: 'Attendance', lastUsed: 'Today', fieldCount: 3 },
];

export function TeacherConciergeComms() {
  const { activeSubNav } = useNavigationStore();
  const { data: apiMessages } = useTeacherMessages();
  const { data: apiAnnouncements } = useTeacherAnnouncements();
  const { data: apiMeetings } = useTeacherMeetings();
  const scheduleMeeting = useScheduleMeeting();

  const parentNotes = (apiMessages as any)?.parentNotes ?? FALLBACK_PARENT_NOTES;
  const announcements = (apiAnnouncements as any[]) ?? FALLBACK_ANNOUNCEMENTS;
  const messages = (apiMessages as any)?.threads ?? FALLBACK_MESSAGES;
  const meetingRequests = (apiMeetings as any[]) ?? FALLBACK_MEETING_REQUESTS;
  const sentLog = (apiMessages as any)?.sentLog ?? FALLBACK_SENT_LOG;
  const commsTemplates = (apiMessages as any)?.templates ?? FALLBACK_COMMS_TEMPLATES;

  /* ── Parent Notes (default) ── */
  if (!activeSubNav || activeSubNav === 'c_parent_notes') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Parent Notes</h3>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Send className="h-3.5 w-3.5" /> New Note
          </button>
        </div>
        <div className="space-y-2">
          {parentNotes.map((n: any) => (
            <div key={n.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{n.parent}</h5>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{n.date}</span>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-medium',
                    n.status === 'Unread' ? 'bg-blue-500/10 text-blue-600'
                      : n.status === 'Read' ? 'bg-zinc-500/10 text-zinc-500'
                      : 'bg-emerald-500/10 text-emerald-600',
                  )}>
                    {n.status}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground mb-0.5">Re: {n.student}</div>
              <p className="text-xs text-foreground/80">{n.subject}</p>
              {n.priority === 'high' && (
                <span className="mt-1 inline-block rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600">
                  High Priority
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Announcements ── */
  if (activeSubNav === 'c_announcements') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Announcements</h3>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Megaphone className="h-3.5 w-3.5" /> New Announcement
          </button>
        </div>
        <div className="space-y-2">
          {announcements.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div>
                <h5 className="text-xs font-medium text-foreground">{a.title}</h5>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{a.audience}</span>
                  <span>{a.date}</span>
                </div>
              </div>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium',
                a.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600',
              )}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Messages ── */
  if (activeSubNav === 'c_messages') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Messages</h3>
        <div className="space-y-2">
          {messages.map((m: any) => (
            <div key={m.id} className={cn(
              'rounded-xl border p-3 dark:border-white/5',
              m.unread ? 'border-primary/20 bg-primary/5' : 'border-border/30 bg-background/70',
            )}>
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">
                  {m.with}
                  {m.unread && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />}
                </h5>
                <span className="text-[10px] text-muted-foreground">{m.date}</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-1">{m.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Meeting Requests ── */
  if (activeSubNav === 'c_meeting_requests') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Parent-Teacher Meeting Requests</h3>
        <div className="space-y-2">
          {meetingRequests.map((m) => (
            <div key={m.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{m.parent}</h5>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  m.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-600'
                    : m.status === 'Pending' ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-blue-500/10 text-blue-600',
                )}>{m.status}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-0.5">Student: {m.student}</div>
              <p className="text-xs text-foreground/80 mb-1">{m.topic}</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />Requested: {m.requested}</span>
                {m.proposed && (
                  <span className="inline-flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{m.proposed}</span>
                )}
              </div>
              {m.status === 'Pending' && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="rounded-lg bg-emerald-600 px-3 py-1 text-[10px] font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    disabled={scheduleMeeting.isPending}
                    onClick={() => {
                      scheduleMeeting.mutate(
                        { title: m.topic, type: 'parent-teacher', date: m.proposed?.split(',')[0] ?? '', startTime: m.proposed?.split(', ')[1] ?? '', endTime: '', location: 'School', attendees: m.parent, notes: m.topic },
                        { onSuccess: () => notifySuccess('Meeting confirmed') },
                      );
                    }}
                  >
                    Confirm
                  </button>
                  <button className="rounded-lg border border-border/50 px-3 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60">Reschedule</button>
                </div>
              )}
              {m.status === 'Awaiting teacher slot' && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="rounded-lg bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    disabled={scheduleMeeting.isPending}
                    onClick={() => {
                      scheduleMeeting.mutate(
                        { title: m.topic, type: 'parent-teacher', date: '', startTime: '', endTime: '', location: 'School', attendees: m.parent },
                        { onSuccess: () => notifySuccess('Time proposed') },
                      );
                    }}
                  >
                    Propose Time
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Templates ── */
  if (activeSubNav === 'c_comms_templates') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Communication Templates</h3>
        <ConciergeTemplatePicker templates={commsTemplates} />
      </div>
    );
  }

  /* ── Sent Log ── */
  if (activeSubNav === 'c_sent_log') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Sent Log</h3>
        <div className="space-y-2">
          {sentLog.map((d: any) => (
            <div key={d.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-medium text-foreground">{d.title}</h5>
                <span className="text-[10px] text-muted-foreground">{d.channel}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="text-muted-foreground">Queued: <b className="text-foreground">{d.queued}</b></span>
                <span className="text-muted-foreground">Sent: <b className="text-foreground">{d.sent}</b></span>
                <span className="text-emerald-600">Delivered: <b>{d.delivered}</b></span>
                <span className="text-red-500">Failed: <b>{d.failed}</b></span>
                <span className="text-blue-500">Opened: <b>{d.opened}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
