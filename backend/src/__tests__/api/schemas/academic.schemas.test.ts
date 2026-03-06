import { describe, it, expect } from 'vitest';
import {
  createCourseSchema,
  createAssignmentSchema,
  createSubmissionSchema,
  gradeSubmissionSchema,
  markAttendanceSchema,
  idParamSchema,
  schoolIdParamSchema,
} from '../../../api/schemas/validation.schemas.js';

describe('createCourseSchema', () => {
  it('accepts valid course', () => {
    const result = createCourseSchema.safeParse({
      name: 'Math 101', gradeLevel: '10', semester: 'Fall 2026', teacherId: 'abc',
    });
    expect(result.success).toBe(true);
  });

  it('defaults description to empty string', () => {
    const result = createCourseSchema.parse({
      name: 'X', gradeLevel: '10', semester: 'S', teacherId: 'y',
    });
    expect(result.description).toBe('');
  });

  it('rejects missing teacherId', () => {
    const result = createCourseSchema.safeParse({ name: 'X', gradeLevel: '10', semester: 'S' });
    expect(result.success).toBe(false);
  });
});

describe('createAssignmentSchema', () => {
  const valid = {
    courseId: 'c1', title: 'HW 1', dueDate: '2026-03-10T00:00:00.000Z',
  };

  it('accepts valid assignment with defaults', () => {
    const result = createAssignmentSchema.parse(valid);
    expect(result.maxScore).toBe(100);
    expect(result.type).toBe('HOMEWORK');
  });

  it('rejects negative maxScore', () => {
    const result = createAssignmentSchema.safeParse({ ...valid, maxScore: -1 });
    expect(result.success).toBe(false);
  });
});

describe('createSubmissionSchema', () => {
  it('accepts valid submission', () => {
    expect(createSubmissionSchema.safeParse({ content: 'My answer' }).success).toBe(true);
  });

  it('rejects empty content', () => {
    expect(createSubmissionSchema.safeParse({ content: '' }).success).toBe(false);
  });
});

describe('gradeSubmissionSchema', () => {
  it('accepts valid grade', () => {
    const result = gradeSubmissionSchema.parse({ score: 95 });
    expect(result.feedback).toBe('');
  });

  it('rejects negative score', () => {
    expect(gradeSubmissionSchema.safeParse({ score: -1 }).success).toBe(false);
  });
});

describe('markAttendanceSchema', () => {
  it('accepts valid attendance records', () => {
    const result = markAttendanceSchema.safeParse({
      records: [{ studentId: 's1', status: 'PRESENT' }],
      date: '2026-03-01T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty records array', () => {
    const result = markAttendanceSchema.safeParse({
      records: [],
      date: '2026-03-01T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = markAttendanceSchema.safeParse({
      records: [{ studentId: 's1', status: 'MISSING' }],
      date: '2026-03-01T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});

describe('idParamSchema', () => {
  it('accepts non-empty id', () => {
    expect(idParamSchema.safeParse({ id: 'abc123' }).success).toBe(true);
  });

  it('rejects empty id', () => {
    expect(idParamSchema.safeParse({ id: '' }).success).toBe(false);
  });
});

describe('schoolIdParamSchema', () => {
  it('accepts non-empty schoolId', () => {
    expect(schoolIdParamSchema.safeParse({ schoolId: 'sc1' }).success).toBe(true);
  });
});
