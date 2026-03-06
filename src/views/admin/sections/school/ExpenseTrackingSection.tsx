import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useUpdateExpense,
} from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function ExpenseTrackingSection() {
  const { schoolId } = useAuthStore();
  const expensesQuery = useExpenses(schoolId);
  const createMutation = useCreateExpense(schoolId ?? '');
  const updateMutation = useUpdateExpense(schoolId ?? '');
  const deleteMutation = useDeleteExpense(schoolId ?? '');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: '',
    description: '',
    amount: '',
    vendor: '',
    status: 'DRAFT',
    incurredAt: new Date().toISOString().slice(0, 16),
    notes: '',
  });

  const [editForm, setEditForm] = useState(form);
  const expenses = expensesQuery.data ?? [];

  const submitCreate = async () => {
    await createMutation.mutateAsync({
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      vendor: form.vendor,
      status: form.status,
      incurredAt: new Date(form.incurredAt).toISOString(),
      notes: form.notes,
    });
    setForm({
      category: '',
      description: '',
      amount: '',
      vendor: '',
      status: 'DRAFT',
      incurredAt: new Date().toISOString().slice(0, 16),
      notes: '',
    });
  };

  const submitUpdate = async (id: string) => {
    await updateMutation.mutateAsync({
      id,
      category: editForm.category,
      description: editForm.description,
      amount: Number(editForm.amount),
      vendor: editForm.vendor,
      status: editForm.status,
      incurredAt: new Date(editForm.incurredAt).toISOString(),
      notes: editForm.notes,
    });
    setEditingId(null);
  };

  return (
    <SchoolSectionShell
      title="Expense Tracking"
      description="Track, edit, and remove school expense records."
      actions={<Button size="sm" onClick={submitCreate} disabled={!form.category || !form.description || !form.amount || createMutation.isPending}>Add Expense</Button>}
    >
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <Input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} />
          <Input placeholder="Vendor" value={form.vendor} onChange={(e) => setForm((prev) => ({ ...prev, vendor: e.target.value }))} />
          <Input placeholder="Status" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} />
          <Input type="datetime-local" value={form.incurredAt} onChange={(e) => setForm((prev) => ({ ...prev, incurredAt: e.target.value }))} />
          <Input placeholder="Notes" className="md:col-span-2" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
        </CardContent>
      </Card>

      <DataState
        isLoading={expensesQuery.isLoading}
        isError={expensesQuery.isError}
        isEmpty={!expenses.length}
        loadingLabel="Loading expenses"
        emptyLabel="No expenses found"
        errorLabel="Failed to load expenses"
        onRetry={() => expensesQuery.refetch()}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{editingId === expense.id ? <Input value={editForm.category} onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))} /> : expense.category}</TableCell>
                    <TableCell>{editingId === expense.id ? <Input value={editForm.description} onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))} /> : expense.description}</TableCell>
                    <TableCell>{editingId === expense.id ? <Input type="number" value={editForm.amount} onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))} /> : expense.amount}</TableCell>
                    <TableCell>{editingId === expense.id ? <Input value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))} /> : expense.status}</TableCell>
                    <TableCell>{new Date(expense.incurredAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingId === expense.id ? (
                          <>
                            <Button size="sm" onClick={() => submitUpdate(expense.id)} disabled={updateMutation.isPending}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(expense.id);
                              setEditForm({
                                category: expense.category,
                                description: expense.description,
                                amount: String(expense.amount),
                                vendor: expense.vendor,
                                status: expense.status,
                                incurredAt: new Date(expense.incurredAt).toISOString().slice(0, 16),
                                notes: expense.notes,
                              });
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(expense.id)} disabled={deleteMutation.isPending}>Delete</Button>
                      </div>
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
