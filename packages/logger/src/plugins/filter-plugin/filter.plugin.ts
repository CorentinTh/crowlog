import type { LoggerPlugin, LoggerTransportLogArgs, LogLevel } from '../../logger.types';
import { logLevels } from '../../logger.constants';

type LevelOrderMap = Record<LogLevel, number>;

export function createLevelFilter({
  onlyLevels,
  minLevel,
  maxLevel,
}: {
  onlyLevels?: LogLevel[];
  minLevel?: LogLevel;
  maxLevel?: LogLevel;
} = {}): (args: { level: LogLevel }) => boolean {
  if (!onlyLevels && !minLevel && !maxLevel) {
    return () => true;
  }

  if (onlyLevels && onlyLevels.length === 0) {
    return () => false;
  }

  if (onlyLevels) {
    const onlyLevelsSet = new Set(onlyLevels);
    return ({ level }) => onlyLevelsSet.has(level);
  }

  const levelOrder: LevelOrderMap = logLevels.reduce((acc, level, index) => ({ ...acc, [level]: index }), {} as LevelOrderMap);

  return ({ level }) => {
    if (minLevel && levelOrder[level] < levelOrder[minLevel]) {
      return false;
    }

    if (maxLevel && levelOrder[level] > levelOrder[maxLevel]) {
      return false;
    }

    return true;
  };
}

export function createNamespaceFilter({
  excludedNamespaces,
  onlyNamespaces,
}: { excludedNamespaces?: string[]; onlyNamespaces?: string[] } = {}): (args: { namespace: string }) => boolean {
  if (onlyNamespaces && onlyNamespaces.length === 0) {
    return () => false;
  }

  const excludedNamespacesSet = new Set(excludedNamespaces ?? []);

  if (onlyNamespaces) {
    const onlyNamespacesSet = new Set(onlyNamespaces);
    return ({ namespace }) => onlyNamespacesSet.has(namespace) && !excludedNamespacesSet.has(namespace);
  }

  return ({ namespace }) => !excludedNamespacesSet.has(namespace);
}

export function createCustomFilter({ customFilter }: { customFilter?: (args: { context: LoggerTransportLogArgs }) => boolean } = {}): (args: { context: LoggerTransportLogArgs }) => boolean {
  if (!customFilter) {
    return () => true;
  }

  return customFilter;
}

export function createFilterPlugin({
  onlyLevels,
  minLevel,
  maxLevel,
  excludedNamespaces,
  onlyNamespaces,
  customFilter,
}: {
  /**
   * The minimum log level to log, logs below this level will be filtered out, the levels are (from lowest to highest): debug, info, warn, error
   */
  minLevel?: LogLevel;

  /**
   * The maximum log level to log, logs above this level will be filtered out, the levels are (from lowest to highest): debug, info, warn, error
   */
  maxLevel?: LogLevel;

  /**
   * A list of log levels to log, only logs with these levels will be logged, the levels are: debug, info, warn, error. It overrides minLevel and maxLevel
   */
  onlyLevels?: LogLevel[];

  /**
   * Namespaces to exclude from logging
   */
  excludedNamespaces?: string[];

  /**
   * Namespaces to include for logging only
   */
  onlyNamespaces?: string[];

  /**
   * Custom filter function to determine whether to log or not
   */
  customFilter?: (args: { context: LoggerTransportLogArgs }) => boolean;
} = {}): LoggerPlugin {
  const isLevelAllowed = createLevelFilter({ onlyLevels, minLevel, maxLevel });
  const isNamespaceAllowed = createNamespaceFilter({ excludedNamespaces, onlyNamespaces });
  const isCustomAllowed = createCustomFilter({ customFilter });

  return {
    name: 'filter',
    shouldLog: ({ context }) => {
      const { level, namespace } = context;

      return isLevelAllowed({ level }) && isNamespaceAllowed({ namespace }) && isCustomAllowed({ context });
    },
  };
}
