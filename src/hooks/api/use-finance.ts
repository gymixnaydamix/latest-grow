import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type {
  ApiSuccessResponse,
  TuitionPlan,
  Invoice,
  PayrollRecord,
  Budget,
  ExpenseRecord,
  FinancialReportSummary,
} from '@root/types';

// ── Types ──
interface CreateTuitionPlanPayload {
  name: string;
  gradeLevel: string;
  amount: number;
  frequency: string;
}

interface CreateInvoicePayload {
  parentId: string;
  studentId: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  dueDate: string;
}

interface ProcessPayrollPayload {
  staffId: string;
  period: string;
  grossAmount: number;
  deductions: Record<string, number>;
}

interface CreateBudgetPayload {
  department: string;
  fiscalYear: number;
  allocatedAmount: number;
}

interface CreateGrantPayload {
  name: string;
  amount: number;
  source: string;
  deadline: string;
}

interface CreateExpensePayload {
  category: string;
  description: string;
  amount: number;
  vendor?: string;
  status?: string;
  incurredAt: string;
  notes?: string;
}

// ── Keys ──
export const financeKeys = {
  tuitionPlans: (schoolId: string) => ['finance', 'tuition', schoolId] as const,
  invoices: (schoolId: string) => ['finance', 'invoices', schoolId] as const,
  invoice: (id: string) => ['finance', 'invoice', id] as const,
  parentInvoices: (parentId: string) => ['finance', 'parentInvoices', parentId] as const,
  payroll: () => ['finance', 'payroll'] as const,
  budgets: (schoolId: string) => ['finance', 'budgets', schoolId] as const,
  grants: (schoolId: string) => ['finance', 'grants', schoolId] as const,
  expenses: (schoolId: string) => ['finance', 'expenses', schoolId] as const,
  reportSummary: (schoolId: string, from?: string, to?: string) => ['finance', 'reportSummary', schoolId, from ?? '', to ?? ''] as const,
};

// ── Tuition Plan Queries ──
export function useTuitionPlans(schoolId: string | null) {
  return useQuery({
    queryKey: financeKeys.tuitionPlans(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<TuitionPlan[]>>(`/finance/schools/${schoolId}/tuition-plans`).then(r => r.data),
    enabled: !!schoolId,
  });
}

// ── Invoice Queries ──
export function useInvoices(schoolId: string | null) {
  return useQuery({
    queryKey: financeKeys.invoices(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Invoice[]>>(`/finance/schools/${schoolId}/invoices`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: financeKeys.invoice(id!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Invoice>>(`/finance/invoices/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

export function useParentInvoices(parentId: string | null) {
  return useQuery({
    queryKey: financeKeys.parentInvoices(parentId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Invoice[]>>(`/finance/parents/${parentId}/invoices`).then(r => r.data),
    enabled: !!parentId,
  });
}

// ── Payroll Queries ──
export function usePayroll() {
  return useQuery({
    queryKey: financeKeys.payroll(),
    queryFn: () =>
      api.get<ApiSuccessResponse<PayrollRecord[]>>('/finance/payroll').then(r => r.data),
  });
}

// ── Budget Queries ──
export function useBudgets(schoolId: string | null) {
  return useQuery({
    queryKey: financeKeys.budgets(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<Budget[]>>(`/finance/schools/${schoolId}/budgets`).then(r => r.data),
    enabled: !!schoolId,
  });
}

// ── Grant Queries ──
export function useGrants(schoolId: string | null) {
  return useQuery({
    queryKey: financeKeys.grants(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<unknown[]>>(`/finance/schools/${schoolId}/grants`).then(r => r.data),
    enabled: !!schoolId,
  });
}

// ── Tuition Plan Mutations ──
export function useCreateTuitionPlan(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTuitionPlanPayload) =>
      api.post<ApiSuccessResponse<TuitionPlan>>(`/finance/schools/${schoolId}/tuition-plans`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.tuitionPlans(schoolId) });
    },
  });
}

export function useUpdateTuitionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateTuitionPlanPayload>) =>
      api.patch<ApiSuccessResponse<TuitionPlan>>(`/finance/tuition-plans/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance', 'tuition'] });
    },
  });
}

export function useDeleteTuitionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/finance/tuition-plans/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance', 'tuition'] });
    },
  });
}

// ── Invoice Mutations ──
export function useCreateInvoice(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) =>
      api.post<ApiSuccessResponse<Invoice>>(`/finance/schools/${schoolId}/invoices`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.invoices(schoolId) });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<ApiSuccessResponse<Invoice>>(`/finance/invoices/${id}/status`, { status }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance', 'invoices'] });
    },
  });
}

// ── Payroll Mutations ──
export function useProcessPayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProcessPayrollPayload) =>
      api.post<ApiSuccessResponse<PayrollRecord>>('/finance/payroll', payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.payroll() });
    },
  });
}

// ── Budget Mutations ──
export function useCreateBudget(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBudgetPayload) =>
      api.post<ApiSuccessResponse<Budget>>(`/finance/schools/${schoolId}/budgets`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.budgets(schoolId) });
    },
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateBudgetPayload & { spentAmount: number }>) =>
      api.patch<ApiSuccessResponse<Budget>>(`/finance/budgets/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance', 'budgets'] });
    },
  });
}

// ── Grant Mutations ──
export function useCreateGrant(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGrantPayload) =>
      api.post(`/finance/schools/${schoolId}/grants`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.grants(schoolId) });
    },
  });
}

export function useUpdateGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateGrantPayload>) =>
      api.patch(`/finance/grants/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['finance', 'grants'] });
    },
  });
}

export function useExpenses(schoolId: string | null) {
  return useQuery({
    queryKey: financeKeys.expenses(schoolId!),
    queryFn: () =>
      api.get<ApiSuccessResponse<ExpenseRecord[]>>(`/finance/schools/${schoolId}/expenses`).then(r => r.data),
    enabled: !!schoolId,
  });
}

export function useCreateExpense(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) =>
      api.post<ApiSuccessResponse<ExpenseRecord>>(`/finance/schools/${schoolId}/expenses`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.expenses(schoolId) });
      qc.invalidateQueries({ queryKey: ['finance', 'reportSummary', schoolId] });
    },
  });
}

export function useUpdateExpense(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateExpensePayload>) =>
      api.patch<ApiSuccessResponse<ExpenseRecord>>(`/finance/expenses/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.expenses(schoolId) });
      qc.invalidateQueries({ queryKey: ['finance', 'reportSummary', schoolId] });
    },
  });
}

export function useDeleteExpense(schoolId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/finance/expenses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.expenses(schoolId) });
      qc.invalidateQueries({ queryKey: ['finance', 'reportSummary', schoolId] });
    },
  });
}

export function useFinancialReportSummary(schoolId: string | null, from?: string, to?: string) {
  return useQuery({
    queryKey: financeKeys.reportSummary(schoolId!, from, to),
    queryFn: () => {
      const search = new URLSearchParams();
      if (from) search.set('from', from);
      if (to) search.set('to', to);
      const qs = search.toString();
      return api.get<ApiSuccessResponse<FinancialReportSummary>>(`/finance/schools/${schoolId}/reports/summary${qs ? `?${qs}` : ''}`).then(r => r.data);
    },
    enabled: !!schoolId,
  });
}

export function useExportFinancialReport(schoolId: string) {
  return useMutation({
    mutationFn: async ({ from, to }: { from?: string; to?: string }) => {
      const search = new URLSearchParams({ format: 'csv' });
      if (from) search.set('from', from);
      if (to) search.set('to', to);
      const response = await fetch(`/api/finance/schools/${schoolId}/reports/summary/export?${search.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to export report');
      }
      return response.text();
    },
  });
}
