# In-Memory Transport

A transport that stores logs in memory for testing and debugging. Provides an API to retrieve emitted logs programmatically.

## Overview

The in-memory transport is designed specifically for **testing** and **debugging** scenarios. It stores all logs in an array that can be retrieved and inspected programmatically.

```typescript
import { createInMemoryLoggerTransport } from '@crowlog/logger';

const inMemoryTransport = createInMemoryLoggerTransport();
```

## Basic Usage

### Simple Example

```typescript
import { createInMemoryLoggerTransport, createLogger } from '@crowlog/logger';

const inMemoryTransport = createInMemoryLoggerTransport();

const logger = createLogger({
  namespace: 'my-app',
  transports: [inMemoryTransport]
});

logger.info('First log');
logger.error({ userId: '123' }, 'Second log');

// Retrieve logs
const logs = inMemoryTransport.getLogs();
console.log(logs);
// [
//   {
//     level: 'info',
//     message: 'First log',
//     timestampMs: 1738878633123,
//     namespace: 'my-app',
//     data: {}
//   },
//   {
//     level: 'error',
//     message: 'Second log',
//     timestampMs: 1738878633456,
//     namespace: 'my-app',
//     data: { userId: '123' }
//   }
// ]
```

## API

### `getLogs(options?)`

Retrieve all stored logs.

```typescript
type GetLogsOptions = {
  excludeTimestampMs?: boolean;
};

function getLogs(options?: GetLogsOptions): LoggerTransportLogArgs[];
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `excludeTimestampMs` | `boolean` | `false` | Omit `timestampMs` from results |

#### Returns

Array of log objects containing:

```typescript
{
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestampMs: number; // Omitted if excludeTimestampMs: true
  namespace: string;
  data: Record<string, unknown>;
}
```

## Testing with In-Memory Transport

### Unit Tests

Perfect for asserting log output in unit tests:

```typescript
import { createInMemoryLoggerTransport, createLogger } from '@crowlog/logger';
import { describe, expect, test } from 'vitest';

describe('User service', () => {
  test('logs user creation', async () => {
    const inMemoryTransport = createInMemoryLoggerTransport();

    const logger = createLogger({
      namespace: 'user-service',
      transports: [inMemoryTransport]
    });

    await createUser({ logger, name: 'Alice' });

    const logs = inMemoryTransport.getLogs({ excludeTimestampMs: true });

    expect(logs).toEqual([
      {
        level: 'info',
        message: 'User created',
        namespace: 'user-service',
        data: { name: 'Alice' }
      }
    ]);
  });
});
```

### Deterministic Tests

Use `excludeTimestampMs: true` for deterministic assertions:

```typescript
test('logs payment processing', () => {
  const inMemoryTransport = createInMemoryLoggerTransport();
  const logger = createLogger({
    namespace: 'payment',
    transports: [inMemoryTransport]
  });

  processPayment({ logger, amount: 100 });

  // Timestamps are excluded for predictable snapshots
  const logs = inMemoryTransport.getLogs({ excludeTimestampMs: true });

  expect(logs).toMatchSnapshot();
});
```

## Limitations

::: warning Memory Growth
In-memory transport stores logs indefinitely. For long-running tests or large test suites, this can cause memory issues.

**Solution**: Clear logs between tests or use a fresh transport for each test.
:::

::: warning No Automatic Cleanup
Unlike stdout which automatically flushes, in-memory logs persist until explicitly cleared or garbage collected.

**Solution**: Create new transports in `beforeEach` hooks.
:::

::: danger Production Use
Never use in production! Use [stdout transport](/transports/stdout) or [custom transports](/transports/custom) for production logging.
:::

## See Also

- [Stdout Transport](/transports/stdout) - Default production transport
- [Custom Transports](/transports/custom) - Create your own transports
- [Testing Guide](/guides/testing-with-crowlog) - Testing patterns with Crowlog
