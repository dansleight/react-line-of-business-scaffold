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
        silenceDeprecations: [
          "legacy-js-api",
          "color-functions",
          "import",
          "global-builtin",
          "slash-div",
          "if-function",
        ],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
