/* ─── Defaults View ───────────────────────────────────────────
 * Sub-nav: General | Reply Settings | Scheduling
 * ──────────────────────────────────────────────────────────── */
import { useState, useCallback, useMemo } from 'react';
import {
  Settings, MessageSquare, Clock, Save,
  ToggleLeft, ToggleRight, Plus, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { notifySuccess, notifyError } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useTeacherMsgDefaults,
  useTeacherMsgReplySettings,
  useTeacherMsgScheduling,
  useUpdateMsgDefaults,
  useUpdateMsgReplySettings,
  useUpdateMsgScheduling,
} from '@/hooks/api/use-teacher';
import { TeacherSectionShell, GlassCard, EmptyState } from '../shared';
import type { TeacherSectionProps } from '../shared';
import type {
  TeacherMsgDefaults,
  TeacherMsgReplySettings,
  TeacherMsgScheduling,
} from '@root/types';

/* ── Toggle Switch ── */
function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center gap-2 group">
      {value
        ? <ToggleRight className="size-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
        : <ToggleLeft className="size-5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />}
      <span className="text-sm text-foreground/70">{label}</span>
    </button>
  );
}

/* ── General Defaults ── */
function GeneralDefaults() {
  const { data: raw } = useTeacherMsgDefaults();
  const defaults: TeacherMsgDefaults | null = (raw as any)?.data ?? (raw as TeacherMsgDefaults | undefined) ?? null;
  const updateMut = useUpdateMsgDefaults();

  const [form, setForm] = useState<Partial<TeacherMsgDefaults>>({});
  const merged = useMemo(() => ({ ...defaults, ...form }), [defaults, form]);

  const handleSave = useCallback(() => {
    if (!Object.keys(form).length) return;
    updateMut.mutate(form, {
      onSuccess: () => { notifySuccess('Saved', 'Default settings updated'); setForm({}); },
      onError: () => notifyError('Error', 'Failed to save defaults'),
    });
  }, [form, updateMut]);

  if (!defaults) return <EmptyState title="Loading..." message="Fetching default settings" icon={<Settings className="size-8" />} />;

  return (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <Settings className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">General Defaults</h3>
      </div>
      <div className="space-y-5">
        <Toggle value={merged.autoReplyEnabled ?? false} onChange={v => setForm(p => ({ ...p, autoReplyEnabled: v }))} label="Auto-reply enabled" />
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Auto-reply message</Label>
          <Textarea rows={3} value={merged.autoReplyMessage ?? ''} onChange={e => setForm(p => ({ ...p, autoReplyMessage: e.target.value }))} className="bg-card/80 border-border/60 text-foreground/80 resize-none" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Default signature</Label>
          <Textarea rows={3} value={merged.defaultSignature ?? ''} onChange={e => setForm(p => ({ ...p, defaultSignature: e.target.value }))} className="bg-card/80 border-border/60 text-foreground/80 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Thread retention (days)</Label>
            <Input type="number" value={merged.threadRetentionDays ?? 365} onChange={e => setForm(p => ({ ...p, threadRetentionDays: Number(e.target.value) }))} className="bg-card/80 border-border/60 text-foreground/80" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max attachment size (MB)</Label>
            <Input type="number" value={merged.maxAttachmentSizeMb ?? 25} onChange={e => setForm(p => ({ ...p, maxAttachmentSizeMb: Number(e.target.value) }))} className="bg-card/80 border-border/60 text-foreground/80" />
          </div>
        </div>
        <div className="space-y-3">
          <Toggle value={merged.allowStudentMessages ?? true} onChange={v => setForm(p => ({ ...p, allowStudentMessages: v }))} label="Allow student messages" />
          <Toggle value={merged.allowParentMessages ?? true} onChange={v => setForm(p => ({ ...p, allowParentMessages: v }))} label="Allow parent messages" />
          <Toggle value={merged.requireApproval ?? false} onChange={v => setForm(p => ({ ...p, requireApproval: v }))} label="Require approval before sending" />
        </div>
        <div className="flex justify-end pt-2">
          <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={handleSave} disabled={updateMut.isPending || !Object.keys(form).length}>
            <Save className="size-3.5" /> Save Defaults
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── Reply Settings ── */
function ReplySettingsView() {
  const { data: raw } = useTeacherMsgReplySettings();
  const settings: TeacherMsgReplySettings | null = (raw as any)?.data ?? (raw as TeacherMsgReplySettings | undefined) ?? null;
  const updateMut = useUpdateMsgReplySettings();

  const [form, setForm] = useState<Partial<TeacherMsgReplySettings>>({});
  const [newQuickReply, setNewQuickReply] = useState('');
  const merged = useMemo(() => ({ ...settings, ...form }), [settings, form]);

  const handleAddQuickReply = useCallback(() => {
    if (!newQuickReply.trim()) return;
    const existing = merged.quickReplies ?? [];
    setForm(p => ({ ...p, quickReplies: [...existing, newQuickReply.trim()] }));
    setNewQuickReply('');
  }, [newQuickReply, merged.quickReplies]);

  const handleRemoveQuickReply = useCallback((idx: number) => {
    const existing = merged.quickReplies ?? [];
    setForm(p => ({ ...p, quickReplies: existing.filter((_, i) => i !== idx) }));
  }, [merged.quickReplies]);

  const handleSave = useCallback(() => {
    if (!Object.keys(form).length) return;
    updateMut.mutate(form, {
      onSuccess: () => { notifySuccess('Saved', 'Reply settings updated'); setForm({}); },
      onError: () => notifyError('Error', 'Failed to save reply settings'),
    });
  }, [form, updateMut]);

  if (!settings) return <EmptyState title="Loading..." message="Fetching reply settings" icon={<MessageSquare className="size-8" />} />;

  return (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <MessageSquare className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">Reply Settings</h3>
      </div>
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Default reply mode</Label>
          <div className="flex gap-2">
            {(['reply', 'reply_all'] as const).map(mode => (
              <button key={mode} onClick={() => setForm(p => ({ ...p, defaultReplyMode: mode }))} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${merged.defaultReplyMode === mode ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-card/80 text-muted-foreground border border-border/50 hover:bg-muted/70'}`}>
                {mode === 'reply' ? 'Reply' : 'Reply All'}
              </button>
            ))}
          </div>
        </div>
        <Toggle value={merged.includeOriginal ?? true} onChange={v => setForm(p => ({ ...p, includeOriginal: v }))} label="Include original message in reply" />
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick replies</Label>
          <div className="space-y-1.5">
            {(merged.quickReplies ?? []).map((reply, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/60 px-3 py-2">
                <span className="flex-1 text-xs text-foreground/70 truncate">{reply}</span>
                <button onClick={() => handleRemoveQuickReply(i)} className="text-muted-foreground/50 hover:text-red-400 transition-colors">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Add quick reply..." value={newQuickReply} onChange={e => setNewQuickReply(e.target.value)} className="flex-1 bg-card/80 border-border/60 text-foreground/80" onKeyDown={e => e.key === 'Enter' && handleAddQuickReply()} />
            <Button size="sm" variant="ghost" onClick={handleAddQuickReply} className="gap-1 text-indigo-300 hover:text-indigo-200"><Plus className="size-3.5" /> Add</Button>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={handleSave} disabled={updateMut.isPending || !Object.keys(form).length}>
            <Save className="size-3.5" /> Save
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── Scheduling ── */
function SchedulingView() {
  const { data: raw } = useTeacherMsgScheduling();
  const scheduling: TeacherMsgScheduling | null = (raw as any)?.data ?? (raw as TeacherMsgScheduling | undefined) ?? null;
  const updateMut = useUpdateMsgScheduling();

  const [form, setForm] = useState<Partial<TeacherMsgScheduling>>({});
  const merged = useMemo(() => ({ ...scheduling, ...form }), [scheduling, form]);

  const handleSave = useCallback(() => {
    if (!Object.keys(form).length) return;
    updateMut.mutate(form, {
      onSuccess: () => { notifySuccess('Saved', 'Scheduling settings updated'); setForm({}); },
      onError: () => notifyError('Error', 'Failed to save scheduling settings'),
    });
  }, [form, updateMut]);

  if (!scheduling) return <EmptyState title="Loading..." message="Fetching scheduling settings" icon={<Clock className="size-8" />} />;

  return (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <Clock className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">Message Scheduling</h3>
      </div>
      <div className="space-y-5">
        <Toggle value={merged.schedulingEnabled ?? true} onChange={v => setForm(p => ({ ...p, schedulingEnabled: v }))} label="Enable message scheduling" />
        <Toggle value={merged.delayedSendEnabled ?? true} onChange={v => setForm(p => ({ ...p, delayedSendEnabled: v }))} label="Enable delayed send" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Send window start</Label>
            <Input type="time" value={merged.sendWindowStart ?? '07:00'} onChange={e => setForm(p => ({ ...p, sendWindowStart: e.target.value }))} className="bg-card/80 border-border/60 text-foreground/80" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Send window end</Label>
            <Input type="time" value={merged.sendWindowEnd ?? '18:00'} onChange={e => setForm(p => ({ ...p, sendWindowEnd: e.target.value }))} className="bg-card/80 border-border/60 text-foreground/80" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Timezone</Label>
          <Input value={merged.timezone ?? ''} onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))} className="bg-card/80 border-border/60 text-foreground/80" />
        </div>
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
export function MsgDefaultsView({ schoolId: _schoolId, teacherId: _teacherId }: TeacherSectionProps) {
  const { activeSubNav } = useNavigationStore();
  const sub = activeSubNav || 'msg_general';

  return (
    <TeacherSectionShell title="Message Defaults" description="Configure default messaging behavior and preferences">
      {sub === 'msg_general' && <GeneralDefaults />}
      {sub === 'msg_reply_settings' && <ReplySettingsView />}
      {sub === 'msg_scheduling' && <SchedulingView />}
    </TeacherSectionShell>
  );
}
