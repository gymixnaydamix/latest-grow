/* Provider Concierge › Operations — Support Desk, Requests & Escalations, Incidents, Data Ops, Security & Compliance, Audit Center */
import { useNavigationStore } from '@/store/navigation.store';
import { useState } from 'react';
import { ConciergeSplitPreviewPanel, ConciergePermissionBadge, ConciergeAuditNotice } from '@/components/concierge/shared';
import { Clock, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Ticket {
  id: string;
  title: string;
  tenant: string;
  category: 'Support' | 'Escalation' | 'Incident' | 'Data Request' | 'Security' | 'Audit';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  sla: string;
  slaBreached: boolean;
  assignee: string;
  status: 'Open' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';
  created: string;
  summary: string;
  affectedUsers?: number;
}

const tickets: Ticket[] = [
  {
    id: 'OPS-1001', title: 'Enrollment module data inconsistency', tenant: 'Sunrise Montessori',
    category: 'Escalation', severity: 'Critical', sla: '2h remaining', slaBreached: false,
    assignee: 'Tier 3 — Platform Engineering', status: 'In Progress', created: '2h ago',
    summary: 'Student records showing duplicate entries after bulk import. 47 records affected. Parent portal displaying incorrect enrollment status for 12 students.',
    affectedUsers: 47,
  },
  {
    id: 'OPS-1002', title: 'Payment gateway timeout errors', tenant: 'Greenfield Academy',
    category: 'Support', severity: 'High', sla: '4h remaining', slaBreached: false,
    assignee: 'Tier 2 — Finance Support', status: 'Open', created: '3h ago',
    summary: 'Parents reporting intermittent payment failures during checkout. Gateway returning 504 errors under load. Approximately 15 failed transactions in the last hour.',
    affectedUsers: 15,
  },
  {
    id: 'OPS-1003', title: 'API rate-limit breach — production', tenant: 'Horizon Learning Center',
    category: 'Incident', severity: 'Critical', sla: 'Breached', slaBreached: true,
    assignee: 'Incident Commander — DevOps', status: 'In Progress', created: '6h ago',
    summary: 'Third-party integration exceeding rate limits causing cascading 429 errors. Auto-scaled but monitoring shows continued pressure. Tenant API calls throttled to 50%.',
    affectedUsers: 2100,
  },
  {
    id: 'OPS-1004', title: 'GDPR data export request', tenant: 'Al-Noor International',
    category: 'Data Request', severity: 'Medium', sla: '48h remaining', slaBreached: false,
    assignee: 'Data Ops Team', status: 'Open', created: '1 day ago',
    summary: 'Tenant requested full data export for compliance audit. Includes student records, financial data, and communication logs. Estimated 2.4 GB export.',
  },
  {
    id: 'OPS-1005', title: 'Attendance module login failure', tenant: 'Little Stars Preschool',
    category: 'Support', severity: 'Medium', sla: '6h remaining', slaBreached: false,
    assignee: 'Tier 1 — General Support', status: 'Waiting', created: '5h ago',
    summary: 'Teachers unable to access attendance module after recent update. SSO token refresh failing for 3 out of 8 teacher accounts. Workaround provided — direct login.',
    affectedUsers: 3,
  },
  {
    id: 'OPS-1006', title: 'Suspicious login attempts detected', tenant: 'Bright Minds K-12',
    category: 'Security', severity: 'High', sla: '1h remaining', slaBreached: false,
    assignee: 'Security Ops', status: 'In Progress', created: '45 min ago',
    summary: '142 failed login attempts from 3 IP ranges in the last 30 minutes. Automated geo-blocking triggered. Tenant admin notified. No successful breaches detected.',
  },
  {
    id: 'OPS-1007', title: 'Compliance audit trail generation', tenant: 'Greenfield Academy',
    category: 'Audit', severity: 'Low', sla: '72h remaining', slaBreached: false,
    assignee: 'Compliance Team', status: 'Open', created: '2 days ago',
    summary: 'Scheduled quarterly audit trail export for regulatory review. Covers all admin actions, data modifications, and access logs for Q4 period.',
  },
  {
    id: 'OPS-1008', title: 'Billing discrepancy escalation', tenant: 'Horizon Learning Center',
    category: 'Escalation', severity: 'High', sla: '3h remaining', slaBreached: false,
    assignee: 'Tier 2 — Finance Support', status: 'Open', created: '4h ago',
    summary: 'Tenant reporting $2,400 overcharge on last invoice. Module usage calculation appears incorrect for HR module. Finance team review required.',
  },
];

const severityColor: Record<string, string> = {
  Low: 'bg-zinc-500/10 text-zinc-500',
  Medium: 'bg-blue-500/10 text-blue-600',
  High: 'bg-amber-500/10 text-amber-600',
  Critical: 'bg-red-500/10 text-red-600',
};

const statusColor: Record<string, string> = {
  Open: 'bg-blue-500/10 text-blue-600',
  'In Progress': 'bg-amber-500/10 text-amber-600',
  Waiting: 'bg-violet-500/10 text-violet-600',
  Resolved: 'bg-emerald-500/10 text-emerald-600',
  Closed: 'bg-zinc-500/10 text-zinc-500',
};

export function ProviderConciergeOps() {
  const { activeSubNav } = useNavigationStore();
  const [selected, setSelected] = useState<Ticket | null>(tickets[0] ?? null);

  const filtered = (() => {
    switch (activeSubNav) {
      case 'c_requests_escalations': return tickets.filter((t) => t.category === 'Escalation');
      case 'c_incidents': return tickets.filter((t) => t.category === 'Incident');
      case 'c_data_ops': return tickets.filter((t) => t.category === 'Data Request');
      case 'c_security_compliance': return tickets.filter((t) => t.category === 'Security');
      case 'c_audit_center': return tickets.filter((t) => t.category === 'Audit');
      default: return tickets;
    }
  })();

  const queue = (
    <div className="space-y-2">
      {filtered.map((t) => (
        <button
          key={t.id}
          onClick={() => setSelected(t)}
          className={cn(
            'flex w-full flex-col gap-1.5 rounded-xl border p-3 text-left transition',
            selected?.id === t.id
              ? 'border-primary/30 bg-primary/5'
              : 'border-border/30 bg-background/70 hover:bg-muted/40 dark:border-white/5',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground">{t.id}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', severityColor[t.severity])}>
              {t.severity}
            </span>
          </div>
          <h5 className="text-xs font-medium text-foreground">{t.title}</h5>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5"><Building2 className="h-2.5 w-2.5" />{t.tenant}</span>
            <span className={cn('inline-flex items-center gap-0.5', t.slaBreached ? 'text-red-500 font-medium' : '')}>
              <Clock className="h-2.5 w-2.5" />{t.sla}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusColor[t.status])}>{t.status}</span>
          </div>
        </button>
      ))}
      {filtered.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No tickets in this view</p>}
    </div>
  );

  const detail = selected ? (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">{selected.id}</span>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', severityColor[selected.severity])}>{selected.severity}</span>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusColor[selected.status])}>{selected.status}</span>
        </div>
        <h4 className="mt-1 text-sm font-semibold text-foreground">{selected.title}</h4>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-0.5"><Building2 className="h-3 w-3" />{selected.tenant}</span>
          <span>·</span>
          <span>{selected.created}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border/30 bg-background/70 p-2.5 dark:border-white/5">
          <div className="text-[10px] text-muted-foreground">SLA</div>
          <div className={cn('text-xs font-semibold', selected.slaBreached ? 'text-red-500' : 'text-foreground')}>
            {selected.sla}
          </div>
        </div>
        <div className="rounded-xl border border-border/30 bg-background/70 p-2.5 dark:border-white/5">
          <div className="text-[10px] text-muted-foreground">Assignee</div>
          <div className="text-xs font-semibold text-foreground">{selected.assignee}</div>
        </div>
        {selected.affectedUsers && (
          <div className="rounded-xl border border-border/30 bg-background/70 p-2.5 dark:border-white/5">
            <div className="text-[10px] text-muted-foreground">Affected Users</div>
            <div className="text-xs font-semibold text-foreground">{selected.affectedUsers.toLocaleString()}</div>
          </div>
        )}
        <div className="rounded-xl border border-border/30 bg-background/70 p-2.5 dark:border-white/5">
          <div className="text-[10px] text-muted-foreground">Category</div>
          <div className="text-xs font-semibold text-foreground">{selected.category}</div>
        </div>
      </div>

      <div>
        <h5 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Summary</h5>
        <p className="text-xs leading-relaxed text-muted-foreground">{selected.summary}</p>
      </div>

      <ConciergePermissionBadge granted label="Operations permission active" />
      <ConciergeAuditNotice message="All operations actions are recorded in the audit trail" />

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">Assign</button>
        <button className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">Resolve</button>
        <button className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700">Escalate</button>
        <button className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60">Add Note</button>
        <button className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60">Notify Tenant</button>
        <button className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60">View Timeline</button>
      </div>
    </div>
  ) : <p className="py-8 text-center text-xs text-muted-foreground">Select a ticket to view details</p>;

  const leftLabel = (() => {
    switch (activeSubNav) {
      case 'c_requests_escalations': return 'Requests & Escalations';
      case 'c_incidents': return 'Incidents';
      case 'c_data_ops': return 'Data Ops';
      case 'c_security_compliance': return 'Security & Compliance';
      case 'c_audit_center': return 'Audit Center';
      default: return 'Support Desk';
    }
  })();

  return (
    <ConciergeSplitPreviewPanel left={queue} right={detail} leftLabel={leftLabel} rightLabel="Ticket Detail" />
  );
}
