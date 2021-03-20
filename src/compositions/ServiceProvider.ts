import { inject, InjectionKey } from 'vue';
import { DependencyNotProvidedError } from '../errors/FatalError';
import { IAudioFileLoader } from '../services/IAudioFileLoader';
import { ILoopMusicPlayer } from '../services/ILoopMusicPlayer';

export const ServiceKeys = {
  loopMusicPlayer: Symbol('LoopMusicPlayer') as InjectionKey<ILoopMusicPlayer>,
  audioFileLoader: Symbol('AudioFileLoader') as InjectionKey<IAudioFileLoader>,
} as const;

export const useService = <ServiceType>(key: InjectionKey<ServiceType>): ServiceType => {
  const service = inject(key);
  if (service === undefined) {
    throw new DependencyNotProvidedError(key);
  }

  return service;
};
