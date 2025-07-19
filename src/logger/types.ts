export type SourceRecordIdentifier = Readonly<Record<"sourceContext" | "sourceId", string>>;

export interface LogContextData {
    readonly tags: ReadonlySet<string>;
    readonly category: string | undefined;
    readonly service: string | undefined;
    readonly sourceRecordIdsBySourceContext: ReadonlyMap<string, ReadonlySet<string>>;
    readonly transactionId: string | undefined;
    readonly metadata: ReadonlyMap<string, unknown>;
}

export const LOG_LEVELS = ["debug", "error", "info", "verbose", "warn"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];
export type LoggingParameters = readonly [unknown] | readonly [string, unknown];