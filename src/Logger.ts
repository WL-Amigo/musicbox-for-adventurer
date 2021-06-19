/* eslint-disable no-console */
const ErrorLoggerFuncs: ((...args: unknown[]) => void)[] = [];
const InfoLoggerFuncs: ((...args: unknown[]) => void)[] = [];

if (import.meta.env.DEV) {
  ErrorLoggerFuncs.push(console.error);
  InfoLoggerFuncs.push(console.log);
}

export const Logger = {
  error: (...args: unknown[]) => ErrorLoggerFuncs.forEach((fn) => fn(...args)),
  info: (...args: unknown[]) => InfoLoggerFuncs.forEach((fn) => fn(...args)),
} as const;
