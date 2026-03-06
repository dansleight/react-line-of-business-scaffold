import { defineConfig } from "vite";
import { NodePackageImporter } from "sass-embedded";
import { NodePackageImporter as SassPackageImporter } from "sass";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3011,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        importers: [
          new NodePackageImporter() as unknown as SassPackageImporter,
        ],
        quietDeps: true,
        silenceDeprecations: [
          "mixed-decls",
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
});
