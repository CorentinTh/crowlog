import type { LoggerPlugin, LoggerTransport, LoggerTransportLogArgs, LogLevel, LogMethodArguments } from './logger.types';
import { logLevels } from './logger.constants';
import { createConsoleLoggerTransport } from './transports/console/console.logger-transport';

export function createLogger({
  namespace,
  transports = [createConsoleLoggerTransport()],
  plugins = [],
  getTimestamp = () => Date.now(),
}: {
  namespace: string;
  transports?: LoggerTransport[];
  plugins?: LoggerPlugin[];
  getTimestamp?: () => number;
}) {
  const buildLogger = ({ level }: { level: LogLevel }) => {
    return (...args: [data: Record<string, unknown>, message: string] | [message: string]) => {
      const [data, message] = args.length === 1 ? [{}, args[0]] : args;

      const baseContext = {
        level,
        message,
        timestampMs: getTimestamp(),
        namespace,
        data,
      };

      const extendedContext = applyPluginsTransformLogContext({ baseContext, plugins });

      transports.forEach((transport) => {
        transport.log(extendedContext);
      });
    };
  };

  const logMethods = logLevels.reduce((acc, level) => ({
    ...acc,
    [level]: buildLogger({ level }),
  }), {} as Record<LogLevel, (...args: LogMethodArguments) => void>);

  return {
    ...logMethods,
    getTransports: () => transports,
    getPlugins: () => plugins,
    createChildLogger: createLoggerFactory({
      transports,
      plugins,
      getTimestamp,
    }),
  };
}

export function applyPluginsTransformLogContext({ baseContext, plugins }: { baseContext: LoggerTransportLogArgs; plugins: LoggerPlugin[] }) {
  if (plugins.length === 0) {
    return baseContext;
  }

  return plugins.reduce((context, plugin) => plugin.transformLogContext?.({ context }).context ?? context, baseContext);
}

export function createLoggerFactory(
  factoryOptions: { transports?: LoggerTransport[]; plugins?: LoggerPlugin[]; getTimestamp?: () => number },
) {
  return (instanceOptions: { namespace: string; transports?: LoggerTransport[]; plugins?: LoggerPlugin[]; getTimestamp?: () => number }) => {
    const options = {
      namespace: instanceOptions.namespace,
      getTimestamp: instanceOptions.getTimestamp ?? factoryOptions.getTimestamp,
      transports: [
        ...(factoryOptions.transports ?? []),
        ...(instanceOptions.transports ?? []),
      ],
      plugins: [
        ...(factoryOptions.plugins ?? []),
        ...(instanceOptions.plugins ?? []),
      ],
    };

    return createLogger(options);
  };
}
