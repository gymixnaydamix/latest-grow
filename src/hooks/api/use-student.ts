import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { ApiSuccessResponse } from '@root/types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const studentKeys = {
  // Profile
  profile: ['student', 'profile'] as const,
  // Academics
  myDay: ['student', 'my-day'] as const,
  timetable: ['student', 'timetable'] as const,
  subjects: ['student', 'subjects'] as const,
  grades: ['student', 'grades'] as const,
  exams: ['student', 'exams'] as const,
  attendance: ['student', 'attendance'] as const,
  assignments: ['student', 'assignments'] as const,
  // Wellness
  wellness: ['student', 'wellness'] as const,
  moodHistory: ['student', 'mood-history'] as const,
  sessions: ['student', 'sessions'] as const,
  // Tools
  learningPath: ['student', 'learning-path'] as const,
  portfolio: ['student', 'portfolio'] as const,
  focusTimer: ['student', 'focus-timer'] as const,
  planner: ['student', 'planner'] as const,
  mindMaps: ['student', 'mind-maps'] as const,
  citations: ['student', 'citations'] as const,
  // Communication
  messages: ['student', 'messages'] as const,
  announcements: ['student', 'announcements'] as const,
  community: ['student', 'community'] as const,
  // Department Requests
  deptRequests: ['student', 'dept-requests'] as const,
  // Settings
  documents: ['student', 'documents'] as const,
  fees: ['student', 'fees'] as const,
  notifications: ['student', 'notifications'] as const,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  gradeLevel: string;
  section: string;
  enrollmentDate: string;
  schoolId: string;
}

export interface StudentSubject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  grade: string;
  schedule: string;
}

export interface TimetableEntry {
  id: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
}

export interface StudentAssignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  grade?: string;
  maxScore: number;
}

export interface StudentExam {
  id: string;
  subject: string;
  title: string;
  date: string;
  time: string;
  room: string;
  duration: string;
  type: string;
}

export interface GradeEntry {
  id: string;
  subject: string;
  assessment: string;
  score: number;
  maxScore: number;
  grade: string;
  date: string;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subject?: string;
}

export interface MoodEntry {
  mood: string;
  note?: string;
  date: string;
}

export interface WellnessSession {
  id: string;
  date: string;
  type: string;
  counselor: string;
  status: string;
}

export interface LearningPath {
  id: string;
  title: string;
  category: string;
  modules: LearningModule[];
  totalXP: number;
  earnedXP: number;
}

export interface LearningModule {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'locked';
  progress: number;
  xp: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  type: string;
  subject: string;
  date: string;
  grade?: string;
  description: string;
  tags: string[];
}

export interface DeptRequest {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'approved' | 'denied' | 'in-review';
  department: string;
  submittedAt: string;
  description: string;
  response?: string;
}

export interface StudentDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

export interface StudentInvoice {
  id: string;
  title: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface CommunityPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  replies: number;
  createdAt: string;
}

export interface MindMap {
  id: string;
  title: string;
  nodes: number;
  lastEdited: string;
}

export interface Citation {
  id: string;
  type: string;
  title: string;
  authors: string;
  year: number;
  formatted: string;
  project: string;
}

export interface FocusSession {
  id: string;
  duration: number;
  task: string;
  completedAt: string;
}

export interface PlannerBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  day: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Mutation Payloads
// ---------------------------------------------------------------------------

interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface SubmitAssignmentPayload {
  assignmentId: string;
  content: string;
}

interface LogMoodPayload {
  mood: string;
  note?: string;
}

interface BookSessionPayload {
  type: string;
  preferredDate?: string;
}

interface AddPortfolioWorkPayload {
  title: string;
  type: string;
  description: string;
  subject?: string;
  tags?: string[];
}

interface SubmitDeptRequestPayload {
  title: string;
  category: string;
  description: string;
}

interface PayInvoicePayload {
  invoiceId: string;
  amount: number;
}

interface CreateCommunityPostPayload {
  content: string;
}

interface CreateMindMapPayload {
  title: string;
  color?: string;
}

interface GenerateCitationPayload {
  style: string;
  sourceType: string;
  title: string;
  authors: string;
  year: number;
  publisher?: string;
  url?: string;
  journal?: string;
}

interface CreateFocusSessionPayload {
  duration: number;
  task: string;
}

interface AddPlannerBlockPayload {
  title: string;
  startTime: string;
  endTime: string;
  day: string;
  color?: string;
}

interface SendMessagePayload {
  threadId?: string;
  recipientId?: string;
  content: string;
}

interface CreateGoalPayload {
  title: string;
  target: string;
  category: string;
}

interface CreateJournalEntryPayload {
  mood: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Query Hooks — Profile & Settings
// ---------------------------------------------------------------------------

export function useStudentProfile() {
  return useQuery({
    queryKey: studentKeys.profile,
    queryFn: () => api.get<ApiSuccessResponse<StudentProfile>>('/student/profile').then((r) => r.data),
  });
}

export function useStudentDocuments() {
  return useQuery({
    queryKey: studentKeys.documents,
    queryFn: () => api.get<ApiSuccessResponse<StudentDocument[]>>('/student/documents').then((r) => r.data),
  });
}

export function useStudentFees() {
  return useQuery({
    queryKey: studentKeys.fees,
    queryFn: () => api.get<ApiSuccessResponse<StudentInvoice[]>>('/student/fees').then((r) => r.data),
  });
}

export function useStudentNotifications() {
  return useQuery({
    queryKey: studentKeys.notifications,
    queryFn: () => api.get<ApiSuccessResponse<unknown[]>>('/student/notifications').then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// Query Hooks — Academics
// ---------------------------------------------------------------------------

export function useStudentMyDay() {
  return useQuery({
    queryKey: studentKeys.myDay,
    queryFn: () => api.get<ApiSuccessResponse<{ classes: TimetableEntry[]; assignments: StudentAssignment[] }>>('/student/my-day').then((r) => r.data),
  });
}

export function useStudentTimetable() {
  return useQuery({
    queryKey: studentKeys.timetable,
    queryFn: () => api.get<ApiSuccessResponse<TimetableEntry[]>>('/student/timetable').then((r) => r.data),
  });
}

export function useStudentSubjects() {
  return useQuery({
    queryKey: studentKeys.subjects,
    queryFn: () => api.get<ApiSuccessResponse<StudentSubject[]>>('/student/subjects').then((r) => r.data),
  });
}

export function useStudentGradesOverview() {
  return useQuery({
    queryKey: studentKeys.grades,
    queryFn: () => api.get<ApiSuccessResponse<GradeEntry[]>>('/student/grades').then((r) => r.data),
  });
}

export function useStudentExams() {
  return useQuery({
    queryKey: studentKeys.exams,
    queryFn: () => api.get<ApiSuccessResponse<StudentExam[]>>('/student/exams').then((r) => r.data),
  });
}

export function useStudentAttendanceOverview() {
  return useQuery({
    queryKey: studentKeys.attendance,
    queryFn: () => api.get<ApiSuccessResponse<AttendanceRecord[]>>('/student/attendance').then((r) => r.data),
  });
}

export function useStudentAssignments() {
  return useQuery({
    queryKey: studentKeys.assignments,
    queryFn: () => api.get<ApiSuccessResponse<StudentAssignment[]>>('/student/assignments').then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// Query Hooks — Wellness
// ---------------------------------------------------------------------------

export function useStudentWellness() {
  return useQuery({
    queryKey: studentKeys.wellness,
    queryFn: () => api.get<ApiSuccessResponse<{ score: number; metrics: unknown[] }>>('/student/wellness').then((r) => r.data),
  });
}

export function useStudentMoodHistory() {
  return useQuery({
    queryKey: studentKeys.moodHistory,
    queryFn: () => api.get<ApiSuccessResponse<MoodEntry[]>>('/student/wellness/mood-history').then((r) => r.data),
  });
}

export function useStudentSessions() {
  return useQuery({
    queryKey: studentKeys.sessions,
    queryFn: () => api.get<ApiSuccessResponse<WellnessSession[]>>('/student/wellness/sessions').then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// Query Hooks — Tools
// ---------------------------------------------------------------------------

export function useStudentLearningPaths() {
  return useQuery({
    queryKey: studentKeys.learningPath,
    queryFn: () => api.get<ApiSuccessResponse<LearningPath[]>>('/student/learning-paths').then((r) => r.data),
  });
}

export function useStudentPortfolio() {
  return useQuery({
    queryKey: studentKeys.portfolio,
    queryFn: () => api.get<ApiSuccessResponse<PortfolioItem[]>>('/student/portfolio').then((r) => r.data),
  });
}

export function useStudentMindMaps() {
  return useQuery({
    queryKey: studentKeys.mindMaps,
    queryFn: () => api.get<ApiSuccessResponse<MindMap[]>>('/student/mind-maps').then((r) => r.data),
  });
}

export function useStudentCitations() {
  return useQuery({
    queryKey: studentKeys.citations,
    queryFn: () => api.get<ApiSuccessResponse<Citation[]>>('/student/citations').then((r) => r.data),
  });
}

export function useStudentFocusSessions() {
  return useQuery({
    queryKey: studentKeys.focusTimer,
    queryFn: () => api.get<ApiSuccessResponse<FocusSession[]>>('/student/focus-sessions').then((r) => r.data),
  });
}

export function useStudentPlanner() {
  return useQuery({
    queryKey: studentKeys.planner,
    queryFn: () => api.get<ApiSuccessResponse<PlannerBlock[]>>('/student/planner').then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// Query Hooks — Communication
// ---------------------------------------------------------------------------

export function useStudentMessages() {
  return useQuery({
    queryKey: studentKeys.messages,
    queryFn: () => api.get<ApiSuccessResponse<unknown[]>>('/student/messages').then((r) => r.data),
  });
}

export function useStudentAnnouncements() {
  return useQuery({
    queryKey: studentKeys.announcements,
    queryFn: () => api.get<ApiSuccessResponse<unknown[]>>('/student/announcements').then((r) => r.data),
  });
}

export function useStudentCommunity() {
  return useQuery({
    queryKey: studentKeys.community,
    queryFn: () => api.get<ApiSuccessResponse<CommunityPost[]>>('/student/community').then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// Query Hooks — Department Requests
// ---------------------------------------------------------------------------

export function useStudentDeptRequests() {
  return useQuery({
    queryKey: studentKeys.deptRequests,
    queryFn: () => api.get<ApiSuccessResponse<DeptRequest[]>>('/student/dept-requests').then((r) => r.data),
  });
}

// ---------------------------------------------------------------------------
// Mutation Hooks — Profile & Settings
// ---------------------------------------------------------------------------

export function useUpdateStudentProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      api.patch<ApiSuccessResponse<StudentProfile>>('/student/profile', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.profile }); },
  });
}

export function useChangeStudentPassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) =>
      api.post<ApiSuccessResponse<{ success: boolean }>>('/student/change-password', { body: data }).then((r) => r.data),
  });
}

export function useUpdateStudentAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.post<ApiSuccessResponse<{ url: string }>>('/student/avatar', { body: formData }, true).then((r) => r.data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.profile }); },
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: (docId: string) =>
      api.get<Blob>(`/student/documents/${docId}/download`).then((r) => r),
  });
}

export function usePayInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PayInvoicePayload) =>
      api.post<ApiSuccessResponse<StudentInvoice>>('/student/fees/pay', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.fees }); },
  });
}

// ---------------------------------------------------------------------------
// Mutation Hooks — Academics
// ---------------------------------------------------------------------------

export function useSubmitAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitAssignmentPayload) =>
      api.post<ApiSuccessResponse<unknown>>(`/student/assignments/${data.assignmentId}/submit`, { body: { content: data.content } }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.assignments }); },
  });
}

// ---------------------------------------------------------------------------
// Mutation Hooks — Wellness
// ---------------------------------------------------------------------------

export function useLogMood() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LogMoodPayload) =>
      api.post<ApiSuccessResponse<MoodEntry>>('/student/wellness/mood', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.moodHistory }); },
  });
}

export function useBookWellnessSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BookSessionPayload) =>
      api.post<ApiSuccessResponse<WellnessSession>>('/student/wellness/sessions', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.sessions }); },
  });
}

// ---------------------------------------------------------------------------
// Mutation Hooks — Tools
// ---------------------------------------------------------------------------

export function useAddPortfolioWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddPortfolioWorkPayload) =>
      api.post<ApiSuccessResponse<PortfolioItem>>('/student/portfolio', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.portfolio }); },
  });
}

export function useCreateMindMap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMindMapPayload) =>
      api.post<ApiSuccessResponse<MindMap>>('/student/mind-maps', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.mindMaps }); },
  });
}

export function useGenerateCitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateCitationPayload) =>
      api.post<ApiSuccessResponse<Citation>>('/student/citations', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.citations }); },
  });
}

export function useDeleteCitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (citationId: string) =>
      api.del<ApiSuccessResponse<void>>(`/student/citations/${citationId}`).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.citations }); },
  });
}

export function useCreateFocusSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFocusSessionPayload) =>
      api.post<ApiSuccessResponse<FocusSession>>('/student/focus-sessions', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.focusTimer }); },
  });
}

export function useAddPlannerBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddPlannerBlockPayload) =>
      api.post<ApiSuccessResponse<PlannerBlock>>('/student/planner', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.planner }); },
  });
}

export function useOptimizePlanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<ApiSuccessResponse<PlannerBlock[]>>('/student/planner/optimize', {}).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.planner }); },
  });
}

// ---------------------------------------------------------------------------
// Mutation Hooks — Communication
// ---------------------------------------------------------------------------

export function useSendStudentMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessagePayload) =>
      api.post<ApiSuccessResponse<unknown>>('/student/messages', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.messages }); },
  });
}

export function useCreateCommunityPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommunityPostPayload) =>
      api.post<ApiSuccessResponse<CommunityPost>>('/student/community/posts', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.community }); },
  });
}

export function useLikeCommunityPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      api.post<ApiSuccessResponse<void>>(`/student/community/posts/${postId}/like`, {}).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.community }); },
  });
}

export function useBookmarkCommunityPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      api.post<ApiSuccessResponse<void>>(`/student/community/posts/${postId}/bookmark`, {}).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.community }); },
  });
}

// ---------------------------------------------------------------------------
// Mutation Hooks — Department Requests
// ---------------------------------------------------------------------------

export function useSubmitDeptRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitDeptRequestPayload) =>
      api.post<ApiSuccessResponse<DeptRequest>>('/student/dept-requests', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.deptRequests }); },
  });
}

// ---------------------------------------------------------------------------
// Mutation Hooks — Wellness Goals & Journal
// ---------------------------------------------------------------------------

export function useCreateWellnessGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoalPayload) =>
      api.post<ApiSuccessResponse<unknown>>('/student/wellness/goals', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.wellness }); },
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJournalEntryPayload) =>
      api.post<ApiSuccessResponse<unknown>>('/student/wellness/journal', { body: data }).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.wellness }); },
  });
}

// ---------------------------------------------------------------------------
// Mutation Hooks — Notifications
// ---------------------------------------------------------------------------

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<ApiSuccessResponse<void>>('/student/notifications/read-all', {}).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.notifications }); },
  });
}

export function useClearNotificationHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.del<ApiSuccessResponse<void>>('/student/notifications').then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: studentKeys.notifications }); },
  });
}
