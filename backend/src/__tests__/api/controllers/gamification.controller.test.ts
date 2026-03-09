import { beforeEach, describe, expect, it } from 'vitest';
import { mockNext, mockReq, mockRes } from '../../setup/express-helpers.js';
import { gamificationController } from '../../../api/controllers/gamification.controller.js';

describe('gamificationController', () => {
  beforeEach(() => {
    // runtime service is stateful; controller reads fresh enough data for isolated expectations
  });

  it('returns workspace bootstrap metadata', () => {
    const req = mockReq({ user: { role: 'ADMIN', email: 'admin@test.dev' } as any });
    const res = mockRes();

    gamificationController.getBootstrap(req, res);

    expect(res._json).toMatchObject({
      success: true,
      data: {
        defaultPrimary: 'quizzes_challenges',
        defaultSecondary: 'quiz_builder',
      },
    });
  });

  it('returns a page payload', () => {
    const req = mockReq({
      params: { pageId: 'quiz_builder' } as any,
      query: { range: '30d', segment: 'all' } as any,
      user: { role: 'ADMIN', email: 'admin@test.dev' } as any,
    });
    const res = mockRes();
    const next = mockNext();

    gamificationController.getPage(req, res, next);

    expect(res._json).toMatchObject({
      success: true,
      data: {
        pageId: 'quiz_builder',
        title: 'Quiz Builder',
      },
    });
  });

  it('supports draft save, publish, rollback, export, and generic actions', () => {
    const res = mockRes();
    const next = mockNext();
    const baseUser = { role: 'ADMIN', email: 'admin@test.dev' } as any;

    gamificationController.saveDraft(
      mockReq({
        params: { pageId: 'quiz_builder' } as any,
        body: {
          title: 'Quiz Builder',
          summary: 'Updated draft summary',
          segment: 'all',
          status: 'Draft',
          scheduleStart: '2026-03-10T09:00',
          scheduleEnd: '2026-03-12T17:00',
          owner: 'Admin',
          notes: 'Updated notes',
          automationEnabled: true,
        },
        user: baseUser,
      }),
      res,
      next,
    );

    expect((res._json as any).success).toBe(true);

    const publishRes = mockRes();
    gamificationController.publish(mockReq({ params: { pageId: 'quiz_builder' } as any, user: baseUser }), publishRes, next);
    expect(publishRes._json).toMatchObject({ success: true, data: { action: 'publish' } });

    const rollbackRes = mockRes();
    gamificationController.rollback(
      mockReq({ params: { pageId: 'quiz_builder' } as any, body: { versionId: 'quiz_builder_v3' }, user: baseUser }),
      rollbackRes,
      next,
    );
    expect(rollbackRes._json).toMatchObject({ success: true, data: { action: 'rollback' } });

    const exportRes = mockRes();
    gamificationController.export(mockReq({ params: { pageId: 'quiz_builder' } as any, user: baseUser }), exportRes, next);
    expect(exportRes._json).toMatchObject({ success: true, data: { action: 'export' } });

    const actionRes = mockRes();
    gamificationController.runAction(
      mockReq({ params: { pageId: 'quiz_builder' } as any, body: { cardId: 'question_composer', action: 'Validate Question' }, user: baseUser }),
      actionRes,
      next,
    );
    expect(actionRes._json).toMatchObject({ success: true, data: { action: 'validate question' } });
  });
});
