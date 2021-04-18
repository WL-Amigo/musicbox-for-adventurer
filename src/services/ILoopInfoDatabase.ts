import { FileWithMetadata } from '../model/FileWithMetadata';
import { LoopInfo } from '../model/LoopInfo';

export type LoopInfoDBKey = Omit<FileWithMetadata, 'file' | 'loopInfo'>;

export interface LoopInfoDocument {
  readonly hash: string;
  readonly loopStart: number;
  readonly loopEnd: number;
  readonly sampleRate: number;
  readonly album?: string;
  readonly track?: number;
}

export interface LoopInfoDBExport {
  readonly updated: string;
  readonly loopInfoList: readonly (LoopInfoDocument | readonly LoopInfoDocument[])[];
}

export interface ILoopInfoDatabase {
  getLoopInfo(file: LoopInfoDBKey): Promise<LoopInfo | undefined>;
  saveLoopInfo(file: LoopInfoDBKey, loopInfo: Required<LoopInfo>): Promise<void>;
  export(): Promise<LoopInfoDBExport>;
  import(loopInfoDBJsonStr: string): Promise<void>;
}
