import { ILoopInfoDatabase } from '../../ILoopInfoDatabase';
import { IAppDataSyncStrategy } from './IAppDataSyncStrategy';
import { z } from 'zod';

const LoopInfoDBFileName = 'loopinfo-data.json';
const CommonFileMetadata = {
  parents: ['appDataFolder'],
} as const;

export class GoogleAppDataSync implements IAppDataSyncStrategy {
  public constructor(private readonly oAuthToken: string, private readonly loopInfoDatabase: ILoopInfoDatabase) {}

  public async pushLoopInfoDatabase(): Promise<void> {
    const exportedData = await this.loopInfoDatabase.export();
    const remoteFile = await findFile(this.oAuthToken, LoopInfoDBFileName);
    let fileId = remoteFile?.id;
    if (fileId === undefined) {
      fileId = await createEmptyJsonFile(this.oAuthToken, LoopInfoDBFileName);
    }
    await updateJsonFile(this.oAuthToken, fileId, exportedData);
  }

  public async pullLoopInfoDatabase(): Promise<void> {
    const remoteFile = await findFile(this.oAuthToken, LoopInfoDBFileName);
    if (remoteFile === undefined) {
      return;
    }

    const remoteLoopInfoData = await getJsonContentAsString(this.oAuthToken, remoteFile.id);
    await this.loopInfoDatabase.import(remoteLoopInfoData);
  }
}

const GDriveMetadataEndpoint = 'https://www.googleapis.com/drive/v3/files';
const GDriveUploadEndpoint = 'https://www.googleapis.com/upload/drive/v3/files';
const GDriveFileListResponseSchema = z.object({
  files: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
});
const GDriveFileMetadataResponseSchema = z.object({
  id: z.string(),
});

const getAuthHeader = (oAuthToken: string) => {
  return {
    authorization: `Bearer ${oAuthToken}`,
  };
};

const findFile = async (oAuthToken: string, fileName: string) => {
  const commonHeader = getAuthHeader(oAuthToken);
  const filesRequestUrl = new URL(GDriveMetadataEndpoint);
  const filesRequestSearchParams = filesRequestUrl.searchParams;
  filesRequestSearchParams.append('spaces', 'appDataFolder');
  filesRequestSearchParams.append('fields', 'files(id, name)');
  filesRequestSearchParams.append('pageSize', '100');
  const filesResponse = await fetch(filesRequestUrl.toString(), {
    headers: commonHeader,
  });
  const files = GDriveFileListResponseSchema.parse(await filesResponse.json());
  return files.files.find((f) => f.name === fileName);
};

const createEmptyJsonFile = async (oAuthToken: string, fileName: string): Promise<string> => {
  const commonHeader = getAuthHeader(oAuthToken);
  const fileCreateResponse = await fetch(GDriveMetadataEndpoint, {
    method: 'POST',
    headers: {
      ...commonHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: fileName,
      ...CommonFileMetadata,
    }),
  });
  const metadata = GDriveFileMetadataResponseSchema.parse(await fileCreateResponse.json());
  return metadata.id;
};

const updateJsonFile = async (oAuthToken: string, fileId: string, data: unknown) => {
  const commonHeader = getAuthHeader(oAuthToken);
  const fileUpdateRequestUrl = new URL(GDriveUploadEndpoint + '/' + fileId);
  fileUpdateRequestUrl.searchParams.append('uploadType', 'media');
  await fetch(fileUpdateRequestUrl.toString(), {
    method: 'PATCH',
    headers: {
      ...commonHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

const getJsonContentAsString = async (oAuthToken: string, fileId: string): Promise<string> => {
  const commonHeader = getAuthHeader(oAuthToken);
  const fileGetRequestUrl = new URL(GDriveMetadataEndpoint + '/' + fileId);
  fileGetRequestUrl.searchParams.append('alt', 'media');
  const fileGetResponse = await fetch(fileGetRequestUrl.toString(), {
    headers: commonHeader,
  });
  return await fileGetResponse.text();
};
