# Redact Plugin

Automatically hide sensitive data from logs. You can specify which fields to redact using dot notation, including support for arrays and wildcards.

## Overview

The redact plugin prevents sensitive information from appearing in logs by replacing specified values with a redacted placeholder. This is essential for:

- **Security**: Prevent password leaks
- **Compliance**: GDPR, PCI-DSS, HIPAA requirements
- **Privacy**: Protect user data
- **Best practices**: Defense in depth

```typescript
import { createLogger, createRedactPlugin } from '@crowlog/logger';

const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: ['password', 'apiKey', 'creditCard']
    })
  ]
});

logger.info({
  username: 'alice',
  password: 'secret123',
  apiKey: 'sk_live_abc'
}, 'User login');

// Output:
// {
//   username: 'alice',
//   password: '[redacted]',
//   apiKey: '[redacted]'
// }
```

::: warning Deep Clone
The redact plugin creates a deep copy of log data before redacting, so original objects are never modified. This has a small performance cost.
:::

## Basic Usage

### Simple Paths

Redact top-level properties:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: ['password', 'token', 'secret']
    })
  ]
});

logger.info({
  username: 'alice',
  password: 'secret123',
  token: 'jwt_token_here'
}, 'Credentials');

// Output:
// {
//   username: 'alice',
//   password: '[redacted]',
//   token: '[redacted]'
// }
```

### Nested Paths

Use dot notation for nested properties:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: ['user.password', 'auth.token', 'config.database.password']
    })
  ]
});

logger.info({
  user: {
    email: 'user@example.com',
    password: 'secret123'
  },
  auth: {
    token: 'jwt_token'
  }
}, 'Login attempt');

// Output:
// {
//   user: {
//     email: 'user@example.com',
//     password: '[redacted]'
//   },
//   auth: {
//     token: '[redacted]'
//   }
// }
```

## Array Handling

### Wildcard (`*`) - All Array Items

Redact a field in all array items:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: ['users.*.password', 'users.*.email']
    })
  ]
});

logger.info({
  users: [
    { name: 'Alice', password: 'pass1', email: 'alice@example.com' },
    { name: 'Bob', password: 'pass2', email: 'bob@example.com' }
  ]
}, 'User list');

// Output:
// {
//   users: [
//     { name: 'Alice', password: '[redacted]', email: '[redacted]' },
//     { name: 'Bob', password: '[redacted]', email: '[redacted]' }
//   ]
// }
```

### Specific Index

Redact specific array indices:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: ['users.0.email'] // Only first user's email
    })
  ]
});

logger.info({
  users: [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' }
  ]
}, 'Users');

// Output:
// {
//   users: [
//     { name: 'Alice', email: '[redacted]' },
//     { name: 'Bob', email: 'bob@example.com' } // Not redacted
//   ]
// }
```

### Redact All Array Values

Redact entire arrays:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: ['tokens.*'] // Redact all token values
    })
  ]
});

logger.info({
  tokens: ['token1', 'token2', 'token3']
}, 'Tokens');

// Output:
// {
//   tokens: ['[redacted]', '[redacted]', '[redacted]']
// }
```

### Nested Arrays

Handle deeply nested arrays:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: ['teams.*.members.*.apiKey']
    })
  ]
});

logger.info({
  teams: [
    {
      name: 'Team A',
      members: [
        { name: 'Alice', apiKey: 'key1' },
        { name: 'Bob', apiKey: 'key2' }
      ]
    }
  ]
}, 'Teams');

// Output: All apiKey fields are redacted
```

## Custom Redacted Value

By default, redacted fields are replaced with `[redacted]`. You can customize this:

```typescript
const logger = createLogger({
  namespace: 'my-app',
  plugins: [
    createRedactPlugin({
      paths: ['password'],
      redactedValue: '***HIDDEN***'
    })
  ]
});

logger.info({ password: 'secret' }, 'Login');

// Output:
// {
//   password: '***HIDDEN***'
// }
```
