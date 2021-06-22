import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import html from 'vite-plugin-html';
import WindiCSS from 'vite-plugin-windicss';
import { loadEnv } from 'vite';
import { LicenseGeneratorPlugin } from './vite-plugins/LicenseGenerator';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      WindiCSS(),
      html({
        inject: {
          injectData: {
            googleSiteVerificationSign: env.VITE_APP_GOOGLE_SITE_VERIFICATION,
          },
        },
      }),
      LicenseGeneratorPlugin(),
    ],
  };
});
