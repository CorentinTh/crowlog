import { describe, expect, test } from 'vitest';
import { createInMemoryLoggerTransport, createLogger } from '../../index';
import { createGlobalLogContextPlugin } from './global-log-context.plugin';

describe('global-context-plugin', () => {
  describe('this plugin permits to add a global context to all logs', () => {
    test('when a global context is set, it is merged with the log data', () => {
      const transport = createInMemoryLoggerTransport();

      const { globalContextPlugin, setGlobalLogContext } = createGlobalLogContextPlugin();

      const logger = createLogger({
        namespace: 'test',
        plugins: [globalContextPlugin],
        transports: [transport],
      });

      setGlobalLogContext({ a: 1, b: 2 });

      logger.info({ c: 3 }, 'test');

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

      const { globalContextPlugin, setGlobalLogContext } = createGlobalLogContextPlugin();

      const logger = createLogger({
        namespace: 'test',
        plugins: [globalContextPlugin],
        transports: [transport],
      });

      setGlobalLogContext({ a: 1, b: 2 });

      logger.info({ a: 3 }, 'test');

      expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
        {
          level: 'info',
          message: 'test',
          namespace: 'test',
          data: {
            a: 3,
            b: 2,
          },
        },
      ]);
    });

    test('when no global context is set, nothing is added to the logs', () => {
      const transport = createInMemoryLoggerTransport();

      const { globalContextPlugin } = createGlobalLogContextPlugin();

      const logger = createLogger({
        namespace: 'test',
        plugins: [globalContextPlugin],
        transports: [transport],
      });

      logger.info({ a: 1 }, 'test');

      expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
        {
          level: 'info',
          message: 'test',
          namespace: 'test',
          data: {
            a: 1,
          },
        },
      ]);
    });

    describe('addToGlobalLogContext', () => {
      test('addToGlobalLogContext merges with existing global context', () => {
        const transport = createInMemoryLoggerTransport();

        const { globalContextPlugin, setGlobalLogContext, addToGlobalLogContext } = createGlobalLogContextPlugin();

        const logger = createLogger({
          namespace: 'test',
          plugins: [globalContextPlugin],
          transports: [transport],
        });

        setGlobalLogContext({ a: 1 });
        addToGlobalLogContext({ b: 2 });

        logger.info({ c: 3 }, 'test');

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

      test('addToGlobalLogContext can override existing global context properties', () => {
        const transport = createInMemoryLoggerTransport();

        const { globalContextPlugin, setGlobalLogContext, addToGlobalLogContext } = createGlobalLogContextPlugin();

        const logger = createLogger({
          namespace: 'test',
          plugins: [globalContextPlugin],
          transports: [transport],
        });

        setGlobalLogContext({ a: 1, b: 2 });
        addToGlobalLogContext({ a: 10 });

        logger.info({ c: 3 }, 'test');

        expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'test',
            namespace: 'test',
            data: {
              a: 10,
              b: 2,
              c: 3,
            },
          },
        ]);
      });

      test('addToGlobalLogContext works when no global context was initially set', () => {
        const transport = createInMemoryLoggerTransport();

        const { globalContextPlugin, addToGlobalLogContext } = createGlobalLogContextPlugin();

        const logger = createLogger({
          namespace: 'test',
          plugins: [globalContextPlugin],
          transports: [transport],
        });

        addToGlobalLogContext({ a: 1 });

        logger.info({ b: 2 }, 'test');

        expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'test',
            namespace: 'test',
            data: {
              a: 1,
              b: 2,
            },
          },
        ]);
      });
    });

    describe('getGlobalLogContext', () => {
      test('getGlobalLogContext returns the current global context', () => {
        const { setGlobalLogContext, getGlobalLogContext } = createGlobalLogContextPlugin();

        setGlobalLogContext({ a: 1, b: 2 });

        expect(getGlobalLogContext()).to.eql({ a: 1, b: 2 });
      });

      test('getGlobalLogContext returns null when no context is set', () => {
        const { getGlobalLogContext } = createGlobalLogContextPlugin();

        expect(getGlobalLogContext()).to.eql(null);
      });

      test('getGlobalLogContext returns updated context after addToGlobalLogContext', () => {
        const { setGlobalLogContext, addToGlobalLogContext, getGlobalLogContext } = createGlobalLogContextPlugin();

        setGlobalLogContext({ a: 1 });
        addToGlobalLogContext({ b: 2 });

        expect(getGlobalLogContext()).to.eql({ a: 1, b: 2 });
      });
    });

    describe('multiple loggers with same plugin instance', () => {
      test('two loggers using the same plugin instance share the global context', () => {
        const transport1 = createInMemoryLoggerTransport();
        const transport2 = createInMemoryLoggerTransport();

        const { globalContextPlugin, setGlobalLogContext } = createGlobalLogContextPlugin();

        const logger1 = createLogger({
          namespace: 'logger1',
          plugins: [globalContextPlugin],
          transports: [transport1],
        });

        const logger2 = createLogger({
          namespace: 'logger2',
          plugins: [globalContextPlugin],
          transports: [transport2],
        });

        setGlobalLogContext({ shared: 'value' });

        logger1.info({ a: 1 }, 'test1');
        logger2.info({ b: 2 }, 'test2');

        expect(transport1.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'test1',
            namespace: 'logger1',
            data: {
              shared: 'value',
              a: 1,
            },
          },
        ]);

        expect(transport2.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'test2',
            namespace: 'logger2',
            data: {
              shared: 'value',
              b: 2,
            },
          },
        ]);
      });
    });

    describe('child logger', () => {
      test('child logger inherits the global context plugin from parent', () => {
        const transport = createInMemoryLoggerTransport();

        const { globalContextPlugin, setGlobalLogContext } = createGlobalLogContextPlugin();

        const parentLogger = createLogger({
          namespace: 'parent',
          plugins: [globalContextPlugin],
          transports: [transport],
        });

        const childLogger = parentLogger.createChildLogger({ namespace: 'child' });

        setGlobalLogContext({ environment: 'production', version: '1.0' });

        parentLogger.info({ parentData: 'value' }, 'parent log');
        childLogger.info({ childData: 'value' }, 'child log');

        expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'parent log',
            namespace: 'parent',
            data: {
              environment: 'production',
              version: '1.0',
              parentData: 'value',
            },
          },
          {
            level: 'info',
            message: 'child log',
            namespace: 'child',
            data: {
              environment: 'production',
              version: '1.0',
              childData: 'value',
            },
          },
        ]);
      });

      test('global context updates affect both parent and child loggers', () => {
        const transport = createInMemoryLoggerTransport();

        const { globalContextPlugin, setGlobalLogContext } = createGlobalLogContextPlugin();

        const parentLogger = createLogger({
          namespace: 'parent',
          plugins: [globalContextPlugin],
          transports: [transport],
        });

        const childLogger = parentLogger.createChildLogger({ namespace: 'child' });

        setGlobalLogContext({ requestId: 'req-1' });
        parentLogger.info({}, 'parent log 1');
        childLogger.info({}, 'child log 1');

        setGlobalLogContext({ requestId: 'req-2' });
        parentLogger.info({}, 'parent log 2');
        childLogger.info({}, 'child log 2');

        expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'parent log 1',
            namespace: 'parent',
            data: {
              requestId: 'req-1',
            },
          },
          {
            level: 'info',
            message: 'child log 1',
            namespace: 'child',
            data: {
              requestId: 'req-1',
            },
          },
          {
            level: 'info',
            message: 'parent log 2',
            namespace: 'parent',
            data: {
              requestId: 'req-2',
            },
          },
          {
            level: 'info',
            message: 'child log 2',
            namespace: 'child',
            data: {
              requestId: 'req-2',
            },
          },
        ]);
      });
    });

    describe('global context updates', () => {
      test('updating global context affects subsequent logs', () => {
        const transport = createInMemoryLoggerTransport();

        const { globalContextPlugin, setGlobalLogContext } = createGlobalLogContextPlugin();

        const logger = createLogger({
          namespace: 'test',
          plugins: [globalContextPlugin],
          transports: [transport],
        });

        setGlobalLogContext({ version: '1.0' });
        logger.info({}, 'first log');

        setGlobalLogContext({ version: '2.0' });
        logger.info({}, 'second log');

        expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
          {
            level: 'info',
            message: 'first log',
            namespace: 'test',
            data: {
              version: '1.0',
            },
          },
          {
            level: 'info',
            message: 'second log',
            namespace: 'test',
            data: {
              version: '2.0',
            },
          },
        ]);
      });
    });

    describe('typed global context', () => {
      test('global context can be typed', () => {
      type MyGlobalLogContext = {
        userId: string;
        requestId: string;
      };

      const transport = createInMemoryLoggerTransport();

      const { globalContextPlugin, setGlobalLogContext } = createGlobalLogContextPlugin<MyGlobalLogContext>();

      const logger = createLogger({
        namespace: 'test',
        plugins: [globalContextPlugin],
        transports: [transport],
      });

      setGlobalLogContext({ userId: 'user123', requestId: 'req456' });

      logger.info({}, 'test');

      expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
        {
          level: 'info',
          message: 'test',
          namespace: 'test',
          data: {
            userId: 'user123',
            requestId: 'req456',
          },
        },
      ]);
      });
    });
  });
});
