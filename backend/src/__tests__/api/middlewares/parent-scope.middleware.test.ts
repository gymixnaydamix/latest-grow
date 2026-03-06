import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockNext, mockReq, mockRes } from '../../setup/express-helpers.js';

const { mockParentChild, mockInvoice, mockPayment, mockReceipt, mockMessageThread, mockApprovalRequest, mockConsentForm, mockSupportTicket, mockParentDocument, mockExam } = vi.hoisted(() => ({
  mockParentChild: { findMany: vi.fn(), findUnique: vi.fn() },
  mockInvoice: { findUnique: vi.fn() },
  mockPayment: { findUnique: vi.fn() },
  mockReceipt: { findUnique: vi.fn() },
  mockMessageThread: { findUnique: vi.fn() },
  mockApprovalRequest: { findUnique: vi.fn() },
  mockConsentForm: { findUnique: vi.fn() },
  mockSupportTicket: { findUnique: vi.fn() },
  mockParentDocument: { findUnique: vi.fn() },
  mockExam: { findUnique: vi.fn() },
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    parentChild: mockParentChild,
    invoice: mockInvoice,
    payment: mockPayment,
    receipt: mockReceipt,
    messageThread: mockMessageThread,
    approvalRequest: mockApprovalRequest,
    consentForm: mockConsentForm,
    supportTicket: mockSupportTicket,
    parentDocument: mockParentDocument,
    exam: mockExam,
  },
}));

import { enforceParentScope } from '../../../api/middlewares/parent-scope.middleware.js';

describe('enforceParentScope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParentChild.findMany.mockResolvedValue([{ studentId: 'student-1' }]);
    mockParentChild.findUnique.mockResolvedValue({ parentId: 'parent-1', studentId: 'student-1' });
    mockInvoice.findUnique.mockResolvedValue(null);
    mockPayment.findUnique.mockResolvedValue(null);
    mockReceipt.findUnique.mockResolvedValue(null);
    mockMessageThread.findUnique.mockResolvedValue(null);
    mockApprovalRequest.findUnique.mockResolvedValue(null);
    mockConsentForm.findUnique.mockResolvedValue(null);
    mockSupportTicket.findUnique.mockResolvedValue(null);
    mockParentDocument.findUnique.mockResolvedValue(null);
    mockExam.findUnique.mockResolvedValue(null);
  });

  it('allows linked child scope', async () => {
    const req = mockReq({
      user: { userId: 'parent-1', role: 'PARENT' } as any,
      query: { childId: 'student-1' } as any,
    });
    const res = mockRes();
    const next = mockNext();

    await enforceParentScope(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.parentScopeChildIds).toEqual(['student-1']);
  });

  it('blocks unlinked child scope', async () => {
    mockParentChild.findUnique.mockResolvedValue(null);
    const req = mockReq({
      user: { userId: 'parent-1', role: 'PARENT' } as any,
      query: { childId: 'student-2' } as any,
    });
    const res = mockRes();
    const next = mockNext();

    await enforceParentScope(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((next.mock.calls[0][0] as Error).message).toContain('Parent cannot access records for this child');
  });

  it('validates invoice ownership when invoiceId is present', async () => {
    mockInvoice.findUnique.mockResolvedValue({ id: 'inv-1', parentId: 'parent-1', studentId: 'student-1' });
    const req = mockReq({
      user: { userId: 'parent-1', role: 'PARENT' } as any,
      params: { invoiceId: 'inv-1' } as any,
    });
    const res = mockRes();
    const next = mockNext();

    await enforceParentScope(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(mockInvoice.findUnique).toHaveBeenCalled();
  });

  it('blocks thread access when parent is not a participant', async () => {
    mockMessageThread.findUnique.mockResolvedValue({ id: 'thread-1', participantIds: ['other-user'] });
    const req = mockReq({
      user: { userId: 'parent-1', role: 'PARENT' } as any,
      params: { threadId: 'thread-1' } as any,
    });
    const res = mockRes();
    const next = mockNext();

    await enforceParentScope(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((next.mock.calls[0][0] as Error).message).toContain('Parent cannot access this message thread');
  });
});
