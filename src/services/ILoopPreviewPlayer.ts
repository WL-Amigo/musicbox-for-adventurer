import { LoopInfo } from '../model/LoopInfo';

export interface ILoopPreviewPlayer {
  start(buf: AudioBuffer, loopInfo: LoopInfo, offsetSecFromEnd: number): void;
  stop(): void;
}
