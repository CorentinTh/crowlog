import type { LoggerTransport, LogLevel } from '../../logger.types';

const consoleMethodMap: Record<LogLevel, 'log' | 'warn' | 'error'> = {
  debug: 'log',
  info: 'log',
  warn: 'warn',
  error: 'error',
};

export function createConsoleLoggerTransport({
  console = globalThis.console,
}: {
  console?: Record<'log' | 'warn' | 'error', (...args: any[]) => void>;
} = {}): LoggerTransport {
  return {
    name: 'console',
    log(args) {
      const consoleMethod = consoleMethodMap[args.level];

      console[consoleMethod](JSON.stringify(args));
    },
  };
}
