import { InvalidOperationError } from '../../errors/OperationError';
import { LoopInfo } from '../../model/LoopInfo';
import { loadFileToAudioBuffer, startPlayback, stopPlayback } from './MusicPlayerOperations';

export interface ILoopMusicPlayerInnerStates {
  readonly type: 'init' | 'stopped' | 'playing' | 'paused';
  readonly canPlay: boolean;
  readonly canPause: boolean;
  readonly canStop: boolean;
  load(file: File): Promise<ILoopMusicPlayerInnerStates>;
  play(): Promise<ILoopMusicPlayerInnerStates>;
  pause(): Promise<ILoopMusicPlayerInnerStates>;
  stop(): Promise<ILoopMusicPlayerInnerStates>;
}

export class InitialState implements ILoopMusicPlayerInnerStates {
  public readonly type = 'init';
  public readonly canPlay = false;
  public readonly canPause = false;
  public readonly canStop = false;

  public constructor(private readonly audioCtx: AudioContext) {}

  public async load(file: File): Promise<ILoopMusicPlayerInnerStates> {
    const { buffer, loopInfo } = await loadFileToAudioBuffer(file, this.audioCtx);
    return new StoppedState(this.audioCtx, buffer, loopInfo);
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
}

class StoppedState implements ILoopMusicPlayerInnerStates {
  public readonly type = 'stopped';
  public readonly canPlay = true;
  public readonly canPause = false;
  public readonly canStop = false;

  public constructor(
    private readonly audioCtx: AudioContext,
    private readonly audioBuffer: AudioBuffer,
    private readonly loopInfo: LoopInfo,
  ) {}

  public async load(file: File): Promise<ILoopMusicPlayerInnerStates> {
    const { buffer, loopInfo } = await loadFileToAudioBuffer(file, this.audioCtx);
    return new StoppedState(this.audioCtx, buffer, loopInfo);
  }

  public play(): Promise<ILoopMusicPlayerInnerStates> {
    const { gainNode, sourceNode, pseudoPlayStartedTimestamp } = startPlayback(
      this.audioCtx,
      this.audioBuffer,
      this.loopInfo,
      0,
    );
    return Promise.resolve(
      new PlayingState(
        this.audioCtx,
        this.audioBuffer,
        this.loopInfo,
        gainNode,
        sourceNode,
        pseudoPlayStartedTimestamp,
      ),
    );
  }

  pause(): Promise<ILoopMusicPlayerInnerStates> {
    return Promise.resolve(this);
  }

  stop(): Promise<ILoopMusicPlayerInnerStates> {
    return Promise.resolve(this);
  }
}

class PlayingState implements ILoopMusicPlayerInnerStates {
  public readonly type = 'playing';
  public readonly canPlay = false;
  public readonly canPause = true;
  public readonly canStop = true;

  public constructor(
    private readonly audioCtx: AudioContext,
    private readonly audioBuffer: AudioBuffer,
    private readonly loopInfo: LoopInfo,
    private readonly gainNode: GainNode,
    private readonly sourceNode: AudioBufferSourceNode,
    private readonly startTimestamp: number,
  ) {}

  async load(file: File): Promise<ILoopMusicPlayerInnerStates> {
    // stop playback
    const loadPromise = loadFileToAudioBuffer(file, this.audioCtx);
    await stopPlayback(this.audioCtx, this.gainNode, this.sourceNode, 500);
    const { buffer, loopInfo } = await loadPromise;
    return new StoppedState(this.audioCtx, buffer, loopInfo);
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

    return new PausedState(this.audioCtx, this.audioBuffer, this.loopInfo, resumeOffset);
  }

  async stop(): Promise<ILoopMusicPlayerInnerStates> {
    await stopPlayback(this.audioCtx, this.gainNode, this.sourceNode, 500);
    return new StoppedState(this.audioCtx, this.audioBuffer, this.loopInfo);
  }
}

class PausedState implements ILoopMusicPlayerInnerStates {
  public readonly type = 'paused';
  public readonly canPlay = true;
  public readonly canPause = false;
  public readonly canStop = true;

  public constructor(
    private readonly audioCtx: AudioContext,
    private readonly audioBuffer: AudioBuffer,
    private readonly loopInfo: LoopInfo,
    private readonly resumeOffset: number,
  ) {}

  public async load(file: File): Promise<ILoopMusicPlayerInnerStates> {
    const { buffer, loopInfo } = await loadFileToAudioBuffer(file, this.audioCtx);
    return new StoppedState(this.audioCtx, buffer, loopInfo);
  }

  play(): Promise<ILoopMusicPlayerInnerStates> {
    // fade in
    const { gainNode, sourceNode, pseudoPlayStartedTimestamp } = startPlayback(
      this.audioCtx,
      this.audioBuffer,
      this.loopInfo,
      this.resumeOffset,
      500,
    );
    return Promise.resolve(
      new PlayingState(
        this.audioCtx,
        this.audioBuffer,
        this.loopInfo,
        gainNode,
        sourceNode,
        pseudoPlayStartedTimestamp,
      ),
    );
  }

  pause(): Promise<ILoopMusicPlayerInnerStates> {
    return Promise.resolve(this);
  }

  stop(): Promise<ILoopMusicPlayerInnerStates> {
    return Promise.resolve(new StoppedState(this.audioCtx, this.audioBuffer, this.loopInfo));
  }
}
