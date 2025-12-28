import { describe, expect, test } from 'vitest';
import { createLogger } from '../../logger';
import { createInMemoryLoggerTransport } from '../../transports/transports';
import { createCustomFilter, createFilterPlugin, createLevelFilter, createNamespaceFilter } from './filter.plugin';

describe('filter plugin', () => {
  describe('createLevelFilter', () => {
    test('when onlyLevels is provided, only allows levels in the onlyLevels array', () => {
      const filter = createLevelFilter({ onlyLevels: ['info', 'error'] });

      expect(filter({ level: 'debug' })).toBe(false);
      expect(filter({ level: 'info' })).toBe(true);
      expect(filter({ level: 'warn' })).toBe(false);
      expect(filter({ level: 'error' })).toBe(true);
    });

    test('when minLevel is provided, allows levels equal or above the minLevel', () => {
      const filter = createLevelFilter({ minLevel: 'info' });

      expect(filter({ level: 'debug' })).toBe(false);
      expect(filter({ level: 'info' })).toBe(true);
      expect(filter({ level: 'warn' })).toBe(true);
      expect(filter({ level: 'error' })).toBe(true);
    });

    test('when maxLevel is provided, allows levels equal or below the maxLevel', () => {
      const filter = createLevelFilter({ maxLevel: 'warn' });

      expect(filter({ level: 'debug' })).toBe(true);
      expect(filter({ level: 'info' })).toBe(true);
      expect(filter({ level: 'warn' })).toBe(true);
      expect(filter({ level: 'error' })).toBe(false);
    });

    test('when minLevel and maxLevel are provided, allows levels between minLevel and maxLevel', () => {
      const filter = createLevelFilter({ minLevel: 'info', maxLevel: 'warn' });

      expect(filter({ level: 'debug' })).toBe(false);
      expect(filter({ level: 'info' })).toBe(true);
      expect(filter({ level: 'warn' })).toBe(true);
      expect(filter({ level: 'error' })).toBe(false);
    });

    test('when no filters are provided, allows all levels', () => {
      const filter = createLevelFilter();

      expect(filter({ level: 'debug' })).toBe(true);
      expect(filter({ level: 'info' })).toBe(true);
      expect(filter({ level: 'warn' })).toBe(true);
      expect(filter({ level: 'error' })).toBe(true);
    });

    test('when minLevel and maxLevel are mutually exclusive, no levels are allowed', () => {
      const filter = createLevelFilter({ minLevel: 'error', maxLevel: 'info' });

      expect(filter({ level: 'debug' })).toBe(false);
      expect(filter({ level: 'info' })).toBe(false);
      expect(filter({ level: 'warn' })).toBe(false);
      expect(filter({ level: 'error' })).toBe(false);
    });

    test('when onlyLevels is provided along with minLevel and/or maxLevel, onlyLevels takes precedence', () => {
      const filter = createLevelFilter({ onlyLevels: ['info', 'warn'], minLevel: 'error', maxLevel: 'debug' });

      expect(filter({ level: 'debug' })).toBe(false);
      expect(filter({ level: 'info' })).toBe(true);
      expect(filter({ level: 'warn' })).toBe(true);
      expect(filter({ level: 'error' })).toBe(false);
    });

    test('when onlyLevels is empty, no levels are allowed', () => {
      const filter = createLevelFilter({ onlyLevels: [] });

      expect(filter({ level: 'debug' })).toBe(false);
      expect(filter({ level: 'info' })).toBe(false);
      expect(filter({ level: 'warn' })).toBe(false);
      expect(filter({ level: 'error' })).toBe(false);
    });
  });

  describe('createNamespaceFilter', () => {
    test('when onlyNamespaces is provided, only allows namespaces in the onlyNamespaces array', () => {
      const filter = createNamespaceFilter({ onlyNamespaces: ['namespace1', 'namespace3'] });

      expect(filter({ namespace: 'namespace1' })).toBe(true);
      expect(filter({ namespace: 'namespace2' })).toBe(false);
      expect(filter({ namespace: 'namespace3' })).toBe(true);
      expect(filter({ namespace: 'namespace4' })).toBe(false);
    });

    test('when excludedNamespaces is provided, disallows namespaces in the excludedNamespaces array', () => {
      const filter = createNamespaceFilter({ excludedNamespaces: ['namespace2', 'namespace4'] });

      expect(filter({ namespace: 'namespace1' })).toBe(true);
      expect(filter({ namespace: 'namespace2' })).toBe(false);
      expect(filter({ namespace: 'namespace3' })).toBe(true);
      expect(filter({ namespace: 'namespace4' })).toBe(false);
    });

    test('when no filters are provided, allows all namespaces', () => {
      const filter = createNamespaceFilter();

      expect(filter({ namespace: 'namespace1' })).toBe(true);
      expect(filter({ namespace: 'namespace2' })).toBe(true);
      expect(filter({ namespace: 'namespace3' })).toBe(true);
      expect(filter({ namespace: 'namespace4' })).toBe(true);
    });

    test('when onlyNamespaces is empty, no namespaces are allowed', () => {
      const filter = createNamespaceFilter({ onlyNamespaces: [] });

      expect(filter({ namespace: 'namespace1' })).toBe(false);
      expect(filter({ namespace: 'namespace2' })).toBe(false);
      expect(filter({ namespace: 'namespace3' })).toBe(false);
      expect(filter({ namespace: 'namespace4' })).toBe(false);
    });

    test('when both onlyNamespaces and excludedNamespaces are provided, the union of both filters is applied', () => {
      const filter = createNamespaceFilter({
        onlyNamespaces: ['namespace1', 'namespace2', 'namespace3'],
        excludedNamespaces: ['namespace2'],
      });

      expect(filter({ namespace: 'namespace1' })).toBe(true);
      expect(filter({ namespace: 'namespace2' })).toBe(false);
      expect(filter({ namespace: 'namespace3' })).toBe(true);
      expect(filter({ namespace: 'namespace4' })).toBe(false);
    });

    test('when excludedNamespaces is empty, all namespaces are allowed', () => {
      const filter = createNamespaceFilter({ excludedNamespaces: [] });

      expect(filter({ namespace: 'namespace1' })).toBe(true);
      expect(filter({ namespace: 'namespace2' })).toBe(true);
      expect(filter({ namespace: 'namespace3' })).toBe(true);
      expect(filter({ namespace: 'namespace4' })).toBe(true);
    });

    test('when onlyNamespaces and excludedNamespaces overlap completely, no namespaces are allowed', () => {
      const filter = createNamespaceFilter({
        onlyNamespaces: ['namespace1', 'namespace2'],
        excludedNamespaces: ['namespace1', 'namespace2'],
      });

      expect(filter({ namespace: 'namespace1' })).toBe(false);
      expect(filter({ namespace: 'namespace2' })).toBe(false);
      expect(filter({ namespace: 'namespace3' })).toBe(false);
      expect(filter({ namespace: 'namespace4' })).toBe(false);
    });
  });

  describe('createCustomFilter', () => {
    test('when no custom filter is provided, allows all logs', () => {
      const filter = createCustomFilter();

      expect(filter({ context: { level: 'info', message: 'test', timestampMs: 0, namespace: 'ns', data: {} } })).toBe(true);
      expect(filter({ context: { level: 'error', message: 'error', timestampMs: 0, namespace: 'ns', data: {} } })).toBe(true);
    });

    test('when a custom filter is provided, uses it to filter logs', () => {
      const customFilter = ({ context }: { context: { level: string } }) => context.level === 'error';
      const filter = createCustomFilter({ customFilter });

      expect(filter({ context: { level: 'info', message: 'test', timestampMs: 0, namespace: 'ns', data: {} } })).toBe(false);
      expect(filter({ context: { level: 'error', message: 'error', timestampMs: 0, namespace: 'ns', data: {} } })).toBe(true);
    });
  });

  describe('createFilterPlugin', () => {
    test('when using the filter plugin with minLevel, logs below the minimum level are filtered out', () => {
      const filterPlugin = createFilterPlugin({ minLevel: 'warn' });
      const inMemoryTransport = createInMemoryLoggerTransport();

      const logger = createLogger({
        namespace: 'test',
        transports: [inMemoryTransport],
        plugins: [filterPlugin],
      });

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(inMemoryTransport.getLogs({ excludeTimestampMs: true })).to.deep.equal([
        { level: 'warn', message: 'warn message', namespace: 'test', data: {} },
        { level: 'error', message: 'error message', namespace: 'test', data: {} },
      ]);
    });

    test('when using the filter plugin with excludedNamespaces, logs from excluded namespaces are filtered out', () => {
      const filterPlugin = createFilterPlugin({ excludedNamespaces: ['excluded-ns'] });
      const inMemoryTransport = createInMemoryLoggerTransport();

      const logger1 = createLogger({
        namespace: 'test',
        transports: [inMemoryTransport],
        plugins: [filterPlugin],
      });

      const logger2 = createLogger({
        namespace: 'excluded-ns',
        transports: [inMemoryTransport],
        plugins: [filterPlugin],
      });

      logger1.info('should appear');
      logger2.info('should be filtered');

      expect(inMemoryTransport.getLogs({ excludeTimestampMs: true })).to.deep.equal([
        { level: 'info', message: 'should appear', namespace: 'test', data: {} },
      ]);
    });

    test('when using the filter plugin with customFilter, logs are filtered based on custom logic', () => {
      const filterPlugin = createFilterPlugin({
        customFilter: ({ context }) => context.data.important === true,
      });
      const inMemoryTransport = createInMemoryLoggerTransport();

      const logger = createLogger({
        namespace: 'test',
        transports: [inMemoryTransport],
        plugins: [filterPlugin],
      });

      logger.info({ important: true }, 'important log');
      logger.info({ important: false }, 'not important');
      logger.info('no data');

      expect(inMemoryTransport.getLogs({ excludeTimestampMs: true })).to.deep.equal([
        { level: 'info', message: 'important log', namespace: 'test', data: { important: true } },
      ]);
    });

    test('when using the filter plugin with multiple filters, all filters must pass', () => {
      const filterPlugin = createFilterPlugin({
        minLevel: 'info',
        excludedNamespaces: ['debug-ns'],
      });
      const inMemoryTransport = createInMemoryLoggerTransport();

      const logger1 = createLogger({
        namespace: 'app',
        transports: [inMemoryTransport],
        plugins: [filterPlugin],
      });

      const logger2 = createLogger({
        namespace: 'debug-ns',
        transports: [inMemoryTransport],
        plugins: [filterPlugin],
      });

      logger1.debug('filtered by level');
      logger1.info('should appear');
      logger2.info('filtered by namespace');
      logger2.error('also filtered by namespace');

      expect(inMemoryTransport.getLogs({ excludeTimestampMs: true })).to.deep.equal([
        { level: 'info', message: 'should appear', namespace: 'app', data: {} },
      ]);
    });
  });
});
