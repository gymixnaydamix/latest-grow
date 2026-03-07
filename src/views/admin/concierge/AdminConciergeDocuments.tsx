/* Admin Concierge › Documents — Generate, Templates, Requests, Sent/Published */
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { ConciergeSplitPreviewPanel, ConciergeTemplatePicker } from '@/components/concierge/shared';
import { FileText, Download, Eye, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTemplates, useCommLogs } from '@/hooks/api/use-school-ops';

const FALLBACK_TEMPLATES = [
  { id: 'dt1', name: 'Enrollment Certificate', type: 'Certificate', language: 'English', lastUsed: '2 days ago', fieldCount: 6 },
  { id: 'dt2', name: 'Fee Statement', type: 'Financial', language: 'English', lastUsed: '1 day ago', fieldCount: 8 },
  { id: 'dt3', name: 'Transfer Letter', type: 'Letter', language: 'English', lastUsed: '5 days ago', fieldCount: 5 },
  { id: 'dt4', name: 'Attendance Report', type: 'Report', language: 'English', lastUsed: '3 days ago', fieldCount: 4 },
  { id: 'dt5', name: 'Good Conduct Certificate', type: 'Certificate', language: 'English/Arabic', lastUsed: '1 week ago', fieldCount: 5 },
  { id: 'dt6', name: 'Grade Report Card', type: 'Report', language: 'English', lastUsed: 'Today', fieldCount: 10 },
];

const FALLBACK_REQUESTS = [
  { id: 'dr1', student: 'Ahmed Hassan', type: 'Enrollment Certificate', requestedBy: 'Parent', date: 'Jun 12', status: 'Pending' },
  { id: 'dr2', student: 'Noor Ahmed', type: 'Transfer Letter', requestedBy: 'Parent', date: 'Jun 11', status: 'Pending' },
  { id: 'dr3', student: 'Yasmin Said', type: 'Fee Statement', requestedBy: 'Finance', date: 'Jun 10', status: 'In Progress' },
];

const FALLBACK_SENT_DOCS = [
  { id: 'ds1', name: 'Enrollment Certificate — Omar Khalid', type: 'Certificate', date: 'Jun 11', status: 'Published' },
  { id: 'ds2', name: 'Fee Statement — Grade 6 Parents', type: 'Financial', date: 'Jun 10', status: 'Sent' },
  { id: 'ds3', name: 'Attendance Report — Grade 5A', type: 'Report', date: 'Jun 9', status: 'Published' },
];

export function AdminConciergeDocuments() {
  const { activeSubNav } = useNavigationStore();
  const { schoolId } = useAuthStore();
  const { data: apiTemplates } = useTemplates(schoolId);
  const { data: apiCommLogs } = useCommLogs(schoolId);
  const templates = (apiTemplates as any[]) ?? FALLBACK_TEMPLATES;
  const requests = (apiCommLogs as any[])?.filter((l: any) => l.status === 'Pending' || l.status === 'In Progress') ?? FALLBACK_REQUESTS;
  const sentDocs = (apiCommLogs as any[])?.filter((l: any) => l.status === 'Published' || l.status === 'Sent') ?? FALLBACK_SENT_DOCS;

  if (activeSubNav === 'c_templates') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Template Library</h3>
        <ConciergeTemplatePicker templates={templates} />
      </div>
    );
  }

  if (activeSubNav === 'c_requests') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Document Requests</h3>
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5 dark:bg-zinc-900/50">
              <div>
                <h5 className="text-xs font-medium text-foreground">{r.type} — {r.student}</h5>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>By: {r.requestedBy}</span>
                  <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{r.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium',
                  r.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600',
                )}>{r.status}</span>
                <button className="rounded-lg border border-border/40 px-2 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60">Generate</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubNav === 'c_sent') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Sent / Published Documents</h3>
        <div className="space-y-2">
          {sentDocs.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5 dark:bg-zinc-900/50">
              <div>
                <h5 className="text-xs font-medium text-foreground">{d.name}</h5>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{d.type}</span><span>{d.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60" title="Preview"><Eye className="h-3.5 w-3.5" /></button>
                <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60" title="Download"><Download className="h-3.5 w-3.5" /></button>
                <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60" title="Reissue"><RefreshCw className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* Default: Generate — split preview */
  const editorPanel = (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generate Document</h4>
      <div className="space-y-2">
        <label className="block text-xs text-muted-foreground">Template</label>
        <select className="w-full rounded-lg border border-border/40 bg-background px-3 py-2 text-sm dark:border-white/10">
          {templates.map((t) => <option key={t.id}>{t.name}</option>)}
        </select>
        <label className="block text-xs text-muted-foreground">Student</label>
        <input className="w-full rounded-lg border border-border/40 bg-background px-3 py-2 text-sm dark:border-white/10" placeholder="Search student..." />
        <label className="block text-xs text-muted-foreground">Language</label>
        <select className="w-full rounded-lg border border-border/40 bg-background px-3 py-2 text-sm dark:border-white/10">
          <option>English</option><option>Arabic</option>
        </select>
        <button className="mt-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">Generate Preview</button>
      </div>
    </div>
  );

  const previewPanel = (
    <div className="flex h-full items-center justify-center">
      <div className="text-center text-sm text-muted-foreground">
        <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
        <p>Document preview will appear here</p>
        <p className="text-xs">Select a template and student to generate</p>
      </div>
    </div>
  );

  return <ConciergeSplitPreviewPanel left={editorPanel} right={previewPanel} leftLabel="Document Builder" rightLabel="Preview" />;
}
