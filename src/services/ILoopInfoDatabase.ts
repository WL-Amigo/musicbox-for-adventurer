import { z } from 'zod';
import { FileWithMetadata } from '../model/FileWithMetadata';
import { LoopInfo } from '../model/LoopInfo';
import { UnsubscribeHandler } from '../utils/Event';

export type LoopInfoDBKey = Omit<FileWithMetadata, 'file' | 'loopInfo'>;

export const LoopInfoDocumentSchema = z.object({
  hash: z.string(),
  loopStart: z.number(),
  loopEnd: z.number(),
  sampleRate: z.number().default(44100),
  album: z.string().optional(),
  track: z.number().optional(),
});

export type LoopInfoDocument = z.infer<typeof LoopInfoDocumentSchema>;

export const LoopInfoDBExportSchema = z.object({
  updated: z.string(),
  loopInfoList: z.union([LoopInfoDocumentSchema, z.array(LoopInfoDocumentSchema)]).array(),
});

export type LoopInfoDBExport = Readonly<z.infer<typeof LoopInfoDBExportSchema>>;

export type LoopInfoUpdatedEventHandler = () => void;

export interface ILoopInfoDatabase {
  getLoopInfo(file: LoopInfoDBKey): Promise<LoopInfo | undefined>;
  saveLoopInfo(file: LoopInfoDBKey, loopInfo: Required<LoopInfo>): Promise<void>;
  export(): Promise<LoopInfoDBExport>;
  import(loopInfoDBJsonStr: string): Promise<void>;
  subscribeLoopInfoUpdated(handler: LoopInfoUpdatedEventHandler): UnsubscribeHandler;
}
