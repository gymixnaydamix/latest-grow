import { Router, type IRouter } from 'express';
import { studentController } from '../controllers/student.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';

const router: IRouter = Router();
router.use(authenticate);
router.use(validateCsrf);

// ── Profile & Settings ──
router.get('/profile', studentController.getProfile);
router.patch('/profile', studentController.updateProfile);
router.post('/change-password', studentController.changePassword);
router.post('/avatar', studentController.updateAvatar);

// ── Documents ──
router.get('/documents', studentController.listDocuments);
router.get('/documents/:id/download', studentController.downloadDocument);

// ── Fees ──
router.get('/fees', studentController.listFees);
router.post('/fees/pay', studentController.payInvoice);

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
router.post('/assignments/:id/submit', studentController.submitAssignment);

// ── Wellness ──
router.get('/wellness', studentController.getWellness);
router.get('/wellness/mood-history', studentController.getMoodHistory);
router.post('/wellness/mood', studentController.logMood);
router.get('/wellness/sessions', studentController.listSessions);
router.post('/wellness/sessions', studentController.bookSession);
router.post('/wellness/goals', studentController.createWellnessGoal);
router.post('/wellness/journal', studentController.createJournalEntry);

// ── Learning Paths ──
router.get('/learning-paths', studentController.listLearningPaths);

// ── Portfolio ──
router.get('/portfolio', studentController.listPortfolio);
router.post('/portfolio', studentController.addPortfolioWork);

// ── Mind Maps ──
router.get('/mind-maps', studentController.listMindMaps);
router.post('/mind-maps', studentController.createMindMap);

// ── Citations ──
router.get('/citations', studentController.listCitations);
router.post('/citations', studentController.generateCitation);
router.delete('/citations/:id', studentController.deleteCitation);

// ── Focus Sessions ──
router.get('/focus-sessions', studentController.listFocusSessions);
router.post('/focus-sessions', studentController.createFocusSession);

// ── Planner ──
router.get('/planner', studentController.getPlanner);
router.post('/planner', studentController.addPlannerBlock);
router.post('/planner/optimize', studentController.optimizePlanner);

// ── Messages ──
router.get('/messages', studentController.listMessages);
router.post('/messages', studentController.sendMessage);

// ── Announcements ──
router.get('/announcements', studentController.listAnnouncements);

// ── Community ──
router.get('/community', studentController.listCommunityPosts);
router.post('/community/posts', studentController.createCommunityPost);
router.post('/community/posts/:id/like', studentController.likeCommunityPost);
router.post('/community/posts/:id/bookmark', studentController.bookmarkCommunityPost);

// ── Department Requests ──
router.get('/dept-requests', studentController.listDeptRequests);
router.post('/dept-requests', studentController.submitDeptRequest);

export default router;
