# Claude Code サンドボックス探検記 🔍

Claude Code on the Webのサンドボックス環境を面白おかしく解説するWebサイトです。

## 🌟 特徴

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Claude Code風デザイン** (ダークテーマ + オレンジアクセント)
- **面白おかしい解説** (探検記風、冒険風)

## 📚 コンテンツ

このサイトは、`cc-web-playground`リポジトリで行われた徹底的な調査を元に作成されています。

### ページ構成

1. **トップページ** (`/`)
   - 概要とナビゲーション
   - 調査の軌跡タイムライン

2. **環境の全貌** (`/environment`)
   - OS、CPU、メモリの詳細
   - ユーザー権限とツール

3. **コンテナの秘密** (`/container`)
   - gVisorアーキテクチャ
   - リソース制限(8GB RAM, 9.8GB disk)
   - データの永続性

4. **禁断のコマンド** (`/commands`)
   - ツール実行ポリシー
   - Permission Deniedの真相
   - 回避方法3選

5. **データの運命** (`/persistence`)
   - 永続化ディレクトリ vs エフェメラル領域
   - `~/.claude/`の構造
   - Gitによる永続化

6. **GitHub芸の極意** (`/github`)
   - Git設定と自動署名
   - gh CLI の使い方
   - 推奨ワークフロー

7. **ネットワークの迷宮** (`/network`)
   - プロキシアーキテクチャ
   - JWT認証
   - できること・できないこと

## 🚀 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start
```

## 📖 元の調査資料

詳細な調査資料は `/docs` ディレクトリにあります:

- [01-environment-overview.md](../docs/01-environment-overview.md)
- [02-container-lifecycle.md](../docs/02-container-lifecycle.md)
- [03-gh-command-workaround.md](../docs/03-gh-command-workaround.md)
- [05-data-persistence-boundaries.md](../docs/05-data-persistence-boundaries.md)
- [06-tool-execution-policy.md](../docs/06-tool-execution-policy.md)
- [07-investigation-summary.md](../docs/07-investigation-summary.md)

## 🎨 デザインシステム

### カラーパレット

**Claude Orange**
- #FF6B35 (メイン)
- #F04D00 (ダーク)
- #FFE8E0 (ライト)

**Claude Dark**
- #1A1A1A (メイン背景)
- #2A2A2A (カード)
- #0A0A0A (ダーク)

### コンポーネント

- グラデーションテキスト (`.gradient-text`)
- オレンジグロー (`.glow-orange`)
- ダークカード
- ボーダー (オレンジ/20%透明度)

## 📝 技術スタック

- **フレームワーク**: Next.js 16.0.1
- **言語**: TypeScript 5.9
- **スタイリング**: Tailwind CSS v4
- **ビルドツール**: Turbopack
- **デプロイ**: Vercel (推奨)

## 🤝 貢献

調査内容の追加や改善は、親リポジトリ(`cc-web-playground`)へのPRをお願いします。

## 📜 ライセンス

親プロジェクトのライセンスに従います。

## 👏 謝辞

- 調査: Claude (Anthropic)
- 調査期間: 2025-10-29 ~ 2025-10-30
- デザインインスピレーション: Claude Code公式サイト

---

**元のリポジトリ**: https://github.com/oikon48/cc-web-playground
