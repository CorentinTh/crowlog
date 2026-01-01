# Custom Plugins

Create custom plugins to transform or filter logs.

## Overview

Plugins extend logger functionality by hooking into the logging pipeline. A plugin can:

- **Filter logs**: Prevent certain logs from reaching transports
- **Transform data**: Add, remove, or modify log fields
- **Enrich logs**: Inject metadata or context

```typescript
type LoggerPlugin = {
  name: string;
  transformLogContext?: (args: { context: LoggerTransportLogArgs }) => { context: LoggerTransportLogArgs };
  shouldLog?: (args: { context: LoggerTransportLogArgs }) => boolean;
};
```

## Plugin Hooks

A plugin can implement one or both of the following hooks: `shouldLog` and `transformLogContext`.

### `shouldLog`

Optional function to filter logs. Return `false` to drop the log, and it won't reach transports.

```typescript
import type { LoggerPlugin } from '@crowlog/logger';

const myFilterPlugin: LoggerPlugin = {
  name: 'drop-healthcheck-logs',
  shouldLog: ({ context }) => {
    // Example: Drop healthcheck logs (message contains 'health')
    return !context.message.includes('health');
  }
};
```

### `transformLogContext`

Optional function to modify log context before it reaches transports, such as adding fields or redacting data.

```typescript
import type { LoggerPlugin } from '@crowlog/logger';
import os from 'node:os';

const myEnrichPlugin: LoggerPlugin = {
  name: 'add-process-info',
  transformLogContext: ({ context }) => ({
    ...context,
    data: {
      ...context.data,
      // Example: add process info
      hostname: os.hostname(),
      pid: process.pid
    }
  })
};
```

## Best Practices

### Return New Objects

```typescript
// Good: Immutable
const plugin = {
  name: 'immutable-example',
  transformLogContext: ({ context }) => {
    return {
      ...context,
      data: {
        ...context.data,
        foo: 'bar'
      }
    };
  }
};

// Bad: Mutates
const plugin = {
  name: 'mutate-example',
  transformLogContext: ({ context }) => {
    context.data.foo = 'bar';
    return context;
  }
};
```

### Handle Errors

```typescript
transformLogContext: ({ context }) => {
  try {
    // Your logic
    const enrichedData = someMaybeRiskyOperation(context);

    return { ...context, data: { ...context.data, ...enrichedData } };
  } catch (error) {
    console.error('Plugin error:', error);
    return context; // Return unchanged
  }
};
```

## See Also

- [Filter Plugin](/plugins/filter) - Built-in filtering
- [Redact Plugin](/plugins/redact) - Built-in redaction
- [Custom Transports](/transports/custom) - Create custom transports
