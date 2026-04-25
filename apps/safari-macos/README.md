# Cygnet Safari Wrapper

This directory contains the repo-tracked macOS wrapper app used to ship the Safari version of Cygnet through the Mac App Store.

## What is here

- `project.yml`: the XcodeGen source of truth for the wrapper project
- `Cygnet Safari.xcodeproj`: the generated Xcode project checked into the repo
- `Shared (App)`: the small macOS host app shown in Applications
- `Shared (Extension)`: the Safari Web Extension target and the generated web extension bundle input

## Bundle IDs

The project currently uses a placeholder bundle ID prefix:

`com.example.cygnet`

Before submitting to App Store Connect, replace it with your owned reverse-DNS namespace by updating the `CYGNET_BUNDLE_ID_PREFIX` setting in `project.yml`, then regenerate the Xcode project.

## Build flow

1. Build and sync the Safari web extension resources:

```bash
./scripts/build-safari-web-extension.sh
```

2. Archive the macOS app with full Xcode installed:

```bash
./scripts/archive-safari-macos.sh
```

## Regenerating the Xcode project

If you edit `project.yml`, regenerate the Xcode project with XcodeGen:

```bash
xcodegen generate --spec apps/safari-macos/project.yml
```
