import pc from 'picocolors';
import { describe, expect, test } from 'vitest';
import { formatDataLines, formatPrettyLog, getLevelColorFormatter, serializeValue } from './formatter';

const dummyColorFormatter = pc.createColors(false);

describe('formatter', () => {
  describe('getLevelColorFormatter', () => {
    test('get the display color for a log level', () => {
      expect(getLevelColorFormatter({ level: 'error' })).to.equal(pc.red);
      expect(getLevelColorFormatter({ level: 'warn' })).to.equal(pc.yellow);
      expect(getLevelColorFormatter({ level: 'info' })).to.equal(pc.green);
      expect(getLevelColorFormatter({ level: 'debug' })).to.equal(pc.gray);
    });

    test('when the level is not known, a gray formatter is used', () => {
      expect(getLevelColorFormatter({ level: 'unknown' })).to.equal(pc.gray);
    });
  });

  describe('serializeValue', () => {
    describe('when a log as data attribute (custom logged data), the content is serialized as a key-value pair, serializeValue is used to serialize the value', () => {
      test('when the value is a string, it is wrapped in double quotes', () => {
        expect(serializeValue({ value: 'foo' })).to.equal('"foo"');
        expect(serializeValue({ value: '' })).to.equal('""');
      });

      test('boolean are displayed as true or false', () => {
        expect(serializeValue({ value: true })).to.equal('true');
        expect(serializeValue({ value: false })).to.equal('false');
      });

      test('numbers are displayed as is', () => {
        expect(serializeValue({ value: 1 })).to.equal('1');
        expect(serializeValue({ value: 1.23 })).to.equal('1.23');
        expect(serializeValue({ value: -1.23 })).to.equal('-1.23');
        expect(serializeValue({ value: 0 })).to.equal('0');
        expect(serializeValue({ value: BigInt(123) })).to.equal('123');
      });

      test('when the value is an object, it is serialized as a JSON string', () => {
        expect(serializeValue({ value: { foo: 'bar' } })).to.equal('{\n  foo: "bar"\n}');
        expect(serializeValue({ value: { foo: true } })).to.equal('{\n  foo: true\n}');
      });

      test('standard types are displayed as their string representation', () => {
        expect(serializeValue({ value: null })).to.equal('null');
        expect(serializeValue({ value: undefined })).to.equal('undefined');
        expect(serializeValue({ value: Number.NaN })).to.equal('NaN');
        expect(serializeValue({ value: Number.POSITIVE_INFINITY })).to.equal('Infinity');
        expect(serializeValue({ value: Number.NEGATIVE_INFINITY })).to.equal('-Infinity');
        expect(serializeValue({ value: Symbol('foo') })).to.equal('Symbol(foo)');
        expect(serializeValue({ value: [1, 2, 3] })).to.equal('[1,2,3]');
        expect(serializeValue({ value: [{ foo: 'bar' }] })).to.equal('[{"foo":"bar"}]');
      });
    });
  });

  describe('formatDataLines', () => {
    test('given a custom data pojo, the data is formatted as a key-value pair', () => {
      expect(formatDataLines({
        data: {
          foo: 'bar',
          baz: 123,
        },
        leftPadding: 0,
        colorFormatters: dummyColorFormatter,
      })).to.deep.equal([
        'foo: "bar"',
        'baz: 123',
      ]);
    });

    test('a left padding can be provided to indent the data', () => {
      expect(formatDataLines({
        data: {
          foo: 'bar',
          baz: 123,
        },
        leftPadding: 2,
        colorFormatters: dummyColorFormatter,
      })).to.deep.equal([
        '  foo: "bar"',
        '  baz: 123',
      ]);
    });
  });

  describe('formatPrettyLog', () => {
    test('prettify a log, with the timestamp, level, namespace and message first, and the data indented', () => {
      expect(formatPrettyLog({
        log: {
          level: 'info',
          message: 'Hello, world!',
          timestampMs: 1234567890,
          namespace: 'my-namespace',
          data: {
            foo: 'bar',
            baz: 123,
          },
        },
        locale: 'fr-FR',
        colorFormatters: dummyColorFormatter,
      })).to.equal(`
06:56:07 INFO Hello, world!
         namespace: "my-namespace"
         foo: "bar"
         baz: 123
      `.trim());
    });

    test('it handles errors with stack traces', () => {
      expect(formatPrettyLog({
        log: {
          level: 'error',
          message: 'Hello, world!',
          timestampMs: 1234567890,
          namespace: 'my-namespace',
          data: {
            error: {
              message: 'bar',
              stack: 'Error: bar\n    at Object.<anonymous> (test.ts:1:1)\n    at Object.<anonymous> (test.ts:1:1)',
            },
          },
        },
        locale: 'fr-FR',
        colorFormatters: dummyColorFormatter,
      })).to.equal(`
06:56:07 ERROR Hello, world!
         namespace: "my-namespace"
         error: {
           message: "bar"
           stack: "Error: bar
               at Object.<anonymous> (test.ts:1:1)
               at Object.<anonymous> (test.ts:1:1)"
         }

      `.trim());
    });

    test('deep nested objects', () => {
      expect(formatPrettyLog({
        log: {
          level: 'error',
          message: 'Hello, world!',
          timestampMs: 1234567890,
          namespace: 'my-namespace',
          data: {
            foo: {
              bar: {
                baz: 'qux',
                error: {
                  message: 'bar',
                  stack: 'Error: bar\n    at Object.<anonymous> (test.ts:1:1)\n    at Object.<anonymous> (test.ts:1:1)',
                },
              },
            },
          },
        },
        locale: 'fr-FR',
        colorFormatters: dummyColorFormatter,
      })).to.equal(`
06:56:07 ERROR Hello, world!
         namespace: "my-namespace"
         foo: {
           bar: {
             baz: "qux"
             error: {
               message: "bar"
               stack: "Error: bar
                   at Object.<anonymous> (test.ts:1:1)
                   at Object.<anonymous> (test.ts:1:1)"
             }
           }
         }
      `.trim());
    });
  });
});
