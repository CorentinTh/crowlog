/* eslint-disable no-console */
/* eslint-disable node/prefer-global/process */
import type { LoggerTransport, LoggerTransportLogArgs } from '../../logger.types';

export const writeToConsole = (serializedLog: string) => console.log(serializedLog);
export const writeToStdout = (serializedLog: string) => globalThis.process.stdout.write(`${serializedLog}\n`);

export function createDefaultSerializer({ includeErrorStack = true }: { includeErrorStack?: boolean } = {}) {
  return (args: LoggerTransportLogArgs) => JSON.stringify(args, (_key, value) => {
    if (value instanceof Error) {
      return {
        ...value,
        message: value.message,
        name: value.name,
        ...(includeErrorStack && { stack: value.stack }),
      };
    }

    return value;
  });
}

function getOutputFunction() {
  if (globalThis?.process?.stdout?.writable && Boolean(globalThis?.process?.stdout?.write)) {
    return writeToStdout;
  }

  return writeToConsole;
}

export function createStdoutLoggerTransport({
  writeToStdout = getOutputFunction(),
  serialize = createDefaultSerializer(),
}: {
  writeToStdout?: (serializedLog: string) => void;
  serialize?: (args: LoggerTransportLogArgs) => string;
} = {}): LoggerTransport {
  return {
    name: 'stdout',
    log(args) {
      writeToStdout(serialize(args));
    },
  };
}
