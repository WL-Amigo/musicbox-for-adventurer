import { FileWithMetadata } from '../model/FileWithMetadata';
import { IAudioFileLoader } from './IAudioFileLoader';
import type { parseBlob, IAudioMetadata } from 'music-metadata-browser';
import { DependencySetupFailureError } from '../errors/FatalError';
import { LoopInfo } from '../model/LoopInfo';
import { NotSupportedFileTypeError } from '../errors/FileError';

interface AsyncDependencies {
  readonly parseMetadataFromBlob: typeof parseBlob;
  readonly hashUint8Array: (inputBuffer: Uint8Array) => Uint8Array;
}

export class AudioFileLoader implements IAudioFileLoader {
  private readonly initPromise: Promise<AsyncDependencies>;
  public readonly isAsyncInitService = true;

  public constructor() {
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
      console.error(error);
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

    return {
      file,
      loopInfo: this.parseLoopInfo(metadata.native),
      hash,
      title: metadata.common.title ?? '',
      album: metadata.common.album ?? '',
      trackNum: metadata.common.track.no ?? 0,
    };
  }

  public parseLoopInfo(nativeTags: IAudioMetadata['native']): LoopInfo {
    const tagsDict = new Map<string, string>(
      Object.values(nativeTags)
        .flat()
        .map((t) => [t.id.toLowerCase(), t.value]),
    );
    const loopStart = Number(tagsDict.get('loopstart'));
    if (isNaN(loopStart)) {
      return {};
    }

    const loopLength = Number(tagsDict.get('looplength'));
    if (isNaN(loopLength)) {
      return {};
    }

    return {
      loopStart,
      loopEnd: loopStart + loopLength,
    };
  }
}
