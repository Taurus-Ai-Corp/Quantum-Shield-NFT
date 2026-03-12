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

const VALID_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];
const rawLevel = process.env['LOG_LEVEL'] as LogLevel;
const configuredLevel: LogLevel = VALID_LEVELS.includes(rawLevel) ? rawLevel : (isProduction ? 'warn' : 'info');

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[configuredLevel];
}

function sanitize(input: string): string {
  return input.replace(/[\r\n\x00-\x1f\x7f]/g, ' ');
}

function formatMessage(level: LogLevel, context: string, message: string, data?: unknown): void {
  if (!shouldLog(level)) return;

  const safeMessage = sanitize(message);

  if (isProduction) {
    const entry: Record<string, unknown> = {
      level,
      service: 'quantum-shield-nft',
      context,
      msg: safeMessage,
      timestamp: new Date().toISOString(),
    };
    if (data !== undefined) {
      entry['data'] = data;
    }
    const output = level === 'error' ? console.error : console.log;
    output(JSON.stringify(entry));
  } else {
    const prefix = { debug: '🔍', info: 'ℹ️ ', warn: '⚠️ ', error: '❌', silent: '' }[level];
    const output = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    output(`${prefix} [${context}] ${safeMessage}`);
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
