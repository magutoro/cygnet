# Safari App Store Privacy Notes

Use this document as the source for App Store privacy answers and internal review notes.

## Data handling summary

- Profile data can be stored locally in the extension.
- If the user signs in and enables sync, profile data and resumes are stored in Cygnet's secured Supabase backend.
- Saved login passwords remain encrypted locally in the extension and are not uploaded to Cygnet.
- Cygnet does not sell personal data and does not use synced data for advertising.

## App Privacy details

### Contact info

- Email address: collected only if the user signs in
- Purpose: app functionality, account management, and user-requested support

### User content

- Profile data entered by the user
- Resume files and parsed resume text, if the user uploads them
- Purpose: autofill, dashboard editing, sync, and resume management chosen by the user

### Sensitive info

- Resume contents may include sensitive personal information
- Purpose: user-requested resume upload, parsing, and sync

### Diagnostics

- No analytics or advertising tracking is included in the product as shipped from this repo

## Tracking

- Cygnet does not track users across apps or websites for advertising

## Permission rationale

### Website access / `<all_urls>`

Cygnet requests broad website access because the core product feature is detecting and filling many different Japanese recruiting and application forms across unrelated company domains. The extension acts only when the user opens the extension UI or triggers autofill.

### Storage

Used to store the autofill profile, settings, local sync state, and the encrypted local credential vault.

### Scripting / active tab

Used to inject or activate the in-page UI and run autofill logic on the current page the user chose to use with Cygnet.
