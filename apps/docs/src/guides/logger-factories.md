# Logger Factories

Logger factories create multiple loggers with shared configuration.

## Creating a Factory

```typescript
import { createLoggerFactory } from '@crowlog/logger';

// Create factory with shared config
const createLogger = createLoggerFactory({
  transports: [createStdoutLoggerTransport()],
  plugins: [
    createFilterPlugin({ minLevel: 'info' }),
    createRedactPlugin({ paths: ['password', 'apiKey'] })
  ]
});

// Create loggers with different namespaces
const apiLogger = createLogger({ namespace: 'api' });
const dbLogger = createLogger({ namespace: 'database' });
const authLogger = createLogger({ namespace: 'auth' });

// All loggers share the same transports and plugins
```

### Factory Benefits

- **Consistency**: All loggers use the same configuration
- **DRY**: Define transports and plugins once
- **Easy updates**: Change factory config to affect all loggers

### Per-Logger Overrides

Individual loggers can still override factory defaults:

```typescript
const createLogger = createLoggerFactory({
  plugins: [createFilterPlugin({ minLevel: 'info' })]
});

// Most loggers use factory defaults
const apiLogger = createLogger({ namespace: 'api' });

// Debug logger overrides to allow all levels
const debugLogger = createLogger({
  namespace: 'debug',
  plugins: [createFilterPlugin({ minLevel: 'debug' })]
});
```
