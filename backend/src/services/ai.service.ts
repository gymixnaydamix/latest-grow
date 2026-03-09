import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

// ---------------------------------------------------------------------------
// AI Service Abstraction
// ---------------------------------------------------------------------------

export interface AIGenerateOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  generateText(prompt: string, options?: AIGenerateOptions): Promise<string>;
  generateJSON<T>(prompt: string, options?: AIGenerateOptions): Promise<T>;
  chat(messages: AIChatMessage[], options?: AIGenerateOptions): Promise<string>;
}

// ---------------------------------------------------------------------------
// Mock Provider (for dev/test)
// ---------------------------------------------------------------------------

class MockAIProvider implements AIProvider {
  async generateText(prompt: string): Promise<string> {
    logger.debug('MockAI generateText', { promptLength: prompt.length });
    return `[Mock AI Response] This is a simulated response for the prompt: "${prompt.slice(0, 100)}..."`;
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    logger.debug('MockAI generateJSON', { promptLength: prompt.length });

    // Return a generic mock object matching common patterns
    const mockResponse = {
      themes: ['Academic excellence', 'Community engagement', 'Innovation'],
      sentiment: 'positive',
      suggestions: [
        'Continue investing in technology infrastructure',
        'Increase parent engagement programs',
        'Develop more extracurricular activities',
      ],
      score: 85,
      feedback: 'This is a mock AI-generated analysis. In production, this would be powered by a real AI model.',
      content: `Mock generated content for: ${prompt.slice(0, 80)}`,
    };

    return mockResponse as T;
  }

  async chat(messages: AIChatMessage[]): Promise<string> {
    const lastMessage = messages[messages.length - 1];
    logger.debug('MockAI chat', { messageCount: messages.length });
    return `[Mock AI Chat] Response to: "${lastMessage?.content.slice(0, 100) ?? 'empty'}"`;
  }
}

// ---------------------------------------------------------------------------
// Ollama Provider (local LLM via Ollama)
// ---------------------------------------------------------------------------

class OllamaAIProvider implements AIProvider {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.model = model;
  }

  async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
    const messages: AIChatMessage[] = [];
    if (options?.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    return this.chat(messages, options);
  }

  async generateJSON<T>(prompt: string, options?: AIGenerateOptions): Promise<T> {
    const jsonPrompt = `${prompt}\n\nRespond ONLY with valid JSON. No markdown, no explanation, no code fences.`;
    const rawText = await this.generateText(jsonPrompt, options);

    // Extract JSON from possible markdown code block
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, rawText];
    const jsonStr = (jsonMatch[1] ?? rawText).trim();

    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      logger.error('Ollama returned invalid JSON', { rawText: rawText.slice(0, 500) });
      throw new AppError('AI returned invalid JSON', 502);
    }
  }

  async chat(messages: AIChatMessage[], options?: AIGenerateOptions): Promise<string> {
    const ollamaMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    logger.debug('Ollama chat request', { model: this.model, messageCount: messages.length });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000); // 2min timeout

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: ollamaMessages,
          stream: false,
          options: {
            num_predict: options?.maxTokens ?? 2048,
            temperature: options?.temperature ?? 0.7,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error('Ollama API error', { status: response.status, body: errorBody });
        throw new AppError(
          `Ollama API error: ${response.status} — ${errorBody.slice(0, 200)}`,
          502,
        );
      }

      const data = (await response.json()) as {
        message?: { role: string; content: string };
        response?: string;
        done: boolean;
      };

      const text = data.message?.content ?? data.response ?? '';
      if (!text) {
        throw new AppError('Ollama returned no content', 502);
      }

      logger.debug('Ollama chat response', { length: text.length });
      return text;
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      if ((err as Error).name === 'AbortError') {
        throw new AppError('Ollama request timed out', 504);
      }
      logger.error('Ollama connection error', { error: (err as Error).message });
      throw new AppError(
        `Cannot reach Ollama at ${this.baseUrl}. Is it running? Error: ${(err as Error).message}`,
        502,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

// ---------------------------------------------------------------------------
// Gemini Provider (production-ready stub)
// ---------------------------------------------------------------------------

class GeminiAIProvider implements AIProvider {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, options?: AIGenerateOptions): Promise<string> {
    const systemInstruction = options?.systemPrompt
      ? { parts: [{ text: options.systemPrompt }] }
      : undefined;

    const response = await fetch(
      `${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: options?.maxTokens ?? 2048,
            temperature: options?.temperature ?? 0.7,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('Gemini API error', { status: response.status, body: errorBody });
      throw new AppError(`Gemini API error: ${response.status}`, response.status >= 400 && response.status < 500 ? response.status : 502);
    }

    const data = (await response.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };

    const text = data.candidates[0]?.content.parts[0]?.text;
    if (!text) {
      throw new AppError('AI returned no content', 502);
    }
    return text;
  }

  async generateJSON<T>(prompt: string, options?: AIGenerateOptions): Promise<T> {
    const jsonPrompt = `${prompt}\n\nRespond ONLY with valid JSON. No markdown, no explanation.`;
    const rawText = await this.generateText(jsonPrompt, options);

    // Extract JSON from possible markdown code block
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, rawText];
    const jsonStr = (jsonMatch[1] ?? rawText).trim();

    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      throw new AppError('AI returned invalid JSON', 502);
    }
  }

  async chat(messages: AIChatMessage[], options?: AIGenerateOptions): Promise<string> {
    const systemMessages = messages.filter((m) => m.role === 'system');
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');

    const systemInstruction = systemMessages.length > 0
      ? { parts: [{ text: systemMessages.map((m) => m.content).join('\n') }] }
      : undefined;

    const contents = nonSystemMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents,
          generationConfig: {
            maxOutputTokens: options?.maxTokens ?? 2048,
            temperature: options?.temperature ?? 0.7,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error('Gemini chat API error', { status: response.status, body: errorBody });
      throw new AppError(`Gemini API error: ${response.status}`, response.status >= 400 && response.status < 500 ? response.status : 502);
    }

    const data = (await response.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };

    const chatText = data.candidates[0]?.content.parts[0]?.text;
    if (!chatText) {
      throw new AppError('AI returned no content', 502);
    }
    return chatText;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _aiService: AIProvider | null = null;

export function getAIService(): AIProvider {
  if (_aiService) return _aiService;

  switch (config.aiProvider) {
    case 'ollama':
      _aiService = new OllamaAIProvider(
        config.ollamaUrl ?? 'http://localhost:11434',
        config.ollamaModel ?? 'qwen2.5-coder:1.5b',
      );
      break;
    case 'gemini':
      if (!config.aiApiKey) {
        logger.warn('AI_API_KEY not set, falling back to mock provider');
        _aiService = new MockAIProvider();
      } else {
        _aiService = new GeminiAIProvider(config.aiApiKey);
      }
      break;
    case 'mock':
    default:
      _aiService = new MockAIProvider();
      break;
  }

  logger.info('AI service initialized', { provider: config.aiProvider });
  return _aiService;
}

export type { AIProvider as AIService };
