import { api } from '@/api/client';
import type {
  ApiSuccessResponse,
  ParentAnnouncementDTO,
  ParentApprovalDTO,
  ParentAttendanceDTO,
  ParentCafeteriaAccountDTO,
  ParentCafeteriaMenuDTO,
  ParentChildDetailDTO,
  ParentChildSummaryDTO,
  ParentDailyDigestConfigDTO,
  ParentDocumentDTO,
  ParentEventDTO,
  ParentExamDTO,
  ParentFeedbackDTO,
  ParentHomeDTO,
  ParentInvoiceDetailDTO,
  ParentInvoiceSummaryDTO,
  ParentMessageRecipientDTO,
  ParentMessageThreadDetailDTO,
  ParentMessageThreadSummaryDTO,
  ParentPaymentDTO,
  ParentProfileDTO,
  ParentReceiptDTO,
  ParentScopeMode,
  ParentSupportTicketDetailDTO,
  ParentSupportTicketSummaryDTO,
  ParentTimetableItemDTO,
  ParentTransportDTO,
  ParentVolunteerOpportunityDTO,
  ParentWorkspaceItemDTO,
  ParentAssignmentDTO,
  ParentGradeDTO,
} from '@root/types';

export interface ParentListParams {
  childId?: string | null;
  scope?: ParentScopeMode;
  status?: string;
  category?: string;
  query?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ParentV2SearchResult {
  id: string;
  label: string;
  moduleId: string;
  type: string;
  childId: string | null;
  path?: string;
}

export interface ParentMessageThreadCreateInput {
  subject: string;
  body: string;
  recipientIds: string[];
}

export interface ParentProfileUpdateInput {
  email?: string;
  phone?: string;
  locale?: string;
  theme?: string;
  preferences?: Record<string, boolean>;
}

export interface ParentSupportTicketCreateInput {
  subject: string;
  description: string;
  category?: string;
  priority?: string;
  childId?: string | null;
}

export interface ParentFeedbackCreateInput {
  category: string;
  body: string;
}

export interface ParentAttendanceExplanationInput {
  attendanceId?: string;
  childId?: string;
  note: string;
}

export interface ParentWorkspaceItemInput {
  itemId: string;
  label: string;
  moduleId: string;
  childId?: string | null;
  kind?: 'PIN' | 'RECENT';
}

function buildQuery(params?: ParentListParams): string {
  if (!params) return '';
  const query = new URLSearchParams();

  if (params.childId) query.set('childId', params.childId);
  if (params.scope) query.set('scope', params.scope);
  if (params.status) query.set('status', params.status);
  if (params.category) query.set('category', params.category);
  if (params.query) query.set('query', params.query);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);
  if (typeof params.page === 'number') query.set('page', String(params.page));
  if (typeof params.pageSize === 'number') query.set('pageSize', String(params.pageSize));

  const encoded = query.toString();
  return encoded ? `?${encoded}` : '';
}

async function getJson<T>(path: string): Promise<T> {
  const response = await api.get<ApiSuccessResponse<T>>(path);
  return response.data;
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await api.post<ApiSuccessResponse<T>>(path, body);
  return response.data;
}

async function putJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await api.put<ApiSuccessResponse<T>>(path, body);
  return response.data;
}

async function deleteJson<T>(path: string): Promise<T> {
  const response = await api.del<ApiSuccessResponse<T>>(path);
  return response.data;
}

export const parentV2Api = {
  buildQuery,
  getHome: (params?: ParentListParams) => getJson<ParentHomeDTO>(`/parent/v2/home${buildQuery(params)}`),
  getChildren: (params?: ParentListParams) => getJson<ParentChildSummaryDTO[]>(`/parent/v2/children${buildQuery(params)}`),
  getChildDetail: (childId: string) => getJson<ParentChildDetailDTO>(`/parent/v2/children/${childId}`),
  getTimetable: (params?: ParentListParams) => getJson<ParentTimetableItemDTO[]>(`/parent/v2/timetable${buildQuery(params)}`),
  getAssignments: (params?: ParentListParams) => getJson<ParentAssignmentDTO[]>(`/parent/v2/assignments${buildQuery(params)}`),
  getExams: (params?: ParentListParams) => getJson<ParentExamDTO[]>(`/parent/v2/exams${buildQuery(params)}`),
  getGrades: (params?: ParentListParams) => getJson<ParentGradeDTO[]>(`/parent/v2/grades${buildQuery(params)}`),
  getAttendance: (params?: ParentListParams) => getJson<ParentAttendanceDTO[]>(`/parent/v2/attendance${buildQuery(params)}`),
  getMessageThreads: (params?: ParentListParams) => getJson<ParentMessageThreadSummaryDTO[]>(`/parent/v2/messages/threads${buildQuery(params)}`),
  getMessageRecipients: () => getJson<ParentMessageRecipientDTO[]>('/parent/v2/messages/recipients'),
  createMessageThread: (payload: ParentMessageThreadCreateInput) => postJson<{ id: string; subject: string; participantIds: string[] }>('/parent/v2/messages/threads', payload),
  getMessageThread: (threadId: string) => getJson<ParentMessageThreadDetailDTO>(`/parent/v2/messages/threads/${threadId}`),
  postMessage: (threadId: string, body: string) => postJson<{ id: string; body: string }>(`/parent/v2/messages/threads/${threadId}/messages`, { body }),
  getAnnouncements: (params?: ParentListParams) => getJson<ParentAnnouncementDTO[]>(`/parent/v2/announcements${buildQuery(params)}`),
  markAnnouncementRead: (announcementId: string) => postJson<{ id: string }>(`/parent/v2/announcements/${announcementId}/read`),
  saveAnnouncement: (announcementId: string) => postJson<{ id: string }>(`/parent/v2/announcements/${announcementId}/save`),
  getInvoices: (params?: ParentListParams) => getJson<ParentInvoiceSummaryDTO[]>(`/parent/v2/fees/invoices${buildQuery(params)}`),
  getInvoiceDetail: (invoiceId: string) => getJson<ParentInvoiceDetailDTO>(`/parent/v2/fees/invoices/${invoiceId}`),
  createCheckoutSession: (invoiceId: string) => postJson<{ url: string; sessionId: string }>(`/parent/v2/fees/invoices/${invoiceId}/checkout-session`),
  getPayments: (params?: ParentListParams) => getJson<ParentPaymentDTO[]>(`/parent/v2/fees/payments${buildQuery(params)}`),
  getReceipts: (params?: ParentListParams) => getJson<ParentReceiptDTO[]>(`/parent/v2/fees/receipts${buildQuery(params)}`),
  getApprovals: (params?: ParentListParams) => getJson<ParentApprovalDTO[]>(`/parent/v2/approvals${buildQuery(params)}`),
  decideApproval: (approvalRequestId: string, decision: 'APPROVED' | 'REJECTED', note?: string) =>
    postJson<{ id: string }>(`/parent/v2/approvals/${approvalRequestId}/decision`, { decision, note }),
  getTransport: (params?: ParentListParams) => getJson<ParentTransportDTO[]>(`/parent/v2/transport${buildQuery(params)}`),
  getDocuments: (params?: ParentListParams) => getJson<ParentDocumentDTO[]>(`/parent/v2/documents${buildQuery(params)}`),
  getDocument: (documentId: string) => getJson<ParentDocumentDTO>(`/parent/v2/documents/${documentId}`),
  uploadDocument: async (documentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiSuccessResponse<ParentDocumentDTO>>(
      `/parent/v2/documents/${documentId}/upload`,
      formData,
      true,
    );
    return response.data;
  },
  getEvents: (params?: ParentListParams) => getJson<ParentEventDTO[]>(`/parent/v2/events${buildQuery(params)}`),
  rsvpEvent: (eventId: string, status: 'GOING' | 'NOT_GOING') => postJson<{ id: string }>(`/parent/v2/events/${eventId}/rsvp`, { status }),
  getProfile: () => getJson<ParentProfileDTO>('/parent/v2/profile'),
  updateProfile: (payload: ParentProfileUpdateInput) => putJson<ParentProfileDTO>('/parent/v2/profile/preferences', payload),
  getDigest: () => getJson<ParentDailyDigestConfigDTO>('/parent/v2/digest'),
  updateDigest: (payload: ParentDailyDigestConfigDTO | { frequency: string; preferences: Record<string, boolean> }) =>
    putJson<ParentDailyDigestConfigDTO>('/parent/v2/digest', payload),
  getFeedback: () => getJson<ParentFeedbackDTO[]>('/parent/v2/feedback'),
  createFeedback: (payload: ParentFeedbackCreateInput) => postJson<ParentFeedbackDTO>('/parent/v2/feedback', payload),
  getVolunteerOpportunities: () => getJson<ParentVolunteerOpportunityDTO[]>('/parent/v2/volunteer'),
  signUpVolunteer: (opportunityId: string) => postJson<{ id: string }>(`/parent/v2/volunteer/${opportunityId}/signup`),
  getCafeteriaMenu: () => getJson<ParentCafeteriaMenuDTO[]>('/parent/v2/cafeteria/menu'),
  getCafeteriaAccount: (childId: string) => getJson<ParentCafeteriaAccountDTO>(`/parent/v2/cafeteria/account/${childId}`),
  getSupportTickets: (params?: ParentListParams) => getJson<ParentSupportTicketSummaryDTO[]>(`/parent/v2/support/tickets${buildQuery(params)}`),
  getSupportTicket: (ticketId: string) => getJson<ParentSupportTicketDetailDTO>(`/parent/v2/support/tickets/${ticketId}`),
  createSupportTicket: (payload: ParentSupportTicketCreateInput) => postJson<ParentSupportTicketSummaryDTO>('/parent/v2/support/tickets', payload),
  replySupportTicket: (ticketId: string, message: string) => postJson<{ id: string }>(`/parent/v2/support/tickets/${ticketId}/replies`, { message }),
  getSearch: (query: string, childId?: string | null) => getJson<ParentV2SearchResult[]>(`/parent/v2/search${buildQuery({ query, childId })}`),
  getPinnedItems: () => getJson<ParentWorkspaceItemDTO[]>('/parent/v2/productivity/pins'),
  getRecentItems: () => getJson<ParentWorkspaceItemDTO[]>('/parent/v2/productivity/recent'),
  upsertWorkspaceItem: (payload: ParentWorkspaceItemInput) => postJson<ParentWorkspaceItemDTO>('/parent/v2/productivity/items', payload),
  removeWorkspaceItem: (itemId: string, kind: 'PIN' | 'RECENT' = 'PIN') => deleteJson<{ itemId: string }>(`/parent/v2/productivity/pin/${itemId}?kind=${kind}`),
  getNotifications: (params?: ParentListParams) => getJson<Array<{
    id: string;
    userId: string;
    studentId: string | null;
    type: string;
    title: string;
    message: string;
    read: boolean;
    link?: string | null;
    createdAt: string;
  }>>(`/parent/v2/notifications${buildQuery(params)}`),
  markNotificationsRead: (ids: string[]) => postJson<{ ids: string[] }>('/parent/v2/notifications/read', { ids }),
  markAllNotificationsRead: () => postJson<{ userId: string }>('/parent/v2/notifications/read-all'),
  deleteNotification: (notificationId: string) => deleteJson<{ notificationId: string }>(`/parent/v2/notifications/${notificationId}`),
  submitAttendanceExplanation: (payload: ParentAttendanceExplanationInput) => {
    if (payload.attendanceId) {
      return postJson<{ attendanceId: string; childId: string; note: string }>(
        `/parent/v2/attendance/${payload.attendanceId}/explanation`,
        { note: payload.note },
      );
    }
    return postJson<{ attendanceId: string; childId: string; note: string }>(
      `/parent/v2/attendance/${payload.childId}/explain-absence`,
      { note: payload.note },
    );
  },
};
