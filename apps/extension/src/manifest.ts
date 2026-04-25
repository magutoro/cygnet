import { defineManifest } from "@crxjs/vite-plugin";

const browserTarget = process.env.CYGNET_BROWSER_TARGET === "safari" ? "safari" : "chrome";
const icons = {
  16: "icons/icon16.png",
  32: "icons/icon32.png",
  48: "icons/icon48.png",
  64: "icons/icon64.png",
  96: "icons/icon96.png",
  128: "icons/icon128.png",
  256: "icons/icon256.png",
  512: "icons/icon512.png",
} as const;

export default defineManifest({
  manifest_version: 3,
  name: "Cygnet",
  version: "0.1.1",
  description: "Japanese-focused job application autofill extension.",
  icons,
  permissions:
    browserTarget === "safari"
      ? ["storage", "activeTab", "scripting"]
      : ["storage", "activeTab", "scripting", "identity"],
  host_permissions: ["<all_urls>"],
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
    },
  ],
  action: {
    default_icon: icons,
  },
  web_accessible_resources: [
    {
      resources: ["icons/launcher32.png"],
      matches: ["<all_urls>"],
    },
  ],
  options_page: "src/options/index.html",
  externally_connectable: {
    matches: [
      "https://cygnet-two.vercel.app/*",
    ],
  },
  commands: {
    "run-autofill": {
      suggested_key: {
        default: "Ctrl+Shift+Y",
        mac: "Command+Shift+Y",
      },
      description: "Autofill the active job application form",
    },
  },
});
