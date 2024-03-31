import { FeatureNotSupportedError } from '../errors/FatalError';
import { LoopInfo } from '../model/LoopInfo';
import { ILoopPreviewPlayer } from './ILoopPreviewPlayer';
import { IPlayerSettingsService } from './IPlayerSettingsService';
import { startPlayback, stopPlayback } from './private/MusicPlayerOperations';

export class LoopPreviewPlayer implements ILoopPreviewPlayer {
  private readonly ctx: AudioContext;
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private currentGainNode: GainNode | null = null;

  public constructor(
    private readonly playerSettingsService: IPlayerSettingsService,
  ) {
    if (window.AudioContext === undefined) {
      throw new FeatureNotSupportedError('WebAudio API');
    }
    this.ctx = new window.AudioContext();
  }

  start(buf: AudioBuffer, loopInfo: LoopInfo, offsetSecFromEnd: number): void {
    if (this.currentSourceNode !== null && this.currentGainNode !== null) {
      this.stop();
    }

    const { sourceNode, gainNode } = startPlayback(
      this.ctx,
      buf,
      loopInfo,
      Math.max(0, loopInfo.loopEnd / loopInfo.sampleRate - offsetSecFromEnd),
      {
        initGain: this.playerSettingsService.getMasterVolumeCurveApplied(),
      }
    );
    this.currentSourceNode = sourceNode;
    this.currentGainNode = gainNode;
  }

  stop(): void {
    if (this.currentSourceNode === null || this.currentGainNode === null) {
      return;
    }

    stopPlayback(this.ctx, this.currentGainNode, this.currentSourceNode, 20);
    this.currentSourceNode = null;
    this.currentGainNode = null;
  }
}
