import { InjectionKey, provide } from 'vue';
import { ServiceKeys } from '../compositions/ServiceProvider';
import { Logger } from '../Logger';
import { AppDataSyncService } from './AppDataSyncService';
import { AudioFileLoader } from './AudioFileLoader';
import { AuthService } from './AuthService';
import { IAsyncInitService } from './IAsyncInitService';
import { LoopInfoDatabase } from './LoopInfoDatabase';
import { LoopMusicPlayer } from './LoopMusicPlayer';
import { LoopPreviewPlayer } from './LoopPreviewPlayer';
import { PlayerSettingsService } from './PlayerSettingsService';

type ServiceDict = {
  readonly [key in keyof typeof ServiceKeys]: typeof ServiceKeys[key] extends InjectionKey<infer T> ? T : never;
};

const AllServiceKeys = Object.keys(ServiceKeys) as (keyof typeof ServiceKeys)[];

export const constructDependencies = async (): Promise<ServiceDict> => {
  const authServiceInst = new AuthService();
  const keyValueStoreFactory = await import('./LocalForageKeyValueStore').then(
    (m) => new m.LocalForageKeyValueStoreFactory(),
  );
  const playerSettingsServiceInst = new PlayerSettingsService(keyValueStoreFactory);
  const loopMusicPlayerInst = new LoopMusicPlayer(playerSettingsServiceInst);
  const loopPreviewPlayerInst = new LoopPreviewPlayer(playerSettingsServiceInst);
  const loopInfoDatabaseInst = new LoopInfoDatabase(keyValueStoreFactory);
  const audioFileLoaderInst = new AudioFileLoader(loopInfoDatabaseInst);
  const _appDataSyncServiceInst = new AppDataSyncService(authServiceInst, loopInfoDatabaseInst);

  authServiceInst.subscribeStateChanged((state) => Logger.info(state));
  _appDataSyncServiceInst.subscribeSyncFinished(() => Logger.info('sync finished!'));

  const asyncInitServices: readonly IAsyncInitService[] = [
    audioFileLoaderInst,
    authServiceInst,
    loopInfoDatabaseInst,
    playerSettingsServiceInst,
  ];
  await Promise.all(asyncInitServices.map((asyncInitService) => asyncInitService.ensureInitialized()));

  return {
    authService: authServiceInst,
    playerSettingsService: playerSettingsServiceInst,
    loopMusicPlayer: loopMusicPlayerInst,
    loopPreviewPlayer: loopPreviewPlayerInst,
    audioFileLoader: audioFileLoaderInst,
    loopInfoDatabase: loopInfoDatabaseInst,
  };
};

export const provideDependencies = (serviceDict: ServiceDict): void => {
  for (const key of AllServiceKeys) {
    provide(ServiceKeys[key], serviceDict[key]);
  }
};
