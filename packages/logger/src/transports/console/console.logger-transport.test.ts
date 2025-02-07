import { describe, expect, test } from 'vitest';
import { createLogger } from '../../logger';
import { createConsoleLoggerTransport } from './console.logger-transport';

describe('console logger-transport', () => {
  describe('createConsoleLoggerTransport', () => {
    test('the transport writes to stdout through the console object', () => {
      const consoleArgs: any[] = [];

      const console = {
        log: (...args: any[]) => consoleArgs.push({ level: 'log', args }),
        warn: (...args: any[]) => consoleArgs.push({ level: 'warn', args }),
        error: (...args: any[]) => consoleArgs.push({ level: 'error', args }),
      };

      const transport = createConsoleLoggerTransport({ console });
      const logger = createLogger({
        namespace: 'test',
        transports: [transport],
        getTimestamp: () => new Date('2025-02-06T00:00:00.000Z').getTime(),
      });

      logger.info('foo');
      logger.warn('bar');
      logger.error('baz');
      logger.debug({ foo: 'bar' }, 'biz');

      expect(consoleArgs).toEqual([
        { level: 'log', args: ['{"level":"info","message":"foo","timestampMs":1738800000000,"namespace":"test","data":{}}'] },
        { level: 'warn', args: ['{"level":"warn","message":"bar","timestampMs":1738800000000,"namespace":"test","data":{}}'] },
        { level: 'error', args: ['{"level":"error","message":"baz","timestampMs":1738800000000,"namespace":"test","data":{}}'] },
        { level: 'log', args: ['{"level":"debug","message":"biz","timestampMs":1738800000000,"namespace":"test","data":{"foo":"bar"}}'] },
      ]);
    });
  });
});
