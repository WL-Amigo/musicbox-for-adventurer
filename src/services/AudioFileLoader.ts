import { FileWithMetadata } from '../model/FileWithMetadata';
import { IAudioFileLoader } from './IAudioFileLoader';
import type { parseBlob, IAudioMetadata } from 'music-metadata-browser';
import { DependencySetupFailureError } from '../errors/FatalError';
import { LoopInfo } from '../model/LoopInfo';
import { NotSupportedFileTypeError } from '../errors/FileError';
import { ILoopInfoDatabase, LoopInfoDBKey } from './ILoopInfoDatabase';

interface AsyncDependencies {
  readonly parseMetadataFromBlob: typeof parseBlob;
  readonly hashUint8Array: (inputBuffer: Uint8Array) => Uint8Array;
}

export class AudioFileLoader implements IAudioFileLoader {
  private readonly initPromise: Promise<AsyncDependencies>;
  public readonly isAsyncInitService = true;

  public constructor(private readonly loopInfoDatabase: ILoopInfoDatabase) {
    this.initPromise = this.init();
  }

  private async init(): Promise<AsyncDependencies> {
    const [musicMetadataBrowser, xxhashWasm] = await Promise.all([
      import('music-metadata-browser'),
      import('xxhash-wasm').then((p) => p.default()),
    ]);

    return {
      parseMetadataFromBlob: musicMetadataBrowser.parseBlob,
      hashUint8Array: xxhashWasm.h64Raw,
    };
  }

  public async ensureInitialized(): Promise<AsyncDependencies> {
    try {
      return await this.initPromise;
    } catch (error) {
      throw new DependencySetupFailureError('AudioFileLoader', error);
    }
  }

  public async load(file: File): Promise<FileWithMetadata> {
    const { parseMetadataFromBlob, hashUint8Array } = await this.ensureInitialized();

    if (!file.type.startsWith('audio')) {
      throw new NotSupportedFileTypeError(file.type);
    }

    const metadataPromise = parseMetadataFromBlob(file);
    const fileBufferPromise = file.arrayBuffer();
    const hashPromise = fileBufferPromise.then((ab) => {
      const raw = hashUint8Array(new Uint8Array(ab));
      return Array.from(raw)
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('');
    });
    const metadata = await metadataPromise;
    const hash = await hashPromise;

    const loopInfoDBKey: LoopInfoDBKey = {
      hash,
      title: metadata.common.title ?? '',
      album: metadata.common.album ?? '',
      trackNum: metadata.common.track.no ?? 0,
    };
    let loopInfo = this.parseLoopInfo(metadata);
    if (loopInfo === undefined) {
      loopInfo = await this.loopInfoDatabase.getLoopInfo(loopInfoDBKey);
    }

    return {
      file,
      loopInfo,
      ...loopInfoDBKey,
    };
  }

  public parseLoopInfo(metadata: IAudioMetadata): LoopInfo | undefined {
    const nativeTags = metadata.native;
    const tagsDict = new Map<string, string>(
      Object.values(nativeTags)
        .flat()
        .map((t) => [t.id.toLowerCase(), t.value]),
    );
    const loopStart = Number(tagsDict.get('loopstart'));
    if (isNaN(loopStart)) {
      return undefined;
    }

    const loopLength = Number(tagsDict.get('looplength'));
    if (isNaN(loopLength)) {
      return undefined;
    }

    if (metadata.format.sampleRate === undefined) {
      return undefined;
    }

    return {
      loopStart,
      loopEnd: loopStart + loopLength,
      sampleRate: metadata.format.sampleRate,
    };
  }
}
