/* eslint-disable no-console */
/* eslint-disable node/prefer-global/process */
import type { LoggerTransport, LoggerTransportLogArgs } from '../../logger.types';

export const writeToConsole = (serializedLog: string) => console.log(serializedLog);
export const writeToStdout = (serializedLog: string) => process.stdout.write(`${serializedLog}\n`);

const defaultSerializer = (args: LoggerTransportLogArgs) => JSON.stringify(args);

function getOutputFunction() {
  if (process?.stdout?.writable && Boolean(process?.stdout?.write)) {
    return writeToStdout;
  }

  return writeToConsole;
}

export function createStdoutLoggerTransport({
  writeToStdout = getOutputFunction(),
  serialize = defaultSerializer,
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
