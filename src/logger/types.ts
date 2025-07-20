export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
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

export interface Logger {
    debug(...parameters: LoggingParameters): void;
    info(...parameters: LoggingParameters): void;
    warn(...parameters: LoggingParameters): void;
    error(...parameters: LoggingParameters): void;
}
