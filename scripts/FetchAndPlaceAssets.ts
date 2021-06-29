import { parse } from 'dotenv';
import { ReadStream, createWriteStream } from 'fs';
import { readFile, remove, writeFile } from 'fs-extra';
import { spawnSync } from 'child_process';
import { z } from 'zod';
import Axios from 'axios';

const envSchema = z.object({
  ASSET_PRIV_KEY: z.string().min(1),
  ASSET_ZIP_GDRIVE_ID: z.string().min(1),
});

const LocalAssetsZipFileName = './assets.zip';
const LocalAssetsEncryptedFileName = './assets.zip.age';
const TemporaryKeyFileName = './key.txt';

(async () => {
  // extract env
  const env = Object.assign({}, process.env);
  try {
    Object.assign(env, parse(await readFile('./.env.local', 'utf8')));
  } catch (_) {
    // no-op
  }
  const { ASSET_PRIV_KEY, ASSET_ZIP_GDRIVE_ID } = envSchema.parse(env);

  // download zip contains assets
  await Axios.get<ReadStream>(`https://drive.google.com/u/1/uc?id=${ASSET_ZIP_GDRIVE_ID}&export=download`, {
    responseType: 'stream',
  }).then((resp) => {
    return new Promise<void>((res, rej) => {
      const dest = createWriteStream(LocalAssetsEncryptedFileName);
      resp.data.pipe(dest);
      resp.data.on('end', res);
      resp.data.on('error', (err) => {
        dest.destroy(err);
        rej(err);
      });
    });
  });

  // decrypt
  await writeFile(TemporaryKeyFileName, ASSET_PRIV_KEY);
  const decryptProc = spawnSync('./scripts/rage-x86_64-unknown-linux-gnu', [
    '--decrypt',
    '-i',
    TemporaryKeyFileName,
    '-o',
    LocalAssetsZipFileName,
    LocalAssetsEncryptedFileName,
  ]);
  if (decryptProc.error !== undefined) {
    throw decryptProc.error;
  }

  // unzip
  await remove('./public/images/');
  const unzipProc = spawnSync('unzip', [LocalAssetsZipFileName, '-d', './public/'], { encoding: 'utf8' });
  if (unzipProc.error !== undefined) {
    throw unzipProc.error;
  }

  await clean();
})().catch(async (err) => {
  await clean();
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

const clean = async () => {
  await remove(TemporaryKeyFileName);
  await remove(LocalAssetsEncryptedFileName);
  await remove(LocalAssetsZipFileName);
};
