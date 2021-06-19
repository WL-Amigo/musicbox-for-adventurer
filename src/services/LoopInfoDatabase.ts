import { LoopInfo } from '../model/LoopInfo';
import {
  ILoopInfoDatabase,
  LoopInfoDBExport,
  LoopInfoDBKey,
  LoopInfoDocument,
  LoopInfoUpdatedEventHandler,
} from './ILoopInfoDatabase';
import { IKeyValueStore, IKeyValueStoreFactory } from './IKeyValueStore';
import { formatRFC3339 } from 'date-fns';
import { InvalidFileFormatError } from '../errors/FileError';
import { IAsyncInitService } from './IAsyncInitService';
import { registerEventHandler, UnsubscribeHandler } from '../utils/Event';

type DBMetaData = {
  updated: string;
};
const MetaDataKey = 'metadata';
const InitMetaData: DBMetaData = {
  updated: '2021-04-18T09:00:00+09:00',
};

export class LoopInfoDatabase implements ILoopInfoDatabase, IAsyncInitService {
  public readonly isAsyncInitService = true;
  private readonly loopInfoUpdatedListeners: LoopInfoUpdatedEventHandler[] = [];

  private readonly store: IKeyValueStore<LoopInfoDocument | readonly LoopInfoDocument[]>;
  private readonly metadataStore: IKeyValueStore<DBMetaData>;
  private currentMetadata: DBMetaData | null = null;

  public constructor(kvsFactory: IKeyValueStoreFactory) {
    this.store = kvsFactory.create('LoopInfo');
    this.metadataStore = kvsFactory.create('LoopInfoDBMetaData');
  }

  public async ensureInitialized(): Promise<void> {
    this.currentMetadata = await this.metadataStore.get(MetaDataKey);
  }

  private async updateMetaData(part: Partial<DBMetaData>): Promise<void> {
    if (this.currentMetadata === null) {
      this.currentMetadata = (await this.metadataStore.get(MetaDataKey)) ?? InitMetaData;
    }
    this.currentMetadata = {
      ...this.currentMetadata,
      ...part,
    };
    await this.metadataStore.set(MetaDataKey, this.currentMetadata);
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

  public async saveLoopInfo(file: LoopInfoDBKey, loopInfo: LoopInfo): Promise<void> {
    const doc: LoopInfoDocument = {
      hash: file.hash,
      album: file.album,
      track: file.trackNum,
      ...loopInfo,
    };
    await this.saveLoopInfoDoc(doc);

    await this.updateMetaData({
      updated: formatRFC3339(new Date()),
    });
    this.onLoopInfoUpdated();
  }

  private async saveLoopInfoDoc(doc: LoopInfoDocument): Promise<void> {
    const currentDoc = await this.store.get(doc.hash);
    if (currentDoc instanceof Array) {
      await this.upsertLoopInfo(currentDoc, doc);
    } else if (currentDoc !== null) {
      await this.updateLoopInfo(currentDoc, doc);
    } else {
      await this.store.set(doc.hash, doc);
    }
  }

  private async updateLoopInfo(currentDoc: LoopInfoDocument, newDoc: LoopInfoDocument) {
    if (this.areSameDoc(currentDoc, newDoc)) {
      await this.store.set(newDoc.hash, newDoc);
    } else {
      await this.store.set(newDoc.hash, [currentDoc, newDoc]);
    }
  }

  private async upsertLoopInfo(currentDocs: readonly LoopInfoDocument[], newDoc: LoopInfoDocument) {
    const matchedDocIndex = currentDocs.findIndex((d) => this.areSameDoc(d, newDoc));
    if (matchedDocIndex !== -1) {
      const newValue = Array.from(currentDocs);
      newValue.splice(matchedDocIndex, 1, newDoc);
      await this.store.set(newDoc.hash, newValue);
    } else {
      await this.store.set(newDoc.hash, currentDocs.concat(newDoc));
    }
  }

  private areSameDoc(a: LoopInfoDocument, b: LoopInfoDocument) {
    return a.album === b.album && a.track === b.track;
  }

  public async export(): Promise<LoopInfoDBExport> {
    const allDoc = await this.store.getAll();
    return {
      updated: this.currentMetadata?.updated ?? formatRFC3339(new Date()),
      loopInfoList: allDoc,
    };
  }

  public async import(loopInfoDBJsonStr: string): Promise<void> {
    const loopInfoDBExport = this.parseJsonToLoopInfoDBExport(loopInfoDBJsonStr);
    for (const importDoc of loopInfoDBExport.loopInfoList) {
      if (importDoc instanceof Array) {
        for (const doc of importDoc) {
          await this.saveLoopInfoDoc(doc);
        }
      } else {
        await this.saveLoopInfoDoc(importDoc);
      }
    }

    await this.updateMetaData({
      updated: loopInfoDBExport.updated,
    });
  }

  private parseJsonToLoopInfoDBExport(json: string): LoopInfoDBExport {
    const result = JSON.parse(json);
    // TODO: more strict validation by library like zod
    if (result.updated === undefined || result.loopInfoList === undefined) {
      throw new InvalidFileFormatError('LoopInfoDBExport');
    }
    return result;
  }

  public subscribeLoopInfoUpdated(handler: LoopInfoUpdatedEventHandler): UnsubscribeHandler {
    return registerEventHandler(this.loopInfoUpdatedListeners, handler);
  }

  private onLoopInfoUpdated(): void {
    this.loopInfoUpdatedListeners.forEach((handler) => handler());
  }
}

const castDocToLoopInfo = (doc: LoopInfoDocument | undefined): LoopInfo | undefined =>
  doc !== undefined
    ? {
        loopStart: doc.loopStart,
        loopEnd: doc.loopEnd,
        sampleRate: doc.sampleRate,
      }
    : undefined;
