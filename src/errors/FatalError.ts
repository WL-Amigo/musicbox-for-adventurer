import { InjectionKey } from 'vue';
import { BaseError } from './BaseError';

export class FeatureNotSupportedError extends BaseError {
  public constructor(moduleName: string) {
    super(`次の機能が動作中の環境で利用できません: ${moduleName}`);
  }
}

export class UnexpectedStateError extends BaseError {
  public constructor(additionalInfo?: string) {
    super(
      additionalInfo !== undefined
        ? `予期しない状態が発生したため処理を継続できません: ${additionalInfo}`
        : '予期しない状態が発生したため処理を継続できません',
    );
  }
}

export class DependencyNotProvidedError extends BaseError {
  public constructor(injectionKey: InjectionKey<unknown>) {
    super(`次の依存関係が正しく provide されていません: ${injectionKey.description}`);
  }
}

export class DependencySetupFailureError extends BaseError {
  public constructor(className: string, baseError: Error) {
    super(`次のクラスのセットアップが失敗しました: ${className} => ${baseError}`);
  }
}
