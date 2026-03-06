import type { Request, Response, NextFunction } from 'express';
import { getAIService } from '../../services/ai.service.js';
import { prisma } from '../../db/prisma.service.js';

/** Express 5 params can be string | string[] — helper to coerce */
const param = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

export const aiController = {
  /**
   * Generic text generation (used by various AI features)
   */
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ai = getAIService();
      const result = await ai.generateText(req.body.prompt, {
        maxTokens: req.body.maxTokens,
        temperature: req.body.temperature,
        systemPrompt: req.body.systemPrompt,
      });
      res.json({ success: true, data: { content: result } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Chat interface (Study Assistant, Parent AI Coach, etc.)
   */
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ai = getAIService();
      const result = await ai.chat(req.body.messages, {
        maxTokens: req.body.maxTokens,
        temperature: req.body.temperature,
      });
      res.json({ success: true, data: { content: result } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Policy Generator — AI drafts a school policy
   */
  async generatePolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topic, audience } = req.body;
      const ai = getAIService();

      const prompt = `
You are a professional school policy writer. Generate a comprehensive, formal school policy document.

Topic: ${topic}
Target Audience: ${audience}

The policy should include:
1. Policy Title
2. Purpose & Scope
3. Definitions (if applicable)
4. Policy Statement (detailed sections)
5. Responsibilities
6. Compliance & Consequences
7. Review & Revision History placeholder

Write in a professional, clear tone appropriate for an educational institution.
      `.trim();

      const content = await ai.generateText(prompt, { maxTokens: 4096, temperature: 0.5 });
      res.json({ success: true, data: { content } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Community Feedback AI — Analyzes raw feedback text
   */
  async analyzeFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { feedbackText } = req.body;
      const ai = getAIService();

      const prompt = `
Analyze the following raw feedback from a school community. Extract key information and return ONLY valid JSON.

Feedback:
"""
${feedbackText}
"""

Return a JSON object with:
{
  "themes": ["theme1", "theme2", ...],
  "sentiment": "positive" | "negative" | "mixed",
  "suggestions": ["suggestion1", "suggestion2", ...],
  "urgentItems": ["any urgent concerns"],
  "summary": "brief 2-3 sentence summary"
}
      `.trim();

      const result = await ai.generateJSON(prompt);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * AI-Assisted Grading — Analyzes student submission against rubric
   */
  async gradeAssist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { submission, rubric, maxScore } = req.body;
      const ai = getAIService();

      const prompt = `
You are an educational assessment assistant. Grade the following student submission against the provided rubric.

Student Submission:
"""
${submission}
"""

Rubric:
"""
${rubric}
"""

Maximum Score: ${maxScore}

Return ONLY valid JSON:
{
  "suggestedScore": <number>,
  "feedback": "<detailed constructive feedback>",
  "strengths": ["strength1", ...],
  "areasForImprovement": ["area1", ...],
  "rubricBreakdown": [{"criterion": "...", "score": <number>, "comment": "..."}]
}
      `.trim();

      const result = await ai.generateJSON(prompt);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Content Generator — Creates educational materials
   */
  async generateContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topic, gradeLevel, contentType } = req.body;
      const ai = getAIService();

      const prompt = `
Generate educational content with the following specifications:
- Topic: ${topic}
- Grade Level: ${gradeLevel}
- Content Type: ${contentType}

Create high-quality, engaging content appropriate for the specified grade level.
If the content type is "quiz", include questions with answer keys.
If it's a "lesson plan", include objectives, activities, and assessment criteria.
      `.trim();

      const content = await ai.generateText(prompt, { maxTokens: 4096, temperature: 0.7 });
      res.json({ success: true, data: { content } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Smart Gap Detector — Analyzes quiz answers to find knowledge gaps
   */
  async detectGaps(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { answers, quizTopic } = req.body;
      const ai = getAIService();

      const prompt = `
Analyze these student quiz answers to identify common knowledge gaps across the class.

Quiz Topic: ${quizTopic}
Student Answers (array of all student responses):
${JSON.stringify(answers, null, 2)}

Return ONLY valid JSON:
{
  "commonGaps": ["gap1", "gap2", ...],
  "misconceptions": ["misconception1", ...],
  "strongAreas": ["area1", ...],
  "teachingStrategies": ["strategy1", ...],
  "overallAnalysis": "brief summary"
}
      `.trim();

      const result = await ai.generateJSON(prompt);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crisis Management — Generates emergency communication drafts
   */
  async crisisDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { scenario, audience, tone } = req.body;
      const ai = getAIService();

      const prompt = `
You are a school crisis communication specialist. Draft a clear, ${tone || 'calm and reassuring'} message for ${audience || 'parents and staff'}.

Crisis Scenario: ${scenario}

The message should:
1. Clearly state the situation
2. Outline immediate actions being taken
3. Provide instructions for the audience
4. Include contact information placeholders
5. End with reassurance

Keep the tone professional yet empathetic.
      `.trim();

      const content = await ai.generateText(prompt, { maxTokens: 2048, temperature: 0.3 });
      res.json({ success: true, data: { content } });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Predictive Budgeting — AI forecasts based on historical data
   */
  async predictBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = param(req.params.schoolId);
      const ai = getAIService();

      // Get historical budget data
      const budgets = await prisma.budget.findMany({
        where: { schoolId },
        orderBy: [{ fiscalYear: 'asc' }, { department: 'asc' }],
      });

      const prompt = `
Analyze the following historical budget data and provide a predictive budget forecast for the next fiscal year.

Historical Budgets:
${JSON.stringify(budgets, null, 2)}

Return ONLY valid JSON:
{
  "forecastYear": <number>,
  "departments": [
    {"name": "...", "predictedAllocation": <number>, "confidence": "high|medium|low", "reasoning": "..."}
  ],
  "totalPredicted": <number>,
  "insights": ["insight1", ...],
  "risks": ["risk1", ...]
}
      `.trim();

      const result = await ai.generateJSON(prompt);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
