import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateTuitionPlan,
  useDeleteTuitionPlan,
  useInvoices,
  useTuitionPlans,
  useUpdateTuitionPlan,
} from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function TuitionBillingSection() {
  const { schoolId } = useAuthStore();
  const tuitionQuery = useTuitionPlans(schoolId);
  const invoicesQuery = useInvoices(schoolId);

  const createMutation = useCreateTuitionPlan(schoolId ?? '');
  const updateMutation = useUpdateTuitionPlan();
  const deleteMutation = useDeleteTuitionPlan();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', gradeLevel: '', amount: '', frequency: 'MONTHLY' });
  const [editForm, setEditForm] = useState({ name: '', gradeLevel: '', amount: '', frequency: 'MONTHLY' });

  const plans = tuitionQuery.data ?? [];
  const invoices = (invoicesQuery.data as { items?: unknown[] } | undefined)?.items ?? invoicesQuery.data ?? [];

  const submitCreate = async () => {
    await createMutation.mutateAsync({
      name: form.name,
      gradeLevel: form.gradeLevel,
      amount: Number(form.amount),
      frequency: form.frequency,
    });
    setForm({ name: '', gradeLevel: '', amount: '', frequency: 'MONTHLY' });
  };

  const submitUpdate = async (id: string) => {
    await updateMutation.mutateAsync({
      id,
      name: editForm.name,
      gradeLevel: editForm.gradeLevel,
      amount: Number(editForm.amount),
      frequency: editForm.frequency,
    });
    setEditingId(null);
  };

  return (
    <SchoolSectionShell
      title="Tuition & Billing"
      description="Manage tuition plans and monitor invoice pipeline."
      actions={<Button size="sm" onClick={submitCreate} disabled={!form.name || !form.amount || createMutation.isPending}>Add Plan</Button>}
    >
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Plan name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
          <Input placeholder="Grade level" value={form.gradeLevel} onChange={(e) => setForm((prev) => ({ ...prev, gradeLevel: e.target.value }))} />
          <Input placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} />
          <Input placeholder="Frequency" value={form.frequency} onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value }))} />
        </CardContent>
      </Card>

      <DataState
        isLoading={tuitionQuery.isLoading}
        isError={tuitionQuery.isError}
        isEmpty={!plans.length}
        loadingLabel="Loading tuition plans"
        emptyLabel="No tuition plans found"
        errorLabel="Failed to load tuition plans"
        onRetry={() => tuitionQuery.refetch()}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{editingId === plan.id ? <Input value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} /> : plan.name}</TableCell>
                    <TableCell>{editingId === plan.id ? <Input value={editForm.gradeLevel} onChange={(e) => setEditForm((prev) => ({ ...prev, gradeLevel: e.target.value }))} /> : plan.gradeLevel}</TableCell>
                    <TableCell>{editingId === plan.id ? <Input type="number" value={editForm.amount} onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))} /> : plan.amount}</TableCell>
                    <TableCell>{editingId === plan.id ? <Input value={editForm.frequency} onChange={(e) => setEditForm((prev) => ({ ...prev, frequency: e.target.value }))} /> : plan.frequency}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingId === plan.id ? (
                          <>
                            <Button size="sm" onClick={() => submitUpdate(plan.id)} disabled={updateMutation.isPending}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(plan.id);
                              setEditForm({
                                name: plan.name,
                                gradeLevel: plan.gradeLevel,
                                amount: String(plan.amount),
                                frequency: plan.frequency,
                              });
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(plan.id)} disabled={deleteMutation.isPending}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>

      <Card>
        <CardContent className="space-y-2 p-4">
          <p className="text-sm font-medium">Invoice Snapshot</p>
          <p className="text-xs text-muted-foreground">Open/paid invoices from current billing pipeline.</p>
          <DataState
            isLoading={invoicesQuery.isLoading}
            isError={invoicesQuery.isError}
            isEmpty={!invoices.length}
            loadingLabel="Loading invoices"
            emptyLabel="No invoices found"
            errorLabel="Failed to load invoices"
            onRetry={() => invoicesQuery.refetch()}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.slice(0, 10).map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id.slice(0, 8)}</TableCell>
                    <TableCell>{invoice.status}</TableCell>
                    <TableCell>{invoice.totalAmount}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataState>
        </CardContent>
      </Card>
    </SchoolSectionShell>
  );
}
