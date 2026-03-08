import { Router, type IRouter } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import * as tc from '../controllers/teacher.controller.js';
import {
  changePasswordSchema,
  updateTeacherProfileSchema,
  submitTeacherAttendanceSchema,
  createLessonPlanSchema,
  createTeacherAssignmentSchema,
  gradeSubmissionTeacherSchema,
  saveGradesSchema,
  saveExamMarksSchema,
  createTeacherThreadSchema,
  replyMessageSchema,
  createTeacherAnnouncementSchema,
  saveBehaviorNoteSchema,
  scheduleMeetingSchema,
  submitTicketSchema,
  savePreferencesSchema,
  addCommentBankSchema,
  uploadResourceSchema,
} from '../schemas/validation.schemas.js';

const router: IRouter = Router();
router.use(authenticate);
router.use(authorize('TEACHER'));
router.use(validateCsrf);

// Profile
router.get('/profile', tc.getProfile);
router.patch('/profile', validate({ body: updateTeacherProfileSchema }), tc.updateProfile);
router.post('/change-password', validate({ body: changePasswordSchema }), tc.changePassword);
router.post('/avatar', tc.updateAvatar);

// Command center
router.get('/schedule', tc.getSchedule);
router.get('/action-items', tc.getActionItems);
router.get('/student-alerts', tc.getStudentAlerts);
router.get('/grading-queue', tc.getGradingQueue);

// Classes
router.get('/classes', tc.getClasses);
router.get('/classes/:classId', tc.getClassDetail);

// Attendance
router.get('/attendance/:classId', tc.getAttendanceByClass);
router.get('/attendance-history', tc.getAttendanceHistory);
router.post('/attendance', validate({ body: submitTeacherAttendanceSchema }), tc.submitAttendance);

// Lesson plans
router.get('/lesson-plans', tc.getLessonPlans);
router.post('/lesson-plans', validate({ body: createLessonPlanSchema }), tc.createLessonPlan);
router.delete('/lesson-plans/:id', tc.deleteLessonPlan);

// Assignments
router.get('/assignments', tc.getAssignments);
router.post('/assignments', validate({ body: createTeacherAssignmentSchema }), tc.createAssignment);
router.post('/assignments/grade', validate({ body: gradeSubmissionTeacherSchema }), tc.gradeSubmission);

// Gradebook
router.get('/gradebook/:classId', tc.getGradebook);
router.post('/gradebook/save', validate({ body: saveGradesSchema }), tc.saveGrades);
router.post('/gradebook/export', tc.exportGrades);

// Comment bank
router.get('/comment-bank', tc.getCommentBank);
router.post('/comment-bank', validate({ body: addCommentBankSchema }), tc.addComment);

// Exams
router.get('/exams', tc.getExams);
router.post('/exams/marks', validate({ body: saveExamMarksSchema }), tc.saveExamMarks);

// Messages
router.get('/messages', tc.getMessages);
router.get('/messages/:threadId', tc.getThreadMessages);
router.post('/messages', validate({ body: createTeacherThreadSchema }), tc.createThread);
router.post('/messages/reply', validate({ body: replyMessageSchema }), tc.replyToMessage);

// Announcements
router.get('/announcements', tc.getAnnouncements);
router.post('/announcements', validate({ body: createTeacherAnnouncementSchema }), tc.createAnnouncement);

// Behavior
router.get('/behavior-notes', tc.getBehaviorNotes);
router.post('/behavior-notes', validate({ body: saveBehaviorNoteSchema }), tc.saveBehaviorNote);

// Meetings
router.get('/meetings', tc.getMeetings);
router.post('/meetings', validate({ body: scheduleMeetingSchema }), tc.scheduleMeeting);
router.delete('/meetings/:id', tc.cancelMeeting);

// Reports
router.get('/class-performance', tc.getClassPerformance);

// Support
router.post('/support/ticket', validate({ body: submitTicketSchema }), tc.submitTicket);

// Preferences
router.post('/preferences', validate({ body: savePreferencesSchema }), tc.savePreferences);

// Resources
router.post('/resources', validate({ body: uploadResourceSchema }), tc.uploadResource);

export default router;
