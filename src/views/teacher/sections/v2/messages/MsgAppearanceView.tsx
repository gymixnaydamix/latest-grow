/* ─── Appearance View ─────────────────────────────────────────
 * Sub-nav: Theme | Layout | Signature
 * ──────────────────────────────────────────────────────────── */
import { useState, useCallback, useMemo } from 'react';
import {
  Paintbrush, LayoutGrid, PenLine, Save,
  Type, Sun, Moon, Eye, AlignLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { notifySuccess, notifyError } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useTeacherMsgAppearanceTheme,
  useTeacherMsgAppearanceLayout,
  useTeacherMsgSignature,
  useUpdateMsgAppearanceTheme,
  useUpdateMsgAppearanceLayout,
  useUpdateMsgSignature,
} from '@/hooks/api/use-teacher';
import { TeacherSectionShell, GlassCard } from '../shared';
import type { TeacherSectionProps } from '../shared';
import type { TeacherMsgAppearanceTheme, TeacherMsgAppearanceLayout, TeacherMsgSignature } from '@root/types';

/* util */
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-muted/60'}`}>
        <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </label>
  );
}

/* ── Theme ── */
function ThemeView() {
  const { data: raw } = useTeacherMsgAppearanceTheme();
  const theme: TeacherMsgAppearanceTheme | undefined = (raw as any)?.data ?? (raw as TeacherMsgAppearanceTheme | undefined);
  const updateMut = useUpdateMsgAppearanceTheme();

  const defaults: TeacherMsgAppearanceTheme = {
    primaryColor: '#818cf8', sentBubbleColor: '#1e1b4b',
    receivedBubbleColor: '#0f0d1a', fontSize: 'medium', darkMode: true,
  };
  const current = theme ?? defaults;

  const [form, setForm] = useState<TeacherMsgAppearanceTheme | null>(null);
  const merged = useMemo(() => ({ ...current, ...form }), [current, form]);

  const handleSave = useCallback(() => {
    updateMut.mutate(merged, {
      onSuccess: () => { notifySuccess('Saved', 'Theme settings updated'); setForm(null); },
      onError: () => notifyError('Error', 'Failed to save theme'),
    });
  }, [merged, updateMut]);

  return (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <Paintbrush className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">Theme Settings</h3>
      </div>

      <div className="space-y-5">
        {/* Color pickers row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'primaryColor' as const, label: 'Primary Color' },
            { key: 'sentBubbleColor' as const, label: 'Sent Bubble' },
            { key: 'receivedBubbleColor' as const, label: 'Received Bubble' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={merged[key]} onChange={e => setForm(p => ({ ...(p ?? current), [key]: e.target.value }))} className="h-8 w-8 rounded-lg border border-border/60 bg-transparent cursor-pointer" />
                <Input value={merged[key]} onChange={e => setForm(p => ({ ...(p ?? current), [key]: e.target.value }))} className="bg-card/80 border-border/60 text-foreground/80 font-mono text-xs flex-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Font size */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground"><Type className="size-3 inline mr-1" />Font Size</Label>
          <div className="flex gap-2">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button key={size} onClick={() => setForm(p => ({ ...(p ?? current), fontSize: size }))} className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${merged.fontSize === size ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-card/80 text-muted-foreground border border-border/50 hover:bg-muted/70'}`}>
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dark mode */}
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/30 p-3">
          <div className="flex items-center gap-2">
            {merged.darkMode ? <Moon className="size-4 text-indigo-400" /> : <Sun className="size-4 text-amber-400" />}
            <span className="text-xs text-foreground/80">Dark Mode</span>
          </div>
          <button type="button" role="switch" aria-checked={merged.darkMode} onClick={() => setForm(p => ({ ...(p ?? current), darkMode: !merged.darkMode }))} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${merged.darkMode ? 'bg-indigo-500' : 'bg-muted/60'}`}>
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${merged.darkMode ? 'translate-x-4' : ''}`} />
          </button>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-border/50 p-4 bg-card/30">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="size-3.5 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Live Preview</span>
          </div>
          <div className="space-y-2">
            <div className="ml-auto max-w-[70%] rounded-lg p-2.5" style={{ background: merged.sentBubbleColor }}>
              <p className={`${merged.fontSize === 'small' ? 'text-xs' : merged.fontSize === 'large' ? 'text-base' : 'text-sm'}`} style={{ color: merged.primaryColor }}>Sent message preview</p>
            </div>
            <div className="mr-auto max-w-[70%] rounded-lg p-2.5" style={{ background: merged.receivedBubbleColor }}>
              <p className={`${merged.fontSize === 'small' ? 'text-xs' : merged.fontSize === 'large' ? 'text-base' : 'text-sm'} text-foreground/70`}>Received message preview</p>
            </div>
          </div>
        </div>

        <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={handleSave} disabled={updateMut.isPending || !form}>
          <Save className="size-3.5" /> Save Theme
        </Button>
      </div>
    </GlassCard>
  );
}

/* ── Layout ── */
function LayoutView() {
  const { data: raw } = useTeacherMsgAppearanceLayout();
  const layout: TeacherMsgAppearanceLayout | undefined = (raw as any)?.data ?? (raw as TeacherMsgAppearanceLayout | undefined);
  const updateMut = useUpdateMsgAppearanceLayout();

  const defaults: TeacherMsgAppearanceLayout = {
    chatListPosition: 'left', showAvatars: true, compactMode: false,
    showTimestamps: true, previewLines: 2,
  };
  const current = layout ?? defaults;

  const [form, setForm] = useState<TeacherMsgAppearanceLayout | null>(null);
  const merged = useMemo(() => ({ ...current, ...form }), [current, form]);

  const handleSave = useCallback(() => {
    updateMut.mutate(merged, {
      onSuccess: () => { notifySuccess('Saved', 'Layout settings updated'); setForm(null); },
      onError: () => notifyError('Error', 'Failed to save layout'),
    });
  }, [merged, updateMut]);

  return (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <LayoutGrid className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">Layout Settings</h3>
      </div>

      <div className="space-y-4">
        {/* Chat list position */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground"><AlignLeft className="size-3 inline mr-1" />Chat List Position</Label>
          <div className="flex gap-2">
            {(['left', 'right'] as const).map(pos => (
              <button key={pos} onClick={() => setForm(p => ({ ...(p ?? current), chatListPosition: pos }))} className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${merged.chatListPosition === pos ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-card/80 text-muted-foreground border border-border/50 hover:bg-muted/70'}`}>
                {pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="rounded-lg border border-border/50 bg-card/30 p-3 space-y-0.5">
          <Toggle label="Show Avatars" checked={merged.showAvatars} onChange={v => setForm(p => ({ ...(p ?? current), showAvatars: v }))} />
          <Toggle label="Compact Mode" checked={merged.compactMode} onChange={v => setForm(p => ({ ...(p ?? current), compactMode: v }))} />
          <Toggle label="Show Timestamps" checked={merged.showTimestamps} onChange={v => setForm(p => ({ ...(p ?? current), showTimestamps: v }))} />
        </div>

        {/* Preview lines */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Message preview lines: <span className="text-indigo-400 font-medium">{merged.previewLines}</span></Label>
          <input type="range" min={0} max={5} step={1} value={merged.previewLines} onChange={e => setForm(p => ({ ...(p ?? current), previewLines: Number(e.target.value) }))} className="w-full accent-indigo-500" />
          <div className="flex justify-between text-[10px] text-muted-foreground/50">
            <span>None</span><span>5 lines</span>
          </div>
        </div>

        <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={handleSave} disabled={updateMut.isPending || !form}>
          <Save className="size-3.5" /> Save Layout
        </Button>
      </div>
    </GlassCard>
  );
}

/* ── Signature ── */
function SignatureView() {
  const { data: raw } = useTeacherMsgSignature();
  const sig: TeacherMsgSignature | undefined = (raw as any)?.data ?? (raw as TeacherMsgSignature | undefined);
  const updateMut = useUpdateMsgSignature();

  const defaults: TeacherMsgSignature = {
    enabled: false, text: '', includeTitle: true, includePhone: false, includeSchool: true,
  };
  const current = sig ?? defaults;

  const [form, setForm] = useState<TeacherMsgSignature | null>(null);
  const merged = useMemo(() => ({ ...current, ...form }), [current, form]);

  const handleSave = useCallback(() => {
    updateMut.mutate(merged, {
      onSuccess: () => { notifySuccess('Saved', 'Signature updated'); setForm(null); },
      onError: () => notifyError('Error', 'Failed to save signature'),
    });
  }, [merged, updateMut]);

  return (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <PenLine className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">Email Signature</h3>
      </div>

      <div className="space-y-4">
        <Toggle label="Enable signature" checked={merged.enabled} onChange={v => setForm(p => ({ ...(p ?? current), enabled: v }))} />

        {merged.enabled && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Signature text</Label>
              <Textarea rows={5} value={merged.text} onChange={e => setForm(p => ({ ...(p ?? current), text: e.target.value }))} placeholder="Best regards,\nMr. Smith" className="bg-card/80 border-border/60 text-foreground/80 resize-none text-sm" />
            </div>

            <div className="rounded-lg border border-border/50 bg-card/30 p-3 space-y-0.5">
              <Toggle label="Include job title" checked={merged.includeTitle} onChange={v => setForm(p => ({ ...(p ?? current), includeTitle: v }))} />
              <Toggle label="Include phone number" checked={merged.includePhone} onChange={v => setForm(p => ({ ...(p ?? current), includePhone: v }))} />
              <Toggle label="Include school name" checked={merged.includeSchool} onChange={v => setForm(p => ({ ...(p ?? current), includeSchool: v }))} />
            </div>

            {/* Signature preview */}
            <div className="rounded-lg border border-border/50 bg-card/30 p-4">
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-2">Preview</p>
              <div className="border-t border-border/30 pt-3">
                <pre className="text-xs text-foreground/60 whitespace-pre-wrap font-sans">{merged.text || '(No signature text)'}</pre>
                {merged.includeTitle && <p className="text-[11px] text-muted-foreground/50 mt-1">Teacher, Mathematics Dept.</p>}
                {merged.includePhone && <p className="text-[11px] text-muted-foreground/50">(555) 123-4567</p>}
                {merged.includeSchool && <p className="text-[11px] text-muted-foreground/50">GrowYourNeed Academy</p>}
              </div>
            </div>
          </>
        )}

        <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={handleSave} disabled={updateMut.isPending || !form}>
          <Save className="size-3.5" /> Save Signature
        </Button>
      </div>
    </GlassCard>
  );
}

/* ── Main Export ── */
export function MsgAppearanceView({ schoolId: _schoolId, teacherId: _teacherId }: TeacherSectionProps) {
  const { activeSubNav } = useNavigationStore();
  const sub = activeSubNav || 'msg_theme';

  return (
    <TeacherSectionShell title="Appearance" description="Customize the look and feel of your messaging interface">
      {sub === 'msg_theme' && <ThemeView />}
      {sub === 'msg_layout' && <LayoutView />}
      {sub === 'msg_signature' && <SignatureView />}
    </TeacherSectionShell>
  );
}
