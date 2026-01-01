# Filter Plugin

Control which logs are sent to transports based on level, namespace, or custom criteria.

## Overview

The filter plugin allows you to reduce noise by filtering out unwanted logs before they reach transports. This is especially useful for:

- **Production environments**: Filter debug logs
- **Performance**: Reduce log volume
- **Cost optimization**: Minimize logs sent to paid services
- **Security**: Exclude sensitive namespaces

```typescript
import { createFilterPlugin, createLogger } from '@crowlog/logger';

const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      minLevel: 'info' // Only log info and above
    })
  ]
});
```

## Filter by Log Level

### Minimum Level

Allow only logs at or above a certain severity:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({ minLevel: 'warn' })
  ]
});

logger.debug('Debug message'); // Filtered out
logger.info('Info message'); // Filtered out
logger.warn('Warning message'); // Logged ✓
logger.error('Error message'); // Logged ✓
```

**Level hierarchy**: `debug` < `info` < `warn` < `error`

### Maximum Level

Allow only logs at or below a certain severity:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({ maxLevel: 'info' })
  ]
});

logger.debug('Debug message'); // Logged ✓
logger.info('Info message'); // Logged ✓
logger.warn('Warning message'); // Filtered out
logger.error('Error message'); // Filtered out
```

### Level Range

Combine `minLevel` and `maxLevel` for a range:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      minLevel: 'info',
      maxLevel: 'warn'
    })
  ]
});

logger.debug('Debug'); // Filtered out
logger.info('Info'); // Logged ✓
logger.warn('Warning'); // Logged ✓
logger.error('Error'); // Filtered out
```

### Specific Levels Only

Use `onlyLevels` to allow specific levels:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      onlyLevels: ['warn', 'error'] // Only warnings and errors
    })
  ]
});

logger.debug('Debug'); // Filtered out
logger.info('Info'); // Filtered out
logger.warn('Warning'); // Logged ✓
logger.error('Error'); // Logged ✓
```

::: tip Priority
When `onlyLevels` is specified, `minLevel` and `maxLevel` are ignored.
:::

## Filter by Namespace

### Exclude Namespaces

Filter out specific namespaces:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      excludedNamespaces: ['debug-utils', 'test-helpers', 'dev-tools']
    })
  ]
});

// These loggers are filtered out
const debugLogger = logger.createChildLogger({ namespace: 'debug-utils' });
const testLogger = logger.createChildLogger({ namespace: 'test-helpers' });

debugLogger.info('This is filtered out');
testLogger.info('This is also filtered out');

// Regular logger still works
logger.info('This is logged'); // ✓
```

### Allow Specific Namespaces Only

Use `onlyNamespaces` to allow only certain namespaces:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      onlyNamespaces: ['api', 'database', 'auth']
    })
  ]
});

const apiLogger = logger.createChildLogger({ namespace: 'api' });
const cacheLogger = logger.createChildLogger({ namespace: 'cache' });

apiLogger.info('API request'); // Logged ✓
cacheLogger.info('Cache hit'); // Filtered out (not in allowed list)
```

::: warning Exact Match
Namespace filtering uses **exact string matching**. `'api'` does not match `'api:v1'`.

```typescript
excludedNamespaces: ['api']; // Only excludes exactly 'api'
```

For hierarchical filtering, use `customFilter`.
:::

## Custom Filtering

### Custom Filter Function

Implement complex filtering logic:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      customFilter: ({ context }) => {
        // Only log if error exists or explicitly marked important
        return context.data.error !== undefined || context.data.important === true;
      }
    })
  ]
});

logger.info('Regular message'); // Filtered out
logger.info({ important: true }, 'Critical update'); // Logged ✓
logger.error({ error: new Error('Failed') }, 'Error occurred'); // Logged ✓
```

The `customFilter` function receives:

```typescript
type FilterContext = {
  context: {
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    timestampMs: number;
    namespace: string;
    data: Record<string, unknown>;
  };
};
```

### Filter by Message Content

```typescript
createFilterPlugin({
  customFilter: ({ context }) => {
    // Exclude logs containing 'healthcheck'
    return !context.message.toLowerCase().includes('healthcheck');
  }
});
```

### Filter by Data Properties

```typescript
createFilterPlugin({
  customFilter: ({ context }) => {
    // Only log slow requests
    return context.data.duration && context.data.duration > 1000;
  }
});
```

## Combining Filters

When multiple filter options are provided, **ALL filters must pass** (AND logic):

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({
      minLevel: 'info', // Must be info or above
      excludedNamespaces: ['debug-utils'], // AND not from debug-utils
      customFilter: ({ context }) => { // AND pass custom logic
        return !context.message.includes('ignore');
      }
    })
  ]
});

// All conditions must be true for log to pass
```

## Performance Considerations

### Efficient Filtering

```typescript
// Avoid: Expensive operations in customFilter
createFilterPlugin({
  customFilter: ({ context }) => {
    // Bad: Regex on every log
    const result = /complex-pattern/i.test(context.message);

    // Bad: expensive check
    const allowed = expensiveCheck(context.namespace);

    return result && allowed;
  }
});
```

### Pre-compute Where Possible

```typescript
// Good: Pre-compute expensive operations
const excludedPaths = new Set(['/health', '/metrics', '/ready']);

createFilterPlugin({
  customFilter: ({ context }) => {
    return !excludedPaths.has(context.data.path);
  }
});
```
