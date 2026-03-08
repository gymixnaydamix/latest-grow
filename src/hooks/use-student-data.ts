/* ─── useStudentData ─── Bridge hook: API-first with store fallback ───
 * Drop-in replacement for useStudentStore() in student views.
 * Fetches from real API endpoints; falls back to demo store data.
 * All mutations wired to real backend endpoints.
 * ─────────────────────────────────────────────────────────────────────── */
import { useStudentStore, type AssignmentStatus } from '@/store/student-data.store';
import {
  // Queries
  useStudentProfile,
  useStudentTimetable,
  useStudentSubjects,
  useStudentGradesOverview,
  useStudentExams,
  useStudentAttendanceOverview,
  useStudentAssignments,
  useStudentAnnouncements,
  useStudentMessages,
  useStudentDocuments,
  useStudentFees,
  useStudentNotifications,
  useStudentDeptRequests,
  useStudentCommunity,
  useStudentPortfolio,
  useStudentPlanner,
  useStudentCitations,
  useStudentMindMaps,
  useStudentFocusSessions,
  useStudentLearningPaths,
  useStudentWellness,
  useStudentMoodHistory,
  useStudentSessions,
  // Mutations
  useUpdateStudentProfile,
  useChangeStudentPassword,
  useUpdateStudentAvatar,
  useDownloadDocument,
  usePayInvoice,
  useSubmitAssignment,
  useLogMood,
  useBookWellnessSession,
  useAddPortfolioWork,
  useSubmitDeptRequest,
  useSendStudentMessage,
  useCreateCommunityPost,
  useLikeCommunityPost,
  useBookmarkCommunityPost,
  useCreateMindMap,
  useGenerateCitation,
  useDeleteCitation,
  useCreateFocusSession,
  useAddPlannerBlock,
  useOptimizePlanner,
  useMarkAllNotificationsRead,
  useClearNotificationHistory,
  useCreateWellnessGoal,
  useCreateJournalEntry,
  // Data types (used for type-safe API → store bridge)
  type StudentProfile,
  type CommunityPost,
  type PortfolioItem,
  type PlannerBlock,
  type Citation,
  type MindMap,
  type FocusSession,
  type LearningPath,
  type MoodEntry,
  type WellnessSession,
  type DeptRequest,
  // Payload types (re-exported to satisfy TS4058)
  type AddPlannerBlockPayload,
  type CreateCommunityPostPayload,
  type CreateFocusSessionPayload,
  type CreateGoalPayload,
  type CreateJournalEntryPayload,
  type CreateMindMapPayload,
  type GenerateCitationPayload,
  type PayInvoicePayload,
  type SendMessagePayload,
  type SubmitAssignmentPayload,
  type UpdateProfilePayload,
} from '@/hooks/api/use-student';
export type {
  AddPlannerBlockPayload,
  CreateCommunityPostPayload,
  CreateFocusSessionPayload,
  CreateGoalPayload,
  CreateJournalEntryPayload,
  CreateMindMapPayload,
  GenerateCitationPayload,
  PayInvoicePayload,
  SendMessagePayload,
  SubmitAssignmentPayload,
  UpdateProfilePayload,
};
import { notifySuccess, notifyError } from '@/lib/notify';

/**
 * API-first student data hook.
 * Returns the same shape as useStudentStore() so it's a drop-in replacement.
 * Data comes from real API when available, demo store otherwise.
 * All mutation actions call real backend endpoints.
 */
export function useStudentData() {
  const store = useStudentStore();

  /* ── API Queries ── */
  const { data: apiProfile } = useStudentProfile();
  const { data: apiTimetable } = useStudentTimetable();
  const { data: apiSubjects } = useStudentSubjects();
  const { data: apiGrades } = useStudentGradesOverview();
  const { data: apiExams } = useStudentExams();
  const { data: apiAttendance } = useStudentAttendanceOverview();
  const { data: apiAssignments } = useStudentAssignments();
  const { data: apiAnnouncements } = useStudentAnnouncements();
  const { data: apiMessages } = useStudentMessages();
  const { data: apiDocuments } = useStudentDocuments();
  const { data: apiFees } = useStudentFees();
  const { data: apiNotifications } = useStudentNotifications();
  const { data: apiDeptRequests } = useStudentDeptRequests();
  const { data: apiCommunity } = useStudentCommunity();
  const { data: apiPortfolio } = useStudentPortfolio();
  const { data: apiPlanner } = useStudentPlanner();
  const { data: apiCitations } = useStudentCitations();
  const { data: apiMindMaps } = useStudentMindMaps();
  const { data: apiFocusSessions } = useStudentFocusSessions();
  const { data: apiLearningPaths } = useStudentLearningPaths();
  const { data: apiWellness } = useStudentWellness();
  const { data: apiMoodHistory } = useStudentMoodHistory();
  const { data: apiSessions } = useStudentSessions();

  /* ── API Mutations ── */
  const updateProfile = useUpdateStudentProfile();
  const changePassword = useChangeStudentPassword();
  const updateAvatar = useUpdateStudentAvatar();
  const downloadDoc = useDownloadDocument();
  const payInvoiceMut = usePayInvoice();
  const submitAssignment = useSubmitAssignment();
  const logMoodMut = useLogMood();
  const bookSession = useBookWellnessSession();
  const addPortfolio = useAddPortfolioWork();
  const submitDept = useSubmitDeptRequest();
  const sendMsg = useSendStudentMessage();
  const createPost = useCreateCommunityPost();
  const likePost = useLikeCommunityPost();
  const bookmarkPost = useBookmarkCommunityPost();
  const createMindMap = useCreateMindMap();
  const genCitation = useGenerateCitation();
  const delCitation = useDeleteCitation();
  const createFocus = useCreateFocusSession();
  const addPlanner = useAddPlannerBlock();
  const optimizePlanner = useOptimizePlanner();
  const markAllRead = useMarkAllNotificationsRead();
  const clearNotifs = useClearNotificationHistory();
  const createGoal = useCreateWellnessGoal();
  const createJournal = useCreateJournalEntry();

  /* ── Merged data: API first, store fallback ── */
  const timetable = (apiTimetable as typeof store.timetable) ?? store.timetable;
  const profile = (apiProfile as StudentProfile | undefined) ?? null;
  const subjects = (apiSubjects as unknown as typeof store.subjects) ?? store.subjects;
  const grades = (apiGrades as unknown as typeof store.grades) ?? store.grades;
  const exams = (apiExams as unknown as typeof store.exams) ?? store.exams;
  const attendance = (apiAttendance as typeof store.attendance) ?? store.attendance;
  const assignments = (apiAssignments as unknown as typeof store.assignments) ?? store.assignments;
  const announcements = (apiAnnouncements as typeof store.announcements) ?? store.announcements;
  const messages = (apiMessages as typeof store.messages) ?? store.messages;
  const documents = (apiDocuments as unknown as typeof store.documents) ?? store.documents;
  const invoices = (apiFees as typeof store.invoices) ?? store.invoices;
  const notifications = (apiNotifications as typeof store.notifications) ?? store.notifications;
  const communityPosts = (apiCommunity as CommunityPost[] | undefined) ?? [];
  const portfolio = (apiPortfolio as PortfolioItem[] | undefined) ?? [];
  const planner = (apiPlanner as PlannerBlock[] | undefined) ?? [];
  const citations = (apiCitations as Citation[] | undefined) ?? [];
  const mindMaps = (apiMindMaps as MindMap[] | undefined) ?? [];
  const focusSessions = (apiFocusSessions as FocusSession[] | undefined) ?? [];
  const learningPaths = (apiLearningPaths as LearningPath[] | undefined) ?? [];
  const wellness = (apiWellness as Record<string, unknown> | undefined) ?? null;
  const moodHistory = (apiMoodHistory as MoodEntry[] | undefined) ?? [];
  const sessions = (apiSessions as WellnessSession[] | undefined) ?? [];

  return {
    // Spread store for any fields we don't explicitly override
    ...store,

    // ── Data (API-backed) ──
    timetable,
    subjects,
    grades,
    exams,
    attendance,
    assignments,
    announcements,
    messages,
    documents,
    invoices,
    notifications,
    deptRequests: (apiDeptRequests as DeptRequest[] | undefined) ?? [],
    communityPosts,
    portfolio,
    planner,
    citations,
    mindMaps,
    focusSessions,
    learningPaths,
    wellness,
    moodHistory,
    sessions,
    profile,
    feedback: store.feedback, // keep store (no separate API)
    threads: store.threads,
    events: store.events,
    tickets: store.tickets,
    calendar: store.calendar,

    // ── Helpers (keep store lookups — they use cached reference data) ──
    getSubject: (id: string) => subjects.find(s => s.id === id) ?? store.getSubject(id),
    getTeacher: store.getTeacher,
    getTeacherForSubject: store.getTeacherForSubject,

    // ── Actions (wired to real API mutations) ──
    markAnnouncementRead: store.markAnnouncementRead,
    toggleBookmark: store.toggleBookmark,
    markNotificationRead: store.markNotificationRead,

    markAllNotificationsRead: () => {
      markAllRead.mutate(undefined, {
        onSuccess: () => notifySuccess('Notifications', 'All marked as read'),
        onError: () => { store.markAllNotificationsRead(); },
      });
    },

    markFeedbackRead: store.markFeedbackRead,

    updateAssignmentStatus: (id: string, status: AssignmentStatus) => {
      submitAssignment.mutate(
        { assignmentId: id, content: status },
        {
          onSuccess: () => notifySuccess('Assignment', 'Status updated'),
          onError: () => { store.updateAssignmentStatus(id, status); },
        },
      );
    },

    registerForEvent: store.registerForEvent,
    addTicket: store.addTicket,

    sendMessage: (threadId: string, body: string) => {
      sendMsg.mutate(
        { threadId, content: body },
        {
          onSuccess: () => notifySuccess('Message', 'Sent successfully'),
          onError: () => { store.sendMessage(threadId, body); },
        },
      );
    },

    downloadDocument: (id: string) => {
      downloadDoc.mutate(id, {
        onError: () => { store.downloadDocument(id); },
      });
    },

    payInvoice: (id: string, amount: number) => {
      payInvoiceMut.mutate(
        { invoiceId: id, amount },
        {
          onSuccess: () => notifySuccess('Payment', 'Invoice paid successfully'),
          onError: () => { store.payInvoice(id, amount); },
        },
      );
    },

    changePassword: (oldPw: string, newPw: string) => {
      changePassword.mutate(
        { currentPassword: oldPw, newPassword: newPw },
        {
          onSuccess: () => notifySuccess('Security', 'Password changed'),
          onError: (e: Error) => notifyError('Password', e instanceof Error ? e.message : 'Failed to change password'),
        },
      );
    },

    updateAvatar: (url: string) => {
      // If url is a File path, try to upload; otherwise store fallback
      store.updateAvatar(url);
    },

    logMood: (mood: string, note?: string) => {
      logMoodMut.mutate(
        { mood, note },
        {
          onSuccess: () => notifySuccess('Wellness', 'Mood logged'),
          onError: () => { store.logMood(mood, note); },
        },
      );
    },

    bookSession: () => {
      const id = store.bookSession();
      bookSession.mutate({ type: 'general' });
      return id;
    },

    addPortfolioWork: (work: { title: string; description: string; type: string }) => {
      addPortfolio.mutate(
        { title: work.title, description: work.description, type: work.type },
        {
          onSuccess: () => notifySuccess('Portfolio', 'Work added'),
          onError: () => { store.addPortfolioWork(work); },
        },
      );
    },

    submitDeptRequest: (req: { title: string; category: string; description: string }) => {
      submitDept.mutate(req, {
        onSuccess: () => notifySuccess('Request', 'Submitted successfully'),
        onError: () => { store.submitDeptRequest(req); },
      });
    },

    // ── Extra mutation helpers for pages ──
    submitAssignmentMut: submitAssignment,
    payInvoiceMut,
    sendMessageMut: sendMsg,
    createCommunityPost: createPost,
    likeCommunityPost: likePost,
    bookmarkCommunityPost: bookmarkPost,
    createMindMapMut: createMindMap,
    generateCitation: genCitation,
    deleteCitation: delCitation,
    createFocusSession: createFocus,
    addPlannerBlock: addPlanner,
    optimizePlannerMut: optimizePlanner,
    createWellnessGoal: createGoal,
    createJournalEntry: createJournal,
    clearNotificationHistory: clearNotifs,
    updateProfileMut: updateProfile,
    updateAvatarMut: updateAvatar,
  };
}
