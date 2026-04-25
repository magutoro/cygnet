#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EXT_DIR="$ROOT_DIR/apps/extension"
SAFARI_APP_DIR="$ROOT_DIR/apps/safari-macos"
RELEASE_DIR="$ROOT_DIR/releases/safari"
RELEASE_BUNDLE_DIR="$RELEASE_DIR/Cygnet.safari-web-extension"
RESOURCE_BUNDLE_DIR="$SAFARI_APP_DIR/Shared (Extension)/Resources/ExtensionBundle"

VERSION="$(node -e "const fs=require('fs'); const p=process.argv[1]; console.log(JSON.parse(fs.readFileSync(p,'utf8')).version);" "$EXT_DIR/package.json")"

echo "Building Safari web extension bundle..."
cd "$ROOT_DIR"
pnpm --filter @cygnet/extension build:safari

mkdir -p "$RELEASE_DIR" "$RESOURCE_BUNDLE_DIR"
rm -rf "$RELEASE_BUNDLE_DIR"
mkdir -p "$RELEASE_BUNDLE_DIR"

echo "Syncing Safari web extension resources..."
rsync -a --delete --exclude '.DS_Store' "$EXT_DIR/dist-safari/" "$RELEASE_BUNDLE_DIR/"
rsync -a --delete --exclude '.DS_Store' "$EXT_DIR/dist-safari/" "$RESOURCE_BUNDLE_DIR/"

echo "Safari web extension bundle ready:"
echo "$RELEASE_BUNDLE_DIR"
echo "Safari wrapper resources updated:"
echo "$RESOURCE_BUNDLE_DIR"
echo "Version:"
echo "$VERSION"
