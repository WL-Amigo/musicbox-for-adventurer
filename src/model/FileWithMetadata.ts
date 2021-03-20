import { LoopInfo } from './LoopInfo';

export interface FileWithMetadata {
  readonly file: File;
  readonly hash: string;
  readonly loopInfo: LoopInfo;
  readonly title: string;
  readonly album: string;
  readonly trackNum: number;
}
