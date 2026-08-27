# Random Music Viewer

VTuber ユニット「myme（マイミー）」の音楽動画を、  
メンバーごとに見たりランダムで出会ったりできる、  
軽量な個人制作アプリです。

誰かに見せるためのポートフォリオというより、  
「今日は何を聴こうかな」と軽く開ける場所を作りたくて作りました。

---

## できること

- 繭糸、みちとせ、それ故の各チャンネルから 1 曲ずつランダム表示
- メンバーごとの動画一覧をチャンネルページ風に表示
- ホーム、動画、ショート、各メンバーのタブで表示内容を切り替え
- 動画タブからショートを除外し、ショートはタイトルの `#shorts` を大文字・小文字を区別せずに判定
- サムネイルから YouTube の動画ページへ移動
- ボタンを押すと組み合わせを引き直し
- API を使わず、静的 JSON を読むだけの軽い構成

---

## 技術構成

- Svelte
- Routify（ディレクトリ／ファイルベースルーティング）
- Vite
- HTML / CSS

動画データは事前に生成した `music.json` を使っています。  
表示専用のアプリなので、実行時に YouTube API は使用していません。

---

## データの更新について

表示に使用している `music.json` は、
別リポジトリのスクリプトによって **定期的に自動生成・更新**されています。

- GitHub Actions により毎日自動実行
- 最新の動画情報を取得して JSON を更新
- 更新後はこの viewer に反映され、自動で再デプロイされます

このアプリ自体はデータ取得処理を持たず、  
**「生成されたデータを表示するだけ」**の役割に徹しています。

手動追加用の`music.manual.json`も読み込みます。両方のJSONに同じ`videoId`がある場合は、自動生成された`music.json`の内容を優先し、重複表示しません。

---

## なぜこの構成にしたか

- 無料で運用できること
- 気軽に置いておけること
- 壊れにくく、長く放置できること

「ちゃんとしたサービス」ではなく、  
個人的に気に入っている音楽を、気分で引き当てるための場所です。

---

## ローカルでの起動

```bash
pnpm install
pnpm run dev
```
Vite が表示するローカル URL にアクセスすると表示されます。

本番用の静的ファイルは次のコマンドで `dist/` に生成します。

```bash
pnpm run build
```

ページは `src/routes/` 以下に作成します。ディレクトリ名とファイル構成が URL に対応します。

---

## プレイリストを手動データへ取り込む

YouTubeプレイリストの動画を`public/music.manual.json`へ追加するローカル専用スクリプトがあります。既存データは残し、同じ`videoId`がある場合はプレイリストから取得したタイトルと公開日時で更新します。既存項目に`channelKey`がある場合、その値は空文字を含めて上書きしません。

### 1. Google Cloud側を準備

Google Cloud ConsoleでYouTube Data API v3を有効にし、OAuth同意画面を設定します。OAuthクライアントは「デスクトップアプリ」として作成してください。同意画面がテスト中の場合は、認証に使うGoogleアカウントをテストユーザーへ追加します。

既に「ウェブアプリケーション」としてOAuthクライアントを作成している場合は、そのクライアントの「承認済みのリダイレクトURI」に次のURLを完全一致で追加します。

```text
http://127.0.0.1:53682/oauth2callback
```

### 2. ローカル設定を作成

Viewer直下に、Git管理されない`.env.local`を作成します。クライアントシークレットが発行されていない場合、`YT_OAUTH_CLIENT_SECRET`は空で構いません。

```dotenv
YT_OAUTH_CLIENT_ID=xxxxxxxxxxxxxxxx.apps.googleusercontent.com
YT_OAUTH_CLIENT_SECRET=xxxxxxxxxxxxxxxx
YT_OAUTH_REDIRECT_URI=http://127.0.0.1:53682/oauth2callback
YT_PLAYLIST=https://www.youtube.com/playlist?list=PLTFRtTs6BcvI
YT_CHANNEL_KEY=
```

### 3. YouTubeアカウントを認証

```bash
npm run youtube:auth
```

ブラウザにGoogleの認証画面が開きます。対象の非公開プレイリストを閲覧できるGoogleアカウントでログインし、読み取り権限を許可してください。認証情報はGit管理されない`.youtube-oauth.json`へ保存されます。

### 4. 取り込みを実行

`.env.local`の`YT_CHANNEL_KEY`を取り込み先のメンバーに合わせて設定し、次のコマンドを実行します。あとから手動で設定する場合は、値を空のまま取り込むこともできます。

```bash
node scripts/import-manual-playlist.js
```

`YT_PLAYLIST`にはプレイリストのURLとプレイリストIDのどちらでも指定できます。一時的に設定を変えたい場合は、`.env.local`を書き換えずにコマンド引数で上書きできます。

```bash
node scripts/import-manual-playlist.js --playlist "別のプレイリストURL" --channel-key michitose
```

指定できる既存の`channelKey`は`mayui`、`michitose`、`soreyue`です。空の場合は`channelKey: ""`として保存されるため、表示に使用する前に手動で設定してください。別のキーを使う場合は、Viewer側の表示定義も先に追加してください。

スクリプトが取得して保存する項目は次の4つです。

- `channelKey`：コマンドまたは環境変数で指定した値。未指定時は空文字
- `title`：YouTube上の動画タイトル
- `videoId`：YouTubeの動画ID
- `publishedAt`：動画の公開日時

処理が途中で失敗した場合、`music.manual.json`は変更されません。アクセストークンの期限が切れた場合は、保存したrefresh tokenから自動更新します。OAuth関連スクリプト、`.env.local`、`.youtube-oauth.json`は`.vercelignore`でVercelのデプロイ対象から除外しています。

## 補足

このプロジェクトは
技術力をアピールする目的ではなく、
「作ること自体を楽しむ」ための個人制作です。

もし同じようなものを作りたい方がいれば、
自由に参考にしてください。
