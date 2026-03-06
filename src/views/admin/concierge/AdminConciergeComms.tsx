/* Admin Concierge › Comms — Announcements, Messages, Broadcasts, Templates, Delivery Log */
import { useNavigationStore } from '@/store/navigation.store';
import { ConciergeTemplatePicker } from '@/components/concierge/shared';
import { Megaphone, Eye, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const announcements = [
  { id: 'ca1', title: 'End-of-year ceremony schedule', audience: 'All parents', date: 'Jun 14', status: 'Scheduled' },
  { id: 'ca2', title: 'Summer camp registration open', audience: 'Grade 3-6 parents', date: 'Jun 12', status: 'Sent' },
  { id: 'ca3', title: 'Report card distribution', audience: 'All parents', date: 'Jun 10', status: 'Sent' },
];

const messages = [
  { id: 'cm1', to: 'Mrs. Sara (Parent)', subject: 'Regarding Ahmed attendance', date: 'Jun 13', status: 'Read' },
  { id: 'cm2', to: 'Mr. Tariq (Teacher)', subject: 'Grade 5A attendance correction', date: 'Jun 12', status: 'Delivered' },
  { id: 'cm3', to: 'Finance Team', subject: 'Fee follow-up batch #12', date: 'Jun 11', status: 'Sent' },
];

const broadcasts = [
  { id: 'cb1', title: 'Payment reminder — Q3 invoices', audience: '120 parents', date: 'Jun 13', status: 'Sent', opened: 87 },
  { id: 'cb2', title: 'Transport route changes', audience: '45 parents', date: 'Jun 10', status: 'Sent', opened: 32 },
];

const deliveryLog = [
  { id: 'dl1', title: 'End-of-year ceremony', channel: 'Email + SMS', queued: 210, sent: 210, delivered: 205, failed: 5, opened: 180 },
  { id: 'dl2', title: 'Payment reminder', channel: 'Email', queued: 120, sent: 120, delivered: 118, failed: 2, opened: 87 },
  { id: 'dl3', title: 'Report card distribution', channel: 'In-App + Email', queued: 350, sent: 350, delivered: 348, failed: 2, opened: 290 },
];

const commsTemplates = [
  { id: 'ct1', name: 'Fee Reminder', type: 'Finance', lastUsed: 'Yesterday', fieldCount: 4 },
  { id: 'ct2', name: 'Meeting Invitation', type: 'Meeting', lastUsed: '3 days ago', fieldCount: 5 },
  { id: 'ct3', name: 'Attendance Warning', type: 'Attendance', lastUsed: '1 week ago', fieldCount: 3 },
  { id: 'ct4', name: 'Admission Response', type: 'Admission', lastUsed: '2 days ago', fieldCount: 4 },
];

export function AdminConciergeComms() {
  const { activeSubNav } = useNavigationStore();

  if (activeSubNav === 'c_messages') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Messages</h3>
        <div className="space-y-2">
          {messages.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div>
                <h5 className="text-xs font-medium text-foreground">{m.subject}</h5>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>To: {m.to}</span><span>{m.date}</span>
                </div>
              </div>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                m.status === 'Read' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600',
              )}>{m.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubNav === 'c_broadcasts') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Broadcasts</h3>
        <div className="space-y-2">
          {broadcasts.map((b) => (
            <div key={b.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{b.title}</h5>
                <span className="text-[10px] text-muted-foreground">{b.date}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{b.audience}</span>
                <span className="inline-flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{b.opened} opened</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubNav === 'c_comms_templates') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Communication Templates</h3>
        <ConciergeTemplatePicker templates={commsTemplates} />
      </div>
    );
  }

  if (activeSubNav === 'c_delivery_log') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Delivery Log</h3>
        <div className="space-y-2">
          {deliveryLog.map((d) => (
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

  /* Default: Announcements */
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
                <span>{a.audience}</span><span>{a.date}</span>
              </div>
            </div>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
              a.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600',
            )}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
