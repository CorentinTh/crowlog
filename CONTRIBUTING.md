# Contributing to Crowlog

Thank you for your interest in contributing to Crowlog! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- pnpm (version specified in `package.json`)

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/CorentinTh/crowlog.git
   cd crowlog
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a new branch for your changes:
   ```bash
   git checkout -b your-feature-name
   ```

### Project Structure

This is a monorepo containing multiple packages:
- `packages/logger` - Core logging library
- `packages/async-context-plugin` - Async context plugin
- `packages/pretty` - Pretty log formatter

### Running Tests

Tests are required for all changes. Run tests with:

```bash
pnpm test        # Run all tests
pnpm test:watch  # Run tests in watch mode
```

Make sure all tests pass before submitting your PR.

## How to Contribute

### Reporting Bugs

- Use GitHub Issues to report bugs
- Include a clear description of the issue
- Provide steps to reproduce the problem
- Include relevant code samples or error messages
- Mention your environment (Node.js version, OS, etc.)

### Suggesting Features

- Open a GitHub Issue to discuss new features before implementing them
- Explain the use case and why it would be valuable
- Be open to feedback and discussion

### Submitting Changes

1. Make your changes in your feature branch
2. Write or update tests for your changes
3. Ensure all tests pass (`pnpm test`)
4. Follow the existing code style (enforced by ESLint)
5. Write clear, concise commit messages
6. Push your changes to your fork
7. Open a Pull Request against the `main` branch

### Pull Request Guidelines

- **Tests Required**: All code changes must include appropriate tests
- **One Feature Per PR**: Keep PRs focused on a single feature or fix
- **Clear Description**: Explain what changes you made and why
- **Link Issues**: Reference any related issues in your PR description
- **Code Quality**: Contributors must understand and take responsibility for any code they submit, including AI-assisted code

**Note**: Changesets will be added by maintainers when merging PRs.

## Code Style

- Follow the existing code style in the project
- ESLint is configured and will help enforce code style
- Keep code simple and readable
- Add comments for complex logic when necessary

## AI-Generated Code Policy

While AI tools can be helpful, **contributors must fully understand and take responsibility for any code they submit**. This means:

- Don't submit AI-generated code that you don't understand
- Review and test all AI-assisted code thoroughly
- Be prepared to explain and maintain the code you contribute
- Ensure AI-generated code follows the project's patterns and conventions

We value quality contributions over quantity. Taking the time to understand the codebase and write thoughtful code is appreciated.

## Questions?

If you have questions about contributing, feel free to:
- Open a GitHub Issue for discussion
- Ask in your Pull Request
- Reach out to the maintainers

## License

By contributing to Crowlog, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

Thank you for contributing to Crowlog!
