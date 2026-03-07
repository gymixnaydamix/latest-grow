/* Admin Concierge › Settings — Permissions, Snippets, Templates, Routing, Notifications, Audit */
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { Shield, FileText, Route, Eye } from 'lucide-react';
import { useRoles, useTemplates, useSchoolProfile, useSaveSchoolProfile } from '@/hooks/api/use-school-ops';

const FALLBACK_PERMISSIONS = [
  'Send communications', 'Approve discounts', 'Approve refunds',
  'Approve attendance edits', 'Change records', 'Run batch actions',
];

const FALLBACK_SNIPPETS = [
  { id: 'sn1', name: 'Fee reminder', preview: 'Dear Parent, this is a gentle reminder...' },
  { id: 'sn2', name: 'Meeting invite', preview: 'You are invited to attend a meeting...' },
  { id: 'sn3', name: 'Attendance warning', preview: 'We notice your child has been absent...' },
  { id: 'sn4', name: 'Admission response', preview: 'Thank you for your interest in our school...' },
  { id: 'sn5', name: 'Certificate reply', preview: 'Your requested certificate is ready...' },
];

const FALLBACK_ROUTING_RULES = [
  { from: 'Facilities issue', to: 'Facilities queue' },
  { from: 'Finance issue', to: 'Finance queue' },
  { from: 'Transport issue', to: 'Transport owner' },
  { from: 'Academic dispute', to: 'Academic coordinator' },
];

export function AdminConciergeSettings() {
  const { activeSubNav } = useNavigationStore();
  const { schoolId } = useAuthStore();
  const { data: apiRoles } = useRoles(schoolId);
  const { data: apiTemplates } = useTemplates(schoolId);
  const { data: apiProfile } = useSchoolProfile(schoolId);
  useSaveSchoolProfile(schoolId);

  const permissionItems = (apiRoles as any[])?.map((r: any) => r.name ?? r.label ?? r) ?? FALLBACK_PERMISSIONS;
  const snippetItems = (apiTemplates as any[])?.map((t: any) => ({ id: t.id, name: t.name, preview: t.body ?? t.preview ?? '' })) ?? FALLBACK_SNIPPETS;
  const routingRules = ((apiProfile as any)?.routingRules as any[]) ?? FALLBACK_ROUTING_RULES;

  if (activeSubNav === 'c_snippets') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Snippets</h3>
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

  if (activeSubNav === 'c_settings_templates') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Default Templates</h3>
        <p className="text-xs text-muted-foreground">Configure default templates for documents and communications.</p>
        <div className="grid grid-cols-2 gap-3">
          {['Document Generation', 'Announcements', 'Messages', 'Fee Statements'].map((t) => (
            <div key={t} className="rounded-xl border border-border/30 bg-background/70 p-4 dark:border-white/5">
              <FileText className="mb-2 h-5 w-5 text-primary" />
              <h5 className="text-xs font-semibold text-foreground">{t}</h5>
              <button className="mt-2 text-[10px] font-medium text-primary hover:underline">Configure</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubNav === 'c_routing_rules') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Routing Rules</h3>
        <div className="space-y-2">
          {routingRules.map((r, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/70 p-3 text-xs dark:border-white/5">
              <span className="font-medium text-foreground">{r.from}</span>
              <Route className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-primary font-medium">{r.to}</span>
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
        {['Reminders', 'Due alerts', 'Result alerts', 'Escalations'].map((n) => (
          <div key={n} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
            <span className="text-xs font-medium text-foreground">{n}</span>
            <div className="h-5 w-9 rounded-full bg-primary/80 relative">
              <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeSubNav === 'c_audit') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Audit Settings</h3>
        <p className="text-xs text-muted-foreground">Configure retention and visibility of audit events.</p>
        <div className="space-y-2">
          {['Retention period: 2 years', 'Visible to: Admin, Finance Lead', 'Export format: CSV/PDF'].map((r) => (
            <div key={r} className="flex items-center gap-2 rounded-xl border border-border/30 bg-background/70 p-3 text-xs dark:border-white/5">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground">{r}</span>
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
      <p className="text-xs text-muted-foreground">Control who can perform sensitive actions in the concierge.</p>
      <div className="space-y-2">
        {permissionItems.map((p) => (
          <div key={p} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />{p}
            </span>
            <div className="h-5 w-9 rounded-full bg-primary/80 relative">
              <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
