import { createInMemoryLoggerTransport, createLogger } from '@crowlog/logger';
import { describe, expect, test } from 'vitest';
import { addLogContext, clearLoggerContext, createAsyncContextPlugin, wrapWithLoggerContext } from './async-context';

describe('async-context', () => {
  test('when a logger is logging a message withing a logger context, the data provided with addLogContext is merged with the logger context', () => {
    const transport = createInMemoryLoggerTransport();

    const logger = createLogger({
      namespace: 'test',
      plugins: [createAsyncContextPlugin()],
      transports: [transport],
    });

    wrapWithLoggerContext({ a: 1 }, () => {
      addLogContext({ b: 2 });

      logger.info({ c: 3 }, 'test');
    });

    expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
      {
        level: 'info',
        message: 'test',
        namespace: 'test',
        data: {
          a: 1,
          b: 2,
          c: 3,
        },
      },
    ]);
  });

  test('in case of context collision, the context from the logger is preferred', () => {
    const transport = createInMemoryLoggerTransport();

    const logger = createLogger({
      namespace: 'test',
      plugins: [createAsyncContextPlugin()],
      transports: [transport],
    });

    wrapWithLoggerContext({ a: 1 }, () => {
      addLogContext({ a: 2 });

      logger.info({ a: 3 }, 'test');
    });

    expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
      {
        level: 'info',
        message: 'test',
        namespace: 'test',
        data: {
          a: 3,
        },
      },
    ]);
  });

  test('if addLogContext is called outside of a logger context, no error is thrown', () => {
    expect(() => addLogContext({ a: 1 })).not.to.throw();
  });

  describe('clearLoggerContext', () => {
    test('the context can be cleared', () => {
      const transport = createInMemoryLoggerTransport();

      const logger = createLogger({
        namespace: 'test',
        plugins: [createAsyncContextPlugin()],
        transports: [transport],
      });

      wrapWithLoggerContext({ a: 1 }, () => {
        addLogContext({ b: 2 });

        clearLoggerContext();

        addLogContext({ c: 3 });
        logger.info({ d: 4 }, 'test');
      });

      expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
        {
          level: 'info',
          message: 'test',
          namespace: 'test',
          data: { c: 3, d: 4 },
        },
      ]);
    });
  });

  describe('wrapWithLoggerContext', () => {
    test('two distinct contexts do not pollute each other, even with the same logger', () => {
      const transport = createInMemoryLoggerTransport();

      const logger = createLogger({
        namespace: 'test',
        plugins: [createAsyncContextPlugin()],
        transports: [transport],
      });

      wrapWithLoggerContext({ a: 1 }, () => {
        addLogContext({ b: 2 });

        logger.info({ c: 3 }, 'test');
      });

      wrapWithLoggerContext({ a: 4 }, () => {
        addLogContext({ b: 5, c: 6 });
        logger.info({ d: 7 }, 'test');
      });

      expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
        {
          level: 'info',
          message: 'test',
          namespace: 'test',
          data: { a: 1, b: 2, c: 3 },
        },
        {
          level: 'info',
          message: 'test',
          namespace: 'test',
          data: { a: 4, b: 5, c: 6, d: 7 },
        },
      ]);
    });

    describe('the context is preserved in deferred callbacks', () => {
      test('context is preserved in setImmediate', async () => {
        const transport = createInMemoryLoggerTransport();

        const logger = createLogger({
          namespace: 'test',
          plugins: [createAsyncContextPlugin()],
          transports: [transport],
        });

        await wrapWithLoggerContext({ a: 1 }, async () => {
          addLogContext({ b: 2 });

          setImmediate(() => {
            logger.info({ c: 3 }, 'test');
          });
        });

        await new Promise(resolve => setImmediate(resolve));

        expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'test',
            namespace: 'test',
            data: { a: 1, b: 2, c: 3 },
          },
        ]);
      });

      test('context is preserved in setTimeout', async () => {
        const transport = createInMemoryLoggerTransport();

        const logger = createLogger({
          namespace: 'test',
          plugins: [createAsyncContextPlugin()],
          transports: [transport],
        });

        await wrapWithLoggerContext({ a: 1 }, async () => {
          addLogContext({ b: 2 });

          setTimeout(() => {
            logger.info({ c: 3 }, 'test');
          }, 0);
        });

        await new Promise(resolve => setTimeout(resolve, 0));

        expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'test',
            namespace: 'test',
            data: { a: 1, b: 2, c: 3 },
          },
        ]);
      });

      test('context is preserved in resolved Promise.then', async () => {
        const transport = createInMemoryLoggerTransport();

        const logger = createLogger({
          namespace: 'test',
          plugins: [createAsyncContextPlugin()],
          transports: [transport],
        });

        await wrapWithLoggerContext({ a: 1 }, async () => {
          addLogContext({ b: 2 });

          Promise.resolve().then(() => {
            logger.info({ c: 3 }, 'test');
          });
        });

        await new Promise(resolve => setImmediate(resolve));

        expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'test',
            namespace: 'test',
            data: { a: 1, b: 2, c: 3 },
          },
        ]);
      });
    });

    describe('wrapping can be nested', () => {
      test('with nested wrappings, the contexts of all levels are merged', () => {
        const transport = createInMemoryLoggerTransport();

        const logger = createLogger({
          namespace: 'test',
          plugins: [createAsyncContextPlugin()],
          transports: [transport],
        });

        wrapWithLoggerContext({ a: 1 }, () => {
          addLogContext({ b: 2 });

          logger.info({ c: 3 }, 'test1');

          wrapWithLoggerContext({ d: 4 }, () => {
            addLogContext({ e: 5 });

            logger.info({ f: 6 }, 'test2');
          });

          logger.info({ g: 7 }, 'test3');
        });

        expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'test1',
            namespace: 'test',
            data: { a: 1, b: 2, c: 3 },
          },
          {
            level: 'info',
            message: 'test2',
            namespace: 'test',
            data: { a: 1, b: 2, d: 4, e: 5, f: 6 },
          },
          {
            level: 'info',
            message: 'test3',
            namespace: 'test',
            data: { a: 1, b: 2, g: 7 },
          },
        ]);
      });

      test('when nested wrappings have colliding keys, the innermost wrapping takes precedence', () => {
        const transport = createInMemoryLoggerTransport();

        const logger = createLogger({
          namespace: 'test',
          plugins: [createAsyncContextPlugin()],
          transports: [transport],
        });

        wrapWithLoggerContext({ a: 1 }, () => {
          addLogContext({ b: 2 });

          logger.info({ c: 3 }, 'test1');

          wrapWithLoggerContext({ a: 4 }, () => {
            addLogContext({ b: 5 });

            logger.info({ f: 6 }, 'test2');
          });

          logger.info({ g: 7 }, 'test3');
        });

        expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'test1',
            namespace: 'test',
            data: { a: 1, b: 2, c: 3 },
          },
          {
            level: 'info',
            message: 'test2',
            namespace: 'test',
            data: { a: 4, b: 5, f: 6 },
          },
          {
            level: 'info',
            message: 'test3',
            namespace: 'test',
            data: { a: 1, b: 2, g: 7 },
          },
        ]);
      });
    });
  });
});
