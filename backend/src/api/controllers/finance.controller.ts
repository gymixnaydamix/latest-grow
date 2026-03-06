import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { NotFoundError } from '../../utils/errors.js';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

// ---------------------------------------------------------------------------
// Tuition Plans
// ---------------------------------------------------------------------------

export const tuitionController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await prisma.tuitionPlan.create({
        data: { schoolId: param(req.params.schoolId), ...req.body },
      });
      res.status(201).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await prisma.tuitionPlan.findMany({
        where: { schoolId: param(req.params.schoolId) },
        orderBy: { gradeLevel: 'asc' },
      });
      res.json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await prisma.tuitionPlan.update({
        where: { id: param(req.params.id) },
        data: req.body,
      });
      res.json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.tuitionPlan.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Tuition plan deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Invoicing
// ---------------------------------------------------------------------------

export const invoiceController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await prisma.invoice.create({
        data: {
          schoolId: param(req.params.schoolId),
          parentId: req.body.parentId,
          studentId: req.body.studentId,
          items: req.body.items,
          totalAmount: req.body.totalAmount,
          dueDate: new Date(req.body.dueDate),
        },
      });
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, pageSize = 20 } = req.query as { page?: number; pageSize?: number };
      const schoolId = param(req.params.schoolId);

      const [items, total] = await Promise.all([
        prisma.invoice.findMany({
          where: { schoolId },
          include: { payments: true },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(pageSize),
          take: Number(pageSize),
        }),
        prisma.invoice.count({ where: { schoolId } }),
      ]);

      res.json({
        success: true,
        data: { items, total, page: Number(page), pageSize: Number(pageSize), totalPages: Math.ceil(total / Number(pageSize)) },
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: param(req.params.id) },
        include: { payments: true },
      });
      if (!invoice) throw new NotFoundError('Invoice not found');
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoice = await prisma.invoice.update({
        where: { id: param(req.params.id) },
        data: {
          status: req.body.status,
          paidAt: req.body.status === 'PAID' ? new Date() : undefined,
        },
      });
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  },

  async getByParent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const invoices = await prisma.invoice.findMany({
        where: { parentId: param(req.params.parentId) },
        include: { payments: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Payroll
// ---------------------------------------------------------------------------

export const payrollController = {
  async process(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = req.body.records as Array<{
        staffId: string;
        period: string;
        grossAmount: number;
        deductions: Record<string, number>;
      }>;

      const results = await Promise.all(
        records.map((r) => {
          const totalDeductions = Object.values(r.deductions).reduce((sum, v) => sum + v, 0);
          const netAmount = r.grossAmount - totalDeductions;
          return prisma.payrollRecord.create({
            data: {
              staffId: r.staffId,
              period: r.period,
              grossAmount: r.grossAmount,
              deductions: r.deductions,
              netAmount,
            },
          });
        }),
      );

      res.status(201).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period, staffId } = req.query as { period?: string; staffId?: string };
      const records = await prisma.payrollRecord.findMany({
        where: {
          ...(period && { period }),
          ...(staffId && { staffId }),
        },
        include: { staff: { select: { id: true, firstName: true, lastName: true, email: true } } },
        orderBy: { processedAt: 'desc' },
        take: 100,
      });
      res.json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Budgeting
// ---------------------------------------------------------------------------

export const budgetController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await prisma.budget.create({
        data: {
          schoolId: param(req.params.schoolId),
          department: req.body.department,
          fiscalYear: req.body.fiscalYear,
          allocatedAmount: req.body.allocatedAmount,
        },
      });
      res.status(201).json({ success: true, data: budget });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budgets = await prisma.budget.findMany({
        where: { schoolId: param(req.params.schoolId) },
        orderBy: [{ fiscalYear: 'desc' }, { department: 'asc' }],
      });
      res.json({ success: true, data: budgets });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budget = await prisma.budget.update({
        where: { id: param(req.params.id) },
        data: {
          allocatedAmount: req.body.allocatedAmount,
          spentAmount: req.body.spentAmount,
        },
      });
      res.json({ success: true, data: budget });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Grants
// ---------------------------------------------------------------------------

export const grantController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const grant = await prisma.grantRecord.create({
        data: {
          schoolId: param(req.params.schoolId),
          name: req.body.name,
          amount: req.body.amount,
          deadline: new Date(req.body.deadline),
          status: req.body.status,
          notes: req.body.notes,
        },
      });
      res.status(201).json({ success: true, data: grant });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const grants = await prisma.grantRecord.findMany({
        where: { schoolId: param(req.params.schoolId) },
        orderBy: { deadline: 'asc' },
      });
      res.json({ success: true, data: grants });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const grant = await prisma.grantRecord.update({
        where: { id: param(req.params.id) },
        data: req.body,
      });
      res.json({ success: true, data: grant });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Expense tracking
// ---------------------------------------------------------------------------

export const expenseController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await prisma.expenseRecord.create({
        data: {
          schoolId: param(req.params.schoolId),
          category: req.body.category,
          description: req.body.description,
          amount: req.body.amount,
          vendor: req.body.vendor ?? '',
          status: req.body.status ?? 'DRAFT',
          incurredAt: new Date(req.body.incurredAt),
          notes: req.body.notes ?? '',
          createdBy: req.user!.userId,
        },
        include: {
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const { status, category, from, to, search = '' } = req.query as Record<string, string>;

      const expenses = await prisma.expenseRecord.findMany({
        where: {
          schoolId,
          ...(status ? { status } : {}),
          ...(category ? { category } : {}),
          ...(from || to
            ? {
                incurredAt: {
                  ...(from ? { gte: new Date(from) } : {}),
                  ...(to ? { lte: new Date(to) } : {}),
                },
              }
            : {}),
          ...(search
            ? {
                OR: [
                  { description: { contains: search, mode: 'insensitive' } },
                  { vendor: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        include: {
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { incurredAt: 'desc' },
      });

      res.json({ success: true, data: expenses });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const expense = await prisma.expenseRecord.update({
        where: { id: param(req.params.id) },
        data: {
          category: req.body.category,
          description: req.body.description,
          amount: req.body.amount,
          vendor: req.body.vendor,
          status: req.body.status,
          incurredAt: req.body.incurredAt ? new Date(req.body.incurredAt) : undefined,
          notes: req.body.notes,
        },
        include: {
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
      res.json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.expenseRecord.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Expense deleted' });
    } catch (error) {
      next(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Financial reporting
// ---------------------------------------------------------------------------

export const financialReportingController = {
  async summary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const { from, to } = req.query as Record<string, string>;
      const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = to ? new Date(to) : new Date();

      const [invoiceAgg, paidAgg, overdueCount, expenseAgg, expenseByCategory] = await Promise.all([
        prisma.invoice.aggregate({
          where: { schoolId, createdAt: { gte: start, lte: end } },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
        prisma.invoice.aggregate({
          where: { schoolId, createdAt: { gte: start, lte: end }, status: 'PAID' },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
        prisma.invoice.count({
          where: { schoolId, status: 'OVERDUE' },
        }),
        prisma.expenseRecord.aggregate({
          where: { schoolId, incurredAt: { gte: start, lte: end } },
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.expenseRecord.groupBy({
          by: ['category'],
          where: { schoolId, incurredAt: { gte: start, lte: end } },
          _sum: { amount: true },
          orderBy: { category: 'asc' },
        }),
      ]);

      const totalInvoiced = invoiceAgg._sum.totalAmount ?? 0;
      const totalCollected = paidAgg._sum.totalAmount ?? 0;
      const totalExpenses = expenseAgg._sum.amount ?? 0;

      res.json({
        success: true,
        data: {
          schoolId,
          from: start.toISOString(),
          to: end.toISOString(),
          totalInvoiced,
          totalCollected,
          totalOutstanding: totalInvoiced - totalCollected,
          totalExpenses,
          netCashflow: totalCollected - totalExpenses,
          invoiceCount: invoiceAgg._count.id,
          paidInvoiceCount: paidAgg._count.id,
          overdueInvoiceCount: overdueCount,
          expenseCount: expenseAgg._count.id,
          expenseByCategory: expenseByCategory.map((row) => ({
            category: row.category,
            amount: row._sum.amount ?? 0,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async exportSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const { from, to } = req.query as Record<string, string>;
      const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = to ? new Date(to) : new Date();

      const [invoiceAgg, paidAgg, expenseAgg] = await Promise.all([
        prisma.invoice.aggregate({
          where: { schoolId, createdAt: { gte: start, lte: end } },
          _sum: { totalAmount: true },
        }),
        prisma.invoice.aggregate({
          where: { schoolId, createdAt: { gte: start, lte: end }, status: 'PAID' },
          _sum: { totalAmount: true },
        }),
        prisma.expenseRecord.aggregate({
          where: { schoolId, incurredAt: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
      ]);

      const totalInvoiced = invoiceAgg._sum.totalAmount ?? 0;
      const totalCollected = paidAgg._sum.totalAmount ?? 0;
      const totalExpenses = expenseAgg._sum.amount ?? 0;
      const outstanding = totalInvoiced - totalCollected;

      const csv = [
        'metric,value',
        `from,${start.toISOString()}`,
        `to,${end.toISOString()}`,
        `total_invoiced,${totalInvoiced}`,
        `total_collected,${totalCollected}`,
        `total_outstanding,${outstanding}`,
        `total_expenses,${totalExpenses}`,
        `net_cashflow,${totalCollected - totalExpenses}`,
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="financial-summary-${schoolId}.csv"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },
};
