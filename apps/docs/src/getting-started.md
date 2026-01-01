# Getting Started

Get up and running with Crowlog in minutes.

## Installation

Install Crowlog using your preferred package manager:

::: code-group

```bash [pnpm]
pnpm install @crowlog/logger
```

```bash [npm]
npm install @crowlog/logger
```

```bash [yarn]
yarn add @crowlog/logger
```

:::

## Requirements

Crowlog works in any JavaScript environment:

- **Node.js**: Version 22.0.0 or higher (lower versions may work but are not tested)
- **Browsers**: All modern browsers
- **Edge Runtimes**: Cloudflare Workers, Deno, Bun, etc.

## Your First Logger

Create a logger with a namespace to identify the source of your logs:

```typescript
import { createLogger } from '@crowlog/logger';

const logger = createLogger({ namespace: 'my-app' });

logger.info('Application started');
// Output: {"level":"info","message":"Application started","timestampMs":1738878633123,"namespace":"my-app","data":{}}
```

## Log Levels

Crowlog provides four log levels, ordered by severity:

```typescript
logger.debug('Detailed debugging information');
logger.info('General informational messages');
logger.warn('Warning messages');
logger.error('Error messages');
```

Each level has a specific purpose:

| Level | Purpose | When to Use |
|-------|---------|-------------|
| `debug` | Detailed diagnostic information | Development, troubleshooting |
| `info` | General informational messages | Normal operations, lifecycle events |
| `warn` | Warning messages | Potentially harmful situations |
| `error` | Error messages | Error events that might still allow the app to continue |

## Logging Interface

Crowlog supports two logging patterns:

### Simple Message

Log just a message string:

```typescript
logger.info('User logged in');
```

### Structured Data with Message

Log data along with a message:

```typescript
logger.info(
  { userId: '123', email: 'user@example.com' },
  'User logged in'
);
```

::: tip Best Practice
Always include structured data when logging events. This makes logs searchable and easier to analyze.
:::

## What's Logged?

Every log entry contains:

```json
{
  "level": "info", // The log level
  "message": "User logged in", // Your message
  "timestampMs": 1738878633123, // Unix timestamp in milliseconds
  "namespace": "my-app", // Logger namespace
  "data": { // Your structured data
    "userId": "123",
    "email": "user@example.com"
  }
}
```

## Default Behavior

By default, Crowlog:

- **Outputs to stdout** using JSON format
- **Includes all log levels** (no filtering)
- **Default transport** is [stdout/console](/transports/stdout) based
- **Adds timestamps** to every log entry

## Next Steps

Now that you have a basic logger running, explore:

- [**Basic Usage**](/basic-usage) - Learn core concepts and patterns
- [**Transports**](/transports/) - Control where logs are sent
- [**Plugins**](/plugins/) - Add filtering, redaction, and more
- [**Guides**](/guides/child-loggers) - Child loggers, factories, and testing

::: tip Need Help?
If you run into issues, open an issue on [GitHub](https://github.com/CorentinTh/crowlog/issues).
:::
