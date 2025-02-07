import type { LoggerPlugin, LoggerTransport } from './logger.types';
import { describe, expect, test } from 'vitest';
import { applyPluginsTransformLogContext, createLogger, createLoggerFactory, mergeWhenDefined } from './logger';

const dummyTransport: LoggerTransport = {
  name: 'dummy',
  log: () => {},
};

const dummyPlugin: LoggerPlugin = {
  name: 'dummy',
  transformLogContext: ({ context }) => ({ context }),
};

describe('logger', () => {
  describe('createLogger', () => {
    test('a logger expose debug, info, warn, error methods', () => {
      const logger = createLogger({ namespace: 'test' });

      expect(logger.debug).toBeInstanceOf(Function);
      expect(logger.info).toBeInstanceOf(Function);
      expect(logger.warn).toBeInstanceOf(Function);
      expect(logger.error).toBeInstanceOf(Function);
    });

    describe('transports', () => {
      test('the defined transports can be retrieved from the logger', () => {
        const logger = createLogger({ namespace: 'test', transports: [dummyTransport] });

        expect(logger.getTransports()).to.deep.equal([dummyTransport]);
      });

      test('the default transport is the console transport', () => {
        const logger = createLogger({ namespace: 'test' });

        expect(logger.getTransports().map(({ name }) => name)).to.deep.equal(['stdout']);
      });
    });

    describe('plugins', () => {
      test('the defined plugins can be retrieved from the logger', () => {
        const logger = createLogger({ namespace: 'test', plugins: [dummyPlugin] });

        expect(logger.getPlugins()).to.deep.equal([dummyPlugin]);
      });

      test('by default, the logger has no plugins', () => {
        const logger = createLogger({ namespace: 'test' });

        expect(logger.getPlugins()).to.deep.equal([]);
      });
    });

    describe('child logger', () => {
      test('given a logger, a child logger can be created, inheriting the plugins and transports', () => {
        const logger = createLogger({ namespace: 'test', plugins: [dummyPlugin], transports: [dummyTransport] });

        const childLogger = logger.createChildLogger({ namespace: 'child' });

        expect(childLogger.getPlugins()).to.deep.equal([dummyPlugin]);
        expect(childLogger.getTransports()).to.deep.equal([dummyTransport]);
      });

      test('new transports can be added to the child logger', () => {
        const logger = createLogger({ namespace: 'test', transports: [dummyTransport] });

        const childLogger = logger.createChildLogger({ namespace: 'child', transports: [dummyTransport] });

        expect(childLogger.getTransports()).to.deep.equal([dummyTransport, dummyTransport]);
      });

      test('new plugins can be added to the child logger', () => {
        const logger = createLogger({ namespace: 'test', plugins: [dummyPlugin] });

        const childLogger = logger.createChildLogger({ namespace: 'child', plugins: [dummyPlugin] });

        expect(childLogger.getPlugins()).to.deep.equal([dummyPlugin, dummyPlugin]);
      });
    });
  });

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

    test('a plugin is allowed to omit the implementation of a transformLogContext method, in which case the context is not altered, identity style', () => {
      const plugin: LoggerPlugin = {
        name: 'test',
      };

      const baseContext = {
        level: 'info',
        message: 'test',
        timestampMs: new Date('2025-01-01').getTime(),
        namespace: 'test',
        data: { a: 1 },
      } as const;

      const extendedContext = applyPluginsTransformLogContext({ baseContext, plugins: [plugin] });

      expect(extendedContext).to.deep.equal(baseContext);
    });
  });

  describe('createLoggerFactory', () => {
    test('logger created by the factory still have the console transport is no other transports are provided', () => {
      const factory = createLoggerFactory();

      const logger = factory({ namespace: 'test' });

      expect(logger.getTransports().map(({ name }) => name)).to.deep.equal(['stdout']);
    });
  });

  describe('mergeWhenDefined', () => {
    test('concatenates two arrays, but only if both are defined', () => {
      expect(mergeWhenDefined([1, 2], [3, 4])).to.deep.equal([1, 2, 3, 4]);
      expect(mergeWhenDefined([1, 2], undefined)).to.deep.equal([1, 2]);
      expect(mergeWhenDefined(undefined, [3, 4])).to.deep.equal([3, 4]);
      expect(mergeWhenDefined(undefined, undefined)).to.deep.equal(undefined);
      expect(mergeWhenDefined(undefined, [])).to.deep.equal([]);
      expect(mergeWhenDefined([], undefined)).to.deep.equal([]);
    });
  });
});
