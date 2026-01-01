# Crowlog Documentation

Official documentation for Crowlog, built with [VitePress](https://vitepress.dev/).

## Design Credits

- **Design Inspiration**: [Fumadocs](https://fumadocs.dev/docs) - A beautiful documentation framework
- **Logo Icon**: [Raven Rounded](https://icones.js.org/collection/all?icon=material-symbols:raven-rounded) from Material Symbols by Google

## Development

Start the development server:

```bash
pnpm run dev
```

This will start a local server at `http://localhost:5173` with hot-reload.

## Building

Build the documentation for production:

```bash
pnpm run build
```

Preview the production build:

```bash
pnpm run preview
```

## Documentation Structure

```
src/
├── index.md              # Home page
├── guide/
│   ├── getting-started.md    # Installation & setup
│   ├── basic-usage.md        # Core concepts
│   ├── transports.md         # Transport documentation
│   ├── plugins.md            # Plugin documentation
│   └── advanced.md           # Advanced patterns
├── api/
│   └── index.md              # API reference
└── comparison.md             # Library comparison
```

## Writing Documentation

### VitePress Features

The documentation uses VitePress markdown extensions:

- **Custom containers**: `::: tip`, `::: warning`, `::: danger`, `::: details`
- **Code groups**: Multiple code examples in tabs
- **Line highlighting**: Highlight specific lines in code blocks
- **GitHub-flavored alerts**: `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`

See the [VitePress markdown guide](https://vitepress.dev/guide/markdown) for more features.

### Best Practices

1. **Use structured examples**: Show both good and bad patterns
2. **Include type signatures**: Help TypeScript users
3. **Add links**: Cross-reference related sections
4. **Keep it simple**: Explain concepts clearly
5. **Use code groups**: Show multiple package managers/approaches

## Deployment

The documentation is automatically deployed when changes are pushed to the main branch.
