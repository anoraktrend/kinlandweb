/**
 * Cloudflare Workers configuration for Kinland website
 * This configures the build process to output a Cloudflare Worker
 */

import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {viteStaticCopy} from "vite-plugin-static-copy";
import {resolve} from "path";

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
      external: ['__STATIC_CONTENT_MANIFEST'],
      output: {
        // Ensure all dependencies are bundled for Workers
        globals: {},
        // Don't use dynamic imports in Workers
        inlineDynamicImports: true,
        // Cloudflare Workers specific output options
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js"
      }
    }
  },

  // Plugins
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'dist-hugo/*',
          dest: './'
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
  },

  // Resolve aliases for easier imports
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@site": resolve(__dirname, "site"),
      "@public": resolve(__dirname, "public")
    }
  }
});
