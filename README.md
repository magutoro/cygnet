# Cygnet

Autofill Japanese job application forms with your saved profile. A browser extension and web dashboard built for foreigners navigating shuukatsu and Japanese hiring portals.

## What it does

Cygnet saves your personal details once — kanji/kana/English names, address, phone, email, education, links — then fills them into Japanese job application forms with a single click. It handles the annoying parts: furigana generation, split postal codes, address formatting, birth date dropdowns, and the dozens of field variations across major Japanese job sites.

Sign in with Google to sync your profile across devices, manage resumes, and edit your information from the web dashboard.

## Repository structure

```
cygnet/
├── apps/
│   ├── extension/       Chrome + Safari MV3 extension build (Vite + React + crxjs)
│   ├── safari-macos/    macOS Safari wrapper app + Xcode project
│   └── web/             Website & dashboard (Next.js 15 + Tailwind CSS)
├── packages/
│   └── shared/          Shared TypeScript types, utilities, and DB helpers
├── supabase/
│   └── migrations/      Database schema and RLS policies
└── legacy/              Original static prototype (archived)
```

This is a PNPM monorepo orchestrated with Turborepo.

## Prerequisites

- Node.js 20+
- PNPM 9+
- Full Xcode for archiving the Safari macOS app

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Supabase and Google OAuth are already set up for this project. Ask a team member for the credentials, then create the env files:

**Website** — create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=<ask team>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ask team>
NEXT_PUBLIC_CHROME_EXTENSION_ID=<optional Chrome fallback extension id>
NEXT_PUBLIC_SAFARI_EXTENSION_ID=<optional Safari extension id>
OPENAI_API_KEY=sk-...  # optional, enables AI resume parsing
```

**Extension** — create `apps/extension/.env`:

```env
VITE_SUPABASE_URL=<ask team>
VITE_SUPABASE_ANON_KEY=<ask team>
VITE_GOOGLE_CLIENT_ID=<ask team>
VITE_WEB_DASHBOARD_URL=http://localhost:3000/dashboard
VITE_BROWSER_TARGET=chrome
```

See `.env.example` for a combined reference.

### 3. Build and run

```bash
# Build everything
pnpm build

# Run the website locally
pnpm dev:web        # http://localhost:3000

# Build the Chrome extension
pnpm build:ext

# Build the Safari extension bundle and sync it into the macOS wrapper
pnpm prepare:safari:webext
```

### 4. Load the Chrome extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `apps/extension/dist/` folder

### 5. Extension development mode

```bash
pnpm dev:ext
```

Runs `vite build --watch` so changes rebuild automatically. Reload the extension in Chrome after each rebuild.

### 6. Safari macOS packaging

```bash
# Build the Safari web extension bundle
pnpm build:ext:safari

# Sync the Safari bundle into the repo-tracked macOS wrapper
pnpm prepare:safari:webext

# Archive the macOS app (requires full Xcode)
pnpm archive:safari
```

The Safari wrapper project lives in `apps/safari-macos/`.

## Features

### Browser extension

- **One-click autofill** — fills forms from the side panel or with `Cmd+Shift+Y` / `Ctrl+Shift+Y`
- **Smart field detection** — matches fields by name, id, label text, placeholder, autocomplete attributes, ARIA labels, and surrounding DOM structure
- **Japanese name handling** — kanji, katakana, hiragana, and romaji variants with automatic furigana generation
- **Split field support** — handles split postal codes (3+4), phone numbers (3+4+4), birth date dropdowns (year/month/day), and split email fields (local+domain)
- **Select/radio matching** — maps profile values to dropdown options and radio buttons using alias tables for gender, education type, and university names
- **In-page profile panel** — opens from extension icon click; draggable overlay with copy-to-clipboard for individual fields
- **Profile management** — save, edit, reset, and export your profile as JSON
- **Google sign-in** — authenticate via Google to sync profile data to the cloud
- **One-login bridge (localhost)** — if logged in on the web dashboard, sync that session into the extension
- **Cloud sync** — push/pull profile between local storage and Supabase
- **Offline-first** — works fully offline via `chrome.storage.sync`, cloud sync is optional
- **Safari login bridge** — Safari opens the web dashboard for login and imports the session back into the extension

### Web dashboard

- **Google OAuth login** — sign in with your Google account
- **Profile editor** — edit all 29 autofill fields from the browser
- **Resume upload** — upload PDF resumes to Supabase Storage
- **Resume parsing** — extracts text from PDFs; optionally uses GPT-4o-mini to structure data into profile fields
- **Cross-device sync** — profile changes on the web are available in the extension and vice versa

## Tech stack

| Component | Technology |
|-----------|------------|
| Extension | Vite, React 19, TypeScript, @crxjs/vite-plugin, MV3 |
| Safari wrapper | macOS app + Safari Web Extension target (Xcode) |
| Website | Next.js 15 (App Router), React 19, Tailwind CSS, TypeScript |
| Auth | Supabase Auth with Google OAuth (web + extension) |
| Database | Supabase (Postgres) with Row-Level Security |
| Storage | Supabase Storage (resume files) |
| Resume parsing | pdf-parse + OpenAI GPT-4o-mini (optional) |
| Shared | TypeScript library with profile types, kana utilities, DB converters |
| Monorepo | PNPM workspaces, Turborepo |
| CI | GitHub Actions |

## Project scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm build:ext` | Build the Chrome extension |
| `pnpm build:ext:safari` | Build the Safari web extension bundle |
| `pnpm build:web` | Build the website |
| `pnpm dev:web` | Start the website dev server |
| `pnpm dev:ext` | Watch-build the extension |
| `pnpm prepare:safari:webext` | Build Safari assets and sync them into the macOS wrapper |
| `pnpm archive:safari` | Archive the Safari macOS app with Xcode |
| `pnpm typecheck` | Run TypeScript checks across all packages |
| `pnpm clean` | Remove all build artifacts |

## Database schema

The database is already running on Supabase. The schema definition lives in `supabase/migrations/001_initial.sql` for reference:

- **`profiles`** — one row per user with all 29 autofill fields, auto-created on signup
- **`resumes`** — file metadata with parsed text storage
- **`resumes` storage bucket** — private bucket for PDF uploads (10 MB limit)
- **Row-Level Security** — users can only access their own data

## Privacy

Cygnet stores your profile data locally in Chrome's extension storage by default. When you sign in with Google, your profile and resumes are stored in a private Supabase database secured with Row-Level Security — only you can access your own data. No analytics or telemetry is collected. See the full [privacy policy](/privacy) for details.

## License

All rights reserved.
