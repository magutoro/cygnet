#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="$ROOT_DIR/apps/safari-macos"
PROJECT_PATH="$PROJECT_DIR/Cygnet Safari.xcodeproj"
SCHEME="Cygnet Safari"
ARCHIVE_PATH="$ROOT_DIR/releases/safari/Cygnet Safari.xcarchive"

"$ROOT_DIR/scripts/build-safari-web-extension.sh"

if ! xcodebuild -version >/dev/null 2>&1; then
  echo "Full Xcode is required to archive the Safari wrapper app."
  echo "Install Xcode, run 'sudo xcode-select -s /Applications/Xcode.app', then rerun this script."
  exit 1
fi

if [[ ! -d "$PROJECT_PATH" ]]; then
  echo "Safari Xcode project not found:"
  echo "$PROJECT_PATH"
  exit 1
fi

mkdir -p "$(dirname "$ARCHIVE_PATH")"
rm -rf "$ARCHIVE_PATH"

xcodebuild \
  -project "$PROJECT_PATH" \
  -scheme "$SCHEME" \
  -configuration Release \
  -destination "generic/platform=macOS" \
  -archivePath "$ARCHIVE_PATH" \
  archive

echo "Safari macOS archive created:"
echo "$ARCHIVE_PATH"
