/* ─── DocumentsSection ─── Student documents workspace ────────────────
 * Report cards, transcripts, certificates, permission forms
 * ─────────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  FileText, Download, Eye, Search, Calendar,
  FolderOpen, File, Image, Shield,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type StudentDocument } from '@/store/student-data.store';
import { useStudentData } from '@/hooks/use-student-data';
import { EmptyState } from '@/components/features/EmptyState';
import { notifySuccess } from '@/lib/notify';

type DocFilter = 'all' | 'report_card' | 'transcript' | 'certificate' | 'permission' | 'id_card' | 'form' | 'other';

const DOC_TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  report_card: { icon: FileText, color: '#818cf8', label: 'Report Card' },
  transcript: { icon: File, color: '#34d399', label: 'Transcript' },
  certificate: { icon: Shield, color: '#f97316', label: 'Certificate' },
  permission: { icon: FileText, color: '#38bdf8', label: 'Permission' },
  id_card: { icon: Image, color: '#a78bfa', label: 'ID Card' },
  form: { icon: FolderOpen, color: '#f43f5e', label: 'Form' },
  other: { icon: File, color: '#64748b', label: 'Other' },
};

export function DocumentsSection() {
  const store = useStudentData();
  const [filter, setFilter] = useState<DocFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = store.documents;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d => d.title.toLowerCase().includes(q));
    }
    if (filter !== 'all') {
      list = list.filter(d => d.type === filter);
    }
    return list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [store.documents, filter, search]);

  // Type counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    store.documents.forEach(d => { counts[d.type] = (counts[d.type] || 0) + 1; });
    return counts;
  }, [store.documents]);

  const filters: { id: DocFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    ...Object.entries(DOC_TYPE_CONFIG).map(([id, cfg]) => ({
      id: id as DocFilter,
      label: cfg.label,
    })).filter(f => (typeCounts[f.id] || 0) > 0),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white/90">Documents</h2>
        <p className="text-sm text-white/40">{store.documents.length} documents</p>
      </div>

      {/* Type overview */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(DOC_TYPE_CONFIG).map(([type, cfg]) => {
          const count = typeCounts[type] || 0;
          if (count === 0) return null;
          const Icon = cfg.icon;
          return (
            <div key={type} className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 cursor-pointer hover:border-white/12 transition-all"
              onClick={() => setFilter(type as DocFilter)}>
              <Icon className="size-3.5" style={{ color: cfg.color }} />
              <span className="text-xs text-white/60">{cfg.label}</span>
              <span className="text-xs font-semibold text-white/40">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 overflow-x-auto">
          {filters.map(f => (
            <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'ghost'}
              onClick={() => setFilter(f.id)}
              className={cn('text-xs flex-shrink-0', filter !== f.id && 'text-white/40')}>
              {f.label}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
            className="pl-9 h-8 text-xs bg-white/[0.03] border-white/8" />
        </div>
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <EmptyState title="No documents found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map(doc => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Document Card ── */
function DocumentCard({ document: doc }: { document: StudentDocument }) {
  const { downloadDocument } = useStudentData();
  const cfg = DOC_TYPE_CONFIG[doc.type] || DOC_TYPE_CONFIG.other;
  const Icon = cfg.icon;

  return (
    <Card className="border-white/8 bg-white/[0.02] hover:border-white/12 transition-all group">
      <CardContent className="flex items-start gap-4 py-3 px-4">
        <div className="flex items-center justify-center size-10 rounded-xl border border-white/8 bg-white/[0.03] flex-shrink-0"
          style={{ borderColor: `${cfg.color}20` }}>
          <Icon className="size-4" style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/80 truncate">{doc.title}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
            <Badge variant="outline" className={cn('text-[8px] capitalize')} style={{ color: cfg.color, borderColor: `${cfg.color}30`, backgroundColor: `${cfg.color}08` }}>
              {cfg.label}
            </Badge>
            <span className="flex items-center gap-1"><Calendar className="size-3" />{new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>{doc.fileSize}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button size="icon" variant="ghost" className="size-8 text-white/25 hover:text-white/60"
            onClick={() => notifySuccess('Preview', `Opening preview for ${doc.title}`)}><Eye className="size-3.5" /></Button>
          <Button size="icon" variant="ghost" className="size-8 text-white/25 hover:text-white/60"
            onClick={() => { downloadDocument(doc.id); notifySuccess('Downloaded', doc.title); }}><Download className="size-3.5" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
