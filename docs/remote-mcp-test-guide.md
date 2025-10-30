# リモートMCPサーバー接続テストガイド

このガイドでは、リモートMCPサーバーへの接続をテストする手順を説明します。

---

## 前提条件

- Node.js 18以上がインストールされていること
- インターネット接続（HTTPS）が利用可能であること
- Claude CodeがリモートMCPサーバーをサポートしていること

---

## テスト方法

### 方法1: 設定ファイルを置き換える（推奨）

1. **現在の設定をバックアップ**
```bash
cp .mcp.json .mcp.json.backup
```

2. **テスト設定を適用**
```bash
cp .mcp.remote-test.json .mcp.json
```

3. **Claude Codeを再起動**
   - CLI版の場合: 新しいセッションを開始
   - Desktop版の場合: アプリケーションを再起動

4. **接続を確認**
   - 利用可能なMCPツールのリストを確認
   - リモートサーバーからのツールが表示されるか確認

5. **テスト完了後、元に戻す**
```bash
mv .mcp.json.backup .mcp.json
```

### 方法2: 段階的にサーバーを追加

1. **現在の`.mcp.json`を編集**

2. **GitMCPサーバーを追加**（認証不要のため最初にテスト）
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {}
    },
    "gitmcp-test": {
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

3. **Claude Codeを再起動**

4. **動作確認**

---

## テストサーバー一覧

### 1. GitMCP (認証不要 - 推奨テスト対象)

#### エンドポイント
```
https://gitmcp.io/{owner}/{repo}
https://gitmcp.io/docs (ダイナミックエンドポイント)
```

#### 特徴
- 無料
- 認証不要（パブリックリポジトリの場合）
- 任意のGitHubリポジトリをMCPサーバー化

#### 設定例
```json
{
  "gitmcp-mcp-servers": {
    "command": "npx",
    "args": [
      "-y",
      "mcp-remote",
      "https://gitmcp.io/modelcontextprotocol/servers"
    ],
    "env": {}
  }
}
```

#### 接続テスト
```bash
curl -I https://gitmcp.io/docs
# 期待される結果: HTTP/2 200
```

### 2. Atlassian Remote MCP (OAuth認証必要)

#### エンドポイント
```
https://mcp.atlassian.com/v1/sse
```

#### 特徴
- Jira, Confluence, Compassへのアクセス
- OAuth 2.1認証が必要
- Atlassian Cloudアカウントが必要

#### 設定例
```json
{
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
```

#### 接続テスト
```bash
curl -I https://mcp.atlassian.com/v1/sse
# 期待される結果: HTTP/2 401 (認証が必要)
```

#### 初回接続時の認証フロー
1. Claude Codeがmcp-remoteプロキシを起動
2. ブラウザでOAuth認証ページが開く
3. Atlassianアカウントでログイン
4. アクセス許可を承認
5. 認証情報が`~/.mcp-auth`に保存される

---

## トラブルシューティング

### 問題: mcp-remoteが起動しない

**原因:** Node.jsのバージョンが古い

**解決策:**
```bash
node --version
# v18以上が必要
```

### 問題: OAuth認証画面が開かない

**原因:** ブラウザアクセスが制限されている環境

**解決策:**
- リダイレクトURLを手動でコピーしてブラウザで開く
- `--host`オプションでホストを指定

### 問題: 接続タイムアウト

**原因:** ファイアウォールまたはプロキシの制約

**解決策:**
```bash
# 接続性をテスト
curl -v https://gitmcp.io/docs

# プロキシ設定を確認
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

### 問題: ツールが表示されない

**原因:** 設定ファイルの構文エラー

**解決策:**
```bash
# JSONの構文チェック
cat .mcp.json | python3 -m json.tool
```

---

## 期待される動作

### 成功時の兆候

1. **Claude Code起動時**
   - エラーメッセージが表示されない
   - MCPサーバーの初期化ログが表示される

2. **ツールリスト**
   - リモートサーバーから提供されるツールが表示される
   - GitMCPの場合: リポジトリ検索、ファイル読み取りなどのツール

3. **ツール実行**
   - リモートサーバーのツールが正常に実行される
   - 結果が返ってくる

### 失敗時の兆候

1. **エラーメッセージ**
   - "Failed to connect to remote server"
   - "Authentication required"
   - "Invalid URL"

2. **動作**
   - Claude Codeが起動しない
   - リモートサーバーのツールが表示されない
   - ツール実行時にエラーが発生

---

## パフォーマンス測定

### レイテンシテスト

```bash
# GitMCPへのレスポンスタイム測定
time curl -s https://gitmcp.io/docs > /dev/null

# Atlassianへのレスポンスタイム測定
time curl -s -I https://mcp.atlassian.com/v1/sse > /dev/null
```

### 推奨事項

- ローカルMCPサーバー（Context7など）: 低レイテンシ、高速応答
- リモートMCPサーバー: ネットワーク遅延を考慮、キャッシュ戦略を検討

---

## 設定の最適化

### 複数サーバーの優先順位

頻繁に使用するサーバーを上位に配置:

```json
{
  "mcpServers": {
    "local-fast-server": { /* ... */ },
    "remote-server-1": { /* ... */ },
    "remote-server-2": { /* ... */ }
  }
}
```

### タイムアウト設定

`mcp-remote`のタイムアウトは環境変数で設定可能:

```json
{
  "mcpServers": {
    "slow-remote-server": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://slow.server.com/mcp"],
      "env": {
        "MCP_REQUEST_TIMEOUT": "30000"
      }
    }
  }
}
```

---

## セキュリティチェックリスト

- [ ] HTTPSのみを使用（`--allow-http`は使用しない）
- [ ] 信頼できるMCPサーバーのみを追加
- [ ] OAuth認証が必要なサーバーは正規のドメインを確認
- [ ] `~/.mcp-auth`の認証情報を定期的に見直す
- [ ] 不要になったサーバーは設定から削除

---

## 次のステップ

### 実運用への移行

1. **テストが成功した場合**
   - 必要なサーバーのみを残す
   - 不要なサーバーを削除
   - `.mcp.json.backup`を削除

2. **本番環境での使用**
   - 認証情報のバックアップ
   - 定期的な接続テスト
   - ログの監視

### さらなる探索

- [MCP Registry](https://github.com/mcp) で他のリモートサーバーを探す
- [Awesome Remote MCP Servers](https://github.com/sylviangth/awesome-remote-mcp-servers) を参照
- 独自のリモートMCPサーバーを構築（Cloudflare Workers等を使用）

---

## 参考資料

- [リモートMCP調査レポート](./remote-mcp-investigation.md)
- [Model Context Protocol公式ドキュメント](https://modelcontextprotocol.io/)
- [mcp-remote NPMパッケージ](https://www.npmjs.com/package/mcp-remote)

---

**作成日**: 2025-10-30
**バージョン**: 1.0
**メンテナー**: Claude Code Agent
