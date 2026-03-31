# Chrome Web Store Reviewer Notes

Use this in the Chrome Web Store review notes or Test instructions field.

```text
Cygnet is a Chrome extension for autofilling Japanese job application forms.

Single purpose:
Cygnet helps users autofill Japanese job application forms using profile information they choose to save.

Core product being reviewed:
- The core functionality is the Chrome extension opening an in-page side panel and autofill flow on job application pages.
- The dashboard is a companion interface used to save and manage profile data for the extension.
- The updated screenshots are extension-first and reflect the extension's current observed functionality.

No paid account is required. The extension can be tested with a normal Google sign-in.

Suggested review flow:
1. Install the extension.
2. Click the extension icon to open the in-page Cygnet side panel on the current job application page.
3. Sign in with Google.
4. Click "プロフィールを編集" to open the Cygnet dashboard.
5. Save some profile information such as name, address, phone, education, and graduation year/month.
6. Open a job application page with standard form inputs.
7. Click "このページを入力" from the in-page side panel.
8. Verify that Cygnet matches saved profile data to visible application fields.

Important notes:
- Cygnet reads form structure such as labels, placeholders, field names, and nearby layout on the current job application page in order to match saved profile data to the correct fields.
- Cygnet does not run as a generic marketing website experience. The website is a companion dashboard for managing saved data used by the extension.
- Saved login passwords are local-only and remain in the extension's encrypted vault. They are not uploaded to Cygnet.
- Profile and resume sync are optional.
- Compatibility reports are opt-in, structure-only, and copied locally rather than uploaded automatically.

Permission summary:
- storage: save extension settings, local profile copy, and local encrypted vault metadata
- identity: support Google sign-in for optional account sync
- activeTab + scripting: run autofill on the current page the user chooses to use with the extension
- host access on all URLs: Japanese job application forms exist across many employer and recruiting domains, so the extension needs to inspect the structure of the current job application page to map fields correctly
```
