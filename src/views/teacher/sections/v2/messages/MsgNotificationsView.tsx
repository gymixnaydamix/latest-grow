/* ─── Notifications View ──────────────────────────────────────
 * Sub-nav: Channels | Rules | Quiet Hours
 * ──────────────────────────────────────────────────────────── */
import { useState, useCallback, useMemo } from 'react';
import {
  Bell, Mail, Smartphone, Monitor, MessageSquare,
  Save, Plus, Trash2, ToggleLeft, ToggleRight,
  Moon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { notifySuccess, notifyError } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useTeacherMsgNotifChannels,
  useTeacherMsgNotifRules,
  useTeacherMsgQuietHours,
  useUpdateMsgNotifChannels,
  useUpdateMsgNotifRules,
  useUpdateMsgQuietHours,
} from '@/hooks/api/use-teacher';
import { TeacherSectionShell, GlassCard, EmptyState } from '../shared';
import type { TeacherSectionProps } from '../shared';
import type { TeacherMsgNotifChannels, TeacherMsgNotifRule, TeacherMsgQuietHours } from '@root/types';

/* ── Toggle ── */
function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center gap-2 group">
      {value ? <ToggleRight className="size-5 text-indigo-400" /> : <ToggleLeft className="size-5 text-muted-foreground/60" />}
      <span className="text-sm text-foreground/70">{label}</span>
    </button>
  );
}

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail className="size-4 text-amber-400" />,
  push: <Smartphone className="size-4 text-emerald-400" />,
  inApp: <Monitor className="size-4 text-sky-400" />,
  sms: <MessageSquare className="size-4 text-pink-400" />,
};

const conditionLabels: Record<string, string> = {
  all_messages: 'All Messages',
  urgent_only: 'Urgent Only',
  from_parents: 'From Parents',
  from_admin: 'From Admin',
  from_students: 'From Students',
  mentions: 'Mentions',
};

const actionLabels: Record<string, string> = {
  notify_immediately: 'Immediate',
  digest_hourly: 'Hourly Digest',
  digest_daily: 'Daily Digest',
  silent: 'Silent',
};

const actionColors: Record<string, string> = {
  notify_immediately: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  digest_hourly: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  digest_daily: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  silent: 'bg-muted/60 text-muted-foreground border-border/50',
};

/* ── Channels ── */
function ChannelsView() {
  const { data: raw } = useTeacherMsgNotifChannels();
  const channels: TeacherMsgNotifChannels | null = (raw as any)?.data ?? (raw as TeacherMsgNotifChannels | undefined) ?? null;
  const updateMut = useUpdateMsgNotifChannels();

  const [form, setForm] = useState<Partial<TeacherMsgNotifChannels>>({});
  const merged = useMemo(() => ({ ...channels, ...form }), [channels, form]);

  const handleSave = useCallback(() => {
    if (!Object.keys(form).length) return;
    updateMut.mutate(form, {
      onSuccess: () => { notifySuccess('Saved', 'Notification channels updated'); setForm({}); },
      onError: () => notifyError('Error', 'Failed to save'),
    });
  }, [form, updateMut]);

  if (!channels) return <EmptyState title="Loading..." message="Fetching notification channels" icon={<Bell className="size-8" />} />;

  return (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <Bell className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">Notification Channels</h3>
      </div>
      <div className="space-y-4">
        {(['email', 'push', 'inApp', 'sms'] as const).map(ch => (
          <div key={ch} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 px-4 py-3">
            <div className="flex items-center gap-3">
              {channelIcons[ch]}
              <span className="text-sm font-medium text-foreground/80 capitalize">{ch === 'inApp' ? 'In-App' : ch === 'sms' ? 'SMS' : ch}</span>
            </div>
            <Toggle value={merged[ch] ?? false} onChange={v => setForm(p => ({ ...p, [ch]: v }))} label="" />
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={handleSave} disabled={updateMut.isPending || !Object.keys(form).length}>
            <Save className="size-3.5" /> Save
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── Rules ── */
function RulesView() {
  const { data: raw } = useTeacherMsgNotifRules();
  const rules: TeacherMsgNotifRule[] = (raw as any)?.data ?? (raw as TeacherMsgNotifRule[] | undefined) ?? [];
  const updateMut = useUpdateMsgNotifRules();

  const [localRules, setLocalRules] = useState<TeacherMsgNotifRule[] | null>(null);
  const effective = localRules ?? rules;

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCondition, setNewCondition] = useState<TeacherMsgNotifRule['condition']>('all_messages');
  const [newAction, setNewAction] = useState<TeacherMsgNotifRule['action']>('notify_immediately');

  const handleToggleRule = useCallback((id: string) => {
    setLocalRules(prev => {
      const base = prev ?? rules;
      return base.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    });
  }, [rules]);

  const handleDeleteRule = useCallback((id: string) => {
    setLocalRules(prev => (prev ?? rules).filter(r => r.id !== id));
  }, [rules]);

  const handleAdd = useCallback(() => {
    if (!newName.trim()) return;
    const rule: TeacherMsgNotifRule = { id: `nr-new-${Date.now()}`, name: newName.trim(), condition: newCondition, action: newAction, enabled: true };
    setLocalRules(prev => [...(prev ?? rules), rule]);
    setNewName(''); setShowAdd(false);
  }, [newName, newCondition, newAction, rules]);

  const handleSave = useCallback(() => {
    if (!localRules) return;
    updateMut.mutate({ rules: localRules }, {
      onSuccess: () => { notifySuccess('Saved', 'Notification rules updated'); setLocalRules(null); },
      onError: () => notifyError('Error', 'Failed to save rules'),
    });
  }, [localRules, updateMut]);

  return (
    <GlassCard data-animate>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-foreground/80">Notification Rules</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setShowAdd(!showAdd)} className="gap-1 text-indigo-300 hover:text-indigo-200">
          <Plus className="size-3.5" /> Add Rule
        </Button>
      </div>

      {showAdd && (
        <div className="mb-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-3">
          <Input placeholder="Rule name..." value={newName} onChange={e => setNewName(e.target.value)} className="bg-card/80 border-border/60 text-foreground/80" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Condition</Label>
              <select value={newCondition} onChange={e => setNewCondition(e.target.value as TeacherMsgNotifRule['condition'])} className="w-full rounded-md border border-border/60 bg-card/80 text-foreground/80 text-sm px-3 py-1.5">
                {Object.entries(conditionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Action</Label>
              <select value={newAction} onChange={e => setNewAction(e.target.value as TeacherMsgNotifRule['action'])} className="w-full rounded-md border border-border/60 bg-card/80 text-foreground/80 text-sm px-3 py-1.5">
                {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" onClick={handleAdd}>Add</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {effective.length === 0 ? (
          <EmptyState title="No rules" message="Add notification rules to customize how you receive messages." icon={<Bell className="size-8" />} />
        ) : (
          effective.map(rule => (
            <div key={rule.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-medium ${rule.enabled ? 'text-foreground/80' : 'text-muted-foreground/50 line-through'}`}>{rule.name}</span>
                  <Badge className={`text-[9px] ${actionColors[rule.action]}`}>{actionLabels[rule.action]}</Badge>
                </div>
                <p className="text-xs text-muted-foreground/60">{conditionLabels[rule.condition]}</p>
              </div>
              <div className="flex items-center gap-2">
                <Toggle value={rule.enabled} onChange={() => handleToggleRule(rule.id)} label="" />
                <button onClick={() => handleDeleteRule(rule.id)} className="text-muted-foreground/50 hover:text-red-400 transition-colors">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {localRules && (
        <div className="flex justify-end pt-4">
          <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={handleSave} disabled={updateMut.isPending}>
            <Save className="size-3.5" /> Save Rules
          </Button>
        </div>
      )}
    </GlassCard>
  );
}

/* ── Quiet Hours ── */
function QuietHoursView() {
  const { data: raw } = useTeacherMsgQuietHours();
  const quietHours: TeacherMsgQuietHours | null = (raw as any)?.data ?? (raw as TeacherMsgQuietHours | undefined) ?? null;
  const updateMut = useUpdateMsgQuietHours();

  const [form, setForm] = useState<Partial<TeacherMsgQuietHours>>({});
  const merged = useMemo(() => ({ ...quietHours, ...form }), [quietHours, form]);

  const handleSave = useCallback(() => {
    if (!Object.keys(form).length) return;
    updateMut.mutate(form, {
      onSuccess: () => { notifySuccess('Saved', 'Quiet hours updated'); setForm({}); },
      onError: () => notifyError('Error', 'Failed to save'),
    });
  }, [form, updateMut]);

  if (!quietHours) return <EmptyState title="Loading..." message="Fetching quiet hours" icon={<Moon className="size-8" />} />;

  return (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <Moon className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">Quiet Hours</h3>
      </div>
      <div className="space-y-5">
        <Toggle value={merged.enabled ?? false} onChange={v => setForm(p => ({ ...p, enabled: v }))} label="Enable quiet hours" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Start time</Label>
            <Input type="time" value={merged.startTime ?? '20:00'} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className="bg-card/80 border-border/60 text-foreground/80" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">End time</Label>
            <Input type="time" value={merged.endTime ?? '07:00'} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className="bg-card/80 border-border/60 text-foreground/80" />
          </div>
        </div>
        <Toggle value={merged.weekendsOnly ?? false} onChange={v => setForm(p => ({ ...p, weekendsOnly: v }))} label="Weekends only" />
        <Toggle value={merged.allowUrgent ?? true} onChange={v => setForm(p => ({ ...p, allowUrgent: v }))} label="Allow urgent messages through" />
        <div className="flex justify-end pt-2">
          <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={handleSave} disabled={updateMut.isPending || !Object.keys(form).length}>
            <Save className="size-3.5" /> Save
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── Main Export ── */
export function MsgNotificationsView({ schoolId: _schoolId, teacherId: _teacherId }: TeacherSectionProps) {
  const { activeSubNav } = useNavigationStore();
  const sub = activeSubNav || 'msg_notif_channels';

  return (
    <TeacherSectionShell title="Notifications" description="Control how and when you receive message notifications">
      {sub === 'msg_notif_channels' && <ChannelsView />}
      {sub === 'msg_notif_rules' && <RulesView />}
      {sub === 'msg_quiet_hours' && <QuietHoursView />}
    </TeacherSectionShell>
  );
}
