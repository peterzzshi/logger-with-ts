import { getLogContext } from './context';
import type { LogLevel, LoggingParameters, LogOutput, Logger } from './types';

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

const log = (level: LogLevel, parameters: LoggingParameters): void => {
  const logObject = createLogObject(level, parameters);
  process.stdout.write(`${JSON.stringify(logObject)}\n`);
};

export const logger: Logger = {
  debug: (...parameters: LoggingParameters) => log('debug', parameters),
  info: (...parameters: LoggingParameters) => log('info', parameters),
  warn: (...parameters: LoggingParameters) => log('warn', parameters),
  error: (...parameters: LoggingParameters) => log('error', parameters),
} as const;
