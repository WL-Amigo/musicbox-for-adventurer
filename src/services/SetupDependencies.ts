import { provide } from 'vue';
import { ServiceKeys } from '../compositions/ServiceProvider';
import { LoopMusicPlayer } from './LoopMusicPlayer';

export const setupDependencies = (): void => {
  const loopMusicPlayerInst = new LoopMusicPlayer();

  provide(ServiceKeys.loopMusicPlayer, loopMusicPlayerInst);
};
