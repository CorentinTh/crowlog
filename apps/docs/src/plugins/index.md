# Plugins

Plugins extend logger functionality by transforming or filtering logs **before they reach transports**.

## Overview

Plugins hook into the logging pipeline to:

- **Filter logs** based on level, namespace, or custom criteria
- **Transform log data** by adding, removing, or modifying fields
- **Redact sensitive information** like passwords or API keys
- **Add context** from global state or async local storage

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({ minLevel: 'info' }),
    createRedactPlugin({ paths: ['password'] }),
    createGlobalLogContextPlugin()
  ]
});
```

## Plugin Pipeline

Plugins execute in two phases:

```
Log Call
   ↓
plugins shouldLog (filtering)
   ↓
plugins transformLogContext (transformation)
   ↓
Transports
```

If any `shouldLog` plugin returns `false`, the log is dropped and never reaches transports.

## Built-in Plugins

Crowlog provides four built-in plugins:

- [**Filter Plugin**](/plugins/filter) - Filter logs by level, namespace, or custom logic
- [**Redact Plugin**](/plugins/redact) - Automatically redact sensitive fields
- [**Global Log Context Plugin**](/plugins/global-context) - Add application-wide context
- [**Async Context Plugin**](/plugins/async-context) - Add async request-scoped context

## Order Matters
Plugins execute in the order they're defined:

```typescript
createLogger({
  namespace: 'my-app',
  plugins: [
    createFilterPlugin({ minLevel: 'info' }), // Runs first
    createRedactPlugin({ paths: ['password'] }) // Runs second
  ]
});
```

## Next Steps

- [**Child Loggers**](/guides/child-loggers) - Create child loggers with inherited configuration
- [**Testing**](/guides/testing-with-crowlog) - Test your logging with in-memory transport
- [**Custom Plugins**](/plugins/custom) - Create your own plugins
