import type { LoggerTransportLogArgs } from '@crowlog/logger';
import type { Colors } from 'picocolors/types';
import pc from 'picocolors';

export function getLevelColorFormatter({ level, colorFormatters = pc }: { level: string; colorFormatters?: Colors }) {
  const formatterMap: Record<string, (text: string) => string> = {
    error: colorFormatters.red,
    warn: colorFormatters.yellow,
    info: colorFormatters.green,
    debug: colorFormatters.gray,
  };

  return formatterMap[level] ?? colorFormatters.gray;
}

export function serializeValue({ value, colorFormatters = pc, leftPadding = 0 }: { value: unknown; colorFormatters?: Colors; leftPadding?: number }): string {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const newLeftPadding = leftPadding + 2;
    const currentPadding = ' '.repeat(leftPadding);
    const padding = ' '.repeat(newLeftPadding);

    return `{\n${Object
      .entries(value)
      .map(([key, value]) => `${padding}${key}: ${serializeValue({ value, colorFormatters, leftPadding: newLeftPadding })}`)
      .join('\n')}\n${currentPadding}}`;
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (typeof value === 'string') {
    const padding = ' '.repeat(leftPadding);
    return `"${value}"`.replaceAll('\n', `\n${padding}`);
  }

  return String(value);
}

export function formatDataLines({ data, leftPadding, colorFormatters = pc }: { data: Record<string, unknown>; leftPadding: number; colorFormatters?: Colors }) {
  const padding = ' '.repeat(leftPadding);

  return Object
    .entries(data)
    .map(([key, value]) => padding + colorFormatters.dim(`${key}: ${serializeValue({ value, colorFormatters, leftPadding })}`));
}

export function formatPrettyLog({ log, locale, colorFormatters = pc }: { log: LoggerTransportLogArgs; locale?: string; colorFormatters?: Colors }) {
  const { level, message, timestampMs, namespace, data } = log;

  const color = getLevelColorFormatter({ level, colorFormatters });
  const timestamp = new Date(timestampMs).toLocaleTimeString(locale);

  const firstLine = [
    colorFormatters.dim(timestamp),
    color(level.toUpperCase()),
    message,
  ].join(' ');

  const lines = [
    firstLine,
    ...formatDataLines({
      data: {
        namespace,
        ...data,
      },
      leftPadding: timestamp.length + 1,
      colorFormatters,
    }),
  ];

  return lines.join('\n');
}
