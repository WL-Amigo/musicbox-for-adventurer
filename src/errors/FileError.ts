import { BaseError } from './BaseError';

export class NotSupportedFileTypeError extends BaseError {
  public constructor(inputedFileType: string) {
    super(`サポートされていないファイルタイプです: ${inputedFileType}`);
  }
}

export class InvalidFileFormatError extends BaseError {
  public constructor(typeName: string) {
    super(`ファイル形式が期待されているフォーマットと異なります: ${typeName}`);
  }
}
