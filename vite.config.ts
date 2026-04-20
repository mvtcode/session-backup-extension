import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import { execSync } from 'child_process';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [
    crx({ manifest }),
    {
      name: 'locales-fix',
      closeBundle() {
        try {
          execSync(
            'rm -rf dist/_locales && mkdir -p dist/_locales && cp -r src/locales/* dist/_locales/',
          );
          console.log(
            '[locales-fix] Successfully copied locales to dist/_locales',
          );
        } catch (err) {
          console.error('[locales-fix] Failed to copy locales:', err);
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
      },
    },
  },
});
