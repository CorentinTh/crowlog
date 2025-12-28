<p align="center">
<picture>
    <source srcset="https://github.com/CorentinTh/crowlog/blob/main/.github/icon-dark.png" media="(prefers-color-scheme: light)">
    <source srcset="https://github.com/CorentinTh/crowlog/blob/main/.github/icon-light.png" media="(prefers-color-scheme: dark)">
    <img src="https://github.com/CorentinTh/crowlog/blob/main/.github/icon-dark.png" alt="Header banner">
</picture>
</p>

<h1 align="center">
  Crowlog - Extendable JS logging library
</h1>

<p align="center">
  Crowlog is a simple, lightweight, zero-dependency, and extendable logging library that is designed to be used in any project.
</p>

## Features

- **Ultra lightweight** - Crowlog is very lightweight (less than 1kB minified + gzipped, see [comparison](#comparison)).
- **Zero dependencies** - No runtime dependencies, just pure JavaScript.
- **Extendable** - Crowlog is designed to be extendable, so you can add your own transports and plugins to it.
- **Simple** - Crowlog is designed to be simple and easy to use.
- **Fully typed** - Crowlog is fully typed, so you can get autocomplete and type safety when using it.
- **Any environment** - Crowlog works in any environment, including Node.js, browsers, and the edge.
- **Testing friendly** - Crowlog is designed to be testing friendly, so you can easily test your logs with the in-memory transport.
- **Slightly opinionated** - Crowlog is designed to be slightly opinionated, so it has a default transport and some plugins.
- **Pretty logs** - [Crowlog pretty log command](https://github.com/CorentinTh/crowlog/tree/main/packages/pretty) to display logs in a more readable format for development.

## Installation

```bash
# pnpm
pnpm install @crowlog/logger

# npm
npm install @crowlog/logger

# yarn
yarn add @crowlog/logger
```

## Usage

Basic usage:

```typescript
import { createLogger } from '@crowlog/logger';

const logger = createLogger({ namespace: 'my-app' });

logger.info('Hello world');
logger.error({ error: new Error('...') }, 'Something went wrong');
```

> [!NOTE]
> The logging interface is either a single string message or a data object and a message string tuple.
> ```typescript
> logger.info('Hello world');
> logger.info({ foo: 'bar' }, 'Hello world');
> ```

### Methods

Crowlog logger provides 4 different logging methods: `debug`, `info`, `warn`, and `error`.

```typescript
logger.debug(/* ... */);
logger.info(/* ... */);
logger.warn(/* ... */);
logger.error(/* ... */);
```

### Child logger and factory

Crowlog logger provides a `createChildLogger` method to create a child logger that inherit the configuration of the parent logger.

```typescript
import { createLogger } from '@crowlog/logger';

const logger = createLogger({ namespace: 'my-app' });
const childLogger = logger.createChildLogger({ namespace: 'child' });
```

Alternatively, you can use the `createLoggerFactory` to create a logger factory that can be used to create child loggers with the same configuration.

```typescript
import { createLoggerFactory } from '@crowlog/logger';

const createLogger = createLoggerFactory({ transports: /* ... */, plugins: /* ... */ });
const logger = createLogger({ namespace: 'child' });
```

## Transports

A transport specifies where the logs are sent to. By default, Crowlog uses the `stdout` transport.

### Stdout transport

The stdout transport writes the logs to the standard output stream. It's the default transport.

```typescript
import { createLogger, createStdoutLoggerTransport } from '@crowlog/logger';

const logger = createLogger({ namespace: 'my-app' });
// equivalent to
const logger = createLogger({ namespace: 'my-app', transports: [createStdoutLoggerTransport()] });

logger.info('Hello world');
```

By default, the stdout transport serializes the log args to a JSON string and use the `console.log` function to write the logs to the standard output stream for cross-compatibility with most environments.

You can customize the serialization and the write function by providing a custom `serialize` and `write` function to the transport.

```typescript
import { createLogger, createStdoutLoggerTransport } from '@crowlog/logger';

const logger = createLogger({
  namespace: 'my-app',
  transports: [
    createStdoutLoggerTransport({
      serialize: ({ level, message, timestampMs, namespace, data }) => `[${level}] ${message}`,
      // default : (args) => JSON.stringify(args),
      writeToStdout: (serializedLog) => process.stdout.write(serializedLog),
      // default : (serializedLog) => console.log(serializedLog),
    })
  ]
});
```

### In-memory transport

The in-memory transport is a transport that stores the logs in memory. It is useful for testing and for debugging.

It provides a `getLogs` method to retrieve the logs.

```typescript
import { createLogger, createInMemoryLoggerTransport } from '@crowlog/logger';

const inMemoryTransport = createInMemoryLoggerTransport();

const logger = createLogger({ namespace: 'my-app', transports: [inMemoryTransport] });

logger.info('Hello world');
logger.error({ foo: 'bar' }, 'Something went wrong');

// get the logs
const logs = inMemoryTransport.getLogs();
/*
[
  {
    level: 'info',
    message: 'Hello world',
    timestamp: 1738878633123,
    namespace: 'my-app',
    data: {},
  },
  {
    level: 'error',
    message: 'Something went wrong',
    timestamp: 1738878633123,
    namespace: 'my-app',
    data: { foo: 'bar' },
  },
]
```

> [!TIP]
> The `getLogs` method accepts a `excludeTimestampMs` option to exclude the timestamp from the logs for better DX in writing more deterministic tests.
>
> ```typescript
> const logs = inMemoryTransport.getLogs({ excludeTimestampMs: true });
> ```

## Plugins

A plugin permit to extend the logger with custom functionality.

### Async context plugin

Permit to easily add context data to the logs, it's useful in http servers to add log context that follow the lifecycle of a request (like a request id).

> [!IMPORTANT]
> This plugin is only available environment that supports `async_hooks` like Node.js or [cloudflare workers with compatibility flags](https://developers.cloudflare.com/workers/runtime-apis/nodejs/asynclocalstorage).


Install the plugin:

```bash
# pnpm
pnpm install @crowlog/async-context-plugin

# npm
npm install @crowlog/async-context-plugin

# yarn
yarn add @crowlog/async-context-plugin
```

Use the plugin:

```typescript
import { createLogger } from '@crowlog/logger';
import { createAsyncContextPlugin, addLogContext, wrapWithLoggerContext } from '@crowlog/async-context-plugin';

const logger = createLogger({ namespace: 'my-app', plugins: [createAsyncContextPlugin()] });

// create a context, some initial context data can be added
wrapWithLoggerContext({ requestId: '123' }, () => {
  addLogContext({ userId: '123' });

  // logs within the context will have the requestId and userId
  logger.info('Hello world');
});
```

More details about the async context plugin can be found in the [async-context-plugin README](./packages/async-context-plugin/README.md).

### Global log context plugin

The global log context plugin allows you to set global context data that will be automatically included in all logs. This is useful for adding application-wide context like environment, version, or any other static data that should appear in every log entry.

Unlike the async context plugin, the global context is shared across all loggers using the same plugin instance and persists until explicitly changed.

```typescript
import { createLogger, createGlobalLogContextPlugin } from '@crowlog/logger';

const { globalContextPlugin, setGlobalLogContext, addToGlobalLogContext, getGlobalLogContext } = createGlobalLogContextPlugin();

const logger = createLogger({
  namespace: 'my-app',
  plugins: [globalContextPlugin]
});

// Set the global context
setGlobalLogContext({ environment: 'production', version: '1.0.0' });

logger.info('Application started');
// Output includes: { environment: 'production', version: '1.0.0' }

// Add to the existing global context
addToGlobalLogContext({ region: 'us-east-1' });

logger.info('Processing request');
// Output includes: { environment: 'production', version: '1.0.0', region: 'us-east-1' }
```

**API:**

- `setGlobalLogContext(context)` - Replace the entire global context
- `addToGlobalLogContext(context)` - Shallow merge new properties into the existing global context
- `getGlobalLogContext()` - Retrieve the current global context

**TypeScript support:**

You can provide a type for the global context to ensure type safety when setting or adding to the global context.

```typescript
type MyGlobalContext = {
  environment: string;
  version: string;
  region?: string;
};

const { globalContextPlugin, setGlobalLogContext } = createGlobalLogContextPlugin<MyGlobalContext>();

// TypeScript will enforce the shape of the context
setGlobalLogContext({ environment: 'production', version: '1.0.0' });
```

> [!NOTE]
> When there's a conflict between global context and log-specific data, the log-specific data takes precedence.

### Redact plugin

The redact plugin allows you to automatically hide sensitive data from your logs by specifying paths to values that should be redacted. This is useful for preventing secrets, passwords, API keys, or other sensitive information from appearing in your logs.

```typescript
import { createLogger, createRedactPlugin } from '@crowlog/logger';

const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: ['user.password', 'apiKey', 'creditCard.number']
    })
  ]
});

logger.info({
  user: {
    email: 'user@example.com',
    password: 'secret123'
  },
  apiKey: 'sk_live_abc123'
}, 'User authenticated');

// Output data will be:
// {
//   user: {
//     email: 'user@example.com',
//     password: '[redacted]'
//   },
//   apiKey: '[redacted]'
// }
```

**Configuration options:**

- `paths` - Array of dot-separated paths to redact (e.g., `['user.password', 'apiKey']`)
- `redactedValue` - Custom replacement value (default: `'[redacted]'`)

**Advanced path syntax:**

The redact plugin supports advanced path patterns for working with arrays:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: [
        'users.*.password',           // Redact password in all array items
        'users.0.email',              // Redact email of first user only
        'teams.*.members.*.apiKey',   // Nested arrays with wildcards
        'tokens.*'                    // Redact all array values
      ]
    })
  ]
});

logger.info({
  users: [
    { email: 'user1@example.com', password: 'pass1' },
    { email: 'user2@example.com', password: 'pass2' }
  ],
  tokens: ['token1', 'token2', 'token3']
}, 'Multiple users');

// Output data will be:
// {
//   users: [
//     { email: '[redacted]', password: '[redacted]' },
//     { email: 'user2@example.com', password: '[redacted]' }
//   ],
//   tokens: ['[redacted]', '[redacted]', '[redacted]']
// }
```

**Custom redacted value:**

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: ['user.password'],
      redactedValue: '***HIDDEN***'
    })
  ]
});
```

> [!NOTE]
> The redact plugin creates a deep copy of the log data before redacting, so the original objects passed to the logger are never modified.

### Filter plugin

The filter plugin allows you to control which logs are actually sent to transports by filtering them based on log level, namespace, or custom criteria. This is useful for reducing noise in production, debugging specific parts of your application, or implementing environment-specific logging policies.

```typescript
import { createLogger, createFilterPlugin } from '@crowlog/logger';

const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      minLevel: 'warn'  // Only log warnings and errors
    })
  ]
});

logger.debug('Debug message');  // Filtered out
logger.info('Info message');    // Filtered out
logger.warn('Warning message'); // Logged
logger.error('Error message');  // Logged
```

**Configuration options:**

The filter plugin supports multiple filtering strategies that can be combined:

**Level filtering:**

- `minLevel` - Minimum log level to allow (logs below this level are filtered out)
- `maxLevel` - Maximum log level to allow (logs above this level are filtered out)
- `onlyLevels` - Array of specific levels to allow (all other levels are filtered out)

**Namespace filtering:**

- `excludedNamespaces` - Array of namespaces to filter out
- `onlyNamespaces` - Array of namespaces to allow (all other namespaces are filtered out)

**Custom filtering:**

- `customFilter` - Function that receives the log context and returns `true` to allow or `false` to filter out

**Examples:**

Filter by minimum level (production use case):

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      minLevel: 'info'  // Filter out debug logs in production
    })
  ]
});
```

Filter by level range:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      minLevel: 'info',
      maxLevel: 'warn'  // Only log info and warn, exclude debug and error
    })
  ]
});
```

Filter specific levels only:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      onlyLevels: ['error']  // Only log errors
    })
  ]
});
```

Filter by namespace:

```typescript
const productionLogger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      excludedNamespaces: ['debug-utils', 'test-helpers']  // Exclude noisy namespaces
    })
  ]
});

const debugLogger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      onlyNamespaces: ['auth', 'database']  // Only log from specific namespaces
    })
  ]
});
```

Custom filter based on log data:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      customFilter: ({ context }) => {
        // Only log if the data contains an error or is explicitly marked as important
        return context.data.error !== undefined || context.data.important === true;
      }
    })
  ]
});

logger.info({ important: true }, 'Critical update');  // Logged
logger.info('Regular message');                       // Filtered out
logger.error({ error: new Error('Failed') }, 'Oops'); // Logged
```

Combine multiple filters:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      minLevel: 'info',                      // Must be info or above
      excludedNamespaces: ['debug-utils'],   // AND not from debug-utils
      customFilter: ({ context }) => {       // AND pass custom logic
        return !context.message.includes('sensitive');
      }
    })
  ]
});
```

> [!NOTE]
> When multiple filter options are provided, **all filters must pass** (AND logic) for a log to be sent to transports. If any filter rejects the log, it will be filtered out.

> [!TIP]
> The `onlyLevels` option takes precedence over `minLevel` and `maxLevel`. If you specify `onlyLevels`, the `minLevel` and `maxLevel` options will be ignored.

### Pretty logs

Crowlog provides a pretty log command to display logs in a more readable format for development.

![log-screenshot](.github/pretty-screenshots.png)

```bash
# using node
node index.js | npx crowlog-pretty

# using tsx
tsx watch index.ts | npx crowlog-pretty
```

See the [pretty README](./packages/pretty/README.md) for more details.


### Noop Logger

The `@crowlog/logger` package also provides a `createNoopLogger` function to create a logger that does nothing. This is useful for testing or when you want to disable logging.

```typescript
// Some function with an inected logger
function doSomething({ logger }) {
  logger.info('Will do something');
  const foo = 42;
  logger.debug({ foo }, 'Did something');

  return foo;
}

// In test for example
import { createNoopLogger } from '@crowlog/logger';

const logger = createNoopLogger();

describe("doSomething", () => {
  test("stuff happens", () => {
    // no logs will be printed
    const result = doSomething({ logger = createNoopLogger() });

    expect(result).toBe(42);
  })
})
```



## Comparison

| Library | Runtime dependencies | Bundled size |
|---------|--------------|--------------|
| @crowlog/logger@1.0.0 | 0 dependencies | 1.3kB (674B minified + gzipped) [source](https://bundlephobia.com/package/@crowlog/logger@1.0.0) |
| pino@9.6.0 | 11 dependencies | 7.5kB (2.9kb minified + gzipped) [source](https://bundlephobia.com/package/pino@9.6.0) |
| winston@3.17.0 | 11 dependencies | 147.9kB (37.4kB minified + gzipped) [source](https://bundlephobia.com/package/winston@3.17.0) |
| bunyan@1.8.15 | 19 dependencies | 15.7kB (5.6kB minified + gzipped) [source](https://bundlephobia.com/package/bunyan@1.8.15) |

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

## Credits

This project is crafted with ❤️ by [Corentin Thomasset](https://corentin.tech).
If you find this project helpful, please consider [supporting my work](https://buymeacoffee.com/cthmsst).

The icon is the [Logs icon](https://icones.js.org/collection/all?icon=tabler:logs) from the [Tabler collection](https://github.com/tabler/tabler-icons)
