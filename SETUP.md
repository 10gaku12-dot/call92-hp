# CALL92 公式サイト — セットアップガイド

制作: TEZUIntelligence

---

## ファイル構成

```
CALL92/
├── index.html          ← メインページ（全セクション）
├── css/
│   └── style.css       ← 全スタイル
├── js/
│   └── main.js         ← インタラクション・フォーム処理
├── images/             ← 写真をここに入れる
│   ├── hero.jpg        ← ヒーロー背景（宿の正面外観）★最重要
│   ├── entrance.jpg    ← Aboutセクション（玄関）
│   ├── exterior.jpg    ← 施設ギャラリー メイン（外観）
│   ├── stove.jpg       ← 施設ギャラリー（薪ストーブ）
│   └── outdoor.jpg     ← 施設ギャラリー（屋外エリア）
├── vercel.json         ← Vercelデプロイ設定
└── SETUP.md            ← このファイル
```

---

## Step 1: 写真を差し替える

`images/` フォルダに以下の写真を入れてください（ファイル名は合わせること）:

| ファイル名 | 推奨内容 | 推奨サイズ |
|---|---|---|
| `hero.jpg` | 宿の正面外観（石積み+漆喰の建物） | 1920×1080px以上 |
| `entrance.jpg` | 玄関ドア・看板（CALL92のサイン） | 1200×900px |
| `exterior.jpg` | 建物全体または庭からの外観 | 1200×900px |
| `stove.jpg` | アンティーク薪ストーブ | 800×600px |
| `outdoor.jpg` | 屋外テラス・庭 | 800×600px |

> 写真はそのまま渡してもらったチャット画像4枚が使えます。
> 保存してリネームして images/ フォルダに入れるだけです。

---

## Step 2: テキスト・情報を実際の内容に差し替える

`index.html` 内で `TODO:` と書かれている箇所を検索して差し替えてください:

- **住所**: `〒399-9301 長野県北安曇郡白馬村 ○○○-○○`
- **電話番号**: `000-000-0000`
- **メールアドレス**: `info@call92.com`
- **受付時間**: `9:00〜21:00`
- **チェックイン/アウト時間**: `15:00 / 10:00`
- **駐車場台数**: `○台分`
- **キャンセルポリシー**: 実際のポリシーに合わせる
- **ペット可否**: 確認して差し替え
- **Google Maps URL**: アクセスセクションのコメントを参照

---

## Step 3: 予約フォームを動くようにする（Formspree 推奨）

1. https://formspree.io にアクセスして無料アカウントを作成
2. 「New Form」を作成 → フォームID（例: `xrgjkzba`）を取得
3. `js/main.js` を開いて以下の2箇所を書き換え:

```js
// 予約フォーム
const endpoint = 'https://formspree.io/f/YOUR_FORM_ID'; // ← ここを差し替え

// お問い合わせフォーム
const endpoint = 'https://formspree.io/f/YOUR_CONTACT_FORM_ID'; // ← ここを差し替え
```

送信されると、登録メールアドレス宛に通知が届きます。**無料プランで月50件まで対応可。**

---

## Step 4: Googleスプレッドシートで予約管理（任意・推奨）

Formspree の代わりに Google Apps Script を使うと、
フォーム送信 → Googleスプレッドシートに自動記録できます。

1. Google スプレッドシートを新規作成
2. 「拡張機能 → Apps Script」を開く
3. 以下のスクリプトを貼り付けてデプロイ（ウェブアプリとして公開）:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.checkin, data.checkout, data.guests,
    data.name, data.email, data.phone, data.message
  ]);
  return ContentService.createTextOutput('OK');
}
```

4. 発行されたURLを `js/main.js` の `endpoint` に設定

---

## Step 5: Vercelにデプロイ

```bash
# Vercel CLI を使う場合
npm i -g vercel
vercel

# または GitHub にpushして Vercel のダッシュボードから接続
```

`vercel.json` が既に含まれているので、そのままデプロイ可能です。

独自ドメイン（例: `call92.com`）の設定も Vercel ダッシュボードから簡単にできます。

---

## 将来の拡張ポイント

| 機能 | 方法 |
|---|---|
| じゃらん・楽天トラベル掲載 | 各サービスに申請 → フッターのコメントを外してリンク追加 |
| SNS連携（Instagram等） | お問い合わせセクションのコメントを外してURL設定 |
| Google Maps 埋め込み | アクセスセクションの iframe コメントを外して URL 設定 |
| AIチャット追加 | `index.html` 末尾の `#ai-chat-widget` に実装 |
| Google カレンダー連携 | `js/main.js` の「送信成功後の拡張処理」コメントを参照 |
| 英語対応 | `lang="ja"` を `lang="en"` に変更、テキスト差し替え |

---

制作費: TEZUIntelligence  
お問い合わせ: info@tezuintelligence.com（仮）
