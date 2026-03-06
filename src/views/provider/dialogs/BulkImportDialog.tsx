/* ─── BulkImportDialog — CSV / manual bulk import of tenants ─── */
import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useBulkImportTenants } from '@/hooks/api';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedRow {
  name: string;
  type: 'SCHOOL' | 'INDIVIDUAL';
  email: string;
  phone?: string;
  plan?: string;
}

const CSV_TEMPLATE = `name,type,email,phone,plan
Springfield Academy,SCHOOL,admin@springfield.edu,+1-555-0100,Enterprise
Sarah Johnson,INDIVIDUAL,sarah.j@gmail.com,,Basic`;

function parseCsv(raw: string): ParsedRow[] {
  const lines = raw.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  // skip header
  return lines.slice(1).map((line) => {
    const [name, type, email, phone, plan] = line.split(',').map((s) => s.trim());
    return {
      name,
      type: (type?.toUpperCase() === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'SCHOOL') as 'SCHOOL' | 'INDIVIDUAL',
      email,
      phone: phone || undefined,
      plan: plan || undefined,
    };
  }).filter((r) => r.name && r.email);
}

export function BulkImportDialog({ open, onOpenChange }: BulkImportDialogProps) {
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  const bulkImport = useBulkImportTenants();

  const reset = () => {
    setCsvText(''); setParsed([]); setStep('input');
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  }, []);

  const handlePreview = () => {
    const rows = parseCsv(csvText);
    setParsed(rows);
    setStep('preview');
  };

  const handleImport = () => {
    bulkImport.mutate(parsed, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shadow-sm">
              <Upload className="size-3.5 text-white" />
            </div>
            Bulk Import Tenants
          </DialogTitle>
          <DialogDescription className="text-xs">
            Upload a CSV file or paste CSV data to import multiple tenants at once.
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="grid gap-3">
            {/* File upload */}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border/80 bg-muted/20 p-3 transition-colors hover:bg-muted/40">
              <FileText className="size-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">Upload CSV file</p>
                <p className="text-[10px] text-muted-foreground">Click to browse or drag & drop</p>
              </div>
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
            </label>

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-border/40" />
              <span className="mx-2 text-[10px] text-muted-foreground">or paste CSV data</span>
              <div className="flex-1 border-t border-border/40" />
            </div>

            {/* Template hint */}
            <div className="rounded-lg bg-muted/20 p-2 border border-border/30">
              <p className="text-[10px] font-medium text-muted-foreground mb-1">Expected format:</p>
              <pre className="text-[9px] font-mono text-muted-foreground/80 whitespace-pre-wrap">{CSV_TEMPLATE}</pre>
            </div>

            {/* Text area */}
            <Textarea
              value={csvText} onChange={(e) => setCsvText(e.target.value)}
              placeholder="name,type,email,phone,plan&#10;Springfield Academy,SCHOOL,admin@school.edu,+1-555-0100,Enterprise"
              className="text-xs min-h-25 font-mono resize-none"
            />

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                size="sm" className="h-8 gap-1 text-xs bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                disabled={!csvText.trim()} onClick={handlePreview}
              >
                Preview Import
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'preview' && (
          <div className="grid gap-3">
            {/* Result summary */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/20 p-2">
              {parsed.length > 0 ? (
                <CheckCircle className="size-4 text-emerald-500" />
              ) : (
                <AlertCircle className="size-4 text-red-500" />
              )}
              <p className="text-xs">
                {parsed.length > 0
                  ? <><strong>{parsed.length}</strong> tenant{parsed.length !== 1 ? 's' : ''} ready to import</>
                  : 'No valid rows found. Check your CSV format.'}
              </p>
            </div>

            {/* Preview table */}
            {parsed.length > 0 && (
              <div className="max-h-48 overflow-auto rounded-lg border border-border/40">
                <table className="w-full text-[10px]">
                  <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm">
                    <tr className="text-left text-muted-foreground">
                      <th className="p-1.5 font-semibold">#</th>
                      <th className="p-1.5 font-semibold">Name</th>
                      <th className="p-1.5 font-semibold">Type</th>
                      <th className="p-1.5 font-semibold">Email</th>
                      <th className="p-1.5 font-semibold">Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((row, i) => (
                      <tr key={i} className="border-t border-border/20 hover:bg-muted/20">
                        <td className="p-1.5 font-mono text-muted-foreground">{i + 1}</td>
                        <td className="p-1.5 font-medium">{row.name}</td>
                        <td className="p-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                            row.type === 'SCHOOL' ? 'bg-blue-500/10 text-blue-600' : 'bg-violet-500/10 text-violet-600'
                          }`}>
                            {row.type === 'SCHOOL' ? '🏫' : '👤'} {row.type}
                          </span>
                        </td>
                        <td className="p-1.5 text-muted-foreground">{row.email}</td>
                        <td className="p-1.5">{row.plan || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Duplicate removal hint */}
            {bulkImport.data && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 p-2">
                <CheckCircle className="size-4 text-blue-500" />
                <p className="text-xs">
                  Imported <strong>{bulkImport.data.created}</strong> · Skipped <strong>{bulkImport.data.skipped}</strong> duplicates
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => setStep('input')}>
                <X className="size-3 mr-1" />Back
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1 text-xs bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                disabled={parsed.length === 0 || bulkImport.isPending}
                onClick={handleImport}
              >
                {bulkImport.isPending ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                Import {parsed.length} Tenant{parsed.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
