import { describe, expect, test } from 'vitest';
import { createLogger } from '../../logger';
import { createInMemoryLoggerTransport } from '../../transports/transports';
import { buildRedactor, createRedactPlugin } from './redact.plugin';

describe('redact', () => {
  describe('buildRedactor', () => {
    test('given an array of dot-separated paths, build a function that redacts the values at the given paths', () => {
      const redactor = buildRedactor({ paths: ['user.password', 'apiKey'] });

      const obj = {
        user: {
          password: 'password',
          email: 'test@test.com',
        },
        apiKey: '1234567890',
      };

      const redacted = redactor(obj);

      expect(redacted).to.deep.equal({
        user: {
          password: '[redacted]',
          email: 'test@test.com',
        },
        apiKey: '[redacted]',
      });
    });

    test('the redacted value can be configured using the redactedValue option', () => {
      const redactor = buildRedactor({
        paths: ['user.password', 'apiKey'],
        redactedValue: 'REDACTED',
      });

      const obj = {
        user: {
          password: 'password',
          email: 'test@test.com',
        },
        apiKey: '1234567890',
      };

      const redacted = redactor(obj);

      expect(redacted).to.deep.equal({
        user: {
          password: 'REDACTED',
          email: 'test@test.com',
        },
        apiKey: 'REDACTED',
      });
    });

    test('the redaction should not mutate the original object', () => {
      const redactor = buildRedactor({ paths: ['user.password', 'apiKey'] });

      const obj = {
        user: {
          password: 'password',
          email: 'test@test.com',
        },
        apiKey: '1234567890',
      };

      redactor(obj);

      expect(obj).to.deep.equal({
        user: {
          password: 'password',
          email: 'test@test.com',
        },
        apiKey: '1234567890',
      });
    });

    test('when a path walk on a non-object, no redaction is done', () => {
      const redactor = buildRedactor({ paths: ['user.password', 'foo.bar'] });

      const obj = {
        user: 'test',
        foo: null,
      };

      const redacted = redactor(obj);

      expect(redacted).to.deep.equal({
        user: 'test',
        foo: null,
      });
    });

    test('when the data contains an array, the index can be used to redact a value', () => {
      const redactor = buildRedactor({ paths: ['users.1.password'] });

      const obj = {
        users: [
          {
            id: 1,
            password: 'password1',
          },
          {
            id: 2,
            password: 'password2',
          },
        ],
      };

      const redacted = redactor(obj);

      expect(redacted).to.deep.equal({
        users: [
          { id: 1, password: 'password1' },
          { id: 2, password: '[redacted]' },
        ],
      });
    });

    test('to redact all values of an array, use the * wildcard', () => {
      const redactor = buildRedactor({ paths: ['users.*.password'] });

      const obj = {
        users: [{ password: 'password1' }, { password: 'password2' }],
      };

      const redacted = redactor(obj);

      expect(redacted).to.deep.equal({
        users: [{ password: '[redacted]' }, { password: '[redacted]' }],
      });
    });

    test('wildcard can be used one after another to redact nested arrays', () => {
      const redactor = buildRedactor({ paths: ['data.*.*.password'] });

      const obj = {
        data: [
          [{ password: 'password1' }, { password: 'password2' }],
          [{ password: 'password3' }, { password: 'password4' }],
        ],
      };

      const redacted = redactor(obj);

      expect(redacted).to.deep.equal({
        data: [
          [{ password: '[redacted]' }, { password: '[redacted]' }],
          [{ password: '[redacted]' }, { password: '[redacted]' }],
        ],
      });
    });

    test('when using the wildcard followed by properties, if an element of the array is not an object, no redaction is done on this element', () => {
      const redactor = buildRedactor({ paths: ['users.*.password'] });

      const obj = {
        users: [{ password: 'password1' }, 'not an object'],
      };

      const redacted = redactor(obj);

      expect(redacted).to.deep.equal({
        users: [{ password: '[redacted]' }, 'not an object'],
      });
    });

    test('when the wildcard is used at the end of a path, it will redact all values of the array', () => {
      const redactor = buildRedactor({ paths: ['users.*'] });

      const obj = {
        users: [{ password: 'password1' }, { password: 'password2' }],
      };

      const redacted = redactor(obj);

      expect(redacted).to.deep.equal({
        users: ['[redacted]', '[redacted]'],
      });
    });

    test('deeply nested objects with arrays can be redacted', () => {
      const redactor = buildRedactor({ paths: ['users.*.profiles.*.address.street', 'users.*.password'] });

      const obj = {
        users: [
          {
            password: 'password',
            profiles: [
              {
                address: {
                  street: '123 Main St',
                  country: 'United States',
                },
              },
              {
                address: {
                  street: '456 Main St',
                  country: 'Canada',
                },
              },
            ],
          },
          {
            password: 'password',
            profiles: [
              {
                address: {
                  street: '789 Main St',
                  country: 'United Kingdom',
                },
              },
            ],
          },
        ],
      };

      const redacted = redactor(obj);

      expect(redacted).to.deep.equal({
        users: [
          {
            password: '[redacted]',
            profiles: [
              { address: { street: '[redacted]', country: 'United States' } },
              { address: { street: '[redacted]', country: 'Canada' } },
            ],
          },
          {
            password: '[redacted]',
            profiles: [
              { address: { street: '[redacted]', country: 'United Kingdom' } },
            ],
          },
        ],
      });
    });

    test('when the data to redact is not an object-like, it is returned as is', () => {
      const redactor = buildRedactor({ paths: ['users.*.password'] });

      const obj = 'not an object';

      const redacted = redactor(obj);

      expect(redacted).to.equal('not an object');
    });
  });

  describe('createRedactPlugin', () => {
    test('when using the redact plugin, the specified paths are redacted from the log data', () => {
      const redactPlugin = createRedactPlugin({ paths: ['user.password', 'apiKey'] });
      const inMemoryTransport = createInMemoryLoggerTransport();

      const logger = createLogger({
        namespace: 'test',
        transports: [inMemoryTransport],
        plugins: [redactPlugin],
      });

      logger.info({
        user: {
          password: 'password',
          email: 'foo@bar.com',
        },
        apiKey: '1234567890',
      }, 'Test message');

      expect(
        inMemoryTransport.getLogs({ excludeTimestampMs: true }),
      ).to.deep.equal([
        {
          level: 'info',
          message: 'Test message',
          namespace: 'test',
          data: {
            user: {
              password: '[redacted]',
              email: 'foo@bar.com',
            },
            apiKey: '[redacted]',
          },
        },
      ]);
    });

    test('by default, the redacted value is "[redacted]", but it can be customized', () => {
      const redactPlugin = createRedactPlugin({
        paths: ['user.password', 'apiKey'],
        redactedValue: 'you shall not pass!',
      });
      const inMemoryTransport = createInMemoryLoggerTransport();

      const logger = createLogger({
        namespace: 'test',
        transports: [inMemoryTransport],
        plugins: [redactPlugin],
      });

      logger.info({
        user: {
          password: 'password',
          email: 'foo@bar.com',
        },
        apiKey: '1234567890',
      }, 'Test message');

      expect(
        inMemoryTransport.getLogs({ excludeTimestampMs: true }),
      ).to.deep.equal([
        {
          level: 'info',
          message: 'Test message',
          namespace: 'test',
          data: {
            user: {
              password: 'you shall not pass!',
              email: 'foo@bar.com',
            },
            apiKey: 'you shall not pass!',
          },
        },
      ]);
    });
  });
});
