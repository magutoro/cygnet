import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./src/manifest.js";

const browserTarget = process.env.CYGNET_BROWSER_TARGET === "safari" ? "safari" : "chrome";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    outDir: browserTarget === "safari" ? "dist-safari" : "dist",
    emptyOutDir: true,
  },
});
