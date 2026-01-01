# Child Loggers

Child loggers inherit configuration from their parent while allowing customization of namespace, transports, and plugins.

You can also use a logger factory to create loggers with shared configuration. See [Logger Factories](/guides/logger-factories) for more details.

## Creating Child Loggers

```typescript
import { createLogger } from '@crowlog/logger';

const parentLogger = createLogger({
  namespace: 'my-app',
  plugins: [createFilterPlugin({ minLevel: 'info' })],
  transports: [createStdoutLoggerTransport()]
});

// Child inherits parent's plugins and transports
const childLogger = parentLogger.createChildLogger({
  namespace: 'my-app:database'
});

parentLogger.info('Parent log');
// Output: { namespace: 'my-app', ... }

childLogger.info('Child log');
// Output: { namespace: 'my-app:database', ... }
```

## Overriding Configuration

Child loggers can override inherited configuration:

```typescript
const childLogger = parentLogger.createChildLogger({
  namespace: 'my-app:debug',
  // Override: use different transports
  transports: [createInMemoryLoggerTransport()],
  // Override: use different plugins
  plugins: [createFilterPlugin({ minLevel: 'debug' })]
});
```
