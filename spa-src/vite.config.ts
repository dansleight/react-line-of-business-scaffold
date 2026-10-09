import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.BUILD_BUILDNUMBER ?? "build-0"),
  },
  server: {
    port: 3011,
    proxy: {
      "/api": {
        target: "http://localhost:5011",
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
        secure: false,
      },
      "/hub": {
        target: "http://localhost:5011",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        loadPaths: [path.resolve(__dirname, "node_modules")],
        // Bootstrap 5.3 and Bootswatch still use @import. quietDeps hides
        // their other Sass deprecations; this is the one our files must
        // still use to load those packages. Drop it when Bootstrap 6 ships.
        silenceDeprecations: ["import"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
