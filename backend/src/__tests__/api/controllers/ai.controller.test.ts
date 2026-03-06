import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes, mockNext } from '../../setup/express-helpers.js';

// ── Mocks (hoisted so they are available when vi.mock factories run) ──
const { mockGenerateText, mockGenerateJSON, mockChat, mockFindMany } = vi.hoisted(() => ({
  mockGenerateText: vi.fn(),
  mockGenerateJSON: vi.fn(),
  mockChat: vi.fn(),
  mockFindMany: vi.fn(),
}));

vi.mock('../../../services/ai.service.js', () => ({
  getAIService: () => ({
    generateText: mockGenerateText,
    generateJSON: mockGenerateJSON,
    chat: mockChat,
  }),
}));

vi.mock('../../../db/prisma.service.js', () => ({
  prisma: {
    budget: { findMany: mockFindMany },
  },
}));

import { aiController } from '../../../api/controllers/ai.controller.js';

describe('aiController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── generate ──────────────────────────────────────────────────

  describe('generate', () => {
    it('returns generated text on success', async () => {
      mockGenerateText.mockResolvedValueOnce('AI-generated content here');

      const req = mockReq({
        body: { prompt: 'Explain gravity', maxTokens: 500, temperature: 0.5, systemPrompt: 'Be concise' },
      });
      const res = mockRes();
      const next = mockNext();

      await aiController.generate(req, res, next);

      expect(mockGenerateText).toHaveBeenCalledWith('Explain gravity', {
        maxTokens: 500,
        temperature: 0.5,
        systemPrompt: 'Be concise',
      });
      expect(res._json).toEqual({ success: true, data: { content: 'AI-generated content here' } });
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next with error on failure', async () => {
      const err = new Error('AI unavailable');
      mockGenerateText.mockRejectedValueOnce(err);

      const req = mockReq({ body: { prompt: 'test' } });
      const res = mockRes();
      const next = mockNext();

      await aiController.generate(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── chat ──────────────────────────────────────────────────────

  describe('chat', () => {
    it('returns chat response on success', async () => {
      mockChat.mockResolvedValueOnce('Chat reply');

      const messages = [{ role: 'user', content: 'Hello' }];
      const req = mockReq({ body: { messages, maxTokens: 200, temperature: 0.8 } });
      const res = mockRes();
      const next = mockNext();

      await aiController.chat(req, res, next);

      expect(mockChat).toHaveBeenCalledWith(messages, { maxTokens: 200, temperature: 0.8 });
      expect(res._json).toEqual({ success: true, data: { content: 'Chat reply' } });
    });

    it('calls next with error on failure', async () => {
      const err = new Error('chat fail');
      mockChat.mockRejectedValueOnce(err);

      const req = mockReq({ body: { messages: [] } });
      const next = mockNext();

      await aiController.chat(req, mockRes(), next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ── generatePolicy ────────────────────────────────────────────

  describe('generatePolicy', () => {
    it('builds policy prompt from topic and audience', async () => {
      mockGenerateText.mockResolvedValueOnce('Policy document content');

      const req = mockReq({ body: { topic: 'Bullying Prevention', audience: 'Staff and students' } });
      const res = mockRes();

      await aiController.generatePolicy(req, res, mockNext());

      const calledPrompt = mockGenerateText.mock.calls[0][0] as string;
      expect(calledPrompt).toContain('Bullying Prevention');
      expect(calledPrompt).toContain('Staff and students');
      expect(res._json).toEqual({ success: true, data: { content: 'Policy document content' } });
    });

    it('calls next on error', async () => {
      mockGenerateText.mockRejectedValueOnce(new Error('fail'));
      const next = mockNext();

      await aiController.generatePolicy(mockReq({ body: {} }), mockRes(), next);

      expect(next).toHaveBeenCalled();
    });
  });

  // ── analyzeFeedback ───────────────────────────────────────────

  describe('analyzeFeedback', () => {
    it('returns parsed feedback analysis', async () => {
      const analysis = { themes: ['safety'], sentiment: 'positive', suggestions: ['more events'] };
      mockGenerateJSON.mockResolvedValueOnce(analysis);

      const req = mockReq({ body: { feedbackText: 'Great school, love the teachers' } });
      const res = mockRes();

      await aiController.analyzeFeedback(req, res, mockNext());

      const calledPrompt = mockGenerateJSON.mock.calls[0][0] as string;
      expect(calledPrompt).toContain('Great school, love the teachers');
      expect(res._json).toEqual({ success: true, data: analysis });
    });
  });

  // ── gradeAssist ───────────────────────────────────────────────

  describe('gradeAssist', () => {
    it('returns grading result with score and feedback', async () => {
      const gradeResult = { suggestedScore: 85, feedback: 'Good work', strengths: ['clarity'] };
      mockGenerateJSON.mockResolvedValueOnce(gradeResult);

      const req = mockReq({
        body: { submission: 'Essay content', rubric: 'Rubric details', maxScore: 100 },
      });
      const res = mockRes();

      await aiController.gradeAssist(req, res, mockNext());

      const calledPrompt = mockGenerateJSON.mock.calls[0][0] as string;
      expect(calledPrompt).toContain('Essay content');
      expect(calledPrompt).toContain('Rubric details');
      expect(calledPrompt).toContain('100');
      expect(res._json).toEqual({ success: true, data: gradeResult });
    });
  });

  // ── generateContent ───────────────────────────────────────────

  describe('generateContent', () => {
    it('generates educational content with given params', async () => {
      mockGenerateText.mockResolvedValueOnce('Lesson plan content');

      const req = mockReq({
        body: { topic: 'Fractions', gradeLevel: '5th Grade', contentType: 'lesson plan' },
      });
      const res = mockRes();

      await aiController.generateContent(req, res, mockNext());

      const calledPrompt = mockGenerateText.mock.calls[0][0] as string;
      expect(calledPrompt).toContain('Fractions');
      expect(calledPrompt).toContain('5th Grade');
      expect(calledPrompt).toContain('lesson plan');
      expect(res._json).toEqual({ success: true, data: { content: 'Lesson plan content' } });
    });
  });

  // ── detectGaps ────────────────────────────────────────────────

  describe('detectGaps', () => {
    it('returns gap analysis from quiz answers', async () => {
      const gaps = { commonGaps: ['algebra'], misconceptions: ['negative numbers'] };
      mockGenerateJSON.mockResolvedValueOnce(gaps);

      const req = mockReq({
        body: { answers: [{ q: 1, a: 'wrong' }], quizTopic: 'Math' },
      });
      const res = mockRes();

      await aiController.detectGaps(req, res, mockNext());

      const calledPrompt = mockGenerateJSON.mock.calls[0][0] as string;
      expect(calledPrompt).toContain('Math');
      expect(res._json).toEqual({ success: true, data: gaps });
    });
  });

  // ── crisisDraft ───────────────────────────────────────────────

  describe('crisisDraft', () => {
    it('generates crisis communication with scenario and audience', async () => {
      mockGenerateText.mockResolvedValueOnce('Emergency notice text');

      const req = mockReq({
        body: { scenario: 'Water leak in building B', audience: 'parents', tone: 'urgent' },
      });
      const res = mockRes();

      await aiController.crisisDraft(req, res, mockNext());

      const calledPrompt = mockGenerateText.mock.calls[0][0] as string;
      expect(calledPrompt).toContain('Water leak in building B');
      expect(calledPrompt).toContain('parents');
      expect(calledPrompt).toContain('urgent');
      expect(res._json).toEqual({ success: true, data: { content: 'Emergency notice text' } });
    });

    it('uses default tone and audience when not provided', async () => {
      mockGenerateText.mockResolvedValueOnce('Draft');

      const req = mockReq({ body: { scenario: 'Power outage' } });
      const res = mockRes();

      await aiController.crisisDraft(req, res, mockNext());

      const calledPrompt = mockGenerateText.mock.calls[0][0] as string;
      expect(calledPrompt).toContain('calm and reassuring');
      expect(calledPrompt).toContain('parents and staff');
    });
  });

  // ── predictBudget ─────────────────────────────────────────────

  describe('predictBudget', () => {
    it('queries historical budgets and returns prediction', async () => {
      const budgets = [
        { id: 'b1', schoolId: 's1', department: 'IT', amount: 50000, fiscalYear: 2024 },
        { id: 'b2', schoolId: 's1', department: 'IT', amount: 55000, fiscalYear: 2025 },
      ];
      mockFindMany.mockResolvedValueOnce(budgets);

      const prediction = {
        forecastYear: 2026,
        departments: [{ name: 'IT', predictedAllocation: 60000 }],
        totalPredicted: 60000,
      };
      mockGenerateJSON.mockResolvedValueOnce(prediction);

      const req = mockReq({ params: { schoolId: 's1' } });
      const res = mockRes();

      await aiController.predictBudget(req, res, mockNext());

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { schoolId: 's1' },
        orderBy: [{ fiscalYear: 'asc' }, { department: 'asc' }],
      });
      expect(res._json).toEqual({ success: true, data: prediction });
    });

    it('works with empty budget history', async () => {
      mockFindMany.mockResolvedValueOnce([]);
      mockGenerateJSON.mockResolvedValueOnce({ forecastYear: 2026, departments: [] });

      const req = mockReq({ params: { schoolId: 'new-school' } });
      const res = mockRes();

      await aiController.predictBudget(req, res, mockNext());

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { schoolId: 'new-school' } }),
      );
      expect((res._json as Record<string, unknown>).success).toBe(true);
    });

    it('calls next on Prisma or AI error', async () => {
      mockFindMany.mockRejectedValueOnce(new Error('DB down'));

      const next = mockNext();
      await aiController.predictBudget(mockReq({ params: { schoolId: 's1' } }), mockRes(), next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'DB down' }));
    });

    it('handles schoolId as string array (Express 5)', async () => {
      mockFindMany.mockResolvedValueOnce([]);
      mockGenerateJSON.mockResolvedValueOnce({});

      const req = mockReq({ params: { schoolId: ['s1', 's2'] } });
      const res = mockRes();

      await aiController.predictBudget(req, res, mockNext());

      // param() helper should pick first element
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { schoolId: 's1' } }),
      );
    });
  });
});
