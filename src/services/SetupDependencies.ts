import { InjectionKey, provide } from 'vue';
import { ServiceKeys } from '../compositions/ServiceProvider';
import { AudioFileLoader } from './AudioFileLoader';
import { IAsyncInitService } from './IAsyncInitService';
import { LoopInfoDatabase } from './LoopInfoDatabase';
import { LoopMusicPlayer } from './LoopMusicPlayer';

type ServiceDict = {
  readonly [key in keyof typeof ServiceKeys]: typeof ServiceKeys[key] extends InjectionKey<infer T> ? T : never;
};

const AllServiceKeys = Object.keys(ServiceKeys) as (keyof typeof ServiceKeys)[];

export const constructDependencies = async (): Promise<ServiceDict> => {
  const loopMusicPlayerInst = new LoopMusicPlayer();
  const keyValueStoreFactory = await import('./LocalForageKeyValueStore').then(
    (m) => new m.LocalForageKeyValueStoreFactory(),
  );
  const loopInfoDatabaseInst = new LoopInfoDatabase(keyValueStoreFactory);
  const audioFileLoaderInst = new AudioFileLoader(loopInfoDatabaseInst);

  const asyncInitServices: readonly IAsyncInitService[] = [audioFileLoaderInst];
  await Promise.all(asyncInitServices.map((asyncInitService) => asyncInitService.ensureInitialized()));

  return {
    loopMusicPlayer: loopMusicPlayerInst,
    audioFileLoader: audioFileLoaderInst,
    loopInfoDatabase: loopInfoDatabaseInst,
  };
};

export const provideDependencies = (serviceDict: ServiceDict): void => {
  for (const key of AllServiceKeys) {
    provide(ServiceKeys[key], serviceDict[key]);
  }
};
