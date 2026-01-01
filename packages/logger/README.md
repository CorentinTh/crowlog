<p align="center">
<picture>
    <source srcset="https://github.com/CorentinTh/crowlog/blob/main/apps/docs/src/public/logo-dark.svg" media="(prefers-color-scheme: light)" width="150">
    <source srcset="https://github.com/CorentinTh/crowlog/blob/main/apps/docs/src/public/logo-light.svg" media="(prefers-color-scheme: dark)" width="150">
    <img src="https://github.com/CorentinTh/crowlog/blob/main/apps/docs/src/public/logo-dark.svg" alt="Header banner" width="150">
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

Transports control where logs are sent. By default, Crowlog uses the `stdout` transport (outputs JSON to console).

```typescript
import { createLogger, createStdoutLoggerTransport } from '@crowlog/logger';

// Customize serialization
const logger = createLogger({
  namespace: 'my-app',
  transports: [
    createStdoutLoggerTransport({
      serialize: ({ level, message }) => `[${level}] ${message}`
    })
  ]
});
```

For testing, use the in-memory transport:

```typescript
import { createInMemoryLoggerTransport } from '@crowlog/logger';

const inMemoryTransport = createInMemoryLoggerTransport();
const logger = createLogger({
  namespace: 'my-app',
  transports: [inMemoryTransport]
});

logger.info('Test log');
const logs = inMemoryTransport.getLogs({ excludeTimestampMs: true });
```

See the [full documentation](https://crowlog.dev/transports) for more details on transports and how to create custom ones.

## Plugins

Plugins extend logger functionality with filtering, redaction, and context management.

### Filter Plugin

Control which logs reach transports:

```typescript
import { createLogger, createFilterPlugin } from '@crowlog/logger';

const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      minLevel: 'info',  // Only info and above
      excludedNamespaces: ['debug-utils']  // Exclude specific namespaces
    })
  ]
});
```

### Redact Plugin

Automatically hide sensitive data:

```typescript
import { createRedactPlugin } from '@crowlog/logger';

const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: ['password', 'apiKey', 'user.email']
    })
  ]
});

logger.info({ password: 'secret', username: 'alice' }, 'Login');
// Output: { password: '[redacted]', username: 'alice' }
```

### Global Context Plugin

Add application-wide context to all logs:

```typescript
import { createGlobalLogContextPlugin } from '@crowlog/logger';

const { globalContextPlugin, setGlobalLogContext } = createGlobalLogContextPlugin();

const logger = createLogger({
  namespace: 'my-app',
  plugins: [globalContextPlugin]
});

setGlobalLogContext({ environment: 'production', version: '1.0.0' });
logger.info('Started'); // Includes environment and version
```

### Async Context Plugin

Add request-scoped context (requires `async_hooks` support):

```typescript
import { createAsyncContextPlugin, wrapWithLoggerContext } from '@crowlog/async-context-plugin';

const logger = createLogger({
  namespace: 'my-app',
  plugins: [createAsyncContextPlugin()]
});

wrapWithLoggerContext({ requestId: '123' }, () => {
  logger.info('Processing'); // Includes requestId
});
```

See the [full documentation](https://crowlog.dev/plugins) for more details on plugins and how to create custom ones.

## Pretty Logging

Format JSON logs for development with `@crowlog/pretty`:

```bash
node index.js | npx crowlog-pretty
```

![log-screenshot](.github/pretty-screenshots.png)

See the [pretty logging guide](https://crowlog.dev/guides/pretty-logging) for more details.

## Testing

Use the in-memory transport to capture logs in tests, or the noop logger to disable logging entirely:

```typescript
import { createNoopLogger } from '@crowlog/logger';

// No logs will be produced
const result = doSomething({ logger: createNoopLogger() });
```

See the [testing guide](https://crowlog.dev/guides/testing-with-crowlog) for more details.

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

The icon is the [Raven Rounded](https://icones.js.org/collection/all?icon=material-symbols:raven-rounded) from the [Material Symbols](https://fonts.google.com/icons).
