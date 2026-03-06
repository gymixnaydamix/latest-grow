/* Provider Concierge › Comms — Broadcasts, Tenant Notices, Release Notes, Incident Updates, Templates, Delivery Log */
import { useNavigationStore } from '@/store/navigation.store';
import { ConciergeTemplatePicker } from '@/components/concierge/shared';
import { Megaphone, Bell, Eye, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const broadcasts = [
  { id: 'pb1', title: 'Platform maintenance window — March 8', audience: 'All tenants (8)', date: 'Mar 5', status: 'Scheduled', opened: 0 },
  { id: 'pb2', title: 'New billing portal available', audience: 'All tenants (8)', date: 'Mar 3', status: 'Sent', opened: 6 },
  { id: 'pb3', title: 'Q4 performance report published', audience: 'Enterprise tenants (3)', date: 'Feb 28', status: 'Sent', opened: 3 },
];

const tenantNotices = [
  { id: 'pn1', tenant: 'Bright Minds K-12', subject: 'Account suspension warning — 7 day grace period', date: 'Mar 5', status: 'Delivered', urgent: true },
  { id: 'pn2', tenant: 'Horizon Learning Center', subject: 'Invoice overdue — billing retry scheduled', date: 'Mar 4', status: 'Read', urgent: true },
  { id: 'pn3', tenant: 'Sunrise Montessori', subject: 'Support ticket escalation response', date: 'Mar 4', status: 'Read', urgent: false },
  { id: 'pn4', tenant: 'Cedar Grove School', subject: 'Onboarding milestone — data migration complete', date: 'Mar 3', status: 'Delivered', urgent: false },
  { id: 'pn5', tenant: 'Little Stars Preschool', subject: 'Trial extension approved — 14 additional days', date: 'Mar 2', status: 'Read', urgent: false },
];

const releaseNotes = [
  { id: 'rn1', version: 'v2.14.0', title: 'Billing retry improvements & UI polish', date: 'Mar 1', tenants: 'All tenants', highlights: '3 bug fixes, 2 enhancements' },
  { id: 'rn2', version: 'v2.13.2', title: 'Attendance module hotfix', date: 'Feb 22', tenants: 'All tenants', highlights: '1 critical fix' },
  { id: 'rn3', version: 'v2.13.0', title: 'Parent portal widgets & transport tracking', date: 'Feb 15', tenants: 'All tenants', highlights: '8 features, 5 fixes' },
];

const incidentUpdates = [
  { id: 'iu1', incident: 'INC-047', title: 'API rate-limit breach — resolved', severity: 'Critical', date: 'Mar 5', status: 'Resolved', affectedTenants: ['Horizon Learning Center'] },
  { id: 'iu2', incident: 'INC-046', title: 'Payment gateway intermittent failures', severity: 'High', date: 'Mar 3', status: 'Monitoring', affectedTenants: ['Greenfield Academy', 'Al-Noor International'] },
  { id: 'iu3', incident: 'INC-045', title: 'Staging environment outage', severity: 'Medium', date: 'Feb 28', status: 'Closed', affectedTenants: [] },
];

const commsTemplates = [
  { id: 'ct1', name: 'Maintenance Window Notice', type: 'Platform', lastUsed: 'Yesterday', fieldCount: 5 },
  { id: 'ct2', name: 'Billing Reminder', type: 'Finance', lastUsed: '3 days ago', fieldCount: 4 },
  { id: 'ct3', name: 'Release Notes', type: 'Development', lastUsed: '1 week ago', fieldCount: 6 },
  { id: 'ct4', name: 'Incident Notification', type: 'Operations', lastUsed: '2 days ago', fieldCount: 5 },
  { id: 'ct5', name: 'Onboarding Welcome', type: 'Tenant', lastUsed: '4 days ago', fieldCount: 4 },
  { id: 'ct6', name: 'Suspension Warning', type: 'Compliance', lastUsed: '1 week ago', fieldCount: 3 },
];

const deliveryLog = [
  { id: 'dl1', title: 'Platform maintenance window', channel: 'Email + In-App', queued: 8, sent: 8, delivered: 8, failed: 0, opened: 6 },
  { id: 'dl2', title: 'Billing portal announcement', channel: 'Email', queued: 8, sent: 8, delivered: 7, failed: 1, opened: 6 },
  { id: 'dl3', title: 'Account suspension warning', channel: 'Email + SMS', queued: 1, sent: 1, delivered: 1, failed: 0, opened: 1 },
  { id: 'dl4', title: 'Incident INC-047 notification', channel: 'Email + In-App + SMS', queued: 1, sent: 1, delivered: 1, failed: 0, opened: 1 },
  { id: 'dl5', title: 'Release notes v2.14.0', channel: 'In-App', queued: 8, sent: 8, delivered: 8, failed: 0, opened: 5 },
];

export function ProviderConciergeComms() {
  const { activeSubNav } = useNavigationStore();

  if (activeSubNav === 'c_tenant_notices') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Tenant Notices</h3>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Bell className="h-3.5 w-3.5" /> New Notice
          </button>
        </div>
        <div className="space-y-2">
          {tenantNotices.map((n) => (
            <div key={n.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{n.subject}</h5>
                {n.urgent && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600">Urgent</span>}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5"><Building2 className="h-2.5 w-2.5" />{n.tenant}</span>
                <span>{n.date}</span>
                <span className={cn(
                  'rounded-full px-2 py-0.5 font-medium',
                  n.status === 'Read' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600',
                )}>{n.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubNav === 'c_release_notes') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Release Notes</h3>
        <div className="space-y-2">
          {releaseNotes.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">{r.version}</span>
                  <h5 className="text-xs font-medium text-foreground">{r.title}</h5>
                </div>
                <span className="text-[10px] text-muted-foreground">{r.date}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{r.tenants}</span>
                <span>{r.highlights}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubNav === 'c_incident_updates') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Incident Updates</h3>
        <div className="space-y-2">
          {incidentUpdates.map((i) => (
            <div key={i.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">{i.incident}</span>
                  <h5 className="text-xs font-medium text-foreground">{i.title}</h5>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                  i.severity === 'Critical' ? 'bg-red-500/10 text-red-600' :
                  i.severity === 'High' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600',
                )}>{i.severity}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>{i.date}</span>
                <span className={cn('rounded-full px-2 py-0.5 font-medium',
                  i.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-600' :
                  i.status === 'Monitoring' ? 'bg-amber-500/10 text-amber-600' : 'bg-zinc-500/10 text-zinc-500',
                )}>{i.status}</span>
                {i.affectedTenants.length > 0 && (
                  <span className="inline-flex items-center gap-0.5"><Building2 className="h-2.5 w-2.5" />{i.affectedTenants.join(', ')}</span>
                )}
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

  /* Default: Broadcasts */
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Broadcasts</h3>
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          <Megaphone className="h-3.5 w-3.5" /> New Broadcast
        </button>
      </div>
      <div className="space-y-2">
        {broadcasts.map((b) => (
          <div key={b.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-xs font-medium text-foreground">{b.title}</h5>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                b.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600',
              )}>{b.status}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{b.audience}</span>
              <span>{b.date}</span>
              {b.opened > 0 && <span className="inline-flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" />{b.opened} opened</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
