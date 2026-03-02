/**
 * Structured logger for Quantum-Shield-NFT services
 *
 * Respects LOG_LEVEL environment variable:
 * - production default: 'warn' (suppresses info/debug)
 * - development default: 'info'
 *
 * Outputs JSON in production, human-readable in development.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const isProduction = process.env['NODE_ENV'] === 'production';

const configuredLevel = (process.env['LOG_LEVEL'] as LogLevel) || (isProduction ? 'warn' : 'info');

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[configuredLevel];
}

function formatMessage(level: LogLevel, context: string, message: string, data?: unknown): void {
  if (!shouldLog(level)) return;

  if (isProduction) {
    const entry: Record<string, unknown> = {
      level,
      service: 'quantum-shield-nft',
      context,
      msg: message,
      timestamp: new Date().toISOString(),
    };
    if (data !== undefined) {
      entry.data = data;
    }
    const output = level === 'error' ? console.error : console.log;
    output(JSON.stringify(entry));
  } else {
    const prefix = { debug: '🔍', info: 'ℹ️ ', warn: '⚠️ ', error: '❌', silent: '' }[level];
    const output = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    output(`${prefix} [${context}] ${message}`);
    if (data !== undefined) {
      output(data);
    }
  }
}

export function createLogger(context: string) {
  return {
    debug: (msg: string, data?: unknown) => formatMessage('debug', context, msg, data),
    info: (msg: string, data?: unknown) => formatMessage('info', context, msg, data),
    warn: (msg: string, data?: unknown) => formatMessage('warn', context, msg, data),
    error: (msg: string, data?: unknown) => formatMessage('error', context, msg, data),
  };
}

export type Logger = ReturnType<typeof createLogger>;
