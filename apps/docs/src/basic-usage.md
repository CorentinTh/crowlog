# Basic Usage

Learn the core concepts and common patterns for using Crowlog effectively.

## Creating a Logger

Every logger instance requires a **namespace** to identify where logs originate:

```typescript
import { createLogger } from '@crowlog/logger';

const logger = createLogger({ namespace: 'my-app' });
```

The namespace appears in every log entry, making it easy to filter and search logs:

```json
{
  "namespace": "my-app",
  "level": "info",
  "message": "Application started"
}
```

## Structured Logging

Structured logging makes your logs machine-readable and easy to query. Always prefer structured data over string interpolation:

::: code-group

```typescript [Good ✓]
logger.info(
  { userId: '123', action: 'login', duration: 1500 },
  'User authentication completed'
);
```

```typescript [Avoid ✗]
logger.info(`User 123 logged in, took 1500ms`);
```

:::

### Why Structured Logging?

Structured data enables:

- **Easy filtering**: Find all logs for a specific user
- **Aggregation**: Calculate average login duration
- **Alerting**: Trigger alerts when duration exceeds threshold
- **Analysis**: Query logs like a database

## Working with Errors

Errors are automatically serialized with their stack traces:

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error(
    { error, userId: currentUser.id },
    'Failed to process user data'
  );
}
```

Output includes the full error details:

```json
{
  "level": "error",
  "message": "Failed to process user data",
  "data": {
    "userId": "123",
    "error": {
      "name": "ValidationError",
      "message": "Invalid email format",
      "stack": "ValidationError: Invalid email format\n    at ..."
    }
  }
}
```

## Namespacing Strategy

Use namespaces to organize logs by module, service, or component:

```typescript
// API layer
const apiLogger = createLogger({ namespace: 'api' });

// Database layer
const dbLogger = createLogger({ namespace: 'database' });

// Authentication service
const authLogger = createLogger({ namespace: 'auth' });
```

This makes it easy to filter logs by component:

```bash
# Show only database logs
node app.js | grep '"namespace":"database"'
```

::: tip Hierarchical Namespaces
Consider using dot notation for hierarchical namespaces: `api.v1.users`, `database.migrations`, `auth.jwt.refresh`.
:::

## Best Practices

### Use Structured Data

```typescript
// Don't: hard to query
logger.info(`User ${userId} logged in`);

// Do: use structured data
logger.info({ userId: '123' }, 'User logged in');
```

### Don't Log Sensitive Information

Never log passwords, API keys, or other sensitive data:

```typescript
// Bad: Sensitive data exposed
logger.info({
  password: '123456',
  creditCard: '4111...'
}, 'User registered');
```

## Next Steps

- [**Transports**](/transports/) - Send logs to different destinations
- [**Plugins**](/plugins/) - Filter, redact, and transform logs
- [**Child Loggers**](/guides/child-loggers) - Create child loggers with inherited configuration
- [**Testing**](/guides/testing-with-crowlog) - Test your logging with in-memory transport
