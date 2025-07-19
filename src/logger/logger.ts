import { AsyncLocalStorage } from "async_hooks";
import { LogLevel, LoggingParameters } from './types';
import { LogContext } from './LogContext';
import { createLogObject } from './logFormatters';

//----------------------------------------------------------------------------------------------------------------------
// Context management
//----------------------------------------------------------------------------------------------------------------------

const asyncLocalStorage = new AsyncLocalStorage<LogContext>();
const EMPTY_CONTEXT = LogContext.createEmpty();

export const getLogContext = (): LogContext =>
    asyncLocalStorage.getStore() ?? EMPTY_CONTEXT;

export const withLogContext = <T>(logContext: LogContext, callback: () => T): T =>
    asyncLocalStorage.run(logContext, callback);

//----------------------------------------------------------------------------------------------------------------------
// Core logging
//----------------------------------------------------------------------------------------------------------------------

const writeLog = (level: LogLevel, parameters: LoggingParameters): void => {
  const context = getLogContext();
  const logObject = createLogObject(level, parameters, context);
  const rollbackLogObject = {
    ...logObject,
    message: `[ROLLED BACK] ${JSON.stringify(logObject.message)}`.trim()
  };

};

export const logger = {
  debug: (...parameters: LoggingParameters) => writeLog("debug", parameters),
  error: (...parameters: LoggingParameters) => writeLog("error", parameters),
  info: (...parameters: LoggingParameters) => writeLog("info", parameters),
  verbose: (...parameters: LoggingParameters) => writeLog("verbose", parameters),
  warn: (...parameters: LoggingParameters) => writeLog("warn", parameters),
} as const;

export { LogContext } from './LogContext';
export type { LogLevel, LoggingParameters, SourceRecordIdentifier } from './types';