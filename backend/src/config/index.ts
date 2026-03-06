import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (3 levels up from src/config/)
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiKey: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  databaseUrl: string;
  redisUrl: string;
  corsOrigins: string[];
  aiProvider: string;
  aiApiKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripePublishableKey: string;
  stripeSuccessUrl: string;
  stripeCancelUrl: string;
}

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    console.warn(`[config] WARNING: Missing env var ${name}, using empty default`);
    return '';
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const config: AppConfig = {
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  port: parseInt(optionalEnv('PORT', '4000'), 10),
  apiKey: requireEnv('API_KEY', 'dev-api-key'),
  jwtSecret: requireEnv('JWT_SECRET', 'dev-jwt-secret-change-in-production'),
  jwtExpiresIn: optionalEnv('JWT_EXPIRES_IN', '7d'),
  databaseUrl: requireEnv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/growyourneed?schema=public'),
  redisUrl: optionalEnv('REDIS_URL', 'redis://localhost:6379'),
  corsOrigins: optionalEnv('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  aiProvider: optionalEnv('AI_PROVIDER', 'mock'),
  aiApiKey: optionalEnv('AI_API_KEY', ''),
  stripeSecretKey: optionalEnv('STRIPE_SECRET_KEY', ''),
  stripeWebhookSecret: optionalEnv('STRIPE_WEBHOOK_SECRET', ''),
  stripePublishableKey: optionalEnv('STRIPE_PUBLISHABLE_KEY', ''),
  stripeSuccessUrl: optionalEnv('STRIPE_SUCCESS_URL', 'http://localhost:3000/parent?payment=success'),
  stripeCancelUrl: optionalEnv('STRIPE_CANCEL_URL', 'http://localhost:3000/parent?payment=cancel'),
};

export function isProduction(): boolean {
  return config.nodeEnv === 'production';
}

export function isDevelopment(): boolean {
  return config.nodeEnv === 'development';
}
