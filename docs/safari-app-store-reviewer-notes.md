# Safari App Store Reviewer Notes

Use this text for App Review notes when submitting the Safari macOS app.

```text
Cygnet Safari is a Safari Web Extension packaged inside a macOS app.

Core feature:
- The extension helps users autofill Japanese job application forms using profile data they previously saved.

How to review:
1. Install and enable the Safari extension from the packaged macOS app.
2. Open any supported job application page in Safari.
3. Click the Cygnet extension icon to open the UI.
4. Use "このページを入力" to trigger autofill on the active page.

Authentication:
- Safari v1 does not use in-extension OAuth.
- If account sync is needed, the extension opens the Cygnet web dashboard for login.
- After the user signs in on the dashboard, the webpage sends the session back to the installed extension using Safari's webpage-to-extension messaging.

Permissions:
- Broad website access is required because the extension supports many unrelated Japanese recruiting and application domains.
- The extension only fills fields when the user explicitly opens the extension UI or triggers autofill.

Privacy:
- Saved login passwords remain encrypted locally in the extension and are not uploaded.
- Cloud sync for profile and resume data is optional.
```
