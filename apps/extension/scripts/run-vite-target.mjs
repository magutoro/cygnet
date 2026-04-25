#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const [, , command = "build", target = "chrome"] = process.argv;
const normalizedTarget = target === "safari" ? "safari" : "chrome";
const normalizedCommand = command === "dev" ? "build" : "build";
const args = [normalizedCommand];
const viteBinPath = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));

if (command === "dev") {
  args.push("--watch", "--mode", "development");
}

const result = spawnSync(process.execPath, [viteBinPath, ...args], {
  stdio: "inherit",
  env: {
    ...process.env,
    CYGNET_BROWSER_TARGET: normalizedTarget,
    VITE_BROWSER_TARGET: normalizedTarget,
  },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
