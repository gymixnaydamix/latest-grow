import { isProduction } from '../config/index.js';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
}

function formatEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function createEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
}

export const logger = {
  info(message: string, data?: Record<string, unknown>): void {
    const entry = createEntry('info', message, data);
    console.log(formatEntry(entry));
  },

  warn(message: string, data?: Record<string, unknown>): void {
    const entry = createEntry('warn', message, data);
    console.warn(formatEntry(entry));
  },

  error(message: string, data?: Record<string, unknown>): void {
    const entry = createEntry('error', message, data);
    console.error(formatEntry(entry));
  },

  debug(message: string, data?: Record<string, unknown>): void {
    if (!isProduction()) {
      const entry = createEntry('debug', message, data);
      console.debug(formatEntry(entry));
    }
  },
};
