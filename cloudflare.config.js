/**
 * Cloudflare Workers configuration for Kinland website
 * This configures the build process to output a Cloudflare Worker
 */

import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {viteStaticCopy} from "vite-plugin-static-copy";

export default defineConfig({
  // Cloudflare Workers target
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,

    // Output for Cloudflare Workers
    lib: {
      entry: "src/worker.js",
      name: "KinlandWorker",
      formats: ["es"],
      fileName: "worker"
    },

    rollupOptions: {
      external: [],
      output: {
        // Ensure all dependencies are bundled for Workers
        globals: {},
        // Don't use dynamic imports in Workers
        inlineDynamicImports: true
      }
    }
  },

  // Plugins
  plugins: [
    react(),

    // Copy static assets
    viteStaticCopy({
      targets: [
        {
          src: "site/static/**/*",
          dest: "./"
        },
        {
          src: "site/content/**/*",
          dest: "./content"
        },
        {
          src: "site/data/**/*",
          dest: "./data"
        }
      ]
    })
  ],

  // Optimize for Workers
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "date-fns"
    ]
  }
});
