import { FeatureNotSupportedError } from '../errors/FatalError';
import { FileWithMetadata } from '../model/FileWithMetadata';
import { ILoopMusicPlayer, PlayerState } from './ILoopMusicPlayer';
import { ILoopMusicPlayerInnerStates, InitialState } from './private/LoopMusicPlayerInnerStates';

export class LoopMusicPlayer implements ILoopMusicPlayer {
  private readonly ctx: AudioContext;
  private state: ILoopMusicPlayerInnerStates;
  private readonly stateChangedHandlers: ((s: PlayerState) => void)[] = [];

  public constructor() {
    if (window.AudioContext === undefined) {
      throw new FeatureNotSupportedError('WebAudio API');
    }
    this.ctx = new window.AudioContext();
    this.state = new InitialState(this.ctx);
  }

  private changeState(newState: ILoopMusicPlayerInnerStates): void {
    const oldState = this.state;
    if (oldState !== newState) {
      this.state = newState;
      this.stateChangedHandlers.forEach((h) => h(newState));
    }
  }

  public async load(file: FileWithMetadata): Promise<void> {
    this.changeState(await this.state.load(file));
  }

  public async start(): Promise<void> {
    this.changeState(await this.state.play());
  }

  public async pause(): Promise<void> {
    this.changeState(await this.state.pause());
  }

  public async stop(): Promise<void> {
    this.changeState(await this.state.stop());
  }

  public onStateChanged(handler: (s: PlayerState) => void): () => void {
    this.stateChangedHandlers.push(handler);
    handler(this.state);
    return () => this.stateChangedHandlers.splice(this.stateChangedHandlers.indexOf(handler), 1);
  }
}
