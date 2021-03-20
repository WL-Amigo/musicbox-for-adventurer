import { FileWithMetadata } from '../model/FileWithMetadata';
import { LoopInfo } from '../model/LoopInfo';

export interface ILoopMusicPlayer {
  load(file: FileWithMetadata): Promise<void>;
  start(): void;
  pause(): void;
  stop(): void;
  onStateChanged(handler: (state: PlayerState) => void): () => void;
}

export interface PlayerState {
  readonly canPlay: boolean;
  readonly canPause: boolean;
  readonly canStop: boolean;
  readonly audioBuffer?: AudioBuffer;
  readonly loopInfo?: LoopInfo;
}
