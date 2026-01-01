# Custom Transports

Create custom transports to send logs anywhere you need.

## Overview

A transport is simply a function that receives log data and does something with it. Crowlog's transport interface is intentionally simple, making it easy to create custom transports for any destination.

```typescript
type LoggerTransport = (args: LoggerTransportLogArgs) => void;
```

## Transport Interface

### LoggerTransportLogArgs

Every transport receives a log object with this structure:

```typescript
type LoggerTransportLogArgs = {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestampMs: number;
  namespace: string;
  data: Record<string, unknown>;
};
```

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `level` | `LogLevel` | Log severity level |
| `message` | `string` | Log message |
| `timestampMs` | `number` | Unix timestamp in milliseconds |
| `namespace` | `string` | Logger namespace |
| `data` | `Record<string, unknown>` | Structured log data |

## Basic Transport Template

The simplest custom transport:

```typescript
import type { LoggerTransport, LoggerTransportLogArgs } from '@crowlog/logger';

function createMyTransport(): LoggerTransport {
  return (args: LoggerTransportLogArgs) => {
    // Do something with the log
    console.log(args);
  };
}

// Usage
const logger = createLogger({
  namespace: 'my-app',
  transports: [createMyTransport()]
});
```
