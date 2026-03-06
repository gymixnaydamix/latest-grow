import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock config
vi.mock('../../config/index.js', () => ({
  config: { aiProvider: 'mock', aiApiKey: '' },
  isProduction: vi.fn(() => false),
}));

vi.mock('../../utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

// Must reset the singleton before each test
let getAIService: typeof import('../../services/ai.service.js')['getAIService'];

describe('AI Service', () => {
  beforeEach(async () => {
    vi.resetModules();
    // Re-import to get fresh singleton
    const mod = await import('../../services/ai.service.js');
    getAIService = mod.getAIService;
  });

  it('factory returns MockAIProvider when aiProvider=mock', () => {
    const svc = getAIService();
    expect(svc).toBeDefined();
    expect(svc.generateText).toBeTypeOf('function');
    expect(svc.generateJSON).toBeTypeOf('function');
    expect(svc.chat).toBeTypeOf('function');
  });

  it('singleton returns same instance on repeated calls', () => {
    const a = getAIService();
    const b = getAIService();
    expect(a).toBe(b);
  });

  it('MockAI.generateText returns templated string', async () => {
    const svc = getAIService();
    const result = await svc.generateText('Hello world');
    expect(result).toContain('[Mock AI Response]');
    expect(result).toContain('Hello world');
  });

  it('MockAI.generateJSON returns mock object', async () => {
    const svc = getAIService();
    const result = await svc.generateJSON<{ score: number }>('analyze');
    expect(result).toHaveProperty('score');
    expect(typeof result.score).toBe('number');
  });

  it('MockAI.chat uses last message content', async () => {
    const svc = getAIService();
    const result = await svc.chat([
      { role: 'user', content: 'First' },
      { role: 'user', content: 'Second message' },
    ]);
    expect(result).toContain('Second message');
  });
});

describe('Gemini provider fallback', () => {
  beforeEach(async () => {
    vi.resetModules();

    // Override config to simulate gemini without API key
    vi.doMock('../../config/index.js', () => ({
      config: { aiProvider: 'gemini', aiApiKey: '' },
      isProduction: vi.fn(() => false),
    }));

    const mod = await import('../../services/ai.service.js');
    getAIService = mod.getAIService;
  });

  it('falls back to MockAIProvider when gemini has no API key', async () => {
    const svc = getAIService();
    const result = await svc.generateText('test');
    expect(result).toContain('[Mock AI Response]');
  });
});

// ---------------------------------------------------------------------------
// GeminiAIProvider — tested via mocked fetch
// ---------------------------------------------------------------------------

describe('GeminiAIProvider', () => {
  const mockFetch = vi.fn();

  beforeEach(async () => {
    vi.resetModules();
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);

    vi.doMock('../../config/index.js', () => ({
      config: { aiProvider: 'gemini', aiApiKey: 'test-key-123' },
      isProduction: vi.fn(() => false),
    }));

    const mod = await import('../../services/ai.service.js');
    getAIService = mod.getAIService;
  });

  // ── generateText ────────────────────────────────────────────

  it('generateText sends correct request and returns text', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Generated text response' }] } }],
      }),
    });

    const svc = getAIService();
    const result = await svc.generateText('explain photosynthesis', {
      maxTokens: 500,
      temperature: 0.3,
      systemPrompt: 'You are a biology teacher',
    });

    expect(result).toBe('Generated text response');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('gemini-pro:generateContent');
    expect(url).toContain('key=test-key-123');

    const body = JSON.parse(opts.body);
    expect(body.contents[0].parts[0].text).toBe('explain photosynthesis');
    expect(body.generationConfig.maxOutputTokens).toBe(500);
    expect(body.generationConfig.temperature).toBe(0.3);
    expect(body.system_instruction.parts[0].text).toBe('You are a biology teacher');
  });

  it('generateText throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limited',
    });

    const svc = getAIService();
    await expect(svc.generateText('test')).rejects.toThrow('Gemini API error: 429');
  });

  it('generateText returns empty string when no candidates', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [] }),
    });

    const svc = getAIService();
    const result = await svc.generateText('test');
    expect(result).toBe('');
  });

  it('generateText uses default options when none provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'ok' }] } }],
      }),
    });

    const svc = getAIService();
    await svc.generateText('test');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.generationConfig.maxOutputTokens).toBe(2048);
    expect(body.generationConfig.temperature).toBe(0.7);
    expect(body.system_instruction).toBeUndefined();
  });

  // ── generateJSON ────────────────────────────────────────────

  it('generateJSON extracts JSON from markdown code fence', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '```json\n{"score": 95, "grade": "A"}\n```' }] } }],
      }),
    });

    const svc = getAIService();
    const result = await svc.generateJSON<{ score: number; grade: string }>('grade this');
    expect(result).toEqual({ score: 95, grade: 'A' });
  });

  it('generateJSON handles raw JSON without code fence', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"themes": ["math", "science"]}' }] } }],
      }),
    });

    const svc = getAIService();
    const result = await svc.generateJSON<{ themes: string[] }>('analyze');
    expect(result).toEqual({ themes: ['math', 'science'] });
  });

  it('generateJSON throws on invalid JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'not valid json at all' }] } }],
      }),
    });

    const svc = getAIService();
    await expect(svc.generateJSON('bad')).rejects.toThrow();
  });

  // ── chat ────────────────────────────────────────────────────

  it('chat maps roles correctly and extracts system messages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Hello student!' }] } }],
      }),
    });

    const svc = getAIService();
    const result = await svc.chat([
      { role: 'system', content: 'You are a math tutor' },
      { role: 'user', content: 'What is 2+2?' },
      { role: 'assistant', content: 'It is 4.' },
      { role: 'user', content: 'Thanks!' },
    ]);

    expect(result).toBe('Hello student!');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    // System message should be in system_instruction, not contents
    expect(body.system_instruction.parts[0].text).toBe('You are a math tutor');
    // 'assistant' role should be mapped to 'model'
    expect(body.contents).toEqual([
      { role: 'user', parts: [{ text: 'What is 2+2?' }] },
      { role: 'model', parts: [{ text: 'It is 4.' }] },
      { role: 'user', parts: [{ text: 'Thanks!' }] },
    ]);
  });

  it('chat throws on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal error',
    });

    const svc = getAIService();
    await expect(
      svc.chat([{ role: 'user', content: 'hi' }]),
    ).rejects.toThrow('Gemini API error: 500');
  });

  it('chat omits system_instruction when no system messages', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'reply' }] } }],
      }),
    });

    const svc = getAIService();
    await svc.chat([{ role: 'user', content: 'hello' }]);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.system_instruction).toBeUndefined();
  });
});
