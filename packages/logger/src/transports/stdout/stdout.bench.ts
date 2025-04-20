import { bench, describe } from 'vitest';
import { writeToConsole, writeToStdout } from './stdout.logger-transport';

describe('stdout logger transport', () => {
  bench('writeToConsole', () => {
    writeToConsole('lorem ipsum dolor sit amet');
  });

  bench('writeToStdout', () => {
    writeToStdout('lorem ipsum dolor sit amet');
  });
});
