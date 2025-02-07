# Crowlog - Extendable JS logging library

Crowlog is a simple, lightweight, zero-dependency, and extendable logging library that is designed to be used in any project.


## Features

- **Ultra lightweight** - Crowlog is very lightweight (less than 1kB minified + gzipped, see [comparison](#comparison)).
- **Zero dependencies** - No runtime dependencies, just pure JavaScript.
- **Extendable** - Crowlog is designed to be extendable, so you can add your own transports and plugins to it.
- **Simple** - Crowlog is designed to be simple and easy to use.
- **Fully typed** - Crowlog is fully typed, so you can get autocomplete and type safety when using it.
- **Any environment** - Crowlog works in any environment, including Node.js, browsers, and the edge.
- **Testing friendly** - Crowlog is designed to be testing friendly, so you can easily test your logs with the in-memory transport.
- **Slightly opinionated** - Crowlog is designed to be slightly opinionated, so it has a default transport and some plugins.

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

A transport specifies where the logs are sent to. By default, Crowlog uses the `console` transport. 

### Console transport

The console transport use the standard `console` to log the messages to stdout.

```typescript
import { createLogger, createConsoleLoggerTransport } from '@crowlog/logger';

const logger = createLogger({ namespace: 'my-app' });
// equivalent to
const logger = createLogger({ namespace: 'my-app', transports: [createConsoleLoggerTransport()] });

logger.info('Hello world');
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

The async context plugin is a plugin that adds the async context to the logs.

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

## Comparison

| Library | Runtime dependencies | Bundled size |
|---------|--------------|--------------|
| @crowlog/logger@1.0.0 | 0 dependencies | 1.3kB (674B minified + gzipped) [source](https://bundlephobia.com/package/@crowlog/logger@1.0.0) |
| pino@9.6.0 | 11 dependencies | 7.5kB (2.9kb minified + gzipped) [source](https://bundlephobia.com/package/pino@9.6.0) |
| winston@3.17.0 | 11 dependencies | 147.9kB (37.4kB minified + gzipped) [source](https://bundlephobia.com/package/winston@3.17.0) |
| bunyan@1.8.15 | 0 dependencies | 15.7kB (5.6kB minified + gzipped) [source](https://bundlephobia.com/package/bunyan@1.8.15) |

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

## Credits 

This project is crafted with ❤️ by [Corentin Thomasset](https://corentin.tech).
If you find this project helpful, please consider [supporting my work](https://buymeacoffee.com/cthmsst).

