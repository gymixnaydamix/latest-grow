import { describe, it, expect } from 'vitest';
import {
  updateStudentProfileSchema,
  changePasswordSchema,
  updateAvatarSchema,
  payInvoiceSchema,
  logMoodSchema,
  bookSessionSchema,
  createStudentWellnessGoalSchema,
  createStudentJournalEntrySchema,
  addPortfolioWorkSchema,
  createMindMapSchema,
  generateCitationSchema,
  createFocusSessionSchema,
  addPlannerBlockSchema,
  sendStudentMessageSchema,
  createCommunityPostSchema,
  submitDeptRequestSchema,
  studentIdParamSchema,
  createWellnessJournalSchema,
  createWellnessGoalSchema,
  updateWellnessGoalSchema,
  createThreadSchema,
  sendMessageSchema,
  threadIdParamSchema,
} from '../../../api/schemas/validation.schemas.js';

// ---------------------------------------------------------------------------
// Student schemas
// ---------------------------------------------------------------------------

describe('updateStudentProfileSchema', () => {
  it('accepts partial profile update', () => {
    const result = updateStudentProfileSchema.safeParse({ firstName: 'Alex' });
    expect(result.success).toBe(true);
  });

  it('accepts empty object (all optional)', () => {
    expect(updateStudentProfileSchema.safeParse({}).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(updateStudentProfileSchema.safeParse({ email: 'not-email' }).success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  it('accepts valid password change', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass123',
      newPassword: 'newpass1234',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short new password', () => {
    expect(
      changePasswordSchema.safeParse({ currentPassword: 'old', newPassword: 'short' }).success,
    ).toBe(false);
  });

  it('rejects missing currentPassword', () => {
    expect(changePasswordSchema.safeParse({ newPassword: 'newpass1234' }).success).toBe(false);
  });
});

describe('updateAvatarSchema', () => {
  it('accepts valid avatar', () => {
    expect(updateAvatarSchema.safeParse({ avatar: 'avatar.jpg' }).success).toBe(true);
  });

  it('rejects empty avatar', () => {
    expect(updateAvatarSchema.safeParse({ avatar: '' }).success).toBe(false);
  });
});

describe('payInvoiceSchema', () => {
  it('accepts valid invoice payment', () => {
    const result = payInvoiceSchema.safeParse({ invoiceId: 'inv1', amount: 100 });
    expect(result.success).toBe(true);
  });

  it('rejects negative amount', () => {
    expect(payInvoiceSchema.safeParse({ invoiceId: 'inv1', amount: -50 }).success).toBe(false);
  });

  it('rejects missing invoiceId', () => {
    expect(payInvoiceSchema.safeParse({ amount: 100 }).success).toBe(false);
  });
});

describe('logMoodSchema', () => {
  it('accepts valid mood', () => {
    expect(logMoodSchema.safeParse({ mood: 'happy' }).success).toBe(true);
  });

  it('accepts mood with optional note', () => {
    expect(logMoodSchema.safeParse({ mood: 'sad', note: 'bad day' }).success).toBe(true);
  });

  it('rejects empty mood', () => {
    expect(logMoodSchema.safeParse({ mood: '' }).success).toBe(false);
  });
});

describe('bookSessionSchema', () => {
  it('accepts empty body (all optional)', () => {
    const result = bookSessionSchema.parse({});
    expect(result.type).toBe('counseling');
  });

  it('accepts custom type', () => {
    const result = bookSessionSchema.parse({ type: 'therapy' });
    expect(result.type).toBe('therapy');
  });
});

describe('createStudentWellnessGoalSchema', () => {
  it('accepts valid goal', () => {
    const result = createStudentWellnessGoalSchema.parse({ title: 'Exercise daily' });
    expect(result.target).toBe('30 days');
  });

  it('rejects empty title', () => {
    expect(createStudentWellnessGoalSchema.safeParse({ title: '' }).success).toBe(false);
  });
});

describe('createStudentJournalEntrySchema', () => {
  it('accepts valid entry', () => {
    const result = createStudentJournalEntrySchema.safeParse({
      mood: 'happy', summary: 'A good day',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing summary', () => {
    expect(createStudentJournalEntrySchema.safeParse({ mood: 'happy' }).success).toBe(false);
  });
});

describe('addPortfolioWorkSchema', () => {
  it('accepts valid portfolio item', () => {
    const result = addPortfolioWorkSchema.parse({ title: 'My Project', type: 'code' });
    expect(result.tags).toEqual([]);
    expect(result.description).toBe('');
  });

  it('rejects missing title', () => {
    expect(addPortfolioWorkSchema.safeParse({ type: 'essay' }).success).toBe(false);
  });
});

describe('createMindMapSchema', () => {
  it('accepts valid mind map', () => {
    expect(createMindMapSchema.safeParse({ title: 'Biology' }).success).toBe(true);
  });

  it('rejects empty title', () => {
    expect(createMindMapSchema.safeParse({ title: '' }).success).toBe(false);
  });
});

describe('generateCitationSchema', () => {
  it('accepts valid citation', () => {
    const result = generateCitationSchema.safeParse({
      sourceType: 'book', title: 'Algorithms', authors: 'Cormen', year: 2009,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing authors', () => {
    expect(
      generateCitationSchema.safeParse({ sourceType: 'book', title: 'X', year: 2020 }).success,
    ).toBe(false);
  });

  it('rejects negative year', () => {
    expect(
      generateCitationSchema.safeParse({
        sourceType: 'book', title: 'X', authors: 'Y', year: -1,
      }).success,
    ).toBe(false);
  });
});

describe('createFocusSessionSchema', () => {
  it('accepts valid session', () => {
    expect(createFocusSessionSchema.safeParse({ duration: 25, task: 'Math' }).success).toBe(true);
  });

  it('rejects zero duration', () => {
    expect(createFocusSessionSchema.safeParse({ duration: 0, task: 'Math' }).success).toBe(false);
  });
});

describe('addPlannerBlockSchema', () => {
  it('accepts valid block', () => {
    const result = addPlannerBlockSchema.safeParse({
      title: 'Study', startTime: '09:00', endTime: '10:00', day: 'Monday',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid time format', () => {
    expect(
      addPlannerBlockSchema.safeParse({
        title: 'Study', startTime: '9am', endTime: '10am', day: 'Monday',
      }).success,
    ).toBe(false);
  });
});

describe('sendStudentMessageSchema', () => {
  it('accepts valid message', () => {
    expect(sendStudentMessageSchema.safeParse({ body: 'Hello' }).success).toBe(true);
  });

  it('rejects empty body', () => {
    expect(sendStudentMessageSchema.safeParse({ body: '' }).success).toBe(false);
  });
});

describe('createCommunityPostSchema', () => {
  it('accepts valid post', () => {
    expect(createCommunityPostSchema.safeParse({ content: 'Hello world' }).success).toBe(true);
  });

  it('rejects empty content', () => {
    expect(createCommunityPostSchema.safeParse({ content: '' }).success).toBe(false);
  });
});

describe('submitDeptRequestSchema', () => {
  it('accepts valid request', () => {
    const result = submitDeptRequestSchema.safeParse({
      title: 'Transcript', category: 'transcript', description: 'Need transcript',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing category', () => {
    expect(
      submitDeptRequestSchema.safeParse({ title: 'X', description: 'Y' }).success,
    ).toBe(false);
  });
});

describe('studentIdParamSchema', () => {
  it('accepts non-empty studentId', () => {
    expect(studentIdParamSchema.safeParse({ studentId: 's1' }).success).toBe(true);
  });

  it('rejects empty studentId', () => {
    expect(studentIdParamSchema.safeParse({ studentId: '' }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Wellness schemas (standalone routes)
// ---------------------------------------------------------------------------

describe('createWellnessJournalSchema', () => {
  it('accepts valid journal entry', () => {
    const result = createWellnessJournalSchema.parse({
      mood: 'Great', summary: 'Good day',
    });
    expect(result.moodEmoji).toBe('😐');
  });

  it('rejects missing mood', () => {
    expect(createWellnessJournalSchema.safeParse({ summary: 'X' }).success).toBe(false);
  });
});

describe('createWellnessGoalSchema', () => {
  it('accepts valid goal with default target', () => {
    const result = createWellnessGoalSchema.parse({ title: 'Meditate' });
    expect(result.target).toBe('30 days');
  });

  it('rejects empty title', () => {
    expect(createWellnessGoalSchema.safeParse({ title: '' }).success).toBe(false);
  });
});

describe('updateWellnessGoalSchema', () => {
  it('accepts partial update', () => {
    expect(updateWellnessGoalSchema.safeParse({ progress: 50 }).success).toBe(true);
  });

  it('rejects progress > 100', () => {
    expect(updateWellnessGoalSchema.safeParse({ progress: 150 }).success).toBe(false);
  });

  it('rejects progress < 0', () => {
    expect(updateWellnessGoalSchema.safeParse({ progress: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Message schemas
// ---------------------------------------------------------------------------

describe('createThreadSchema', () => {
  it('accepts valid thread', () => {
    const result = createThreadSchema.safeParse({
      subject: 'Hello', participantIds: ['user1', 'user2'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty participantIds', () => {
    expect(
      createThreadSchema.safeParse({ subject: 'Hello', participantIds: [] }).success,
    ).toBe(false);
  });

  it('rejects missing subject', () => {
    expect(createThreadSchema.safeParse({ participantIds: ['u1'] }).success).toBe(false);
  });
});

describe('sendMessageSchema', () => {
  it('accepts valid message', () => {
    expect(sendMessageSchema.safeParse({ body: 'Hello' }).success).toBe(true);
  });

  it('rejects empty body', () => {
    expect(sendMessageSchema.safeParse({ body: '' }).success).toBe(false);
  });
});

describe('threadIdParamSchema', () => {
  it('accepts non-empty threadId', () => {
    expect(threadIdParamSchema.safeParse({ threadId: 't1' }).success).toBe(true);
  });

  it('rejects empty threadId', () => {
    expect(threadIdParamSchema.safeParse({ threadId: '' }).success).toBe(false);
  });
});
