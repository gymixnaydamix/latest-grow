import { Router, type IRouter } from 'express';
import { studentController } from '../controllers/student.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  idParamSchema,
  updateStudentProfileSchema,
  changePasswordSchema,
  updateAvatarSchema,
  payInvoiceSchema,
  logMoodSchema,
  bookSessionSchema,
  createStudentWellnessGoalSchema,
  createStudentJournalEntrySchema,
  addPortfolioWorkSchema,
  createMindMapSchema,
  generateCitationSchema,
  createFocusSessionSchema,
  addPlannerBlockSchema,
  sendStudentMessageSchema,
  createCommunityPostSchema,
  submitDeptRequestSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);
router.use(validateCsrf);

// ── Profile & Settings ──
router.get('/profile', studentController.getProfile);
router.patch('/profile', validate({ body: updateStudentProfileSchema }), studentController.updateProfile);
router.post('/change-password', validate({ body: changePasswordSchema }), studentController.changePassword);
router.post('/avatar', validate({ body: updateAvatarSchema }), studentController.updateAvatar);

// ── Documents ──
router.get('/documents', studentController.listDocuments);
router.get('/documents/:id/download', validate({ params: idParamSchema }), studentController.downloadDocument);

// ── Fees ──
router.get('/fees', studentController.listFees);
router.post('/fees/pay', validate({ body: payInvoiceSchema }), studentController.payInvoice);

// ── Notifications ──
router.get('/notifications', studentController.listNotifications);
router.post('/notifications/read-all', studentController.markAllNotificationsRead);
router.delete('/notifications', studentController.clearNotifications);

// ── My Day ──
router.get('/my-day', studentController.getMyDay);

// ── Timetable ──
router.get('/timetable', studentController.getTimetable);

// ── Subjects ──
router.get('/subjects', studentController.listSubjects);

// ── Grades ──
router.get('/grades', studentController.listGrades);

// ── Exams ──
router.get('/exams', studentController.listExams);

// ── Attendance ──
router.get('/attendance', studentController.getAttendance);

// ── Assignments ──
router.get('/assignments', studentController.listAssignments);
router.post('/assignments/:id/submit', validate({ params: idParamSchema }), studentController.submitAssignment);

// ── Wellness ──
router.get('/wellness', studentController.getWellness);
router.get('/wellness/mood-history', studentController.getMoodHistory);
router.post('/wellness/mood', validate({ body: logMoodSchema }), studentController.logMood);
router.get('/wellness/sessions', studentController.listSessions);
router.post('/wellness/sessions', validate({ body: bookSessionSchema }), studentController.bookSession);
router.post('/wellness/goals', validate({ body: createStudentWellnessGoalSchema }), studentController.createWellnessGoal);
router.post('/wellness/journal', validate({ body: createStudentJournalEntrySchema }), studentController.createJournalEntry);

// ── Learning Paths ──
router.get('/learning-paths', studentController.listLearningPaths);

// ── Portfolio ──
router.get('/portfolio', studentController.listPortfolio);
router.post('/portfolio', validate({ body: addPortfolioWorkSchema }), studentController.addPortfolioWork);

// ── Mind Maps ──
router.get('/mind-maps', studentController.listMindMaps);
router.post('/mind-maps', validate({ body: createMindMapSchema }), studentController.createMindMap);

// ── Citations ──
router.get('/citations', studentController.listCitations);
router.post('/citations', validate({ body: generateCitationSchema }), studentController.generateCitation);
router.delete('/citations/:id', validate({ params: idParamSchema }), studentController.deleteCitation);

// ── Focus Sessions ──
router.get('/focus-sessions', studentController.listFocusSessions);
router.post('/focus-sessions', validate({ body: createFocusSessionSchema }), studentController.createFocusSession);

// ── Planner ──
router.get('/planner', studentController.getPlanner);
router.post('/planner', validate({ body: addPlannerBlockSchema }), studentController.addPlannerBlock);
router.post('/planner/optimize', studentController.optimizePlanner);

// ── Messages ──
router.get('/messages', studentController.listMessages);
router.post('/messages', validate({ body: sendStudentMessageSchema }), studentController.sendMessage);

// ── Announcements ──
router.get('/announcements', studentController.listAnnouncements);

// ── Community ──
router.get('/community', studentController.listCommunityPosts);
router.post('/community/posts', validate({ body: createCommunityPostSchema }), studentController.createCommunityPost);
router.post('/community/posts/:id/like', validate({ params: idParamSchema }), studentController.likeCommunityPost);
router.post('/community/posts/:id/bookmark', validate({ params: idParamSchema }), studentController.bookmarkCommunityPost);

// ── Department Requests ──
router.get('/dept-requests', studentController.listDeptRequests);
router.post('/dept-requests', validate({ body: submitDeptRequestSchema }), studentController.submitDeptRequest);

export default router;
