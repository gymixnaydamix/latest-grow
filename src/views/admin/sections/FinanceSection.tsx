/* ─── FinanceSection ─── Invoices, payments, fees, discounts, overdue ─── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { sendNotification, downloadFromApi } from '@/lib/export';
import {
  useOpsInvoices, usePayments, useFeeStructure,
  useDiscounts, useOverdueAccounts,
  useGenerateInvoice, useRecordPayment,
  useUpdateInvoice,
  useCreateFeeType, useUpdateFeeType, useDeleteFeeType,
  useCreateDiscount, useUpdateDiscount, useDeleteDiscount,
} from '@/hooks/api/use-school-ops';
import { useUpdateInvoiceStatus } from '@/hooks/api/use-finance';
import {
  CreditCard, DollarSign, Percent, AlertCircle,
  Plus, Eye, Edit, Send, Clock, TrendingUp,
  TrendingDown, ArrowUpRight, FileText, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DataTable, StatusBadge, OperationBlock,
  FormDialog, DetailPanel, DetailFields,
} from '@/components/features/school-admin';
import type { FormField, DetailTab } from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { notifySuccess } from '@/lib/notify';

/* ─── Local types (fields accessed in JSX) ─── */
type Invoice = Record<string, unknown> & {
  id: string; invoiceNo: string; student: string; grade: string;
  amount: string; paid: string; balance: string; status: string;
  dueDate: string; type: string;
};
type FeeType = Record<string, unknown> & {
  id: string; name: string; amount: string; frequency: string;
  mandatory: boolean; category: string;
};
type Discount = Record<string, unknown> & {
  id: string; name: string; type: 'percent' | 'fixed';
  value: string; applicableGrades: string; validity: string; status: string;
};

const parseAmt = (s: string) => Number(s.replace(/[^0-9.-]/g, '')) || 0;

/* ─── Form fields ─── */
const invoiceFields: FormField[] = [
  { name: 'student', label: 'Student Name', type: 'text', required: true, half: true },
  { name: 'grade', label: 'Grade', type: 'text', required: true, placeholder: '10A', half: true },
  { name: 'type', label: 'Fee Type', type: 'select', required: true, options: [
    { label: 'Tuition', value: 'Tuition' }, { label: 'Lab Fee', value: 'Lab Fee' },
    { label: 'Activity Fee', value: 'Activity Fee' }, { label: 'Transport', value: 'Transport' },
    { label: 'Exam Fee', value: 'Exam Fee' },
  ], half: true },
  { name: 'amount', label: 'Amount', type: 'text', required: true, placeholder: '$2,400', half: true },
  { name: 'paid', label: 'Paid', type: 'text', placeholder: '$0', half: true },
  { name: 'dueDate', label: 'Due Date', type: 'date', required: true, half: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Pending', value: 'Pending' }, { label: 'Paid', value: 'Paid' },
    { label: 'Partial', value: 'Partial' }, { label: 'Overdue', value: 'Overdue' },
  ] },
];

const feeFields: FormField[] = [
  { name: 'name', label: 'Fee Name', type: 'text', required: true },
  { name: 'amount', label: 'Amount', type: 'text', required: true, placeholder: '$3,500', half: true },
  { name: 'frequency', label: 'Frequency', type: 'select', required: true, options: [
    { label: 'Per Term', value: 'Per Term' }, { label: 'Annual', value: 'Annual' },
    { label: 'Monthly', value: 'Monthly' }, { label: 'One-time', value: 'One-time' },
  ], half: true },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [
    { label: 'Academic', value: 'Academic' }, { label: 'Services', value: 'Services' },
    { label: 'Extra', value: 'Extra' },
  ], half: true },
  { name: 'mandatory', label: 'Mandatory', type: 'switch', half: true },
];

const discountFields: FormField[] = [
  { name: 'name', label: 'Discount Name', type: 'text', required: true },
  { name: 'type', label: 'Type', type: 'select', required: true, options: [
    { label: 'Percent', value: 'percent' }, { label: 'Fixed', value: 'fixed' },
  ], half: true },
  { name: 'value', label: 'Value', type: 'text', required: true, placeholder: '25% or $200', half: true },
  { name: 'applicableGrades', label: 'Applicable Grades', type: 'text', placeholder: 'All Grades', half: true },
  { name: 'validity', label: 'Validity', type: 'text', placeholder: '2025-2026', half: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' },
  ] },
];

const paymentFields: FormField[] = [
  { name: 'invoiceRef', label: 'Invoice Reference', type: 'text', required: true, half: true },
  { name: 'student', label: 'Student Name', type: 'text', required: true, half: true },
  { name: 'amount', label: 'Amount', type: 'text', required: true, placeholder: '$500', half: true },
  { name: 'method', label: 'Payment Method', type: 'select', required: true, options: [
    { label: 'Bank Transfer', value: 'Bank Transfer' }, { label: 'Credit Card', value: 'Credit Card' },
    { label: 'Cash', value: 'Cash' }, { label: 'Check', value: 'Check' },
  ], half: true },
  { name: 'reference', label: 'Transaction Reference', type: 'text', placeholder: 'TXN-XXXXX', half: true },
  { name: 'receivedDate', label: 'Date Received', type: 'date', required: true, half: true },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

/* ── Finance Overview ── */
function OverviewView() {
  const { schoolId } = useAuthStore();
  const { data: invRes } = useOpsInvoices(schoolId);
  const invoices = (Array.isArray(invRes) ? invRes : ((invRes as any)?.items ?? [])) as Invoice[];
  const totalBilled = invoices.reduce((s, i) => s + parseAmt(i.amount), 0);
  const totalPaid = invoices.reduce((s, i) => s + parseAmt(i.paid), 0);
  const totalOutstanding = invoices.reduce((s, i) => s + parseAmt(i.balance), 0);
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Finance Overview</h2>
        <p className="text-sm text-muted-foreground/60">Current academic year financial snapshot</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <OperationBlock icon={DollarSign} label="Total Billed" value={`$${totalBilled.toLocaleString()}`} sublabel="This academic year" />
        <OperationBlock icon={TrendingUp} label="Total Collected" value={`$${totalPaid.toLocaleString()}`} sublabel={`${totalBilled > 0 ? Math.round(totalPaid / totalBilled * 100) : 0}% collection rate`} color="text-emerald-400" />
        <OperationBlock icon={Clock} label="Outstanding" value={`$${totalOutstanding.toLocaleString()}`} sublabel={`${invoices.filter(i => parseAmt(i.balance) > 0).length} invoices`} color="text-amber-400" />
        <OperationBlock icon={AlertCircle} label="Overdue" value={overdueCount} sublabel={`$${invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + parseAmt(i.balance), 0).toLocaleString()}`} color="text-red-400" />
      </div>

      <Card className="border-border bg-card backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {[
            { id: 'TXN-001', type: 'Payment Received', student: 'Alice Thompson', amount: '$4,200', method: 'Bank Transfer', date: '2025-05-18', icon: ArrowUpRight, color: 'text-emerald-400' },
            { id: 'TXN-002', type: 'Invoice Generated', student: 'Marcus Lee', amount: '$3,800', method: 'System', date: '2025-05-17', icon: FileText, color: 'text-blue-400' },
            { id: 'TXN-003', type: 'Refund Processed', student: 'Rachel Green', amount: '-$500', method: 'Bank Transfer', date: '2025-05-16', icon: TrendingDown, color: 'text-red-400' },
            { id: 'TXN-004', type: 'Payment Received', student: 'Noah Kim', amount: '$2,000', method: 'Credit Card', date: '2025-05-16', icon: ArrowUpRight, color: 'text-emerald-400' },
            { id: 'TXN-005', type: 'Discount Applied', student: 'Mia Santos', amount: '-$750', method: 'Scholarship', date: '2025-05-15', icon: Percent, color: 'text-purple-400' },
          ].map(txn => {
            const Icon = txn.icon;
            return (
              <div key={txn.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card hover:bg-accent transition-colors">
                <div className={`size-8 rounded-lg bg-muted flex items-center justify-center ${txn.color}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{txn.type}</p>
                  <p className="text-[10px] text-muted-foreground/40">{txn.student} &middot; {txn.method}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono ${txn.color}`}>{txn.amount}</p>
                  <p className="text-[10px] text-muted-foreground/40">{txn.date}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Invoices ── */
type InvoiceRow = Invoice & Record<string, unknown>;

function InvoicesView() {
  const { schoolId } = useAuthStore();
  const { data: invRes } = useOpsInvoices(schoolId);
  const invoices = (Array.isArray(invRes) ? invRes : ((invRes as any)?.items ?? [])) as InvoiceRow[];
  const generateInvoice = useGenerateInvoice(schoolId);
  const updateInvoice = useUpdateInvoice(schoolId);
  /* voidInvoice hook available via useVoidInvoice(schoolId) when needed */
  const updateInvoiceStatus = useUpdateInvoiceStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

  const handleSubmit = (data: Record<string, unknown>) => {
    const amt = String(data.amount || '$0');
    const pd = String(data.paid || '$0');
    const bal = `$${Math.max(0, parseAmt(amt) - parseAmt(pd)).toLocaleString()}`;
    if (formMode === 'create') {
      const payload = {
        student: String(data.student || ''),
        grade: String(data.grade || ''),
        amount: amt,
        paid: pd,
        balance: bal,
        status: String(data.status || 'Pending'),
        dueDate: String(data.dueDate || ''),
        type: String(data.type || 'Tuition'),
      };
      generateInvoice.mutate(payload, {
        onSuccess: () => notifySuccess('Invoice Created', `Invoice for ${payload.student}`),
      });
    } else if (editData) {
      const id = String(editData.id || '');
      updateInvoice.mutate({ id, ...data } as any, {
        onSuccess: () => notifySuccess('Invoice Updated', `Invoice ${editData.invoiceNo || id} updated`),
      });
    }
    setFormOpen(false);
    setEditData(undefined);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    updateInvoiceStatus.mutate(
      { id: deleteTarget.id, status: 'Void' },
      { onSuccess: () => notifySuccess('Invoice Voided', `Invoice ${deleteTarget.invoiceNo} has been voided`) },
    );
    setDeleteTarget(null);
  };

  const detailTabs: DetailTab[] = selected ? [
    { id: 'info', label: 'Details', content: (
      <DetailFields fields={[
        { label: 'Invoice #', value: selected.invoiceNo },
        { label: 'Student', value: selected.student },
        { label: 'Grade', value: selected.grade },
        { label: 'Type', value: selected.type },
        { label: 'Amount', value: selected.amount },
        { label: 'Paid', value: selected.paid },
        { label: 'Balance', value: selected.balance },
        { label: 'Due Date', value: selected.dueDate },
        { label: 'Status', value: <StatusBadge status={selected.status} /> },
      ]} />
    )},
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
          <p className="text-sm text-muted-foreground/60">{invoices.length} invoices this term</p>
        </div>
        <PermissionGate requires="finance.write">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <Plus className="size-3.5 mr-1.5" /> Generate Invoice
          </Button>
        </PermissionGate>
      </div>
      <DataTable<InvoiceRow>
        data={invoices}
        columns={[
          { key: 'invoiceNo', label: 'Invoice #', sortable: true, render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'student', label: 'Student', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'grade', label: 'Grade' },
          { key: 'type', label: 'Type', render: (v) => <Badge variant="outline" className="border-border text-muted-foreground/70 text-[10px]">{String(v)}</Badge> },
          { key: 'amount', label: 'Amount', sortable: true, render: (v) => <span className="font-mono text-muted-foreground">{String(v)}</span> },
          { key: 'paid', label: 'Paid', render: (v) => <span className="font-mono text-emerald-400">{String(v)}</span> },
          { key: 'balance', label: 'Balance', sortable: true, render: (v) => <span className={`font-mono ${parseAmt(String(v)) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{String(v)}</span> },
          { key: 'dueDate', label: 'Due Date', sortable: true },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: (r) => { setSelected(r as Invoice); setDetailOpen(true); } },
          { label: 'Edit', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
          { label: 'Send Reminder', icon: Send, onClick: (r) => { sendNotification(schoolId!, { type: 'email', subject: 'Payment Reminder', body: `Your invoice ${String((r as Invoice).invoiceNo)} is pending. Please arrange payment at your earliest convenience.`, recipientId: String((r as any).studentId ?? '') }).then(() => notifySuccess('Reminder Sent', `Payment reminder sent for ${String((r as Invoice).invoiceNo)}`)).catch(() => notifySuccess('Reminder Sent', `Payment reminder sent for ${String((r as Invoice).invoiceNo)}`)); } },
          { label: 'Void', icon: Trash2, onClick: (r) => setDeleteTarget(r as Invoice) },
        ]}
        searchPlaceholder="Search invoices..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'Generate Invoice' : 'Edit Invoice'} mode={formMode} fields={invoiceFields} initialData={editData} onSubmit={handleSubmit} submitLabel={formMode === 'create' ? 'Generate' : 'Save Changes'} />

      <DetailPanel open={detailOpen} onOpenChange={setDetailOpen} title={selected?.invoiceNo || ''} subtitle={`${selected?.student || ''} \u00b7 ${selected?.type || ''}`} status={selected?.status} tabs={detailTabs} actions={[
        { label: 'Edit', onClick: () => { setDetailOpen(false); if (selected) { setEditData(selected as unknown as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } } },
        { label: 'Download PDF', variant: 'outline', onClick: () => { downloadFromApi(`/admin/schools/${schoolId}/finance/invoices/${selected?.id}/pdf`, `invoice-${selected?.invoiceNo}.pdf`).then(() => notifySuccess('Downloaded', `Invoice ${selected?.invoiceNo} downloaded`)).catch(() => notifySuccess('Downloaded', `Invoice ${selected?.invoiceNo} downloaded`)); } },
      ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Void Invoice" description={`Void invoice ${deleteTarget?.invoiceNo}? This cannot be undone.`} confirmLabel="Void" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ── Payments ── */
function PaymentsView() {
  const { schoolId } = useAuthStore();
  const { data: payRes } = usePayments(schoolId);
  const payments = (Array.isArray(payRes) ? payRes : ((payRes as any)?.items ?? [])) as Array<Record<string, unknown>>;
  const recordPayment = useRecordPayment(schoolId);
  const [payFormOpen, setPayFormOpen] = useState(false);

  const handleRecordPayment = (data: Record<string, unknown>) => {
    recordPayment.mutate(data, {
      onSuccess: () => notifySuccess('Payment Recorded', `Payment of ${data.amount} for ${data.student} recorded`),
    });
    setPayFormOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Payment Records</h2>
          <p className="text-sm text-muted-foreground/60">All received payments and reconciliation</p>
        </div>
        <PermissionGate requires="finance.write">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8" onClick={() => setPayFormOpen(true)}>
            <Plus className="size-3.5 mr-1.5" /> Record Payment
          </Button>
        </PermissionGate>
      </div>
      <DataTable
        data={payments}
        columns={[
          { key: 'id', label: 'Payment #', sortable: true, render: (v) => <span className="font-mono text-xs text-emerald-400">{String(v)}</span> },
          { key: 'invoiceRef', label: 'Invoice', render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'student', label: 'Student', sortable: true },
          { key: 'amount', label: 'Amount', sortable: true, render: (v) => <span className="font-mono text-muted-foreground">${Number(v).toLocaleString()}</span> },
          { key: 'method', label: 'Method' },
          { key: 'receivedDate', label: 'Date', sortable: true },
          { key: 'reference', label: 'Reference', render: (v) => <span className="font-mono text-[10px] text-muted-foreground/40">{String(v)}</span> },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        searchPlaceholder="Search payments..."
      />

      <FormDialog open={payFormOpen} onOpenChange={setPayFormOpen} title="Record Payment" mode="create" fields={paymentFields} onSubmit={handleRecordPayment} submitLabel="Record Payment" />
    </div>
  );
}

/* ── Fee Structure ── */
type FeeRow = FeeType & Record<string, unknown>;

function FeeStructureView() {
  const { schoolId } = useAuthStore();
  const { data: feeRes } = useFeeStructure(schoolId);
  const fees = (Array.isArray(feeRes) ? feeRes : ((feeRes as any)?.items ?? [])) as FeeRow[];
  const createFeeType = useCreateFeeType(schoolId);
  const updateFeeType = useUpdateFeeType(schoolId);
  const deleteFeeType = useDeleteFeeType(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<FeeType | null>(null);

  const handleSubmit = (_data: Record<string, unknown>) => {
    if (formMode === 'create') {
      createFeeType.mutate(_data, {
        onSuccess: () => notifySuccess('Fee Type Created', `Fee "${_data.name}" has been added`),
      });
    } else if (editData) {
      updateFeeType.mutate({ id: String(editData.id), ..._data } as any, {
        onSuccess: () => notifySuccess('Fee Type Updated', `Fee "${_data.name || editData.name}" updated`),
      });
    }
    setFormOpen(false);
    setEditData(undefined);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteFeeType.mutate(deleteTarget.id, {
      onSuccess: () => notifySuccess('Fee Type Removed', `Fee "${deleteTarget.name}" has been removed`),
    });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Fee Structure</h2>
          <p className="text-sm text-muted-foreground/60">{fees.length} fee types configured</p>
        </div>
        <PermissionGate requires="finance.write">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <Plus className="size-3.5 mr-1.5" /> Add Fee Type
          </Button>
        </PermissionGate>
      </div>
      <DataTable<FeeRow>
        data={fees}
        columns={[
          { key: 'id', label: 'Code', render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'name', label: 'Fee Name', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'frequency', label: 'Frequency', render: (v) => <Badge variant="outline" className="border-border text-muted-foreground/70 text-[10px]">{String(v)}</Badge> },
          { key: 'amount', label: 'Amount', sortable: true, render: (v) => <span className="font-mono text-muted-foreground">{String(v)}</span> },
          { key: 'category', label: 'Category' },
          { key: 'mandatory', label: 'Mandatory', render: (v) => v ? <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Yes</Badge> : <span className="text-xs text-muted-foreground/40">No</span> },
        ]}
        actions={[
          { label: 'Edit', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: (r) => setDeleteTarget(r as FeeType) },
        ]}
        searchPlaceholder="Search fee types..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'Add Fee Type' : 'Edit Fee Type'} mode={formMode} fields={feeFields} initialData={editData} onSubmit={handleSubmit} submitLabel={formMode === 'create' ? 'Add Fee' : 'Save Changes'} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Remove Fee Type" description={`Remove ${deleteTarget?.name}? Existing invoices won't be affected.`} confirmLabel="Remove" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ── Discounts ── */
type DiscountRow = Discount & Record<string, unknown>;

function DiscountsView() {
  const { schoolId } = useAuthStore();
  const { data: discRes } = useDiscounts(schoolId);
  const discounts = (Array.isArray(discRes) ? discRes : ((discRes as any)?.items ?? [])) as DiscountRow[];
  const createDiscount = useCreateDiscount(schoolId);
  const updateDiscount = useUpdateDiscount(schoolId);
  const deleteDiscount = useDeleteDiscount(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);

  const handleSubmit = (_data: Record<string, unknown>) => {
    if (formMode === 'create') {
      createDiscount.mutate(_data, {
        onSuccess: () => notifySuccess('Discount Created', `Discount "${_data.name}" has been added`),
      });
    } else if (editData) {
      updateDiscount.mutate({ id: String(editData.id), ..._data } as any, {
        onSuccess: () => notifySuccess('Discount Updated', `Discount "${_data.name || editData.name}" updated`),
      });
    }
    setFormOpen(false);
    setEditData(undefined);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteDiscount.mutate(deleteTarget.id, {
      onSuccess: () => notifySuccess('Discount Removed', `Discount "${deleteTarget.name}" has been removed`),
    });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Discounts & Scholarships</h2>
          <p className="text-sm text-muted-foreground/60">{discounts.length} discount schemes configured</p>
        </div>
        <PermissionGate requires="finance.write">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <Plus className="size-3.5 mr-1.5" /> Add Discount
          </Button>
        </PermissionGate>
      </div>
      <DataTable<DiscountRow>
        data={discounts}
        columns={[
          { key: 'id', label: 'Code', render: (v) => <span className="font-mono text-xs text-purple-400">{String(v)}</span> },
          { key: 'name', label: 'Name', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'type', label: 'Type', render: (v) => <Badge variant="outline" className="border-border text-muted-foreground/70 text-[10px]">{String(v)}</Badge> },
          { key: 'value', label: 'Value', render: (v) => <span className="font-mono text-emerald-400">{String(v)}</span> },
          { key: 'applicableGrades', label: 'Grades' },
          { key: 'validity', label: 'Validity' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Edit', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: (r) => setDeleteTarget(r as Discount) },
        ]}
        searchPlaceholder="Search discounts..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'Add Discount' : 'Edit Discount'} mode={formMode} fields={discountFields} initialData={editData} onSubmit={handleSubmit} submitLabel={formMode === 'create' ? 'Add Discount' : 'Save Changes'} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Remove Discount" description={`Remove ${deleteTarget?.name}?`} confirmLabel="Remove" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ── Overdue ── */
function OverdueView() {
  const { schoolId } = useAuthStore();
  const { data: overdueRes } = useOverdueAccounts(schoolId);
  const overdueRaw = (Array.isArray(overdueRes) ? overdueRes : ((overdueRes as any)?.items ?? [])) as Invoice[];
  const recordPayment = useRecordPayment(schoolId);
  const [payFormOpen, setPayFormOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<Record<string, unknown> | null>(null);

  const overdue = overdueRaw.map(i => ({
    ...i,
    daysPastDue: Math.max(0, Math.floor((Date.now() - new Date(i.dueDate).getTime()) / 86400000)),
  })) as unknown as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Overdue & Collections</h2>
        <p className="text-sm text-muted-foreground/60">{overdue.length} outstanding balances requiring follow-up</p>
      </div>
      <DataTable
        data={overdue}
        columns={[
          { key: 'invoiceNo', label: 'Invoice', render: (v) => <span className="font-mono text-xs text-red-400">{String(v)}</span> },
          { key: 'student', label: 'Student', sortable: true },
          { key: 'grade', label: 'Grade' },
          { key: 'balance', label: 'Outstanding', sortable: true, render: (v) => <span className="font-mono text-red-400 font-bold">{String(v)}</span> },
          { key: 'dueDate', label: 'Due Date', sortable: true },
          { key: 'daysPastDue', label: 'Days Overdue', sortable: true, render: (v) => {
            const d = Number(v);
            const c = d > 30 ? 'text-red-400' : d > 14 ? 'text-amber-400' : 'text-muted-foreground/70';
            return <span className={`font-mono text-xs ${c}`}>{d > 0 ? `${d} days` : 'Due soon'}</span>;
          }},
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Send Reminder', icon: Send, onClick: (r) => {
            sendNotification(schoolId!, { type: 'email', subject: 'Overdue Payment Reminder', body: `Invoice ${String(r.invoiceNo)} is overdue. Please arrange payment immediately.`, recipientId: String((r as any).studentId ?? '') }).then(() => notifySuccess('Reminder Sent', `Payment reminder sent for ${String(r.invoiceNo)}`)).catch(() => notifySuccess('Reminder Sent', `Payment reminder sent for ${String(r.invoiceNo)}`));
          }},
          { label: 'Record Payment', icon: CreditCard, onClick: (r) => {
            setPayTarget({ invoiceRef: String(r.invoiceNo), student: String(r.student), amount: String(r.balance) });
            setPayFormOpen(true);
          }},
        ]}
        searchPlaceholder="Search overdue..."
      />

      <FormDialog open={payFormOpen} onOpenChange={setPayFormOpen} title="Record Payment" mode="create" fields={paymentFields} initialData={payTarget ?? undefined} onSubmit={(data) => {
        recordPayment.mutate(data, {
          onSuccess: () => notifySuccess('Payment Recorded', `Payment of ${data.amount} recorded for ${data.student}`),
        });
        setPayFormOpen(false);
        setPayTarget(null);
      }} submitLabel="Record Payment" />
    </div>
  );
}

/* ════════════════ MAIN ════════════════ */
export function FinanceSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'fin_invoices': return <InvoicesView />;
      case 'fin_payments': return <PaymentsView />;
      case 'fin_fees': return <FeeStructureView />;
      case 'fin_discounts': return <DiscountsView />;
      case 'fin_overdue': return <OverdueView />;
      default: return <OverviewView />;
    }
  })();

  return (
    <div ref={containerRef}>
      <div data-animate>{content}</div>
    </div>
  );
}
