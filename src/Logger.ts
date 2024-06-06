import consolaGlobalInstance, { LogLevels, LogLevel } from 'consola'

export default consolaGlobalInstance
consolaGlobalInstance.level = LogLevels.debug;

export type Logger = {
  trace: (...args: unknown[]) => void,
  debug: (...args: unknown[]) => void,
  info: (...args: unknown[]) => void,
  success: (...args: unknown[]) => void,
  warn: (...args: unknown[]) => void,
  error: (...args: unknown[]) => void,
  fatal: (...args: unknown[]) => void,
  level: LogLevel
}

export const noopLogger: Logger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  success: () => {},
  warn: () => {},
  error: () => {},
  fatal: () => {},
  level: -1
}
