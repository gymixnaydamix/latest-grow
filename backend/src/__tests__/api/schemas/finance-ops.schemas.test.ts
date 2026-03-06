import { describe, it, expect } from 'vitest';
import {
  createTuitionPlanSchema,
  createInvoiceSchema,
  createBudgetSchema,
  processPayrollSchema,
  createGrantSchema,
  createFacilitySchema,
  createBookingSchema,
  createPolicySchema,
  createEventSchema,
  createGoalSchema,
  createApplicantSchema,
  updateApplicantStageSchema,
  createCampaignSchema,
  updateDigestConfigSchema,
  createFeedbackSchema,
  createVolunteerOpportunitySchema,
  aiGenerateSchema,
  aiChatSchema,
  createSystemPromptSchema,
  createComplianceReportSchema,
} from '../../../api/schemas/validation.schemas.js';

describe('createTuitionPlanSchema', () => {
  it('accepts valid plan', () => {
    expect(createTuitionPlanSchema.safeParse({
      name: 'Standard', gradeLevel: '10', amount: 5000,
    }).success).toBe(true);
  });

  it('rejects zero amount', () => {
    expect(createTuitionPlanSchema.safeParse({
      name: 'X', gradeLevel: '5', amount: 0,
    }).success).toBe(false);
  });
});

describe('createInvoiceSchema', () => {
  it('accepts valid invoice', () => {
    expect(createInvoiceSchema.safeParse({
      parentId: 'p1', studentId: 's1', totalAmount: 100,
      dueDate: '2026-04-01T00:00:00.000Z',
      items: [{ description: 'Tuition', quantity: 1, unitPrice: 100, total: 100 }],
    }).success).toBe(true);
  });

  it('rejects empty items', () => {
    expect(createInvoiceSchema.safeParse({
      parentId: 'p1', studentId: 's1', totalAmount: 100,
      dueDate: '2026-04-01T00:00:00.000Z', items: [],
    }).success).toBe(false);
  });
});

describe('createBudgetSchema', () => {
  it('accepts valid budget', () => {
    expect(createBudgetSchema.safeParse({
      department: 'IT', fiscalYear: 2026, allocatedAmount: 50000,
    }).success).toBe(true);
  });
});

describe('processPayrollSchema', () => {
  it('accepts valid payroll', () => {
    expect(processPayrollSchema.safeParse({
      records: [{ staffId: 's1', period: '2026-03', grossAmount: 5000 }],
    }).success).toBe(true);
  });

  it('deductions default to empty object', () => {
    const result = processPayrollSchema.parse({
      records: [{ staffId: 's1', period: '2026-03', grossAmount: 5000 }],
    });
    expect(result.records[0].deductions).toEqual({});
  });
});

describe('createGrantSchema', () => {
  it('accepts valid grant', () => {
    expect(createGrantSchema.safeParse({
      name: 'STEM Grant', amount: 10000, deadline: '2026-06-01T00:00:00.000Z',
    }).success).toBe(true);
  });
});

describe('createFacilitySchema', () => {
  it('accepts valid facility', () => {
    expect(createFacilitySchema.safeParse({ name: 'Gym', type: 'SPORTS' }).success).toBe(true);
  });
});

describe('createBookingSchema', () => {
  it('accepts valid booking', () => {
    expect(createBookingSchema.safeParse({
      facilityId: 'f1',
      startTime: '2026-03-10T09:00:00.000Z',
      endTime: '2026-03-10T10:00:00.000Z',
    }).success).toBe(true);
  });
});

describe('createPolicySchema', () => {
  it('defaults status to DRAFT', () => {
    const result = createPolicySchema.parse({ title: 'No Phones', body: 'Details here' });
    expect(result.status).toBe('DRAFT');
  });

  it('accepts valid status enum', () => {
    expect(createPolicySchema.safeParse({
      title: 'X', body: 'Y', status: 'PUBLISHED',
    }).success).toBe(true);
  });
});

describe('createEventSchema', () => {
  it('accepts valid event', () => {
    expect(createEventSchema.safeParse({
      title: 'Science Fair',
      startDate: '2026-04-15T09:00:00.000Z',
      endDate: '2026-04-15T17:00:00.000Z',
      audience: ['STUDENT', 'PARENT'],
    }).success).toBe(true);
  });
});

describe('createGoalSchema', () => {
  it('accepts valid goal', () => {
    expect(createGoalSchema.safeParse({
      title: 'Improve Math Scores',
      targetDate: '2026-12-31T00:00:00.000Z',
    }).success).toBe(true);
  });
});

describe('createApplicantSchema', () => {
  it('defaults stage to INQUIRY', () => {
    const result = createApplicantSchema.parse({
      firstName: 'Jane', lastName: 'Doe', email: 'jane@test.com',
    });
    expect(result.stage).toBe('INQUIRY');
  });
});

describe('updateApplicantStageSchema', () => {
  it('accepts valid stage', () => {
    expect(updateApplicantStageSchema.safeParse({ stage: 'ACCEPTED' }).success).toBe(true);
  });

  it('rejects invalid stage', () => {
    expect(updateApplicantStageSchema.safeParse({ stage: 'HIRED' }).success).toBe(false);
  });
});

describe('createCampaignSchema', () => {
  it('defaults channel to EMAIL', () => {
    const result = createCampaignSchema.parse({
      name: 'Summer 2026',
      startDate: '2026-06-01T00:00:00.000Z',
      endDate: '2026-08-31T00:00:00.000Z',
    });
    expect(result.channel).toBe('EMAIL');
  });
});

describe('updateDigestConfigSchema', () => {
  it('accepts valid config', () => {
    expect(updateDigestConfigSchema.safeParse({
      frequency: 'WEEKLY', preferences: { grades: true },
    }).success).toBe(true);
  });
});

describe('createFeedbackSchema', () => {
  it('accepts valid feedback', () => {
    expect(createFeedbackSchema.safeParse({ category: 'General', body: 'Great!' }).success).toBe(true);
  });
});

describe('createVolunteerOpportunitySchema', () => {
  it('accepts valid opportunity', () => {
    expect(createVolunteerOpportunitySchema.safeParse({
      title: 'Library Helper', date: '2026-04-01T00:00:00.000Z',
    }).success).toBe(true);
  });
});

describe('aiGenerateSchema', () => {
  it('accepts valid prompt', () => {
    expect(aiGenerateSchema.safeParse({ prompt: 'Hello AI' }).success).toBe(true);
  });

  it('rejects empty prompt', () => {
    expect(aiGenerateSchema.safeParse({ prompt: '' }).success).toBe(false);
  });

  it('accepts optional params', () => {
    expect(aiGenerateSchema.safeParse({
      prompt: 'Write something', maxTokens: 100, temperature: 0.5, systemPrompt: 'Be helpful',
    }).success).toBe(true);
  });

  it('rejects negative maxTokens', () => {
    expect(aiGenerateSchema.safeParse({ prompt: 'Test', maxTokens: -1 }).success).toBe(false);
  });

  it('rejects temperature above 2', () => {
    expect(aiGenerateSchema.safeParse({ prompt: 'Test', temperature: 2.1 }).success).toBe(false);
  });

  it('rejects prompt exceeding 10000 chars', () => {
    const longPrompt = 'a'.repeat(10001);
    expect(aiGenerateSchema.safeParse({ prompt: longPrompt }).success).toBe(false);
  });

  it('accepts prompt at 10000 char boundary', () => {
    const maxPrompt = 'a'.repeat(10000);
    expect(aiGenerateSchema.safeParse({ prompt: maxPrompt }).success).toBe(true);
  });
});

describe('aiChatSchema', () => {
  it('accepts valid messages', () => {
    expect(aiChatSchema.safeParse({
      messages: [{ role: 'user', content: 'Hi' }],
    }).success).toBe(true);
  });

  it('rejects empty messages', () => {
    expect(aiChatSchema.safeParse({ messages: [] }).success).toBe(false);
  });

  it('rejects invalid role value', () => {
    expect(aiChatSchema.safeParse({
      messages: [{ role: 'bot', content: 'Hi' }],
    }).success).toBe(false);
  });

  it('rejects message with empty content', () => {
    expect(aiChatSchema.safeParse({
      messages: [{ role: 'user', content: '' }],
    }).success).toBe(false);
  });

  it('accepts optional maxTokens and temperature', () => {
    expect(aiChatSchema.safeParse({
      messages: [{ role: 'user', content: 'Hi' }],
      maxTokens: 100,
      temperature: 1.5,
    }).success).toBe(true);
  });

  it('rejects temperature above 2', () => {
    expect(aiChatSchema.safeParse({
      messages: [{ role: 'user', content: 'Hi' }],
      temperature: 2.5,
    }).success).toBe(false);
  });
});

describe('createSystemPromptSchema', () => {
  it('accepts valid prompt config', () => {
    expect(createSystemPromptSchema.safeParse({
      toolName: 'chat', persona: 'Helpful tutor',
    }).success).toBe(true);
  });
});

describe('createComplianceReportSchema', () => {
  it('accepts valid report', () => {
    expect(createComplianceReportSchema.safeParse({
      title: 'Q1 Compliance', type: 'FINANCIAL',
    }).success).toBe(true);
  });
});
