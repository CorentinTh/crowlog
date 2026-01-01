# Global Context Plugin

Add application-wide context that appears in every log.

## Overview

The global log context plugin adds **shared data** to all logs across your application. Unlike the async context plugin which is request-scoped, global context persists until explicitly changed.

Perfect for:
- **Application metadata**: environment, version, region
- **Deployment info**: build number, deployment timestamp
- **Server info**: hostname, process ID
- **Static configuration**: service name, cluster ID

```typescript
import { createGlobalLogContextPlugin, createLogger } from '@crowlog/logger';

const {
  globalContextPlugin,
  setGlobalLogContext,
  addToGlobalLogContext,
  getGlobalLogContext
} = createGlobalLogContextPlugin();

const logger = createLogger({
  namespace: 'my-app',
  plugins: [globalContextPlugin]
});

// Set global context
setGlobalLogContext({
  environment: 'production',
  version: '1.0.0'
});

logger.info('Application started');
// Output includes: { environment: 'production', version: '1.0.0' }
```

## Basic Usage

### Setting Global Context

Replace the entire context:

```typescript
const { globalContextPlugin, setGlobalLogContext } = createGlobalLogContextPlugin();

setGlobalLogContext({
  environment: 'production',
  version: '2.0.0',
  region: 'us-east-1'
});
```

### Adding to Context

Merge new properties:

```typescript
setGlobalLogContext({ environment: 'production' });

addToGlobalLogContext({ version: '1.0.0' });
// Context: { environment: 'production', version: '1.0.0' }

addToGlobalLogContext({ region: 'us-west-2' });
// Context: { environment: 'production', version: '1.0.0', region: 'us-west-2' }
```

### Getting Context

Retrieve current context:

```typescript
const context = getGlobalLogContext();
console.log(context);
```

## TypeScript Support

Type the global context for safety:

```typescript
type AppContext = {
  environment: 'development' | 'staging' | 'production';
  version: string;
  region?: string;
};

const {
  globalContextPlugin,
  setGlobalLogContext
} = createGlobalLogContextPlugin<AppContext>();

// TypeScript enforces the type
setGlobalLogContext({
  environment: 'production',
  version: '1.0.0'
});
```
