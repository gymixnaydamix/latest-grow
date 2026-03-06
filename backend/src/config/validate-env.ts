import { config } from './index.js';

const requiredInProduction = [
  'JWT_SECRET',
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_SUCCESS_URL',
  'STRIPE_CANCEL_URL',
] as const;
const recommended = ['REDIS_URL', 'CORS_ORIGINS', 'AI_API_KEY', 'STRIPE_PUBLISHABLE_KEY'] as const;

export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (config.nodeEnv === 'production') {
    for (const key of requiredInProduction) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    if (config.jwtSecret === 'dev-jwt-secret-change-in-production') {
      missing.push('JWT_SECRET (still using dev default)');
    }
  }

  for (const key of recommended) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  if (warnings.length > 0) {
    console.warn(`[env] Optional env vars not set: ${warnings.join(', ')}`);
  }

  if (missing.length > 0) {
    const msg = `[env] FATAL: Missing required env vars in production: ${missing.join(', ')}`;
    console.error(msg);
    throw new Error(msg);
  }

  console.log(`[env] Environment validated (${config.nodeEnv})`);
}

// Run directly: tsx src/config/validate-env.ts
if (process.argv[1]?.includes('validate-env')) {
  validateEnv();
}
