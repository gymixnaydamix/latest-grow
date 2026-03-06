import { describe, it, expect, beforeEach, vi } from 'vitest';

/* ── hoisted mocks ─────────────────────────────────────────────────── */
const { prismaMock, stripeMock } = vi.hoisted(() => {
  const prismaMock: any = {
    user: { findUnique: vi.fn(), findMany: vi.fn() },
    parentChild: { findMany: vi.fn() },
    schoolMember: { findFirst: vi.fn() },
    notification: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
    courseEnrollment: { findMany: vi.fn() },
    exam: { findMany: vi.fn(), findUnique: vi.fn() },
    examScheduleItem: { findMany: vi.fn() },
    grade: { findMany: vi.fn() },
    attendance: { findMany: vi.fn(), count: vi.fn() },
    invoice: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    payment: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    receipt: { findMany: vi.fn(), create: vi.fn() },
    approvalRequest: { findMany: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    messageThread: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    message: { create: vi.fn() },
    announcement: { findMany: vi.fn() },
    parentAnnouncementState: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
    transportAssignment: { findMany: vi.fn() },
    parentDocument: { findMany: vi.fn() },
    schoolEvent: { findMany: vi.fn() },
    parentEventRsvp: { findMany: vi.fn(), upsert: vi.fn() },
    parentPreference: { findUnique: vi.fn(), upsert: vi.fn() },
    supportTicket: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    supportTicketReply: { create: vi.fn() },
    parentWorkspaceItem: { findMany: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    consentForm: { findMany: vi.fn() },
    stripeWebhookEvent: { findUnique: vi.fn(), create: vi.fn() },
    $transaction: vi.fn((fn: any) => fn(prismaMock)),
  };
  const stripeMock = {
    createCheckoutSession: vi.fn(),
    constructWebhookEvent: vi.fn(),
  };
  return { prismaMock, stripeMock };
});

/* ── mock modules ──────────────────────────────────────────────────── */
vi.mock('../../../db/prisma.service.js', () => ({
  prisma: prismaMock,
}));

vi.mock('../../../services/stripe.service.js', () => ({
  stripeService: stripeMock,
}));

/* ── import controller AFTER mocks ─────────────────────────────────── */
import { parentV2Controller as ctrl } from '../../../api/controllers/parent-v2.controller.js';

/* ── helpers ────────────────────────────────────────────────────────── */
function mockReq(overrides: Record<string, any> = {}) {
  return {
    user: { userId: 'parent-1', role: 'PARENT' },
    params: {},
    query: {},
    body: {},
    headers: {},
    parentScopeChildIds: ['child-1'],
    ...overrides,
  } as any;
}

function mockRes() {
  const res: any = { _status: 200, _json: null, _cookies: [] };
  res.status = (code: number) => { res._status = code; return res; };
  res.json = (data: any) => { res._json = data; return res; };
  res.cookie = (...args: any[]) => { res._cookies.push(args); return res; };
  return res;
}

function mockNext() { return vi.fn(); }

/* ── reset ─────────────────────────────────────────────────────────── */
beforeEach(() => {
  vi.clearAllMocks();
  // default: getSchoolId returns a schoolId
  prismaMock.schoolMember.findFirst.mockResolvedValue({ schoolId: 'school-1' });
});

/* ================================================================== */
/*  TESTS                                                              */
/* ================================================================== */

/* ─── 1. home ──────────────────────────────────────────────────────── */
describe('home', () => {
  it('should aggregate dashboard data and return success', async () => {
    // refreshInvoices mocks
    prismaMock.invoice.findMany
      .mockResolvedValueOnce([]) // refreshInvoices
      .mockResolvedValueOnce([{ id: 'inv-1', status: 'ISSUED', studentId: 'child-1', dueDate: new Date() }]); // home invoices
    prismaMock.user.findMany.mockResolvedValueOnce([{ id: 'child-1', firstName: 'A', lastName: 'B', email: 'a@b.com' }]);
    prismaMock.approvalRequest.findMany.mockResolvedValueOnce([]);
    prismaMock.messageThread.findMany.mockResolvedValueOnce([]);
    prismaMock.schoolEvent.findMany.mockResolvedValueOnce([]);
    prismaMock.announcement.findMany.mockResolvedValueOnce([]);
    prismaMock.courseEnrollment.findMany.mockResolvedValueOnce([]);

    const req = mockReq();
    const res = mockRes();
    const next = mockNext();
    await ctrl.home(req, res, next);

    expect(res._json.success).toBe(true);
    expect(res._json.data).toHaveProperty('children');
    expect(res._json.data).toHaveProperty('actionRequired');
    expect(res._json.data).toHaveProperty('invoices');
    expect(res._json.data).toHaveProperty('todayTimetable');
    expect(next).not.toHaveBeenCalled();
  });

  it('should include action-required items for overdue invoices', async () => {
    const overdue = { id: 'inv-2', status: 'OVERDUE', studentId: 'child-1', dueDate: new Date('2025-01-01'), totalAmount: 100, amountPaid: 0 };
    prismaMock.invoice.findMany
      .mockResolvedValueOnce([overdue]) // refreshInvoices — already OVERDUE → no-op
      .mockResolvedValueOnce([overdue]);
    prismaMock.user.findMany.mockResolvedValueOnce([]);
    prismaMock.approvalRequest.findMany.mockResolvedValueOnce([]);
    prismaMock.messageThread.findMany.mockResolvedValueOnce([]);
    prismaMock.schoolEvent.findMany.mockResolvedValueOnce([]);
    prismaMock.announcement.findMany.mockResolvedValueOnce([]);
    prismaMock.courseEnrollment.findMany.mockResolvedValueOnce([]);

    const res = mockRes();
    await ctrl.home(mockReq(), res, mockNext());

    const actions = res._json.data.actionRequired;
    expect(actions.length).toBeGreaterThanOrEqual(1);
    expect(actions[0].priority).toBe('HIGH');
  });
});

/* ─── 2. listChildren ──────────────────────────────────────────────── */
describe('listChildren', () => {
  it('should return scoped children', async () => {
    prismaMock.user.findMany.mockResolvedValueOnce([{ id: 'child-1', firstName: 'C', lastName: 'D', email: 'c@d.com', avatar: null }]);
    const res = mockRes();
    await ctrl.listChildren(mockReq(), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [{ id: 'child-1', firstName: 'C', lastName: 'D', email: 'c@d.com', avatar: null }] });
  });
});

/* ─── 3. childDetail ───────────────────────────────────────────────── */
describe('childDetail', () => {
  it('should return child profile + grades + attendance + invoices', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'child-1', firstName: 'A', lastName: 'B', email: 'a@b.com' });
    prismaMock.grade.findMany.mockResolvedValueOnce([]);
    prismaMock.attendance.findMany.mockResolvedValueOnce([]);
    prismaMock.invoice.findMany.mockResolvedValueOnce([]);

    const res = mockRes();
    await ctrl.childDetail(mockReq({ params: { childId: 'child-1' } }), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data).toHaveProperty('profile');
    expect(res._json.data).toHaveProperty('grades');
    expect(res._json.data).toHaveProperty('attendance');
    expect(res._json.data).toHaveProperty('invoices');
  });

  it('should call next with error when childId is missing', async () => {
    const next = mockNext();
    await ctrl.childDetail(mockReq({ params: {} }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'childId is required' }));
  });

  it('should call next with error when child not linked', async () => {
    const next = mockNext();
    await ctrl.childDetail(mockReq({ params: { childId: 'unlinked' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Parent cannot access this child' }));
  });
});

/* ─── 4. timetable ─────────────────────────────────────────────────── */
describe('timetable', () => {
  it('should return flattened timetable sessions', async () => {
    prismaMock.courseEnrollment.findMany.mockResolvedValueOnce([
      {
        id: 'enrol-1',
        studentId: 'child-1',
        course: {
          name: 'Math',
          teacherId: 'teacher-1',
          sessions: [{ id: 'ses-1', dayOfWeek: 1, startTime: '08:00', endTime: '09:00', room: 'R1', notes: '' }],
        },
      },
    ]);
    const res = mockRes();
    await ctrl.timetable(mockReq(), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data).toHaveLength(1);
    expect(res._json.data[0].subject).toBe('Math');
  });
});

/* ─── 5. assignments ───────────────────────────────────────────────── */
describe('assignments', () => {
  it('should return assignments with status', async () => {
    prismaMock.courseEnrollment.findMany.mockResolvedValueOnce([
      {
        studentId: 'child-1',
        course: {
          name: 'Science',
          assignments: [
            { id: 'a1', title: 'Lab Report', dueDate: new Date('2030-01-01'), description: 'Write lab report', submissions: [] },
          ],
        },
      },
    ]);
    const res = mockRes();
    await ctrl.assignments(mockReq(), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data[0].status).toBe('NOT_STARTED');
  });

  it('should mark submitted assignment as SUBMITTED', async () => {
    prismaMock.courseEnrollment.findMany.mockResolvedValueOnce([
      {
        studentId: 'child-1',
        course: {
          name: 'Science',
          assignments: [
            { id: 'a2', title: 'Lab', dueDate: new Date('2030-01-01'), description: '', submissions: [{ studentId: 'child-1', score: null }] },
          ],
        },
      },
    ]);
    const res = mockRes();
    await ctrl.assignments(mockReq(), res, mockNext());
    expect(res._json.data[0].status).toBe('SUBMITTED');
  });
});

/* ─── 6. exams ─────────────────────────────────────────────────────── */
describe('exams', () => {
  it('should return scheduled exam items', async () => {
    prismaMock.examScheduleItem.findMany.mockResolvedValueOnce([
      { id: 'esi-1', studentId: 'child-1', examId: 'exam-1', date: '2026-04-01', startTime: '09:00', endTime: '10:00', room: 'R2' },
    ]);
    prismaMock.exam.findUnique.mockResolvedValueOnce({ id: 'exam-1', subject: 'Math', title: 'Midterm', status: 'UPCOMING' });

    const res = mockRes();
    await ctrl.exams(mockReq(), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data[0].subject).toBe('Math');
    expect(res._json.data[0].title).toBe('Midterm');
  });
});

/* ─── 7. grades ────────────────────────────────────────────────────── */
describe('grades', () => {
  it('should return formatted grade records', async () => {
    prismaMock.grade.findMany.mockResolvedValueOnce([
      {
        id: 'g1', studentId: 'child-1', score: 95, gradedAt: new Date(),
        course: { name: 'History' },
        assignment: { title: 'Essay', maxScore: 100 },
      },
    ]);
    const res = mockRes();
    await ctrl.grades(mockReq(), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data[0].score).toBe(95);
    expect(res._json.data[0].subject).toBe('History');
  });
});

/* ─── 8. attendance ────────────────────────────────────────────────── */
describe('attendance', () => {
  it('should return attendance records', async () => {
    prismaMock.attendance.findMany.mockResolvedValueOnce([
      { id: 'att-1', studentId: 'child-1', date: '2026-03-01', status: 'PRESENT' },
    ]);
    const res = mockRes();
    await ctrl.attendance(mockReq(), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data[0].status).toBe('PRESENT');
  });

  it('should add note for absent records', async () => {
    prismaMock.attendance.findMany.mockResolvedValueOnce([
      { id: 'att-2', studentId: 'child-1', date: '2026-03-01', status: 'ABSENT' },
    ]);
    const res = mockRes();
    await ctrl.attendance(mockReq(), res, mockNext());
    expect(res._json.data[0].note).toBe('No explanation submitted yet.');
  });
});

/* ─── 9. explainAbsence ────────────────────────────────────────────── */
describe('explainAbsence', () => {
  it('should create notification for absence explanation', async () => {
    prismaMock.notification.create.mockResolvedValueOnce({ id: 'notif-1' });
    const req = mockReq({ params: { childId: 'child-1' }, body: { note: 'Child was sick' } });
    const res = mockRes();
    await ctrl.explainAbsence(req, res, mockNext());
    expect(res._status).toBe(201);
    expect(res._json.success).toBe(true);
    expect(res._json.data.childId).toBe('child-1');
    expect(prismaMock.notification.create).toHaveBeenCalled();
  });

  it('should error when childId is missing', async () => {
    const next = mockNext();
    await ctrl.explainAbsence(mockReq({ body: { note: 'Sick' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'childId is required' }));
  });

  it('should error when note is too short', async () => {
    const next = mockNext();
    await ctrl.explainAbsence(mockReq({ params: { childId: 'child-1' }, body: { note: 'ab' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'note must be at least 4 characters' }));
  });

  it('should error when child not linked', async () => {
    const next = mockNext();
    await ctrl.explainAbsence(mockReq({ params: { childId: 'unlinked' }, body: { note: 'Child was sick' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Parent cannot access this child' }));
  });
});

/* ─── 10. listMessageThreads ──────────────────────────────────────── */
describe('listMessageThreads', () => {
  it('should return formatted threads', async () => {
    prismaMock.messageThread.findMany.mockResolvedValueOnce([
      { id: 't1', subject: 'Question', lastMessageAt: new Date(), messages: [{ body: 'Hello', readAt: null }] },
    ]);
    const res = mockRes();
    await ctrl.listMessageThreads(mockReq(), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data[0].unreadCount).toBe(1);
  });
});

/* ─── 11. messageThreadDetail ─────────────────────────────────────── */
describe('messageThreadDetail', () => {
  it('should return thread with messages', async () => {
    prismaMock.messageThread.findUnique
      .mockResolvedValueOnce({ id: 't1', participantIds: ['parent-1'] }) // ensureThreadOwner
      .mockResolvedValueOnce({ id: 't1', subject: 'Q', messages: [] }); // main query
    const res = mockRes();
    await ctrl.messageThreadDetail(mockReq({ params: { threadId: 't1' } }), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data.id).toBe('t1');
  });

  it('should error when threadId is missing', async () => {
    const next = mockNext();
    await ctrl.messageThreadDetail(mockReq(), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'threadId is required' }));
  });

  it('should error when thread not found (ensureThreadOwner)', async () => {
    prismaMock.messageThread.findUnique.mockResolvedValueOnce(null);
    const next = mockNext();
    await ctrl.messageThreadDetail(mockReq({ params: { threadId: 'bad' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Message thread not found' }));
  });

  it('should error when parent not participant', async () => {
    prismaMock.messageThread.findUnique.mockResolvedValueOnce({ id: 't1', participantIds: ['other-user'] });
    const next = mockNext();
    await ctrl.messageThreadDetail(mockReq({ params: { threadId: 't1' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Thread access denied' }));
  });
});

/* ─── 12. postMessage ──────────────────────────────────────────────── */
describe('postMessage', () => {
  it('should create message in thread', async () => {
    prismaMock.messageThread.findUnique.mockResolvedValueOnce({ id: 't1', participantIds: ['parent-1'] });
    prismaMock.message.create.mockResolvedValueOnce({ id: 'msg-1', threadId: 't1', senderId: 'parent-1', body: 'Hi' });
    prismaMock.messageThread.update.mockResolvedValueOnce({});

    const req = mockReq({ params: { threadId: 't1' }, body: { body: 'Hi' } });
    const res = mockRes();
    await ctrl.postMessage(req, res, mockNext());
    expect(res._status).toBe(201);
    expect(res._json.success).toBe(true);
    expect(res._json.data.id).toBe('msg-1');
  });

  it('should error when threadId or body missing', async () => {
    const next = mockNext();
    await ctrl.postMessage(mockReq({ params: {}, body: {} }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'threadId and body are required' }));
  });

  it('should error when body missing', async () => {
    const next = mockNext();
    await ctrl.postMessage(mockReq({ params: { threadId: 't1' }, body: {} }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'threadId and body are required' }));
  });
});

/* ─── 13. announcements ───────────────────────────────────────────── */
describe('announcements', () => {
  it('should return formatted announcements with read/saved state', async () => {
    prismaMock.announcement.findMany.mockResolvedValueOnce([
      { id: 'ann-1', title: 'News', body: 'Something urgent happened', createdAt: new Date() },
    ]);
    prismaMock.parentAnnouncementState.findMany.mockResolvedValueOnce([
      { announcementId: 'ann-1', readAt: new Date(), saved: true },
    ]);
    const res = mockRes();
    await ctrl.announcements(mockReq(), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data[0].read).toBe(true);
    expect(res._json.data[0].saved).toBe(true);
    expect(res._json.data[0].category).toBe('URGENT');
  });

  it('should return empty array if no schoolId', async () => {
    prismaMock.schoolMember.findFirst.mockResolvedValueOnce(null);
    const res = mockRes();
    await ctrl.announcements(mockReq(), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [] });
  });
});

/* ─── 14. markAnnouncementRead ─────────────────────────────────────── */
describe('markAnnouncementRead', () => {
  it('should upsert read state', async () => {
    prismaMock.parentAnnouncementState.upsert.mockResolvedValueOnce({ parentId: 'parent-1', announcementId: 'ann-1', readAt: new Date(), saved: false });
    const res = mockRes();
    await ctrl.markAnnouncementRead(mockReq({ params: { announcementId: 'ann-1' } }), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(prismaMock.parentAnnouncementState.upsert).toHaveBeenCalled();
  });

  it('should error when announcementId is missing', async () => {
    const next = mockNext();
    await ctrl.markAnnouncementRead(mockReq(), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'announcementId is required' }));
  });
});

/* ─── 15. saveAnnouncement ─────────────────────────────────────────── */
describe('saveAnnouncement', () => {
  it('should toggle saved from false to true', async () => {
    prismaMock.parentAnnouncementState.findUnique.mockResolvedValueOnce({ saved: false, readAt: null });
    prismaMock.parentAnnouncementState.upsert.mockResolvedValueOnce({ saved: true });
    const res = mockRes();
    await ctrl.saveAnnouncement(mockReq({ params: { announcementId: 'ann-1' } }), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data.saved).toBe(true);
  });

  it('should toggle saved from true to false', async () => {
    prismaMock.parentAnnouncementState.findUnique.mockResolvedValueOnce({ saved: true, readAt: new Date() });
    prismaMock.parentAnnouncementState.upsert.mockResolvedValueOnce({ saved: false });
    const res = mockRes();
    await ctrl.saveAnnouncement(mockReq({ params: { announcementId: 'ann-1' } }), res, mockNext());
    expect(res._json.data.saved).toBe(false);
  });

  it('should error when announcementId is missing', async () => {
    const next = mockNext();
    await ctrl.saveAnnouncement(mockReq(), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'announcementId is required' }));
  });
});

/* ─── 16. invoices ─────────────────────────────────────────────────── */
describe('invoices', () => {
  it('should refresh invoices then return list', async () => {
    prismaMock.invoice.findMany
      .mockResolvedValueOnce([]) // refreshInvoices
      .mockResolvedValueOnce([{ id: 'inv-1', status: 'ISSUED' }]); // actual query
    const res = mockRes();
    await ctrl.invoices(mockReq(), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data).toHaveLength(1);
  });

  it('should pass status filter if provided', async () => {
    prismaMock.invoice.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const res = mockRes();
    await ctrl.invoices(mockReq({ query: { status: 'PAID' } }), res, mockNext());
    expect(prismaMock.invoice.findMany).toHaveBeenCalledTimes(2);
    expect(prismaMock.invoice.findMany.mock.calls[1][0].where).toHaveProperty('status', 'PAID');
  });
});

/* ─── 17. invoiceDetail ────────────────────────────────────────────── */
describe('invoiceDetail', () => {
  it('should return invoice with payments and receipts', async () => {
    prismaMock.invoice.findFirst.mockResolvedValueOnce({ id: 'inv-1', parentId: 'parent-1' });
    prismaMock.payment.findMany.mockResolvedValueOnce([{ id: 'pay-1' }]);
    prismaMock.receipt.findMany.mockResolvedValueOnce([{ id: 'rec-1' }]);
    const res = mockRes();
    await ctrl.invoiceDetail(mockReq({ params: { invoiceId: 'inv-1' } }), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data.payments).toHaveLength(1);
    expect(res._json.data.receipts).toHaveLength(1);
  });

  it('should error when invoiceId is missing', async () => {
    const next = mockNext();
    await ctrl.invoiceDetail(mockReq(), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'invoiceId is required' }));
  });

  it('should error when invoice not found', async () => {
    prismaMock.invoice.findFirst.mockResolvedValueOnce(null);
    const next = mockNext();
    await ctrl.invoiceDetail(mockReq({ params: { invoiceId: 'bad' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invoice not found' }));
  });
});

/* ─── 18. createCheckoutSession ────────────────────────────────────── */
describe('createCheckoutSession', () => {
  it('should create a Stripe checkout session', async () => {
    prismaMock.invoice.findFirst.mockResolvedValueOnce({ id: 'inv-1', parentId: 'parent-1', totalAmount: 200, amountPaid: 50, currency: 'USD', status: 'ISSUED', studentId: 'child-1' });
    prismaMock.user.findUnique.mockResolvedValueOnce({ email: 'parent@test.com' });
    stripeMock.createCheckoutSession.mockResolvedValueOnce({ id: 'cs_123', url: 'https://checkout.stripe.com/cs_123' });

    const res = mockRes();
    await ctrl.createCheckoutSession(mockReq({ params: { invoiceId: 'inv-1' } }), res, mockNext());
    expect(res._status).toBe(201);
    expect(res._json.data.sessionId).toBe('cs_123');
    expect(stripeMock.createCheckoutSession).toHaveBeenCalledWith(expect.objectContaining({ amount: 150 }));
  });

  it('should error when invoiceId is missing', async () => {
    const next = mockNext();
    await ctrl.createCheckoutSession(mockReq(), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'invoiceId is required' }));
  });

  it('should error when invoice not found', async () => {
    prismaMock.invoice.findFirst.mockResolvedValueOnce(null);
    const next = mockNext();
    await ctrl.createCheckoutSession(mockReq({ params: { invoiceId: 'bad' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invoice not found' }));
  });

  it('should error when invoice is PAID', async () => {
    prismaMock.invoice.findFirst.mockResolvedValueOnce({ id: 'inv-1', status: 'PAID', totalAmount: 100, amountPaid: 100 });
    const next = mockNext();
    await ctrl.createCheckoutSession(mockReq({ params: { invoiceId: 'inv-1' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invoice cannot be paid in this status' }));
  });

  it('should error when invoice is CANCELLED', async () => {
    prismaMock.invoice.findFirst.mockResolvedValueOnce({ id: 'inv-1', status: 'CANCELLED', totalAmount: 100, amountPaid: 0 });
    const next = mockNext();
    await ctrl.createCheckoutSession(mockReq({ params: { invoiceId: 'inv-1' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invoice cannot be paid in this status' }));
  });

  it('should error when remaining is 0', async () => {
    prismaMock.invoice.findFirst.mockResolvedValueOnce({ id: 'inv-1', status: 'ISSUED', totalAmount: 100, amountPaid: 100 });
    const next = mockNext();
    await ctrl.createCheckoutSession(mockReq({ params: { invoiceId: 'inv-1' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invoice is already fully paid' }));
  });
});

/* ─── 19. payments ─────────────────────────────────────────────────── */
describe('payments', () => {
  it('should return payments for parent + children', async () => {
    prismaMock.payment.findMany.mockResolvedValueOnce([{ id: 'pay-1' }]);
    const res = mockRes();
    await ctrl.payments(mockReq(), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [{ id: 'pay-1' }] });
  });
});

/* ─── 20. receipts ─────────────────────────────────────────────────── */
describe('receipts', () => {
  it('should return receipts for parent + children', async () => {
    prismaMock.receipt.findMany.mockResolvedValueOnce([{ id: 'rec-1' }]);
    const res = mockRes();
    await ctrl.receipts(mockReq(), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [{ id: 'rec-1' }] });
  });
});

/* ─── 21. approvals ────────────────────────────────────────────────── */
describe('approvals', () => {
  it('should return approval requests', async () => {
    prismaMock.approvalRequest.findMany.mockResolvedValueOnce([{ id: 'ar-1', status: 'PENDING' }]);
    const res = mockRes();
    await ctrl.approvals(mockReq(), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [{ id: 'ar-1', status: 'PENDING' }] });
  });

  it('should filter by status query param', async () => {
    prismaMock.approvalRequest.findMany.mockResolvedValueOnce([]);
    const res = mockRes();
    await ctrl.approvals(mockReq({ query: { status: 'APPROVED' } }), res, mockNext());
    expect(prismaMock.approvalRequest.findMany.mock.calls[0][0].where).toHaveProperty('status', 'APPROVED');
  });
});

/* ─── 22. decideApproval ───────────────────────────────────────────── */
describe('decideApproval', () => {
  it('should approve a request', async () => {
    prismaMock.approvalRequest.findFirst.mockResolvedValueOnce({ id: 'ar-1', parentId: 'parent-1' });
    prismaMock.approvalRequest.update.mockResolvedValueOnce({ id: 'ar-1', status: 'APPROVED' });
    const req = mockReq({ params: { approvalRequestId: 'ar-1' }, body: { decision: 'approved', note: 'OK' } });
    const res = mockRes();
    await ctrl.decideApproval(req, res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data.status).toBe('APPROVED');
  });

  it('should reject a request', async () => {
    prismaMock.approvalRequest.findFirst.mockResolvedValueOnce({ id: 'ar-1', parentId: 'parent-1' });
    prismaMock.approvalRequest.update.mockResolvedValueOnce({ id: 'ar-1', status: 'REJECTED' });
    const req = mockReq({ params: { approvalRequestId: 'ar-1' }, body: { decision: 'rejected' } });
    const res = mockRes();
    await ctrl.decideApproval(req, res, mockNext());
    expect(res._json.data.status).toBe('REJECTED');
  });

  it('should error when decision is invalid', async () => {
    const next = mockNext();
    await ctrl.decideApproval(mockReq({ params: { approvalRequestId: 'ar-1' }, body: { decision: 'maybe' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'approvalRequestId and valid decision are required' }));
  });

  it('should error when approvalRequestId missing', async () => {
    const next = mockNext();
    await ctrl.decideApproval(mockReq({ body: { decision: 'approved' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'approvalRequestId and valid decision are required' }));
  });

  it('should error when approval not found', async () => {
    prismaMock.approvalRequest.findFirst.mockResolvedValueOnce(null);
    const next = mockNext();
    await ctrl.decideApproval(mockReq({ params: { approvalRequestId: 'bad' }, body: { decision: 'approved' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Approval request not found' }));
  });
});

/* ─── 23. transport ────────────────────────────────────────────────── */
describe('transport', () => {
  it('should return formatted transport assignments', async () => {
    prismaMock.transportAssignment.findMany.mockResolvedValueOnce([
      {
        id: 'ta-1',
        userId: 'child-1',
        notes: 'Regular bus',
        route: { name: 'Route A', vehicleNumber: 'BUS-01', driverName: 'John' },
        stop: { name: 'Stop 1', scheduledTime: '07:30' },
        events: [{ status: 'ON_TIME', note: 'Running well' }],
      },
    ]);
    const res = mockRes();
    await ctrl.transport(mockReq(), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data[0].routeName).toBe('Route A');
    expect(res._json.data[0].vehicle).toBe('BUS-01');
  });
});

/* ─── 24. documents ────────────────────────────────────────────────── */
describe('documents', () => {
  it('should return parent documents', async () => {
    prismaMock.parentDocument.findMany.mockResolvedValueOnce([{ id: 'doc-1' }]);
    const res = mockRes();
    await ctrl.documents(mockReq(), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [{ id: 'doc-1' }] });
  });
});

/* ─── 25. events ───────────────────────────────────────────────────── */
describe('events', () => {
  it('should return events with RSVP status', async () => {
    prismaMock.schoolEvent.findMany.mockResolvedValueOnce([
      { id: 'ev-1', title: 'Open Day', type: 'EVENT', startDate: new Date() },
    ]);
    prismaMock.parentEventRsvp.findMany.mockResolvedValueOnce([
      { eventId: 'ev-1', status: 'GOING' },
    ]);
    const res = mockRes();
    await ctrl.events(mockReq(), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data[0].rsvpStatus).toBe('GOING');
  });

  it('should default to PENDING when no RSVP', async () => {
    prismaMock.schoolEvent.findMany.mockResolvedValueOnce([
      { id: 'ev-2', title: 'Fair', type: 'EVENT', startDate: new Date() },
    ]);
    prismaMock.parentEventRsvp.findMany.mockResolvedValueOnce([]);
    const res = mockRes();
    await ctrl.events(mockReq(), res, mockNext());
    expect(res._json.data[0].rsvpStatus).toBe('PENDING');
  });

  it('should return empty if no schoolId', async () => {
    prismaMock.schoolMember.findFirst.mockResolvedValueOnce(null);
    const res = mockRes();
    await ctrl.events(mockReq(), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [] });
  });
});

/* ─── 26. rsvpEvent ────────────────────────────────────────────────── */
describe('rsvpEvent', () => {
  it('should upsert RSVP with GOING', async () => {
    prismaMock.parentEventRsvp.upsert.mockResolvedValueOnce({ parentId: 'parent-1', eventId: 'ev-1', status: 'GOING' });
    const req = mockReq({ params: { eventId: 'ev-1' }, body: { status: 'going' } });
    const res = mockRes();
    await ctrl.rsvpEvent(req, res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data.status).toBe('GOING');
  });

  it('should upsert RSVP with NOT_GOING', async () => {
    prismaMock.parentEventRsvp.upsert.mockResolvedValueOnce({ parentId: 'parent-1', eventId: 'ev-1', status: 'NOT_GOING' });
    const req = mockReq({ params: { eventId: 'ev-1' }, body: { status: 'not_going' } });
    const res = mockRes();
    await ctrl.rsvpEvent(req, res, mockNext());
    expect(res._json.data.status).toBe('NOT_GOING');
  });

  it('should error when eventId or status invalid', async () => {
    const next = mockNext();
    await ctrl.rsvpEvent(mockReq({ params: {}, body: { status: 'maybe' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'eventId and valid status are required' }));
  });
});

/* ─── 27. profile ──────────────────────────────────────────────────── */
describe('profile', () => {
  it('should return user profile with preferences and children', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'parent-1', email: 'p@t.com', firstName: 'P', lastName: 'T' });
    prismaMock.parentPreference.findUnique.mockResolvedValueOnce({ contactPhone: '555', locale: 'en', theme: 'dark', preferences: {} });
    prismaMock.parentChild.findMany.mockResolvedValueOnce([
      { student: { id: 'child-1', firstName: 'C', lastName: 'D', email: 'c@d.com' } },
    ]);
    const res = mockRes();
    await ctrl.profile(mockReq(), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data.phone).toBe('555');
    expect(res._json.data.linkedChildren).toHaveLength(1);
  });

  it('should error when user not found', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.parentPreference.findUnique.mockResolvedValueOnce(null);
    prismaMock.parentChild.findMany.mockResolvedValueOnce([]);
    const next = mockNext();
    await ctrl.profile(mockReq(), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Profile not found' }));
  });
});

/* ─── 28. updateProfilePreferences ─────────────────────────────────── */
describe('updateProfilePreferences', () => {
  it('should upsert preferences', async () => {
    prismaMock.parentPreference.upsert.mockResolvedValueOnce({ parentId: 'parent-1', locale: 'fr', theme: 'dark' });
    const req = mockReq({ body: { locale: 'fr', theme: 'dark', phone: '555', email: 'p@t.com' } });
    const res = mockRes();
    await ctrl.updateProfilePreferences(req, res, mockNext());
    expect(res._json.success).toBe(true);
    expect(prismaMock.parentPreference.upsert).toHaveBeenCalled();
  });
});

/* ─── 29. supportTickets ───────────────────────────────────────────── */
describe('supportTickets', () => {
  it('should return support tickets', async () => {
    prismaMock.supportTicket.findMany.mockResolvedValueOnce([{ id: 'st-1', status: 'OPEN' }]);
    const res = mockRes();
    await ctrl.supportTickets(mockReq(), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [{ id: 'st-1', status: 'OPEN' }] });
  });

  it('should filter by child scope when scope=child', async () => {
    prismaMock.supportTicket.findMany.mockResolvedValueOnce([]);
    const res = mockRes();
    await ctrl.supportTickets(mockReq({ query: { scope: 'child' } }), res, mockNext());
    expect(prismaMock.supportTicket.findMany.mock.calls[0][0].where).toHaveProperty('studentId');
  });
});

/* ─── 30. createSupportTicket ──────────────────────────────────────── */
describe('createSupportTicket', () => {
  it('should create a support ticket', async () => {
    prismaMock.supportTicket.create.mockResolvedValueOnce({ id: 'st-1', subject: 'Help', status: 'OPEN' });
    const req = mockReq({ body: { subject: 'Help', description: 'Need help with billing' } });
    const res = mockRes();
    await ctrl.createSupportTicket(req, res, mockNext());
    expect(res._status).toBe(201);
    expect(res._json.success).toBe(true);
    expect(prismaMock.supportTicket.create).toHaveBeenCalled();
  });

  it('should error when subject missing', async () => {
    const next = mockNext();
    await ctrl.createSupportTicket(mockReq({ body: { description: 'desc' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'subject and description are required' }));
  });

  it('should error when description missing', async () => {
    const next = mockNext();
    await ctrl.createSupportTicket(mockReq({ body: { subject: 'Help' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'subject and description are required' }));
  });

  it('should error when parent not linked to school', async () => {
    prismaMock.schoolMember.findFirst.mockResolvedValueOnce(null);
    const next = mockNext();
    await ctrl.createSupportTicket(mockReq({ body: { subject: 'Help', description: 'Desc' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Parent is not linked to a school' }));
  });

  it('should error when childId given but not linked', async () => {
    const next = mockNext();
    await ctrl.createSupportTicket(mockReq({ body: { subject: 'Help', description: 'Desc', childId: 'unlinked' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Child not linked to parent' }));
  });

  it('should create ticket with valid childId', async () => {
    prismaMock.supportTicket.create.mockResolvedValueOnce({ id: 'st-2', subject: 'Help', studentId: 'child-1' });
    const req = mockReq({ body: { subject: 'Help', description: 'Desc', childId: 'child-1' } });
    const res = mockRes();
    await ctrl.createSupportTicket(req, res, mockNext());
    expect(res._status).toBe(201);
    expect(res._json.success).toBe(true);
  });
});

/* ─── 31. replySupportTicket ───────────────────────────────────────── */
describe('replySupportTicket', () => {
  it('should create reply and update ticket status', async () => {
    prismaMock.supportTicket.findFirst.mockResolvedValueOnce({ id: 'st-1', parentId: 'parent-1' });
    prismaMock.supportTicketReply.create.mockResolvedValueOnce({ id: 'reply-1', message: 'Thanks' });
    prismaMock.supportTicket.update.mockResolvedValueOnce({});

    const req = mockReq({ params: { supportTicketId: 'st-1' }, body: { message: 'Thanks' } });
    const res = mockRes();
    await ctrl.replySupportTicket(req, res, mockNext());
    expect(res._status).toBe(201);
    expect(res._json.success).toBe(true);
    expect(prismaMock.supportTicketReply.create).toHaveBeenCalled();
  });

  it('should error when supportTicketId or message missing', async () => {
    const next = mockNext();
    await ctrl.replySupportTicket(mockReq({ params: {}, body: {} }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'supportTicketId and message are required' }));
  });

  it('should error when ticket not found', async () => {
    prismaMock.supportTicket.findFirst.mockResolvedValueOnce(null);
    const next = mockNext();
    await ctrl.replySupportTicket(mockReq({ params: { supportTicketId: 'bad' }, body: { message: 'Hi' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Support ticket not found' }));
  });
});

/* ─── 32. search ───────────────────────────────────────────────────── */
describe('search', () => {
  it('should return matching results across modules', async () => {
    prismaMock.invoice.findMany.mockResolvedValueOnce([{ id: 'inv-1', status: 'ISSUED', studentId: 'child-1' }]);
    prismaMock.approvalRequest.findMany.mockResolvedValueOnce([{ id: 'ar-1', title: 'Trip Approval', type: 'TRIP', studentId: 'child-1' }]);
    prismaMock.messageThread.findMany.mockResolvedValueOnce([{ id: 't1', subject: 'Question about trip', participantIds: ['parent-1'] }]);

    const res = mockRes();
    await ctrl.search(mockReq({ query: { query: 'trip' } }), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should return empty when query is less than 2 chars', async () => {
    const res = mockRes();
    await ctrl.search(mockReq({ query: { query: 'a' } }), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [] });
  });

  it('should return empty when query is empty', async () => {
    const res = mockRes();
    await ctrl.search(mockReq({ query: {} }), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [] });
  });
});

/* ─── 33. listPins ─────────────────────────────────────────────────── */
describe('listPins', () => {
  it('should return workspace pins', async () => {
    prismaMock.parentWorkspaceItem.findMany.mockResolvedValueOnce([{ id: 'pin-1', kind: 'PIN' }]);
    const res = mockRes();
    await ctrl.listPins(mockReq(), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [{ id: 'pin-1', kind: 'PIN' }] });
  });
});

/* ─── 34. listRecent ───────────────────────────────────────────────── */
describe('listRecent', () => {
  it('should return recent workspace items', async () => {
    prismaMock.parentWorkspaceItem.findMany.mockResolvedValueOnce([{ id: 'rec-1', kind: 'RECENT' }]);
    const res = mockRes();
    await ctrl.listRecent(mockReq(), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [{ id: 'rec-1', kind: 'RECENT' }] });
  });
});

/* ─── 35. upsertPin ────────────────────────────────────────────────── */
describe('upsertPin', () => {
  it('should upsert a workspace pin', async () => {
    prismaMock.parentWorkspaceItem.upsert.mockResolvedValueOnce({ itemId: 'item-1', label: 'My Pin', kind: 'PIN' });
    const req = mockReq({ body: { itemId: 'item-1', label: 'My Pin', moduleId: 'fees_payments' } });
    const res = mockRes();
    await ctrl.upsertPin(req, res, mockNext());
    expect(res._json.success).toBe(true);
    expect(prismaMock.parentWorkspaceItem.upsert).toHaveBeenCalled();
  });

  it('should error when itemId missing', async () => {
    const next = mockNext();
    await ctrl.upsertPin(mockReq({ body: { label: 'X', moduleId: 'fees_payments' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'itemId, label, moduleId are required' }));
  });

  it('should error when label missing', async () => {
    const next = mockNext();
    await ctrl.upsertPin(mockReq({ body: { itemId: 'x', moduleId: 'fees_payments' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'itemId, label, moduleId are required' }));
  });

  it('should error when moduleId missing', async () => {
    const next = mockNext();
    await ctrl.upsertPin(mockReq({ body: { itemId: 'x', label: 'X' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'itemId, label, moduleId are required' }));
  });
});

/* ─── 36. removePin ────────────────────────────────────────────────── */
describe('removePin', () => {
  it('should delete pin by itemId', async () => {
    prismaMock.parentWorkspaceItem.deleteMany.mockResolvedValueOnce({ count: 1 });
    const res = mockRes();
    await ctrl.removePin(mockReq({ params: { itemId: 'item-1' } }), res, mockNext());
    expect(res._json).toEqual({ success: true, data: { itemId: 'item-1' } });
    expect(prismaMock.parentWorkspaceItem.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { parentId: 'parent-1', kind: 'PIN', itemId: 'item-1' } }),
    );
  });
});

/* ─── 37. notifications ────────────────────────────────────────────── */
describe('notifications', () => {
  it('should return notifications for user', async () => {
    prismaMock.notification.findMany.mockResolvedValueOnce([{ id: 'n-1', type: 'GENERAL' }]);
    const res = mockRes();
    await ctrl.notifications(mockReq(), res, mockNext());
    expect(res._json).toEqual({ success: true, data: [{ id: 'n-1', type: 'GENERAL' }] });
  });

  it('should filter by child scope when scope=child', async () => {
    prismaMock.notification.findMany.mockResolvedValueOnce([]);
    const res = mockRes();
    await ctrl.notifications(mockReq({ query: { scope: 'child' } }), res, mockNext());
    expect(prismaMock.notification.findMany.mock.calls[0][0].where).toHaveProperty('studentId');
  });
});

/* ─── 38. stripeWebhook ────────────────────────────────────────────── */
describe('stripeWebhook', () => {
  const webhookReq = (_event: any) =>
    mockReq({
      headers: { 'stripe-signature': 'sig_test' },
      rawBody: Buffer.from('raw-body'),
      body: {},
    });

  it('should handle checkout.session.completed and create payment + receipt', async () => {
    const stripeEvent = {
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_1',
          amount_total: 10000,
          currency: 'usd',
          payment_intent: 'pi_1',
          metadata: { invoiceId: 'inv-1', parentId: 'parent-1', studentId: 'child-1' },
        },
      },
    };
    stripeMock.constructWebhookEvent.mockReturnValueOnce(stripeEvent);
    prismaMock.stripeWebhookEvent.findUnique.mockResolvedValueOnce(null); // not duplicate
    prismaMock.invoice.findUnique.mockResolvedValueOnce({
      id: 'inv-1', parentId: 'parent-1', studentId: 'child-1', schoolId: 'school-1',
      totalAmount: 100, amountPaid: 0, currency: 'USD', dueDate: new Date('2030-01-01'), paidAt: null,
    });
    prismaMock.payment.create.mockResolvedValueOnce({ id: 'pay-1' });
    prismaMock.invoice.update.mockResolvedValueOnce({});
    prismaMock.receipt.create.mockResolvedValueOnce({ id: 'rec-1' });
    prismaMock.stripeWebhookEvent.create.mockResolvedValueOnce({});

    const res = mockRes();
    await ctrl.stripeWebhook(webhookReq(stripeEvent), res, mockNext());
    expect(res._json.success).toBe(true);
    expect(res._json.data.received).toBe(true);
    expect(prismaMock.payment.create).toHaveBeenCalled();
    expect(prismaMock.receipt.create).toHaveBeenCalled();
    expect(prismaMock.invoice.update).toHaveBeenCalled();
  });

  it('should set status to PAID when fully paid', async () => {
    const stripeEvent = {
      id: 'evt_full',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_2', amount_total: 10000, currency: 'usd', payment_intent: 'pi_2',
          metadata: { invoiceId: 'inv-2' },
        },
      },
    };
    stripeMock.constructWebhookEvent.mockReturnValueOnce(stripeEvent);
    prismaMock.stripeWebhookEvent.findUnique.mockResolvedValueOnce(null);
    prismaMock.invoice.findUnique.mockResolvedValueOnce({
      id: 'inv-2', parentId: 'p', studentId: 's', schoolId: 'sc',
      totalAmount: 100, amountPaid: 0, currency: 'USD', dueDate: new Date('2030-01-01'), paidAt: null,
    });
    prismaMock.payment.create.mockResolvedValueOnce({ id: 'pay-2' });
    prismaMock.invoice.update.mockResolvedValueOnce({});
    prismaMock.receipt.create.mockResolvedValueOnce({});
    prismaMock.stripeWebhookEvent.create.mockResolvedValueOnce({});

    const res = mockRes();
    await ctrl.stripeWebhook(webhookReq(stripeEvent), res, mockNext());
    expect(prismaMock.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PAID' }),
      }),
    );
  });

  it('should handle payment_intent.payment_failed', async () => {
    const stripeEvent = {
      id: 'evt_fail',
      type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_fail' } },
    };
    stripeMock.constructWebhookEvent.mockReturnValueOnce(stripeEvent);
    prismaMock.stripeWebhookEvent.findUnique.mockResolvedValueOnce(null);
    prismaMock.payment.findFirst.mockResolvedValueOnce({ id: 'pay-3', providerPaymentId: 'pi_fail' });
    prismaMock.payment.update.mockResolvedValueOnce({ id: 'pay-3', status: 'FAILED' });
    prismaMock.stripeWebhookEvent.create.mockResolvedValueOnce({});

    const res = mockRes();
    await ctrl.stripeWebhook(webhookReq(stripeEvent), res, mockNext());
    expect(prismaMock.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'FAILED' } }),
    );
  });

  it('should handle payment_intent.payment_failed when no matching payment', async () => {
    const stripeEvent = {
      id: 'evt_fail2',
      type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_unknown' } },
    };
    stripeMock.constructWebhookEvent.mockReturnValueOnce(stripeEvent);
    prismaMock.stripeWebhookEvent.findUnique.mockResolvedValueOnce(null);
    prismaMock.payment.findFirst.mockResolvedValueOnce(null);
    prismaMock.stripeWebhookEvent.create.mockResolvedValueOnce({});

    const res = mockRes();
    await ctrl.stripeWebhook(webhookReq(stripeEvent), res, mockNext());
    expect(res._json.data.received).toBe(true);
    expect(prismaMock.payment.update).not.toHaveBeenCalled();
  });

  it('should handle charge.refunded (full refund)', async () => {
    const stripeEvent = {
      id: 'evt_refund',
      type: 'charge.refunded',
      data: { object: { payment_intent: 'pi_ref', amount_refunded: 10000 } },
    };
    stripeMock.constructWebhookEvent.mockReturnValueOnce(stripeEvent);
    prismaMock.stripeWebhookEvent.findUnique.mockResolvedValueOnce(null);
    prismaMock.payment.findFirst.mockResolvedValueOnce({
      id: 'pay-4', providerPaymentId: 'pi_ref', amount: 100, invoiceId: 'inv-3',
      invoice: { id: 'inv-3', amountPaid: 100, status: 'PAID' },
    });
    prismaMock.payment.update.mockResolvedValueOnce({});
    prismaMock.invoice.update.mockResolvedValueOnce({});
    prismaMock.stripeWebhookEvent.create.mockResolvedValueOnce({});

    const res = mockRes();
    await ctrl.stripeWebhook(webhookReq(stripeEvent), res, mockNext());
    expect(prismaMock.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'REFUNDED', refundedAmount: 100 }),
      }),
    );
    expect(prismaMock.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'REFUNDED' }),
      }),
    );
  });

  it('should handle charge.refunded (partial refund)', async () => {
    const stripeEvent = {
      id: 'evt_partial_refund',
      type: 'charge.refunded',
      data: { object: { payment_intent: 'pi_pref', amount_refunded: 5000 } },
    };
    stripeMock.constructWebhookEvent.mockReturnValueOnce(stripeEvent);
    prismaMock.stripeWebhookEvent.findUnique.mockResolvedValueOnce(null);
    prismaMock.payment.findFirst.mockResolvedValueOnce({
      id: 'pay-5', providerPaymentId: 'pi_pref', amount: 100, invoiceId: 'inv-4',
      invoice: { id: 'inv-4', amountPaid: 100, status: 'PAID' },
    });
    prismaMock.payment.update.mockResolvedValueOnce({});
    prismaMock.invoice.update.mockResolvedValueOnce({});
    prismaMock.stripeWebhookEvent.create.mockResolvedValueOnce({});

    const res = mockRes();
    await ctrl.stripeWebhook(webhookReq(stripeEvent), res, mockNext());
    expect(prismaMock.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PARTIALLY_REFUNDED', refundedAmount: 50 }),
      }),
    );
  });

  it('should deduplicate webhook events', async () => {
    const stripeEvent = { id: 'evt_dup', type: 'checkout.session.completed', data: { object: {} } };
    stripeMock.constructWebhookEvent.mockReturnValueOnce(stripeEvent);
    prismaMock.stripeWebhookEvent.findUnique.mockResolvedValueOnce({ eventId: 'evt_dup' }); // already exists

    const res = mockRes();
    await ctrl.stripeWebhook(webhookReq(stripeEvent), res, mockNext());
    expect(res._json).toEqual({ success: true, data: { received: true, duplicate: true } });
    expect(prismaMock.stripeWebhookEvent.create).not.toHaveBeenCalled();
  });

  it('should error when signature or rawBody missing', async () => {
    const next = mockNext();
    await ctrl.stripeWebhook(mockReq({ headers: {}, body: {} }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid webhook request' }));
  });

  it('should error when rawBody is missing but signature present', async () => {
    const next = mockNext();
    await ctrl.stripeWebhook(mockReq({ headers: { 'stripe-signature': 'sig' } }), mockRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid webhook request' }));
  });
});
