import { InvalidOperationError } from '../../errors/OperationError';
import { FileWithMetadata } from '../../model/FileWithMetadata';
import { loadFileToAudioBuffer, startPlayback, stopPlayback } from './MusicPlayerOperations';

export interface ILoopMusicPlayerInnerStates {
  readonly type: 'init' | 'stopped' | 'playing' | 'paused';
  readonly canPlay: boolean;
  readonly canPause: boolean;
  readonly canStop: boolean;
  readonly audioBuffer?: AudioBuffer;
  readonly file?: FileWithMetadata;
  load(file: FileWithMetadata): Promise<ILoopMusicPlayerInnerStates>;
  play(gain: number): Promise<ILoopMusicPlayerInnerStates>;
  pause(): Promise<ILoopMusicPlayerInnerStates>;
  stop(): Promise<ILoopMusicPlayerInnerStates>;
  changeVolume(gain: number): void;
}

export class InitialState implements ILoopMusicPlayerInnerStates {
  public readonly type = 'init';
  public readonly canPlay = false;
  public readonly canPause = false;
  public readonly canStop = false;

  public constructor(private readonly audioCtx: AudioContext) {}

  public async load(file: FileWithMetadata): Promise<ILoopMusicPlayerInnerStates> {
    const { buffer } = await loadFileToAudioBuffer(file, this.audioCtx);
    return new StoppedState(this.audioCtx, buffer, file);
  }

  play(): Promise<ILoopMusicPlayerInnerStates> {
    throw new InvalidOperationError('ファイルが読み込まれていません');
  }

  pause(): Promise<ILoopMusicPlayerInnerStates> {
    throw new InvalidOperationError('ファイルが読み込まれていません');
  }

  stop(): Promise<ILoopMusicPlayerInnerStates> {
    throw new InvalidOperationError('ファイルが読み込まれていません');
  }

  changeVolume(): void {
    // no-op
  }
}

class StoppedState implements ILoopMusicPlayerInnerStates {
  public readonly type = 'stopped';
  public readonly canPlay = true;
  public readonly canPause = false;
  public readonly canStop = false;

  public constructor(
    private readonly audioCtx: AudioContext,
    public readonly audioBuffer: AudioBuffer,
    public readonly file: FileWithMetadata,
  ) {}

  public async load(file: FileWithMetadata): Promise<ILoopMusicPlayerInnerStates> {
    const { buffer } = await loadFileToAudioBuffer(file, this.audioCtx);
    return new StoppedState(this.audioCtx, buffer, file);
  }

  public play(gain: number): Promise<ILoopMusicPlayerInnerStates> {
    const { gainNode, sourceNode, pseudoPlayStartedTimestamp } = startPlayback(
      this.audioCtx,
      this.audioBuffer,
      this.file.loopInfo,
      0,
      {
        initGain: gain,
      }
    );
    return Promise.resolve(
      new PlayingState(this.audioCtx, this.audioBuffer, this.file, gainNode, sourceNode, pseudoPlayStartedTimestamp),
    );
  }

  pause(): Promise<ILoopMusicPlayerInnerStates> {
    return Promise.resolve(this);
  }

  stop(): Promise<ILoopMusicPlayerInnerStates> {
    return Promise.resolve(this);
  }

  changeVolume(): void {
    // no-op
  }
}

class PlayingState implements ILoopMusicPlayerInnerStates {
  public readonly type = 'playing';
  public readonly canPlay = false;
  public readonly canPause = true;
  public readonly canStop = true;

  public constructor(
    private readonly audioCtx: AudioContext,
    public readonly audioBuffer: AudioBuffer,
    public readonly file: FileWithMetadata,
    private readonly gainNode: GainNode,
    private readonly sourceNode: AudioBufferSourceNode,
    private readonly startTimestamp: number,
  ) {}

  async load(file: FileWithMetadata): Promise<ILoopMusicPlayerInnerStates> {
    // stop playback
    const loadPromise = loadFileToAudioBuffer(file, this.audioCtx);
    await stopPlayback(this.audioCtx, this.gainNode, this.sourceNode, 500);
    const { buffer } = await loadPromise;
    return new StoppedState(this.audioCtx, buffer, file);
  }

  play(): Promise<ILoopMusicPlayerInnerStates> {
    return Promise.resolve(this);
  }

  async pause(): Promise<ILoopMusicPlayerInnerStates> {
    const { playEndedTimeStamp } = await stopPlayback(this.audioCtx, this.gainNode, this.sourceNode, 500);

    // calc offset to resume playback
    // TODO: ループ区間が浮いている前提で計算しなければいけないため要改良
    const bufferDuration = this.audioBuffer.duration;
    const playedTime = (playEndedTimeStamp - this.startTimestamp) / 1000;
    const resumeOffset = playedTime - Math.floor(playedTime / bufferDuration) * bufferDuration;

    return new PausedState(this.audioCtx, this.audioBuffer, this.file, resumeOffset);
  }

  async stop(): Promise<ILoopMusicPlayerInnerStates> {
    await stopPlayback(this.audioCtx, this.gainNode, this.sourceNode, 500);
    return new StoppedState(this.audioCtx, this.audioBuffer, this.file);
  }

  changeVolume(gain: number): void {
    this.gainNode.gain.value = gain;
  }
}

class PausedState implements ILoopMusicPlayerInnerStates {
  public readonly type = 'paused';
  public readonly canPlay = true;
  public readonly canPause = false;
  public readonly canStop = true;

  public constructor(
    private readonly audioCtx: AudioContext,
    public readonly audioBuffer: AudioBuffer,
    public readonly file: FileWithMetadata,
    private readonly resumeOffset: number,
  ) {}

  public async load(file: FileWithMetadata): Promise<ILoopMusicPlayerInnerStates> {
    const { buffer } = await loadFileToAudioBuffer(file, this.audioCtx);
    return new StoppedState(this.audioCtx, buffer, file);
  }

  play(gain: number): Promise<ILoopMusicPlayerInnerStates> {
    // fade in
    const { gainNode, sourceNode, pseudoPlayStartedTimestamp } = startPlayback(
      this.audioCtx,
      this.audioBuffer,
      this.file.loopInfo,
      this.resumeOffset,
      {
        fadeInMS: 500,
        initGain: gain,
      },
    );
    return Promise.resolve(
      new PlayingState(this.audioCtx, this.audioBuffer, this.file, gainNode, sourceNode, pseudoPlayStartedTimestamp),
    );
  }

  pause(): Promise<ILoopMusicPlayerInnerStates> {
    return Promise.resolve(this);
  }

  stop(): Promise<ILoopMusicPlayerInnerStates> {
    return Promise.resolve(new StoppedState(this.audioCtx, this.audioBuffer, this.file));
  }

  changeVolume(): void {
    // no-op
  }
}
