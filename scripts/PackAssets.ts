import { spawnSync } from 'child_process';
import { parse } from 'dotenv';
import { readFile, remove } from 'fs-extra';
import { z } from 'zod';

const envSchema = z.object({
  ASSET_PUB_KEY: z.string().min(1),
});

const LocalAssetsZipFileName = './assets.zip';
const LocalAssetsEncryptedFileName = './assets.zip.age';

(async () => {
  // extract env
  const env = Object.assign({}, process.env);
  try {
    Object.assign(env, parse(await readFile('./.env.local', 'utf8')));
  } catch (_) {
    // no-op
  }
  const { ASSET_PUB_KEY } = envSchema.parse(env);

  // zip
  await remove(LocalAssetsZipFileName);
  const zipResult = spawnSync('7za', ['a', LocalAssetsZipFileName, './public/images/']);
  if (zipResult.error !== undefined) {
    throw zipResult.error;
  }

  // encrypt
  await remove(LocalAssetsEncryptedFileName);
  const rageResult = spawnSync('./scripts/rage-x86_64-unknown-linux-gnu', [
    '-r',
    ASSET_PUB_KEY,
    '-o',
    LocalAssetsEncryptedFileName,
    LocalAssetsZipFileName,
  ]);
  if (rageResult.error !== undefined) {
    throw rageResult.error;
  }

  await clean();
})().catch(async (err) => {
  await clean();
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

const clean = async () => {
  await remove(LocalAssetsZipFileName);
};
