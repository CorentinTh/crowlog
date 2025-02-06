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
  });
});
