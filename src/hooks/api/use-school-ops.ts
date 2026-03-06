/* ──────────────────────────────────────────────────────────────────────
 * use-school-ops — Admin School Operations API hooks
 * Covers: attendance, academics, exams, finance-ops, transport,
 * facilities, communication, settings, audit, reports
 * ────────────────────────────────────────────────────────────────────── */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { ApiSuccessResponse } from '@root/types';

// ────────────────────────── Query key factory ──────────────────────────
export const schoolOpsKeys = {
  // Attendance
  attendanceOverview: (schoolId: string) => ['school-ops', 'attendance', 'overview', schoolId] as const,
  attendanceDaily: (schoolId: string, date: string) => ['school-ops', 'attendance', 'daily', schoolId, date] as const,
  attendanceExceptions: (schoolId: string) => ['school-ops', 'attendance', 'exceptions', schoolId] as const,
  attendanceCorrections: (schoolId: string) => ['school-ops', 'attendance', 'corrections', schoolId] as const,
  staffAttendance: (schoolId: string, date: string) => ['school-ops', 'attendance', 'staff', schoolId, date] as const,

  // Academics
  academicYears: (schoolId: string) => ['school-ops', 'academics', 'years', schoolId] as const,
  classes: (schoolId: string) => ['school-ops', 'academics', 'classes', schoolId] as const,
  subjects: (schoolId: string) => ['school-ops', 'academics', 'subjects', schoolId] as const,
  timetable: (schoolId: string, classId: string) => ['school-ops', 'academics', 'timetable', schoolId, classId] as const,
  teacherAssignments: (schoolId: string) => ['school-ops', 'academics', 'teachers', schoolId] as const,
  promotionRules: (schoolId: string) => ['school-ops', 'academics', 'promotion', schoolId] as const,

  // Exams
  examSchedule: (schoolId: string) => ['school-ops', 'exams', 'schedule', schoolId] as const,
  gradebook: (schoolId: string, examId: string) => ['school-ops', 'exams', 'gradebook', schoolId, examId] as const,
  missingMarks: (schoolId: string) => ['school-ops', 'exams', 'missing', schoolId] as const,
  examResults: (schoolId: string) => ['school-ops', 'exams', 'results', schoolId] as const,

  // Finance Ops
  invoices: (schoolId: string) => ['school-ops', 'finance', 'invoices', schoolId] as const,
  payments: (schoolId: string) => ['school-ops', 'finance', 'payments', schoolId] as const,
  feeStructure: (schoolId: string) => ['school-ops', 'finance', 'fees', schoolId] as const,
  discounts: (schoolId: string) => ['school-ops', 'finance', 'discounts', schoolId] as const,
  overdueAccounts: (schoolId: string) => ['school-ops', 'finance', 'overdue', schoolId] as const,

  // Transport
  routes: (schoolId: string) => ['school-ops', 'transport', 'routes', schoolId] as const,
  vehicles: (schoolId: string) => ['school-ops', 'transport', 'vehicles', schoolId] as const,
  routeAssignments: (schoolId: string) => ['school-ops', 'transport', 'assignments', schoolId] as const,
  transportIncidents: (schoolId: string) => ['school-ops', 'transport', 'incidents', schoolId] as const,

  // Facilities
  rooms: (schoolId: string) => ['school-ops', 'facilities', 'rooms', schoolId] as const,
  maintenance: (schoolId: string) => ['school-ops', 'facilities', 'maintenance', schoolId] as const,
  assets: (schoolId: string) => ['school-ops', 'facilities', 'assets', schoolId] as const,
  facilityBookings: (schoolId: string) => ['school-ops', 'facilities', 'bookings', schoolId] as const,

  // Communication
  messages: (schoolId: string) => ['school-ops', 'comm', 'messages', schoolId] as const,
  announcements: (schoolId: string) => ['school-ops', 'comm', 'announcements', schoolId] as const,
  broadcasts: (schoolId: string) => ['school-ops', 'comm', 'broadcasts', schoolId] as const,
  templates: (schoolId: string) => ['school-ops', 'comm', 'templates', schoolId] as const,
  commLogs: (schoolId: string) => ['school-ops', 'comm', 'logs', schoolId] as const,

  // Settings
  schoolProfile: (schoolId: string) => ['school-ops', 'settings', 'profile', schoolId] as const,
  academicConfig: (schoolId: string) => ['school-ops', 'settings', 'academic', schoolId] as const,
  gradingScales: (schoolId: string) => ['school-ops', 'settings', 'grading', schoolId] as const,
  feeConfig: (schoolId: string) => ['school-ops', 'settings', 'fees', schoolId] as const,
  roles: (schoolId: string) => ['school-ops', 'settings', 'roles', schoolId] as const,

  // Audit
  auditLog: (schoolId: string) => ['school-ops', 'audit', 'log', schoolId] as const,
  approvalHistory: (schoolId: string) => ['school-ops', 'audit', 'approvals', schoolId] as const,
  complianceTasks: (schoolId: string) => ['school-ops', 'audit', 'compliance', schoolId] as const,

  // Reports
  report: (schoolId: string, type: string) => ['school-ops', 'reports', type, schoolId] as const,

  // Leave requests
  leaveRequests: (schoolId: string) => ['school-ops', 'staff', 'leave', schoolId] as const,
};

// ═══════════════════════ GENERIC HELPERS ═══════════════════════

/** Generic "list" query that maps to GET /admin/schools/:id/<resource> */
function useSchoolResource<T>(
  schoolId: string | null,
  resource: string,
  queryKey: readonly unknown[],
) {
  return useQuery<T>({
    queryKey,
    queryFn: () =>
      api.get<ApiSuccessResponse<T>>(`/admin/schools/${schoolId}/${resource}`).then(r => r.data),
    enabled: !!schoolId,
  });
}

/** Generic mutation — POST */
function useSchoolMutationPost<TPayload, TResp = unknown>(
  schoolId: string | null,
  resource: string,
  invalidateKeys: ReadonlyArray<readonly unknown[]>,
) {
  const qc = useQueryClient();
  return useMutation<TResp, Error, TPayload>({
    mutationFn: (payload) =>
      api.post<ApiSuccessResponse<TResp>>(`/admin/schools/${schoolId}/${resource}`, payload).then(r => r.data),
    onSuccess: () => {
      invalidateKeys.forEach(k => qc.invalidateQueries({ queryKey: k }));
    },
  });
}

/** Generic mutation — PATCH by id */
function useSchoolMutationPatch<TPayload extends { id: string }, TResp = unknown>(
  schoolId: string | null,
  resource: string,
  invalidateKeys: ReadonlyArray<readonly unknown[]>,
) {
  const qc = useQueryClient();
  return useMutation<TResp, Error, TPayload>({
    mutationFn: ({ id, ...payload }) =>
      api.patch<ApiSuccessResponse<TResp>>(`/admin/schools/${schoolId}/${resource}/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      invalidateKeys.forEach(k => qc.invalidateQueries({ queryKey: k }));
    },
  });
}

/** Generic mutation — DELETE by id */
function useSchoolMutationDelete(
  schoolId: string | null,
  resource: string,
  invalidateKeys: ReadonlyArray<readonly unknown[]>,
) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.del(`/admin/schools/${schoolId}/${resource}/${id}`),
    onSuccess: () => {
      invalidateKeys.forEach(k => qc.invalidateQueries({ queryKey: k }));
    },
  });
}

// ═══════════════════ ATTENDANCE HOOKS ═══════════════════

export function useAttendanceOverview(schoolId: string | null) {
  return useSchoolResource(schoolId, 'attendance/overview', schoolOpsKeys.attendanceOverview(schoolId!));
}
export function useAttendanceDaily(schoolId: string | null, date: string) {
  return useSchoolResource(schoolId, `attendance/daily?date=${date}`, schoolOpsKeys.attendanceDaily(schoolId!, date));
}
export function useAttendanceExceptions(schoolId: string | null) {
  return useSchoolResource(schoolId, 'attendance/exceptions', schoolOpsKeys.attendanceExceptions(schoolId!));
}
export function useAttendanceCorrections(schoolId: string | null) {
  return useSchoolResource(schoolId, 'attendance/corrections', schoolOpsKeys.attendanceCorrections(schoolId!));
}
export function useOpsMarkAttendance(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'attendance/mark', [
    schoolOpsKeys.attendanceDaily(schoolId!, new Date().toISOString().slice(0, 10)),
    schoolOpsKeys.attendanceOverview(schoolId!),
  ]);
}
export function useApproveCorrection(schoolId: string | null) {
  return useSchoolMutationPatch<{ id: string; status: string }>(schoolId, 'attendance/corrections', [
    schoolOpsKeys.attendanceCorrections(schoolId!),
  ]);
}

// ═══════════════════ ACADEMICS HOOKS ═══════════════════

export function useAcademicYears(schoolId: string | null) {
  return useSchoolResource(schoolId, 'academics/years', schoolOpsKeys.academicYears(schoolId!));
}
export function useClasses(schoolId: string | null) {
  return useSchoolResource(schoolId, 'academics/classes', schoolOpsKeys.classes(schoolId!));
}
export function useSubjects(schoolId: string | null) {
  return useSchoolResource(schoolId, 'academics/subjects', schoolOpsKeys.subjects(schoolId!));
}
export function useTimetable(schoolId: string | null, classId: string) {
  return useSchoolResource(schoolId, `academics/timetable/${classId}`, schoolOpsKeys.timetable(schoolId!, classId));
}
export function useTeacherAssignments(schoolId: string | null) {
  return useSchoolResource(schoolId, 'academics/assignments', schoolOpsKeys.teacherAssignments(schoolId!));
}
export function useCreateClass(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'academics/classes', [schoolOpsKeys.classes(schoolId!)]);
}
export function useUpdateClass(schoolId: string | null) {
  return useSchoolMutationPatch<{ id: string; [k: string]: unknown }>(schoolId, 'academics/classes', [schoolOpsKeys.classes(schoolId!)]);
}

// ═══════════════════ EXAMS HOOKS ═══════════════════

export function useExamSchedule(schoolId: string | null) {
  return useSchoolResource(schoolId, 'exams/schedule', schoolOpsKeys.examSchedule(schoolId!));
}
export function useGradebook(schoolId: string | null, examId: string) {
  return useSchoolResource(schoolId, `exams/gradebook/${examId}`, schoolOpsKeys.gradebook(schoolId!, examId));
}
export function useMissingMarks(schoolId: string | null) {
  return useSchoolResource(schoolId, 'exams/missing', schoolOpsKeys.missingMarks(schoolId!));
}
export function useExamResults(schoolId: string | null) {
  return useSchoolResource(schoolId, 'exams/results', schoolOpsKeys.examResults(schoolId!));
}
export function useCreateExam(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'exams/schedule', [schoolOpsKeys.examSchedule(schoolId!)]);
}
export function useUpdateMarks(schoolId: string | null) {
  return useSchoolMutationPatch<{ id: string; marks: Record<string, number> }>(schoolId, 'exams/gradebook', [
    schoolOpsKeys.examSchedule(schoolId!),
    schoolOpsKeys.missingMarks(schoolId!),
  ]);
}

// ═══════════════════ FINANCE OPS HOOKS ═══════════════════

export function useOpsInvoices(schoolId: string | null) {
  return useSchoolResource(schoolId, 'finance/invoices', schoolOpsKeys.invoices(schoolId!));
}
export function usePayments(schoolId: string | null) {
  return useSchoolResource(schoolId, 'finance/payments', schoolOpsKeys.payments(schoolId!));
}
export function useFeeStructure(schoolId: string | null) {
  return useSchoolResource(schoolId, 'finance/fees', schoolOpsKeys.feeStructure(schoolId!));
}
export function useDiscounts(schoolId: string | null) {
  return useSchoolResource(schoolId, 'finance/discounts', schoolOpsKeys.discounts(schoolId!));
}
export function useOverdueAccounts(schoolId: string | null) {
  return useSchoolResource(schoolId, 'finance/overdue', schoolOpsKeys.overdueAccounts(schoolId!));
}
export function useGenerateInvoice(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'finance/invoices', [schoolOpsKeys.invoices(schoolId!)]);
}
export function useRecordPayment(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'finance/payments', [
    schoolOpsKeys.payments(schoolId!),
    schoolOpsKeys.invoices(schoolId!),
    schoolOpsKeys.overdueAccounts(schoolId!),
  ]);
}

// ═══════════════════ TRANSPORT HOOKS ═══════════════════

export function useRoutes(schoolId: string | null) {
  return useSchoolResource(schoolId, 'transport/routes', schoolOpsKeys.routes(schoolId!));
}
export function useVehicles(schoolId: string | null) {
  return useSchoolResource(schoolId, 'transport/vehicles', schoolOpsKeys.vehicles(schoolId!));
}
export function useRouteAssignments(schoolId: string | null) {
  return useSchoolResource(schoolId, 'transport/assignments', schoolOpsKeys.routeAssignments(schoolId!));
}
export function useTransportIncidents(schoolId: string | null) {
  return useSchoolResource(schoolId, 'transport/incidents', schoolOpsKeys.transportIncidents(schoolId!));
}
export function useCreateRoute(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'transport/routes', [schoolOpsKeys.routes(schoolId!)]);
}
export function useReportIncident(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'transport/incidents', [schoolOpsKeys.transportIncidents(schoolId!)]);
}

// ═══════════════════ FACILITIES HOOKS ═══════════════════

export function useRooms(schoolId: string | null) {
  return useSchoolResource(schoolId, 'facilities/rooms', schoolOpsKeys.rooms(schoolId!));
}
export function useOpsMaintenanceRequests(schoolId: string | null) {
  return useSchoolResource(schoolId, 'facilities/maintenance', schoolOpsKeys.maintenance(schoolId!));
}
export function useAssets(schoolId: string | null) {
  return useSchoolResource(schoolId, 'facilities/assets', schoolOpsKeys.assets(schoolId!));
}
export function useOpsFacilityBookings(schoolId: string | null) {
  return useSchoolResource(schoolId, 'facilities/bookings', schoolOpsKeys.facilityBookings(schoolId!));
}
export function useOpsCreateMaintenanceRequest(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'facilities/maintenance', [schoolOpsKeys.maintenance(schoolId!)]);
}
export function useBookFacility(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'facilities/bookings', [schoolOpsKeys.facilityBookings(schoolId!)]);
}

// ═══════════════════ COMMUNICATION HOOKS ═══════════════════

export function useMessages(schoolId: string | null) {
  return useSchoolResource(schoolId, 'communication/messages', schoolOpsKeys.messages(schoolId!));
}
export function useOpsAnnouncements(schoolId: string | null) {
  return useSchoolResource(schoolId, 'communication/announcements', schoolOpsKeys.announcements(schoolId!));
}
export function useBroadcasts(schoolId: string | null) {
  return useSchoolResource(schoolId, 'communication/broadcasts', schoolOpsKeys.broadcasts(schoolId!));
}
export function useTemplates(schoolId: string | null) {
  return useSchoolResource(schoolId, 'communication/templates', schoolOpsKeys.templates(schoolId!));
}
export function useCommLogs(schoolId: string | null) {
  return useSchoolResource(schoolId, 'communication/logs', schoolOpsKeys.commLogs(schoolId!));
}
export function useOpsCreateAnnouncement(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'communication/announcements', [schoolOpsKeys.announcements(schoolId!)]);
}
export function useSendBroadcast(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'communication/broadcasts', [schoolOpsKeys.broadcasts(schoolId!)]);
}
export function useOpsDeleteAnnouncement(schoolId: string | null) {
  return useSchoolMutationDelete(schoolId, 'communication/announcements', [schoolOpsKeys.announcements(schoolId!)]);
}

// ═══════════════════ SETTINGS HOOKS ═══════════════════

export function useSchoolProfile(schoolId: string | null) {
  return useSchoolResource(schoolId, 'settings/profile', schoolOpsKeys.schoolProfile(schoolId!));
}
export function useAcademicConfig(schoolId: string | null) {
  return useSchoolResource(schoolId, 'settings/academic', schoolOpsKeys.academicConfig(schoolId!));
}
export function useGradingScales(schoolId: string | null) {
  return useSchoolResource(schoolId, 'settings/grading', schoolOpsKeys.gradingScales(schoolId!));
}
export function useFeeConfig(schoolId: string | null) {
  return useSchoolResource(schoolId, 'settings/fees', schoolOpsKeys.feeConfig(schoolId!));
}
export function useRoles(schoolId: string | null) {
  return useSchoolResource(schoolId, 'settings/roles', schoolOpsKeys.roles(schoolId!));
}
export function useSaveSchoolProfile(schoolId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.patch<ApiSuccessResponse<unknown>>(`/admin/schools/${schoolId}/settings/profile`, payload).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: schoolOpsKeys.schoolProfile(schoolId!) }); },
  });
}
export function useSaveFeeConfig(schoolId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.patch<ApiSuccessResponse<unknown>>(`/admin/schools/${schoolId}/settings/fees`, payload).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: schoolOpsKeys.feeConfig(schoolId!) }); },
  });
}

// ═══════════════════ AUDIT HOOKS ═══════════════════

export function useOpsAuditLog(schoolId: string | null) {
  return useSchoolResource(schoolId, 'audit/log', schoolOpsKeys.auditLog(schoolId!));
}
export function useApprovalHistory(schoolId: string | null) {
  return useSchoolResource(schoolId, 'audit/approvals', schoolOpsKeys.approvalHistory(schoolId!));
}
export function useComplianceTasks(schoolId: string | null) {
  return useSchoolResource(schoolId, 'audit/compliance', schoolOpsKeys.complianceTasks(schoolId!));
}

// ═══════════════════ LEAVE REQUESTS ═══════════════════

export function useLeaveRequests(schoolId: string | null) {
  return useSchoolResource(schoolId, 'staff/leave', schoolOpsKeys.leaveRequests(schoolId!));
}
export function useApproveLeave(schoolId: string | null) {
  return useSchoolMutationPatch<{ id: string; status: string }>(schoolId, 'staff/leave', [schoolOpsKeys.leaveRequests(schoolId!)]);
}
export function useSubmitLeave(schoolId: string | null) {
  return useSchoolMutationPost(schoolId, 'staff/leave', [schoolOpsKeys.leaveRequests(schoolId!)]);
}

// ═══════════════════ REPORTS ═══════════════════

export function useReport(schoolId: string | null, type: string) {
  return useSchoolResource(schoolId, `reports/${type}`, schoolOpsKeys.report(schoolId!, type));
}
