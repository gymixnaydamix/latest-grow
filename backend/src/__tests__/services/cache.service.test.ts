import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock redis
const mockRedisClient = {
  connect: vi.fn(),
  quit: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
  on: vi.fn(),
  isOpen: true,
};

vi.mock('redis', () => ({
  createClient: vi.fn(() => mockRedisClient),
}));

vi.mock('../../config/index.js', () => ({
  config: { redisUrl: 'redis://localhost:6379' },
}));

vi.mock('../../utils/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { cacheService, connectRedis, disconnectRedis } from '../../services/cache.service.js';

describe('connectRedis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedisClient.connect.mockResolvedValue(undefined);
  });

  it('connects to Redis and registers event listeners', async () => {
    await connectRedis();
    expect(mockRedisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockRedisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockRedisClient.connect).toHaveBeenCalled();
  });
});

describe('cacheService.get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns parsed JSON on hit', async () => {
    // Ensure client is connected first
    await connectRedis();
    mockRedisClient.get.mockResolvedValue('{"name":"test"}');

    const result = await cacheService.get('key1');
    expect(result).toEqual({ name: 'test' });
  });

  it('returns null on miss', async () => {
    await connectRedis();
    mockRedisClient.get.mockResolvedValue(null);

    const result = await cacheService.get('missing');
    expect(result).toBeNull();
  });

  it('returns null on Redis error (graceful)', async () => {
    await connectRedis();
    mockRedisClient.get.mockRejectedValue(new Error('Connection lost'));

    const result = await cacheService.get('key1');
    expect(result).toBeNull();
  });
});

describe('cacheService.set', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await connectRedis();
  });

  it('stores JSON with TTL', async () => {
    mockRedisClient.set.mockResolvedValue('OK');
    await cacheService.set('k', { a: 1 }, 600);
    expect(mockRedisClient.set).toHaveBeenCalledWith('k', '{"a":1}', { EX: 600 });
  });
});

describe('cacheService.del', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await connectRedis();
  });

  it('deletes a key', async () => {
    mockRedisClient.del.mockResolvedValue(1);
    await cacheService.del('k');
    expect(mockRedisClient.del).toHaveBeenCalledWith('k');
  });
});

describe('cacheService.flush', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await connectRedis();
  });

  it('deletes all matching keys', async () => {
    mockRedisClient.keys.mockResolvedValue(['cache:1', 'cache:2']);
    mockRedisClient.del.mockResolvedValue(2);

    await cacheService.flush('cache:*');
    expect(mockRedisClient.keys).toHaveBeenCalledWith('cache:*');
    expect(mockRedisClient.del).toHaveBeenCalledWith(['cache:1', 'cache:2']);
  });
});

describe('cacheService.isConnected', () => {
  it('returns true when client is open', async () => {
    await connectRedis();
    mockRedisClient.isOpen = true;
    expect(cacheService.isConnected()).toBe(true);
  });
});

describe('disconnectRedis', () => {
  it('calls quit and logs', async () => {
    await connectRedis();
    mockRedisClient.quit.mockResolvedValue(undefined);
    await disconnectRedis();
    expect(mockRedisClient.quit).toHaveBeenCalled();
  });
});
