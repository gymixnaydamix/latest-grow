import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import {
  useCheckoutLibraryLoan,
  useLibraryItems,
  useLibraryLoans,
  useReturnLibraryLoan,
  useSchoolUsers,
} from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function CheckInOutSection() {
  const { schoolId } = useAuthStore();
  const [status, setStatus] = useState('');

  const itemsQuery = useLibraryItems(schoolId);
  const loansQuery = useLibraryLoans(schoolId, status || undefined);
  const staffQuery = useSchoolUsers(schoolId, 'staff', { pageSize: 100 });
  const studentsQuery = useSchoolUsers(schoolId, 'students', { pageSize: 200 });
  const parentsQuery = useSchoolUsers(schoolId, 'parents', { pageSize: 100 });

  const checkout = useCheckoutLibraryLoan(schoolId ?? '');
  const returnLoan = useReturnLibraryLoan(schoolId ?? '');

  const [form, setForm] = useState({ itemId: '', borrowerId: '', dueAt: '', notes: '' });

  const items = itemsQuery.data ?? [];
  const loans = loansQuery.data ?? [];
  const borrowers = useMemo(() => {
    const all = [...(studentsQuery.data ?? []), ...(parentsQuery.data ?? []), ...(staffQuery.data ?? [])];
    const map = new Map(all.map((user) => [user.id, user]));
    return Array.from(map.values());
  }, [studentsQuery.data, parentsQuery.data, staffQuery.data]);

  const submitCheckout = async () => {
    await checkout.mutateAsync({
      itemId: form.itemId,
      borrowerId: form.borrowerId,
      dueAt: new Date(form.dueAt).toISOString(),
      notes: form.notes,
    });
    setForm({ itemId: '', borrowerId: '', dueAt: '', notes: '' });
  };

  return (
    <SchoolSectionShell
      title="Check-in / Check-out"
      description="Checkout and return library loans with copy availability checks."
      actions={<Button size="sm" onClick={submitCheckout} disabled={!form.itemId || !form.borrowerId || !form.dueAt || checkout.isPending}>Checkout</Button>}
    >
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.itemId} onChange={(e) => setForm((prev) => ({ ...prev, itemId: e.target.value }))}>
            <option value="">Select item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id} disabled={item.availableCopies <= 0}>
                {item.title} ({item.availableCopies}/{item.totalCopies})
              </option>
            ))}
          </select>

          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.borrowerId} onChange={(e) => setForm((prev) => ({ ...prev, borrowerId: e.target.value }))}>
            <option value="">Select borrower</option>
            {borrowers.map((borrower) => (
              <option key={borrower.id} value={borrower.id}>{borrower.firstName} {borrower.lastName} ({borrower.role})</option>
            ))}
          </select>

          <Input type="datetime-local" value={form.dueAt} onChange={(e) => setForm((prev) => ({ ...prev, dueAt: e.target.value }))} />
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <p className="text-sm text-muted-foreground">Filter:</p>
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="OUT">OUT</option>
            <option value="RETURNED">RETURNED</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
        </CardContent>
      </Card>

      <DataState
        isLoading={loansQuery.isLoading || itemsQuery.isLoading}
        isError={loansQuery.isError || itemsQuery.isError}
        isEmpty={!loans.length}
        loadingLabel="Loading loans"
        emptyLabel="No loans found"
        errorLabel="Failed to load loans"
        onRetry={() => {
          void loansQuery.refetch();
          void itemsQuery.refetch();
        }}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Checked Out</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.item?.title ?? loan.itemId}</TableCell>
                    <TableCell>{loan.borrower ? `${loan.borrower.firstName} ${loan.borrower.lastName}` : loan.borrowerId}</TableCell>
                    <TableCell>{loan.status}</TableCell>
                    <TableCell>{new Date(loan.checkedOutAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(loan.dueAt).toLocaleString()}</TableCell>
                    <TableCell>{loan.returnedAt ? new Date(loan.returnedAt).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      {loan.status === 'OUT' ? (
                        <Button size="sm" variant="outline" onClick={() => returnLoan.mutate({ id: loan.id })} disabled={returnLoan.isPending}>
                          Return
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Closed</span>
                      )}
                    </TableCell>
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
