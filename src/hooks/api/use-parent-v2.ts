import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  parentV2Api,
  type ParentAttendanceExplanationInput,
  type ParentFeedbackCreateInput,
  type ParentListParams,
  type ParentMessageThreadCreateInput,
  type ParentProfileUpdateInput,
  type ParentSupportTicketCreateInput,
  type ParentWorkspaceItemInput,
} from '@/api/parent-v2';

export type { ParentListParams } from '@/api/parent-v2';

export const parentV2Keys = {
  home: (params?: ParentListParams) => ['parent-v2', 'home', params] as const,
  children: (params?: ParentListParams) => ['parent-v2', 'children', params] as const,
  childDetail: (childId: string) => ['parent-v2', 'child-detail', childId] as const,
  timetable: (params?: ParentListParams) => ['parent-v2', 'timetable', params] as const,
  assignments: (params?: ParentListParams) => ['parent-v2', 'assignments', params] as const,
  exams: (params?: ParentListParams) => ['parent-v2', 'exams', params] as const,
  grades: (params?: ParentListParams) => ['parent-v2', 'grades', params] as const,
  attendance: (params?: ParentListParams) => ['parent-v2', 'attendance', params] as const,
  messages: (params?: ParentListParams) => ['parent-v2', 'messages', params] as const,
  recipients: () => ['parent-v2', 'message-recipients'] as const,
  messageThread: (threadId: string) => ['parent-v2', 'message-thread', threadId] as const,
  announcements: (params?: ParentListParams) => ['parent-v2', 'announcements', params] as const,
  invoices: (params?: ParentListParams) => ['parent-v2', 'invoices', params] as const,
  invoiceDetail: (invoiceId: string) => ['parent-v2', 'invoice-detail', invoiceId] as const,
  payments: (params?: ParentListParams) => ['parent-v2', 'payments', params] as const,
  receipts: (params?: ParentListParams) => ['parent-v2', 'receipts', params] as const,
  approvals: (params?: ParentListParams) => ['parent-v2', 'approvals', params] as const,
  transport: (params?: ParentListParams) => ['parent-v2', 'transport', params] as const,
  documents: (params?: ParentListParams) => ['parent-v2', 'documents', params] as const,
  document: (documentId: string) => ['parent-v2', 'document', documentId] as const,
  events: (params?: ParentListParams) => ['parent-v2', 'events', params] as const,
  profile: () => ['parent-v2', 'profile'] as const,
  digest: () => ['parent-v2', 'digest'] as const,
  feedback: () => ['parent-v2', 'feedback'] as const,
  volunteer: () => ['parent-v2', 'volunteer'] as const,
  cafeteriaMenu: () => ['parent-v2', 'cafeteria-menu'] as const,
  cafeteriaAccount: (childId: string) => ['parent-v2', 'cafeteria-account', childId] as const,
  supportTickets: (params?: ParentListParams) => ['parent-v2', 'support-tickets', params] as const,
  supportTicket: (ticketId: string) => ['parent-v2', 'support-ticket', ticketId] as const,
  search: (query: string, childId?: string | null) => ['parent-v2', 'search', query, childId] as const,
  pins: () => ['parent-v2', 'pins'] as const,
  recent: () => ['parent-v2', 'recent'] as const,
  notifications: (params?: ParentListParams) => ['parent-v2', 'notifications', params] as const,
};

export function useParentV2Home(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.home(params),
    queryFn: () => parentV2Api.getHome(params),
  });
}

export function useParentV2Children(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.children(params),
    queryFn: () => parentV2Api.getChildren(params),
  });
}

export function useParentV2ChildDetail(childId: string | null) {
  return useQuery({
    queryKey: childId ? parentV2Keys.childDetail(childId) : ['parent-v2', 'child-detail', 'none'],
    queryFn: () => parentV2Api.getChildDetail(childId!),
    enabled: Boolean(childId),
  });
}

export function useParentV2Timetable(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.timetable(params),
    queryFn: () => parentV2Api.getTimetable(params),
  });
}

export function useParentV2Assignments(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.assignments(params),
    queryFn: () => parentV2Api.getAssignments(params),
  });
}

export function useParentV2Exams(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.exams(params),
    queryFn: () => parentV2Api.getExams(params),
  });
}

export function useParentV2Grades(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.grades(params),
    queryFn: () => parentV2Api.getGrades(params),
  });
}

export function useParentV2Attendance(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.attendance(params),
    queryFn: () => parentV2Api.getAttendance(params),
  });
}

export function useParentV2MessageThreads(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.messages(params),
    queryFn: () => parentV2Api.getMessageThreads(params),
  });
}

export function useParentV2MessageRecipients() {
  return useQuery({
    queryKey: parentV2Keys.recipients(),
    queryFn: () => parentV2Api.getMessageRecipients(),
  });
}

export function useParentV2MessageThread(threadId: string | null) {
  return useQuery({
    queryKey: threadId ? parentV2Keys.messageThread(threadId) : ['parent-v2', 'message-thread', 'none'],
    queryFn: () => parentV2Api.getMessageThread(threadId!),
    enabled: Boolean(threadId),
  });
}

export function useParentV2Announcements(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.announcements(params),
    queryFn: () => parentV2Api.getAnnouncements(params),
  });
}

export function useParentV2Invoices(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.invoices(params),
    queryFn: () => parentV2Api.getInvoices(params),
  });
}

export function useParentV2InvoiceDetail(invoiceId: string | null) {
  return useQuery({
    queryKey: invoiceId ? parentV2Keys.invoiceDetail(invoiceId) : ['parent-v2', 'invoice-detail', 'none'],
    queryFn: () => parentV2Api.getInvoiceDetail(invoiceId!),
    enabled: Boolean(invoiceId),
  });
}

export function useParentV2Payments(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.payments(params),
    queryFn: () => parentV2Api.getPayments(params),
  });
}

export function useParentV2Receipts(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.receipts(params),
    queryFn: () => parentV2Api.getReceipts(params),
  });
}

export function useParentV2Approvals(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.approvals(params),
    queryFn: () => parentV2Api.getApprovals(params),
  });
}

export function useParentV2Transport(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.transport(params),
    queryFn: () => parentV2Api.getTransport(params),
  });
}

export function useParentV2Documents(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.documents(params),
    queryFn: () => parentV2Api.getDocuments(params),
  });
}

export function useParentV2Document(documentId: string | null) {
  return useQuery({
    queryKey: documentId ? parentV2Keys.document(documentId) : ['parent-v2', 'document', 'none'],
    queryFn: () => parentV2Api.getDocument(documentId!),
    enabled: Boolean(documentId),
  });
}

export function useParentV2Events(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.events(params),
    queryFn: () => parentV2Api.getEvents(params),
  });
}

export function useParentV2Profile() {
  return useQuery({
    queryKey: parentV2Keys.profile(),
    queryFn: () => parentV2Api.getProfile(),
  });
}

export function useParentV2DigestConfig() {
  return useQuery({
    queryKey: parentV2Keys.digest(),
    queryFn: () => parentV2Api.getDigest(),
  });
}

export function useParentV2Feedback() {
  return useQuery({
    queryKey: parentV2Keys.feedback(),
    queryFn: () => parentV2Api.getFeedback(),
  });
}

export function useParentV2VolunteerOpportunities() {
  return useQuery({
    queryKey: parentV2Keys.volunteer(),
    queryFn: () => parentV2Api.getVolunteerOpportunities(),
  });
}

export function useParentV2CafeteriaMenu() {
  return useQuery({
    queryKey: parentV2Keys.cafeteriaMenu(),
    queryFn: () => parentV2Api.getCafeteriaMenu(),
  });
}

export function useParentV2CafeteriaAccount(childId: string | null) {
  return useQuery({
    queryKey: childId ? parentV2Keys.cafeteriaAccount(childId) : ['parent-v2', 'cafeteria-account', 'none'],
    queryFn: () => parentV2Api.getCafeteriaAccount(childId!),
    enabled: Boolean(childId),
  });
}

export function useParentV2SupportTickets(params?: ParentListParams) {
  return useQuery({
    queryKey: parentV2Keys.supportTickets(params),
    queryFn: () => parentV2Api.getSupportTickets(params),
  });
}

export function useParentV2SupportTicket(ticketId: string | null) {
  return useQuery({
    queryKey: ticketId ? parentV2Keys.supportTicket(ticketId) : ['parent-v2', 'support-ticket', 'none'],
    queryFn: () => parentV2Api.getSupportTicket(ticketId!),
    enabled: Boolean(ticketId),
  });
}

export function useParentV2Search(query: string, childId?: string | null, enabled = true) {
  return useQuery({
    queryKey: parentV2Keys.search(query, childId),
    queryFn: () => parentV2Api.getSearch(query, childId),
    enabled: enabled && query.trim().length > 1,
  });
}

export function useParentV2PinnedItems(enabled = true) {
  return useQuery({
    queryKey: parentV2Keys.pins(),
    queryFn: () => parentV2Api.getPinnedItems(),
    enabled,
  });
}

export function useParentV2RecentItems(enabled = true) {
  return useQuery({
    queryKey: parentV2Keys.recent(),
    queryFn: () => parentV2Api.getRecentItems(),
    enabled,
  });
}

export function useParentV2Notifications(params?: ParentListParams, enabled = true) {
  return useQuery({
    queryKey: parentV2Keys.notifications(params),
    queryFn: () => parentV2Api.getNotifications(params),
    enabled,
  });
}

function invalidateParentData(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['parent-v2', 'home'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'messages'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'message-thread'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'support-ticket'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'support-tickets'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'attendance'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'approvals'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'announcements'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'invoices'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'invoice-detail'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'events'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'documents'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'notifications'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'pins'] });
  qc.invalidateQueries({ queryKey: ['parent-v2', 'recent'] });
}

export function useMarkParentV2AnnouncementRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (announcementId: string) => parentV2Api.markAnnouncementRead(announcementId),
    onSuccess: () => invalidateParentData(qc),
  });
}

export function useSaveParentV2Announcement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (announcementId: string) => parentV2Api.saveAnnouncement(announcementId),
    onSuccess: () => invalidateParentData(qc),
  });
}

export function useSubmitParentV2AbsenceExplanation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParentAttendanceExplanationInput) => parentV2Api.submitAttendanceExplanation(payload),
    onSuccess: () => invalidateParentData(qc),
  });
}

export function useCreateParentV2MessageThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParentMessageThreadCreateInput) => parentV2Api.createMessageThread(payload),
    onSuccess: () => invalidateParentData(qc),
  });
}

export function usePostParentV2Message() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, body }: { threadId: string; body: string }) => parentV2Api.postMessage(threadId, body),
    onSuccess: () => invalidateParentData(qc),
  });
}

export function useDecideParentV2Approval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      approvalRequestId,
      decision,
      note,
    }: {
      approvalRequestId: string;
      decision: 'APPROVED' | 'REJECTED';
      note?: string;
    }) => parentV2Api.decideApproval(approvalRequestId, decision, note),
    onSuccess: () => invalidateParentData(qc),
  });
}

export function useCreateParentV2CheckoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => parentV2Api.createCheckoutSession(invoiceId),
    onSuccess: () => invalidateParentData(qc),
  });
}

export function useRsvpParentV2Event() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: 'GOING' | 'NOT_GOING' }) => parentV2Api.rsvpEvent(eventId, status),
    onSuccess: () => invalidateParentData(qc),
  });
}

export function useUpdateParentV2Profile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParentProfileUpdateInput) => parentV2Api.updateProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentV2Keys.profile() });
    },
  });
}

export function useUpdateParentV2DigestConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { frequency: string; preferences: Record<string, boolean> }) => parentV2Api.updateDigest(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentV2Keys.digest() });
    },
  });
}

export function useCreateParentV2SupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParentSupportTicketCreateInput) => parentV2Api.createSupportTicket(payload),
    onSuccess: () => invalidateParentData(qc),
  });
}

export function useReplyParentV2SupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) => parentV2Api.replySupportTicket(ticketId, message),
    onSuccess: () => invalidateParentData(qc),
  });
}

export function useCreateParentV2Feedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParentFeedbackCreateInput) => parentV2Api.createFeedback(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentV2Keys.feedback() });
    },
  });
}

export function useSignUpParentV2Volunteer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opportunityId: string) => parentV2Api.signUpVolunteer(opportunityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentV2Keys.volunteer() });
    },
  });
}

export function useUploadParentV2Document() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, file }: { documentId: string; file: File }) => parentV2Api.uploadDocument(documentId, file),
    onSuccess: () => invalidateParentData(qc),
  });
}

export function useMarkParentV2NotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => parentV2Api.markNotificationsRead(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-v2', 'notifications'] });
    },
  });
}

export function useMarkAllParentV2NotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => parentV2Api.markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-v2', 'notifications'] });
    },
  });
}

export function useDeleteParentV2Notification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => parentV2Api.deleteNotification(notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-v2', 'notifications'] });
    },
  });
}

export function useUpsertParentV2WorkspaceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ParentWorkspaceItemInput) => parentV2Api.upsertWorkspaceItem(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentV2Keys.pins() });
      qc.invalidateQueries({ queryKey: parentV2Keys.recent() });
    },
  });
}

export function useUpsertParentV2Pin() {
  return useUpsertParentV2WorkspaceItem();
}

export function useRemoveParentV2Pin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => parentV2Api.removeWorkspaceItem(itemId, 'PIN'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: parentV2Keys.pins() });
    },
  });
}
