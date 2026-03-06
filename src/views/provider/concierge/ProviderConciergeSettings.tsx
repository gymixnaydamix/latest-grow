/* Provider Concierge › Settings — Permissions, Routing Rules, Templates & Snippets, Execution Policies, Notifications, Audit Rules */
import { useNavigationStore } from '@/store/navigation.store';
import { Shield, Route } from 'lucide-react';
import { cn } from '@/lib/utils';

const permissionItems = [
  { label: 'Suspend tenants', description: 'Freeze module access and pause billing for a tenant', scope: 'Provider Admin' },
  { label: 'Change plans', description: 'Upgrade, downgrade, or modify tenant subscription plans', scope: 'Provider Admin, Finance Lead' },
  { label: 'Push releases', description: 'Promote builds to staging and production environments', scope: 'Release Manager' },
  { label: 'Toggle feature flags', description: 'Enable or disable feature flags across tenant scopes', scope: 'Product Lead, Release Manager' },
  { label: 'Export tenant data', description: 'Generate data exports for compliance or migration', scope: 'Provider Admin, Data Ops' },
  { label: 'Delete tenant data', description: 'Permanently remove tenant data per GDPR/compliance requests', scope: 'Provider Admin (requires 2FA)' },
  { label: 'Resolve incidents', description: 'Close active incidents and publish post-mortems', scope: 'Incident Commander, Provider Admin' },
  { label: 'Manage billing configuration', description: 'Configure payment gateways, retry policies, and invoice templates', scope: 'Finance Lead' },
];

const routingRules = [
  { from: 'Billing issue', to: 'Finance queue', condition: 'Auto-route on invoice/payment keywords' },
  { from: 'Module error', to: 'Tier 2 — Platform Support', condition: 'Severity >= High' },
  { from: 'Security alert', to: 'Security Ops', condition: 'Immediate — all alerts' },
  { from: 'Data request', to: 'Data Ops Team', condition: 'GDPR/compliance tagged' },
  { from: 'Tenant onboarding', to: 'Onboarding Specialist', condition: 'New tenant provisioned' },
  { from: 'Performance issue', to: 'DevOps', condition: 'Latency > 500ms or error rate > 1%' },
];

const snippetItems = [
  { id: 'sn1', name: 'Suspension notice', preview: 'Your account has been flagged for suspension due to...' },
  { id: 'sn2', name: 'Billing follow-up', preview: 'This is a reminder that your invoice dated...' },
  { id: 'sn3', name: 'Incident acknowledgment', preview: 'We are aware of the issue affecting your...' },
  { id: 'sn4', name: 'Release announcement', preview: 'We are pleased to announce version...' },
  { id: 'sn5', name: 'Data export confirmation', preview: 'Your requested data export is now available...' },
  { id: 'sn6', name: 'Onboarding next steps', preview: 'Welcome to the platform. Here are your next...' },
];

const executionPolicies = [
  { label: 'Require 2FA for destructive actions', description: 'Data deletion, tenant suspension, and plan downgrades', enabled: true },
  { label: 'Dual approval for production releases', description: 'Requires Release Manager + Provider Admin sign-off', enabled: true },
  { label: 'Auto-rollback on critical error rate', description: 'Trigger rollback if error rate exceeds 5% within 15 minutes post-deploy', enabled: true },
  { label: 'Rate-limit tenant API calls', description: 'Enforce per-tenant API quotas based on plan tier', enabled: true },
  { label: 'Auto-suspend on billing failure', description: 'Suspend tenant after 3 consecutive failed payment retries', enabled: false },
  { label: 'Require impact preview before execution', description: 'Force impact analysis display before confirming bulk actions', enabled: true },
];

const notificationPrefs = [
  { label: 'Billing failures', channel: 'Email + Slack', enabled: true },
  { label: 'SLA breach warnings', channel: 'Email + SMS', enabled: true },
  { label: 'Incident declarations', channel: 'Email + Slack + SMS', enabled: true },
  { label: 'Release promotions', channel: 'Slack', enabled: true },
  { label: 'Security alerts', channel: 'Email + SMS (immediate)', enabled: true },
  { label: 'Tenant onboarding milestones', channel: 'Email', enabled: false },
  { label: 'Feature flag changes', channel: 'Slack', enabled: true },
  { label: 'Data export completions', channel: 'Email', enabled: false },
];

const auditRules = [
  { label: 'Retention period', value: '3 years', description: 'All audit events retained for compliance' },
  { label: 'Visible to', value: 'Provider Admin, Compliance Officer', description: 'Role-based access to audit trail' },
  { label: 'Export format', value: 'CSV / JSON / PDF', description: 'Supported formats for audit export' },
  { label: 'Immutable logging', value: 'Enabled', description: 'Audit records cannot be modified or deleted' },
  { label: 'Real-time streaming', value: 'SIEM integration', description: 'Events streamed to external SIEM platform' },
  { label: 'PII masking', value: 'Enabled', description: 'Personally identifiable information masked in logs by default' },
];

export function ProviderConciergeSettings() {
  const { activeSubNav } = useNavigationStore();

  if (activeSubNav === 'c_routing_rules') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Routing Rules</h3>
        <p className="text-xs text-muted-foreground">Define how incoming tickets and alerts are routed to the appropriate team.</p>
        <div className="space-y-2">
          {routingRules.map((r, i) => (
            <div key={i} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-medium text-foreground">{r.from}</span>
                <Route className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium text-primary">{r.to}</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{r.condition}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubNav === 'c_templates_snippets') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Templates & Snippets</h3>
        <p className="text-xs text-muted-foreground">Reusable templates and text snippets for communications and notices.</p>
        <div className="space-y-2">
          {snippetItems.map((s) => (
            <div key={s.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <h5 className="text-xs font-semibold text-foreground">{s.name}</h5>
              <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">{s.preview}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubNav === 'c_execution_policies') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Execution Policies</h3>
        <p className="text-xs text-muted-foreground">Guardrails and safety policies applied to sensitive platform operations.</p>
        <div className="space-y-2">
          {executionPolicies.map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div>
                <span className="text-xs font-medium text-foreground">{p.label}</span>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{p.description}</p>
              </div>
              <div className={cn('h-5 w-9 rounded-full relative transition-colors', p.enabled ? 'bg-primary/80' : 'bg-zinc-300 dark:bg-zinc-700')}>
                <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', p.enabled ? 'right-0.5' : 'left-0.5')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubNav === 'c_notifications') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
        <p className="text-xs text-muted-foreground">Configure how and when you receive notifications for platform events.</p>
        <div className="space-y-2">
          {notificationPrefs.map((n, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div>
                <span className="text-xs font-medium text-foreground">{n.label}</span>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{n.channel}</p>
              </div>
              <div className={cn('h-5 w-9 rounded-full relative transition-colors', n.enabled ? 'bg-primary/80' : 'bg-zinc-300 dark:bg-zinc-700')}>
                <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', n.enabled ? 'right-0.5' : 'left-0.5')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubNav === 'c_audit_rules') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Audit Rules</h3>
        <p className="text-xs text-muted-foreground">Configure retention, access, and export settings for the provider audit trail.</p>
        <div className="space-y-2">
          {auditRules.map((r, i) => (
            <div key={i} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{r.label}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{r.value}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* Default: Permissions */
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Permissions</h3>
      <p className="text-xs text-muted-foreground">Control which roles can perform sensitive platform operations through the concierge.</p>
      <div className="space-y-2">
        {permissionItems.map((p, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />{p.label}
              </span>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{p.description}</p>
              <span className="mt-1 inline-block rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">{p.scope}</span>
            </div>
            <div className="h-5 w-9 rounded-full bg-primary/80 relative">
              <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
