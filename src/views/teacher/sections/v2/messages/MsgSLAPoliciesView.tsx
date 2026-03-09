/* ─── SLA Policies View ───────────────────────────────────────
 * Sub-nav: Active Policies | Create Policy | Escalation Rules
 * ──────────────────────────────────────────────────────────── */
import { useState, useCallback, useMemo } from 'react';
import {
  Clock, Plus, Save, Trash2, Search,
  AlertTriangle, ArrowUpRight,
  ToggleLeft, ToggleRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { notifySuccess, notifyError } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useTeacherSLAPolicies,
  useTeacherSLAEscalationRules,
  useCreateSLAPolicy,
  useDeleteSLAPolicy,
  useCreateSLAEscalationRule,
  useDeleteSLAEscalationRule,
} from '@/hooks/api/use-teacher';
import { TeacherSectionShell, GlassCard, MetricCard, EmptyState } from '../shared';
import type { TeacherSectionProps } from '../shared';
import type { TeacherSLAPolicy, TeacherSLAEscalationRule } from '@root/types';

const priorityColors: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const categoryLabels: Record<string, string> = {
  parent: 'Parent', student: 'Student', admin: 'Admin', staff: 'Staff', urgent: 'Urgent',
};

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  if (min < 1440) return `${Math.round(min / 60)}h`;
  return `${Math.round(min / 1440)}d`;
}

/* ── Toggle ── */
function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center gap-2 group">
      {value ? <ToggleRight className="size-5 text-indigo-400" /> : <ToggleLeft className="size-5 text-muted-foreground/60" />}
      <span className="text-sm text-foreground/70">{label}</span>
    </button>
  );
}

/* ── Active Policies ── */
function ActivePoliciesView() {
  const { data: raw } = useTeacherSLAPolicies();
  const policies: TeacherSLAPolicy[] = (raw as any)?.data ?? (raw as TeacherSLAPolicy[] | undefined) ?? [];
  const deleteMut = useDeleteSLAPolicy();

  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search.trim()) return policies;
    const q = search.toLowerCase();
    return policies.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [policies, search]);

  const activePolicies = filtered.filter(p => p.enabled);
  const inactivePolicies = filtered.filter(p => !p.enabled);

  const handleDelete = useCallback((id: string) => {
    deleteMut.mutate(id, {
      onSuccess: () => notifySuccess('Deleted', 'SLA policy removed'),
      onError: () => notifyError('Error', 'Failed to delete policy'),
    });
  }, [deleteMut]);

  return (
    <div className="space-y-4" data-animate>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Total Policies" value={policies.length} accent="#818cf8" />
        <MetricCard label="Active" value={policies.filter(p => p.enabled).length} accent="#34d399" />
        <MetricCard label="Categories" value={new Set(policies.map(p => p.category)).size} accent="#fbbf24" />
        <MetricCard label="Avg Response" value={policies.length ? `${formatMinutes(Math.round(policies.reduce((s, p) => s + p.responseTimeMinutes, 0) / policies.length))}` : '-'} accent="#f472b6" />
      </div>

      <GlassCard className="p-3!">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <Input placeholder="Search policies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card/80 border-border/60 text-foreground/80" />
        </div>
      </GlassCard>

      {filtered.length === 0 ? (
        <EmptyState title="No policies" message="Create SLA policies to manage response time expectations." icon={<Clock className="size-8" />} />
      ) : (
        <div className="space-y-2">
          {[...activePolicies, ...inactivePolicies].map(policy => (
            <GlassCard key={policy.id} className={`${!policy.enabled ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="size-3.5 text-indigo-400" />
                    <span className="text-sm font-semibold text-foreground/80">{policy.name}</span>
                    <Badge className={`text-[9px] ${priorityColors[policy.priority]}`}>{policy.priority}</Badge>
                    <Badge className="text-[9px] bg-muted/60 text-muted-foreground border-border/50">{categoryLabels[policy.category]}</Badge>
                  </div>
                  {policy.description && <p className="text-xs text-muted-foreground/70 mb-2">{policy.description}</p>}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Response: <strong className="text-foreground/70">{formatMinutes(policy.responseTimeMinutes)}</strong></span>
                    <span>Resolution: <strong className="text-foreground/70">{formatMinutes(policy.resolutionTimeMinutes)}</strong></span>
                    <span>Created: {policy.createdAt}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(policy.id)} className="text-muted-foreground/50 hover:text-red-400 transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Create Policy ── */
function CreatePolicyView() {
  const createMut = useCreateSLAPolicy();
  const { setSubNav } = useNavigationStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TeacherSLAPolicy['category']>('parent');
  const [responseTime, setResponseTime] = useState(480);
  const [resolutionTime, setResolutionTime] = useState(1440);
  const [priority, setPriority] = useState<TeacherSLAPolicy['priority']>('medium');
  const [enabled, setEnabled] = useState(true);

  const handleCreate = useCallback(() => {
    if (!name.trim()) return;
    createMut.mutate({ name, description, category, responseTimeMinutes: responseTime, resolutionTimeMinutes: resolutionTime, priority, enabled }, {
      onSuccess: () => {
        notifySuccess('Created', 'SLA policy created successfully');
        setName(''); setDescription(''); setResponseTime(480); setResolutionTime(1440);
        setSubNav('msg_sla_active');
      },
      onError: () => notifyError('Error', 'Failed to create policy'),
    });
  }, [name, description, category, responseTime, resolutionTime, priority, enabled, createMut, setSubNav]);

  return (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <Plus className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">Create SLA Policy</h3>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Policy name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Parent Communication SLA" className="bg-card/80 border-border/60 text-foreground/80" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what this policy covers..." className="bg-card/80 border-border/60 text-foreground/80 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <select value={category} onChange={e => setCategory(e.target.value as TeacherSLAPolicy['category'])} className="w-full rounded-md border border-border/60 bg-card/80 text-foreground/80 text-sm px-3 py-1.5">
              {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Priority</Label>
            <select value={priority} onChange={e => setPriority(e.target.value as TeacherSLAPolicy['priority'])} className="w-full rounded-md border border-border/60 bg-card/80 text-foreground/80 text-sm px-3 py-1.5">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Response time (minutes)</Label>
            <Input type="number" value={responseTime} onChange={e => setResponseTime(Number(e.target.value))} className="bg-card/80 border-border/60 text-foreground/80" />
            <p className="text-[10px] text-muted-foreground/50">= {formatMinutes(responseTime)}</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Resolution time (minutes)</Label>
            <Input type="number" value={resolutionTime} onChange={e => setResolutionTime(Number(e.target.value))} className="bg-card/80 border-border/60 text-foreground/80" />
            <p className="text-[10px] text-muted-foreground/50">= {formatMinutes(resolutionTime)}</p>
          </div>
        </div>
        <Toggle value={enabled} onChange={setEnabled} label="Enable policy immediately" />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => setSubNav('msg_sla_active')}>Cancel</Button>
          <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={handleCreate} disabled={createMut.isPending || !name.trim()}>
            <Save className="size-3.5" /> Create Policy
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── Escalation Rules ── */
function EscalationRulesView() {
  const { data: raw } = useTeacherSLAEscalationRules();
  const rules: TeacherSLAEscalationRule[] = (raw as any)?.data ?? (raw as TeacherSLAEscalationRule[] | undefined) ?? [];
  const createMut = useCreateSLAEscalationRule();
  const deleteMut = useDeleteSLAEscalationRule();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState(240);
  const [escalateTo, setEscalateTo] = useState('');
  const [notifyVia, setNotifyVia] = useState<TeacherSLAEscalationRule['notifyVia']>('email');

  const handleCreate = useCallback(() => {
    if (!name.trim() || !escalateTo.trim()) return;
    createMut.mutate({ name, triggerAfterMinutes: trigger, escalateTo, notifyVia, policyId: null, enabled: true }, {
      onSuccess: () => { notifySuccess('Created', 'Escalation rule added'); setName(''); setEscalateTo(''); setShowAdd(false); },
      onError: () => notifyError('Error', 'Failed to create rule'),
    });
  }, [name, trigger, escalateTo, notifyVia, createMut]);

  const handleDelete = useCallback((id: string) => {
    deleteMut.mutate(id, {
      onSuccess: () => notifySuccess('Deleted', 'Escalation rule removed'),
      onError: () => notifyError('Error', 'Failed to delete rule'),
    });
  }, [deleteMut]);

  return (
    <div className="space-y-4" data-animate>
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="size-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-foreground/80">Escalation Rules</h3>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowAdd(!showAdd)} className="gap-1 text-indigo-300 hover:text-indigo-200">
            <Plus className="size-3.5" /> Add Rule
          </Button>
        </div>

        {showAdd && (
          <div className="mb-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-3">
            <Input placeholder="Rule name..." value={name} onChange={e => setName(e.target.value)} className="bg-card/80 border-border/60 text-foreground/80" />
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Trigger after (min)</Label>
                <Input type="number" value={trigger} onChange={e => setTrigger(Number(e.target.value))} className="bg-card/80 border-border/60 text-foreground/80" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Escalate to</Label>
                <Input value={escalateTo} onChange={e => setEscalateTo(e.target.value)} placeholder="Person/role" className="bg-card/80 border-border/60 text-foreground/80" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Notify via</Label>
                <select value={notifyVia} onChange={e => setNotifyVia(e.target.value as TeacherSLAEscalationRule['notifyVia'])} className="w-full rounded-md border border-border/60 bg-card/80 text-foreground/80 text-sm px-3 py-1.5">
                  <option value="email">Email</option>
                  <option value="push">Push</option>
                  <option value="sms">SMS</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" onClick={handleCreate} disabled={createMut.isPending}>Add</Button>
            </div>
          </div>
        )}

        {rules.length === 0 ? (
          <EmptyState title="No escalation rules" message="Add rules to automatically escalate SLA breaches." icon={<AlertTriangle className="size-8" />} />
        ) : (
          <div className="space-y-2">
            {rules.map(rule => (
              <div key={rule.id} className={`flex items-center justify-between rounded-xl border border-border/50 bg-card/60 px-4 py-3 ${!rule.enabled ? 'opacity-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-foreground/80">{rule.name}</span>
                    <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/30">{formatMinutes(rule.triggerAfterMinutes)}</Badge>
                    <Badge className="text-[9px] bg-sky-500/10 text-sky-400 border-sky-500/30">{rule.notifyVia}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground/60">Escalate to: {rule.escalateTo}</p>
                </div>
                <button onClick={() => handleDelete(rule.id)} className="text-muted-foreground/50 hover:text-red-400 transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

/* ── Main Export ── */
export function MsgSLAPoliciesView({ schoolId: _schoolId, teacherId: _teacherId }: TeacherSectionProps) {
  const { activeSubNav } = useNavigationStore();
  const sub = activeSubNav || 'msg_sla_active';

  return (
    <TeacherSectionShell title="SLA Policies" description="Define response time expectations for different message categories">
      {sub === 'msg_sla_active' && <ActivePoliciesView />}
      {sub === 'msg_sla_create' && <CreatePolicyView />}
      {sub === 'msg_sla_escalation' && <EscalationRulesView />}
    </TeacherSectionShell>
  );
}
