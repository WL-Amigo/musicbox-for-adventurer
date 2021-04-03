import { inject, InjectionKey } from 'vue';
import { DependencyNotProvidedError } from '../errors/FatalError';
import type { IAudioFileLoader } from '../services/IAudioFileLoader';
import type { ILoopInfoDatabase } from '../services/ILoopInfoDatabase';
import type { ILoopMusicPlayer } from '../services/ILoopMusicPlayer';
import type { ILoopPreviewPlayer } from '../services/ILoopPreviewPlayer';

export const ServiceKeys = {
  loopMusicPlayer: Symbol('LoopMusicPlayer') as InjectionKey<ILoopMusicPlayer>,
  loopPreviewPlayer: Symbol('LoopPreviewPlayer') as InjectionKey<ILoopPreviewPlayer>,
  audioFileLoader: Symbol('AudioFileLoader') as InjectionKey<IAudioFileLoader>,
  loopInfoDatabase: Symbol('LoopInfoDatabase') as InjectionKey<ILoopInfoDatabase>,
} as const;

export const useService = <ServiceType>(key: InjectionKey<ServiceType>): ServiceType => {
  const service = inject(key);
  if (service === undefined) {
    throw new DependencyNotProvidedError(key);
  }

  return service;
};
