import { BaseError } from './BaseError';

export class InvalidOperationError extends BaseError {
  public constructor(additionalInfo: string) {
    super(`無効な操作が行われようとしました: ${additionalInfo}`);
  }
}
