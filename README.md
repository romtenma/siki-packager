# siki-packager

任意の Siki バージョン / Electron バージョン / プラットフォーム / アーキタイプ で Sikiの実行ファイルを生成する CLI です。
デフォルトで GitHub 上の `https://github.com/romtenma/siki-asar-releases`（manifest.json + Releases assets）を参照します。

すぐに実行できるインストーラが欲しい方は[Sikiのサイト](https://sikiapp.net/)からダウンロードしてください

## 使い方

前提: Node.js と Git がインストール済み。

1. リポジトリを取得
2. 依存関係をインストール
3. コマンドを実行してパッケージを作成(outに出力されます)

```powershell
git clone https://github.com/romtenma/siki-packager.git
cd siki-packager
npm install

# 最新版を普通に作成
node dist

# Sikiのバージョンを0.39.3, electronのバージョン40.0.0を指定して32ビット版を作成
node dist --app 0.39.3 --electron 40.0.0 --arch ia32

# Sikiのβ版をsiki-betaディレクトリへ作る(β版より新しいリリースがある場合はβ版はインストールされません)
node dist --app beta --out siki-beta

# 作成可能なSikiのバージョン一覧を表示
node dist --list-apps

```

## オプション

- `--app <version>`: Sikiのバージョン（省略時: `latest`）（例: 0.39.3 / 0.39.4-beta.1 / latest / beta）
- `--electron <version>`: Electron バージョン（省略時: `manifest.json` の `electronVersion`）
- `--platform <win32|linux|darwin>`（省略時: 現在の環境）
- `--arch <x64|ia32|arm64>`（省略時: 現在の環境）
- `--no-asar`: 出力パッケージの asar 化を無効化（省略時: 有効）
- `--releases <path|url>`: `siki-asar-releases` のパスまたはURL（省略時 `https://github.com/romtenma/siki-asar-releases`）
- `--list-apps`: ビルド可能な Siki のバージョン一覧を表示して終了
- `--out <path>`: 出力先ディレクトリ（省略時 `./out`）

## 開発メモ

src を変更した場合のみビルドが必要です。

```powershell
npm run build-script
```

使い方では省略されていますが `node ./dist/index.js`を呼び出しています。

`siki-asar-releases/manifest.json` に各バージョンのメタ情報を集約します。

- `apps[].asarSha512` は `.asar` の sha512（base64）

siki-packager は manifest の sha512 を検証してから作業ディレクトリに展開し、`electron-packager` を実行します。
