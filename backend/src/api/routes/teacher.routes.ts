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
  // Messaging settings schemas
  updateMsgDefaultsSchema,
  updateMsgReplySettingsSchema,
  updateMsgSchedulingSchema,
  updateMsgNotifChannelsSchema,
  updateMsgNotifRulesSchema,
  updateMsgQuietHoursSchema,
  createSLAPolicySchema,
  updateSLAPolicySchema,
  createSLAEscalationRuleSchema,
  createLegalTemplateSchema,
  updateLegalTemplateSchema,
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
  updateMsgAppearanceThemeSchema,
  updateMsgAppearanceLayoutSchema,
  updateMsgSignatureSchema,
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

// Messages — static sub-routes MUST come before /:threadId param
router.get('/messages', tc.getMessages);
router.post('/messages', validate({ body: createTeacherThreadSchema }), tc.createThread);
router.post('/messages/reply', validate({ body: replyMessageSchema }), tc.replyToMessage);

// Messaging Settings (must be before :threadId)
router.get('/messages/settings/defaults', tc.getMsgDefaults);
router.patch('/messages/settings/defaults', validate({ body: updateMsgDefaultsSchema }), tc.updateMsgDefaults);
router.get('/messages/settings/reply', tc.getMsgReplySettings);
router.patch('/messages/settings/reply', validate({ body: updateMsgReplySettingsSchema }), tc.updateMsgReplySettings);
router.get('/messages/settings/scheduling', tc.getMsgScheduling);
router.patch('/messages/settings/scheduling', validate({ body: updateMsgSchedulingSchema }), tc.updateMsgScheduling);
router.get('/messages/settings/notif-channels', tc.getMsgNotifChannels);
router.patch('/messages/settings/notif-channels', validate({ body: updateMsgNotifChannelsSchema }), tc.updateMsgNotifChannels);
router.get('/messages/settings/notif-rules', tc.getMsgNotifRules);
router.put('/messages/settings/notif-rules', validate({ body: updateMsgNotifRulesSchema }), tc.updateMsgNotifRules);
router.get('/messages/settings/quiet-hours', tc.getMsgQuietHours);
router.patch('/messages/settings/quiet-hours', validate({ body: updateMsgQuietHoursSchema }), tc.updateMsgQuietHours);
router.get('/messages/sla-policies', tc.getSLAPolicies);
router.post('/messages/sla-policies', validate({ body: createSLAPolicySchema }), tc.createSLAPolicy);
router.patch('/messages/sla-policies/:id', validate({ body: updateSLAPolicySchema }), tc.updateSLAPolicy);
router.delete('/messages/sla-policies/:id', tc.deleteSLAPolicy);
router.get('/messages/sla-escalation', tc.getSLAEscalationRules);
router.post('/messages/sla-escalation', validate({ body: createSLAEscalationRuleSchema }), tc.createSLAEscalationRule);
router.delete('/messages/sla-escalation/:id', tc.deleteSLAEscalationRule);
router.get('/messages/legal-templates', tc.getLegalTemplates);
router.post('/messages/legal-templates', validate({ body: createLegalTemplateSchema }), tc.createLegalTemplate);
router.patch('/messages/legal-templates/:id', validate({ body: updateLegalTemplateSchema }), tc.updateLegalTemplate);
router.delete('/messages/legal-templates/:id', tc.deleteLegalTemplate);
router.get('/messages/legal-categories', tc.getLegalCategories);
router.get('/messages/email-templates', tc.getEmailTemplates);
router.post('/messages/email-templates', validate({ body: createEmailTemplateSchema }), tc.createEmailTemplate);
router.patch('/messages/email-templates/:id', validate({ body: updateEmailTemplateSchema }), tc.updateEmailTemplate);
router.delete('/messages/email-templates/:id', tc.deleteEmailTemplate);
router.get('/messages/email-variables', tc.getEmailVariables);
router.get('/messages/appearance/theme', tc.getMsgAppearanceTheme);
router.patch('/messages/appearance/theme', validate({ body: updateMsgAppearanceThemeSchema }), tc.updateMsgAppearanceTheme);
router.get('/messages/appearance/layout', tc.getMsgAppearanceLayout);
router.patch('/messages/appearance/layout', validate({ body: updateMsgAppearanceLayoutSchema }), tc.updateMsgAppearanceLayout);
router.get('/messages/appearance/signature', tc.getMsgSignature);
router.patch('/messages/appearance/signature', validate({ body: updateMsgSignatureSchema }), tc.updateMsgSignature);

// Thread detail (param route — MUST be after all static /messages/* routes)
router.get('/messages/:threadId', tc.getThreadMessages);

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
