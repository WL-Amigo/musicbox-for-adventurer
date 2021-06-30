import { readFileSync } from 'fs';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import html from 'vite-plugin-html';
import WindiCSS from 'vite-plugin-windicss';
import { VitePWA } from 'vite-plugin-pwa';
import { LicenseGeneratorPlugin } from './vite-plugins/LicenseGenerator';
import DotEnv from 'dotenv';
import type { ServerOptions } from 'https';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const localEnvConfig = loadLocalEnv();

  return {
    plugins: [
      vue(),
      WindiCSS(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          lang: 'ja',
          name: '冒険者のための音楽箱 - Musicbox for Adventurers -',
          short_name: '冒険者のための音楽箱',
          display: 'fullscreen',
          background_color: '#1F2937',
          theme_color: '#1F2937',
          icons: [
            {
              src: 'icons/16x16.png',
              sizes: '16x16',
              type: 'image/png',
            },
            {
              src: 'icons/32x32.png',
              sizes: '32x32',
              type: 'image/png',
            },
            {
              src: 'icons/192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: 'icons/512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        includeAssets: ['images/*.png'],
      }),
      html({
        inject: {
          injectData: {
            googleSiteVerificationSign: env.VITE_APP_GOOGLE_SITE_VERIFICATION,
          },
        },
      }),
      LicenseGeneratorPlugin(),
    ],
    server: {
      https: localEnvConfig?.server?.https,
    },
  };
});

interface LocalEnvConfig {
  server: {
    https?: ServerOptions;
  };
}
const loadLocalEnv = (): LocalEnvConfig | undefined => {
  try {
    const env = DotEnv.parse(readFileSync('./.env.local', 'utf8'));

    const { HTTPS_CERT, HTTPS_CERT_KEY } = env;
    const httpsServerOptions =
      typeof HTTPS_CERT === 'string' && typeof HTTPS_CERT_KEY === 'string'
        ? {
            key: readFileSync(HTTPS_CERT_KEY),
            cert: readFileSync(HTTPS_CERT),
          }
        : undefined;

    return {
      server: {
        https: httpsServerOptions,
      },
    };
  } catch (_) {
    return undefined;
  }
};
