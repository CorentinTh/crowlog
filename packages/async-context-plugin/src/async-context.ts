import { AsyncLocalStorage } from 'node:async_hooks';
import type { LoggerPlugin } from '@crowlog/logger';

const asyncLocalStorage = new AsyncLocalStorage<Record<string, unknown>>();

export function addLogContext(context: Record<string, unknown>) {
  const currentContext = asyncLocalStorage.getStore();

  if (!currentContext) {
    console.warn('Trying to add log context outside of a logger context, please use the wrapWithLoggerContext function to wrap your code with a logger context');
    return;
  }

  Object.assign(currentContext, context);
}

export function wrapWithLoggerContext<T>(data: Record<string, unknown>, cb: () => T) {
  return asyncLocalStorage.run({ ...data }, cb);
}

export function getLoggerContext() {
  return asyncLocalStorage.getStore();
}

export function clearLoggerContext() {
  asyncLocalStorage.enterWith({});
}

export function createAsyncContextPlugin(): LoggerPlugin {
  return {
    name: 'async-context',
    transformLogContext: ({ context }) => {
      const loggerContext = getLoggerContext();

      return {
        context: {
          ...context,
          data: {
            ...loggerContext,
            ...context.data,
          },
        },
      };
    },
  };
}
