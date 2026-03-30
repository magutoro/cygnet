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
保存したプロフィール情報を使って、日本の就活・応募フォーム入力を効率化します。
```

### Detailed description

```text
Cygnet は、日本の新卒採用サイトや企業エントリーフォーム向けの自動入力支援ツールです。

氏名、住所、学歴、職歴、資格、志望動機作成の下書きに使う情報など、就活で何度も入力する内容を一度まとめて保存し、応募ページ上の入力欄に合わせて呼び出せます。

主な機能:
- 日本の就活・応募フォーム向け自動入力
- 氏名、住所、学歴、職歴などのプロフィール管理
- 端末間で使える任意のアカウント同期
- 履歴書アップロードとプロフィール抽出の補助
- 保存済みログイン情報用のローカル暗号化ボルト

使い方:
- まず Cygnet にプロフィール情報を保存します。
- 応募ページで Cygnet を使うと、拡張機能がラベル、プレースホルダー、入力欄名、周辺レイアウトなどのフォーム構造を読み取り、保存済みプロフィールを適切な欄に対応付けます。
- 実際に入力するのは、ユーザーが Cygnet を使うことを選んだときだけです。

プライバシーとデータの扱い:
- 保存済みログインパスワードは拡張機能内の暗号化ボルトにローカル保存され、Cygnet にアップロードされません。
- プロフィールや履歴書の同期は任意です。
- 履歴書データは、ダッシュボード同期やプロフィール抽出などの機能提供のためにのみ利用されます。
- Cygnet は個人データを販売せず、同期済みプロフィールや履歴書データを広告目的で利用しません。

Cygnet は、i-web や Axol を含む日本の採用フローや企業エントリーページでの入力負担を減らすことを目的としています。
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

Use these 5 screenshots if possible:

1. Popup signed in, showing `このページを入力` and `プロフィールを編集`
2. Side popup/launcher visible on a real Japanese job application page
3. Dashboard profile editor with education and work-history sections filled
4. Autofill result on a supported form such as `i-web` or `Axol`
5. Resume manager or local credential vault UI, only if polished enough for the listing

### Promo image plan

For the required `440x280` promo image:

- show the Cygnet name
- show one concise message such as `Japanese Job Form Autofill`
- use the extension popup or form-autofill motif, not a plain screenshot
- avoid tiny text

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
