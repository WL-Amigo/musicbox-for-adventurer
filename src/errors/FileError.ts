import { BaseError } from "./BaseError";

export class NotSupportedFileTypeError extends BaseError {
  public constructor(inputedFileType: string) {
    super(`サポートされていないファイルタイプです: ${inputedFileType}`);
  }
}
