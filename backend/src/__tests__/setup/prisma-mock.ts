/* Prisma mock factory for service/controller tests */
import { vi } from 'vitest';

type ModelDelegate = Record<string, ReturnType<typeof vi.fn>>;

const modelMethods = [
  'findUnique',
  'findFirst',
  'findMany',
  'create',
  'createMany',
  'update',
  'updateMany',
  'upsert',
  'delete',
  'deleteMany',
  'count',
  'aggregate',
  'groupBy',
] as const;

function createModelMock(): ModelDelegate {
  const delegate: ModelDelegate = {};
  for (const method of modelMethods) {
    delegate[method] = vi.fn();
  }
  return delegate;
}

/**
 * Create a mock PrismaClient with all model delegates stubbed.
 * Usage:
 *   const prisma = createPrismaMock();
 *   prisma.user.findUnique.mockResolvedValue({ ... });
 */
export function createPrismaMock() {
  return {
    user: createModelMock(),
    school: createModelMock(),
    schoolMember: createModelMock(),
    course: createModelMock(),
    courseEnrollment: createModelMock(),
    assignment: createModelMock(),
    submission: createModelMock(),
    grade: createModelMock(),
    attendanceRecord: createModelMock(),
    messageThread: createModelMock(),
    message: createModelMock(),
    announcement: createModelMock(),
    tuitionPlan: createModelMock(),
    invoice: createModelMock(),
    invoiceItem: createModelMock(),
    payment: createModelMock(),
    payroll: createModelMock(),
    budget: createModelMock(),
    grant: createModelMock(),
    facility: createModelMock(),
    booking: createModelMock(),
    policy: createModelMock(),
    schoolEvent: createModelMock(),
    strategicGoal: createModelMock(),
    applicant: createModelMock(),
    campaign: createModelMock(),
    parentStudent: createModelMock(),
    digestConfig: createModelMock(),
    feedback: createModelMock(),
    volunteerOpportunity: createModelMock(),
    volunteerSignup: createModelMock(),
    auditLog: createModelMock(),
    schoolBranding: createModelMock(),
    dailyAttendanceSummary: createModelMock(),
    complianceReport: createModelMock(),
    systemPrompt: createModelMock(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({})),
  };
}

export type MockPrisma = ReturnType<typeof createPrismaMock>;
