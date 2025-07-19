import { LogContextData, SourceRecordIdentifier } from './types';

export class LogContext {
    protected constructor(public readonly data: LogContextData) {}

    public cloneAndOverwriteService(service: string): LogContext {
        return new LogContext({ ...this.data, service });
    }

    public cloneAndOverwriteCategory(category: string | undefined): LogContext {
        return new LogContext({ ...this.data, category });
    }

    public cloneAndOverwriteTransactionId(transactionId: string): LogContext {
        return new LogContext({ ...this.data, transactionId });
    }

    public cloneAndAppendTags(tags: ReadonlyArray<string>): LogContext {
        const newTags = new Set([...this.data.tags, ...tags]);
        return new LogContext({ ...this.data, tags: newTags });
    }

    public cloneAndRemoveTags(tags?: ReadonlyArray<string>): LogContext {
        if (tags) {
            const newTags = new Set(this.data.tags);
            tags.forEach((tag) => newTags.delete(tag));
            return new LogContext({ ...this.data, tags: newTags });
        }
        return new LogContext({ ...this.data, tags: new Set() });
    }

    public cloneAndSetMetadata(key: string, value: unknown): LogContext {
        const metadata = new Map(this.data.metadata);
        metadata.set(key, value);
        return new LogContext({ ...this.data, metadata });
    }

    public cloneAndRemoveMetadata(key: string): LogContext {
        const metadata = new Map(this.data.metadata);
        metadata.delete(key);
        return new LogContext({ ...this.data, metadata });
    }

    public cloneAndAppendSourceRecords(sourceRecords: ReadonlyArray<SourceRecordIdentifier>): LogContext {
        const sourceRecordIdsBySourceContext = LogContext.deepCloneSourceRecords(this.data.sourceRecordIdsBySourceContext);
        for (const { sourceContext, sourceId } of sourceRecords) {
            const sourceRecordIds = sourceRecordIdsBySourceContext.get(sourceContext) ?? new Set<string>();
            sourceRecordIds.add(sourceId);
            sourceRecordIdsBySourceContext.set(sourceContext, sourceRecordIds);
        }
        return new LogContext({ ...this.data, sourceRecordIdsBySourceContext });
    }

    public cloneAndRemoveSourceRecords(sourceRecords?: ReadonlyArray<SourceRecordIdentifier>): LogContext {
        if (sourceRecords) {
            const sourceRecordIdsBySourceContext = LogContext.deepCloneSourceRecords(this.data.sourceRecordIdsBySourceContext);
            for (const { sourceContext, sourceId } of sourceRecords) {
                sourceRecordIdsBySourceContext.get(sourceContext)?.delete(sourceId);
                if (0 === sourceRecordIdsBySourceContext.get(sourceContext)?.size) {
                    sourceRecordIdsBySourceContext.delete(sourceContext);
                }
            }
            return new LogContext({ ...this.data, sourceRecordIdsBySourceContext });
        }
        return new LogContext({ ...this.data, sourceRecordIdsBySourceContext: new Map() });
    }

    public getSourceRecordIdentifiers(): ReadonlyArray<SourceRecordIdentifier> {
        return [...this.data.sourceRecordIdsBySourceContext].flatMap(([sourceContext, sourceIds]) =>
            [...sourceIds].map((sourceId) => ({ sourceContext, sourceId }))
        );
    }

    private static deepCloneSourceRecords(map: LogContextData["sourceRecordIdsBySourceContext"]): Map<string, Set<string>> {
        const result = new Map<string, Set<string>>();
        map.forEach((value, key) => result.set(key, new Set(value)));
        return result;
    }

    public static createEmpty(): LogContext {
        return new LogContext({
            tags: new Set(),
            category: undefined,
            service: undefined,
            sourceRecordIdsBySourceContext: new Map(),
            transactionId: undefined,
            metadata: new Map(),
        });
    }
}