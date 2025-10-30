# MCPサーバー調査レポート

## 調査日
2025-10-30

## 調査目的
Claude Code on the webでのMCP（Model Context Protocol）機能の調査と、Context7およびSerena MCPサーバーの接続テスト

---

## 調査結果サマリー

### 重要な発見

**「Claude Code on the web」は存在しません**。Claude Codeは**CLIツール**であり、ターミナルで動作します。

Claudeに関連する3つの異なるプロダクトがあります：

1. **Claude Code (CLIツール)** - ターミナルベース
2. **Claude Desktop** - デスクトップアプリケーション
3. **Claude.ai (Webインターフェース)** - ブラウザベース

---

## MCP機能の比較

| 機能 | Claude Code (CLI) | Claude Desktop | Claude.ai (Web) |
|------|------------------|----------------|-----------------|
| ローカルMCPサーバー (stdio) | ✅ | ✅ | ❌ |
| リモートMCPサーバー (HTTP) | ✅ | ❌ | ✅ (Integrationsのみ) |
| 利用可能プラン | すべて | すべて | Max/Team/Enterprise (Proは近日) |
| 設定方法 | CLI/設定ファイル | 設定ファイル | Web UI (URL貼付) |
| カスタムMCPサーバー | ✅ | ✅ | ❌ (パートナーのみ) |

---

## プロジェクトで設定したMCPサーバー

### 1. Context7

**概要:**
- Upstashが開発・メンテナンスする無料MCPサーバー
- LLMに最新のライブラリドキュメントを提供
- 古いコード生成を防止

**機能:**
- バージョン固有のAPIリファレンスと最新のコード例を提供
- 公式ドキュメントからリアルタイムでドキュメントを取得
- 手動検索の時間を削減し生産性向上

**設定:**
- コマンド: `npx`
- パッケージ: `@upstash/context7-mcp`
- APIキー: オプション（レート制限緩和、プライベートリポジトリアクセス用）

**取得方法:**
- 無料アカウント作成: https://context7.com/dashboard

### 2. Serena

**概要:**
- oraiosが開発したAIコーディングエージェントツールキット
- セマンティックコード理解とインテリジェント編集機能を提供
- CursorやWindsurfのような高価なコーディングアシスタントの無料代替

**機能:**
- セマンティックコード検索と理解
- ランゲージサーバー統合による高度な編集機能
- プロジェクト単位のコンテキスト管理

**設定:**
- コマンド: `uvx`
- リポジトリ: `git+https://github.com/oraios/serena`
- プロジェクトパス: `/home/user/cc-web-playground`

**推奨事項:**
- 大規模プロジェクトでは初回ツール実行前にインデックス作成を推奨
- プロジェクトレベルの設定が推奨（グローバル設定も可能）

---

## 設定ファイル

### `.mcp.json`
プロジェクトルートに配置。バージョン管理にコミット可能。

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server",
        "--context",
        "ide-assistant",
        "--project",
        "/home/user/cc-web-playground"
      ],
      "env": {}
    },
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp"
      ],
      "env": {}
    }
  }
}
```

### `.claude/settings.json`
プロジェクトスコープのMCPサーバーを有効化。

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(gh:*)"
    ]
  },
  "enableAllProjectMcpServers": true
}
```

---

## MCP (Model Context Protocol) とは

### 定義
AIアプリケーションがツールやデータソースに接続するためのオープンスタンダード。Anthropicが推進する統合プロトコル。

### 可能になること
- データベースへのクエリ
- 外部APIへのアクセス
- ブラウザ自動化 (Puppeteer/Playwright)
- Git/GitHub統合
- モニタリングツール連携

### トランスポート方式
1. **stdio** - ローカルプロセス（標準入出力）
2. **HTTP** - リモートサーバー（推奨）
3. **SSE** - Server-Sent Events（非推奨、HTTPへ移行推奨）

---

## Claude.ai Integrationsについて

**発表日:** 2025年5月1日

**概要:**
- リモートMCPサーバーをブラウザベースのClaudeに接続
- URLをコピー&ペーストするだけで接続可能

**利用可能プラン:**
- Max、Team、Enterprise（近日中にProも対応予定）

**ローンチパートナー（10社）:**
1. Atlassian (Jira & Confluence)
2. Zapier
3. Cloudflare
4. Intercom
5. Asana
6. Square
7. Sentry
8. PayPal
9. Linear
10. Plaid

**制限事項:**
- リモートMCPサーバーのみ（ローカルサーバーは不可）
- パートナーサービスのみ（カスタムサーバーは不可）

---

## 使用方法

### Context7の使用
プロンプトに「use context7」と記載するだけで、最新のドキュメントが自動的に取得されます。

### Serenaの使用
Claude Codeのセッション内でSerenaの機能が自動的に利用可能になります。

---

## 制限事項

### Claude Code (CLI)
- MCPツール出力が10,000トークンを超えると警告表示
- デフォルト最大出力: 25,000トークン

### セキュリティ
- プロジェクトスコープのMCPサーバーは使用前に承認プロンプトが表示されます
- `.mcp.json`ファイルは信頼できるソースから取得してください

---

## 推奨事項

### ユースケース別の選択
- **フル機能が必要** → Claude Code (CLI) または Claude Desktop
- **Webブラウザで使いたい** → claude.ai (Integrations)
- **カスタムMCPサーバー** → Claude Code (CLI) または Claude Desktop

### チーム開発
- `.mcp.json`をバージョン管理にコミットして、チーム全体で同じMCPツールを共有
- プロジェクトレベルの設定を推奨

---

## 次のステップ

### 実際のテスト
1. Claude Codeセッションを再起動
2. `claude mcp list`でMCPサーバーの確認
3. Context7とSerenaを使用して実際の開発タスクを実施

### APIキーの取得（オプション）
- Context7のAPIキーを取得して高度な機能を利用: https://context7.com/dashboard

### インデックス作成（Serena - 推奨）
- 大規模プロジェクトの場合、初回実行前にSerenaのインデックスを作成すると高速化

---

## 参考リンク

- [Context7 GitHub](https://github.com/upstash/context7)
- [Serena GitHub](https://github.com/oraios/serena)
- [Claude Code MCP Documentation](https://docs.claude.com/en/docs/claude-code/mcp)
- [Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)
