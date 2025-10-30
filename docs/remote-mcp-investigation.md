# リモートMCPサーバー接続調査レポート

## 調査日時
2025-10-30

## 調査目的
Claude Codeを実行している環境から、リモートMCPサーバーへの接続可能性を調査する。

---

## 調査結果サマリー

**結論: リモートMCPサーバーへの接続は可能**

この環境からHTTPSを使用したリモートMCPサーバーへの接続が可能であることを確認しました。

---

## 1. MCPのトランスポート方式

MCPプロトコルは2つの主要なトランスポート方式をサポートしています：

### 1.1 stdio (Standard Input/Output)
- ローカル実行専用
- プロセス間通信を使用
- 現在の`.mcp.json`の設定（Context7）はこの方式

### 1.2 HTTP-based Transport
- リモートサーバーへの接続に使用
- 2つのバリエーション：
  - **SSE (Server-Sent Events)**: 旧方式、将来的に非推奨予定
  - **Streamable HTTP**: 2025年3月導入の新方式（推奨）

---

## 2. リモートMCP接続の実装方法

### 2.1 mcp-remoteパッケージの使用

`mcp-remote`は、stdio専用のMCPクライアントからリモートMCPサーバーへの接続を可能にするプロキシです。

**基本的な使い方:**
```json
{
  "mcpServers": {
    "remote-server-name": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://remote.mcp.server/endpoint"
      ],
      "env": {}
    }
  }
}
```

**主要なオプション:**
- `-y`: 自動インストール（npxのエラー回避）
- `@latest`: 常に最新バージョンを使用
- `--allow-http`: HTTP接続を許可（信頼できるネットワークのみ）
- `--host <hostname>`: OAuthコールバックのホスト変更
- ポート番号: OAuth用のリダイレクトポート指定（デフォルト: 3334）

**認証情報の保存先:**
- デフォルト: `~/.mcp-auth`
- 環境変数で変更可能: `MCP_REMOTE_CONFIG_DIR`

### 2.2 パッケージ情報
- NPMパッケージ: `mcp-remote`
- 現在のバージョン: 0.1.29
- 最終更新: 2025-08-29
- メンテナー: threepointone, geelen

---

## 3. 接続可能なリモートMCPサーバー例

### 3.1 Atlassian Remote MCP Server

**エンドポイント:** `https://mcp.atlassian.com/v1/sse`

**特徴:**
- Jira、Confluence、Compassへのアクセス
- OAuth 2.1認証が必要
- 商用サービス（Atlassian Cloudアカウント必要）

**接続性テスト結果:**
```bash
$ curl -I https://mcp.atlassian.com/v1/sse
HTTP/1.1 200 OK
HTTP/2 401  # 認証が必要（期待通り）
```

**設定例:**
```json
{
  "mcpServers": {
    "atlassian-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.atlassian.com/v1/sse"
      ],
      "env": {}
    }
  }
}
```

### 3.2 GitMCP - GitHub Repository Access

**エンドポイント:** `https://gitmcp.io/{owner}/{repo}`

**特徴:**
- 無料・オープンソース
- 認証不要（パブリックリポジトリの場合）
- 任意のGitHubリポジトリをMCPエンドポイント化
- ダイナミックエンドポイント: `https://gitmcp.io/docs`

**接続性テスト結果:**
```bash
$ curl -I https://gitmcp.io/docs
HTTP/1.1 200 OK
HTTP/2 200  # 正常に接続可能
```

**設定例:**
```json
{
  "mcpServers": {
    "gitmcp-example": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://gitmcp.io/anthropics/anthropic-sdk-typescript"
      ],
      "env": {}
    }
  }
}
```

---

## 4. ネットワーク接続性の確認結果

### 4.1 システム環境
```
OS: Ubuntu 24.04.3 LTS
Kernel: Linux 4.4.0
Node.js: v22.x (from /opt/node22/bin/node)
```

### 4.2 利用可能なツール
- `curl`: 利用可能
- `wget`: 利用可能
- `npm/npx`: 利用可能
- `python3`: 利用可能

### 4.3 HTTPS接続テスト
```bash
$ curl -I https://api.github.com
HTTP/1.1 200 OK  # 成功

$ curl -I https://mcp.atlassian.com/v1/sse
HTTP/2 401  # サーバーに到達（認証が必要）

$ curl -I https://gitmcp.io/docs
HTTP/2 200  # 成功
```

**結論:** HTTPS経由での外部サーバーへの接続が可能。

---

## 5. Claude Codeでの実装ガイドライン

### 5.1 現在の環境で実装可能なリモートMCPサーバー

#### パターンA: 認証不要のサーバー
```json
{
  "mcpServers": {
    "gitmcp": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://gitmcp.io/docs"
      ],
      "env": {}
    }
  }
}
```

#### パターンB: OAuth認証が必要なサーバー
```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.atlassian.com/v1/sse"
      ],
      "env": {}
    }
  }
}
```

初回接続時にブラウザでOAuth認証フローが開始されます。

#### パターンC: カスタムポート・ホスト設定
```json
{
  "mcpServers": {
    "custom-server": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://custom.mcp.server/endpoint",
        "9696",
        "--host",
        "127.0.0.1"
      ],
      "env": {}
    }
  }
}
```

### 5.2 既存設定との併用

現在の`.mcp.json`:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {}
    }
  }
}
```

リモートサーバーを追加した例:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {}
    },
    "gitmcp": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://gitmcp.io/modelcontextprotocol/servers"
      ],
      "env": {}
    }
  }
}
```

---

## 6. Claude Codeのリモートサーバーサポート状況

### 6.1 公式サポート
- 2025年6月: Claude CodeがStreamable HTTP経由のリモートMCPサーバーサポートを追加
- Web版・Desktop版のClaudeもリモートMCPサーバーをサポート
- iOSおよびAndroidも2025年7月からサポート

### 6.2 サポートされる機能
- **Tools**: テキストおよび画像ベースの結果
- **Prompts**: プロンプトテンプレート
- **Resources**: テキストおよびバイナリリソース
- **Authentication**: OAuth 2.1、Dynamic Client Registration (DCR)

### 6.3 制限事項
- API経由での接続では、現時点でToolsのみサポート（ResourcesとPromptsは未サポート）
- リモートサーバーは公開HTTPSエンドポイントとして公開される必要がある

---

## 7. 推奨される次のステップ

### 7.1 即座に実装可能
1. **GitMCPのテスト接続**
   - 認証不要
   - 無料
   - 設定をそのまま適用可能

2. **Context7との共存確認**
   - 既存のContext7設定を維持しながらリモートサーバーを追加

### 7.2 検証が必要な項目
1. **Claude Codeのバージョン確認**
   - 現在の実行環境がリモートMCPをサポートしているか

2. **mcp-remoteの動作確認**
   - OAuth認証フローがこの環境で正常に動作するか
   - ブラウザアクセスが必要な場合の対処

3. **パフォーマンステスト**
   - ネットワーク遅延の影響
   - 複数MCPサーバーの同時実行

---

## 8. セキュリティとベストプラクティス

### 8.1 認証情報の管理
- `~/.mcp-auth`に保存される認証情報のバックアップ
- 環境変数`MCP_REMOTE_CONFIG_DIR`での管理

### 8.2 接続先の検証
- HTTPSの使用を推奨（`--allow-http`は信頼できるネットワークのみ）
- 公式・信頼できるMCPサーバーのみを使用

### 8.3 権限管理
- リモートサーバーが要求する権限の確認
- 最小権限の原則に従う

---

## 9. 参考リンク

### 公式ドキュメント
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/2025-03-26)
- [Claude MCP Connector Documentation](https://docs.claude.com/en/docs/agents-and-tools/mcp-connector)
- [Building Custom Connectors via Remote MCP Servers](https://support.claude.com/en/articles/11503834-building-custom-connectors-via-remote-mcp-servers)

### リモートMCPサーバー
- [Atlassian Remote MCP Server](https://www.atlassian.com/blog/announcements/remote-mcp-server)
- [GitMCP - GitHub Repository MCP Server](https://github.com/idosal/git-mcp)
- [Cloudflare: Build Remote MCP Servers](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/)

### ツールとリソース
- [mcp-remote npm package](https://www.npmjs.com/package/mcp-remote)
- [MCP Inspector Tool](https://github.com/modelcontextprotocol/inspector)
- [Awesome Remote MCP Servers](https://github.com/sylviangth/awesome-remote-mcp-servers)

---

## 10. 結論

この環境からリモートMCPサーバーへの接続は**技術的に可能**です。

### 主要な発見
1. ネットワーク接続性: HTTPS経由での外部サーバーアクセスが可能
2. 必要なツール: npm/npx が利用可能
3. `mcp-remote`パッケージ: リモート接続を実現するプロキシが利用可能
4. 公開サーバー: GitMCPなどの無料サーバーが即座にテスト可能

### 実装の準備完了
- 設定ファイルの形式が明確
- 接続テストが成功
- 複数のサーバー例が利用可能

### 次のアクション
1. `.mcp.json`にリモートサーバー設定を追加
2. Claude Codeを再起動して設定を読み込み
3. リモートMCPサーバーのツールが利用可能か確認

---

**調査完了日**: 2025-10-30
**調査者**: Claude Code Agent
**ドキュメントバージョン**: 1.0
