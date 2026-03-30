# Cygnet Security Checklist

This document describes Cygnet's current security model, the production controls that must be verified outside the codebase, and the release checks we run before shipping.

Supporting docs:
- Production verification playbook: [`docs/security-production-verification.md`](docs/security-production-verification.md)
- Chrome Web Store privacy answers: [`docs/chrome-web-store-privacy.md`](docs/chrome-web-store-privacy.md)

## 1. Current security model

### Extension data
- Saved site passwords are stored only in the extension's local encrypted credential vault.
- Profile data and extension settings are stored in `chrome.storage.local`, not `chrome.storage.sync`.
- Compatibility reports are opt-in and structure-only. They are copied to the clipboard and are not uploaded automatically.

### Backend data
- Signed-in profile sync and uploaded resumes are stored in Supabase.
- Resume parsing is limited to the authenticated owner of the file path.
- Resume parsing returns extracted profile fields by default. Raw parsed text is not returned unless explicitly requested by the UI.

## 2. Required production verification

These items cannot be fully verified from the repo alone and must be confirmed in the Supabase, GitHub, Vercel, and admin dashboards.

### Supabase database
- Row Level Security is enabled on `profiles`, `resumes`, and any related views or functions.
- Policies allow a user to read, update, and delete only their own rows.
- No broad `authenticated` policies or public views remain from development.
- The unused `profile_additional_fields` view is not readable by normal client roles.

### Supabase Storage
- The `resumes` bucket is private.
- Storage policies enforce owner-only read, write, and delete access.
- Resume object paths are scoped per user.

### Secrets and admin access
- No service-role key is exposed in client-side web code or extension code.
- Supabase, Vercel, GitHub, and admin email accounts use MFA.
- Staff/admin access follows least privilege.
- Support or admin access to synced user data is auditable.

### Retention
- Resume files have a defined retention and deletion process.
- Parsed resume text is not retained beyond what is necessary for the feature.
- Backup and deletion behavior is documented internally.

## 3. Release checklist

Run these checks before publishing:

### Code and dependencies
- `pnpm audit` or equivalent dependency review
- extension permission review
- auth/session regression test
- resume upload/parse authorization test
- parser response check to confirm raw text is not returned by default

### Extension verification
- confirm profile/settings are stored in `chrome.storage.local`
- confirm no plain password remains in normal settings storage
- confirm saved passwords only work through the local encrypted vault
- confirm compatibility reports do not include field values or passwords

### Backend verification
- test with two users that one user cannot read or update another user's profile row
- test with two users that one user cannot access another user's resume row or storage object
- confirm resume parse route rejects a foreign `storagePath`
- confirm the `resumes` bucket remains private and PDF-only

## 4. Incident readiness

Maintain these basic response steps:

- security contact mailbox is monitored
- stale sessions/tokens can be revoked
- affected secrets can be rotated
- backup and restore steps are documented
- security incidents are logged with timeline, impact, and remediation

## 5. Security disclosures

Public-facing copy should stay accurate:

- Do say that Cygnet uses administrative, technical, and organizational safeguards.
- Do say that no method of transmission or storage is completely secure.
- Do not promise absolute security.
- Do not claim Cygnet can never be liable.
- Keep liability language in Terms of Service and have final language reviewed by counsel.
