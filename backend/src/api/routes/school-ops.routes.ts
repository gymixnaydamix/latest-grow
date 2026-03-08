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
  schoolOpsDashboardController,
  schoolOpsStaffController,
  schoolOpsReportsController,
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
  saveAcademicSchema,
  flexibleEntitySchema,
  saveFeesSchema,
  submitLeaveSchema,
  approveLeaveSchema,
} from '../schemas/school-ops.schemas.js';

const router: IRouter = Router({ mergeParams: true });
router.use(authenticate);
router.use(authorize('PROVIDER', 'ADMIN'));
router.get('/:schoolId/dashboard/analytics', schoolOpsDashboardController.analytics);
router.get('/:schoolId/dashboard/market', schoolOpsDashboardController.market);
router.get('/:schoolId/dashboard/system', schoolOpsDashboardController.system);

// ─────────────────── Attendance ────────────────────
router.get('/:schoolId/attendance/overview', schoolOpsAttendanceController.overview);
router.get('/:schoolId/attendance/daily', schoolOpsAttendanceController.daily);
router.get('/:schoolId/attendance/exceptions', schoolOpsAttendanceController.exceptions);
router.get('/:schoolId/attendance/corrections', schoolOpsAttendanceController.corrections);
router.get('/:schoolId/attendance/export', schoolOpsAttendanceController.export);
router.post('/:schoolId/attendance/mark', validateCsrf, validate({ body: markAttendanceSchema }), schoolOpsAttendanceController.mark);
router.post('/:schoolId/attendance/corrections', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsAttendanceController.createCorrection);
router.patch('/:schoolId/attendance/corrections/:id', validateCsrf, validate({ body: approveCorrectionSchema }), schoolOpsAttendanceController.approveCorrection);
router.delete('/:schoolId/attendance/:id', validateCsrf, schoolOpsAttendanceController.deleteRecord);
router.delete('/:schoolId/attendance/corrections/:id', validateCsrf, schoolOpsAttendanceController.deleteCorrection);

// ─────────────────── Academics ─────────────────────
router.get('/:schoolId/academics/years', schoolOpsAcademicsController.years);
router.get('/:schoolId/academics/classes', schoolOpsAcademicsController.classes);
router.get('/:schoolId/academics/subjects', schoolOpsAcademicsController.subjects);
router.get('/:schoolId/academics/timetable/:classId', schoolOpsAcademicsController.timetable);
router.get('/:schoolId/academics/assignments', schoolOpsAcademicsController.assignments);
router.get('/:schoolId/academics/promotion', schoolOpsAcademicsController.promotion);
router.post('/:schoolId/academics/years', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsAcademicsController.createYear);
router.patch('/:schoolId/academics/years/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsAcademicsController.updateYear);
router.post('/:schoolId/academics/classes', validateCsrf, validate({ body: createClassSchema }), schoolOpsAcademicsController.createClass);
router.patch('/:schoolId/academics/classes/:id', validateCsrf, validate({ body: updateClassSchema }), schoolOpsAcademicsController.updateClass);
router.delete('/:schoolId/academics/classes/:id', validateCsrf, schoolOpsAcademicsController.deleteClass);
router.post('/:schoolId/academics/subjects', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsAcademicsController.createSubject);
router.patch('/:schoolId/academics/subjects/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsAcademicsController.updateSubject);
router.delete('/:schoolId/academics/subjects/:id', validateCsrf, schoolOpsAcademicsController.deleteSubject);
router.post('/:schoolId/academics/assignments', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsAcademicsController.createTeacherAssignment);
router.patch('/:schoolId/academics/assignments/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsAcademicsController.updateTeacherAssignment);
router.post('/:schoolId/academics/promotion', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsAcademicsController.createPromotionRule);
router.patch('/:schoolId/academics/promotion/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsAcademicsController.updatePromotionRule);

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
router.patch('/:schoolId/finance/invoices/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsFinanceController.updateInvoice);
router.post('/:schoolId/finance/payments', validateCsrf, validate({ body: recordPaymentSchema }), schoolOpsFinanceController.recordPayment);
router.post('/:schoolId/finance/fees', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsFinanceController.createFeeType);
router.patch('/:schoolId/finance/fees/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsFinanceController.updateFeeType);
router.delete('/:schoolId/finance/fees/:id', validateCsrf, schoolOpsFinanceController.deleteFeeType);
router.post('/:schoolId/finance/discounts', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsFinanceController.createDiscount);
router.patch('/:schoolId/finance/discounts/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsFinanceController.updateDiscount);
router.delete('/:schoolId/finance/discounts/:id', validateCsrf, schoolOpsFinanceController.deleteDiscount);

// ─────────────────── Transport ─────────────────────
router.get('/:schoolId/transport/routes', schoolOpsTransportController.routes);
router.get('/:schoolId/transport/vehicles', schoolOpsTransportController.vehicles);
router.get('/:schoolId/transport/assignments', schoolOpsTransportController.assignments);
router.get('/:schoolId/transport/incidents', schoolOpsTransportController.incidents);
router.post('/:schoolId/transport/routes', validateCsrf, validate({ body: createRouteSchema }), schoolOpsTransportController.createRoute);
router.patch('/:schoolId/transport/routes/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsTransportController.updateRoute);
router.delete('/:schoolId/transport/routes/:id', validateCsrf, schoolOpsTransportController.deleteRoute);
router.post('/:schoolId/transport/vehicles', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsTransportController.createVehicle);
router.patch('/:schoolId/transport/vehicles/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsTransportController.updateVehicle);
router.delete('/:schoolId/transport/vehicles/:id', validateCsrf, schoolOpsTransportController.deleteVehicle);
router.patch('/:schoolId/transport/assignments/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsTransportController.updateAssignment);
router.post('/:schoolId/transport/incidents', validateCsrf, validate({ body: reportIncidentSchema }), schoolOpsTransportController.reportIncident);
router.patch('/:schoolId/transport/incidents/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsTransportController.updateIncident);
router.delete('/:schoolId/transport/incidents/:id', validateCsrf, schoolOpsTransportController.deleteIncident);

// ─────────────────── Facilities ────────────────────
router.get('/:schoolId/facilities/rooms', schoolOpsFacilitiesController.rooms);
router.get('/:schoolId/facilities/maintenance', schoolOpsFacilitiesController.maintenance);
router.get('/:schoolId/facilities/assets', schoolOpsFacilitiesController.assets);
router.get('/:schoolId/facilities/bookings', schoolOpsFacilitiesController.bookings);
router.post('/:schoolId/facilities/rooms', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsFacilitiesController.createRoom);
router.patch('/:schoolId/facilities/rooms/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsFacilitiesController.updateRoom);
router.delete('/:schoolId/facilities/rooms/:id', validateCsrf, schoolOpsFacilitiesController.deleteRoom);
router.post('/:schoolId/facilities/maintenance', validateCsrf, validate({ body: createMaintenanceRequestSchema }), schoolOpsFacilitiesController.createMaintenanceRequest);
router.patch('/:schoolId/facilities/maintenance/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsFacilitiesController.updateMaintenanceRequest);
router.delete('/:schoolId/facilities/maintenance/:id', validateCsrf, schoolOpsFacilitiesController.deleteMaintenanceRequest);
router.post('/:schoolId/facilities/assets', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsFacilitiesController.createAsset);
router.patch('/:schoolId/facilities/assets/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsFacilitiesController.updateAsset);
router.delete('/:schoolId/facilities/assets/:id', validateCsrf, schoolOpsFacilitiesController.deleteAsset);
router.post('/:schoolId/facilities/bookings', validateCsrf, validate({ body: bookFacilitySchema }), schoolOpsFacilitiesController.book);
router.patch('/:schoolId/facilities/bookings/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsFacilitiesController.updateBooking);

// ─────────────────── Communication ─────────────────
router.get('/:schoolId/communication/messages', schoolOpsCommController.messages);
router.get('/:schoolId/communication/announcements', schoolOpsCommController.announcements);
router.get('/:schoolId/communication/broadcasts', schoolOpsCommController.broadcasts);
router.get('/:schoolId/communication/templates', schoolOpsCommController.templates);
router.get('/:schoolId/communication/logs', schoolOpsCommController.logs);
router.post('/:schoolId/communication/announcements', validateCsrf, validate({ body: createAnnouncementSchema }), schoolOpsCommController.createAnnouncement);
router.patch('/:schoolId/communication/announcements/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsCommController.updateAnnouncement);
router.post('/:schoolId/communication/broadcasts', validateCsrf, validate({ body: sendBroadcastSchema }), schoolOpsCommController.sendBroadcast);
router.post('/:schoolId/communication/templates', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsCommController.createTemplate);
router.patch('/:schoolId/communication/templates/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsCommController.updateTemplate);
router.delete('/:schoolId/communication/templates/:id', validateCsrf, schoolOpsCommController.deleteTemplate);
router.put('/:schoolId/communication/messages/:id/read', validateCsrf, schoolOpsCommController.markMessageRead);
router.delete('/:schoolId/communication/announcements/:id', validateCsrf, schoolOpsCommController.deleteAnnouncement);

// ─────────────────── Settings ──────────────────────
router.get('/:schoolId/settings/profile', schoolOpsSettingsController.profile);
router.patch('/:schoolId/settings/profile', validateCsrf, validate({ body: saveProfileSchema }), schoolOpsSettingsController.saveProfile);
router.get('/:schoolId/settings/academic', schoolOpsSettingsController.academic);
router.patch('/:schoolId/settings/academic', validateCsrf, validate({ body: saveAcademicSchema }), schoolOpsSettingsController.saveAcademic);
router.get('/:schoolId/settings/grading', schoolOpsSettingsController.grading);
router.post('/:schoolId/settings/grading', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsSettingsController.createGradingScale);
router.get('/:schoolId/settings/fees', schoolOpsSettingsController.fees);
router.patch('/:schoolId/settings/fees', validateCsrf, validate({ body: saveFeesSchema }), schoolOpsSettingsController.saveFees);
router.delete('/:schoolId/settings/fees/:id', validateCsrf, schoolOpsSettingsController.deleteFee);
router.get('/:schoolId/settings/roles', schoolOpsSettingsController.roles);
router.post('/:schoolId/settings/roles', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsSettingsController.createRole);
router.patch('/:schoolId/settings/roles/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsSettingsController.updateRole);

// ─────────────────── Audit ─────────────────────────
router.get('/:schoolId/audit/log', schoolOpsAuditController.log);
router.get('/:schoolId/audit/approvals', schoolOpsAuditController.approvals);
router.get('/:schoolId/audit/compliance', schoolOpsAuditController.compliance);
router.post('/:schoolId/audit/compliance', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsAuditController.createCompliance);
router.patch('/:schoolId/audit/compliance/:id', validateCsrf, validate({ body: flexibleEntitySchema }), schoolOpsAuditController.updateCompliance);
router.delete('/:schoolId/audit/compliance/:id', validateCsrf, schoolOpsAuditController.deleteCompliance);

// ─────────────────── Staff / Leave ─────────────────
router.get('/:schoolId/staff/leave', schoolOpsStaffController.leaveRequests);
router.post('/:schoolId/staff/leave', validateCsrf, validate({ body: submitLeaveSchema }), schoolOpsStaffController.submitLeave);
router.patch('/:schoolId/staff/leave/:id', validateCsrf, validate({ body: approveLeaveSchema }), schoolOpsStaffController.approveLeave);

// ─────────────────── Reports ───────────────────────
router.get('/:schoolId/reports/:type', schoolOpsReportsController.report);

export default router;
