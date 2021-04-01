import { LoopInfo } from '../model/LoopInfo';
import { ILoopInfoDatabase, LoopInfoDBKey } from './ILoopInfoDatabase';
import { IKeyValueStore, IKeyValueStoreFactory } from './IKeyValueStore';

export class LoopInfoDatabase implements ILoopInfoDatabase {
  private readonly store: IKeyValueStore<LoopInfoDocument | readonly LoopInfoDocument[]>;

  public constructor(kvsFactory: IKeyValueStoreFactory) {
    this.store = kvsFactory.create('LoopInfo');
  }

  public async getLoopInfo(file: LoopInfoDBKey): Promise<LoopInfo | undefined> {
    const doc = await this.store.get(file.hash);
    if (doc === null) {
      return undefined;
    } else if (doc instanceof Array) {
      return castDocToLoopInfo(doc.find((d) => d.album === file.album && d.track === file.trackNum));
    } else {
      return castDocToLoopInfo(doc);
    }
  }

  public async saveLoopInfo(file: LoopInfoDBKey, loopInfo: Required<LoopInfo>): Promise<void> {
    const doc: LoopInfoDocument = {
      hash: file.hash,
      album: file.album,
      track: file.trackNum,
      ...loopInfo,
    };
    const currentDoc = await this.store.get(file.hash);
    if (currentDoc instanceof Array) {
      await this.upsertLoopInfo(currentDoc, doc);
    } else if (currentDoc !== null) {
      await this.updateLoopInfo(currentDoc, doc);
    } else {
      this.store.set(doc.hash, doc);
    }
  }

  private async updateLoopInfo(currentDoc: LoopInfoDocument, newDoc: LoopInfoDocument) {
    if (currentDoc.album === newDoc.album && currentDoc.track === newDoc.album) {
      await this.store.set(newDoc.hash, newDoc);
    } else {
      await this.store.set(newDoc.hash, [currentDoc, newDoc]);
    }
  }

  private async upsertLoopInfo(currentDocs: readonly LoopInfoDocument[], newDoc: LoopInfoDocument) {
    const matchedDoc = currentDocs.findIndex((d) => d.album === newDoc.album && d.track === newDoc.track);
    if (matchedDoc !== -1) {
      const newValue = Array.from(currentDocs).splice(matchedDoc, 1, newDoc);
      await this.store.set(newDoc.hash, newValue);
    } else {
      await this.store.set(newDoc.hash, currentDocs.concat(newDoc));
    }
  }
}

interface LoopInfoDocument {
  readonly hash: string;
  readonly loopStart: number;
  readonly loopEnd: number;
  readonly album?: string;
  readonly track?: number;
}

const castDocToLoopInfo = (doc: LoopInfoDocument | undefined): LoopInfo | undefined =>
  doc !== undefined
    ? {
        loopStart: doc.loopStart,
        loopEnd: doc.loopEnd,
      }
    : undefined;
