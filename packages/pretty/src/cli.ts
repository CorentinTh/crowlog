import type { LoggerTransportLogArgs } from '@crowlog/logger';
import process from 'node:process';
import { formatPrettyLog } from './formatter';

process.stdin.on('data', (data) => {
  const lines = data.toString().trim().split(/\r?\n/);

  for (const line of lines) {
    try {
      const log: unknown = JSON.parse(line.trim());

      const newLine = isLog(log) ? formatPrettyLog({ log }) : line;
      process.stdout.write(`${newLine}\n`);
    } catch (_) {
      process.stdout.write(`${line}\n`);
    }
  }
});

function isLog(log: unknown): log is LoggerTransportLogArgs {
  return typeof log === 'object' && log !== null && 'level' in log && 'message' in log && 'timestampMs' in log;
}
