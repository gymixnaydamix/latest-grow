/* ─── Email Templates View ────────────────────────────────────
 * Sub-nav: All Templates | Create Template | Variables
 * ──────────────────────────────────────────────────────────── */
import { useState, useCallback, useMemo } from 'react';
import {
  Mail, Plus, Save, Trash2, Search,
  Eye, Code2, FileText, Copy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { notifySuccess, notifyError } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useTeacherEmailTemplates,
  useTeacherEmailVariables,
  useCreateEmailTemplate,
  useDeleteEmailTemplate,
} from '@/hooks/api/use-teacher';
import { TeacherSectionShell, GlassCard, MetricCard, EmptyState } from '../shared';
import type { TeacherSectionProps } from '../shared';
import type { TeacherEmailTemplate, TeacherEmailVariable } from '@root/types';

const categoryColors: Record<string, string> = {
  welcome: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  reminder: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  alert: 'bg-red-500/10 text-red-400 border-red-500/30',
  report: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  announcement: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  custom: 'bg-muted/60 text-muted-foreground border-border/50',
};

/* ── All Templates ── */
function AllEmailTemplatesView() {
  const { data: raw } = useTeacherEmailTemplates();
  const templates: TeacherEmailTemplate[] = (raw as any)?.data ?? (raw as TeacherEmailTemplate[] | undefined) ?? [];
  const deleteMut = useDeleteEmailTemplate();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string | 'all'>('all');
  const [previewId, setPreviewId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = templates;
    if (filterCat !== 'all') result = result.filter(t => t.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
    }
    return result;
  }, [templates, filterCat, search]);

  const handleDelete = useCallback((id: string) => {
    deleteMut.mutate(id, {
      onSuccess: () => notifySuccess('Deleted', 'Email template removed'),
      onError: () => notifyError('Error', 'Failed to delete template'),
    });
  }, [deleteMut]);

  const preview = previewId ? templates.find(t => t.id === previewId) : null;

  return (
    <div className="space-y-4" data-animate>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Total Templates" value={templates.length} accent="#818cf8" />
        <MetricCard label="Active" value={templates.filter(t => t.isActive).length} accent="#34d399" />
        <MetricCard label="Categories" value={new Set(templates.map(t => t.category)).size} accent="#fbbf24" />
        <MetricCard label="With Variables" value={templates.filter(t => t.variables.length > 0).length} accent="#f472b6" />
      </div>

      <GlassCard className="flex flex-wrap items-center gap-3 p-3!">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <Input placeholder="Search email templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card/80 border-border/60 text-foreground/80" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'welcome', 'reminder', 'alert', 'report', 'announcement'].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filterCat === cat ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-card/80 text-muted-foreground border border-border/50 hover:bg-muted/70'}`}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </GlassCard>

      {preview && (
        <GlassCard className="border-indigo-500/20!">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-foreground/80">Preview: {preview.name}</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setPreviewId(null)} className="text-muted-foreground">Close</Button>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Subject: <span className="text-foreground/70">{preview.subject}</span></p>
            <div className="rounded-lg border border-border/50 bg-card/60 p-3">
              <pre className="text-xs text-foreground/70 whitespace-pre-wrap font-sans leading-relaxed">{preview.body}</pre>
            </div>
            {preview.variables.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-muted-foreground">Variables:</span>
                {preview.variables.map(v => (
                  <Badge key={v} className="text-[9px] bg-indigo-500/10 text-indigo-400 border-indigo-500/30">{`{{${v}}}`}</Badge>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="No email templates" message="Create reusable email templates for common communications." icon={<Mail className="size-8" />} />
      ) : (
        <div className="space-y-2">
          {filtered.map(tpl => (
            <GlassCard key={tpl.id} className={`${!tpl.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="size-3.5 text-indigo-400" />
                    <span className="text-sm font-semibold text-foreground/80">{tpl.name}</span>
                    <Badge className={`text-[9px] ${categoryColors[tpl.category]}`}>{tpl.category}</Badge>
                    {!tpl.isActive && <Badge className="text-[9px] bg-muted/60 text-muted-foreground border-border/50">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground/70 mb-1 truncate">{tpl.subject}</p>
                  <div className="flex gap-3 text-[10px] text-muted-foreground/50">
                    <span>{tpl.variables.length} variables</span>
                    <span>Updated: {tpl.updatedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPreviewId(tpl.id === previewId ? null : tpl.id)} className="text-muted-foreground/50 hover:text-indigo-400 transition-colors">
                    <Eye className="size-4" />
                  </button>
                  <button onClick={() => handleDelete(tpl.id)} className="text-muted-foreground/50 hover:text-red-400 transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Create Template ── */
function CreateEmailTemplateView() {
  const createMut = useCreateEmailTemplate();
  const { setSubNav } = useNavigationStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<TeacherEmailTemplate['category']>('welcome');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [vars, setVars] = useState('');

  const handleCreate = useCallback(() => {
    if (!name.trim() || !subject.trim() || !body.trim()) return;
    createMut.mutate({
      name, category, subject, body,
      variables: vars.split(',').map(v => v.trim()).filter(Boolean),
      isActive: true,
    }, {
      onSuccess: () => {
        notifySuccess('Created', 'Email template created');
        setName(''); setSubject(''); setBody(''); setVars('');
        setSubNav('msg_email_all');
      },
      onError: () => notifyError('Error', 'Failed to create template'),
    });
  }, [name, category, subject, body, vars, createMut, setSubNav]);

  return (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <Plus className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">Create Email Template</h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Template name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Weekly Report" className="bg-card/80 border-border/60 text-foreground/80" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <select value={category} onChange={e => setCategory(e.target.value as TeacherEmailTemplate['category'])} className="w-full rounded-md border border-border/60 bg-card/80 text-foreground/80 text-sm px-3 py-1.5">
              <option value="welcome">Welcome</option>
              <option value="reminder">Reminder</option>
              <option value="alert">Alert</option>
              <option value="report">Report</option>
              <option value="announcement">Announcement</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Subject line *</Label>
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Use {{variable}} for dynamic content" className="bg-card/80 border-border/60 text-foreground/80" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Email body *</Label>
          <Textarea rows={10} value={body} onChange={e => setBody(e.target.value)} placeholder="Hello {{parent_name}},\n\n..." className="bg-card/80 border-border/60 text-foreground/80 resize-none font-mono text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Variables (comma-separated)</Label>
          <Input value={vars} onChange={e => setVars(e.target.value)} placeholder="parent_name, student_name, date" className="bg-card/80 border-border/60 text-foreground/80" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => setSubNav('msg_email_all')}>Cancel</Button>
          <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={handleCreate} disabled={createMut.isPending || !name.trim() || !subject.trim() || !body.trim()}>
            <Save className="size-3.5" /> Create Template
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── Variables Reference ── */
function VariablesView() {
  const { data: raw } = useTeacherEmailVariables();
  const variables: TeacherEmailVariable[] = (raw as any)?.data ?? (raw as TeacherEmailVariable[] | undefined) ?? [];

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return variables;
    const q = search.toLowerCase();
    return variables.filter(v => v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q));
  }, [variables, search]);

  const handleCopy = useCallback((name: string) => {
    navigator.clipboard.writeText(`{{${name}}}`).then(
      () => notifySuccess('Copied', `{{${name}}} copied to clipboard`),
      () => notifyError('Error', 'Failed to copy'),
    );
  }, []);

  return (
    <div className="space-y-4" data-animate>
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="size-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-foreground/80">Template Variables</h3>
        </div>
        <p className="text-xs text-muted-foreground/70 mb-3">Use these variables inside your email templates. They will be replaced with real values when emails are sent.</p>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
          <Input placeholder="Search variables..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card/80 border-border/60 text-foreground/80" />
        </div>
      </GlassCard>

      {filtered.length === 0 ? (
        <EmptyState title="No variables" message="Template variables will appear here." icon={<Code2 className="size-8" />} />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map(v => (
            <GlassCard key={v.name} className="p-3!">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <code className="text-xs font-mono text-indigo-400">{`{{${v.name}}}`}</code>
                    <button onClick={() => handleCopy(v.name)} className="text-muted-foreground/40 hover:text-indigo-400 transition-colors" title="Copy variable">
                      <Copy className="size-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60">{v.description}</p>
                  {v.example && <p className="text-[10px] text-muted-foreground/40 mt-0.5">Example: {v.example}</p>}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Export ── */
export function MsgEmailTemplatesView({ schoolId: _schoolId, teacherId: _teacherId }: TeacherSectionProps) {
  const { activeSubNav } = useNavigationStore();
  const sub = activeSubNav || 'msg_email_all';

  return (
    <TeacherSectionShell title="Email Templates" description="Create and manage reusable email templates">
      {sub === 'msg_email_all' && <AllEmailTemplatesView />}
      {sub === 'msg_email_create' && <CreateEmailTemplateView />}
      {sub === 'msg_email_variables' && <VariablesView />}
    </TeacherSectionShell>
  );
}
