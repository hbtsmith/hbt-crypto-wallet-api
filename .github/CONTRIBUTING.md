# Contributing to HBT Crypto Wallet API

Thank you for your interest in contributing to HBT Crypto Wallet API! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)
- [Documentation](#documentation)

## Code of Conduct

This project follows a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/hbt-crypto-wallet-api.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- Yarn >= 4.0.0
- Docker & Docker Compose
- PostgreSQL (if running locally)
- Redis (if running locally)

### Setup Steps

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Set up the database:
   ```bash
   yarn prisma:generate
   yarn prisma:migrate
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-endpoint`
- `fix/authentication-bug`
- `docs/update-readme`
- `refactor/improve-performance`

### Commit Messages

Follow conventional commit format:
- `feat: add new user registration endpoint`
- `fix: resolve authentication token issue`
- `docs: update API documentation`
- `test: add unit tests for auth service`
- `refactor: improve error handling`

### Code Structure

- Follow the existing project structure
- Place new features in appropriate directories
- Use TypeScript for all new code
- Follow the established patterns

## Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with UI
yarn test:ui

# Run specific test file
yarn test tests/auth.spec.ts
```

### Writing Tests

- Write tests for new features
- Ensure existing tests pass
- Aim for good test coverage
- Use descriptive test names
- Follow the existing test patterns

### Test Categories

- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints and database interactions
- **Service Tests**: Test business logic and external integrations

## Submitting Changes

### Pull Request Process

1. Ensure your branch is up to date with main
2. Run tests and ensure they pass
3. Update documentation if needed
4. Submit a pull request with a clear description
5. Respond to feedback and make necessary changes

### Pull Request Template

Use the provided pull request template and fill out all sections:
- Description of changes
- Type of change
- Testing performed
- Screenshots (if applicable)
- Checklist completion

## Code Style

### TypeScript

- Use strict TypeScript configuration
- Define proper types and interfaces
- Use meaningful variable and function names
- Follow the existing code style

### API Design

- Follow RESTful principles
- Use appropriate HTTP status codes
- Implement proper error handling
- Document new endpoints

### Database

- Use Prisma for database operations
- Follow the existing schema patterns
- Create migrations for schema changes
- Use proper indexing

## Documentation

### Code Documentation

- Add JSDoc comments for functions and classes
- Explain complex logic
- Update README.md for new features
- Update API documentation

### API Documentation

- Update Swagger documentation
- Provide examples for new endpoints
- Document request/response formats
- Include error responses

## Review Process

### For Contributors

- Be responsive to feedback
- Make requested changes promptly
- Ask questions if something is unclear
- Be patient with the review process

### For Maintainers

- Provide constructive feedback
- Be clear about required changes
- Approve changes that meet standards
- Help contributors improve their code

## Getting Help

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Contact maintainers for urgent issues
- Join our community channels

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to HBT Crypto Wallet API! 🚀
