import { useMemo, useState } from 'react';
import { Download, Eye, FileText, FolderOpen, HardDrive, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParentV2Documents, useUploadParentV2Document } from '@/hooks/api/use-parent-v2';
import { childDisplayName, filterByChild, formatDateLabel, parentDocumentsDemo as FALLBACK_DOCUMENTS } from './parent-v2-demo-data';
import type { ParentDocumentDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, StatusBadge } from './shared';
import type { ParentSectionProps } from './shared';

export function DocumentsSection({ scope, childId }: ParentSectionProps) {
  const { data: rawRows } = useParentV2Documents({ scope, childId });
  const uploadMut = useUploadParentV2Document();
  const allRows: ParentDocumentDemo[] = (rawRows as ParentDocumentDemo[] | undefined) ?? filterByChild(FALLBACK_DOCUMENTS, childId, scope);

  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');

  const categories = useMemo(() => ['ALL', ...new Set(allRows.map((d) => d.category))], [allRows]);

  const rows = useMemo(
    () =>
      allRows.filter((r) => {
        const catMatch = catFilter === 'ALL' || r.category === catFilter;
        const qMatch = query.trim().length === 0 || `${r.title} ${childDisplayName(r.childId)}`.toLowerCase().includes(query.toLowerCase());
        return catMatch && qMatch;
      }),
    [allRows, catFilter, query],
  );

  return (
    <ParentSectionShell
      title="Documents"
      description="Report cards, receipts, school letters, upload requests, and document workflows."
      actions={
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={uploadMut.isPending}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) uploadMut.mutate({ documentId: childId ?? 'general', file });
            };
            input.click();
          }}
        >
          <Upload className="size-3.5" /> {uploadMut.isPending ? 'Uploading…' : 'Upload document'}
        </Button>
      }
    >
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <FolderOpen className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-bold">{allRows.length}</p>
              <p className="text-xs text-muted-foreground">Total documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <FileText className="size-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{allRows.filter((d) => d.status === 'AVAILABLE').length}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card className={allRows.some((d) => d.status === 'REQUESTED') ? 'border-amber-500/20 bg-amber-500/5' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <HardDrive className="size-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{allRows.filter((d) => d.status === 'REQUESTED').length}</p>
              <p className="text-xs text-muted-foreground">Requested</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCatFilter(c)}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              catFilter === c ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
            }`}
          >
            {c}
          </button>
        ))}
        <Input
          className="max-w-xs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search documents..."
        />
      </div>

      {/* Document list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Document Center</CardTitle>
          <CardDescription>{rows.length} document(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <EmptyActionState title="No documents" message="Nothing matches your filter." ctaLabel="Show all" onClick={() => { setCatFilter('ALL'); setQuery(''); }} />
          ) : (
            rows.map((row) => (
              <div key={row.id} className="rounded-lg border border-border/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <p className="text-sm font-semibold">{row.title}</p>
                      <Badge variant="outline" className="text-xs">{row.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {childDisplayName(row.childId)} • Updated {formatDateLabel(row.updatedAt)}
                      {'fileSize' in row && row.fileSize ? ` • ${row.fileSize}` : ''}
                    </p>
                  </div>
                  <StatusBadge
                    status={row.status}
                    tone={row.status === 'AVAILABLE' ? 'good' : row.status === 'REQUESTED' ? 'warn' : 'info'}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {row.status === 'AVAILABLE' && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1.5"><Eye className="size-3.5" /> View</Button>
                      <Button size="sm" variant="outline" className="gap-1.5"><Download className="size-3.5" /> Download</Button>
                    </>
                  )}
                  {row.status === 'REQUESTED' && (
                    <Button size="sm" variant="outline" className="gap-1.5"><Upload className="size-3.5" /> Upload</Button>
                  )}
                  {row.status !== 'AVAILABLE' && row.status !== 'REQUESTED' && (
                    <Button size="sm" variant="outline" className="gap-1.5"><Eye className="size-3.5" /> View</Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </ParentSectionShell>
  );
}
