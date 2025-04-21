import { describe, expect, test } from 'vitest';
import { createLogger } from '../../logger';
import { createDefaultSerializer, createStdoutLoggerTransport } from './stdout.logger-transport';

describe('console logger-transport', () => {
  describe('createStdoutLoggerTransport', () => {
    test('the transport writes to stdout through the console object', () => {
      const stdoutArgs: unknown[] = [];

      const writeToStdout = (serializedLog: string) => {
        stdoutArgs.push(serializedLog);
      };

      const transport = createStdoutLoggerTransport({ writeToStdout });
      const logger = createLogger({
        namespace: 'test',
        transports: [transport],
        getTimestamp: () => new Date('2025-02-06T00:00:00.000Z').getTime(),
      });

      logger.info('foo');
      logger.warn('bar');
      logger.error('baz');
      logger.debug({ foo: 'bar' }, 'biz');

      expect(stdoutArgs).toEqual([
        '{"level":"info","message":"foo","timestampMs":1738800000000,"namespace":"test","data":{}}',
        '{"level":"warn","message":"bar","timestampMs":1738800000000,"namespace":"test","data":{}}',
        '{"level":"error","message":"baz","timestampMs":1738800000000,"namespace":"test","data":{}}',
        '{"level":"debug","message":"biz","timestampMs":1738800000000,"namespace":"test","data":{"foo":"bar"}}',
      ]);
    });

    test('by default the transport serializes the log args to a JSON string, the serialization can be overridden', () => {
      const stdoutArgs: unknown[] = [];

      const writeToStdout = (serializedLog: string) => {
        stdoutArgs.push(serializedLog);
      };

      const transport = createStdoutLoggerTransport({
        writeToStdout,
        serialize: ({ message }) => `xX ${message} Xx`,
      });
      const logger = createLogger({
        namespace: 'test',
        transports: [transport],
      });

      logger.info('Hello');

      expect(stdoutArgs).toEqual([
        'xX Hello Xx',
      ]);
    });
  });

  describe('defaultSerializer', () => {
    test('the default serializer serializes the log args to a JSON string, without omitting the error property', () => {
      const serializer = createDefaultSerializer({ includeErrorStack: false });

      class CustomError extends Error {
        code: string;
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
          this.code = 'ERROR_2';
        }
      }

      expect(
        serializer({
          level: 'info',
          message: 'foo',
          timestampMs: 1738800000000,
          namespace: 'test',
          data: {
            error1: new Error('bar'),
            error2: new CustomError('baz'),
            error3: Object.assign(new Error('qux'), { code: 'ERROR_3' }),
            foo: 'bar',
          },
        }),
      ).to.eql('{"level":"info","message":"foo","timestampMs":1738800000000,"namespace":"test","data":{"error1":{"message":"bar","name":"Error"},"error2":{"code":"ERROR_2","name":"CustomError","message":"baz"},"error3":{"code":"ERROR_3","message":"qux","name":"Error"},"foo":"bar"}}');
    });
  });
});
