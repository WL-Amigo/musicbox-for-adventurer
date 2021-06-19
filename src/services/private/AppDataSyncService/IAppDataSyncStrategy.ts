export interface IAppDataSyncStrategy {
  pushLoopInfoDatabase(): Promise<void>;
  pullLoopInfoDatabase(): Promise<void>;
}
