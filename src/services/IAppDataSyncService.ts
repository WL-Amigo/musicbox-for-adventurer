import { UnsubscribeHandler } from '../utils/Event';

export type SyncFinishedEventHandler = () => void;

export interface IAppDataSyncService {
  subscribeSyncFinished(handler: SyncFinishedEventHandler): UnsubscribeHandler;
}
