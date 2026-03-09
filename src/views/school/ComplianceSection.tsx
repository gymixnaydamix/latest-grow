/* ─── ComplianceSection ─── Compliance & policy tracking ──── */
import { useState, useMemo, useCallback } from 'react';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Clock, FileText,
  Calendar, ChevronDown, ChevronRight, RefreshCw, Plus, Trash2, Pencil, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useAuthStore } from '@/store/auth.store';
import {
  useComplianceTasks,
  useCreateComplianceTask,
  useUpdateComplianceTask,
  useDeleteComplianceTask,
} from '@/hooks/api';
import { notifySuccess, notifyError } from '@/lib/notify';

/* ── Types ── */
interface ComplianceTask {
  id: string;
  area: string;
  description: string;
  status: string;
  dueDate: string;
  assignee: string;
  priority: string;
  createdAt?: string;
  updatedAt?: string;
}

type StatusFilter = 'all' | 'Open' | 'Compliant' | 'Non-Compliant' | 'Pending' | 'Expiring';

const STATUS_MAP: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  Compliant:        { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: <CheckCircle2 className="size-3" />, label: 'Compliant' },
  'Non-Compliant':  { color: 'text-rose-400',    bg: 'bg-rose-400/10',    icon: <AlertTriangle className="size-3" />, label: 'Non-Compliant' },
  Pending:          { color: 'text-amber-400',   bg: 'bg-amber-400/10',   icon: <Clock className="size-3" />,          label: 'Pending' },
  Expiring:         { color: 'text-orange-400',  bg: 'bg-orange-400/10',  icon: <AlertTriangle className="size-3" />, label: 'Expiring Soon' },
  Open:             { color: 'text-sky-400',     bg: 'bg-sky-400/10',     icon: <FileText className="size-3" />,       label: 'Open' },
};

const DEFAULT_STATUS = { color: 'text-white/40', bg: 'bg-white/5', icon: <FileText className="size-3" />, label: 'Unknown' };

function getStatus(status: string) {
  return STATUS_MAP[status] ?? DEFAULT_STATUS;
}

const EMPTY_FORM: Omit<ComplianceTask, 'id' | 'createdAt' | 'updatedAt'> = {
  area: '', description: '', status: 'Open', dueDate: '', assignee: '', priority: 'Medium',
};

export default function ComplianceSection() {
  const containerRef = useStaggerAnimate([]);
  const { schoolId } = useAuthStore();

  /* ── API hooks ── */
  const { data: rawTasks, isLoading, isError, refetch } = useComplianceTasks(schoolId);
  const createMutation = useCreateComplianceTask(schoolId);
  const updateMutation = useUpdateComplianceTask(schoolId);
  const deleteMutation = useDeleteComplianceTask(schoolId);

  const tasks: ComplianceTask[] = useMemo(() => (Array.isArray(rawTasks) ? rawTasks : []) as ComplianceTask[], [rawTasks]);

  /* ── Local state ── */
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const filtered = useMemo(() => filter === 'all' ? tasks : tasks.filter(t => t.status === filter), [tasks, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of tasks) c[t.status] = (c[t.status] ?? 0) + 1;
    return c;
  }, [tasks]);

  const overallCompliant = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(t => t.status === 'Compliant').length / tasks.length) * 100);
  }, [tasks]);

  /* ── Handlers ── */
  const openCreate = useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setShowForm(true);
  }, []);

  const openEdit = useCallback((task: ComplianceTask) => {
    setForm({ area: task.area, description: task.description, status: task.status, dueDate: task.dueDate, assignee: task.assignee, priority: task.priority });
    setEditId(task.id);
    setShowForm(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.area.trim()) { notifyError('Area / policy name is required'); return; }
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, ...form });
        notifySuccess('Compliance task updated');
      } else {
        await createMutation.mutateAsync(form as Record<string, unknown>);
        notifySuccess('Compliance task created');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ ...EMPTY_FORM });
    } catch {
      notifyError(editId ? 'Failed to update compliance task' : 'Failed to create compliance task');
    }
  }, [form, editId, updateMutation, createMutation]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      notifySuccess('Compliance task deleted');
    } catch {
      notifyError('Failed to delete compliance task');
    }
  }, [deleteMutation]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  /* ── Render ── */
  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Header */}
      <div data-animate className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white/90">Compliance &amp; Policies</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white/40 hover:text-white/70 gap-1.5" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn('size-3', isLoading && 'animate-spin')} /> Run Audit
          </Button>
          <Button size="sm" className="bg-indigo-500/80 hover:bg-indigo-500 text-white text-xs gap-1.5" onClick={openCreate}>
            <Plus className="size-3" /> Add Policy
          </Button>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex items-center gap-2 py-8 text-sm text-white/40">
            <Loader2 className="size-4 animate-spin" /> Loading compliance data…
          </CardContent>
        </Card>
      )}
      {isError && !isLoading && (
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex items-center justify-between gap-2 py-8">
            <div className="flex items-center gap-2 text-sm text-rose-400"><AlertTriangle className="size-4" /> Failed to load compliance data</div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Data content */}
      {!isLoading && !isError && (
        <>
          {/* Summary row */}
          <div data-animate className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="border-white/6 bg-white/3 backdrop-blur-xl col-span-2 md:col-span-1 text-center">
              <CardContent className="pt-4 pb-3 flex flex-col items-center gap-1">
                <div className="relative size-16">
                  <svg viewBox="0 0 36 36" className="size-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className="text-white/6" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" className="text-emerald-400" strokeWidth="3" strokeDasharray={`${overallCompliant} ${100 - overallCompliant}`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white/90">{overallCompliant}%</span>
                </div>
                <span className="text-[10px] text-white/40 mt-1">Compliant</span>
              </CardContent>
            </Card>

            {(['Compliant', 'Non-Compliant', 'Pending', 'Open'] as StatusFilter[]).map(s => {
              const st = getStatus(s);
              return (
                <Card key={s} className={cn('border-white/6 bg-white/3 backdrop-blur-xl cursor-pointer transition-colors', filter === s && 'ring-1 ring-white/10')} onClick={() => setFilter(filter === s ? 'all' : s)}>
                  <CardContent className="pt-3 pb-2 flex flex-col items-center gap-1">
                    <span className={cn('text-2xl font-bold', st.color)}>{counts[s] ?? 0}</span>
                    <div className={cn('flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5', st.bg, st.color)}>{st.icon}{st.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add / Edit form */}
          {showForm && (
            <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-white/90 text-sm">{editId ? 'Edit Compliance Task' : 'New Compliance Task'}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white/50 text-xs mb-1.5 block">Policy / Area</Label>
                  <Input value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} placeholder="e.g. Student Data Privacy (FERPA)" className="bg-white/3 border-white/6 text-white/70 text-xs h-8" />
                </div>
                <div>
                  <Label className="text-white/50 text-xs mb-1.5 block">Description</Label>
                  <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the policy requirement" className="bg-white/3 border-white/6 text-white/70 text-xs h-8" />
                </div>
                <div>
                  <Label className="text-white/50 text-xs mb-1.5 block">Status</Label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full h-8 rounded-md border border-white/6 bg-white/3 text-white/70 text-xs px-2">
                    {['Open', 'Pending', 'Compliant', 'Non-Compliant', 'Expiring'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-white/50 text-xs mb-1.5 block">Due Date</Label>
                  <Input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="bg-white/3 border-white/6 text-white/70 text-xs h-8" />
                </div>
                <div>
                  <Label className="text-white/50 text-xs mb-1.5 block">Assignee</Label>
                  <Input value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))} placeholder="Person responsible" className="bg-white/3 border-white/6 text-white/70 text-xs h-8" />
                </div>
                <div>
                  <Label className="text-white/50 text-xs mb-1.5 block">Priority</Label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="w-full h-8 rounded-md border border-white/6 bg-white/3 text-white/70 text-xs px-2">
                    {['Low', 'Medium', 'High', 'Critical'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 justify-end">
                  <Button variant="ghost" size="sm" className="text-white/40" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
                  <Button size="sm" className="bg-emerald-500/80 hover:bg-emerald-500 text-white text-xs gap-1.5" disabled={isSaving} onClick={handleSave}>
                    {isSaving ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                    {editId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task list */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-white/90 text-sm flex items-center gap-2"><FileText className="size-4 text-indigo-400" />Policies &amp; Certifications</CardTitle>
              <Badge variant="outline" className="border-white/10 text-white/40 text-[10px]">{filtered.length} items</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {filtered.length === 0 && (
                <div className="py-8 text-center text-white/30 text-sm">
                  {tasks.length === 0 ? 'No compliance policies yet. Add one to get started.' : 'No policies match the current filter.'}
                </div>
              )}
              {filtered.map(t => {
                const st = getStatus(t.status);
                const isOpen = expanded === t.id;
                return (
                  <div key={t.id} className="rounded-lg border border-white/4 bg-white/2 overflow-hidden">
                    <button onClick={() => setExpanded(isOpen ? null : t.id)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left">
                      {isOpen ? <ChevronDown className="size-3.5 text-white/30" /> : <ChevronRight className="size-3.5 text-white/30" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/70 truncate">{t.area}</p>
                        <p className="text-[10px] text-white/30">{t.description || '—'}</p>
                      </div>
                      <Badge className={cn('border-0 text-[10px] gap-1', st.bg, st.color)}>{st.icon}{st.label}</Badge>
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/4 bg-white/1 px-4 py-3 grid grid-cols-1 sm:grid-cols-4 gap-3 text-[10px]">
                        <div>
                          <span className="text-white/25 block">Due Date</span>
                          <span className="text-white/60 flex items-center gap-1"><Calendar className="size-2.5" />{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</span>
                        </div>
                        <div>
                          <span className="text-white/25 block">Assignee</span>
                          <span className="text-white/60">{t.assignee || '—'}</span>
                        </div>
                        <div>
                          <span className="text-white/25 block">Priority</span>
                          <span className="text-white/60">{t.priority}</span>
                        </div>
                        <div className="flex items-end gap-1.5 justify-end">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/30 hover:text-indigo-400" onClick={() => openEdit(t)}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/30 hover:text-rose-400" disabled={deleteMutation.isPending} onClick={() => handleDelete(t.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
