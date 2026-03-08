/* ──────────────────────────────────────────────────────────────────────
 * school-ops.routes — Admin School Operations routes
 * Mounted at /admin/schools/:schoolId/...
 * ────────────────────────────────────────────────────────────────────── */
import { Router, type IRouter } from 'express';
import {
  schoolOpsAttendanceController,
  schoolOpsAcademicsController,
  schoolOpsExamsController,
  schoolOpsFinanceController,
  schoolOpsTransportController,
  schoolOpsFacilitiesController,
  schoolOpsCommController,
  schoolOpsSettingsController,
  schoolOpsAuditController,
  schoolOpsStaffController,
  schoolOpsReportsController,
  schoolOpsNotificationsController,
  schoolOpsExamReportsController,
} from '../controllers/school-ops.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/rbac.middleware.js';
import { validateCsrf } from '../middlewares/csrf.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  markAttendanceSchema,
  approveCorrectionSchema,
  createClassSchema,
  updateClassSchema,
  createExamSchema,
  updateMarksSchema,
  generateInvoiceSchema,
  recordPaymentSchema,
  createRouteSchema,
  reportIncidentSchema,
  createMaintenanceRequestSchema,
  bookFacilitySchema,
  createAnnouncementSchema,
  sendBroadcastSchema,
  saveProfileSchema,
  saveFeesSchema,
  submitLeaveSchema,
  approveLeaveSchema,
} from '../schemas/school-ops.schemas.js';

const router: IRouter = Router({ mergeParams: true });
router.use(authenticate);
router.use(authorize('PROVIDER', 'ADMIN'));

// ─────────────────── Attendance ────────────────────
router.get('/:schoolId/attendance/overview', schoolOpsAttendanceController.overview);
router.get('/:schoolId/attendance/daily', schoolOpsAttendanceController.daily);
router.get('/:schoolId/attendance/exceptions', schoolOpsAttendanceController.exceptions);
router.get('/:schoolId/attendance/corrections', schoolOpsAttendanceController.corrections);
router.post('/:schoolId/attendance/mark', validateCsrf, validate({ body: markAttendanceSchema }), schoolOpsAttendanceController.mark);
router.patch('/:schoolId/attendance/corrections/:id', validateCsrf, validate({ body: approveCorrectionSchema }), schoolOpsAttendanceController.approveCorrection);

// ─────────────────── Academics ─────────────────────
router.get('/:schoolId/academics/years', schoolOpsAcademicsController.years);
router.get('/:schoolId/academics/classes', schoolOpsAcademicsController.classes);
router.get('/:schoolId/academics/subjects', schoolOpsAcademicsController.subjects);
router.get('/:schoolId/academics/timetable/:classId', schoolOpsAcademicsController.timetable);
router.get('/:schoolId/academics/assignments', schoolOpsAcademicsController.assignments);
router.post('/:schoolId/academics/classes', validateCsrf, validate({ body: createClassSchema }), schoolOpsAcademicsController.createClass);
router.patch('/:schoolId/academics/classes/:id', validateCsrf, validate({ body: updateClassSchema }), schoolOpsAcademicsController.updateClass);

// ─────────────────── Exams ─────────────────────────
router.get('/:schoolId/exams/schedule', schoolOpsExamsController.schedule);
router.get('/:schoolId/exams/gradebook/:examId', schoolOpsExamsController.gradebook);
router.get('/:schoolId/exams/missing', schoolOpsExamsController.missing);
router.get('/:schoolId/exams/results', schoolOpsExamsController.results);
router.post('/:schoolId/exams/schedule', validateCsrf, validate({ body: createExamSchema }), schoolOpsExamsController.create);
router.patch('/:schoolId/exams/gradebook/:id', validateCsrf, validate({ body: updateMarksSchema }), schoolOpsExamsController.updateMarks);

// ─────────────────── Finance Ops ───────────────────
router.get('/:schoolId/finance/invoices', schoolOpsFinanceController.invoices);
router.get('/:schoolId/finance/payments', schoolOpsFinanceController.payments);
router.get('/:schoolId/finance/fees', schoolOpsFinanceController.fees);
router.get('/:schoolId/finance/discounts', schoolOpsFinanceController.discounts);
router.get('/:schoolId/finance/overdue', schoolOpsFinanceController.overdue);
router.post('/:schoolId/finance/invoices', validateCsrf, validate({ body: generateInvoiceSchema }), schoolOpsFinanceController.generateInvoice);
router.post('/:schoolId/finance/payments', validateCsrf, validate({ body: recordPaymentSchema }), schoolOpsFinanceController.recordPayment);

// ─────────────────── Transport ─────────────────────
router.get('/:schoolId/transport/routes', schoolOpsTransportController.routes);
router.get('/:schoolId/transport/vehicles', schoolOpsTransportController.vehicles);
router.get('/:schoolId/transport/assignments', schoolOpsTransportController.assignments);
router.get('/:schoolId/transport/incidents', schoolOpsTransportController.incidents);
router.post('/:schoolId/transport/routes', validateCsrf, validate({ body: createRouteSchema }), schoolOpsTransportController.createRoute);
router.post('/:schoolId/transport/incidents', validateCsrf, validate({ body: reportIncidentSchema }), schoolOpsTransportController.reportIncident);

// ─────────────────── Facilities ────────────────────
router.get('/:schoolId/facilities/rooms', schoolOpsFacilitiesController.rooms);
router.get('/:schoolId/facilities/maintenance', schoolOpsFacilitiesController.maintenance);
router.get('/:schoolId/facilities/assets', schoolOpsFacilitiesController.assets);
router.get('/:schoolId/facilities/bookings', schoolOpsFacilitiesController.bookings);
router.post('/:schoolId/facilities/maintenance', validateCsrf, validate({ body: createMaintenanceRequestSchema }), schoolOpsFacilitiesController.createMaintenanceRequest);
router.post('/:schoolId/facilities/bookings', validateCsrf, validate({ body: bookFacilitySchema }), schoolOpsFacilitiesController.book);

// ─────────────────── Communication ─────────────────
router.get('/:schoolId/communication/messages', schoolOpsCommController.messages);
router.get('/:schoolId/communication/announcements', schoolOpsCommController.announcements);
router.get('/:schoolId/communication/broadcasts', schoolOpsCommController.broadcasts);
router.get('/:schoolId/communication/templates', schoolOpsCommController.templates);
router.get('/:schoolId/communication/logs', schoolOpsCommController.logs);
router.post('/:schoolId/communication/announcements', validateCsrf, validate({ body: createAnnouncementSchema }), schoolOpsCommController.createAnnouncement);
router.post('/:schoolId/communication/broadcasts', validateCsrf, validate({ body: sendBroadcastSchema }), schoolOpsCommController.sendBroadcast);
router.delete('/:schoolId/communication/announcements/:id', validateCsrf, schoolOpsCommController.deleteAnnouncement);

// ─────────────────── Settings ──────────────────────
router.get('/:schoolId/settings/profile', schoolOpsSettingsController.profile);
router.patch('/:schoolId/settings/profile', validateCsrf, validate({ body: saveProfileSchema }), schoolOpsSettingsController.saveProfile);
router.get('/:schoolId/settings/academic', schoolOpsSettingsController.academic);
router.get('/:schoolId/settings/grading', schoolOpsSettingsController.grading);
router.get('/:schoolId/settings/fees', schoolOpsSettingsController.fees);
router.patch('/:schoolId/settings/fees', validateCsrf, validate({ body: saveFeesSchema }), schoolOpsSettingsController.saveFees);
router.get('/:schoolId/settings/roles', schoolOpsSettingsController.roles);

// ─────────────────── Audit ─────────────────────────
router.get('/:schoolId/audit/log', schoolOpsAuditController.log);
router.get('/:schoolId/audit/approvals', schoolOpsAuditController.approvals);
router.get('/:schoolId/audit/compliance', schoolOpsAuditController.compliance);

// ─────────────────── Staff / Leave ─────────────────
router.get('/:schoolId/staff/leave', schoolOpsStaffController.leaveRequests);
router.post('/:schoolId/staff/leave', validateCsrf, validate({ body: submitLeaveSchema }), schoolOpsStaffController.submitLeave);
router.patch('/:schoolId/staff/leave/:id', validateCsrf, validate({ body: approveLeaveSchema }), schoolOpsStaffController.approveLeave);

// ─────────────────── Reports ───────────────────────
router.get('/:schoolId/reports/:type', schoolOpsReportsController.report);

// ─────────────────── Notifications ─────────────────
router.post('/:schoolId/notifications/send', validateCsrf, schoolOpsNotificationsController.send);

// ─────────────────── Exam Reports ──────────────────
router.get('/:schoolId/exams/reports/generate-all', schoolOpsExamReportsController.generateAll);
router.get('/:schoolId/exams/reports/bulk-download', schoolOpsExamReportsController.bulkDownload);
router.get('/:schoolId/exams/reports/:reportId/preview', schoolOpsExamReportsController.preview);
router.get('/:schoolId/exams/reports/:reportId/download', schoolOpsExamReportsController.download);

export default router;
