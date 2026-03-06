import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../db/prisma.service.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';

const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

export const libraryController = {
  async listItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await prisma.libraryItem.findMany({
        where: { schoolId: param(req.params.schoolId) },
        include: {
          _count: {
            select: {
              loans: {
                where: { status: 'OUT' },
              },
            },
          },
        },
        orderBy: { title: 'asc' },
      });
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  },

  async createItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalCopies = req.body.totalCopies ?? 1;
      const availableCopies = req.body.availableCopies ?? totalCopies;

      const item = await prisma.libraryItem.create({
        data: {
          schoolId: param(req.params.schoolId),
          title: req.body.title,
          author: req.body.author ?? '',
          isbn: req.body.isbn ?? '',
          category: req.body.category ?? '',
          description: req.body.description ?? '',
          shelfLocation: req.body.shelfLocation ?? '',
          totalCopies,
          availableCopies,
          publishedYear: req.body.publishedYear ?? null,
        },
      });

      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await prisma.libraryItem.update({
        where: { id: param(req.params.id) },
        data: {
          title: req.body.title,
          author: req.body.author,
          isbn: req.body.isbn,
          category: req.body.category,
          description: req.body.description,
          shelfLocation: req.body.shelfLocation,
          totalCopies: req.body.totalCopies,
          availableCopies: req.body.availableCopies,
          publishedYear: req.body.publishedYear,
        },
      });

      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async deleteItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.libraryItem.delete({ where: { id: param(req.params.id) } });
      res.json({ success: true, data: null, message: 'Library item deleted' });
    } catch (error) {
      next(error);
    }
  },

  async listLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const { status, borrowerId, itemId } = req.query as Record<string, string>;

      const loans = await prisma.libraryLoan.findMany({
        where: {
          schoolId,
          ...(status ? { status } : {}),
          ...(borrowerId ? { borrowerId } : {}),
          ...(itemId ? { itemId } : {}),
        },
        include: {
          item: true,
          borrower: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
        orderBy: { checkedOutAt: 'desc' },
      });

      res.json({ success: true, data: loans });
    } catch (error) {
      next(error);
    }
  },

  async checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { schoolId, itemId, borrowerId, dueAt, notes } = req.body as {
        schoolId: string;
        itemId: string;
        borrowerId: string;
        dueAt: string;
        notes?: string;
      };

      const loan = await prisma.$transaction(async (tx) => {
        const item = await tx.libraryItem.findUnique({ where: { id: itemId } });
        if (!item || item.schoolId !== schoolId) {
          throw new NotFoundError('Library item not found for this school');
        }
        if (item.availableCopies <= 0) {
          throw new BadRequestError('No available copies for checkout');
        }

        const existingOpenLoan = await tx.libraryLoan.findFirst({
          where: {
            schoolId,
            itemId,
            borrowerId,
            status: 'OUT',
          },
        });
        if (existingOpenLoan) {
          throw new BadRequestError('Borrower already has this item checked out');
        }

        await tx.libraryItem.update({
          where: { id: itemId },
          data: { availableCopies: { decrement: 1 } },
        });

        return tx.libraryLoan.create({
          data: {
            schoolId,
            itemId,
            borrowerId,
            dueAt: new Date(dueAt),
            notes: notes ?? '',
            status: 'OUT',
          },
          include: {
            item: true,
            borrower: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
          },
        });
      });

      res.status(201).json({ success: true, data: loan });
    } catch (error) {
      next(error);
    }
  },

  async returnLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = param(req.params.id);
      const notes = (req.body?.notes as string | undefined) ?? '';

      const updated = await prisma.$transaction(async (tx) => {
        const loan = await tx.libraryLoan.findUnique({ where: { id } });
        if (!loan) throw new NotFoundError('Loan not found');
        if (loan.status !== 'OUT') throw new BadRequestError('Loan is already returned');

        await tx.libraryItem.update({
          where: { id: loan.itemId },
          data: {
            availableCopies: { increment: 1 },
          },
        });

        return tx.libraryLoan.update({
          where: { id },
          data: {
            returnedAt: new Date(),
            status: 'RETURNED',
            notes: notes || loan.notes,
          },
          include: {
            item: true,
            borrower: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
          },
        });
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },
};
