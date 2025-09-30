import type { Logger, LogLevel, LogMethodArguments } from './logger.types';
import { logLevels } from './logger.constants';

export function createNoopLogger(): Logger {
  return {
    ...Object.fromEntries(logLevels.map(level => [level, () => {}])) as Record<LogLevel, (...args: LogMethodArguments) => void>,
    getTransports: () => [],
    getPlugins: () => [],
    createChildLogger: () => createNoopLogger(),
  };
}
