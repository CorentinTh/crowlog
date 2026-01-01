# Async Context Plugin

Add request-scoped context using Node.js AsyncLocalStorage.

## Overview

The async context plugin provides **request-scoped logging context** using Node.js `AsyncLocalStorage`. Perfect for HTTP servers, background jobs, and any async workflow where you need context to follow the execution.

**Package:** `@crowlog/async-context-plugin`

::: warning Environment Requirements
Requires `async_hooks` support:
- **Node.js**: ✓ Works out of the box
- **Cloudflare Workers**: ✓ With [compatibility flags](https://developers.cloudflare.com/workers/runtime-apis/nodejs/asynclocalstorage)
- **Browsers**: ✗ Not supported
:::

## Installation

::: code-group

```bash [pnpm]
pnpm install @crowlog/async-context-plugin
```

```bash [npm]
npm install @crowlog/async-context-plugin
```

```bash [yarn]
yarn add @crowlog/async-context-plugin
```

:::

## Basic Usage

```typescript
import {
  addLogContext,
  createAsyncContextPlugin,
  wrapWithLoggerContext
} from '@crowlog/async-context-plugin';
import { createLogger } from '@crowlog/logger';

const logger = createLogger({
  namespace: 'my-app',
  plugins: [createAsyncContextPlugin()]
});

// Create a context scope
wrapWithLoggerContext({ requestId: 'req-123' }, () => {
  logger.info('Request started');
  // Output includes: { requestId: 'req-123' }

  addLogContext({ userId: 'user-456' });

  logger.info('User authenticated');
  // Output includes: { requestId: 'req-123', userId: 'user-456' }
});
```

## Express.js Example

```typescript
import { randomUUID } from 'node:crypto';
import express from 'express';

const app = express();

app.use((req, res, next) => {
  wrapWithLoggerContext({
    requestId: randomUUID(),
    path: req.path,
    method: req.method,
  }, () => {
    next();
  });
});

app.get('/api/users', (req, res) => {
  // All logs automatically include requestId
  logger.info('Fetching users'); // Includes { requestId, path: '/api/users', method: 'GET' } in context
  res.json({ users: [] });
});
```

## API

- `wrapWithLoggerContext(context, callback)` - Create context scope
- `addLogContext(context)` - Add to existing context
- `getLoggerContext()` - Get current context
- `clearLoggerContext()` - Clear current context
