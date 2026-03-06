export { authController } from './auth.controller.js';
export { schoolController } from './school.controller.js';
export { announcementController } from './announcement.controller.js';
export {
  courseController,
  assignmentController,
  submissionController,
  attendanceController,
  gradebookController,
  enrollmentController,
  sessionController,
  departmentController,
  curriculumController,
  schoolGradebookController,
} from './academic.controller.js';
export {
  tuitionController,
  invoiceController,
  payrollController,
  budgetController,
  grantController,
  expenseController,
  financialReportingController,
} from './finance.controller.js';
export {
  facilityController,
  bookingController,
  policyController,
  eventController,
  goalController,
  complianceController,
  systemPromptController,
  maintenanceController,
} from './operations.controller.js';
export {
  applicantController,
  campaignController,
  staffController,
  studentManagementController,
  schoolUserController,
  parentSchoolController,
} from './admin.controller.js';
export {
  parentController,
  digestController,
  feedbackController,
  volunteerController,
  cafeteriaController,
} from './parent.controller.js';
export { parentV2Controller } from './parent-v2.controller.js';
export { aiController } from './ai.controller.js';
export { messageController } from './message.controller.js';
export { userManagementController } from './user-management.controller.js';
export { transportController } from './transport.controller.js';
export { libraryController } from './library.controller.js';
export {
  tenantController,
  platformPlanController,
  platformInvoiceController,
  paymentGatewayController,
} from './tenant.controller.js';
export { uploadController, uploadMiddleware } from './upload.controller.js';
export {
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
} from './school-ops.controller.js';
