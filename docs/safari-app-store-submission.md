# Safari App Store Submission Kit

This file is the copy/paste source for the first Safari / Mac App Store submission.

## 1. Build artifacts

Build and sync the Safari extension bundle into the macOS wrapper:

```bash
/Users/maaku/Documents/Cygnet/scripts/build-safari-web-extension.sh
```

Archive the macOS app with full Xcode installed:

```bash
/Users/maaku/Documents/Cygnet/scripts/archive-safari-macos.sh
```

The unpacked Safari web extension bundle will be available at:

`/Users/maaku/Documents/Cygnet/releases/safari/Cygnet.safari-web-extension`

The macOS archive output will be created at:

`/Users/maaku/Documents/Cygnet/releases/safari/Cygnet Safari.xcarchive`

## 2. App Store Connect listing fields

### App name

```text
Cygnet Safari
```

### Subtitle

```text
日本の応募フォームを自動入力
```

### Category

```text
Productivity
```

### Description

```text
Cygnet Safari は、日本の就活・応募フォームを自動入力するための Safari 拡張機能です。

氏名、住所、学歴、職歴、資格など、就活で何度も入力する情報を保存し、現在開いている応募ページの入力欄に合わせて呼び出せます。

主な機能:
- 日本の就活・応募フォーム向け自動入力
- 拡張機能アイコンから現在のページで入力支援 UI を表示
- 氏名、住所、学歴、職歴などのプロフィール管理
- Web ダッシュボード経由のログインと任意の同期
- 履歴書アップロードとプロフィール抽出の補助
- 保存済みログイン情報用のローカル暗号化ボルト

使い方:
- まず Cygnet のダッシュボードにプロフィール情報を保存します。
- 応募ページで拡張機能アイコンをクリックし、「このページを入力」を選びます。
- 拡張機能がラベル、プレースホルダー、入力欄名、周辺レイアウトなどのフォーム構造を読み取り、保存済みプロフィールを適切な欄に対応付けます。
- Safari 版では、ログインが必要な場合に Web ダッシュボードを開いてアカウント接続を行います。

プライバシー:
- 保存済みログインパスワードは拡張機能内の暗号化ボルトにローカル保存され、Cygnet にアップロードされません。
- プロフィールや履歴書の同期は任意です。
- Cygnet は個人データを販売せず、同期済みデータを広告目的で利用しません。
```

### Keywords

```text
autofill,job application,japan,shuukatsu,forms
```

### Support URL

```text
https://cygnet-two.vercel.app/contact
```

### Marketing URL

```text
https://cygnet-two.vercel.app
```

### Privacy Policy URL

```text
https://cygnet-two.vercel.app/privacy
```

## 3. Bundle IDs and signing

Before creating the App Store Connect record, replace the placeholder bundle ID prefix in:

- `/Users/maaku/Documents/Cygnet/apps/safari-macos/project.yml`

Current placeholder:

```text
com.example.cygnet
```

Then regenerate the Xcode project and set the Apple Developer team in Xcode.

## 4. Review and privacy copy

Use these source files:

- `/Users/maaku/Documents/Cygnet/docs/safari-app-store-privacy.md`
- `/Users/maaku/Documents/Cygnet/docs/safari-app-store-reviewer-notes.md`

## 5. Required screenshots

Prepare Mac App Store screenshots that show the extension UI, not just the website:

1. Cygnet popup in Safari on a real job application page
2. In-page Cygnet panel on a Japanese application form
3. Autofill result on a supported form
4. Web dashboard profile editor
5. macOS wrapper app screen with the “Open Safari Extension Settings” action

## 6. Final checklist

1. Replace the placeholder bundle ID prefix with the owned reverse-DNS namespace
2. Run `build-safari-web-extension.sh`
3. Open `apps/safari-macos/Cygnet Safari.xcodeproj` in full Xcode
4. Set signing team and verify automatic signing
5. Archive the app with `archive-safari-macos.sh`
6. Upload the archive to App Store Connect
7. Paste the listing copy from this file
8. Paste the privacy answers from `safari-app-store-privacy.md`
9. Paste the reviewer notes from `safari-app-store-reviewer-notes.md`
10. Upload screenshots that clearly show Safari extension UI
