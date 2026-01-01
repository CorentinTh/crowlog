# Transports

Transports control **where logs are sent**. Crowlog includes built-in transports and supports custom implementations.

## Overview

A transport is simply a function that receives log data and handles it in some way - writing to stdout, storing in memory, sending to a remote service, etc.

```typescript
type LoggerTransport = (args: LoggerTransportLogArgs) => void;
```

Every log passes through all configured transports:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  transports: [
    createStdoutLoggerTransport(), // Console
    createInMemoryLoggerTransport(), // Memory
    myCustomFileTransport() // Custom
  ]
});

// This log goes to all three transports
logger.info('Hello world');
```

## Built-in Transports

- [Stdout Transport](/transports/stdout) - Outputs logs to stdout (console) in JSON format
- [In-Memory Transport](/transports/in-memory) - Stores logs in memory for testing and debugging
