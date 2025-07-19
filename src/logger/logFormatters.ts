import { LogLevel, LoggingParameters } from './types';
import { LogContext } from './LogContext';

export interface LogObject {
    readonly level: LogLevel;
    readonly details: LogDetails;
    readonly message?: unknown;
    readonly transactionId?: string;
}

interface LogDetails {
    readonly tags?: ReadonlyArray<string>;
    readonly service?: string;
    readonly category?: string;
    readonly sourceRecords?: ReadonlyArray<string>;
    readonly stack?: string;
    readonly metadata?: Record<string, unknown>;
    readonly timestamp: string;
}

export const createLogObject = (level: LogLevel, parameters: LoggingParameters, context: LogContext): LogObject => {
    const { tags, category, service, transactionId, metadata } = context.data;
    const sourceRecords = context.getSourceRecordIdentifiers();
    const message = extractMessage(parameters);
    const stack = extractStack(parameters);
    const sourceRecordIds = sourceRecords.map((record) => `${record.sourceContext}:${record.sourceId}`);
    const details = createLogDetails(tags, category, service, sourceRecordIds, stack, metadata);

    return {
        level,
        details,
        ...(message !== undefined ? { message } : {}),
        ...(transactionId ? { transactionId } : {}),
    };
};

const createLogDetails = (
    tags: ReadonlySet<string>,
    category: string | undefined,
    service: string | undefined,
    sourceRecords: ReadonlyArray<string>,
    stack: string | undefined,
    metadata: ReadonlyMap<string, unknown>
): LogDetails => ({
    ...(tags.size > 0 ? { tags: [...tags] } : {}),
    ...(service ? { service } : {}),
    ...(category ? { category } : {}),
    ...(sourceRecords.length > 0 ? { sourceRecords: [...sourceRecords] } : {}),
    ...(stack ? { stack } : {}),
    ...(metadata.size > 0 ? { metadata: Object.fromEntries(metadata) } : {}),
    timestamp: new Date().toISOString(),
});

const extractMessage = (parameters: LoggingParameters): unknown => {
    if (parameters.length === 1) {
        const [value] = parameters;
        return value instanceof Error ? extractErrorMessage(value) : value;
    } else {
        const [message, error] = parameters;
        const errorMessage = error instanceof Error ? extractErrorMessage(error) : `${error}`;
        return `${message} ${errorMessage}`;
    }
};

const extractErrorMessage = (error: Error): string => {
    return error.message.trim() || `${error}`;
};

const extractStack = (parameters: LoggingParameters): string | undefined => {
    if (parameters.length === 1) {
        const [value] = parameters;
        return value instanceof Error && value.stack ? value.stack : undefined;
    } else {
        const [, error] = parameters;
        return error instanceof Error ? error.stack : undefined;
    }
};