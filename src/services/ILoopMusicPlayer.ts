export interface ILoopMusicPlayer {
  load(file: File): Promise<void>;
  start(): void;
  pause(): void;
  stop(): void;
  onStateChanged(handler: (state: PlayerState) => void): () => void;
}

export interface PlayerState {
  readonly canPlay: boolean;
  readonly canPause: boolean;
  readonly canStop: boolean;
}
