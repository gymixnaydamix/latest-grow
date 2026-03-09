/* ─── Legal Templates View ────────────────────────────────────
 * Sub-nav: All Templates | Create Template | Categories
 * ──────────────────────────────────────────────────────────── */
import { useState, useCallback, useMemo } from 'react';
import {
  Scale, Plus, Save, Trash2, Search,
  FileText, Eye, FolderOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { notifySuccess, notifyError } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useTeacherLegalTemplates,
  useTeacherLegalCategories,
  useCreateLegalTemplate,
  useDeleteLegalTemplate,
} from '@/hooks/api/use-teacher';
import { TeacherSectionShell, GlassCard, MetricCard, EmptyState } from '../shared';
import type { TeacherSectionProps } from '../shared';
import type { TeacherLegalTemplate, TeacherLegalCategory } from '@root/types';

const categoryColors: Record<string, string> = {
  consent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  privacy: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  liability: 'bg-red-500/10 text-red-400 border-red-500/30',
  agreement: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  notice: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  other: 'bg-muted/60 text-muted-foreground border-border/50',
};

/* ── All Templates ── */
function AllTemplatesView() {
  const { data: raw } = useTeacherLegalTemplates();
  const templates: TeacherLegalTemplate[] = (raw as any)?.data ?? (raw as TeacherLegalTemplate[] | undefined) ?? [];
  const deleteMut = useDeleteLegalTemplate();

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
      onSuccess: () => notifySuccess('Deleted', 'Legal template removed'),
      onError: () => notifyError('Error', 'Failed to delete template'),
    });
  }, [deleteMut]);

  const previewTemplate = previewId ? templates.find(t => t.id === previewId) : null;

  return (
    <div className="space-y-4" data-animate>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Total Templates" value={templates.length} accent="#818cf8" />
        <MetricCard label="Active" value={templates.filter(t => t.isActive).length} accent="#34d399" />
        <MetricCard label="Categories" value={new Set(templates.map(t => t.category)).size} accent="#fbbf24" />
        <MetricCard label="Consent Forms" value={templates.filter(t => t.category === 'consent').length} accent="#f472b6" />
      </div>

      <GlassCard className="flex flex-wrap items-center gap-3 p-3!">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <Input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card/80 border-border/60 text-foreground/80" />
        </div>
        <div className="flex gap-1.5">
          {['all', 'consent', 'privacy', 'liability', 'agreement', 'notice'].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filterCat === cat ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-card/80 text-muted-foreground border border-border/50 hover:bg-muted/70'}`}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </GlassCard>

      {previewTemplate && (
        <GlassCard className="border-indigo-500/20!">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-foreground/80">Preview: {previewTemplate.name}</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setPreviewId(null)} className="text-muted-foreground">Close</Button>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Subject: <span className="text-foreground/70">{previewTemplate.subject}</span></p>
            <div className="rounded-lg border border-border/50 bg-card/60 p-3">
              <pre className="text-xs text-foreground/70 whitespace-pre-wrap font-sans leading-relaxed">{previewTemplate.body}</pre>
            </div>
            {previewTemplate.requiredFields.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-muted-foreground">Variables:</span>
                {previewTemplate.requiredFields.map(f => (
                  <Badge key={f} className="text-[9px] bg-indigo-500/10 text-indigo-400 border-indigo-500/30">{`{{${f}}}`}</Badge>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="No templates" message="Create legal templates for consent forms, notices, and agreements." icon={<Scale className="size-8" />} />
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
                    <span>{tpl.requiredFields.length} variables</span>
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
function CreateLegalTemplateView() {
  const createMut = useCreateLegalTemplate();
  const { setSubNav } = useNavigationStore();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<TeacherLegalTemplate['category']>('consent');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fields, setFields] = useState('');

  const handleCreate = useCallback(() => {
    if (!name.trim() || !subject.trim() || !body.trim()) return;
    createMut.mutate({
      name, category, subject, body,
      requiredFields: fields.split(',').map(f => f.trim()).filter(Boolean),
      isActive: true,
    }, {
      onSuccess: () => {
        notifySuccess('Created', 'Legal template created');
        setName(''); setSubject(''); setBody(''); setFields('');
        setSubNav('msg_legal_all');
      },
      onError: () => notifyError('Error', 'Failed to create template'),
    });
  }, [name, category, subject, body, fields, createMut, setSubNav]);

  return (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <Plus className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">Create Legal Template</h3>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Template name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Field Trip Consent" className="bg-card/80 border-border/60 text-foreground/80" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <select value={category} onChange={e => setCategory(e.target.value as TeacherLegalTemplate['category'])} className="w-full rounded-md border border-border/60 bg-card/80 text-foreground/80 text-sm px-3 py-1.5">
              <option value="consent">Consent</option>
              <option value="privacy">Privacy</option>
              <option value="liability">Liability</option>
              <option value="agreement">Agreement</option>
              <option value="notice">Notice</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Subject line *</Label>
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Use {{variable}} for dynamic content" className="bg-card/80 border-border/60 text-foreground/80" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Template body *</Label>
          <Textarea rows={10} value={body} onChange={e => setBody(e.target.value)} placeholder="Dear {{parent_name}},\n\n..." className="bg-card/80 border-border/60 text-foreground/80 resize-none font-mono text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Required fields (comma-separated)</Label>
          <Input value={fields} onChange={e => setFields(e.target.value)} placeholder="parent_name, student_name, trip_date" className="bg-card/80 border-border/60 text-foreground/80" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => setSubNav('msg_legal_all')}>Cancel</Button>
          <Button size="sm" className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={handleCreate} disabled={createMut.isPending || !name.trim() || !subject.trim() || !body.trim()}>
            <Save className="size-3.5" /> Create Template
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

/* ── Categories ── */
function CategoriesView() {
  const { data: raw } = useTeacherLegalCategories();
  const categories: TeacherLegalCategory[] = (raw as any)?.data ?? (raw as TeacherLegalCategory[] | undefined) ?? [];

  return (
    <div className="space-y-4" data-animate>
      {categories.length === 0 ? (
        <EmptyState title="No categories" message="Legal template categories will appear here." icon={<FolderOpen className="size-8" />} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(cat => (
            <GlassCard key={cat.id}>
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${categoryColors[cat.slug] ?? categoryColors.other}`}>
                  <FolderOpen className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground/80 mb-0.5">{cat.name}</h4>
                  <p className="text-xs text-muted-foreground/60 mb-2">{cat.description}</p>
                  <Badge className="text-[9px] bg-muted/60 text-muted-foreground border-border/50">{cat.count} template{cat.count !== 1 ? 's' : ''}</Badge>
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
export function MsgLegalTemplatesView({ schoolId: _schoolId, teacherId: _teacherId }: TeacherSectionProps) {
  const { activeSubNav } = useNavigationStore();
  const sub = activeSubNav || 'msg_legal_all';

  return (
    <TeacherSectionShell title="Legal Templates" description="Manage consent forms, notices, and legal communication templates">
      {sub === 'msg_legal_all' && <AllTemplatesView />}
      {sub === 'msg_legal_create' && <CreateLegalTemplateView />}
      {sub === 'msg_legal_categories' && <CategoriesView />}
    </TeacherSectionShell>
  );
}
