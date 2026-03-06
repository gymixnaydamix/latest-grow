/* ─── LegalSection ─── Policies, Data Processing, Compliance ── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  FileText, Database, ShieldCheck, Plus, Trash2,
  Edit, CheckCircle, Clock, Archive, Award, AlertCircle,
  BookOpen, FileLock2, FileCheck2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useLegalDocs, useCreateLegalDoc, useUpdateLegalDoc, useDeleteLegalDoc,
  useComplianceCerts, useCreateComplianceCert, useUpdateComplianceCert, useDeleteComplianceCert,
  type LegalDocument, type ComplianceCert,
} from '@/hooks/api/use-settings';

/* ── 3D Icons ────────────────────────────────────────────────── */
function Icon3D_Policy() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(20,184,166,.35))' }}>
      <defs>
        <linearGradient id="policy3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" /><stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <radialGradient id="policyShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#policy3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#policyShine)" />
      <g transform="translate(11,9)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 0h14l2 2v18H0V2L2 0z" /><path d="M4 6h10" /><path d="M4 10h8" /><path d="M4 14h6" />
      </g>
    </svg>
  );
}

function Icon3D_DPA() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(59,130,246,.35))' }}>
      <defs>
        <linearGradient id="dpa3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93c5fd" /><stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <radialGradient id="dpaShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#dpa3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#dpaShine)" />
      <g transform="translate(10,10)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="0" y="0" width="20" height="14" rx="2" /><path d="M0 4h20" /><circle cx="5" cy="9" r="2" /><path d="M10 8h6" /><path d="M10 11h4" />
      </g>
    </svg>
  );
}

function Icon3D_Compliance() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(245,158,11,.35))' }}>
      <defs>
        <linearGradient id="comp3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fcd34d" /><stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <radialGradient id="compShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#comp3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#compShine)" />
      <g transform="translate(10,10)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="9" /><path d="M6 10l3 3 5-5" />
      </g>
    </svg>
  );
}

/* ── Main Export ───────────────────────────────────────────────── */
export function LegalSection() {
  const { activeSubNav } = useNavigationStore();
  const ref = useStaggerAnimate<HTMLDivElement>([activeSubNav]);

  const view = (() => {
    switch (activeSubNav) {
      case 'data_processing': return <DataProcessingView />;
      case 'compliance': return <ComplianceView />;
      default: return <PoliciesView />;
    }
  })();

  return <div ref={ref} className="space-y-3 h-full overflow-y-auto pr-1">{view}</div>;
}

/* ════════════════════════════════════════════════════════════════
 * POLICIES VIEW
 * ════════════════════════════════════════════════════════════════ */

function PoliciesView() {
  const { data: docs, loading, refetch } = useLegalDocs('policy');
  const { mutate: createDoc, loading: creating } = useCreateLegalDoc();
  const { mutate: updateDoc } = useUpdateLegalDoc();
  const { mutate: deleteDoc } = useDeleteLegalDoc();

  const [showCreate, setShowCreate] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', body: '', category: 'policy' as const, version: '1.0' });
  const [editId, setEditId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');

  const handleCreate = async () => {
    if (!newDoc.title || !newDoc.body) return;
    await createDoc(newDoc);
    setNewDoc({ title: '', body: '', category: 'policy', version: '1.0' });
    setShowCreate(false);
    refetch();
  };

  const handleSaveEdit = async (id: string) => {
    await updateDoc({ body: editBody }, `/${id}`);
    setEditId(null);
    setEditBody('');
    refetch();
  };

  const handlePublish = async (id: string) => {
    await updateDoc({ status: 'PUBLISHED' }, `/${id}`);
    refetch();
  };

  const handleArchive = async (id: string) => {
    await updateDoc({ status: 'ARCHIVED' }, `/${id}`);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(undefined, `/${id}`);
    refetch();
  };

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    DRAFT: { icon: Edit, color: 'text-amber-500 bg-amber-500/10', label: 'Draft' },
    PUBLISHED: { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10', label: 'Published' },
    ARCHIVED: { icon: Archive, color: 'text-slate-500 bg-slate-500/10', label: 'Archived' },
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-teal-500/20 bg-linear-to-br from-teal-500/8 to-cyan-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-teal-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Policy />
          <div>
            <h2 className="text-base font-bold tracking-tight">Legal Policies</h2>
            <p className="text-xs text-muted-foreground">Terms of service, privacy, and other policies</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{docs.length} documents</Badge>
            <Button size="sm" className="gap-1.5 bg-teal-500 hover:bg-teal-600" onClick={() => setShowCreate(true)}>
              <Plus className="size-3" /> New Policy
            </Button>
          </div>
        </div>
      </div>

      {/* Create */}
      {showCreate && (
        <Card data-animate className="border-teal-500/30 bg-teal-500/5">
          <CardContent className="py-3 px-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><FileText className="size-3 text-teal-500" /> New Legal Document</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Document title" className="h-7 text-xs" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} />
              <Input placeholder="Version (e.g. 1.0)" className="h-7 text-xs" value={newDoc.version} onChange={(e) => setNewDoc({ ...newDoc, version: e.target.value })} />
            </div>
            <textarea
              placeholder="Document body (supports Markdown)..."
              className="w-full h-28 rounded-md border border-border/60 bg-muted/30 px-2 py-1.5 text-xs resize-y"
              value={newDoc.body}
              onChange={(e) => setNewDoc({ ...newDoc, body: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 h-7 text-xs" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create Draft'}</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <div className="space-y-1.5" data-animate>
        {docs.map((doc: LegalDocument) => {
          const st = statusConfig[doc.status] ?? statusConfig.DRAFT;
          const Icon = st.icon;
          const isEditing = editId === doc.id;
          return (
            <Card key={doc.id} className="group border-border/60 transition-all duration-300 hover:border-teal-500/30 hover:shadow-sm">
              <CardContent className="py-2.5 px-3 space-y-2">
                <div className="flex items-center gap-3">
                  <BookOpen className="size-4 text-teal-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">{doc.title}</p>
                      <Badge variant="outline" className="text-[8px]">v{doc.version}</Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground">Updated {new Date(doc.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <Badge className={`text-[9px] gap-0.5 ${st.color}`}><Icon className="size-2.5" /> {st.label}</Badge>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.status === 'DRAFT' && (
                      <Button size="sm" variant="ghost" className="h-6 text-xs text-emerald-500" onClick={() => handlePublish(doc.id)}>Publish</Button>
                    )}
                    {doc.status === 'PUBLISHED' && (
                      <Button size="sm" variant="ghost" className="h-6 text-xs text-slate-500" onClick={() => handleArchive(doc.id)}>Archive</Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { setEditId(isEditing ? null : doc.id); setEditBody(doc.body); }}>
                      <Edit className="size-3 text-blue-500" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="size-3 text-red-500" />
                    </Button>
                  </div>
                </div>
                {isEditing && (
                  <div className="space-y-1.5">
                    <textarea
                      className="w-full h-24 rounded-md border border-teal-500/30 bg-muted/30 px-2 py-1.5 text-xs resize-y"
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                    />
                    <div className="flex gap-1">
                      <Button size="sm" className="h-6 text-xs bg-teal-500 hover:bg-teal-600" onClick={() => handleSaveEdit(doc.id)}>Save</Button>
                      <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setEditId(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      )}

      {!loading && docs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <FileText className="size-8 mb-2 opacity-30" />
          <p className="text-xs">No policies yet</p>
          <p className="text-[10px]">Create your first legal document</p>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
 * DATA PROCESSING VIEW
 * ════════════════════════════════════════════════════════════════ */

function DataProcessingView() {
  const { data: docs, loading, refetch } = useLegalDocs('dpa');
  const { mutate: createDoc, loading: creating } = useCreateLegalDoc();
  const { mutate: updateDoc } = useUpdateLegalDoc();
  const { mutate: deleteDoc } = useDeleteLegalDoc();

  const [showCreate, setShowCreate] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', body: '', category: 'dpa' as const, version: '1.0' });

  const handleCreate = async () => {
    if (!newDoc.title || !newDoc.body) return;
    await createDoc(newDoc);
    setNewDoc({ title: '', body: '', category: 'dpa', version: '1.0' });
    setShowCreate(false);
    refetch();
  };

  const handlePublish = async (id: string) => {
    await updateDoc({ status: 'PUBLISHED' }, `/${id}`);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(undefined, `/${id}`);
    refetch();
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-linear-to-br from-blue-500/8 to-cyan-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-blue-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_DPA />
          <div>
            <h2 className="text-base font-bold tracking-tight">Data Processing</h2>
            <p className="text-xs text-muted-foreground">Data processing agreements and sub-processor documentation</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{docs.length} DPAs</Badge>
            <Button size="sm" className="gap-1.5 bg-blue-500 hover:bg-blue-600" onClick={() => setShowCreate(true)}>
              <Plus className="size-3" /> New DPA
            </Button>
          </div>
        </div>
      </div>

      {/* Create */}
      {showCreate && (
        <Card data-animate className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="py-3 px-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><FileLock2 className="size-3 text-blue-500" /> New Data Processing Agreement</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="DPA title" className="h-7 text-xs" value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} />
              <Input placeholder="Version" className="h-7 text-xs" value={newDoc.version} onChange={(e) => setNewDoc({ ...newDoc, version: e.target.value })} />
            </div>
            <textarea
              placeholder="Data processing agreement body..."
              className="w-full h-28 rounded-md border border-border/60 bg-muted/30 px-2 py-1.5 text-xs resize-y"
              value={newDoc.body}
              onChange={(e) => setNewDoc({ ...newDoc, body: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 h-7 text-xs" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create DPA'}</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DPA List */}
      <div className="space-y-1.5" data-animate>
        {docs.map((doc: LegalDocument) => {
          const isPublished = doc.status === 'PUBLISHED';
          return (
            <Card key={doc.id} className="group border-border/60 transition-all duration-300 hover:border-blue-500/30 hover:shadow-sm">
              <CardContent className="flex items-center gap-3 py-2.5 px-3">
                <Database className="size-4 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold">{doc.title}</p>
                    <Badge variant="outline" className="text-[8px]">v{doc.version}</Badge>
                  </div>
                  <p className="text-[9px] text-muted-foreground truncate">{doc.body.slice(0, 80)}...</p>
                </div>
                <Badge className={`text-[9px] ${isPublished ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {isPublished ? 'Active' : doc.status}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isPublished && (
                    <Button size="sm" variant="ghost" className="h-6 text-xs text-emerald-500" onClick={() => handlePublish(doc.id)}>Publish</Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="size-3 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}

      {!loading && docs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Database className="size-8 mb-2 opacity-30" />
          <p className="text-xs">No data processing agreements</p>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
 * COMPLIANCE VIEW
 * ════════════════════════════════════════════════════════════════ */

function ComplianceView() {
  const { data: certs, loading, refetch } = useComplianceCerts();
  const { mutate: createCert, loading: creating } = useCreateComplianceCert();
  const { mutate: updateCert } = useUpdateComplianceCert();
  const { mutate: deleteCert } = useDeleteComplianceCert();

  const [showCreate, setShowCreate] = useState(false);
  const [newCert, setNewCert] = useState({ name: '', description: '', status: 'in_progress' });

  const handleCreate = async () => {
    if (!newCert.name) return;
    await createCert({ name: newCert.name, description: newCert.description, status: newCert.status });
    setNewCert({ name: '', description: '', status: 'in_progress' });
    setShowCreate(false);
    refetch();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateCert({ status }, `/${id}`);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteCert(undefined, `/${id}`);
    refetch();
  };

  const statusConfig: Record<string, { icon: typeof Award; color: string; bg: string }> = {
    compliant: { icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    in_progress: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    non_compliant: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-linear-to-br from-amber-500/8 to-yellow-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Compliance />
          <div>
            <h2 className="text-base font-bold tracking-tight">Compliance</h2>
            <p className="text-xs text-muted-foreground">Certifications, audits, and compliance status</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] text-emerald-500">
              {certs.filter((c: ComplianceCert) => c.status === 'compliant').length} compliant
            </Badge>
            <Button size="sm" className="gap-1.5 bg-amber-500 hover:bg-amber-600" onClick={() => setShowCreate(true)}>
              <Plus className="size-3" /> Add Cert
            </Button>
          </div>
        </div>
      </div>

      {/* Create */}
      {showCreate && (
        <Card data-animate className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-3 px-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><FileCheck2 className="size-3 text-amber-500" /> Add Compliance Certification</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Certification name (e.g. GDPR)" className="h-7 text-xs" value={newCert.name} onChange={(e) => setNewCert({ ...newCert, name: e.target.value })} />
              <select
                className="h-7 rounded-md border border-border/60 bg-muted/30 px-2 text-xs"
                value={newCert.status}
                onChange={(e) => setNewCert({ ...newCert, status: e.target.value })}
              >
                <option value="in_progress">In Progress</option>
                <option value="compliant">Compliant</option>
                <option value="non_compliant">Non-Compliant</option>
              </select>
              <Input placeholder="Description" className="h-7 text-xs sm:col-span-2" value={newCert.description} onChange={(e) => setNewCert({ ...newCert, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 h-7 text-xs" onClick={handleCreate} disabled={creating}>{creating ? 'Adding...' : 'Add Certification'}</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Grid */}
      <div className="grid gap-2 sm:grid-cols-2" data-animate>
        {certs.map((cert: ComplianceCert) => {
          const st = statusConfig[cert.status] ?? statusConfig.in_progress;
          const Icon = st.icon;
          const isExpiring = cert.expiresAt && new Date(cert.expiresAt) < new Date(Date.now() + 30 * 86400000);
          return (
            <Card
              key={cert.id}
              className="group relative overflow-hidden border-border/60 transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5"
            >
              <div className="pointer-events-none absolute -top-6 -right-6 h-14 w-14 rounded-full bg-amber-400/5 blur-xl transition-transform duration-500 group-hover:scale-150" />
              <CardContent className="py-3 px-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${st.bg}`}>
                    <Icon className={`size-4 ${st.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{cert.name}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(cert.id)}>
                    <Trash2 className="size-3 text-red-500" />
                  </Button>
                </div>
                {cert.description && <p className="text-[10px] text-muted-foreground line-clamp-2">{cert.description}</p>}
                <div className="flex items-center gap-2">
                  <select
                    className="h-6 rounded border border-border/60 bg-muted/30 px-1.5 text-[10px]"
                    value={cert.status}
                    onChange={(e) => handleStatusChange(cert.id, e.target.value)}
                  >
                    <option value="compliant">Compliant</option>
                    <option value="in_progress">In Progress</option>
                    <option value="non_compliant">Non-Compliant</option>
                  </select>
                  {cert.expiresAt && (
                    <span className={`text-[9px] ${isExpiring ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                      {isExpiring ? '⚠ Expiring ' : 'Valid until '}{new Date(cert.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      )}

      {!loading && certs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <ShieldCheck className="size-8 mb-2 opacity-30" />
          <p className="text-xs">No compliance certifications</p>
          <p className="text-[10px]">Add GDPR, SOC2, etc. tracking</p>
        </div>
      )}
    </>
  );
}
