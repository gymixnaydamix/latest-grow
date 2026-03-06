/* ─── ProviderSettingsSection ─── Defaults · Notifications · SLA · Legal · Email Templates · Appearance ─── */
import { useState } from 'react';
import { Bell, ClipboardList, FileClock, Loader2, Mail, Paintbrush, PlusCircle, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderSettings,
  useUpdateProviderSettings,
  useCreateProviderLegalTemplate,
  useUpdateProviderLegalTemplate,
  useCreateProviderEmailTemplate,
  useUpdateProviderEmailTemplate,
  useApplyProviderTheme,
  useSaveProviderCustomCss,
} from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, Row, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderSettingsSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'settings_defaults':         return <DefaultsView />;
    case 'settings_notifications':    return <NotificationsView />;
    case 'settings_sla':              return <SlaPoliciesView />;
    case 'settings_legal':            return <LegalView />;
    case 'settings_email_templates':  return <EmailTemplatesView />;
    case 'settings_appearance':       return <AppearanceView />;
    default: return <DefaultsView />;
  }
}

/* ── Defaults ── */
function DefaultsView() {
  const accent = getAccent('provider_settings');
  const { data: settings, isLoading } = useProviderSettings();
  const updateSettings = useUpdateProviderSettings();
  const d = settings?.defaultTenantSettings ?? { timezone: '—', locale: '—', suspensionGraceDays: 0, onboardingSlaHours: 0 };

  const [editing, setEditing] = useState(false);
  const [tz, setTz] = useState('');
  const [locale, setLocale] = useState('');
  const [grace, setGrace] = useState(0);
  const [sla, setSla] = useState(0);

  const startEdit = () => { setTz(d.timezone); setLocale(d.locale); setGrace(d.suspensionGraceDays); setSla(d.onboardingSlaHours); setEditing(true); };

  const saveDefaults = () => {
    const reason = reasonPrompt('Update tenant defaults');
    if (!reason) return;
    updateSettings.mutate({ section: 'defaults', payload: { timezone: tz, locale, suspensionGraceDays: grace, onboardingSlaHours: sla }, reason }, { onSuccess: () => setEditing(false) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={SlidersHorizontal} title="Default Configuration" description="Global defaults applied to new tenants" accent={accent} actions={
        editing
          ? <div className="flex gap-2">
              <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" className="h-7 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={saveDefaults} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Save
              </Button>
            </div>
          : <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={startEdit}>Edit Defaults</Button>
      } />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Timezone" value={d.timezone} sub="Default TZ" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Locale" value={d.locale} sub="Language" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Grace" value={`${d.suspensionGraceDays}d`} sub="Before suspension" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="SLA" value={`${d.onboardingSlaHours}h`} sub="Onboarding target" gradient="from-emerald-500/10 to-emerald-500/5" />
      </div>
      <Panel title="Tenant Provisioning Defaults" subtitle={isLoading ? 'Loading…' : 'Applied to new tenants on creation'}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-blue-400" /></div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Timezone</label>
              <Input value={editing ? tz : d.timezone} readOnly={!editing} onChange={(e) => setTz(e.target.value)} className="mt-1 h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            </div>
            <div className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Locale</label>
              <Input value={editing ? locale : d.locale} readOnly={!editing} onChange={(e) => setLocale(e.target.value)} className="mt-1 h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            </div>
            <div className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Suspension Grace Days</label>
              <Input type="number" value={editing ? grace : d.suspensionGraceDays} readOnly={!editing} onChange={(e) => setGrace(Number(e.target.value))} className="mt-1 h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            </div>
            <div className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Onboarding SLA (hours)</label>
              <Input type="number" value={editing ? sla : d.onboardingSlaHours} readOnly={!editing} onChange={(e) => setSla(Number(e.target.value))} className="mt-1 h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            </div>
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── Notifications ── */
function NotificationsView() {
  const accent = getAccent('provider_settings');
  const { data: settings, isLoading } = useProviderSettings();
  const updateSettings = useUpdateProviderSettings();
  const n = settings?.notificationRules ?? { failedPaymentReminder: [], incidentBroadcastChannels: [], slaBreachEscalation: false };

  const [editing, setEditing] = useState(false);
  const [reminders, setReminders] = useState('');
  const [channels, setChannels] = useState('');
  const [escalation, setEscalation] = useState(false);

  const startEdit = () => { setReminders(n.failedPaymentReminder.join(', ')); setChannels(n.incidentBroadcastChannels.join(', ')); setEscalation(n.slaBreachEscalation); setEditing(true); };

  const save = () => {
    const reason = reasonPrompt('Update notification rules');
    if (!reason) return;
    updateSettings.mutate({
      section: 'notificationRules',
      payload: {
        failedPaymentReminder: reminders.split(',').map((s) => Number(s.trim())).filter(Boolean),
        incidentBroadcastChannels: channels.split(',').map((s) => s.trim()).filter(Boolean),
        slaBreachEscalation: escalation,
      },
      reason,
    }, { onSuccess: () => setEditing(false) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Bell} title="Notification Rules" description="Automated alert policies and channels" accent={accent} actions={
        editing
          ? <div className="flex gap-2">
              <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" className="h-7 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={save} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Save
              </Button>
            </div>
          : <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={startEdit}>Edit Rules</Button>
      } />
      <Panel title="Alert Configuration">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-blue-400" /></div>
        ) : (
          <div className="space-y-3">
            <Row>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-100">Failed Payment Reminders</p>
                  {editing ? (
                    <Input value={reminders} onChange={(e) => setReminders(e.target.value)} placeholder="e.g. 3, 7, 14" className="mt-1 h-7 border-slate-500/40 bg-slate-700 text-xs text-slate-100 max-w-xs" />
                  ) : (
                    <p className="text-slate-400">Send dunning reminders on days: {n.failedPaymentReminder.join(', ') || 'None'}</p>
                  )}
                </div>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300">{n.failedPaymentReminder.length} steps</span>
              </div>
            </Row>
            <Row>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-slate-100">Incident Broadcast Channels</p>
                  {editing ? (
                    <Input value={channels} onChange={(e) => setChannels(e.target.value)} placeholder="e.g. email, slack, sms" className="mt-1 h-7 border-slate-500/40 bg-slate-700 text-xs text-slate-100 max-w-xs" />
                  ) : (
                    <p className="text-slate-400">Channels: {n.incidentBroadcastChannels.join(', ') || 'None'}</p>
                  )}
                </div>
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] text-blue-300">{n.incidentBroadcastChannels.length} channels</span>
              </div>
            </Row>
            <Row>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-100">SLA Breach Escalation</p>
                  <p className="text-slate-400">Auto-escalate tickets that breach SLA targets</p>
                </div>
                {editing ? (
                  <Button size="sm" className={`h-6 text-[10px] ${escalation ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`} onClick={() => setEscalation(!escalation)}>
                    {escalation ? 'Enabled' : 'Disabled'}
                  </Button>
                ) : (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${n.slaBreachEscalation ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                    {n.slaBreachEscalation ? 'Enabled' : 'Disabled'}
                  </span>
                )}
              </div>
            </Row>
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── SLA Policies ── */
function SlaPoliciesView() {
  const accent = getAccent('provider_settings');
  const { data: settings, isLoading } = useProviderSettings();
  const policies = settings?.slaPolicies ?? [];

  return (
    <SectionShell>
      <SectionPageHeader icon={FileClock} title="SLA Policies" description="Service level agreement targets" accent={accent} />
      <Panel title="Response & Resolution Targets" accentBorder="border-emerald-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-emerald-400" /></div>
        ) : policies.length === 0 ? (
          <EmptyState icon={FileClock} title="No SLA Policies" description="No service level agreements configured yet." />
        ) : (
          <div className="grid gap-2">
            {policies.map((p) => (
              <div key={p.priority} className="grid grid-cols-4 items-center rounded-lg bg-slate-800/60 px-3 py-2 text-xs">
                <span className={`font-semibold ${p.priority === 'URGENT' ? 'text-red-300' : p.priority === 'HIGH' ? 'text-amber-300' : 'text-slate-100'}`}>{p.priority}</span>
                <span className="text-slate-300">First: {p.firstResponse}</span>
                <span className="text-slate-300">Resolve: {p.resolution}</span>
                <span className="text-slate-400">{p.escalation}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── Legal Templates ── */
function LegalView() {
  const accent = getAccent('provider_settings');
  const { data: settings, isLoading } = useProviderSettings();
  const createLegal = useCreateProviderLegalTemplate();
  const updateLegal = useUpdateProviderLegalTemplate();
  const templates = settings?.legalTemplates ?? [];
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = () => {
    const reason = reasonPrompt('Create legal template');
    if (!reason) return;
    createLegal.mutate({ name, content: '', reason }, { onSuccess: () => { setShowNew(false); setName(''); } });
  };

  const handleEdit = (tpl: { id: string; name: string }) => {
    const reason = reasonPrompt(`Edit legal template "${tpl.name}"`);
    if (!reason) return;
    const newName = prompt('Template name:', tpl.name);
    if (!newName) return;
    updateLegal.mutate({ templateId: tpl.id, name: newName, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={ClipboardList} title="Legal Templates" description="Document templates for tenant agreements" accent={accent} actions={
        <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Template</Button>
      } />
      {showNew && (
        <Panel title="Create Legal Template" accentBorder="border-blue-500/20">
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" className="h-8 flex-1 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Button size="sm" className="h-8 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={handleCreate} disabled={!name.trim() || createLegal.isPending}>
              {createLegal.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <PlusCircle className="mr-1 size-3" />}Create
            </Button>
            <Button size="sm" className="h-8 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </Panel>
      )}
      <Panel title="Template Library" subtitle={isLoading ? 'Loading…' : `${templates.length} templates`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-blue-400" /></div>
        ) : templates.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No Templates" description="Create your first legal template." action={<Button size="sm" onClick={() => setShowNew(true)}>Create Template</Button>} />
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {templates.map((tpl) => (
              <div key={tpl.id} className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-100">{tpl.name}</p>
                    <p className="text-[10px] text-slate-400">ID: {tpl.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">v{tpl.version}</span>
                    <Button size="sm" className="h-6 bg-slate-700 text-slate-200 hover:bg-slate-600 text-[10px]" onClick={() => handleEdit(tpl)} disabled={updateLegal.isPending}>Edit</Button>
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Email Templates                                      */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function EmailTemplatesView() {
  const accent = getAccent('provider_settings');
  const { data: settings, isLoading } = useProviderSettings();
  const createEmail = useCreateProviderEmailTemplate();
  const updateEmail = useUpdateProviderEmailTemplate();
  const templates = settings?.emailTemplates ?? [];
  const active = templates.filter((t) => t.status === 'ACTIVE');
  const drafts = templates.filter((t) => t.status === 'DRAFT');

  const [showNew, setShowNew] = useState(false);
  const [etName, setEtName] = useState('');
  const [etTrigger, setEtTrigger] = useState('');
  const [etSubject, setEtSubject] = useState('');

  const handleCreate = () => {
    const reason = reasonPrompt('Create email template');
    if (!reason) return;
    createEmail.mutate({ name: etName, trigger: etTrigger, subject: etSubject, body: '', variables: [], reason }, { onSuccess: () => { setShowNew(false); setEtName(''); setEtTrigger(''); setEtSubject(''); } });
  };

  const handleEdit = (tpl: { id: string; name: string }) => {
    const reason = reasonPrompt(`Edit email template "${tpl.name}"`);
    if (!reason) return;
    const newSubject = prompt('Subject:', '');
    if (newSubject === null) return;
    updateEmail.mutate({ templateId: tpl.id, subject: newSubject || undefined, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Mail} title="Email Templates" description="Transactional email templates with variable substitution" accent={accent} actions={
        <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Template</Button>
      } />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Templates" value={String(templates.length)} sub="Configured" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Active" value={String(active.length)} sub="Sending" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Draft" value={String(drafts.length)} sub="Not active" gradient="from-amber-500/10 to-amber-500/5" />
      </div>
      {showNew && (
        <Panel title="Create Email Template" accentBorder="border-blue-500/20">
          <div className="grid gap-2 md:grid-cols-3">
            <Input value={etName} onChange={(e) => setEtName(e.target.value)} placeholder="Template name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Input value={etTrigger} onChange={(e) => setEtTrigger(e.target.value)} placeholder="Trigger event" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Input value={etSubject} onChange={(e) => setEtSubject(e.target.value)} placeholder="Subject line" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={handleCreate} disabled={!etName.trim() || createEmail.isPending}>
              {createEmail.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create
            </Button>
          </div>
        </Panel>
      )}
      <Panel title="Template Library" subtitle={isLoading ? 'Loading…' : `${templates.length} templates`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-blue-400" /></div>
        ) : templates.length === 0 ? (
          <EmptyState icon={Mail} title="No Templates" description="Create your first email template." action={<Button size="sm" onClick={() => setShowNew(true)}>Create Template</Button>} />
        ) : (
          <div className="space-y-2">
            {templates.map((tpl) => (
              <div key={tpl.id} className={`rounded-lg border px-3 py-2 text-xs ${tpl.status === 'ACTIVE' ? 'border-slate-500/20 bg-slate-800/60' : 'border-amber-500/15 bg-amber-500/5'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-100">{tpl.name}</p>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] ${tpl.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>{tpl.status}</span>
                    </div>
                    <p className="text-slate-400 mt-0.5">Trigger: <span className="font-mono">{tpl.trigger}</span></p>
                    <p className="text-slate-400">Subject: {tpl.subject}</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] border-blue-500/30 shrink-0" onClick={() => handleEdit(tpl)} disabled={updateEmail.isPending}>Edit Template</Button>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {tpl.variables.map((v) => (
                    <span key={v} className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-blue-300">{'{{' + v + '}}'}</span>
                  ))}
                  <span className="text-[10px] text-slate-400 ml-auto">Edited: {tpl.lastEdited}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Appearance                                           */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AppearanceView() {
  const accent = getAccent('provider_settings');
  const { data: settings, isLoading } = useProviderSettings();
  const applyTheme = useApplyProviderTheme();
  const saveCss = useSaveProviderCustomCss();
  const themes = settings?.appearanceThemes ?? [];
  const [css, setCss] = useState('');
  const [cssEditing, setCssEditing] = useState(false);

  const handleApply = (name: string) => {
    const reason = reasonPrompt(`Apply theme "${name}"`);
    if (!reason) return;
    applyTheme.mutate({ themeName: name, reason });
  };

  const handleSaveCss = () => {
    const reason = reasonPrompt('Save custom CSS');
    if (!reason) return;
    saveCss.mutate({ css, reason }, { onSuccess: () => setCssEditing(false) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Paintbrush} title="Appearance" description="Platform theme and visual customization" accent={accent} />
      <Panel title="Theme Presets" subtitle={isLoading ? 'Loading…' : `${themes.length} themes available`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-blue-400" /></div>
        ) : themes.length === 0 ? (
          <EmptyState icon={Paintbrush} title="No Themes" description="No appearance themes configured yet." />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {themes.map((theme) => (
              <div key={theme.name} className={`rounded-xl border p-4 text-xs ${theme.active ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-500/20 bg-slate-800/60'}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-100">{theme.name}</p>
                  {theme.active && <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">Active</span>}
                </div>
                <div className="flex gap-2 mb-3">
                  <div className="size-8 rounded-lg border border-slate-500/30" style={{ backgroundColor: theme.primary }} title="Primary" />
                  <div className="size-8 rounded-lg border border-slate-500/30" style={{ backgroundColor: theme.sidebar }} title="Sidebar" />
                  <div className="size-8 rounded-lg border border-slate-500/30" style={{ backgroundColor: theme.text }} title="Text" />
                </div>
                <div className="flex gap-2">
                  <span className="font-mono text-[10px] text-slate-400">{theme.primary}</span>
                  {!theme.active && (
                    <Button size="sm" className="h-6 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30 text-[10px] ml-auto" onClick={() => handleApply(theme.name)} disabled={applyTheme.isPending}>
                      {applyTheme.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Apply
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Panel title="Custom CSS" subtitle="Advanced styling overrides">
        <div className="rounded-lg border border-slate-500/20 bg-slate-900/80 p-3">
          <p className="text-xs text-slate-400 mb-2">Add custom CSS to override platform styles. Changes apply globally across all tenants.</p>
          {cssEditing ? (
            <textarea className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 font-mono text-[11px] text-slate-300 min-h-[80px] resize-y" value={css} onChange={(e) => setCss(e.target.value)} placeholder="/* Custom CSS overrides */" />
          ) : (
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 font-mono text-[11px] text-slate-300 min-h-[80px] cursor-pointer" onClick={() => setCssEditing(true)}>
              <p className="text-slate-500">/* Custom CSS overrides */</p>
              <p className="text-slate-500">/* Click to edit */</p>
            </div>
          )}
          <div className="mt-2 flex justify-end gap-2">
            {cssEditing && <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setCssEditing(false)}>Cancel</Button>}
            <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={cssEditing ? handleSaveCss : () => setCssEditing(true)} disabled={saveCss.isPending}>
              {saveCss.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}{cssEditing ? 'Save Changes' : 'Edit CSS'}
            </Button>
          </div>
        </div>
      </Panel>
    </SectionShell>
  );
}
