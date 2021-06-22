import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  extract: {
    include: ['src/**/*.{vue,ts}', 'index.html'],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      dropShadow: {
        grow: '0 0 6px rgba(255, 255, 255, 0.5)',
      },
    },
  },
  plugins: [],
  shortcuts: {
    'window-main': {
      'border-width': '64px',
      'border-image-source': "url('/images/window.png')",
      'border-image-slice': '64 fill',
    },
    'window-sub': {
      'border-width': '32px',
      'border-image-source': "url('/images/window-sub.png')",
      'border-image-slice': '32 fill',
    },
    'window-sub-white': {
      'border-width': '32px',
      'border-image-source': "url('/images/window-sub-white.png')",
      'border-image-slice': '32 fill',
    },
  },
});
