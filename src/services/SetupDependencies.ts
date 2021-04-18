import { InjectionKey, provide } from 'vue';
import { ServiceKeys } from '../compositions/ServiceProvider';
import { AudioFileLoader } from './AudioFileLoader';
import { AuthService } from './AuthService';
import { IAsyncInitService } from './IAsyncInitService';
import { LoopInfoDatabase } from './LoopInfoDatabase';
import { LoopMusicPlayer } from './LoopMusicPlayer';
import { LoopPreviewPlayer } from './LoopPreviewPlayer';

type ServiceDict = {
  readonly [key in keyof typeof ServiceKeys]: typeof ServiceKeys[key] extends InjectionKey<infer T> ? T : never;
};

const AllServiceKeys = Object.keys(ServiceKeys) as (keyof typeof ServiceKeys)[];

export const constructDependencies = async (): Promise<ServiceDict> => {
  const authServiceInst = new AuthService();
  const loopMusicPlayerInst = new LoopMusicPlayer();
  const loopPreviewPlayerInst = new LoopPreviewPlayer();
  const keyValueStoreFactory = await import('./LocalForageKeyValueStore').then(
    (m) => new m.LocalForageKeyValueStoreFactory(),
  );
  const loopInfoDatabaseInst = new LoopInfoDatabase(keyValueStoreFactory);
  const audioFileLoaderInst = new AudioFileLoader(loopInfoDatabaseInst);

  authServiceInst.subscribeStateChanged((state) => console.log(state));

  const asyncInitServices: readonly IAsyncInitService[] = [audioFileLoaderInst, authServiceInst];
  await Promise.all(asyncInitServices.map((asyncInitService) => asyncInitService.ensureInitialized()));

  return {
    authService: authServiceInst,
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
