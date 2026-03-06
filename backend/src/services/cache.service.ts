import { createClient, type RedisClientType } from 'redis';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let client: RedisClientType | null = null;

export async function connectRedis(): Promise<void> {
  try {
    client = createClient({
      url: config.redisUrl,
      socket: {
        connectTimeout: 3000,
        reconnectStrategy: false,  // Don't retry — cache is optional
      },
    });

    client.on('error', (err) => {
      logger.error('Redis client error', { error: String(err) });
    });

    client.on('connect', () => {
      logger.info('Redis client connected');
    });

    await client.connect();
  } catch (error) {
    logger.warn('Redis connection failed, caching disabled', {
      error: error instanceof Error ? error.message : String(error),
    });
    client = null;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
    logger.info('Redis disconnected');
  }
}

export const cacheService = {
  connect: connectRedis,
  disconnect: disconnectRedis,

  async get<T>(key: string): Promise<T | null> {
    if (!client) return null;
    try {
      const data = await client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    if (!client) return;
    try {
      await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (error) {
      logger.warn('Cache set failed', { key, error: String(error) });
    }
  },

  async del(key: string): Promise<void> {
    if (!client) return;
    try {
      await client.del(key);
    } catch (error) {
      logger.warn('Cache del failed', { key, error: String(error) });
    }
  },

  async flush(pattern: string): Promise<void> {
    if (!client) return;
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      logger.warn('Cache flush failed', { pattern, error: String(error) });
    }
  },

  isConnected(): boolean {
    return client !== null && client.isOpen;
  },
};
