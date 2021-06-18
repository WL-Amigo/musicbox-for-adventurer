import { FileWithMetadata } from '../model/FileWithMetadata';
import { IAudioFileLoader } from './IAudioFileLoader';
import type { parseBlob, IAudioMetadata } from 'music-metadata-browser';
import { DependencySetupFailureError } from '../errors/FatalError';
import { LoopInfo } from '../model/LoopInfo';
import { NotSupportedFileTypeError } from '../errors/FileError';
import { ILoopInfoDatabase, LoopInfoDBKey } from './ILoopInfoDatabase';
import SparkMD5 from 'spark-md5';

interface AsyncDependencies {
  readonly parseMetadataFromBlob: typeof parseBlob;
}

export class AudioFileLoader implements IAudioFileLoader {
  private readonly initPromise: Promise<AsyncDependencies>;
  public readonly isAsyncInitService = true;

  public constructor(private readonly loopInfoDatabase: ILoopInfoDatabase) {
    this.initPromise = this.init();
  }

  private async init(): Promise<AsyncDependencies> {
    const [musicMetadataBrowser] = await Promise.all([import('music-metadata-browser')]);

    return {
      parseMetadataFromBlob: musicMetadataBrowser.parseBlob,
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
    const { parseMetadataFromBlob } = await this.ensureInitialized();

    if (!file.type.startsWith('audio')) {
      throw new NotSupportedFileTypeError(file.type);
    }

    const metadataPromise = parseMetadataFromBlob(file);
    const fileBufferPromise = file.arrayBuffer();
    const hashPromise = fileBufferPromise.then((ab) => {
      return SparkMD5.ArrayBuffer.hash(ab);
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
