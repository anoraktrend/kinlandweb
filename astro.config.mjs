import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://kinland.helltop.net',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
});
