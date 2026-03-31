# Chrome Web Store Submission Kit

This file is the copy/paste source for your first Chrome Web Store submission.

## 1. Upload file

Upload this ZIP to the Chrome Web Store:

`/Users/maaku/Documents/Cygnet/releases/cygnet-chrome-extension-v0.1.0.zip`

If you rebuild later, regenerate the ZIP with:

```bash
/Users/maaku/Documents/Cygnet/scripts/build-chrome-release.sh
```

## 2. Store listing fields

### Item name

```text
Cygnet
```

### Category

```text
Productivity
```

### Language

```text
Japanese
```

### Summary

```text
日本の就活・応募フォームを自動入力する Chrome 拡張機能です。
```

### Detailed description

```text
Cygnet は、日本の就活・応募フォームを自動入力するための Chrome 拡張機能です。

氏名、住所、学歴、職歴、資格など、就活で何度も入力する情報を保存し、現在開いている応募ページの入力欄に合わせて呼び出せます。

主な機能:
- 日本の就活・応募フォーム向け自動入力
- 拡張機能アイコンから現在のページのサイドパネルを開いて入力
- 氏名、住所、学歴、職歴などのプロフィール管理
- 任意のアカウント同期によるプロフィール・履歴書の保存
- 履歴書アップロードとプロフィール抽出の補助
- 保存済みログイン情報用のローカル暗号化ボルト

使い方:
- まず Cygnet のダッシュボードにプロフィール情報を保存します。
- 応募ページで拡張機能アイコンをクリックし、サイドパネルから「このページを入力」を選びます。
- 拡張機能がラベル、プレースホルダー、入力欄名、周辺レイアウトなどのフォーム構造を読み取り、保存済みプロフィールを適切な欄に対応付けます。
- 実際に入力するのは、ユーザーが Cygnet を使うことを選んだときだけです。

プライバシーとデータの扱い:
- 保存済みログインパスワードは拡張機能内の暗号化ボルトにローカル保存され、Cygnet にアップロードされません。
- プロフィールや履歴書の同期は任意です。
- 履歴書データは、ダッシュボード同期やプロフィール抽出などの機能提供のためにのみ利用されます。
- Cygnet は個人データを販売せず、同期済みプロフィールや履歴書データを広告目的で利用しません。

補足:
- Cygnet の中心機能は Chrome 拡張機能によるフォーム入力支援です。
- ダッシュボードは保存するプロフィール情報を管理するための補助機能です。
- i-web や Axol を含む日本の採用フローや企業エントリーページでの入力負担を減らすことを目的としています。
```

### Support URL

```text
https://cygnet-two.vercel.app/contact
```

### Website URL

```text
https://cygnet-two.vercel.app
```

### Privacy policy URL

```text
https://cygnet-two.vercel.app/privacy
```

## 3. Privacy/permissions copy

Use:

- `/Users/maaku/Documents/Cygnet/docs/chrome-web-store-privacy.md`

That file already contains the ready-to-paste answers for:

- privacy data declarations
- `storage`
- `identity`
- `activeTab`
- `scripting`
- `host_permissions` on `"<all_urls>"`

## 4. Reviewer notes / test instructions

Use:

- `/Users/maaku/Documents/Cygnet/docs/chrome-web-store-reviewer-notes.md`

Chrome’s current docs say the Test instructions tab is not required unless restricted credentials are needed, but it still helps reviewers understand the flow. Source:

- [Provide test instructions](https://developer.chrome.com/docs/webstore/cws-dashboard-test-instructions)

## 5. Required image assets

Chrome’s official current image guidance says you must provide:

- a 128x128 extension icon in the ZIP
- one small promo image: `440x280`
- at least 1 screenshot, preferably up to 5
- screenshots must be `1280x800` or `640x400`, with `1280x800` preferred

Source:

- [Supplying Images](https://developer.chrome.com/docs/webstore/images/)

### Screenshot plan

Use these 5 screenshots if possible. The first screenshot should show the extension itself, not the website alone:

1. In-page Cygnet side panel signed in, showing `このページを入力` and `プロフィールを編集`
2. Extension-driven autofill on a real Japanese job application form
3. In-page Cygnet side panel visible on a real job application page
4. Dashboard profile editor as a companion screen for saved profile data
5. Resume manager or local credential vault UI, only if polished enough for the listing

### Promo image plan

For the required `440x280` promo image:

- show the Cygnet name
- show one concise message such as `日本の応募フォームを自動入力`
- use the extension side-panel or form-autofill motif, not a landing-page hero
- avoid tiny text
- do not use website-only or marketing-only imagery

## 6. Final submission checklist

Before you click submit:

1. Upload the ZIP from `releases/`
2. Paste the listing text from this file
3. Paste the privacy answers from `chrome-web-store-privacy.md`
4. Paste the reviewer notes from `chrome-web-store-reviewer-notes.md`
5. Upload the promo image and screenshots
6. Confirm the URLs:
   - support
   - website
   - privacy
7. Confirm the extension still builds locally
8. Confirm your two-user security verification is recorded in `docs/security-production-verification.md`
9. Confirm the first screenshot clearly shows extension UI
10. Confirm none of the uploaded media is website-first or marketing-first
11. Review `/Users/maaku/Documents/Cygnet/docs/chrome-web-store-resubmission-checklist.md`
