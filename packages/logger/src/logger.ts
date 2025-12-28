import type { LoggerPlugin, LoggerTransport, LoggerTransportLogArgs, LogLevel, LogMethodArguments } from './logger.types';
import { logLevels } from './logger.constants';
import { createStdoutLoggerTransport } from './transports/stdout/stdout.logger-transport';

export function createLogger({
  namespace,
  transports = [createStdoutLoggerTransport()],
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

      if (!applyPluginsShouldLog({ baseContext, plugins })) {
        return;
      }

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

export function applyPluginsShouldLog({ baseContext, plugins }: { baseContext: LoggerTransportLogArgs; plugins: LoggerPlugin[] }) {
  if (plugins.length === 0) {
    return true;
  }

  return plugins.every(plugin => plugin.shouldLog?.({ context: baseContext }) ?? true);
}

export function applyPluginsTransformLogContext({ baseContext, plugins }: { baseContext: LoggerTransportLogArgs; plugins: LoggerPlugin[] }) {
  if (plugins.length === 0) {
    return baseContext;
  }

  return plugins.reduce((context, plugin) => plugin.transformLogContext?.({ context }).context ?? context, baseContext);
}

export function mergeWhenDefined<T>(arr1: T[] | undefined, arr2: T[] | undefined) {
  if (arr1 === undefined && arr2 === undefined) {
    return undefined;
  }

  return [...(arr1 ?? []), ...(arr2 ?? [])];
}

export function createLoggerFactory(
  factoryOptions: { transports?: LoggerTransport[]; plugins?: LoggerPlugin[]; getTimestamp?: () => number } = {},
) {
  return (instanceOptions: { namespace: string; transports?: LoggerTransport[]; plugins?: LoggerPlugin[]; getTimestamp?: () => number }) => {
    const options = {
      namespace: instanceOptions.namespace,
      getTimestamp: instanceOptions.getTimestamp ?? factoryOptions.getTimestamp,
      transports: mergeWhenDefined(factoryOptions.transports, instanceOptions.transports),
      plugins: mergeWhenDefined(factoryOptions.plugins, instanceOptions.plugins),
    };

    return createLogger(options);
  };
}
