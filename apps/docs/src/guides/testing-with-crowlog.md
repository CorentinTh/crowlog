# Testing with Crowlog

Crowlog provides tools to make testing easy.

## In-Memory Transport

Capture logs during tests for assertions:

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

## Noop Logger

The noop logger implements the full `Logger` interface but does nothing - no output, no side effects, fast execution. Perfect for tests where you don't need to verify log output.

```typescript
const logger = createNoopLogger();

logger.info('This does nothing');
logger.error({ error: new Error('aaahh!') }, 'This also does nothing');

// No output, no side effects, fast execution, ideal for tests
```

Example usage in tests:

```typescript
import { createNoopLogger } from '@crowlog/logger';

describe('Payment service', () => {
  test('processes payment', async () => {
    // No logs will be produced
    const result = await processPayment({ logger: createNoopLogger(), amount: 100 });

    expect(result.success).toBe(true);
  });
});
```
