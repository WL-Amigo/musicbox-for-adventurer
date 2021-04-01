import { FileWithMetadata } from '../model/FileWithMetadata';
import { LoopInfo } from '../model/LoopInfo';

export type LoopInfoDBKey = Omit<FileWithMetadata, 'file' | 'loopInfo'>;

export interface ILoopInfoDatabase {
  getLoopInfo(file: LoopInfoDBKey): Promise<LoopInfo | undefined>;
  saveLoopInfo(file: LoopInfoDBKey, loopInfo: Required<LoopInfo>): Promise<void>;
}
