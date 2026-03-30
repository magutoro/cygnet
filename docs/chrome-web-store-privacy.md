# Chrome Web Store Privacy and Permission Answers

Use this document as the ready-to-paste source for the Chrome Web Store privacy and permission submission.

## 1. Product summary

Single purpose:
- Cygnet helps users autofill Japanese job application forms using profile information they choose to save.

High-level data model:
- profile data can be stored locally in the extension
- users can optionally sign in to sync profile and resume data through Cygnet's backend
- saved login passwords remain local-only in the encrypted extension vault

## 2. What data Cygnet handles

Handled data categories:
- profile information entered by the user
  - name
  - email
  - phone
  - address
  - birth date
  - education history
  - work history
  - links
  - notes
- uploaded resume files and extracted profile fields from those resumes
- extension preferences and panel state
- page/form structure needed for autofill matching
  - labels
  - placeholders
  - input names
  - surrounding structure

Not handled as synced backend data:
- saved login passwords are not uploaded to Cygnet

## 3. What is local-only vs synced

### Local-only
- saved login passwords
- encrypted credential vault contents
- extension-only UI state
- local extension settings and profile copy on the current browser

### Synced to backend when the user chooses account sync
- profile data
- uploaded resume files
- extracted profile fields from resume parsing

### Human access limits
Human access to synced profile or resume data is limited to:
- user-requested support
- security or abuse investigation
- legal compliance

## 4. Privacy form answer guidance

### Does the extension collect personal information?
Recommended answer:
- Yes

### What personal information is handled?
Recommended answer:
- Name
- Email address
- Phone number
- Physical address
- Education information
- Employment information
- User-generated content such as resume files and profile notes

### Is the data sold?
Recommended answer:
- No

### Is the data used for advertising or data broker purposes?
Recommended answer:
- No

### Is the data used only for the extension's single purpose?
Recommended answer:
- Yes

### Is the data optional or user-provided?
Recommended answer:
- Yes. Users choose what to enter, sync, upload, and autofill.

## 5. Permission justifications

### `storage`
Why needed:
- stores extension settings and the user's local profile copy
- stores local encrypted credential metadata
- stores overlay/panel state and local extension preferences

Suggested store wording:
- Cygnet uses `storage` to save the user's autofill settings, local profile data, and local extension state. Saved login passwords remain in a separate local encrypted vault.

### `identity`
Why needed:
- supports Google sign-in through the extension
- connects the extension to the user's Cygnet account for optional sync

Suggested store wording:
- Cygnet uses `identity` so users can sign in with Google and optionally sync their profile and resumes across devices.

### `activeTab`
Why needed:
- lets the user explicitly trigger autofill on the current job application page

Suggested store wording:
- Cygnet uses `activeTab` to interact with the current job application page when the user chooses to autofill.

### `scripting`
Why needed:
- supports running autofill logic and page interaction code on supported job application forms

Suggested store wording:
- Cygnet uses `scripting` to run autofill logic on job application forms the user opens and chooses to use with the extension.

### `host_permissions` on `"<all_urls>"`
Why needed:
- Japanese job application forms exist across many different employer and platform domains
- the extension must inspect form structure on the current application page to determine field mappings
- autofill is triggered by the user, not run for advertising or tracking purposes

Suggested store wording:
- Cygnet requests host access because Japanese job application forms are spread across many employer and recruiting domains. The extension reads form structure such as labels, placeholders, field names, and nearby layout on the page the user is applying on so it can match saved profile data to the correct fields.

## 6. Important disclosures to keep consistent

These statements should match the Privacy Policy, consent screen, Terms, and store listing.

- saved login passwords remain local-only in the encrypted extension vault
- profile and resume sync is optional
- resume parsing is for extracting profile information from uploaded resumes
- compatibility reports are opt-in and structure-only
- compatibility reports are copied locally and are not automatically uploaded
- autofill reads form structure on pages where the user chooses to use the extension
- Cygnet does not sell personal data
- Cygnet does not use synced profile or resume data for advertising

## 7. Submission checklist

Before submitting to the Chrome Web Store, confirm:
- the manifest no longer includes development-only `externally_connectable` origins
- public privacy answers match:
  - `/privacy`
  - `/auth/consent`
  - `/terms`
- the extension popup-first behavior is in place
- compatibility reporting is opt-in and structure-only
- saved passwords are no longer present in normal profile/settings storage
