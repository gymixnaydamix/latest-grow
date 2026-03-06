import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { ForbiddenError, NotFoundError } from '../../utils/errors.js';

type RequestMap = Record<string, unknown>;

declare global {
  namespace Express {
    interface Request {
      parentScopeChildIds?: string[];
    }
  }
}

function scalar(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return null;
}

function pickId(req: Request, key: string): string | null {
  const params = req.params as RequestMap;
  const query = req.query as RequestMap;
  const body = req.body as RequestMap;
  return scalar(params[key]) ?? scalar(query[key]) ?? scalar(body[key]);
}

async function verifyChildLink(parentId: string, childId: string): Promise<void> {
  const relation = await prisma.parentChild.findUnique({
    where: {
      parentId_studentId: {
        parentId,
        studentId: childId,
      },
    },
  });
  if (!relation) throw new ForbiddenError('Parent cannot access records for this child');
}

async function checkEntityOwnership(parentId: string, req: Request): Promise<void> {
  const invoiceId = pickId(req, 'invoiceId');
  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, parentId: true, studentId: true },
    });
    if (!invoice) throw new NotFoundError('Invoice not found');
    if (invoice.parentId !== parentId) {
      await verifyChildLink(parentId, invoice.studentId);
    }
  }

  const paymentId = pickId(req, 'paymentId');
  if (paymentId) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        invoice: {
          select: {
            parentId: true,
            studentId: true,
          },
        },
      },
    });
    if (!payment) throw new NotFoundError('Payment not found');
    if (payment.invoice.parentId !== parentId) {
      await verifyChildLink(parentId, payment.invoice.studentId);
    }
  }

  const receiptId = pickId(req, 'receiptId');
  if (receiptId) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      select: { id: true, parentId: true, studentId: true },
    });
    if (!receipt) throw new NotFoundError('Receipt not found');
    if (receipt.parentId !== parentId) {
      await verifyChildLink(parentId, receipt.studentId);
    }
  }

  const threadId = pickId(req, 'threadId');
  if (threadId) {
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      select: { id: true, participantIds: true },
    });
    if (!thread) throw new NotFoundError('Message thread not found');
    if (!thread.participantIds.includes(parentId)) {
      throw new ForbiddenError('Parent cannot access this message thread');
    }
  }

  const approvalRequestId = pickId(req, 'approvalRequestId');
  if (approvalRequestId) {
    const approval = await prisma.approvalRequest.findUnique({
      where: { id: approvalRequestId },
      select: { id: true, parentId: true, studentId: true },
    });
    if (!approval) throw new NotFoundError('Approval request not found');
    if (approval.parentId !== parentId) {
      await verifyChildLink(parentId, approval.studentId);
    }
  }

  const consentFormId = pickId(req, 'consentFormId');
  if (consentFormId) {
    const form = await prisma.consentForm.findUnique({
      where: { id: consentFormId },
      select: { id: true, parentId: true, studentId: true },
    });
    if (!form) throw new NotFoundError('Consent form not found');
    if (form.parentId !== parentId) {
      await verifyChildLink(parentId, form.studentId);
    }
  }

  const supportTicketId = pickId(req, 'supportTicketId');
  if (supportTicketId) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: supportTicketId },
      select: { id: true, parentId: true, studentId: true },
    });
    if (!ticket) throw new NotFoundError('Support ticket not found');
    if (ticket.parentId !== parentId) {
      if (!ticket.studentId) throw new ForbiddenError('Parent cannot access this support ticket');
      await verifyChildLink(parentId, ticket.studentId);
    }
  }

  const documentId = pickId(req, 'documentId');
  if (documentId) {
    const document = await prisma.parentDocument.findUnique({
      where: { id: documentId },
      select: { id: true, parentId: true, studentId: true },
    });
    if (!document) throw new NotFoundError('Document not found');
    if (document.parentId !== parentId) {
      await verifyChildLink(parentId, document.studentId);
    }
  }

  const examId = pickId(req, 'examId');
  if (examId) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, studentId: true },
    });
    if (!exam) throw new NotFoundError('Exam not found');
    if (exam.studentId) {
      await verifyChildLink(parentId, exam.studentId);
    }
  }
}

export async function enforceParentScope(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new ForbiddenError('No user context');
    if (req.user.role !== 'PARENT') throw new ForbiddenError('Parent role required');

    const parentId = req.user.userId;
    const childIds = await prisma.parentChild.findMany({
      where: { parentId },
      select: { studentId: true },
    });
    req.parentScopeChildIds = childIds.map((row) => row.studentId);

    const explicitChildId = pickId(req, 'childId') ?? pickId(req, 'studentId');
    if (explicitChildId) {
      await verifyChildLink(parentId, explicitChildId);
    }

    await checkEntityOwnership(parentId, req);
    next();
  } catch (error) {
    next(error);
  }
}
