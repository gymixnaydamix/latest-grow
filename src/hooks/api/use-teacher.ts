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
  // Announcements
  announcements: ['teacher', 'announcements'] as const,
  // Behavior
  behaviorNotes: ['teacher', 'behavior-notes'] as const,
  // Meetings
  meetings: ['teacher', 'meetings'] as const,
  // Reports
  classPerformance: ['teacher', 'class-performance'] as const,
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
