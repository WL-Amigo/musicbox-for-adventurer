import { InjectionKey, provide } from 'vue';
import { ServiceKeys } from '../compositions/ServiceProvider';
import { AudioFileLoader } from './AudioFileLoader';
import { LoopMusicPlayer } from './LoopMusicPlayer';

type ServiceDict = {
  readonly [key in keyof typeof ServiceKeys]: typeof ServiceKeys[key] extends InjectionKey<infer T> ? T : never;
};

const AllServiceKeys = Object.keys(ServiceKeys) as (keyof typeof ServiceKeys)[];

export const constructDependencies = async (): Promise<ServiceDict> => {
  const loopMusicPlayerInst = new LoopMusicPlayer();
  const audioFileLoaderInst = new AudioFileLoader();

  await Promise.all([audioFileLoaderInst].map((asyncInitService) => asyncInitService.ensureInitialized()));

  return {
    loopMusicPlayer: loopMusicPlayerInst,
    audioFileLoader: audioFileLoaderInst,
  };
};

export const provideDependencies = (serviceDict: ServiceDict): void => {
  for (const key of AllServiceKeys) {
    provide(ServiceKeys[key], serviceDict[key]);
  }
};
