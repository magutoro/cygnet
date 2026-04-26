#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EXT_DIR="$ROOT_DIR/apps/extension"
RELEASE_DIR="$ROOT_DIR/releases"

VERSION="$(node -e "const fs=require('fs'); const p=process.argv[1]; console.log(JSON.parse(fs.readFileSync(p,'utf8')).version);" "$EXT_DIR/package.json")"
ZIP_PATH="$RELEASE_DIR/cygnet-chrome-extension-v$VERSION.zip"

echo "Building @cygnet/extension..."
cd "$ROOT_DIR"
pnpm --filter @cygnet/extension build

mkdir -p "$RELEASE_DIR"
rm -f "$ZIP_PATH"

echo "Packaging $ZIP_PATH ..."
cd "$EXT_DIR/dist"
zip -r "$ZIP_PATH" . -x "*.DS_Store"

echo "Done:"
echo "$ZIP_PATH"
