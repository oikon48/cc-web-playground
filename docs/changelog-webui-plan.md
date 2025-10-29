# CLI Changelog Viewer - 計画ドキュメント

## プロジェクト概要

Claude Code、Gemini CLI、Codex CLIの3つのCLIツールのGitHubから機能変更情報（CHANGELOG、リリースノート）を取得し、バージョンごとに比較・表示できるWebUIを構築する。

## 目的

- 複数のAI CLIツールの開発動向を一元的に把握する
- バージョンごとの機能追加・変更を視覚的に比較する
- 開発者が最新の機能や変更点を効率的に確認できるようにする

## 対象CLIツール

### 1. Claude Code
- **リポジトリ**: [anthropics/claude-code](https://github.com/anthropics/claude-code)
- **Stars**: 多数（人気プロジェクト）
- **ライセンス**: Apache-2.0
- **情報源**: GitHub Releases, CHANGELOG.md
- **特徴**: Anthropic公式のClaude CLI、ターミナル上で動作するエージェント型コーディングツール
- **インストール**: `npm install -g @anthropic-ai/claude-code`

### 2. Gemini CLI
- **リポジトリ**: [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
- **Stars**: 80,716+ (2025年10月時点)
- **ライセンス**: Apache-2.0
- **情報源**: GitHub Releases
- **特徴**: Google公式のGemini CLI、オープンソースのAIエージェント、100万トークンのコンテキストウィンドウ
- **公式ドキュメント**: https://google-gemini.github.io/gemini-cli/

### 3. Codex CLI
- **リポジトリ**: [openai/codex](https://github.com/openai/codex)
- **ライセンス**: Apache-2.0
- **情報源**: GitHub Releases
- **特徴**: OpenAI公式のCodex CLI、Rustで構築された軽量コーディングエージェント
- **インストール**: `npm i -g @openai/codex` または `brew install --cask codex`
- **公式ドキュメント**: https://developers.openai.com/codex/cli/

## 機能要件

### 必須機能（MVP）

1. **データ取得機能**
   - GitHub APIを使用したリリース情報の取得
   - CHANGELOGファイルのパース
   - 定期的なデータ更新（キャッシング）

2. **バージョン表示機能**
   - 各CLIツールのバージョン一覧表示
   - バージョン番号、リリース日時の表示
   - 変更内容のマークダウンレンダリング

3. **比較機能**
   - 3つのツールを横並びで比較表示
   - タイムライン表示（時系列での比較）
   - フィルタリング（日付範囲、バージョン範囲）

4. **検索機能**
   - キーワードによる変更内容の検索
   - バージョン番号による検索

### 拡張機能（Phase 2）

1. **統計・分析機能**
   - リリース頻度の可視化
   - 変更カテゴリの分類（機能追加、バグ修正、破壊的変更）
   - トレンド分析

2. **通知機能**
   - 新バージョンリリース時の通知
   - RSSフィード生成
   - Webhook連携

3. **エクスポート機能**
   - PDF/Markdown形式でのエクスポート
   - 差分レポート生成

## 技術スタック

### フロントエンド

```
- React 18+ (または Next.js)
- TypeScript
- TailwindCSS（スタイリング）
- Markdown: react-markdown, remark-gfm
- 日付処理: date-fns
- チャート: recharts or Chart.js
- 状態管理: React Query（データフェッチング）
```

### バックエンド

```
Option 1: Static Site（推奨・シンプル）
- Next.js Static Generation
- ビルド時にGitHub APIから取得
- Vercel/Netlifyでホスティング

Option 2: Dynamic API
- Node.js + Express
- GitHub API連携
- Redis（キャッシング）
- PostgreSQL（データ保存）
```

### インフラ

```
- ホスティング: Vercel / Netlify / GitHub Pages
- CI/CD: GitHub Actions
- 定期実行: GitHub Actions Cron or Vercel Cron
```

## アーキテクチャ設計

### システム構成（Option 1: Static Site）

```
┌─────────────────────────────────────────┐
│         GitHub Repositories              │
│  - anthropics/claude-code               │
│  - google-gemini/gemini-cli             │
│  - openai/codex                         │
└────────────┬────────────────────────────┘
             │ GitHub API
             │ (Build Time)
             ▼
┌─────────────────────────────────────────┐
│      Data Fetcher (Node.js)             │
│  - Fetch releases                       │
│  - Parse CHANGELOG                      │
│  - Transform to JSON                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│      Static JSON Files                  │
│  - changelog-data.json                  │
│  - metadata.json                        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│      Next.js Static Site                │
│  - Pre-rendered pages                   │
│  - Client-side filtering                │
│  - Responsive UI                        │
└─────────────────────────────────────────┘
```

### データモデル

```typescript
interface CLITool {
  id: string; // 'claude-code', 'gemini-cli', 'codex-cli'
  name: string;
  repository: string; // 'org/repo'
  description: string;
  lastUpdated: string; // ISO 8601
}

interface Version {
  id: string;
  toolId: string;
  version: string; // 'v1.2.3'
  releaseDate: string; // ISO 8601
  title: string;
  body: string; // Markdown
  isPrerelease: boolean;
  url: string; // GitHub release URL
  changes: Change[];
}

interface Change {
  category: 'added' | 'changed' | 'fixed' | 'removed' | 'deprecated' | 'security';
  description: string;
}

interface ChangelogData {
  tools: CLITool[];
  versions: Version[];
  lastFetched: string; // ISO 8601
}
```

## データフロー

### 1. データ取得フロー

```
1. GitHub Actions（定期実行: 毎日1回）
   ↓
2. Fetch Script実行
   - GitHub API: GET /repos/{owner}/{repo}/releases
   - GitHub API: GET /repos/{owner}/{repo}/contents/CHANGELOG.md
   ↓
3. データ変換・正規化
   - マークダウンパース
   - バージョン情報抽出
   - カテゴリ分類
   ↓
4. JSON生成
   - public/data/changelog-data.json
   ↓
5. Git commit & push
   ↓
6. Vercel自動デプロイ
```

### 2. ユーザーアクセスフロー

```
1. ユーザーがWebUIアクセス
   ↓
2. 静的HTMLロード
   ↓
3. JSON データフェッチ
   ↓
4. クライアントサイドレンダリング
   ↓
5. フィルタ・検索（クライアント側）
```

## UI設計

### ページ構成

#### 1. ホームページ（/）
- 3つのCLIツールの概要
- 最新バージョン情報
- 最近の更新タイムライン

#### 2. 比較ページ（/compare）
- 3カラムレイアウト（各CLI）
- バージョン選択ドロップダウン
- 並列表示
- スクロール同期

#### 3. 詳細ページ（/[tool]/[version]）
- 単一バージョンの詳細表示
- 変更内容の完全表示
- 前後バージョンへのナビゲーション

#### 4. タイムラインページ（/timeline）
- 時系列表示
- すべてのリリースを統合
- フィルタリング機能

### UIコンポーネント

```
- Header
  - ナビゲーション
  - 検索バー

- ToolCard
  - ツール名
  - 最新バージョン
  - リリース日時

- VersionList
  - バージョン番号リスト
  - フィルタ

- ChangelogViewer
  - Markdown表示
  - カテゴリ別表示

- ComparisonView
  - 3カラムグリッド
  - スクロール同期

- Timeline
  - 時系列可視化
  - イベントマーカー

- SearchBar
  - フルテキスト検索
  - フィルタオプション
```

## 実装計画

### Phase 1: MVP開発（2-3週間）

#### Week 1: 基盤構築
- [ ] プロジェクトセットアップ（Next.js + TypeScript）
- [ ] データモデル定義
- [ ] GitHub API連携スクリプト作成
- [ ] サンプルデータ作成

#### Week 2: UI実装
- [ ] レイアウト・コンポーネント実装
- [ ] ホームページ
- [ ] 詳細ページ
- [ ] 比較ページ（基本版）

#### Week 3: 統合・デプロイ
- [ ] データ取得自動化（GitHub Actions）
- [ ] テスト
- [ ] デプロイ設定（Vercel）
- [ ] ドキュメント作成

### Phase 2: 機能拡張（2-3週間）

- [ ] タイムライン表示
- [ ] 高度な検索・フィルタリング
- [ ] 統計・分析機能
- [ ] エクスポート機能
- [ ] レスポンシブデザイン改善
- [ ] パフォーマンス最適化

### Phase 3: 拡張・保守

- [ ] 通知機能
- [ ] RSSフィード
- [ ] API提供
- [ ] 他のCLIツール追加

## 技術的課題と解決策

### 1. GitHubリポジトリの特定

**ステータス**: ✅ 解決済み

すべてのCLIツールの公式GitHubリポジトリが特定されました：
- Claude Code: `anthropics/claude-code`
- Gemini CLI: `google-gemini/gemini-cli` (80,716+ stars)
- Codex CLI: `openai/codex`

### 2. GitHub APIレート制限

**課題**: GitHub API制限（認証なし: 60req/h、認証あり: 5000req/h）

**解決策**:
- GitHub Personal Access Token使用
- ビルド時のみAPI呼び出し（1日1回）
- レスポンスのキャッシング
- Conditional Requests（ETag使用）

### 3. CHANGELOGフォーマットの違い

**課題**: 各プロジェクトでCHANGELOGフォーマットが異なる

**解決策**:
- Keep a Changelog形式を基準に実装
- パーサーをプラグイン化
- 正規表現で柔軟に対応
- フォールバック: Release notesを使用

### 4. データ更新の遅延

**課題**: 静的サイトの場合、リアルタイム更新不可

**解決策**:
- GitHub Actions Cronで定期ビルド
- Vercel Deploy Hooksで自動再デプロイ
- クライアント側で「最終更新時刻」表示
- 将来的にISR（Incremental Static Regeneration）検討

## セキュリティ考慮事項

- GitHub Personal Access Tokenは環境変数で管理
- トークンは最小権限（public_repo読み取りのみ）
- XSS対策: Markdownサニタイゼーション
- CSP (Content Security Policy) 設定
- HTTPS必須

## パフォーマンス最適化

- 静的生成によるFCP改善
- 画像最適化（Next.js Image）
- コード分割（dynamic import）
- JSONデータの圧縮
- CDN活用（Vercel Edge Network）

## モニタリング・分析

- Vercel Analytics
- Google Analytics（オプション）
- エラー追跡: Sentry（オプション）
- ビルド成功率の監視

## 今後の拡張案

1. **追加CLIツールのサポート**
   - Cursor CLI
   - Copilot CLI
   - その他AIツール

2. **コミュニティ機能**
   - コメント・レビュー
   - お気に入り機能
   - 変更内容の評価

3. **インテグレーション**
   - Slack通知
   - Discord bot
   - メール購読

4. **多言語対応**
   - 日本語/英語切り替え
   - 自動翻訳（変更内容）

## 参考資料

- [GitHub REST API - Releases](https://docs.github.com/en/rest/releases/releases)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

## プロジェクト情報

- **開始日**: 2025-10-29
- **ステータス**: 計画段階
- **優先度**: Medium
- **想定工数**: 4-6週間（MVP + Phase 2）

---

## Next Steps

1. ✅ 計画ドキュメント作成
2. ✅ 各CLIツールの正確なGitHubリポジトリを特定
3. ⬜ プロジェクト初期化（Next.js）
4. ⬜ GitHub API連携の実装開始
5. ⬜ モックデータでのUI開発開始

---

## 調査結果メモ（2025-10-29）

### リポジトリ詳細調査

すべてのCLIツールの公式リポジトリが確認されました：

1. **Claude Code** (`anthropics/claude-code`)
   - Anthropic公式の最新CLIツール
   - ターミナルベースのエージェント型コーディング支援
   - 自然言語コマンドでコード操作、Git操作が可能
   - npm経由でインストール可能

2. **Gemini CLI** (`google-gemini/gemini-cli`)
   - Google公式、80,000+ stars（非常に人気）
   - オープンソース、Apache-2.0ライセンス
   - Gemini 2.5 Proを使用、100万トークンのコンテキスト
   - 無料ティア: 60 req/min、1,000 req/day
   - MCP (Model Context Protocol) サポート
   - GitHub Actions連携あり

3. **Codex CLI** (`openai/codex`)
   - OpenAI公式の軽量コーディングエージェント
   - Rustで実装（高速・効率的）
   - macOS/Linux対応（Windows実験的）
   - npm/Homebrew経由でインストール可能
   - GitHub Actions連携あり (`openai/codex-action`)

### 技術的発見

- すべてのツールが**GitHub Actions連携**を提供しており、CI/CD統合が可能
- すべてが**Apache-2.0ライセンス**（オープンソース）
- すべてが**npm経由でインストール可能**
- Gemini CLIはリリース情報が豊富（80,716 stars）で、活発に開発中
- 各ツールともリリースページが整備されているため、GitHub Releases APIでの取得が最適

### 次回実装時の注意点

1. Gemini CLIは非常にアクティブなため、更新頻度が高い可能性
2. 各ツールのリリースノート形式を確認し、パーサー設計に反映
3. GitHub Actions連携があるため、自動化の参考にできる
4. すべてのツールが公式ドキュメントサイトを持つため、補完情報源として活用可能
