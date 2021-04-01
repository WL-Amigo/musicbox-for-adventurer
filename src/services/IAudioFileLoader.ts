import { FileWithMetadata } from '../model/FileWithMetadata';
import { IAsyncInitService } from './IAsyncInitService';

export interface IAudioFileLoader extends IAsyncInitService {
  load(file: File): Promise<FileWithMetadata>;
}
