import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type {
  ApiSuccessResponse,
  TeacherProfileDTO,
  TeacherScheduleItem,
  TeacherActionItem,
  TeacherStudentAlert,
  TeacherGradingQueueItem,
  TeacherClass,
  TeacherClassDetail,
  TeacherAttendanceStudent,
  TeacherAttendanceHistoryItem,
  TeacherLessonPlan,
  TeacherAssignment,
  TeacherGradebookData,
  TeacherCommentBankItem,
  TeacherExam,
  TeacherMessageThread,
  TeacherAnnouncement,
  TeacherBehaviorNote,
  TeacherMeeting,
  TeacherClassPerformance,
  // Messaging settings types
  TeacherMsgDefaults,
  TeacherMsgReplySettings,
  TeacherMsgScheduling,
  TeacherMsgNotifChannels,
  TeacherMsgNotifRule,
  TeacherMsgQuietHours,
  TeacherSLAPolicy,
  TeacherSLAEscalationRule,
  TeacherLegalTemplate,
  TeacherLegalCategory,
  TeacherEmailTemplate,
  TeacherEmailVariable,
  TeacherMsgAppearanceTheme,
  TeacherMsgAppearanceLayout,
  TeacherMsgSignature,
} from '@root/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const teacherKeys = {
  // Profile
  profile: ['teacher', 'profile'] as const,
  // Command center
  schedule: ['teacher', 'schedule'] as const,
  actionItems: ['teacher', 'action-items'] as const,
  studentAlerts: ['teacher', 'student-alerts'] as const,
  gradingQueue: ['teacher', 'grading-queue'] as const,
  // Classes
  classes: ['teacher', 'classes'] as const,
  classDetail: (classId: string) => ['teacher', 'class-detail', classId] as const,
  // Attendance
  attendance: (classId: string) => ['teacher', 'attendance', classId] as const,
  attendanceHistory: ['teacher', 'attendance-history'] as const,
  // Lessons
  lessonPlans: ['teacher', 'lesson-plans'] as const,
  // Assignments
  assignments: ['teacher', 'assignments'] as const,
  submissions: (assignmentId: string) => ['teacher', 'submissions', assignmentId] as const,
  // Gradebook
  gradebook: (classId: string) => ['teacher', 'gradebook', classId] as const,
  commentBank: ['teacher', 'comment-bank'] as const,
  // Exams
  exams: ['teacher', 'exams'] as const,
  // Messages
  messages: ['teacher', 'messages'] as const,
  threadMessages: (threadId: string) => ['teacher', 'thread-messages', threadId] as const,
  // Announcements
  announcements: ['teacher', 'announcements'] as const,
  // Behavior
  behaviorNotes: ['teacher', 'behavior-notes'] as const,
  // Meetings
  meetings: ['teacher', 'meetings'] as const,
  // Reports
  classPerformance: ['teacher', 'class-performance'] as const,
  // Messaging settings
  msgDefaults: ['teacher', 'msg-defaults'] as const,
  msgReplySettings: ['teacher', 'msg-reply-settings'] as const,
  msgScheduling: ['teacher', 'msg-scheduling'] as const,
  msgNotifChannels: ['teacher', 'msg-notif-channels'] as const,
  msgNotifRules: ['teacher', 'msg-notif-rules'] as const,
  msgQuietHours: ['teacher', 'msg-quiet-hours'] as const,
  slaPolicies: ['teacher', 'sla-policies'] as const,
  slaEscalationRules: ['teacher', 'sla-escalation-rules'] as const,
  legalTemplates: ['teacher', 'legal-templates'] as const,
  legalCategories: ['teacher', 'legal-categories'] as const,
  emailTemplates: ['teacher', 'email-templates'] as const,
  emailVariables: ['teacher', 'email-variables'] as const,
  msgAppearanceTheme: ['teacher', 'msg-appearance-theme'] as const,
  msgAppearanceLayout: ['teacher', 'msg-appearance-layout'] as const,
  msgSignature: ['teacher', 'msg-signature'] as const,
};

// ---------------------------------------------------------------------------
// QUERY HOOKS
// ---------------------------------------------------------------------------

export function useTeacherProfile() {
  return useQuery({
    queryKey: teacherKeys.profile,
    queryFn: () => api.get<ApiSuccessResponse<TeacherProfileDTO>>('/teacher/profile').then((r) => r.data),
  });
}

export function useTeacherSchedule() {
  return useQuery({
    queryKey: teacherKeys.schedule,
    queryFn: () => api.get<ApiSuccessResponse<TeacherScheduleItem[]>>('/teacher/schedule').then((r) => r.data),
  });
}

export function useTeacherActionItems() {
  return useQuery({
    queryKey: teacherKeys.actionItems,
    queryFn: () => api.get<ApiSuccessResponse<TeacherActionItem[]>>('/teacher/action-items').then((r) => r.data),
  });
}

export function useTeacherStudentAlerts() {
  return useQuery({
    queryKey: teacherKeys.studentAlerts,
    queryFn: () => api.get<ApiSuccessResponse<TeacherStudentAlert[]>>('/teacher/student-alerts').then((r) => r.data),
  });
}

export function useTeacherGradingQueue() {
  return useQuery({
    queryKey: teacherKeys.gradingQueue,
    queryFn: () => api.get<ApiSuccessResponse<TeacherGradingQueueItem[]>>('/teacher/grading-queue').then((r) => r.data),
  });
}

export function useTeacherClasses() {
  return useQuery({
    queryKey: teacherKeys.classes,
    queryFn: () => api.get<ApiSuccessResponse<TeacherClass[]>>('/teacher/classes').then((r) => r.data),
  });
}

export function useTeacherClassDetail(classId: string | null) {
  return useQuery({
    queryKey: teacherKeys.classDetail(classId ?? ''),
    queryFn: () => api.get<ApiSuccessResponse<TeacherClassDetail>>(`/teacher/classes/${classId}`).then((r) => r.data),
    enabled: !!classId,
  });
}

export function useTeacherAttendance(classId: string | null) {
  return useQuery({
    queryKey: teacherKeys.attendance(classId ?? ''),
    queryFn: () => api.get<ApiSuccessResponse<TeacherAttendanceStudent[]>>(`/teacher/attendance/${classId}`).then((r) => r.data),
    enabled: !!classId,
  });
}

export function useTeacherAttendanceHistory() {
  return useQuery({
    queryKey: teacherKeys.attendanceHistory,
    queryFn: () => api.get<ApiSuccessResponse<TeacherAttendanceHistoryItem[]>>('/teacher/attendance-history').then((r) => r.data),
  });
}

export function useTeacherLessonPlans() {
  return useQuery({
    queryKey: teacherKeys.lessonPlans,
    queryFn: () => api.get<ApiSuccessResponse<TeacherLessonPlan[]>>('/teacher/lesson-plans').then((r) => r.data),
  });
}

export function useTeacherAssignments() {
  return useQuery({
    queryKey: teacherKeys.assignments,
    queryFn: () => api.get<ApiSuccessResponse<TeacherAssignment[]>>('/teacher/assignments').then((r) => r.data),
  });
}

export function useTeacherSubmissions(assignmentId: string | null) {
  return useQuery({
    queryKey: teacherKeys.submissions(assignmentId ?? ''),
    queryFn: () => api.get<ApiSuccessResponse<Array<{ studentId: string; studentName: string; submittedAt: string; score: number | null; feedback: string | null }>>>(`/teacher/assignments/${assignmentId}/submissions`).then((r) => r.data),
    enabled: !!assignmentId,
  });
}

export function useTeacherGradebook(classId: string | null) {
  return useQuery({
    queryKey: teacherKeys.gradebook(classId ?? ''),
    queryFn: () => api.get<ApiSuccessResponse<TeacherGradebookData>>(`/teacher/gradebook/${classId}`).then((r) => r.data),
    enabled: !!classId,
  });
}

export function useTeacherCommentBank() {
  return useQuery({
    queryKey: teacherKeys.commentBank,
    queryFn: () => api.get<ApiSuccessResponse<TeacherCommentBankItem[]>>('/teacher/comment-bank').then((r) => r.data),
  });
}

export function useTeacherExams() {
  return useQuery({
    queryKey: teacherKeys.exams,
    queryFn: () => api.get<ApiSuccessResponse<TeacherExam[]>>('/teacher/exams').then((r) => r.data),
  });
}

export function useTeacherMessages() {
  return useQuery({
    queryKey: teacherKeys.messages,
    queryFn: () => api.get<ApiSuccessResponse<TeacherMessageThread[]>>('/teacher/messages').then((r) => r.data),
  });
}

export function useTeacherThreadMessages(threadId: string | null) {
  return useQuery({
    queryKey: teacherKeys.threadMessages(threadId ?? ''),
    queryFn: () => api.get<ApiSuccessResponse<{ threadId: string; subject: string; messages: Array<{ id: string; sender: string; body: string; time: string }> }>>(`/teacher/messages/${threadId}`).then((r) => r.data),
    enabled: !!threadId,
  });
}

export function useTeacherAnnouncements() {
  return useQuery({
    queryKey: teacherKeys.announcements,
    queryFn: () => api.get<ApiSuccessResponse<TeacherAnnouncement[]>>('/teacher/announcements').then((r) => r.data),
  });
}

export function useTeacherBehaviorNotes() {
  return useQuery({
    queryKey: teacherKeys.behaviorNotes,
    queryFn: () => api.get<ApiSuccessResponse<TeacherBehaviorNote[]>>('/teacher/behavior-notes').then((r) => r.data),
  });
}

export function useTeacherMeetings() {
  return useQuery({
    queryKey: teacherKeys.meetings,
    queryFn: () => api.get<ApiSuccessResponse<TeacherMeeting[]>>('/teacher/meetings').then((r) => r.data),
  });
}

export function useTeacherClassPerformance() {
  return useQuery({
    queryKey: teacherKeys.classPerformance,
    queryFn: () => api.get<ApiSuccessResponse<TeacherClassPerformance[]>>('/teacher/class-performance').then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// MUTATION HOOKS
// ---------------------------------------------------------------------------

export function useUpdateTeacherProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TeacherProfileDTO>) =>
      api.patch<ApiSuccessResponse<TeacherProfileDTO>>('/teacher/profile', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.profile }); },
  });
}

export function useChangeTeacherPassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post<ApiSuccessResponse<{ message: string }>>('/teacher/change-password', data).then((r) => r.data),
  });
}

export function useUpdateTeacherAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) =>
      api.post<ApiSuccessResponse<{ avatarUrl: string }>>('/teacher/avatar', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.profile }); },
  });
}

export function useSubmitAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { classId: string; date: string; records: Array<{ studentId: string; status: string }> }) =>
      api.post<ApiSuccessResponse<{ id: string }>>('/teacher/attendance', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.attendanceHistory }); },
  });
}

export function useCreateLessonPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; classId: string; objectives: string; resources: string; duration: string; status?: string }) =>
      api.post<ApiSuccessResponse<TeacherLessonPlan>>('/teacher/lesson-plans', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.lessonPlans }); },
  });
}

export function useDeleteLessonPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<ApiSuccessResponse<TeacherLessonPlan>>(`/teacher/lesson-plans/${id}`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.lessonPlans }); },
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; classId: string; type: string; dueDate: string; totalPoints: number; instructions: string; status?: string }) =>
      api.post<ApiSuccessResponse<TeacherAssignment>>('/teacher/assignments', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.assignments }); },
  });
}

export function useGradeSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { assignmentId: string; studentId: string; score: number; feedback?: string }) =>
      api.post<ApiSuccessResponse<{ message: string }>>('/teacher/assignments/grade', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.assignments }); },
  });
}

export function useSaveGrades() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { classId: string; grades: Array<{ studentId: string; assignmentId: string; score: number }> }) =>
      api.post<ApiSuccessResponse<{ message: string }>>('/teacher/gradebook/save', data).then((r) => r.data),
    onSuccess: (_d, variables) => { qc.invalidateQueries({ queryKey: teacherKeys.gradebook(variables.classId) }); },
  });
}

export function useExportGrades() {
  return useMutation({
    mutationFn: (data: { classId: string; format?: string }) =>
      api.post<ApiSuccessResponse<{ url: string }>>('/teacher/gradebook/export', data).then((r) => r.data),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { category: string; text: string }) =>
      api.post<ApiSuccessResponse<TeacherCommentBankItem>>('/teacher/comment-bank', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.commentBank }); },
  });
}

export function useSaveExamMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { examId: string; marks: Array<{ studentId: string; score: number }> }) =>
      api.post<ApiSuccessResponse<{ message: string }>>('/teacher/exams/marks', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.exams }); },
  });
}

export function useSendTeacherMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { threadId: string; body: string }) =>
      api.post<ApiSuccessResponse<{ id: string }>>('/teacher/messages/reply', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.messages }); },
  });
}

export function useCreateTeacherThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { recipient: string; subject: string; body: string }) =>
      api.post<ApiSuccessResponse<TeacherMessageThread>>('/teacher/messages', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.messages }); },
  });
}

export function useCreateTeacherAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; body: string; priority: string; audiences: string[] }) =>
      api.post<ApiSuccessResponse<TeacherAnnouncement>>('/teacher/announcements', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.announcements }); },
  });
}

export function useSaveBehaviorNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { studentName: string; className: string; classId: string; type: string; note: string; followUp?: string }) =>
      api.post<ApiSuccessResponse<TeacherBehaviorNote>>('/teacher/behavior-notes', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.behaviorNotes }); },
  });
}

export function useScheduleMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; type: string; date: string; startTime: string; endTime: string; location: string; attendees: string; notes?: string }) =>
      api.post<ApiSuccessResponse<TeacherMeeting>>('/teacher/meetings', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.meetings }); },
  });
}

export function useCancelMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<ApiSuccessResponse<TeacherMeeting>>(`/teacher/meetings/${id}`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.meetings }); },
  });
}

export function useSubmitTeacherTicket() {
  return useMutation({
    mutationFn: (data: { subject: string; category: string; description: string; priority: string }) =>
      api.post<ApiSuccessResponse<{ id: string }>>('/teacher/support/ticket', data).then((r) => r.data),
  });
}

export function useSaveTeacherPreferences() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiSuccessResponse<{ message: string }>>('/teacher/preferences', data).then((r) => r.data),
  });
}

export function useUploadResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; category: string; type: string; url?: string }) =>
      api.post<ApiSuccessResponse<{ id: string; title: string }>>('/teacher/resources', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.lessonPlans }); },
  });
}

// ---------------------------------------------------------------------------
// MESSAGING SETTINGS — QUERY HOOKS
// ---------------------------------------------------------------------------

export function useTeacherMsgDefaults() {
  return useQuery({
    queryKey: teacherKeys.msgDefaults,
    queryFn: () => api.get<ApiSuccessResponse<TeacherMsgDefaults>>('/teacher/messages/settings/defaults').then((r) => r.data),
  });
}

export function useTeacherMsgReplySettings() {
  return useQuery({
    queryKey: teacherKeys.msgReplySettings,
    queryFn: () => api.get<ApiSuccessResponse<TeacherMsgReplySettings>>('/teacher/messages/settings/reply').then((r) => r.data),
  });
}

export function useTeacherMsgScheduling() {
  return useQuery({
    queryKey: teacherKeys.msgScheduling,
    queryFn: () => api.get<ApiSuccessResponse<TeacherMsgScheduling>>('/teacher/messages/settings/scheduling').then((r) => r.data),
  });
}

export function useTeacherMsgNotifChannels() {
  return useQuery({
    queryKey: teacherKeys.msgNotifChannels,
    queryFn: () => api.get<ApiSuccessResponse<TeacherMsgNotifChannels>>('/teacher/messages/settings/notif-channels').then((r) => r.data),
  });
}

export function useTeacherMsgNotifRules() {
  return useQuery({
    queryKey: teacherKeys.msgNotifRules,
    queryFn: () => api.get<ApiSuccessResponse<TeacherMsgNotifRule[]>>('/teacher/messages/settings/notif-rules').then((r) => r.data),
  });
}

export function useTeacherMsgQuietHours() {
  return useQuery({
    queryKey: teacherKeys.msgQuietHours,
    queryFn: () => api.get<ApiSuccessResponse<TeacherMsgQuietHours>>('/teacher/messages/settings/quiet-hours').then((r) => r.data),
  });
}

export function useTeacherSLAPolicies() {
  return useQuery({
    queryKey: teacherKeys.slaPolicies,
    queryFn: () => api.get<ApiSuccessResponse<TeacherSLAPolicy[]>>('/teacher/messages/sla-policies').then((r) => r.data),
  });
}

export function useTeacherSLAEscalationRules() {
  return useQuery({
    queryKey: teacherKeys.slaEscalationRules,
    queryFn: () => api.get<ApiSuccessResponse<TeacherSLAEscalationRule[]>>('/teacher/messages/sla-escalation').then((r) => r.data),
  });
}

export function useTeacherLegalTemplates() {
  return useQuery({
    queryKey: teacherKeys.legalTemplates,
    queryFn: () => api.get<ApiSuccessResponse<TeacherLegalTemplate[]>>('/teacher/messages/legal-templates').then((r) => r.data),
  });
}

export function useTeacherLegalCategories() {
  return useQuery({
    queryKey: teacherKeys.legalCategories,
    queryFn: () => api.get<ApiSuccessResponse<TeacherLegalCategory[]>>('/teacher/messages/legal-categories').then((r) => r.data),
  });
}

export function useTeacherEmailTemplates() {
  return useQuery({
    queryKey: teacherKeys.emailTemplates,
    queryFn: () => api.get<ApiSuccessResponse<TeacherEmailTemplate[]>>('/teacher/messages/email-templates').then((r) => r.data),
  });
}

export function useTeacherEmailVariables() {
  return useQuery({
    queryKey: teacherKeys.emailVariables,
    queryFn: () => api.get<ApiSuccessResponse<TeacherEmailVariable[]>>('/teacher/messages/email-variables').then((r) => r.data),
  });
}

export function useTeacherMsgAppearanceTheme() {
  return useQuery({
    queryKey: teacherKeys.msgAppearanceTheme,
    queryFn: () => api.get<ApiSuccessResponse<TeacherMsgAppearanceTheme>>('/teacher/messages/appearance/theme').then((r) => r.data),
  });
}

export function useTeacherMsgAppearanceLayout() {
  return useQuery({
    queryKey: teacherKeys.msgAppearanceLayout,
    queryFn: () => api.get<ApiSuccessResponse<TeacherMsgAppearanceLayout>>('/teacher/messages/appearance/layout').then((r) => r.data),
  });
}

export function useTeacherMsgSignature() {
  return useQuery({
    queryKey: teacherKeys.msgSignature,
    queryFn: () => api.get<ApiSuccessResponse<TeacherMsgSignature>>('/teacher/messages/appearance/signature').then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// MESSAGING SETTINGS — MUTATION HOOKS
// ---------------------------------------------------------------------------

export function useUpdateMsgDefaults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TeacherMsgDefaults>) =>
      api.patch<ApiSuccessResponse<TeacherMsgDefaults>>('/teacher/messages/settings/defaults', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.msgDefaults }); },
  });
}

export function useUpdateMsgReplySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TeacherMsgReplySettings>) =>
      api.patch<ApiSuccessResponse<TeacherMsgReplySettings>>('/teacher/messages/settings/reply', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.msgReplySettings }); },
  });
}

export function useUpdateMsgScheduling() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TeacherMsgScheduling>) =>
      api.patch<ApiSuccessResponse<TeacherMsgScheduling>>('/teacher/messages/settings/scheduling', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.msgScheduling }); },
  });
}

export function useUpdateMsgNotifChannels() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TeacherMsgNotifChannels>) =>
      api.patch<ApiSuccessResponse<TeacherMsgNotifChannels>>('/teacher/messages/settings/notif-channels', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.msgNotifChannels }); },
  });
}

export function useUpdateMsgNotifRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { rules: TeacherMsgNotifRule[] }) =>
      api.put<ApiSuccessResponse<TeacherMsgNotifRule[]>>('/teacher/messages/settings/notif-rules', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.msgNotifRules }); },
  });
}

export function useUpdateMsgQuietHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TeacherMsgQuietHours>) =>
      api.patch<ApiSuccessResponse<TeacherMsgQuietHours>>('/teacher/messages/settings/quiet-hours', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.msgQuietHours }); },
  });
}

export function useCreateSLAPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<TeacherSLAPolicy, 'id' | 'createdAt'>) =>
      api.post<ApiSuccessResponse<TeacherSLAPolicy>>('/teacher/messages/sla-policies', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.slaPolicies }); },
  });
}

export function useUpdateSLAPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<TeacherSLAPolicy> & { id: string }) =>
      api.patch<ApiSuccessResponse<TeacherSLAPolicy>>(`/teacher/messages/sla-policies/${id}`, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.slaPolicies }); },
  });
}

export function useDeleteSLAPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<ApiSuccessResponse<TeacherSLAPolicy>>(`/teacher/messages/sla-policies/${id}`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.slaPolicies }); },
  });
}

export function useCreateSLAEscalationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<TeacherSLAEscalationRule, 'id'>) =>
      api.post<ApiSuccessResponse<TeacherSLAEscalationRule>>('/teacher/messages/sla-escalation', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.slaEscalationRules }); },
  });
}

export function useDeleteSLAEscalationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<ApiSuccessResponse<TeacherSLAEscalationRule>>(`/teacher/messages/sla-escalation/${id}`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.slaEscalationRules }); },
  });
}

export function useCreateLegalTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<TeacherLegalTemplate, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<ApiSuccessResponse<TeacherLegalTemplate>>('/teacher/messages/legal-templates', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.legalTemplates }); },
  });
}

export function useUpdateLegalTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<TeacherLegalTemplate> & { id: string }) =>
      api.patch<ApiSuccessResponse<TeacherLegalTemplate>>(`/teacher/messages/legal-templates/${id}`, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.legalTemplates }); },
  });
}

export function useDeleteLegalTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<ApiSuccessResponse<TeacherLegalTemplate>>(`/teacher/messages/legal-templates/${id}`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.legalTemplates }); },
  });
}

export function useCreateEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<TeacherEmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post<ApiSuccessResponse<TeacherEmailTemplate>>('/teacher/messages/email-templates', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.emailTemplates }); },
  });
}

export function useUpdateEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<TeacherEmailTemplate> & { id: string }) =>
      api.patch<ApiSuccessResponse<TeacherEmailTemplate>>(`/teacher/messages/email-templates/${id}`, data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.emailTemplates }); },
  });
}

export function useDeleteEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<ApiSuccessResponse<TeacherEmailTemplate>>(`/teacher/messages/email-templates/${id}`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.emailTemplates }); },
  });
}

export function useUpdateMsgAppearanceTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TeacherMsgAppearanceTheme>) =>
      api.patch<ApiSuccessResponse<TeacherMsgAppearanceTheme>>('/teacher/messages/appearance/theme', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.msgAppearanceTheme }); },
  });
}

export function useUpdateMsgAppearanceLayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TeacherMsgAppearanceLayout>) =>
      api.patch<ApiSuccessResponse<TeacherMsgAppearanceLayout>>('/teacher/messages/appearance/layout', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.msgAppearanceLayout }); },
  });
}

export function useUpdateMsgSignature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TeacherMsgSignature>) =>
      api.patch<ApiSuccessResponse<TeacherMsgSignature>>('/teacher/messages/appearance/signature', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: teacherKeys.msgSignature }); },
  });
}
