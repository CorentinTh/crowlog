import type { LoggerTransport, LoggerTransportLogArgs } from '../../logger.types';

export function createStdoutLoggerTransport({
  // eslint-disable-next-line no-console
  writeToStdout = args => console.log(args),
  serialize = args => JSON.stringify(args),
}: {
  writeToStdout?: (serializedLog: string) => void;
  serialize?: (args: LoggerTransportLogArgs) => string;
} = {}): LoggerTransport {
  return {
    name: 'stdout',
    log(args) {
      const serialized = serialize(args);
      writeToStdout(serialized);
    },
  };
}
