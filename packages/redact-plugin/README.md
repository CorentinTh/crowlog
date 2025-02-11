# Crowlog - Async Context Plugin

This package is a plugin for the [Crowlog logger](https://github.com/CorentinTh/crowlog). It allows to simply add context data to the logs using node async context.
It's useful in http servers to add log context that follow the lifecycle of a request (like a request id or user id).

> [!IMPORTANT]
> This plugin is only available environment that supports `async_hooks` like Node.js or [cloudflare workers with compatibility flags](https://developers.cloudflare.com/workers/runtime-apis/nodejs/asynclocalstorage).


## Installation

```bash
// pnpm 
pnpm install @crowlog/logger @crowlog/async-context-plugin

// npm
npm install @crowlog/logger @crowlog/async-context-plugin

// yarn
yarn add @crowlog/logger @crowlog/async-context-plugin
```

## Usage

Use the plugin by first creating a logger with the plugin:

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

## Examples

### Hono JS

```typescript
import { createMiddleware } from 'hono';
import { addLogContext, wrapWithLoggerContext } from '@crowlog/async-context-plugin';

const loggerMiddleware = createMiddleware(async (context, next) => {
  const requestId = getHeader({ context, name: 'x-request-id' }) ?? generateId();

  await wrapWithLoggerContext({ requestId }, next);
});

const authMiddleware = createMiddleware(async (context, next) => {
  const userId = /* get the user id from your auth layer */;

  addLogContext({ userId });

  await next();
});
```

```typescript
import { Hono } from 'hono';
import { createLogger } from '@crowlog/logger';
import { createAsyncContextPlugin } from '@crowlog/async-context-plugin';

const app = new Hono();
const logger = createLogger({ namespace: 'my-app', plugins: [createAsyncContextPlugin()] });

app.use(loggerMiddleware);
app.use(authMiddleware);

app.get('/', (c) => {
  // logs will have the requestId and userId
  logger.info('Request received');

  return c.json({ message: 'Hello World' });
});
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

## Credits 

This project is crafted with ❤️ by [Corentin Thomasset](https://corentin.tech).
If you find this project helpful, please consider [supporting my work](https://buymeacoffee.com/cthmsst).







 



