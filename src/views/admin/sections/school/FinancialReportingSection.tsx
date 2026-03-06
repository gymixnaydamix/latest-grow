import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import { useExportFinancialReport, useFinancialReportSummary } from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function FinancialReportingSection() {
  const { schoolId } = useAuthStore();

  const [from, setFrom] = useState(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const fromIso = useMemo(() => new Date(`${from}T00:00:00.000Z`).toISOString(), [from]);
  const toIso = useMemo(() => new Date(`${to}T23:59:59.999Z`).toISOString(), [to]);

  const summaryQuery = useFinancialReportSummary(schoolId, fromIso, toIso);
  const exportMutation = useExportFinancialReport(schoolId ?? '');

  const exportCsv = async () => {
    const csv = await exportMutation.mutateAsync({ from: fromIso, to: toIso });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${from}-${to}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const summary = summaryQuery.data;

  return (
    <SchoolSectionShell
      title="Financial Reporting"
      description="Date-range financial summary with CSV export."
      actions={<Button size="sm" onClick={exportCsv} disabled={exportMutation.isPending || !summary}>Export CSV</Button>}
    >
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">From</p>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">To</p>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button variant="outline" onClick={() => summaryQuery.refetch()}>Refresh</Button>
        </CardContent>
      </Card>

      <DataState
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
        isEmpty={!summary}
        loadingLabel="Loading report"
        emptyLabel="No report data"
        errorLabel="Failed to load financial report"
        onRetry={() => summaryQuery.refetch()}
      >
        <div className="grid gap-3 md:grid-cols-4">
          <Card><CardContent className="space-y-1 p-4"><p className="text-xs text-muted-foreground">Invoiced</p><p className="text-xl font-semibold">{summary?.totalInvoiced ?? 0}</p></CardContent></Card>
          <Card><CardContent className="space-y-1 p-4"><p className="text-xs text-muted-foreground">Collected</p><p className="text-xl font-semibold">{summary?.totalCollected ?? 0}</p></CardContent></Card>
          <Card><CardContent className="space-y-1 p-4"><p className="text-xs text-muted-foreground">Expenses</p><p className="text-xl font-semibold">{summary?.totalExpenses ?? 0}</p></CardContent></Card>
          <Card><CardContent className="space-y-1 p-4"><p className="text-xs text-muted-foreground">Net Cashflow</p><p className="text-xl font-semibold">{summary?.netCashflow ?? 0}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(summary?.expenseByCategory ?? []).map((item) => (
                  <TableRow key={item.category}>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>
    </SchoolSectionShell>
  );
}
