import { AsyncLocalStorage } from "async_hooks";

//----------------------------------------------------------------------------------------------------------------------
// Type definitions
//----------------------------------------------------------------------------------------------------------------------

export const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export type LoggingParameters = readonly [unknown] | readonly [string, unknown];

export interface LogContextData {
  readonly tags: ReadonlySet<string>;
  readonly category: string | undefined;
  readonly metadata: ReadonlyMap<string, string>;
  readonly sessionId: string | undefined;
}

export interface LogOutput {
  readonly level: LogLevel;
  readonly message?: unknown;
  readonly sessionId?: string;
  readonly details: {
    readonly tags?: string[];
    readonly category?: string;
    readonly metadata?: Record<string, string>;
    readonly stack?: string;
    readonly timestamp: string;
  };
}

//----------------------------------------------------------------------------------------------------------------------
// Log Context Management
//----------------------------------------------------------------------------------------------------------------------

export class LogContext {
  protected constructor(public readonly data: LogContextData) {}

  static create(data: Partial<LogContextData> = {}): LogContext {
    return new LogContext({
      tags: data.tags ?? new Set(),
      category: data.category,
      metadata: data.metadata ?? new Map(),
      sessionId: data.sessionId,
    });
  }

  withCategory(category: string | undefined): LogContext {
    return new LogContext({ ...this.data, category });
  }

  withSessionId(sessionId: string): LogContext {
    return new LogContext({ ...this.data, sessionId });
  }

  withTags(...tags: string[]): LogContext {
    const newTags = new Set([...this.data.tags, ...tags]);
    return new LogContext({ ...this.data, tags: newTags });
  }

  withoutTags(...tags: string[]): LogContext {
    const newTags = new Set(this.data.tags);
    tags.forEach(tag => newTags.delete(tag));
    return new LogContext({ ...this.data, tags: newTags });
  }

  withMetadata(metadata: Record<string, string>): LogContext {
    const newMetadata = new Map([...this.data.metadata, ...Object.entries(metadata)]);
    return new LogContext({ ...this.data, metadata: newMetadata });
  }

  withoutMetadata(...keys: string[]): LogContext {
    const newMetadata = new Map(this.data.metadata);
    keys.forEach(key => newMetadata.delete(key));
    return new LogContext({ ...this.data, metadata: newMetadata });
  }
}

const EMPTY_CONTEXT = LogContext.create();

//----------------------------------------------------------------------------------------------------------------------
// Async Local Storage
//----------------------------------------------------------------------------------------------------------------------

const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

export const getLogContext = (): LogContext =>
    asyncLocalStorage.getStore() ?? EMPTY_CONTEXT;

export const withLogContext = <T>(logContext: LogContext, callback: () => T): T =>
    asyncLocalStorage.run(logContext, callback);

//----------------------------------------------------------------------------------------------------------------------
// Log Object Assembly
//----------------------------------------------------------------------------------------------------------------------

const createLogObject = (level: LogLevel, parameters: LoggingParameters): LogOutput => {
  const context = getLogContext();
  const { tags, category, metadata, sessionId } = context.data;

  const message = extractMessage(parameters);
  const stack = extractStack(parameters);

  return {
    level,
    ...(message !== undefined ? { message } : {}),
    ...(sessionId ? { sessionId } : {}),
    details: {
      ...(tags.size > 0 ? { tags: [...tags] } : {}),
      ...(category ? { category } : {}),
      ...(metadata.size > 0 ? { metadata: Object.fromEntries(metadata) } : {}),
      ...(stack ? { stack } : {}),
      timestamp: new Date().toISOString(),
    },
  };
};

const extractMessage = (parameters: LoggingParameters): unknown => {
  if (parameters.length === 1) {
    const [value] = parameters;
    return value instanceof Error ? (value.message.trim() || value.toString()) : value;
  } else {
    const [message, error] = parameters;
    const errorMessage = error instanceof Error
        ? (error.message.trim() || error.toString())
        : String(error);
    return `${message} ${errorMessage}`;
  }
};

const extractStack = (parameters: LoggingParameters): string | undefined => {
  if (parameters.length === 1) {
    const [value] = parameters;
    return value instanceof Error ? value.stack : undefined;
  } else {
    const [, error] = parameters;
    return error instanceof Error ? error.stack : undefined;
  }
};

//----------------------------------------------------------------------------------------------------------------------
// Logger API
//----------------------------------------------------------------------------------------------------------------------

export interface Logger {
  debug(...parameters: LoggingParameters): void;
  info(...parameters: LoggingParameters): void;
  warn(...parameters: LoggingParameters): void;
  error(...parameters: LoggingParameters): void;
}

const log = (level: LogLevel, parameters: LoggingParameters): void => {
  const logObject = createLogObject(level, parameters);
  process.stdout.write(`${JSON.stringify(logObject)}\n`);
};

export const logger: Logger = {
  debug: (...parameters: LoggingParameters) => log("debug", parameters),
  info: (...parameters: LoggingParameters) => log("info", parameters),
  warn: (...parameters: LoggingParameters) => log("warn", parameters),
  error: (...parameters: LoggingParameters) => log("error", parameters),
} as const;