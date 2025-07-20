# TypeScript Context Logger

A lightweight, context-aware logging library built with TypeScript that provides structured logging with async context management using Node.js's AsyncLocalStorage.

## Features

- 🚀 **Context-aware logging** - Automatically includes contextual information in log entries
- 📝 **Structured logging** - JSON output format for easy parsing and analysis
- 🔄 **Async context preservation** - Context persists across async operations
- 🏷️ **Flexible tagging** - Add tags for categorization and filtering
- 📊 **Metadata support** - Include custom key-value pairs in logs
- 🎯 **Session tracking** - Track requests/operations with session IDs
- 🛡️ **Type-safe** - Full TypeScript support with proper type definitions
- ⚡ **Zero dependencies** - Only uses Node.js built-in modules

## Installation

```bash
npm install logger-with-ts
```

Or if you're using this as a local development library:

```bash
git clone https://github.com/peterzzshi/logger-with-ts
cd logger-with-ts
npm install
npm run build
```

## Quick Start

### Basic Usage

```typescript
import { logger } from 'logger-with-ts';

// Simple logging
logger.info('Application started');
logger.warn('This is a warning');
logger.error('Something went wrong', new Error('Connection failed'));
logger.debug('Debug information');
```

### Context-Aware Logging

```typescript
import { logger, LogContext, withLogContext } from 'logger-with-ts';

// Create a context
const requestContext = LogContext.create({
  sessionId: 'req-123',
  category: 'api-request',
  tags: new Set(['user-service', 'authentication']),
  metadata: new Map([
    ['userId', '456'],
    ['endpoint', '/api/login']
  ])
});

// All logs within this context will include the context data
withLogContext(requestContext, () => {
  logger.info('Processing login request');
  logger.debug('Validating credentials');
  logger.info('Login successful');
});
```

## API Reference

### Logger Methods

The logger provides standard log levels:

```typescript
logger.debug(message: unknown): void
logger.info(message: unknown): void
logger.warn(message: unknown): void
logger.error(message: unknown): void

// With additional error context
logger.error(message: string, error: Error): void
```

### LogContext

#### Creating Contexts

```typescript
// Empty context
const context = LogContext.create();

// Context with initial data
const context = LogContext.create({
  sessionId: 'session-123',
  category: 'api',
  tags: new Set(['database', 'user']),
  metadata: new Map([['operation', 'CREATE']])
});
```

#### Context Methods

```typescript
// Immutable context modifications (returns new LogContext)
context.withSessionId(sessionId: string): LogContext
context.withCategory(category: string | undefined): LogContext
context.withTags(...tags: string[]): LogContext
context.withoutTags(...tags: string[]): LogContext
context.withMetadata(metadata: Record<string, string>): LogContext
context.withoutMetadata(...keys: string[]): LogContext
```

#### Using Contexts

```typescript
import { withLogContext, getLogContext } from 'logger-with-ts';

// Execute code within a context
withLogContext(context, () => {
  // All logging here includes context
  logger.info('This log includes context');
});

// Get current context
const currentContext = getLogContext();
```

## Context Data Types

### LogContextData Interface

```typescript
interface LogContextData {
  readonly tags: ReadonlySet<string>;           // Tags for categorization
  readonly category: string | undefined;        // General category
  readonly metadata: ReadonlyMap<string, string>; // Custom key-value pairs
  readonly sessionId: string | undefined;       // Session/request ID
}
```

## Log Output Format

All logs are output as JSON with the following structure:

```json
{
  "level": "info",
  "message": "User login successful",
  "sessionId": "req-123",
  "details": {
    "tags": ["authentication", "user-service"],
    "category": "api-request",
    "metadata": {
      "userId": "456",
      "endpoint": "/api/login",
      "method": "POST"
    },
    "timestamp": "2025-01-20T10:30:45.123Z"
  }
}
```

## Advanced Usage Examples

### Express.js Middleware

```typescript
import express from 'express';
import { logger, LogContext, withLogContext } from 'logger-with-ts';

const app = express();

// Logging middleware
app.use((req, res, next) => {
  const context = LogContext.create({
    sessionId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    category: 'http-request',
    tags: new Set(['express', 'api']),
    metadata: new Map([
      ['method', req.method],
      ['url', req.url],
      ['userAgent', req.get('User-Agent') || 'unknown']
    ])
  });

  withLogContext(context, () => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });
});

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Add user-specific context
  const currentContext = getLogContext();
  const userContext = currentContext.withMetadata({ userId });
  
  withLogContext(userContext, async () => {
    logger.info('Fetching user data');
    
    try {
      // Your business logic here
      logger.debug('Querying database');
      const user = await getUserById(userId);
      
      logger.info('User data retrieved successfully');
      res.json(user);
    } catch (error) {
      logger.error('Failed to fetch user', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});
```

### Database Operations

```typescript
async function executeQuery(sql: string, params: any[]) {
  const currentContext = getLogContext();
  const dbContext = currentContext
    .withTags('database')
    .withMetadata({ 
      operation: 'SELECT',
      table: 'users'
    });

  return withLogContext(dbContext, async () => {
    logger.debug('Executing database query');
    
    try {
      const result = await db.query(sql, params);
      logger.info(`Query executed successfully, ${result.rows.length} rows returned`);
      return result;
    } catch (error) {
      logger.error('Database query failed', error);
      throw error;
    }
  });
}
```

### Background Jobs

```typescript
async function processJob(jobId: string, jobData: any) {
  const jobContext = LogContext.create({
    sessionId: jobId,
    category: 'background-job',
    tags: new Set(['worker', 'async']),
    metadata: new Map([
      ['jobType', jobData.type],
      ['priority', jobData.priority.toString()]
    ])
  });

  return withLogContext(jobContext, async () => {
    logger.info('Starting job processing');
    
    try {
      // Process job steps
      logger.debug('Validating job data');
      await validateJobData(jobData);
      
      logger.debug('Processing job logic');
      await processJobLogic(jobData);
      
      logger.info('Job completed successfully');
    } catch (error) {
      logger.error('Job processing failed', error);
      throw error;
    }
  });
}
```

## Adding Custom Context Types

You can extend the logger by creating wrapper functions for domain-specific contexts:

```typescript
// Custom context creators
export function createApiContext(request: Request) {
  return LogContext.create({
    sessionId: request.headers['x-request-id'] as string,
    category: 'api',
    tags: new Set(['http', 'api']),
    metadata: new Map([
      ['method', request.method],
      ['path', request.path],
      ['ip', request.ip]
    ])
  });
}

export function createDbContext(operation: string, table: string) {
  return getLogContext()
    .withTags('database')
    .withMetadata({ operation, table });
}

// Usage
app.use((req, res, next) => {
  const apiContext = createApiContext(req);
  withLogContext(apiContext, () => next());
});

async function getUserById(id: string) {
  const dbContext = createDbContext('SELECT', 'users');
  return withLogContext(dbContext, async () => {
    logger.info(`Fetching user ${id}`);
    // ... database logic
  });
}
```

## Development

### Running the Demo

```bash
# Install dependencies
npm install

# Run demo with live reload
npm run dev

# Build and run
npm run demo

# Watch mode
npm run watch
```

### Building

```bash
npm run build
```

## TypeScript Support

This library is written in TypeScript and provides full type definitions. All context operations are type-safe, and the logger methods accept properly typed parameters.

```typescript
import type { Logger, LogContext, LogContextData } from 'logger-with-ts';

// Use types in your application
const customLogger: Logger = logger;
const context: LogContext = LogContext.create();
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request