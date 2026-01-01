---
layout: home

hero:
  name: Crowlog
  text: The extendable JS logging library
  tagline: Simple, lightweight, zero-dependency, and extendable logging for any JavaScript environment
  image:
    light: /logo-dark.svg
    dark: /logo-light.svg
    alt: Crowlog Logo
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/CorentinTh/crowlog

features:
  - icon: ⚡
    title: Ultra Lightweight
    details: Less than 1kB minified + gzipped. Every byte counts for your bundle size.

  - icon: 📦
    title: Zero Dependencies
    details: No runtime dependencies, just pure JavaScript. Install with confidence.

  - icon: 🔌
    title: Extendable
    details: Built-in plugin system and custom transports. Adapt to your needs.

  - icon: 🎯
    title: Simple API
    details: Intuitive interface with just the features you need. No bloat.

  - icon: 📘
    title: Fully Typed
    details: Complete TypeScript support with autocomplete and type safety.

  - icon: 🌍
    title: Universal
    details: Works in Node.js, browsers, edge runtimes, and everywhere JavaScript runs.

  - icon: 🧪
    title: Testing Friendly
    details: In-memory transport and noop logger for easy testing.

  - icon: 🎨
    title: Pretty Logs
    details: Beautiful colored output for development with crowlog-pretty CLI.
---

## Quick Start

::: code-group

```bash [pnpm]
pnpm install @crowlog/logger
```

```bash [npm]
npm install @crowlog/logger
```

```bash [yarn]
yarn add @crowlog/logger
```

:::

```typescript
import { createLogger } from '@crowlog/logger';

const logger = createLogger({ namespace: 'my-app' });

logger.info('Hello world');
logger.error({ error: new Error('Oops') }, 'Something went wrong');
```

## Why Crowlog?

Crowlog is designed for developers who need a **simple, reliable logging solution** without the overhead of complex libraries. Whether you're building a small script or a large application, Crowlog scales with you.

### Comparison with Other Libraries

| Library | Runtime Dependencies | Bundled Size (minified + gzipped) |
|---------|---------------------|-----------------------------------|
| **@crowlog/logger** | **0** | **674B** |
| pino | 11 | 2.9kB |
| winston | 11 | 37.4kB |
| bunyan | 19 | 5.6kB |

## Philosophy

Crowlog follows a few core principles:

- **Simplicity First**: Easy to understand, easy to use
- **Extensibility**: Powerful plugin system for advanced use cases
- **Performance**: Minimal overhead, maximum efficiency
- **Developer Experience**: Great TypeScript support and testing utilities

## What's Next?

<div class="vp-doc">

- [Get Started](/getting-started) - Install and set up Crowlog
- [Basic Usage](/basic-usage) - Learn the core concepts
- [Transports](/transports/) - Understand where logs go
- [Plugins](/plugins/) - Extend functionality with plugins

</div>
