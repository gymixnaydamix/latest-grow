import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

/* ── hoisted mocks ─────────────────────────────────────────────────── */
const {
  mockCourse, mockAttendance, mockSchool, mockCourseSession, mockAssignment,
  mockExam, mockExamScheduleItem, mockInvoice, mockPayment, mockTuitionPlan,
  mockTransportRoute, mockVehicle, mockTransportAssignment, mockTransportTrackingEvent,
  mockFacility, mockMaintenanceRequest, mockFacilityBooking, mockMessageThread,
  mockAnnouncement, mockAuditLog, mockComplianceReport, mockSchoolMember,
} = vi.hoisted(() => ({
  mockCourse: { findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
  mockAttendance: { findMany: vi.fn(), count: vi.fn(), upsert: vi.fn(), update: vi.fn() },
  mockSchool: { findUnique: vi.fn(), update: vi.fn() },
  mockCourseSession: { findMany: vi.fn() },
  mockAssignment: { findMany: vi.fn() },
  mockExam: { findMany: vi.fn(), create: vi.fn() },
  mockExamScheduleItem: { findMany: vi.fn(), update: vi.fn() },
  mockInvoice: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), aggregate: vi.fn(), count: vi.fn() },
  mockPayment: { findMany: vi.fn(), create: vi.fn() },
  mockTuitionPlan: { findMany: vi.fn() },
  mockTransportRoute: { findMany: vi.fn(), create: vi.fn() },
  mockVehicle: { findMany: vi.fn() },
  mockTransportAssignment: { findMany: vi.fn() },
  mockTransportTrackingEvent: { findMany: vi.fn(), create: vi.fn() },
  mockFacility: { findMany: vi.fn() },
  mockMaintenanceRequest: { findMany: vi.fn(), create: vi.fn() },
  mockFacilityBooking: { findMany: vi.fn(), create: vi.fn() },
  mockMessageThread: { findMany: vi.fn() },
  mockAnnouncement: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
  mockAuditLog: { findMany: vi.fn() },
  mockComplianceReport: { findMany: vi.fn() },
  mockSchoolMember: { findMany: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    course: mockCourse,
    attendance: mockAttendance,
    school: mockSchool,
    courseSession: mockCourseSession,
    assignment: mockAssignment,
    exam: mockExam,
    examScheduleItem: mockExamScheduleItem,
    invoice: mockInvoice,
    payment: mockPayment,
    tuitionPlan: mockTuitionPlan,
    transportRoute: mockTransportRoute,
    vehicle: mockVehicle,
    transportAssignment: mockTransportAssignment,
    transportTrackingEvent: mockTransportTrackingEvent,
    facility: mockFacility,
    maintenanceRequest: mockMaintenanceRequest,
    facilityBooking: mockFacilityBooking,
    messageThread: mockMessageThread,
    announcement: mockAnnouncement,
    auditLog: mockAuditLog,
    complianceReport: mockComplianceReport,
    schoolMember: mockSchoolMember,
  },
}));

vi.mock('../../../utils/errors.js', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return actual;
});

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
} from '../../../api/controllers/school-ops.controller.js';

// ═══════════════════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════

describe('schoolOpsAttendanceController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('overview', () => {
    it('returns attendance overview with calculated rate', async () => {
      mockCourse.findMany.mockResolvedValueOnce([{ id: 'c1' }, { id: 'c2' }]);
      mockAttendance.count
        .mockResolvedValueOnce(100)  // total
        .mockResolvedValueOnce(80)   // present
        .mockResolvedValueOnce(10)   // absent
        .mockResolvedValueOnce(5)    // late
        .mockResolvedValueOnce(5);   // excused

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAttendanceController.overview(req, res, next);

      expect(res._json).toMatchObject({
        success: true,
        data: { total: 100, present: 80, absent: 10, late: 5, excused: 5, rate: 80 },
      });
      expect(mockAttendance.count).toHaveBeenCalledTimes(5);
    });

    it('returns rate 0 when no attendance records', async () => {
      mockCourse.findMany.mockResolvedValueOnce([]);
      mockAttendance.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAttendanceController.overview(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: { rate: 0, total: 0 } });
    });
  });

  describe('daily', () => {
    it('returns daily attendance records', async () => {
      mockCourse.findMany.mockResolvedValueOnce([{ id: 'c1' }]);
      mockAttendance.findMany.mockResolvedValueOnce([{ id: 'a1', status: 'PRESENT' }]);

      const req = mockReq({ params: { schoolId: 's1' } as any, query: { date: '2026-03-01' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAttendanceController.daily(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: [{ id: 'a1' }] });
    });
  });

  describe('mark', () => {
    it('upserts attendance record', async () => {
      const record = { id: 'a1', studentId: 'st1', courseId: 'c1', status: 'PRESENT' };
      mockAttendance.upsert.mockResolvedValueOnce(record);

      const req = mockReq({ body: { studentId: 'st1', courseId: 'c1', status: 'PRESENT' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAttendanceController.mark(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: record });
    });

    it('throws BadRequestError when fields missing', async () => {
      const req = mockReq({ body: { studentId: 'st1' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAttendanceController.mark(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/studentId, courseId, and status are required/);
    });
  });

  describe('approveCorrection', () => {
    it('updates attendance status', async () => {
      const record = { id: 'a1', status: 'EXCUSED' };
      mockAttendance.update.mockResolvedValueOnce(record);

      const req = mockReq({ params: { id: 'a1' } as any, body: { status: 'EXCUSED' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAttendanceController.approveCorrection(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: record });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// ACADEMICS
// ═══════════════════════════════════════════════════════════════════════

describe('schoolOpsAcademicsController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('years', () => {
    it('returns academic years from school settings', async () => {
      const academicYears = [{ year: 2026, label: '2026-2027', isCurrent: true }];
      mockSchool.findUnique.mockResolvedValueOnce({ settings: { academicYears } });

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAcademicsController.years(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: academicYears });
    });

    it('throws NotFoundError when school not found', async () => {
      mockSchool.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { schoolId: 'bad' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAcademicsController.years(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/School not found/);
    });
  });

  describe('classes', () => {
    it('returns courses for school', async () => {
      const courses = [{ id: 'c1', name: 'Math' }];
      mockCourse.findMany.mockResolvedValueOnce(courses);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAcademicsController.classes(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: courses });
    });
  });

  describe('createClass', () => {
    it('creates a class with status 201', async () => {
      const course = { id: 'c1', name: 'Science', schoolId: 's1' };
      mockCourse.create.mockResolvedValueOnce(course);

      const req = mockReq({ params: { schoolId: 's1' } as any, body: { name: 'Science' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAcademicsController.createClass(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: course });
    });

    it('throws BadRequestError when name missing', async () => {
      const req = mockReq({ params: { schoolId: 's1' } as any, body: {} });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAcademicsController.createClass(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/name is required/);
    });
  });

  describe('updateClass', () => {
    it('updates a class', async () => {
      const course = { id: 'c1', name: 'Updated Math' };
      mockCourse.update.mockResolvedValueOnce(course);

      const req = mockReq({ params: { id: 'c1' } as any, body: { name: 'Updated Math' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAcademicsController.updateClass(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: course });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// EXAMS
// ═══════════════════════════════════════════════════════════════════════

describe('schoolOpsExamsController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('schedule', () => {
    it('returns exams for school', async () => {
      const exams = [{ id: 'e1', title: 'Mid-term' }];
      mockExam.findMany.mockResolvedValueOnce(exams);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsExamsController.schedule(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: exams });
    });
  });

  describe('create', () => {
    it('creates an exam with status 201', async () => {
      const exam = { id: 'e1', title: 'Final', subject: 'Math' };
      mockExam.create.mockResolvedValueOnce(exam);

      const req = mockReq({ params: { schoolId: 's1' } as any, body: { title: 'Final', subject: 'Math' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsExamsController.create(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: exam });
    });

    it('throws BadRequestError when title or subject missing', async () => {
      const req = mockReq({ params: { schoolId: 's1' } as any, body: { title: 'Final' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsExamsController.create(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/title and subject are required/);
    });
  });

  describe('updateMarks', () => {
    it('updates exam schedule item', async () => {
      const item = { id: 'i1', note: 'Updated' };
      mockExamScheduleItem.update.mockResolvedValueOnce(item);

      const req = mockReq({ params: { id: 'i1' } as any, body: { note: 'Updated' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsExamsController.updateMarks(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: item });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// FINANCE
// ═══════════════════════════════════════════════════════════════════════

describe('schoolOpsFinanceController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('invoices', () => {
    it('returns invoices for school', async () => {
      const invoices = [{ id: 'inv1', totalAmount: 500 }];
      mockInvoice.findMany.mockResolvedValueOnce(invoices);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFinanceController.invoices(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: invoices });
    });
  });

  describe('discounts', () => {
    it('returns discounts from school settings', async () => {
      const discounts = [{ name: '10% off', value: 0.1 }];
      mockSchool.findUnique.mockResolvedValueOnce({ settings: { discounts } });

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFinanceController.discounts(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: discounts });
    });

    it('throws NotFoundError when school not found', async () => {
      mockSchool.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { schoolId: 'bad' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFinanceController.discounts(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/School not found/);
    });
  });

  describe('generateInvoice', () => {
    it('creates an invoice with status 201', async () => {
      const invoice = { id: 'inv1', totalAmount: 1000 };
      mockInvoice.create.mockResolvedValueOnce(invoice);

      const req = mockReq({
        params: { schoolId: 's1' } as any,
        body: { parentId: 'p1', studentId: 'st1', totalAmount: 1000, dueDate: '2026-04-01' },
      });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFinanceController.generateInvoice(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: invoice });
    });

    it('throws BadRequestError when required fields missing', async () => {
      const req = mockReq({ params: { schoolId: 's1' } as any, body: { parentId: 'p1' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFinanceController.generateInvoice(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/parentId, studentId, totalAmount, and dueDate required/);
    });
  });

  describe('recordPayment', () => {
    it('creates payment and updates invoice with status 201', async () => {
      const payment = { id: 'pay1', amount: 200 };
      mockPayment.create.mockResolvedValueOnce(payment);
      mockInvoice.update.mockResolvedValueOnce({});

      const req = mockReq({
        body: { invoiceId: 'inv1', amount: 200, method: 'CARD' },
      });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFinanceController.recordPayment(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: payment });
      expect(mockInvoice.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'inv1' },
        data: { amountPaid: { increment: 200 } },
      }));
    });

    it('throws BadRequestError when required fields missing', async () => {
      const req = mockReq({ body: { invoiceId: 'inv1' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFinanceController.recordPayment(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/invoiceId, amount, and method are required/);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// TRANSPORT
// ═══════════════════════════════════════════════════════════════════════

describe('schoolOpsTransportController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('routes', () => {
    it('returns transport routes for school', async () => {
      const routes = [{ id: 'r1', name: 'Route A' }];
      mockTransportRoute.findMany.mockResolvedValueOnce(routes);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsTransportController.routes(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: routes });
    });
  });

  describe('vehicles', () => {
    it('returns vehicles for school', async () => {
      const vehicles = [{ id: 'v1', code: 'BUS-01' }];
      mockVehicle.findMany.mockResolvedValueOnce(vehicles);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsTransportController.vehicles(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: vehicles });
    });
  });

  describe('createRoute', () => {
    it('creates a route with status 201', async () => {
      const route = { id: 'r1', name: 'New Route' };
      mockTransportRoute.create.mockResolvedValueOnce(route);

      const req = mockReq({ params: { schoolId: 's1' } as any, body: { name: 'New Route' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsTransportController.createRoute(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: route });
    });

    it('throws BadRequestError when name missing', async () => {
      const req = mockReq({ params: { schoolId: 's1' } as any, body: {} });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsTransportController.createRoute(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/name is required/);
    });
  });

  describe('reportIncident', () => {
    it('creates a tracking event with status 201', async () => {
      const event = { id: 'ev1', status: 'LATE' };
      mockTransportTrackingEvent.create.mockResolvedValueOnce(event);

      const req = mockReq({ body: { assignmentId: 'a1', status: 'LATE' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsTransportController.reportIncident(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: event });
    });

    it('throws BadRequestError when assignmentId or status missing', async () => {
      const req = mockReq({ body: { assignmentId: 'a1' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsTransportController.reportIncident(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/assignmentId and status are required/);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// FACILITIES
// ═══════════════════════════════════════════════════════════════════════

describe('schoolOpsFacilitiesController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('rooms', () => {
    it('returns facilities for school', async () => {
      const facilities = [{ id: 'f1', name: 'Room 101' }];
      mockFacility.findMany.mockResolvedValueOnce(facilities);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFacilitiesController.rooms(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: facilities });
    });
  });

  describe('assets', () => {
    it('returns assets from school settings', async () => {
      const assets = [{ name: 'Projector', qty: 5 }];
      mockSchool.findUnique.mockResolvedValueOnce({ settings: { assets } });

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFacilitiesController.assets(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: assets });
    });

    it('throws NotFoundError when school not found', async () => {
      mockSchool.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { schoolId: 'bad' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFacilitiesController.assets(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/School not found/);
    });
  });

  describe('createMaintenanceRequest', () => {
    it('creates a maintenance request with status 201', async () => {
      const request = { id: 'm1', title: 'Fix AC' };
      mockMaintenanceRequest.create.mockResolvedValueOnce(request);

      const req = mockReq({
        params: { schoolId: 's1' } as any,
        body: { title: 'Fix AC', description: 'AC not working' },
      });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFacilitiesController.createMaintenanceRequest(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: request });
    });

    it('throws BadRequestError when title or description missing', async () => {
      const req = mockReq({ params: { schoolId: 's1' } as any, body: { title: 'Fix AC' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFacilitiesController.createMaintenanceRequest(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/title and description are required/);
    });
  });

  describe('book', () => {
    it('creates a facility booking with status 201', async () => {
      const booking = { id: 'b1', facilityId: 'f1' };
      mockFacilityBooking.create.mockResolvedValueOnce(booking);

      const req = mockReq({
        body: { facilityId: 'f1', startTime: '2026-03-10T08:00:00Z', endTime: '2026-03-10T10:00:00Z' },
      });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFacilitiesController.book(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: booking });
    });

    it('throws BadRequestError when required fields missing', async () => {
      const req = mockReq({ body: { facilityId: 'f1' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsFacilitiesController.book(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/facilityId, startTime, and endTime are required/);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// COMMUNICATION
// ═══════════════════════════════════════════════════════════════════════

describe('schoolOpsCommController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('messages', () => {
    it('returns message threads for school', async () => {
      const threads = [{ id: 't1', subject: 'Hello' }];
      mockMessageThread.findMany.mockResolvedValueOnce(threads);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsCommController.messages(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: threads });
    });
  });

  describe('announcements', () => {
    it('returns announcements for school', async () => {
      const announcements = [{ id: 'an1', title: 'Welcome' }];
      mockAnnouncement.findMany.mockResolvedValueOnce(announcements);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsCommController.announcements(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: announcements });
    });
  });

  describe('createAnnouncement', () => {
    it('creates an announcement with status 201', async () => {
      const announcement = { id: 'an1', title: 'New Policy', body: 'Details...' };
      mockAnnouncement.create.mockResolvedValueOnce(announcement);

      const req = mockReq({
        params: { schoolId: 's1' } as any,
        body: { title: 'New Policy', body: 'Details...' },
      });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsCommController.createAnnouncement(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: announcement });
    });

    it('throws BadRequestError when title or body missing', async () => {
      const req = mockReq({ params: { schoolId: 's1' } as any, body: { title: 'New Policy' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsCommController.createAnnouncement(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/title and body are required/);
    });
  });

  describe('sendBroadcast', () => {
    it('creates a broadcast announcement with status 201', async () => {
      const broadcast = { id: 'an2', title: 'Urgent', body: 'School closed' };
      mockAnnouncement.create.mockResolvedValueOnce(broadcast);

      const req = mockReq({
        params: { schoolId: 's1' } as any,
        body: { title: 'Urgent', body: 'School closed' },
      });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsCommController.sendBroadcast(req, res, next);
      expect(res._status).toBe(201);
      expect(res._json).toMatchObject({ success: true, data: broadcast });
    });

    it('throws BadRequestError when title or body missing', async () => {
      const req = mockReq({ params: { schoolId: 's1' } as any, body: {} });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsCommController.sendBroadcast(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/title and body are required/);
    });
  });

  describe('deleteAnnouncement', () => {
    it('deletes the announcement', async () => {
      mockAnnouncement.delete.mockResolvedValueOnce({});

      const req = mockReq({ params: { id: 'an1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsCommController.deleteAnnouncement(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: null, message: 'Announcement deleted' });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════

describe('schoolOpsSettingsController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('profile', () => {
    it('returns school profile', async () => {
      const school = { id: 's1', name: 'Test School' };
      mockSchool.findUnique.mockResolvedValueOnce(school);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsSettingsController.profile(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: school });
    });

    it('throws NotFoundError when school not found', async () => {
      mockSchool.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { schoolId: 'bad' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsSettingsController.profile(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/School not found/);
    });
  });

  describe('saveProfile', () => {
    it('updates school profile', async () => {
      const school = { id: 's1', name: 'Updated Name' };
      mockSchool.update.mockResolvedValueOnce(school);

      const req = mockReq({ params: { schoolId: 's1' } as any, body: { name: 'Updated Name' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsSettingsController.saveProfile(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: school });
    });
  });

  describe('academic', () => {
    it('returns academic settings', async () => {
      mockSchool.findUnique.mockResolvedValueOnce({ settings: { academic: { terms: 2 } } });

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsSettingsController.academic(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: { terms: 2 } });
    });

    it('throws NotFoundError when school not found', async () => {
      mockSchool.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { schoolId: 'bad' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsSettingsController.academic(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/School not found/);
    });
  });

  describe('saveFees', () => {
    it('updates fee config in school settings', async () => {
      mockSchool.findUnique.mockResolvedValueOnce({ settings: { feeConfig: {} } });
      mockSchool.update.mockResolvedValueOnce({ settings: { feeConfig: { currency: 'EUR' } } });

      const req = mockReq({ params: { schoolId: 's1' } as any, body: { currency: 'EUR' } });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsSettingsController.saveFees(req, res, next);
      expect(res._json).toMatchObject({ success: true });
      expect(mockSchool.update).toHaveBeenCalledTimes(1);
    });

    it('throws NotFoundError when school not found', async () => {
      mockSchool.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { schoolId: 'bad' } as any, body: {} });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsSettingsController.saveFees(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/School not found/);
    });
  });

  describe('roles', () => {
    it('returns school members grouped by role', async () => {
      const members = [
        { role: 'TEACHER', user: { id: 'u1', firstName: 'John' }, joinedAt: new Date() },
        { role: 'ADMIN', user: { id: 'u2', firstName: 'Jane' }, joinedAt: new Date() },
      ];
      mockSchoolMember.findMany.mockResolvedValueOnce(members);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsSettingsController.roles(req, res, next);
      expect((res._json as any)).toMatchObject({ success: true });
      expect((res._json as any).data).toHaveProperty('TEACHER');
      expect((res._json as any).data).toHaveProperty('ADMIN');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// AUDIT
// ═══════════════════════════════════════════════════════════════════════

describe('schoolOpsAuditController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('log', () => {
    it('returns audit logs for school', async () => {
      const logs = [{ id: 'log1', action: 'CREATE' }];
      mockAuditLog.findMany.mockResolvedValueOnce(logs);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAuditController.log(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: logs });
    });
  });

  describe('compliance', () => {
    it('returns compliance reports for school', async () => {
      const reports = [{ id: 'cr1', status: 'PASSED' }];
      mockComplianceReport.findMany.mockResolvedValueOnce(reports);

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsAuditController.compliance(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: reports });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// STAFF / LEAVE
// ═══════════════════════════════════════════════════════════════════════

describe('schoolOpsStaffController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('leaveRequests', () => {
    it('returns leave requests from school settings', async () => {
      const leaves = [{ id: 'l1', status: 'PENDING' }];
      mockSchool.findUnique.mockResolvedValueOnce({ settings: { leaveRequests: leaves } });

      const req = mockReq({ params: { schoolId: 's1' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsStaffController.leaveRequests(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: leaves });
    });

    it('throws NotFoundError when school not found', async () => {
      mockSchool.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { schoolId: 'bad' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsStaffController.leaveRequests(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/School not found/);
    });
  });

  describe('submitLeave', () => {
    it('adds a leave request and returns 201', async () => {
      mockSchool.findUnique.mockResolvedValueOnce({ settings: { leaveRequests: [] } });
      mockSchool.update.mockResolvedValueOnce({});

      const req = mockReq({
        params: { schoolId: 's1' } as any,
        body: { reason: 'Sick', startDate: '2026-03-10', endDate: '2026-03-12' },
      });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsStaffController.submitLeave(req, res, next);
      expect(res._status).toBe(201);
      expect((res._json as any)).toMatchObject({ success: true });
      expect((res._json as any).data).toHaveProperty('id');
      expect((res._json as any).data.status).toBe('PENDING');
    });

    it('throws NotFoundError when school not found', async () => {
      mockSchool.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { schoolId: 'bad' } as any, body: {} });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsStaffController.submitLeave(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/School not found/);
    });
  });

  describe('approveLeave', () => {
    it('approves a leave request', async () => {
      const leaves = [{ id: 'l1', status: 'PENDING' }];
      mockSchool.findUnique.mockResolvedValueOnce({ settings: { leaveRequests: leaves } });
      mockSchool.update.mockResolvedValueOnce({});

      const req = mockReq({
        params: { schoolId: 's1', id: 'l1' } as any,
        body: { status: 'APPROVED' },
      });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsStaffController.approveLeave(req, res, next);
      expect(res._json).toMatchObject({ success: true, data: { id: 'l1', status: 'APPROVED' } });
    });

    it('throws NotFoundError when school not found', async () => {
      mockSchool.findUnique.mockResolvedValueOnce(null);

      const req = mockReq({ params: { schoolId: 'bad', id: 'l1' } as any, body: {} });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsStaffController.approveLeave(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/School not found/);
    });

    it('throws NotFoundError when leave not found', async () => {
      mockSchool.findUnique.mockResolvedValueOnce({ settings: { leaveRequests: [{ id: 'other' }] } });

      const req = mockReq({
        params: { schoolId: 's1', id: 'nonexistent' } as any,
        body: { status: 'APPROVED' },
      });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsStaffController.approveLeave(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as any).mock.calls[0][0];
      expect(err.message).toMatch(/Leave request not found/);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════

describe('schoolOpsReportsController', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('report — enrollment', () => {
    it('returns enrollment report', async () => {
      const courses = [
        { id: 'c1', _count: { enrollments: 25 } },
        { id: 'c2', _count: { enrollments: 30 } },
      ];
      mockCourse.findMany.mockResolvedValueOnce(courses);

      const req = mockReq({ params: { schoolId: 's1', type: 'enrollment' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsReportsController.report(req, res, next);
      expect(res._json).toMatchObject({
        success: true,
        data: { type: 'enrollment', totalCourses: 2, totalEnrollments: 55 },
      });
    });
  });

  describe('report — attendance', () => {
    it('returns attendance report with rate', async () => {
      mockCourse.findMany.mockResolvedValueOnce([{ id: 'c1' }]);
      mockAttendance.count
        .mockResolvedValueOnce(200)  // total
        .mockResolvedValueOnce(180); // present

      const req = mockReq({ params: { schoolId: 's1', type: 'attendance' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsReportsController.report(req, res, next);
      expect(res._json).toMatchObject({
        success: true,
        data: { type: 'attendance', totalRecords: 200, presentCount: 180, rate: 90 },
      });
    });
  });

  describe('report — finance', () => {
    it('returns finance report', async () => {
      mockInvoice.aggregate.mockResolvedValueOnce({
        _sum: { totalAmount: 50000, amountPaid: 35000 },
        _count: 100,
      });
      mockInvoice.count.mockResolvedValueOnce(5);

      const req = mockReq({ params: { schoolId: 's1', type: 'finance' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsReportsController.report(req, res, next);
      expect(res._json).toMatchObject({
        success: true,
        data: {
          type: 'finance',
          totalBilled: 50000,
          totalCollected: 35000,
          invoiceCount: 100,
          overdueCount: 5,
        },
      });
    });
  });

  describe('report — staff', () => {
    it('returns staff report', async () => {
      const members = [
        { role: 'TEACHER', user: { id: 'u1', firstName: 'John' } },
        { role: 'ADMIN', user: { id: 'u2', firstName: 'Jane' } },
      ];
      mockSchoolMember.findMany.mockResolvedValueOnce(members);

      const req = mockReq({ params: { schoolId: 's1', type: 'staff' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsReportsController.report(req, res, next);
      expect(res._json).toMatchObject({
        success: true,
        data: { type: 'staff', totalStaff: 2 },
      });
    });
  });

  describe('report — unknown type', () => {
    it('returns not-yet-implemented message', async () => {
      const req = mockReq({ params: { schoolId: 's1', type: 'xyz' } as any });
      const res = mockRes();
      const next = mockNext();

      await schoolOpsReportsController.report(req, res, next);
      expect(res._json).toMatchObject({
        success: true,
        data: { type: 'xyz', message: 'Report type not yet implemented' },
      });
    });
  });
});
