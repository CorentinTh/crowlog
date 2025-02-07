import { describe, expect, test } from 'vitest';
import * as exported from './index';

describe('lib interface', () => {
  test('the lib exports logger creation methods and transports', () => {
    expect(Object.keys(exported)).to.deep.equal([
      'createLogger',
      'createLoggerFactory',

      // Transports
      'createInMemoryLoggerTransport',
      'createStdoutLoggerTransport',
    ]);
  });
});
