# Stdout Transport

The default transport that writes logs to standard output in JSON format. See [implementation details](https://github.com/CorentinTh/crowlog/blob/main/packages/logger/src/transports/stdout/stdout.logger-transport.ts).

## Overview

The stdout transport is the **default transport** used by Crowlog when no transports are explicitly configured. It's designed for production environments where logs are captured by container orchestrators, log aggregation systems, or process managers.

```typescript
import { createStdoutLoggerTransport } from '@crowlog/logger';

const transport = createStdoutLoggerTransport();
```

## Default Behavior

By default, the stdout transport:

- **Serializes logs to JSON** using `JSON.stringify()`
- **Writes to stdout** using direct `process.stdout.write()` when available, falling back to `console.log()` in other environments
- **Includes all fields**: level, message, timestampMs, namespace, data
- **Works everywhere**: Node.js, browsers, Deno, Bun, Cloudflare Workers

## Basic Usage

### Implicit (Default)

When you don't specify transports, Crowlog automatically uses stdout:

```typescript
import { createLogger } from '@crowlog/logger';

// These are equivalent
const logger1 = createLogger({ namespace: 'my-app' });

const logger2 = createLogger({
  namespace: 'my-app',
  transports: [createStdoutLoggerTransport()]
});
```

### Explicit Configuration

```typescript
import { createLogger, createStdoutLoggerTransport } from '@crowlog/logger';

const logger = createLogger({
  namespace: 'my-app',
  transports: [createStdoutLoggerTransport()]
});

logger.info('Hello world');
// Output: {"level":"info","message":"Hello world","timestampMs":1738878633123,"namespace":"my-app","data":{}}
```

## Configuration Options

### Custom Serialization

Control how log objects are converted to strings:

```typescript
const transport = createStdoutLoggerTransport({
  serialize: ({ level, message, timestampMs, namespace, data }) => {
    // Custom format
    return `[${level.toUpperCase()}] ${namespace} - ${message}`;
  }
});

const logger = createLogger({
  namespace: 'my-app',
  transports: [transport]
});

logger.info('Application started');
// Output: [INFO] my-app - Application started
```

### Custom Write Function

Override where and how logs are written:

```typescript
const transport = createStdoutLoggerTransport({
  writeToStdout: (serializedLog) => {
    // Write to stderr instead
    process.stderr.write(`${serializedLog}\n`);
  }
});
```

### Combined Configuration

```typescript
const transport = createStdoutLoggerTransport({
  serialize: (args) => {
    const { level, message, timestampMs, namespace, data } = args;

    // ECS (Elastic Common Schema) format
    return JSON.stringify({
      '@timestamp': new Date(timestampMs).toISOString(),
      'log.level': level.toUpperCase(),
      'log.logger': namespace,
      message,
      ...data
    });
  },

  writeToStdout: (log) => {
    if (process.env.NODE_ENV === 'production') {
      // Direct stdout write in production
      process.stdout.write(`${log}\n`);
    } else {
      // Console.log in development
      console.log(log);
    }
  }
});
```

## Advanced Examples

### Structured Logging for Cloud Services

Format logs for cloud logging services:

```typescript
// Google Cloud Logging format
const transport = createStdoutLoggerTransport({
  serialize: ({ level, message, timestampMs, namespace, data }) => {
    return JSON.stringify({
      severity: level.toUpperCase(),
      message,
      timestamp: new Date(timestampMs).toISOString(),
      labels: {
        namespace
      },
      jsonPayload: data
    });
  }
});
```

```typescript
// AWS CloudWatch format
const transport = createStdoutLoggerTransport({
  serialize: ({ level, message, timestampMs, namespace, data }) => {
    return JSON.stringify({
      timestamp: timestampMs,
      level: level.toUpperCase(),
      logger: namespace,
      message,
      ...data
    });
  }
});
```

### Conditional Formatting

Different formats for different environments:

```typescript
function createEnvironmentAwareTransport() {
  const isDev = process.env.NODE_ENV === 'development';

  return createStdoutLoggerTransport({
    serialize: isDev
      ? ({ level, message, namespace }) => {
          // Simple format for development
          return `[${level}] ${namespace}: ${message}`;
        }
      : (args) => {
          // JSON for production
          return JSON.stringify(args);
        }
  });
}
```

## See Also

- [Pretty Logging](/guides/pretty-logging) - Format logs for development
- [Plugin System](/plugins/) - Extend logger functionality
- [Custom Transports](/transports/custom) - Create your own transports
