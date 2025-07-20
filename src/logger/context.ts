import { AsyncLocalStorage } from 'async_hooks';

import type { LogContextData } from './types';

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

const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

export const getLogContext = (): LogContext =>
  asyncLocalStorage.getStore() ?? EMPTY_CONTEXT;

export const withLogContext = <T>(logContext: LogContext, callback: () => T): T =>
  asyncLocalStorage.run(logContext, callback);
