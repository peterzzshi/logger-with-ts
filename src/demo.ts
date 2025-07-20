import {logger} from "./logger/logger";
import {LogContext, withLogContext} from "./logger/context";

// Basic usage
console.log('=== Basic Logging ===');
logger.info('Application started');
logger.warn('This is a warning message');
logger.error('Something went wrong', new Error('Database connection failed'));

// Using context
console.log('\n=== Context Logging ===');
const requestContext = LogContext.create({
    sessionId: 'req-123',
    tags: new Set(['api', 'user-service']),
    category: 'http-request',
    metadata: new Map([
        ['userId', '456'],
        ['endpoint', '/api/users']
    ])
});

withLogContext(requestContext, () => {
    logger.info('Processing user request');

    // Nested context with additional tags
    const enrichedContext = requestContext
        .withTags('database')
        .withMetadata({ operation: 'SELECT' });

    withLogContext(enrichedContext, () => {
        logger.debug('Executing database query');
    });

    logger.info('Request completed successfully');
});

// Simulating an API request handler
async function handleUserRequest(userId: string): Promise<{ id: string; name: string }> {
    const context = LogContext.create()
        .withSessionId(`req-${Date.now()}`)
        .withCategory('api')
        .withTags('user-service', 'database')
        .withMetadata({
            userId,
            endpoint: '/api/user',
            method: 'GET'
        });

    return withLogContext(context, async () => {
        logger.info(`Fetching user data for user ${userId}`);

        try {
            logger.debug('Validating user permissions');

            // Simulate some work
            await new Promise(resolve => setTimeout(resolve, 100));

            logger.info('User data retrieved successfully');
            return { id: userId, name: 'John Doe' };
        } catch (error) {
            logger.error('Failed to fetch user data', error);
            throw error;
        }
    });
}

// Usage
console.log('\n=== API Request Simulation ===');
handleUserRequest('123').catch(console.error);
