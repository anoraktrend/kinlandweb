import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

const isDev = process.env.NODE_ENV !== "production";

let tinaIntegration, tinaAdminDevRedirect;
if (isDev) {
  tinaIntegration = (await import("@tinacms/astro/integration")).default;
  tinaAdminDevRedirect = (await import("@tinacms/astro/vite")).tinaAdminDevRedirect;
}

export default defineConfig({
  site: "https://kinland.helltop.net",
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough",
  }),
  integrations: isDev ? [tinaIntegration()] : [],
  vite: {
    plugins: isDev ? [tinaAdminDevRedirect()] : [],
    ssr: {
      noExternal: ["@tinacms/astro", "@tinacms/bridge"],
    },
  },
});
