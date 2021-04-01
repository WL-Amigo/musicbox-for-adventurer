export interface IAsyncInitService {
  readonly isAsyncInitService: true;
  ensureInitialized(): Promise<unknown>;
}

export const isAsyncInitService = (s: unknown): s is IAsyncInitService =>
  typeof s === 'object' && s !== null && 'isAsyncInitService' in s;
