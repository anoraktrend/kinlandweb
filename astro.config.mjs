import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tina from "@tinacms/astro/integration";
import { tinaAdminDevRedirect } from "@tinacms/astro/vite";

export default defineConfig({
  site: "https://kinland.helltop.net",
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough",
  }),
  integrations: [tina()],
  vite: {
    plugins: [tinaAdminDevRedirect()],
    ssr: {
      noExternal: ["@tinacms/astro", "@tinacms/bridge"],
    },
  },
});
