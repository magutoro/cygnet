import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Cygnet",
  version: "0.1.0",
  description: "Japanese-focused job application autofill extension.",
  icons: {
    16: "icons/icon16.png",
    32: "icons/icon32.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png",
  },
  permissions: ["storage", "activeTab", "scripting", "identity"],
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
    default_icon: {
      16: "icons/icon16.png",
      32: "icons/icon32.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    },
  },
  web_accessible_resources: [
    {
      resources: ["icons/icon16.png", "icons/icon32.png", "icons/icon48.png", "icons/icon128.png"],
      matches: ["<all_urls>"],
    },
  ],
  options_page: "src/options/index.html",
  externally_connectable: {
    matches: [
      "https://cygnet-two.vercel.app/*",
      "http://localhost/*",
      "http://127.0.0.1/*",
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
