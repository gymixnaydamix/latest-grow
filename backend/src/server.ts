import { createApp } from './app.js';
import { config } from './config/index.js';
import { validateEnv } from './config/validate-env.js';
import { connectDatabase, disconnectDatabase } from './db/prisma.service.js';
import { cacheService } from './services/cache.service.js';
import { authService } from './services/auth.service.js';
import { wsService } from './services/websocket.service.js';
import { logger } from './utils/logger.js';
import { createServer } from 'node:http';

async function bootstrap() {
  // 1. Validate environment
  validateEnv();

  // 2. Connect to services
  await connectDatabase();
  await cacheService.connect();

  // 3. Ensure all dev / demo users exist
  if (config.nodeEnv !== 'production') {
    await authService.ensureDevUsers();
  }

  // 4. Create and start Express app
  const app = createApp();
  const server = createServer(app);

  // 5. Initialize WebSocket server on the same HTTP server
  wsService.init(server);

  server.listen(config.port, () => {
    logger.info(`🚀 Server running on http://localhost:${config.port}`);
    logger.info(`   Environment: ${config.nodeEnv}`);
    logger.info(`   WebSocket: ws://localhost:${config.port}/ws`);
  });

  // 6. Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    wsService.close();
    server.close(async () => {
      await disconnectDatabase();
      await cacheService.disconnect();
      logger.info('All connections closed. Goodbye.');
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
