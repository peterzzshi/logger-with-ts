import {logger} from "../logger";
import {getLogContext, LogContext, withLogContext} from "../context";

const mockWrite = jest.fn();
const originalWrite = process.stdout.write;

beforeEach(() => {
    mockWrite.mockClear();
    process.stdout.write = mockWrite;
});

afterAll(() => {
    process.stdout.write = originalWrite;
});

describe('Logger', () => {
    it('should log basic messages', () => {
        logger.info('test message');

        expect(mockWrite).toHaveBeenCalledTimes(1);
        const logOutput = JSON.parse(mockWrite.mock.calls[0][0]);

        expect(logOutput.level).toBe('info');
        expect(logOutput.message).toBe('test message');
        expect(logOutput.details.timestamp).toBeDefined();
    });

    it('should log debug messages', () => {
        logger.debug('debug message');

        expect(mockWrite).toHaveBeenCalledTimes(1);
        const logOutput = JSON.parse(mockWrite.mock.calls[0][0]);

        expect(logOutput.level).toBe('debug');
        expect(logOutput.message).toBe('debug message');
    });

    it('should log warning messages', () => {
        logger.warn('warning message');

        expect(mockWrite).toHaveBeenCalledTimes(1);
        const logOutput = JSON.parse(mockWrite.mock.calls[0][0]);

        expect(logOutput.level).toBe('warn');
        expect(logOutput.message).toBe('warning message');
    });

    it('should log errors with stack traces', () => {
        const error = new Error('test error');
        logger.error('Error occurred', error);

        const logOutput = JSON.parse(mockWrite.mock.calls[0][0]);

        expect(logOutput.level).toBe('error');
        expect(logOutput.message).toContain('Error occurred');
        expect(logOutput.details.stack).toBeDefined();
    });

    it('should include context in logs', () => {
        const context = LogContext.create({
            sessionId: 'test-session',
            category: 'test',
            tags: new Set(['test-tag']),
            metadata: new Map([['key', 'value']]),
        });

        withLogContext(context, () => {
            logger.info('contextual message');
        });

        const logOutput = JSON.parse(mockWrite.mock.calls[0][0]);

        expect(logOutput.sessionId).toBe('test-session');
        expect(logOutput.details.category).toBe('test');
        expect(logOutput.details.tags).toEqual(['test-tag']);
        expect(logOutput.details.metadata).toEqual({ key: 'value' });
    });
});

describe('LogContext', () => {
    it('should create empty context', () => {
        const context = LogContext.create();

        expect(context.data.tags.size).toBe(0);
        expect(context.data.category).toBeUndefined();
        expect(context.data.sessionId).toBeUndefined();
        expect(context.data.metadata.size).toBe(0);
    });

    it('should create context with initial data', () => {
        const context = LogContext.create({
            sessionId: 'test',
            tags: new Set(['tag1', 'tag2']),
        });

        expect(context.data.sessionId).toBe('test');
        expect(context.data.tags).toEqual(new Set(['tag1', 'tag2']));
    });

    it('should clone and modify context immutably', () => {
        const original = LogContext.create({ sessionId: 'original' });
        const modified = original.withSessionId('modified');

        expect(original.data.sessionId).toBe('original');
        expect(modified.data.sessionId).toBe('modified');
    });

    it('should modify category', () => {
        const context = LogContext.create();
        const withCategory = context.withCategory('test-category');

        expect(context.data.category).toBeUndefined();
        expect(withCategory.data.category).toBe('test-category');
    });

    it('should add tags immutably', () => {
        const context = LogContext.create();
        const withTags = context.withTags('tag1', 'tag2');

        expect(context.data.tags.size).toBe(0);
        expect(withTags.data.tags).toEqual(new Set(['tag1', 'tag2']));
    });

    it('should remove tags immutably', () => {
        const context = LogContext.create({ tags: new Set(['tag1', 'tag2', 'tag3']) });
        const withoutTags = context.withoutTags('tag1', 'tag3');

        expect(context.data.tags).toEqual(new Set(['tag1', 'tag2', 'tag3']));
        expect(withoutTags.data.tags).toEqual(new Set(['tag2']));
    });

    it('should add metadata immutably', () => {
        const context = LogContext.create();
        const withMetadata = context.withMetadata({ key1: 'value1', key2: 'value2' });

        expect(context.data.metadata.size).toBe(0);
        expect(withMetadata.data.metadata.get('key1')).toBe('value1');
        expect(withMetadata.data.metadata.get('key2')).toBe('value2');
    });

    it('should remove metadata immutably', () => {
        const context = LogContext.create();
        const withMetadata = context.withMetadata({ key1: 'value1', key2: 'value2', key3: 'value3' });
        const withoutMetadata = withMetadata.withoutMetadata('key1', 'key3');

        expect(withMetadata.data.metadata.size).toBe(3);
        expect(withoutMetadata.data.metadata.size).toBe(1);
        expect(withoutMetadata.data.metadata.get('key2')).toBe('value2');
        expect(withoutMetadata.data.metadata.has('key1')).toBe(false);
        expect(withoutMetadata.data.metadata.has('key3')).toBe(false);
    });
});

describe('Context Management', () => {
    it('should return empty context when none is set', () => {
        const context = getLogContext();
        expect(context.data.tags.size).toBe(0);
    });

    it('should preserve context across async operations', async () => {
        const context = LogContext.create({ sessionId: 'async-test' });

        await withLogContext(context, async () => {
            await new Promise(resolve => setTimeout(resolve, 10));

            const currentContext = getLogContext();
            expect(currentContext.data.sessionId).toBe('async-test');
        });
    });
});