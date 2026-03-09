/* ─── ProviderSettingsSection ─── Defaults · Notifications · SLA · Legal · Email Templates · Appearance ─── */
import { useState } from 'react';
import {
  Bell, Check, Clock, ClipboardList, Code, Copy,
  Eye, EyeOff, FileClock, FolderOpen, Globe, Layout, Loader2, Mail, Moon,
  Paintbrush, PlusCircle, Settings, Sun,
  ToggleLeft, ToggleRight, Trash2, Variable,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderGeneralConfig,
  useUpdateProviderGeneralConfig,
  useProviderProvisioningRules,
  useUpdateProviderProvisioningRules,
  useProviderRetentionPolicy,
  useUpdateProviderRetentionPolicy,
  useProviderAlertChannels,
  useUpdateProviderAlertChannels,
  useProviderSettingsEscalationRules,
  useUpdateProviderSettingsEscalationRules,
  useProviderNotifQuietHours,
  useUpdateProviderNotifQuietHours,
  useProviderSlaPoliciesV2,
  useCreateProviderSlaPolicy,
  useUpdateProviderSlaPolicy,
  useDeleteProviderSlaPolicy,
  useProviderSlaEscalationRules,
  useCreateProviderSlaEscalationRule,
  useDeleteProviderSlaEscalationRule,
  useProviderLegalTemplatesV2,
  useCreateProviderLegalTemplateV2,
  useUpdateProviderLegalTemplateV2,
  useDeleteProviderLegalTemplateV2,
  useProviderLegalCategories,
  useProviderEmailTemplatesV2,
  useCreateProviderEmailTemplateV2,
  useUpdateProviderEmailTemplateV2,
  useDeleteProviderEmailTemplateV2,
  useProviderEmailVariables,
  useProviderAppearanceTheme,
  useUpdateProviderAppearanceTheme,
  useProviderAppearanceLayout,
  useUpdateProviderAppearanceLayout,
  useProviderCustomCssV2,
  useSaveProviderCustomCssV2,
} from '@/hooks/api/use-provider-console';
import type {
  ProviderGeneralConfig,
  ProviderProvisioningRules,
  ProviderRetentionPolicy,
  ProviderAlertChannels,
  ProviderNotifQuietHours,
  ProviderAppearanceTheme,
  ProviderAppearanceLayout,
} from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, Row, getAccent, reasonPrompt } from './shared';

const accent = getAccent('provider_settings');
const Spin = () => <Loader2 className="mr-1 size-3 animate-spin" />;
const Loading = () => <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-blue-400" /></div>;

const btnSave = 'h-7 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30';
const btnCancel = 'h-7 bg-slate-700 text-slate-200 hover:bg-slate-600';
const btnPrimary = 'h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30';
const btnDanger = 'h-6 bg-red-500/20 text-red-100 hover:bg-red-500/30 text-[10px]';
const fieldWrap = 'rounded-lg border border-slate-500/20 bg-slate-800/60 p-3';
const fieldLabel = 'text-[10px] font-semibold uppercase tracking-wider text-slate-400';
const fieldInput = 'mt-1 h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100';
const toggleActive = 'bg-emerald-500/20 text-emerald-100';
const toggleInactive = 'bg-red-500/20 text-red-100';

/* ━━━━━━━━━━━━━ TOP-LEVEL ROUTER ━━━━━━━━━━━━━ */
export function ProviderSettingsSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  switch (activeHeader) {
    case 'settings_defaults':        return <DefaultsRouter sub={activeSubNav} />;
    case 'settings_notifications':   return <NotificationsRouter sub={activeSubNav} />;
    case 'settings_sla':             return <SlaRouter sub={activeSubNav} />;
    case 'settings_legal':           return <LegalRouter sub={activeSubNav} />;
    case 'settings_email_templates': return <EmailRouter sub={activeSubNav} />;
    case 'settings_appearance':      return <AppearanceRouter sub={activeSubNav} />;
    default:                         return <DefaultsRouter sub="sd_general" />;
  }
}

/* ━━━━━━━━━━━━━ DEFAULTS ━━━━━━━━━━━━━ */
function DefaultsRouter({ sub }: { sub: string | null }) {
  switch (sub) {
    case 'sd_provisioning': return <ProvisioningView />;
    case 'sd_retention':    return <RetentionView />;
    default:                return <GeneralConfigView />;
  }
}

function GeneralConfigView() {
  const { data, isLoading } = useProviderGeneralConfig();
  const mutation = useUpdateProviderGeneralConfig();
  const d = data ?? { timezone: '', locale: '', currency: '', dateFormat: '', schoolYearStart: '' };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProviderGeneralConfig>(d);
  const startEdit = () => { setForm(d); setEditing(true); };
  const save = () => {
    const reason = reasonPrompt('Update general config');
    if (!reason) return;
    mutation.mutate({ ...form, reason }, { onSuccess: () => setEditing(false) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Globe} title="General Configuration" description="Global defaults for timezone, locale, and formatting" accent={accent} actions={
        editing
          ? <div className="flex gap-2"><Button size="sm" className={btnCancel} onClick={() => setEditing(false)}>Cancel</Button><Button size="sm" className={btnSave} onClick={save} disabled={mutation.isPending}>{mutation.isPending && <Spin />}Save</Button></div>
          : <Button size="sm" className={btnPrimary} onClick={startEdit}>Edit Config</Button>
      } />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
        <StatCard label="Timezone" value={d.timezone || '—'} sub="Default TZ" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Locale" value={d.locale || '—'} sub="Language" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Currency" value={d.currency || '—'} sub="Default" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Date Format" value={d.dateFormat || '—'} sub="Pattern" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Year Start" value={d.schoolYearStart || '—'} sub="School year" gradient="from-pink-500/10 to-pink-500/5" />
      </div>
      <Panel title="Configuration Fields" subtitle="Applied to all new tenants on creation">
        {isLoading ? <Loading /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {(([['timezone', 'Timezone'], ['locale', 'Locale'], ['currency', 'Currency'], ['dateFormat', 'Date Format'], ['schoolYearStart', 'School Year Start (MM-DD)']] as const)).map(([key, label]) => (
              <div key={key} className={fieldWrap}>
                <label className={fieldLabel}>{label}</label>
                <Input value={editing ? form[key] : d[key]} readOnly={!editing} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={fieldInput} />
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

function ProvisioningView() {
  const { data, isLoading } = useProviderProvisioningRules();
  const mutation = useUpdateProviderProvisioningRules();
  const d = data ?? { autoApprove: false, requireEmailVerification: true, defaultPlan: '', trialDays: 0, maxTenantsPerOwner: 0, requirePaymentMethod: true };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProviderProvisioningRules>(d);
  const startEdit = () => { setForm(d); setEditing(true); };
  const save = () => {
    const reason = reasonPrompt('Update provisioning rules');
    if (!reason) return;
    mutation.mutate({ ...form, reason }, { onSuccess: () => setEditing(false) });
  };
  const toggle = (key: 'autoApprove' | 'requireEmailVerification' | 'requirePaymentMethod') => setForm({ ...form, [key]: !form[key] });

  return (
    <SectionShell>
      <SectionPageHeader icon={Settings} title="Provisioning Rules" description="Tenant auto-provisioning and onboarding rules" accent={accent} actions={
        editing
          ? <div className="flex gap-2"><Button size="sm" className={btnCancel} onClick={() => setEditing(false)}>Cancel</Button><Button size="sm" className={btnSave} onClick={save} disabled={mutation.isPending}>{mutation.isPending && <Spin />}Save</Button></div>
          : <Button size="sm" className={btnPrimary} onClick={startEdit}>Edit Rules</Button>
      } />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Default Plan" value={d.defaultPlan} sub="New tenants" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Trial" value={`${d.trialDays}d`} sub="Trial period" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Max Tenants" value={String(d.maxTenantsPerOwner)} sub="Per owner" gradient="from-emerald-500/10 to-emerald-500/5" />
      </div>
      <Panel title="Provisioning Settings">
        {isLoading ? <Loading /> : (
          <div className="space-y-3">
            {([['autoApprove', 'Auto-Approve Tenants', 'Automatically approve new tenant registrations'] as const,
              ['requireEmailVerification', 'Require Email Verification', 'Verify email before activation'] as const,
              ['requirePaymentMethod', 'Require Payment Method', 'Payment method required at signup'] as const,
            ]).map(([key, title, desc]) => (
              <Row key={key}>
                <div className="flex items-center justify-between">
                  <div><p className="font-semibold text-slate-100">{title}</p><p className="text-slate-400 text-xs">{desc}</p></div>
                  {editing ? (
                    <Button size="sm" className={`h-6 text-[10px] ${form[key] ? toggleActive : toggleInactive}`} onClick={() => toggle(key)}>
                      {form[key] ? <><ToggleRight className="mr-1 size-3" />Enabled</> : <><ToggleLeft className="mr-1 size-3" />Disabled</>}
                    </Button>
                  ) : (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${d[key] ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{d[key] ? 'Enabled' : 'Disabled'}</span>
                  )}
                </div>
              </Row>
            ))}
            <Row>
              <div className="flex items-center justify-between">
                <div><p className="font-semibold text-slate-100">Default Plan</p><p className="text-slate-400 text-xs">Plan assigned to new tenants</p></div>
                {editing
                  ? <Input value={form.defaultPlan} onChange={(e) => setForm({ ...form, defaultPlan: e.target.value })} className="h-7 w-40 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
                  : <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{d.defaultPlan}</span>
                }
              </div>
            </Row>
            <Row>
              <div className="flex items-center justify-between">
                <div><p className="font-semibold text-slate-100">Trial Days</p><p className="text-slate-400 text-xs">Free trial period for new tenants</p></div>
                {editing
                  ? <Input type="number" value={form.trialDays} onChange={(e) => setForm({ ...form, trialDays: Number(e.target.value) })} className="h-7 w-20 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
                  : <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{d.trialDays}d</span>
                }
              </div>
            </Row>
            <Row>
              <div className="flex items-center justify-between">
                <div><p className="font-semibold text-slate-100">Max Tenants Per Owner</p><p className="text-slate-400 text-xs">Limit per owner account</p></div>
                {editing
                  ? <Input type="number" value={form.maxTenantsPerOwner} onChange={(e) => setForm({ ...form, maxTenantsPerOwner: Number(e.target.value) })} className="h-7 w-20 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
                  : <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{d.maxTenantsPerOwner}</span>
                }
              </div>
            </Row>
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

function RetentionView() {
  const { data, isLoading } = useProviderRetentionPolicy();
  const mutation = useUpdateProviderRetentionPolicy();
  const d = data ?? { dataRetentionDays: 0, backupRetentionDays: 0, auditLogRetentionDays: 0, deleteOnTenantClose: false, anonymizeAfterDays: 0 };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProviderRetentionPolicy>(d);
  const startEdit = () => { setForm(d); setEditing(true); };
  const save = () => {
    const reason = reasonPrompt('Update retention policy');
    if (!reason) return;
    mutation.mutate({ ...form, reason }, { onSuccess: () => setEditing(false) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Clock} title="Data Retention" description="Data lifecycle and retention policies" accent={accent} actions={
        editing
          ? <div className="flex gap-2"><Button size="sm" className={btnCancel} onClick={() => setEditing(false)}>Cancel</Button><Button size="sm" className={btnSave} onClick={save} disabled={mutation.isPending}>{mutation.isPending && <Spin />}Save</Button></div>
          : <Button size="sm" className={btnPrimary} onClick={startEdit}>Edit Policy</Button>
      } />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Data" value={`${d.dataRetentionDays}d`} sub="Retention" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Backups" value={`${d.backupRetentionDays}d`} sub="Retention" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Audit Logs" value={`${d.auditLogRetentionDays}d`} sub="Retention" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Anonymize" value={`${d.anonymizeAfterDays}d`} sub="After close" gradient="from-emerald-500/10 to-emerald-500/5" />
      </div>
      <Panel title="Retention Configuration">
        {isLoading ? <Loading /> : (
          <div className="space-y-3">
            {([['dataRetentionDays', 'Data Retention (days)', 'How long to keep tenant data'] as const,
              ['backupRetentionDays', 'Backup Retention (days)', 'How long to keep backups'] as const,
              ['auditLogRetentionDays', 'Audit Log Retention (days)', 'How long to keep audit logs'] as const,
              ['anonymizeAfterDays', 'Anonymize After (days)', 'Days after close to anonymize data'] as const,
            ]).map(([key, title, desc]) => (
              <Row key={key}>
                <div className="flex items-center justify-between">
                  <div><p className="font-semibold text-slate-100">{title}</p><p className="text-slate-400 text-xs">{desc}</p></div>
                  {editing
                    ? <Input type="number" value={form[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} className="h-7 w-24 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
                    : <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{d[key]} days</span>
                  }
                </div>
              </Row>
            ))}
            <Row>
              <div className="flex items-center justify-between">
                <div><p className="font-semibold text-slate-100">Delete on Tenant Close</p><p className="text-slate-400 text-xs">Permanently delete data when tenant is closed</p></div>
                {editing ? (
                  <Button size="sm" className={`h-6 text-[10px] ${form.deleteOnTenantClose ? toggleActive : toggleInactive}`} onClick={() => setForm({ ...form, deleteOnTenantClose: !form.deleteOnTenantClose })}>
                    {form.deleteOnTenantClose ? 'Enabled' : 'Disabled'}
                  </Button>
                ) : (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${d.deleteOnTenantClose ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{d.deleteOnTenantClose ? 'Yes' : 'No'}</span>
                )}
              </div>
            </Row>
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━ NOTIFICATIONS ━━━━━━━━━━━━━ */
function NotificationsRouter({ sub }: { sub: string | null }) {
  switch (sub) {
    case 'sn_rules':        return <EscalationRulesView />;
    case 'sn_quiet_hours':  return <QuietHoursView />;
    default:                return <AlertChannelsView />;
  }
}

function AlertChannelsView() {
  const { data, isLoading } = useProviderAlertChannels();
  const mutation = useUpdateProviderAlertChannels();
  const d = data ?? { email: false, slack: false, webhook: false, sms: false, inApp: false };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProviderAlertChannels>(d);
  const startEdit = () => { setForm(d); setEditing(true); };
  const save = () => {
    const reason = reasonPrompt('Update alert channels');
    if (!reason) return;
    mutation.mutate({ ...form, reason }, { onSuccess: () => setEditing(false) });
  };
  const channels: (keyof ProviderAlertChannels)[] = ['email', 'slack', 'webhook', 'sms', 'inApp'];
  const enabled = channels.filter((c) => d[c]).length;

  return (
    <SectionShell>
      <SectionPageHeader icon={Bell} title="Alert Channels" description="Configure which notification channels are active" accent={accent} actions={
        editing
          ? <div className="flex gap-2"><Button size="sm" className={btnCancel} onClick={() => setEditing(false)}>Cancel</Button><Button size="sm" className={btnSave} onClick={save} disabled={mutation.isPending}>{mutation.isPending && <Spin />}Save</Button></div>
          : <Button size="sm" className={btnPrimary} onClick={startEdit}>Edit Channels</Button>
      } />
      <div className="grid gap-2 grid-cols-2">
        <StatCard label="Channels" value={String(channels.length)} sub="Available" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Active" value={String(enabled)} sub="Enabled" gradient="from-emerald-500/10 to-emerald-500/5" />
      </div>
      <Panel title="Channel Configuration">
        {isLoading ? <Loading /> : (
          <div className="space-y-3">
            {channels.map((ch) => (
              <Row key={ch}>
                <div className="flex items-center justify-between">
                  <div><p className="font-semibold capitalize text-slate-100">{ch === 'inApp' ? 'In-App' : ch}</p><p className="text-slate-400 text-xs">Receive alerts via {ch === 'inApp' ? 'in-app notifications' : ch}</p></div>
                  {editing ? (
                    <Button size="sm" className={`h-6 text-[10px] ${form[ch] ? toggleActive : toggleInactive}`} onClick={() => setForm({ ...form, [ch]: !form[ch] })}>
                      {form[ch] ? <><ToggleRight className="mr-1 size-3" />On</> : <><ToggleLeft className="mr-1 size-3" />Off</>}
                    </Button>
                  ) : (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${d[ch] ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{d[ch] ? 'Enabled' : 'Disabled'}</span>
                  )}
                </div>
              </Row>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

function EscalationRulesView() {
  const { data: rules, isLoading } = useProviderSettingsEscalationRules();
  const mutation = useUpdateProviderSettingsEscalationRules();
  const list = rules ?? [];

  const [showAdd, setShowAdd] = useState(false);
  const [trigger, setTrigger] = useState('new_incident');
  const [escalateTo, setEscalateTo] = useState('');
  const [delay, setDelay] = useState(15);
  const [channel, setChannel] = useState('email');

  const handleAdd = () => {
    const reason = reasonPrompt('Add escalation rule');
    if (!reason) return;
    const newRules = [...list.map(({ id: _id, ...r }) => r), { triggerEvent: trigger, escalateTo, delayMinutes: delay, channel, enabled: true }];
    mutation.mutate({ rules: newRules as never, reason }, { onSuccess: () => { setShowAdd(false); setEscalateTo(''); } });
  };

  const handleToggle = (idx: number) => {
    const reason = reasonPrompt('Toggle escalation rule');
    if (!reason) return;
    const updated = list.map((r, i) => ({ triggerEvent: r.triggerEvent, escalateTo: r.escalateTo, delayMinutes: r.delayMinutes, channel: r.channel, enabled: i === idx ? !r.enabled : r.enabled }));
    mutation.mutate({ rules: updated as never, reason });
  };

  const handleDelete = (idx: number) => {
    const reason = reasonPrompt('Delete escalation rule');
    if (!reason) return;
    const updated = list.filter((_, i) => i !== idx).map(({ id: _id, ...r }) => r);
    mutation.mutate({ rules: updated as never, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Bell} title="Escalation Rules" description="Auto-escalation rules for critical events" accent={accent} actions={
        <Button size="sm" className={btnPrimary} onClick={() => setShowAdd(true)}><PlusCircle className="mr-1 size-3" />Add Rule</Button>
      } />
      {showAdd && (
        <Panel title="New Escalation Rule" accentBorder="border-blue-500/20">
          <div className="grid gap-2 md:grid-cols-4">
            <div className={fieldWrap}><label className={fieldLabel}>Trigger Event</label><Input value={trigger} onChange={(e) => setTrigger(e.target.value)} className={fieldInput} /></div>
            <div className={fieldWrap}><label className={fieldLabel}>Escalate To</label><Input value={escalateTo} onChange={(e) => setEscalateTo(e.target.value)} placeholder="e.g. ops_lead" className={fieldInput} /></div>
            <div className={fieldWrap}><label className={fieldLabel}>Delay (min)</label><Input type="number" value={delay} onChange={(e) => setDelay(Number(e.target.value))} className={fieldInput} /></div>
            <div className={fieldWrap}><label className={fieldLabel}>Channel</label><Input value={channel} onChange={(e) => setChannel(e.target.value)} className={fieldInput} /></div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" className={btnCancel} onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" className={btnPrimary} onClick={handleAdd} disabled={!escalateTo.trim() || mutation.isPending}>{mutation.isPending && <Spin />}Create</Button>
          </div>
        </Panel>
      )}
      <Panel title="Active Rules" subtitle={`${list.length} rules configured`}>
        {isLoading ? <Loading /> : list.length === 0 ? (
          <EmptyState icon={Bell} title="No Rules" description="No escalation rules configured." action={<Button size="sm" onClick={() => setShowAdd(true)}>Add Rule</Button>} />
        ) : (
          <div className="space-y-2">
            {list.map((r, idx) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-500/20 bg-slate-800/60 px-3 py-2 text-xs">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-500/15 px-1.5 py-0.5 font-mono text-[10px] text-blue-300">{r.triggerEvent}</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="font-semibold text-slate-100">{r.escalateTo}</span>
                    <span className="text-slate-400">after {r.delayMinutes}m via {r.channel}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" className={`h-6 text-[10px] ${r.enabled ? toggleActive : toggleInactive}`} onClick={() => handleToggle(idx)}>{r.enabled ? 'On' : 'Off'}</Button>
                  <Button size="sm" className={btnDanger} onClick={() => handleDelete(idx)}><Trash2 className="size-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

function QuietHoursView() {
  const { data, isLoading } = useProviderNotifQuietHours();
  const mutation = useUpdateProviderNotifQuietHours();
  const d = data ?? { enabled: false, startTime: '', endTime: '', weekendsOnly: false, allowCritical: true };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProviderNotifQuietHours>(d);
  const startEdit = () => { setForm(d); setEditing(true); };
  const save = () => {
    const reason = reasonPrompt('Update quiet hours');
    if (!reason) return;
    mutation.mutate({ ...form, reason }, { onSuccess: () => setEditing(false) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Moon} title="Quiet Hours" description="Suppress non-critical notifications during off-hours" accent={accent} actions={
        editing
          ? <div className="flex gap-2"><Button size="sm" className={btnCancel} onClick={() => setEditing(false)}>Cancel</Button><Button size="sm" className={btnSave} onClick={save} disabled={mutation.isPending}>{mutation.isPending && <Spin />}Save</Button></div>
          : <Button size="sm" className={btnPrimary} onClick={startEdit}>Edit Quiet Hours</Button>
      } />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Status" value={d.enabled ? 'Active' : 'Inactive'} sub="Quiet hours" gradient={d.enabled ? 'from-emerald-500/10 to-emerald-500/5' : 'from-red-500/10 to-red-500/5'} />
        <StatCard label="Start" value={d.startTime || '—'} sub="Begin quiet" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="End" value={d.endTime || '—'} sub="End quiet" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Critical" value={d.allowCritical ? 'Allowed' : 'Blocked'} sub="During quiet" gradient="from-amber-500/10 to-amber-500/5" />
      </div>
      <Panel title="Quiet Hours Configuration">
        {isLoading ? <Loading /> : (
          <div className="space-y-3">
            {([['enabled', 'Enable Quiet Hours', 'Suppress non-critical alerts during quiet hours'] as const,
              ['weekendsOnly', 'Weekends Only', 'Only apply quiet hours on weekends'] as const,
              ['allowCritical', 'Allow Critical', 'Let critical alerts through during quiet hours'] as const,
            ]).map(([key, title, desc]) => (
              <Row key={key}>
                <div className="flex items-center justify-between">
                  <div><p className="font-semibold text-slate-100">{title}</p><p className="text-slate-400 text-xs">{desc}</p></div>
                  {editing ? (
                    <Button size="sm" className={`h-6 text-[10px] ${form[key] ? toggleActive : toggleInactive}`} onClick={() => setForm({ ...form, [key]: !form[key] })}>{form[key] ? 'On' : 'Off'}</Button>
                  ) : (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${d[key] ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{d[key] ? 'Yes' : 'No'}</span>
                  )}
                </div>
              </Row>
            ))}
            <Row>
              <div className="flex items-center justify-between gap-4">
                <div><p className="font-semibold text-slate-100">Time Window</p><p className="text-slate-400 text-xs">Start and end times for quiet period</p></div>
                {editing ? (
                  <div className="flex gap-2">
                    <Input value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} placeholder="HH:MM" className="h-7 w-24 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
                    <span className="self-center text-slate-400">to</span>
                    <Input value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} placeholder="HH:MM" className="h-7 w-24 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
                  </div>
                ) : (
                  <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{d.startTime} — {d.endTime}</span>
                )}
              </div>
            </Row>
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━ SLA POLICIES ━━━━━━━━━━━━━ */
function SlaRouter({ sub }: { sub: string | null }) {
  switch (sub) {
    case 'ss_create':      return <SlaCreateView />;
    case 'ss_escalation':  return <SlaEscalationView />;
    default:               return <SlaActiveView />;
  }
}

function SlaActiveView() {
  const { data, isLoading } = useProviderSlaPoliciesV2();
  const updateMut = useUpdateProviderSlaPolicy();
  const deleteMut = useDeleteProviderSlaPolicy();
  const policies = data ?? [];
  const active = policies.filter((p) => p.isActive);

  const handleToggleActive = (p: { id: string; isActive: boolean; name: string }) => {
    const reason = reasonPrompt(`${p.isActive ? 'Deactivate' : 'Activate'} ${p.name}`);
    if (!reason) return;
    updateMut.mutate({ policyId: p.id, isActive: !p.isActive, reason });
  };

  const handleDelete = (p: { id: string; name: string }) => {
    const reason = reasonPrompt(`Delete policy "${p.name}"`);
    if (!reason) return;
    deleteMut.mutate({ policyId: p.id, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={FileClock} title="Active SLA Policies" description="Service level agreement targets in effect" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Total" value={String(policies.length)} sub="All policies" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Active" value={String(active.length)} sub="In effect" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Inactive" value={String(policies.length - active.length)} sub="Disabled" gradient="from-amber-500/10 to-amber-500/5" />
      </div>
      <Panel title="SLA Policies" subtitle={isLoading ? 'Loading...' : `${policies.length} policies`}>
        {isLoading ? <Loading /> : policies.length === 0 ? (
          <EmptyState icon={FileClock} title="No Policies" description="No SLA policies created yet." />
        ) : (
          <div className="space-y-2">
            {policies.map((p) => (
              <div key={p.id} className={`rounded-lg border px-3 py-2 text-xs ${p.isActive ? 'border-slate-500/20 bg-slate-800/60' : 'border-amber-500/15 bg-amber-500/5'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-100">{p.name}</p>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] ${p.priority === 'critical' ? 'bg-red-500/15 text-red-300' : p.priority === 'high' ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-700 text-slate-300'}`}>{p.priority}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${p.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="mt-1 flex gap-4 text-slate-400">
                      <span>First response: <span className="text-slate-200">{p.firstResponseMinutes}m</span></span>
                      <span>Resolution: <span className="text-slate-200">{p.resolutionMinutes}m</span></span>
                      <span>Escalation: <span className="text-slate-200">{p.escalationMinutes}m</span></span>
                      <span>Category: <span className="text-slate-200">{p.category}</span></span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className={`h-6 text-[10px] ${p.isActive ? toggleActive : toggleInactive}`} onClick={() => handleToggleActive(p)} disabled={updateMut.isPending}>
                      {p.isActive ? <Eye className="mr-1 size-3" /> : <EyeOff className="mr-1 size-3" />}{p.isActive ? 'Active' : 'Inactive'}
                    </Button>
                    <Button size="sm" className={btnDanger} onClick={() => handleDelete(p)} disabled={deleteMut.isPending}><Trash2 className="size-3" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

function SlaCreateView() {
  const createMut = useCreateProviderSlaPolicy();
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('medium');
  const [firstResp, setFirstResp] = useState(60);
  const [resolution, setResolution] = useState(480);
  const [escalation, setEscalation] = useState(120);
  const [category, setCategory] = useState('general');

  const handleCreate = () => {
    const reason = reasonPrompt('Create SLA policy');
    if (!reason) return;
    createMut.mutate({ name, priority, firstResponseMinutes: firstResp, resolutionMinutes: resolution, escalationMinutes: escalation, category, isActive: true, reason }, {
      onSuccess: () => { setName(''); setPriority('medium'); setFirstResp(60); setResolution(480); setEscalation(120); setCategory('general'); },
    });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={PlusCircle} title="Create SLA Policy" description="Define a new service level agreement" accent={accent} />
      <Panel title="Policy Details" accentBorder="border-blue-500/20">
        <div className="grid gap-3 md:grid-cols-2">
          <div className={fieldWrap}><label className={fieldLabel}>Policy Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Critical SLA" className={fieldInput} /></div>
          <div className={fieldWrap}><label className={fieldLabel}>Priority</label><Input value={priority} onChange={(e) => setPriority(e.target.value)} placeholder="critical | high | medium | low" className={fieldInput} /></div>
          <div className={fieldWrap}><label className={fieldLabel}>First Response (min)</label><Input type="number" value={firstResp} onChange={(e) => setFirstResp(Number(e.target.value))} className={fieldInput} /></div>
          <div className={fieldWrap}><label className={fieldLabel}>Resolution (min)</label><Input type="number" value={resolution} onChange={(e) => setResolution(Number(e.target.value))} className={fieldInput} /></div>
          <div className={fieldWrap}><label className={fieldLabel}>Escalation (min)</label><Input type="number" value={escalation} onChange={(e) => setEscalation(Number(e.target.value))} className={fieldInput} /></div>
          <div className={fieldWrap}><label className={fieldLabel}>Category</label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="general | infrastructure | billing | ..." className={fieldInput} /></div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" className={btnPrimary} onClick={handleCreate} disabled={!name.trim() || createMut.isPending}>
            {createMut.isPending && <Spin />}<PlusCircle className="mr-1 size-3" />Create Policy
          </Button>
        </div>
      </Panel>
    </SectionShell>
  );
}

function SlaEscalationView() {
  const { data: rules, isLoading } = useProviderSlaEscalationRules();
  const createMut = useCreateProviderSlaEscalationRule();
  const deleteMut = useDeleteProviderSlaEscalationRule();
  const list = rules ?? [];

  const [showAdd, setShowAdd] = useState(false);
  const [policyId, setPolicyId] = useState('');
  const [triggerMin, setTriggerMin] = useState(30);
  const [escalateTo, setEscalateTo] = useState('');
  const [notifyVia, setNotifyVia] = useState('email');

  const handleCreate = () => {
    const reason = reasonPrompt('Create escalation rule');
    if (!reason) return;
    createMut.mutate({ policyId, triggerMinutes: triggerMin, escalateTo, notifyVia, reason }, { onSuccess: () => { setShowAdd(false); setEscalateTo(''); } });
  };

  const handleDelete = (ruleId: string) => {
    const reason = reasonPrompt('Delete escalation rule');
    if (!reason) return;
    deleteMut.mutate({ ruleId, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Bell} title="SLA Escalation Rules" description="Automatic escalation when SLA targets are breached" accent={accent} actions={
        <Button size="sm" className={btnPrimary} onClick={() => setShowAdd(true)}><PlusCircle className="mr-1 size-3" />Add Rule</Button>
      } />
      {showAdd && (
        <Panel title="New Escalation Rule" accentBorder="border-blue-500/20">
          <div className="grid gap-2 md:grid-cols-4">
            <div className={fieldWrap}><label className={fieldLabel}>Policy ID</label><Input value={policyId} onChange={(e) => setPolicyId(e.target.value)} placeholder="Policy ID or 'auto'" className={fieldInput} /></div>
            <div className={fieldWrap}><label className={fieldLabel}>Trigger (min)</label><Input type="number" value={triggerMin} onChange={(e) => setTriggerMin(Number(e.target.value))} className={fieldInput} /></div>
            <div className={fieldWrap}><label className={fieldLabel}>Escalate To</label><Input value={escalateTo} onChange={(e) => setEscalateTo(e.target.value)} placeholder="e.g. manager" className={fieldInput} /></div>
            <div className={fieldWrap}><label className={fieldLabel}>Notify Via</label><Input value={notifyVia} onChange={(e) => setNotifyVia(e.target.value)} className={fieldInput} /></div>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" className={btnCancel} onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" className={btnPrimary} onClick={handleCreate} disabled={!escalateTo.trim() || createMut.isPending}>{createMut.isPending && <Spin />}Create</Button>
          </div>
        </Panel>
      )}
      <Panel title="Escalation Rules" subtitle={`${list.length} rules`}>
        {isLoading ? <Loading /> : list.length === 0 ? (
          <EmptyState icon={Bell} title="No Rules" description="No SLA escalation rules configured." action={<Button size="sm" onClick={() => setShowAdd(true)}>Add Rule</Button>} />
        ) : (
          <div className="space-y-2">
            {list.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-500/20 bg-slate-800/60 px-3 py-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] text-violet-300">After {r.triggerMinutes}m</span>
                  <span className="text-slate-400">&rarr;</span>
                  <span className="font-semibold text-slate-100">{r.escalateTo}</span>
                  <span className="text-slate-400">via {r.notifyVia}</span>
                </div>
                <Button size="sm" className={btnDanger} onClick={() => handleDelete(r.id)} disabled={deleteMut.isPending}><Trash2 className="size-3" /></Button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━ LEGAL TEMPLATES ━━━━━━━━━━━━━ */
function LegalRouter({ sub }: { sub: string | null }) {
  switch (sub) {
    case 'sl_create':       return <LegalCreateView />;
    case 'sl_categories':   return <LegalCategoriesView />;
    default:                return <LegalAllView />;
  }
}

function LegalAllView() {
  const { data, isLoading } = useProviderLegalTemplatesV2();
  const updateMut = useUpdateProviderLegalTemplateV2();
  const deleteMut = useDeleteProviderLegalTemplateV2();
  const templates = data ?? [];
  const active = templates.filter((t) => t.isActive);

  const handleToggle = (t: { id: string; isActive: boolean; name: string }) => {
    const reason = reasonPrompt(`${t.isActive ? 'Deactivate' : 'Activate'} "${t.name}"`);
    if (!reason) return;
    updateMut.mutate({ templateId: t.id, isActive: !t.isActive, reason });
  };

  const handleDelete = (t: { id: string; name: string }) => {
    const reason = reasonPrompt(`Delete legal template "${t.name}"`);
    if (!reason) return;
    deleteMut.mutate({ templateId: t.id, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={ClipboardList} title="All Legal Templates" description="Manage legal document templates" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Templates" value={String(templates.length)} sub="Total" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Active" value={String(active.length)} sub="In use" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Inactive" value={String(templates.length - active.length)} sub="Disabled" gradient="from-amber-500/10 to-amber-500/5" />
      </div>
      <Panel title="Template Library" subtitle={isLoading ? 'Loading...' : `${templates.length} templates`}>
        {isLoading ? <Loading /> : templates.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No Templates" description="Create your first legal template." />
        ) : (
          <div className="space-y-2">
            {templates.map((tpl) => (
              <div key={tpl.id} className={`rounded-lg border px-3 py-2 text-xs ${tpl.isActive ? 'border-slate-500/20 bg-slate-800/60' : 'border-amber-500/15 bg-amber-500/5'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-100">{tpl.name}</p>
                      <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] text-violet-300">{tpl.category.replace(/_/g, ' ')}</span>
                      <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">v{tpl.version}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tpl.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{tpl.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <p className="mt-1 text-slate-400">Subject: {tpl.subject}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tpl.requiredFields.map((f) => <span key={f} className="rounded bg-slate-700 px-1 py-0.5 font-mono text-[10px] text-blue-300">{f}</span>)}
                      <span className="ml-auto text-[10px] text-slate-500">Updated: {new Date(tpl.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-3 flex flex-col gap-1">
                    <Button size="sm" className={`h-6 text-[10px] ${tpl.isActive ? toggleActive : toggleInactive}`} onClick={() => handleToggle(tpl)} disabled={updateMut.isPending}>{tpl.isActive ? 'Active' : 'Inactive'}</Button>
                    <Button size="sm" className={btnDanger} onClick={() => handleDelete(tpl)} disabled={deleteMut.isPending}><Trash2 className="mr-1 size-3" />Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

function LegalCreateView() {
  const createMut = useCreateProviderLegalTemplateV2();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('terms_of_service');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fields, setFields] = useState('');

  const handleCreate = () => {
    const reason = reasonPrompt('Create legal template');
    if (!reason) return;
    createMut.mutate({
      name, category, subject, body,
      requiredFields: fields.split(',').map((s) => s.trim()).filter(Boolean),
      isActive: true, reason,
    }, { onSuccess: () => { setName(''); setSubject(''); setBody(''); setFields(''); } });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={PlusCircle} title="Create Legal Template" description="Add a new legal document template" accent={accent} />
      <Panel title="Template Details" accentBorder="border-blue-500/20">
        <div className="grid gap-3 md:grid-cols-2">
          <div className={fieldWrap}><label className={fieldLabel}>Template Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Terms of Service" className={fieldInput} /></div>
          <div className={fieldWrap}><label className={fieldLabel}>Category</label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="terms_of_service | privacy_policy | ..." className={fieldInput} /></div>
          <div className={`${fieldWrap} col-span-full`}><label className={fieldLabel}>Subject</label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Document subject line" className={fieldInput} /></div>
          <div className={`${fieldWrap} col-span-full`}><label className={fieldLabel}>Required Fields (comma-separated)</label><Input value={fields} onChange={(e) => setFields(e.target.value)} placeholder="tenant_name, effective_date" className={fieldInput} /></div>
          <div className={`${fieldWrap} col-span-full`}>
            <label className={fieldLabel}>Body (HTML)</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="<h1>Title</h1><p>Content...</p>" className="mt-1 min-h-[120px] w-full resize-y rounded-md border border-slate-500/40 bg-slate-700 p-2 font-mono text-xs text-slate-100" />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" className={btnPrimary} onClick={handleCreate} disabled={!name.trim() || !subject.trim() || createMut.isPending}>
            {createMut.isPending && <Spin />}<PlusCircle className="mr-1 size-3" />Create Template
          </Button>
        </div>
      </Panel>
    </SectionShell>
  );
}

function LegalCategoriesView() {
  const { data, isLoading } = useProviderLegalCategories();
  const categories = data ?? [];

  return (
    <SectionShell>
      <SectionPageHeader icon={FolderOpen} title="Legal Template Categories" description="Browse templates by category" accent={accent} />
      <Panel title="Categories" subtitle={`${categories.length} categories`}>
        {isLoading ? <Loading /> : categories.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No Categories" description="No categories found." />
        ) : (
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between rounded-lg border border-slate-500/20 bg-slate-800/60 p-3">
                <div>
                  <p className="font-semibold text-slate-100">{cat.name}</p>
                  <p className="text-[10px] text-slate-400">{cat.id}</p>
                </div>
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] text-blue-300">{cat.count} template{cat.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━ EMAIL TEMPLATES ━━━━━━━━━━━━━ */
function EmailRouter({ sub }: { sub: string | null }) {
  switch (sub) {
    case 'se_create':      return <EmailCreateView />;
    case 'se_variables':   return <EmailVariablesView />;
    default:               return <EmailAllView />;
  }
}

function EmailAllView() {
  const { data, isLoading } = useProviderEmailTemplatesV2();
  const updateMut = useUpdateProviderEmailTemplateV2();
  const deleteMut = useDeleteProviderEmailTemplateV2();
  const templates = data ?? [];
  const active = templates.filter((t) => t.isActive);

  const handleToggle = (t: { id: string; isActive: boolean; name: string }) => {
    const reason = reasonPrompt(`${t.isActive ? 'Deactivate' : 'Activate'} "${t.name}"`);
    if (!reason) return;
    updateMut.mutate({ templateId: t.id, isActive: !t.isActive, reason });
  };

  const handleDelete = (t: { id: string; name: string }) => {
    const reason = reasonPrompt(`Delete email template "${t.name}"`);
    if (!reason) return;
    deleteMut.mutate({ templateId: t.id, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Mail} title="All Email Templates" description="Transactional email templates with variable substitution" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Templates" value={String(templates.length)} sub="Total" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Active" value={String(active.length)} sub="Sending" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Inactive" value={String(templates.length - active.length)} sub="Drafts" gradient="from-amber-500/10 to-amber-500/5" />
      </div>
      <Panel title="Template Library" subtitle={isLoading ? 'Loading...' : `${templates.length} templates`}>
        {isLoading ? <Loading /> : templates.length === 0 ? (
          <EmptyState icon={Mail} title="No Templates" description="Create your first email template." />
        ) : (
          <div className="space-y-2">
            {templates.map((tpl) => (
              <div key={tpl.id} className={`rounded-lg border px-3 py-2 text-xs ${tpl.isActive ? 'border-slate-500/20 bg-slate-800/60' : 'border-amber-500/15 bg-amber-500/5'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-100">{tpl.name}</p>
                      <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] text-blue-300">{tpl.category}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tpl.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{tpl.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <p className="mt-1 text-slate-400">Subject: {tpl.subject}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tpl.variables.map((v) => <span key={v} className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-blue-300">{'{{' + v + '}}'}</span>)}
                      <span className="ml-auto text-[10px] text-slate-500">Updated: {new Date(tpl.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-3 flex flex-col gap-1">
                    <Button size="sm" className={`h-6 text-[10px] ${tpl.isActive ? toggleActive : toggleInactive}`} onClick={() => handleToggle(tpl)} disabled={updateMut.isPending}>{tpl.isActive ? 'Active' : 'Inactive'}</Button>
                    <Button size="sm" className={btnDanger} onClick={() => handleDelete(tpl)} disabled={deleteMut.isPending}><Trash2 className="mr-1 size-3" />Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

function EmailCreateView() {
  const createMut = useCreateProviderEmailTemplateV2();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('onboarding');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [vars, setVars] = useState('');

  const handleCreate = () => {
    const reason = reasonPrompt('Create email template');
    if (!reason) return;
    createMut.mutate({
      name, category, subject, body,
      variables: vars.split(',').map((s) => s.trim()).filter(Boolean),
      isActive: true, reason,
    }, { onSuccess: () => { setName(''); setSubject(''); setBody(''); setVars(''); } });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={PlusCircle} title="Create Email Template" description="Add a new transactional email template" accent={accent} />
      <Panel title="Template Details" accentBorder="border-blue-500/20">
        <div className="grid gap-3 md:grid-cols-2">
          <div className={fieldWrap}><label className={fieldLabel}>Template Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welcome Email" className={fieldInput} /></div>
          <div className={fieldWrap}><label className={fieldLabel}>Category</label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="onboarding | authentication | billing | ..." className={fieldInput} /></div>
          <div className={`${fieldWrap} col-span-full`}><label className={fieldLabel}>Subject</label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Welcome to {{platform_name}}!" className={fieldInput} /></div>
          <div className={`${fieldWrap} col-span-full`}><label className={fieldLabel}>Variables (comma-separated)</label><Input value={vars} onChange={(e) => setVars(e.target.value)} placeholder="platform_name, user_name, login_url" className={fieldInput} /></div>
          <div className={`${fieldWrap} col-span-full`}>
            <label className={fieldLabel}>Body (HTML)</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="<h1>Welcome!</h1><p>Hello {{user_name}}...</p>" className="mt-1 min-h-[120px] w-full resize-y rounded-md border border-slate-500/40 bg-slate-700 p-2 font-mono text-xs text-slate-100" />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" className={btnPrimary} onClick={handleCreate} disabled={!name.trim() || !subject.trim() || createMut.isPending}>
            {createMut.isPending && <Spin />}<PlusCircle className="mr-1 size-3" />Create Template
          </Button>
        </div>
      </Panel>
    </SectionShell>
  );
}

function EmailVariablesView() {
  const { data, isLoading } = useProviderEmailVariables();
  const variables = data ?? [];
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (varName: string) => {
    navigator.clipboard.writeText(`{{${varName}}}`);
    setCopied(varName);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Variable} title="Template Variables" description="Available variables for email and legal templates" accent={accent} />
      <Panel title="Variable Reference" subtitle={`${variables.length} variables available`}>
        {isLoading ? <Loading /> : variables.length === 0 ? (
          <EmptyState icon={Variable} title="No Variables" description="No template variables defined." />
        ) : (
          <div className="space-y-2">
            {variables.map((v) => (
              <div key={v.name} className="flex items-center justify-between rounded-lg border border-slate-500/20 bg-slate-800/60 px-3 py-2 text-xs">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-blue-500/15 px-1.5 py-0.5 font-mono text-[10px] text-blue-300">{'{{' + v.name + '}}'}</span>
                    <p className="text-slate-100">{v.description}</p>
                  </div>
                  <p className="mt-0.5 text-slate-500">Example: <span className="text-slate-300">{v.example}</span></p>
                </div>
                <Button size="sm" className="h-6 bg-slate-700 text-[10px] text-slate-200 hover:bg-slate-600" onClick={() => copy(v.name)}>
                  {copied === v.name ? <><Check className="mr-1 size-3 text-emerald-400" />Copied</> : <><Copy className="mr-1 size-3" />Copy</>}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━ APPEARANCE ━━━━━━━━━━━━━ */
function AppearanceRouter({ sub }: { sub: string | null }) {
  switch (sub) {
    case 'sa_layout':       return <AppearanceLayoutView />;
    case 'sa_custom_css':   return <AppearanceCustomCssView />;
    default:                return <AppearanceThemeView />;
  }
}

function AppearanceThemeView() {
  const { data, isLoading } = useProviderAppearanceTheme();
  const mutation = useUpdateProviderAppearanceTheme();
  const d = data ?? { primaryColor: '', sidebarColor: '', accentColor: '', textColor: '', fontFamily: '', borderRadius: '', darkMode: false };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProviderAppearanceTheme>(d);
  const startEdit = () => { setForm(d); setEditing(true); };
  const save = () => {
    const reason = reasonPrompt('Update theme');
    if (!reason) return;
    mutation.mutate({ ...form, reason }, { onSuccess: () => setEditing(false) });
  };

  const colorFields: [keyof ProviderAppearanceTheme, string][] = [
    ['primaryColor', 'Primary'],
    ['sidebarColor', 'Sidebar'],
    ['accentColor', 'Accent'],
    ['textColor', 'Text'],
  ];

  return (
    <SectionShell>
      <SectionPageHeader icon={Paintbrush} title="Theme Settings" description="Platform color scheme and typography" accent={accent} actions={
        editing
          ? <div className="flex gap-2"><Button size="sm" className={btnCancel} onClick={() => setEditing(false)}>Cancel</Button><Button size="sm" className={btnSave} onClick={save} disabled={mutation.isPending}>{mutation.isPending && <Spin />}Save</Button></div>
          : <Button size="sm" className={btnPrimary} onClick={startEdit}>Edit Theme</Button>
      } />
      <div className="mb-2 flex gap-3">
        {colorFields.map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 rounded-lg border border-slate-500/20 bg-slate-800/60 px-3 py-2">
            <div className="size-6 rounded border border-slate-500/30" style={{ backgroundColor: (d[key] as string) || '#ccc' }} />
            <div>
              <p className="text-[10px] text-slate-400">{label}</p>
              <p className="font-mono text-xs text-slate-200">{(d[key] as string) || '—'}</p>
            </div>
          </div>
        ))}
      </div>
      <Panel title="Theme Configuration">
        {isLoading ? <Loading /> : (
          <div className="grid gap-3 md:grid-cols-2">
            {colorFields.map(([key, label]) => (
              <div key={key} className={fieldWrap}>
                <label className={fieldLabel}>{label} Color</label>
                <div className="mt-1 flex items-center gap-2">
                  <Input type={editing ? 'color' : 'text'} value={editing ? (form[key] as string) : (d[key] as string)} readOnly={!editing} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-8 w-12 border-slate-500/40 bg-slate-700 p-0.5" />
                  <Input value={editing ? (form[key] as string) : (d[key] as string)} readOnly={!editing} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={fieldInput + ' flex-1'} />
                </div>
              </div>
            ))}
            <div className={fieldWrap}>
              <label className={fieldLabel}>Font Family</label>
              <Input value={editing ? form.fontFamily : d.fontFamily} readOnly={!editing} onChange={(e) => setForm({ ...form, fontFamily: e.target.value })} className={fieldInput} />
            </div>
            <div className={fieldWrap}>
              <label className={fieldLabel}>Border Radius</label>
              <Input value={editing ? form.borderRadius : d.borderRadius} readOnly={!editing} onChange={(e) => setForm({ ...form, borderRadius: e.target.value })} className={fieldInput} />
            </div>
            <Row>
              <div className="flex items-center justify-between">
                <div><p className="font-semibold text-slate-100">Dark Mode</p><p className="text-slate-400 text-xs">Enable dark mode by default</p></div>
                {editing ? (
                  <Button size="sm" className={`h-6 text-[10px] ${form.darkMode ? toggleActive : toggleInactive}`} onClick={() => setForm({ ...form, darkMode: !form.darkMode })}>
                    {form.darkMode ? <><Moon className="mr-1 size-3" />Dark</> : <><Sun className="mr-1 size-3" />Light</>}
                  </Button>
                ) : (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${d.darkMode ? 'bg-violet-500/15 text-violet-300' : 'bg-amber-500/15 text-amber-300'}`}>{d.darkMode ? 'Dark' : 'Light'}</span>
                )}
              </div>
            </Row>
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

function AppearanceLayoutView() {
  const { data, isLoading } = useProviderAppearanceLayout();
  const mutation = useUpdateProviderAppearanceLayout();
  const d = data ?? { sidebarPosition: '', sidebarCollapsed: false, headerFixed: false, contentMaxWidth: '', showBreadcrumbs: false, compactMode: false };
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProviderAppearanceLayout>(d);
  const startEdit = () => { setForm(d); setEditing(true); };
  const save = () => {
    const reason = reasonPrompt('Update layout settings');
    if (!reason) return;
    mutation.mutate({ ...form, reason }, { onSuccess: () => setEditing(false) });
  };

  const boolFields: [keyof ProviderAppearanceLayout, string, string][] = [
    ['sidebarCollapsed', 'Sidebar Collapsed', 'Start with sidebar collapsed'],
    ['headerFixed', 'Fixed Header', 'Keep header fixed on scroll'],
    ['showBreadcrumbs', 'Show Breadcrumbs', 'Display breadcrumb navigation'],
    ['compactMode', 'Compact Mode', 'Reduce spacing and padding'],
  ];

  return (
    <SectionShell>
      <SectionPageHeader icon={Layout} title="Layout Settings" description="Sidebar, header, and content layout configuration" accent={accent} actions={
        editing
          ? <div className="flex gap-2"><Button size="sm" className={btnCancel} onClick={() => setEditing(false)}>Cancel</Button><Button size="sm" className={btnSave} onClick={save} disabled={mutation.isPending}>{mutation.isPending && <Spin />}Save</Button></div>
          : <Button size="sm" className={btnPrimary} onClick={startEdit}>Edit Layout</Button>
      } />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Sidebar" value={d.sidebarPosition || '—'} sub="Position" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Max Width" value={d.contentMaxWidth || '—'} sub="Content" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Mode" value={d.compactMode ? 'Compact' : 'Standard'} sub="Spacing" gradient="from-amber-500/10 to-amber-500/5" />
      </div>
      <Panel title="Layout Configuration">
        {isLoading ? <Loading /> : (
          <div className="space-y-3">
            <Row>
              <div className="flex items-center justify-between">
                <div><p className="font-semibold text-slate-100">Sidebar Position</p><p className="text-slate-400 text-xs">Left or right sidebar placement</p></div>
                {editing
                  ? <Input value={form.sidebarPosition} onChange={(e) => setForm({ ...form, sidebarPosition: e.target.value })} placeholder="left | right" className="h-7 w-32 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
                  : <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{d.sidebarPosition}</span>
                }
              </div>
            </Row>
            <Row>
              <div className="flex items-center justify-between">
                <div><p className="font-semibold text-slate-100">Content Max Width</p><p className="text-slate-400 text-xs">Maximum content area width</p></div>
                {editing
                  ? <Input value={form.contentMaxWidth} onChange={(e) => setForm({ ...form, contentMaxWidth: e.target.value })} placeholder="1280px | 1440px | full" className="h-7 w-32 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
                  : <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{d.contentMaxWidth}</span>
                }
              </div>
            </Row>
            {boolFields.map(([key, title, desc]) => (
              <Row key={key}>
                <div className="flex items-center justify-between">
                  <div><p className="font-semibold text-slate-100">{title}</p><p className="text-slate-400 text-xs">{desc}</p></div>
                  {editing ? (
                    <Button size="sm" className={`h-6 text-[10px] ${form[key] ? toggleActive : toggleInactive}`} onClick={() => setForm({ ...form, [key]: !form[key] })}>{form[key] ? 'On' : 'Off'}</Button>
                  ) : (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${d[key] ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{d[key] ? 'Yes' : 'No'}</span>
                  )}
                </div>
              </Row>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

function AppearanceCustomCssView() {
  const { data, isLoading } = useProviderCustomCssV2();
  const mutation = useSaveProviderCustomCssV2();
  const d = data ?? { css: '', savedAt: '' };
  const [editing, setEditing] = useState(false);
  const [css, setCss] = useState('');

  const startEdit = () => { setCss(d.css); setEditing(true); };
  const save = () => {
    const reason = reasonPrompt('Save custom CSS');
    if (!reason) return;
    mutation.mutate({ css, reason }, { onSuccess: () => setEditing(false) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Code} title="Custom CSS" description="Advanced styling overrides for the platform" accent={accent} actions={
        editing
          ? <div className="flex gap-2"><Button size="sm" className={btnCancel} onClick={() => setEditing(false)}>Cancel</Button><Button size="sm" className={btnSave} onClick={save} disabled={mutation.isPending}>{mutation.isPending && <Spin />}Save</Button></div>
          : <Button size="sm" className={btnPrimary} onClick={startEdit}>Edit CSS</Button>
      } />
      {d.savedAt && (
        <div className="rounded border border-slate-500/20 bg-slate-800/60 px-3 py-2 text-xs text-slate-400">
          Last saved: {new Date(d.savedAt).toLocaleString()}
        </div>
      )}
      <Panel title="CSS Editor" subtitle="Changes apply globally across all tenants">
        {isLoading ? <Loading /> : (
          <div className="rounded-lg border border-slate-500/20 bg-slate-900/80 p-3">
            {editing ? (
              <textarea className="min-h-[200px] w-full resize-y rounded-lg border border-slate-700 bg-slate-800 p-3 font-mono text-[11px] text-slate-300" value={css} onChange={(e) => setCss(e.target.value)} placeholder="/* Custom CSS overrides */" />
            ) : (
              <pre className="min-h-[120px] cursor-pointer whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-800 p-3 font-mono text-[11px] text-slate-300" onClick={startEdit}>
                {d.css || '/* No custom CSS defined. Click Edit CSS to add overrides. */'}
              </pre>
            )}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}
