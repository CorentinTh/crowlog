import type { LoggerPlugin } from './logger.types';
import { describe, expect, test } from 'vitest';
import { applyPluginsTransformLogContext } from './logger';

describe('logger', () => {
  describe('applyPluginsTransformLogContext', () => {
    test('plugins can define  an optional transformLogContext function that will be called with the base context and the plugins', () => {
      const plugin: LoggerPlugin = {
        name: 'test',
        transformLogContext: ({ context }) => ({
          context: {
            ...context,
            message: `[prefix] ${context.message}`,
            level: 'debug',
            data: {
              ...context.data,
              b: 2,
            },
          },
        }),
      };

      const baseContext = {
        level: 'info',
        message: 'test',
        timestampMs: new Date('2025-01-01').getTime(),
        namespace: 'test',
        data: {
          a: 1,
        },
      } as const;

      const extendedContext = applyPluginsTransformLogContext({ baseContext, plugins: [plugin] });

      expect(extendedContext).to.deep.equal({
        level: 'debug',
        message: '[prefix] test',
        timestampMs: new Date('2025-01-01').getTime(),
        namespace: 'test',
        data: { a: 1, b: 2 },
      });
    });
  });
});
