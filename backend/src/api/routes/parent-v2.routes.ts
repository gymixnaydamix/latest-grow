import { Router, type IRouter } from 'express';
import { parentV2Controller } from '../controllers/parent-v2.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { enforceParentScope } from '../middlewares/parent-scope.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { uploadMiddleware } from '../controllers/upload.controller.js';
import {
  explainAbsenceSchema,
  submitAttendanceExplanationSchema,
  createMessageThreadSchema,
  postMessageSchema,
  decideApprovalSchema,
  rsvpEventSchema,
  updateProfilePreferencesSchema,
  updateDigestConfigSchema,
  createFeedbackSchema,
  createSupportTicketSchema,
  replySupportTicketSchema,
  upsertPinSchema,
  upsertWorkspaceItemSchema,
  markNotificationsReadSchema,
} from '../schemas/parent-v2.schemas.js';

const router: IRouter = Router();

router.post('/stripe/webhook', parentV2Controller.stripeWebhook);

router.use(authenticate);
router.use(authorize('PARENT'));
router.use(enforceParentScope);

router.get('/home', parentV2Controller.home);
router.get('/children', parentV2Controller.listChildren);
router.get('/children/:childId', parentV2Controller.childDetail);

router.get('/timetable', parentV2Controller.timetable);
router.get('/assignments', parentV2Controller.assignments);
router.get('/exams', parentV2Controller.exams);
router.get('/grades', parentV2Controller.grades);

router.get('/attendance', parentV2Controller.attendance);
router.post('/attendance/:childId/explain-absence', validateCsrf, validate({ body: explainAbsenceSchema }), parentV2Controller.explainAbsence);
router.post('/attendance/:attendanceId/explanation', validateCsrf, validate({ body: submitAttendanceExplanationSchema }), parentV2Controller.submitAttendanceExplanation);

router.get('/messages/threads', parentV2Controller.listMessageThreads);
router.get('/messages/recipients', parentV2Controller.messageRecipients);
router.post('/messages/threads', validateCsrf, validate({ body: createMessageThreadSchema }), parentV2Controller.createMessageThread);
router.get('/messages/threads/:threadId', parentV2Controller.messageThreadDetail);
router.post('/messages/threads/:threadId/messages', validateCsrf, validate({ body: postMessageSchema }), parentV2Controller.postMessage);

router.get('/announcements', parentV2Controller.announcements);
router.post('/announcements/:announcementId/read', validateCsrf, parentV2Controller.markAnnouncementRead);
router.post('/announcements/:announcementId/save', validateCsrf, parentV2Controller.saveAnnouncement);

router.get('/fees/invoices', parentV2Controller.invoices);
router.get('/fees/invoices/:invoiceId', parentV2Controller.invoiceDetail);
router.post('/fees/invoices/:invoiceId/checkout-session', validateCsrf, parentV2Controller.createCheckoutSession);
router.get('/fees/payments', parentV2Controller.payments);
router.get('/fees/receipts', parentV2Controller.receipts);

router.get('/approvals', parentV2Controller.approvals);
router.post('/approvals/:approvalRequestId/decision', validateCsrf, validate({ body: decideApprovalSchema }), parentV2Controller.decideApproval);

router.get('/transport', parentV2Controller.transport);
router.get('/documents', parentV2Controller.documents);
router.get('/documents/:documentId', parentV2Controller.documentDetail);
router.post('/documents/:documentId/upload', validateCsrf, uploadMiddleware, parentV2Controller.uploadDocument);

router.get('/events', parentV2Controller.events);
router.post('/events/:eventId/rsvp', validateCsrf, validate({ body: rsvpEventSchema }), parentV2Controller.rsvpEvent);

router.get('/profile', parentV2Controller.profile);
router.put('/profile/preferences', validateCsrf, validate({ body: updateProfilePreferencesSchema }), parentV2Controller.updateProfilePreferences);
router.get('/digest', parentV2Controller.digestConfig);
router.put('/digest', validateCsrf, validate({ body: updateDigestConfigSchema }), parentV2Controller.updateDigestConfig);
router.get('/feedback', parentV2Controller.feedback);
router.post('/feedback', validateCsrf, validate({ body: createFeedbackSchema }), parentV2Controller.createFeedback);
router.get('/volunteer', parentV2Controller.volunteer);
router.post('/volunteer/:opportunityId/signup', validateCsrf, parentV2Controller.signUpVolunteer);
router.get('/cafeteria/menu', parentV2Controller.cafeteriaMenu);
router.get('/cafeteria/account/:childId', parentV2Controller.cafeteriaAccount);

router.get('/support/tickets', parentV2Controller.supportTickets);
router.get('/support/tickets/:supportTicketId', parentV2Controller.supportTicketDetail);
router.post('/support/tickets', validateCsrf, validate({ body: createSupportTicketSchema }), parentV2Controller.createSupportTicket);
router.post('/support/tickets/:supportTicketId/replies', validateCsrf, validate({ body: replySupportTicketSchema }), parentV2Controller.replySupportTicket);

router.get('/search', parentV2Controller.search);
router.get('/productivity/pins', parentV2Controller.listPins);
router.get('/productivity/recent', parentV2Controller.listRecent);
router.post('/productivity/pin', validateCsrf, validate({ body: upsertPinSchema }), parentV2Controller.upsertPin);
router.post('/productivity/items', validateCsrf, validate({ body: upsertWorkspaceItemSchema }), parentV2Controller.upsertWorkspaceItem);
router.delete('/productivity/pin/:itemId', validateCsrf, parentV2Controller.removePin);

router.get('/notifications', parentV2Controller.notifications);
router.post('/notifications/read', validateCsrf, validate({ body: markNotificationsReadSchema }), parentV2Controller.markNotificationsRead);
router.post('/notifications/read-all', validateCsrf, parentV2Controller.markAllNotificationsRead);
router.delete('/notifications/:notificationId', validateCsrf, parentV2Controller.deleteNotification);

export default router;
