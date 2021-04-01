import { FileWithMetadata } from '../model/FileWithMetadata';

export interface ILoopMusicPlayer {
  load(file: FileWithMetadata): Promise<void>;
  start(): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  onStateChanged(handler: (state: PlayerState) => void): () => void;
}

export interface PlayerState {
  readonly canPlay: boolean;
  readonly canPause: boolean;
  readonly canStop: boolean;
  readonly audioBuffer?: AudioBuffer;
  readonly file?: FileWithMetadata;
}
