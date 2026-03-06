import { Router, type IRouter } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import * as tc from '../controllers/teacher.controller.js';

const router: IRouter = Router();
router.use(authenticate);
router.use(validateCsrf);

// Profile
router.get('/profile', tc.getProfile);
router.patch('/profile', tc.updateProfile);
router.post('/change-password', tc.changePassword);
router.post('/avatar', tc.updateAvatar);

// Command center
router.get('/schedule', tc.getSchedule);
router.get('/action-items', tc.getActionItems);
router.get('/student-alerts', tc.getStudentAlerts);
router.get('/grading-queue', tc.getGradingQueue);

// Classes
router.get('/classes', tc.getClasses);

// Attendance
router.get('/attendance/:classId', tc.getAttendanceByClass);
router.get('/attendance-history', tc.getAttendanceHistory);
router.post('/attendance', tc.submitAttendance);

// Lesson plans
router.get('/lesson-plans', tc.getLessonPlans);
router.post('/lesson-plans', tc.createLessonPlan);

// Assignments
router.get('/assignments', tc.getAssignments);
router.post('/assignments', tc.createAssignment);
router.post('/assignments/grade', tc.gradeSubmission);

// Gradebook
router.get('/gradebook/:classId', tc.getGradebook);
router.post('/gradebook/save', tc.saveGrades);
router.post('/gradebook/export', tc.exportGrades);

// Comment bank
router.get('/comment-bank', tc.getCommentBank);
router.post('/comment-bank', tc.addComment);

// Exams
router.get('/exams', tc.getExams);
router.post('/exams/marks', tc.saveExamMarks);

// Messages
router.get('/messages', tc.getMessages);
router.post('/messages', tc.createThread);
router.post('/messages/reply', tc.replyToMessage);

// Announcements
router.get('/announcements', tc.getAnnouncements);
router.post('/announcements', tc.createAnnouncement);

// Behavior
router.get('/behavior-notes', tc.getBehaviorNotes);
router.post('/behavior-notes', tc.saveBehaviorNote);

// Meetings
router.get('/meetings', tc.getMeetings);
router.post('/meetings', tc.scheduleMeeting);

// Reports
router.get('/class-performance', tc.getClassPerformance);

// Support
router.post('/support/ticket', tc.submitTicket);

// Preferences
router.post('/preferences', tc.savePreferences);

// Resources
router.post('/resources', tc.uploadResource);

export default router;
