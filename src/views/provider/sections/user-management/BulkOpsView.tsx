/* ─── BulkOpsView ─── Import + Export views ─── */
import { useState, useCallback } from 'react';
import {
  Upload, Download, Eye, Loader2, CheckCircle, FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useUserStats, useCreateUser, type UserRole,
} from '@/hooks/api';
import {
  ALL_ROLES, ROLE_CONFIG, Icon3D_Stats, RoleBadge,
} from './shared';

export function BulkOpsView({ subNav }: { subNav: string }) {
  if (subNav === 'bulk_export') return <BulkExportView />;
  return <BulkImportView />;
}

/* ── Bulk Import ─────────────────────────────────────────────── */
function BulkImportView() {
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState<Array<{ email: string; firstName: string; lastName: string; role: UserRole }>>([]);
  const [step, setStep] = useState<'input' | 'preview' | 'done'>('input');
  const [importedCount, setImportedCount] = useState(0);
  const { mutate: createUser, loading: creating } = useCreateUser();

  const CSV_TEMPLATE = 'email,firstName,lastName,role\njane@example.com,Jane,Doe,STUDENT\njohn@example.com,John,Smith,TEACHER';

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target?.result as string);
    reader.readAsText(file);
  }, []);

  const handleParse = () => {
    const lines = csvText.trim().split('\n').filter(Boolean);
    if (lines.length < 2) return;
    const rows = lines.slice(1).map(line => {
      const [email, firstName, lastName, role] = line.split(',').map(s => s.trim());
      return { email, firstName: firstName || '', lastName: lastName || '', role: (role || 'STUDENT') as UserRole };
    }).filter(r => r.email);
    setParsed(rows);
    setStep('preview');
  };

  const handleImport = async () => {
    let count = 0;
    for (const row of parsed) {
      try {
        await createUser({ email: row.email, password: 'Temp1234!', firstName: row.firstName, lastName: row.lastName, role: row.role });
        count++;
      } catch { /* skip duplicates */ }
    }
    setImportedCount(count);
    setStep('done');
  };

  const reset = () => { setCsvText(''); setParsed([]); setStep('input'); setImportedCount(0); };

  return (
    <div className="h-full overflow-y-auto px-1 space-y-6 pb-6">
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-600/30 via-teal-600/20 to-cyan-600/30" />
        <div className="absolute inset-0 bg-linear-to-b from-white/6 to-transparent" />
        <div className="relative p-6 flex items-center gap-4">
          <Upload className="size-9 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-white/95 tracking-tight">Bulk Import Users</h1>
            <p className="text-sm text-white/50 mt-0.5">Import users from CSV -- upload or paste data</p>
          </div>
        </div>
      </div>

      {step === 'input' && (
        <Card className="bg-white/3 border-white/6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Button size="sm" variant="outline" className="gap-1 border-white/10 hover:bg-white/5">
                  <Upload className="size-3" /> Upload CSV
                </Button>
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
              <span className="text-xs text-white/40">or paste CSV below</span>
            </div>
            <Textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder={CSV_TEMPLATE}
              rows={10}
              className="font-mono text-xs bg-white/5 border-white/10 text-white/80 placeholder:text-white/25"
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-white/30">Required columns: email, firstName, lastName, role</p>
              <Button size="sm" onClick={handleParse} disabled={!csvText.trim()} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1">
                <Eye className="size-3" /> Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && (
        <Card className="bg-white/3 border-white/6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">{parsed.length} users to import</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={reset} className="border-white/10 hover:bg-white/5">Back</Button>
                <Button size="sm" onClick={handleImport} disabled={creating} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1">
                  {creating ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />} Import All
                </Button>
              </div>
            </div>
            <div className="max-h-80 overflow-auto rounded-lg border border-white/6">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/6 bg-white/2">
                    <th className="p-2 text-left text-white/50">Email</th>
                    <th className="p-2 text-left text-white/50">Name</th>
                    <th className="p-2 text-left text-white/50">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((r, i) => (
                    <tr key={i} className="border-b border-white/4">
                      <td className="p-2 text-white/70">{r.email}</td>
                      <td className="p-2 text-white/70">{r.firstName} {r.lastName}</td>
                      <td className="p-2"><RoleBadge role={r.role} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'done' && (
        <Card className="bg-white/3 border-white/6">
          <CardContent className="p-12 text-center space-y-3">
            <CheckCircle className="size-12 mx-auto text-emerald-400" />
            <h3 className="text-lg font-bold text-white/90">Import Complete</h3>
            <p className="text-sm text-white/50">{importedCount} of {parsed.length} users imported successfully</p>
            <Button size="sm" onClick={reset} variant="outline" className="border-white/10 hover:bg-white/5">Import More</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Bulk Export ──────────────────────────────────────────────── */
function BulkExportView() {
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [exporting, setExporting] = useState(false);
  const { data: stats } = useUserStats();

  const handleExport = useCallback(async () => {
    setExporting(true);
    const params = new URLSearchParams();
    if (roleFilter) params.set('role', roleFilter);
    if (statusFilter) params.set('isActive', statusFilter);
    window.open(`/api/user-management/users/export?${params.toString()}`, '_blank');
    setTimeout(() => setExporting(false), 2000);
  }, [roleFilter, statusFilter]);

  return (
    <div className="h-full overflow-y-auto px-1 space-y-6 pb-6">
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/30 via-sky-600/20 to-indigo-600/30" />
        <div className="absolute inset-0 bg-linear-to-b from-white/6 to-transparent" />
        <div className="relative p-6 flex items-center gap-4">
          <Download className="size-9 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white/95 tracking-tight">Bulk Export Users</h1>
            <p className="text-sm text-white/50 mt-0.5">Export user data as CSV with optional filters</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-white/3 border-white/6">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
              <FileText className="size-4 text-blue-400" /> Export Filters
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/40 block mb-1">Filter by Role</label>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white/80 text-sm">
                  <option value="" className="bg-gray-900">All Roles</option>
                  {ALL_ROLES.map(r => <option key={r} value={r} className="bg-gray-900">{ROLE_CONFIG[r].label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Filter by Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-white/80 text-sm">
                  <option value="" className="bg-gray-900">All Status</option>
                  <option value="true" className="bg-gray-900">Active Only</option>
                  <option value="false" className="bg-gray-900">Inactive Only</option>
                </select>
              </div>
            </div>
            <Button onClick={handleExport} disabled={exporting} className="w-full bg-blue-600 hover:bg-blue-500 text-white gap-2">
              {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {exporting ? 'Preparing...' : 'Export CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/3 border-white/6">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
              <Icon3D_Stats /> Export Summary
            </h3>
            {stats ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total Users</span>
                  <span className="font-bold text-white/85">{stats.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Active</span>
                  <span className="font-bold text-emerald-400">{stats.active.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Inactive</span>
                  <span className="font-bold text-red-400">{stats.inactive.toLocaleString()}</span>
                </div>
                <hr className="border-white/6" />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">By Role</p>
                  {Object.entries(stats.roleCounts).map(([role, count]) => (
                    <div key={role} className="flex justify-between items-center">
                      <RoleBadge role={role as UserRole} />
                      <span className="text-xs font-bold text-white/70">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
