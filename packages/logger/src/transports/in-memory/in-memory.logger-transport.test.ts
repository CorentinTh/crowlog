import { describe, expect, test } from 'vitest';
import { createLogger } from '../../logger';
import { createInMemoryLoggerTransport } from './in-memory.logger-transport';

describe('in-memory logger-transport', () => {
  test('logged messages are accessible through getLogs', () => {
    const transport = createInMemoryLoggerTransport();

    const logger = createLogger({
      namespace: 'test',
      transports: [transport],
      getTimestamp: () => new Date('2025-02-06T00:00:00.000Z').getTime(),
    });

    logger.info('Hello world');
    logger.error({ error: new Error('An error occurred') }, 'An error occurred');

    expect(transport.getLogs()).to.eql([
      {
        level: 'info',
        message: 'Hello world',
        namespace: 'test',
        timestampMs: 1738800000000,
        data: {},
      },
      {
        level: 'error',
        message: 'An error occurred',
        namespace: 'test',
        timestampMs: 1738800000000,
        data: {
          error: new Error('An error occurred'),
        },
      },
    ]);
  });
  test('for easier testing, the timestamp can be excluded from the logs', () => {
    const transport = createInMemoryLoggerTransport();

    const logger = createLogger({
      namespace: 'test',
      transports: [transport],
    });

    logger.info('Hello world');

    expect(transport.getLogs({ excludeTimestampMs: true })).to.eql([
      {
        level: 'info',
        message: 'Hello world',
        namespace: 'test',
        data: {},
      },
    ]);
  });
});
