import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://kinland.helltop.net",
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough",
  }),
});
