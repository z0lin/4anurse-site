import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://4anurse.com',
  integrations: [],
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});
