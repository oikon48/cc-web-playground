# Claude Code 起動オプション調査レポート

## 調査日時
2025-10-29

## 実行環境

### プロセス構成

Claude Codeは以下の2層構造で動作しています：

1. **environment-manager** (Go製)
   - コンテナライフサイクル管理
   - セッション管理
   - Claude Codeバイナリの起動

2. **claude** (Node.js製)
   - 実際のClaude Codeアプリケーション
   - バージョン: 2.0.23
   - 場所: `/opt/node22/lib/node_modules/@anthropic-ai/claude-code/cli.js`

## 現在の起動コマンド

```bash
/usr/local/bin/environment-manager task-run \
  --stdin \
  --session session_011CUbneTfUurHZE7FnMqB8t \
  --session-mode resume \
  --upgrade-claude-code=False
```

## environment-manager のオプション

### 基本情報

```
Environment Manager handles the lifecycle of Claude Code remote sessions.
It can operate in two modes:
- Poll Mode: Long-polls the container API waiting for new sessions
- Run Mode: Directly connects to a session with known credentials
```

### task-run コマンドのオプション

#### 必須オプション

- `--session string`
  - セッションID（必須）
  - 例: `session_011CUbneTfUurHZE7FnMqB8t`

#### セッション関連

- `--session-mode string`
  - デフォルト: `new`
  - オプション:
    - `new`: 新規セッション（デフォルト）
    - `resume`: 再開（git cloneとセットアップスクリプトをスキップ）
    - `setup-only`: セットアップ後に終了
  - 現在の設定: `resume`

#### 入力方式

- `--stdin`
  - 標準入力からJSON設定を読み取る
  - API環境取得をバイパス可能
  - JSON構造:
    ```json
    {
      "startup_context": {
        "sources": [...],
        "cwd": "..."
      },
      "environment": {
        "environment_type": "...",
        "version": "...",
        ...
      },
      "auth": [
        {
          "type": "github_app",
          "url": "github.com",
          "token": "ghs_..."
        }
      ]
    }
    ```

#### Claude Code管理

- `--upgrade-claude-code`
  - デフォルト: `true`
  - 起動前に最新バージョンにアップグレード
  - 現在の設定: `False`

#### ツール制限

- `--allowed-tools string`
  - カンマ区切りで許可するツールを指定
  - 例: `'Bash,Edit,Write,MultiEdit,Agent,Glob,Grep,LS,View,Search,NotebookEdit,NotebookRead,TodoRead,TodoWrite'`
  - デフォルト: すべてのツールが許可

#### Git設定

- `--git-mode string`
  - デフォルト: `http-proxy`
  - オプション:
    - `http-proxy`: ローカルgitプロキシを使用（デフォルト）
    - `mcp`: MCP gitサーバーを使用

#### デバッグ・ログ

- `--debug`
  - デバッグモードを有効化
  - `CLAUDE_CODE_DEBUG`環境変数を設定

- `--log-level string`
  - デフォルト: `info`
  - オプション: `debug`, `info`, `warn`, `error`

- `--verbose-claude-logs`
  - Claude Codeの詳細ログをコンソールに出力
  - `--local-testing`で自動的に有効化

#### テスト用

- `--local-testing`
  - スタンドアロンモードで実行
  - WebSocket接続とgit設定を無効化
  - ローカルテスト用

## 環境変数

現在設定されている環境変数：

```bash
CLAUDE_CODE_CONTAINER_ID=container_011CUbneVHCkMVYEakeFWSbw
CLAUDE_CODE_REMOTE=true
CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE=cloud_default
CLAUDE_CODE_VERSION=2.0.23
CLAUDE_CODE_DEBUG=true
CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR=3
CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR=4
```

### 環境変数の説明

- `CLAUDE_CODE_CONTAINER_ID`: コンテナID
- `CLAUDE_CODE_REMOTE`: リモート実行フラグ（`true`）
- `CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE`: 環境タイプ（`cloud_default`）
- `CLAUDE_CODE_VERSION`: Claude Codeバージョン
- `CLAUDE_CODE_DEBUG`: デバッグモード有効化
- `CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR`: WebSocket認証用FD
- `CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR`: OAuth トークン用FD

## Claude CLIバイナリ情報

### 基本情報

- **バージョン**: 2.0.23
- **パッケージ名**: `@anthropic-ai/claude-code`
- **タイプ**: Node.jsアプリケーション（minified）
- **バイナリパス**: `/opt/node22/bin/claude` → `../lib/node_modules/@anthropic-ai/claude-code/cli.js`
- **説明**: "Use Claude, Anthropic's AI assistant, right from your terminal"

### インストール情報

Node.jsのグローバルパッケージとしてインストール：
```bash
/opt/node22/lib/node_modules/@anthropic-ai/claude-code/
```

## 起動フロー

1. **環境管理開始**
   ```bash
   /usr/local/bin/environment-manager task-run --stdin --session <SESSION_ID> --session-mode resume
   ```

2. **環境変数設定**
   - `CLAUDE_CODE_*`環境変数が設定される
   - `GITHUB_TOKEN`などの認証情報が設定される

3. **Claude起動**
   ```bash
   /opt/node22/bin/claude
   # (引数なし、環境変数で制御)
   ```

4. **WebSocket接続**
   - Claude Code APIサーバーへ接続
   - セッション情報を送受信

## カスタマイズ可能な項目

### 1. 許可ツールの制限

特定のツールのみを許可：
```bash
environment-manager task-run \
  --allowed-tools "Bash,Read,Write,Edit" \
  ...
```

### 2. デバッグモード

詳細ログ出力：
```bash
environment-manager task-run \
  --debug \
  --log-level debug \
  --verbose-claude-logs \
  ...
```

### 3. Gitモード変更

MCPベースのGitサーバー使用：
```bash
environment-manager task-run \
  --git-mode mcp \
  ...
```

### 4. セッションモード

完全な新規セッション：
```bash
environment-manager task-run \
  --session-mode new \
  ...
```

### 5. 自動アップグレード

最新版に自動更新：
```bash
environment-manager task-run \
  --upgrade-claude-code=true \
  ...
```

## セキュリティ考慮事項

### ツール制限

`--allowed-tools`を使用して、実行可能なツールを制限できます。例：

- **最小権限**: `"Read,Glob,Grep"` - 読み取り専用
- **安全な編集**: `"Read,Edit,Write,Glob,Grep"` - ファイル操作のみ
- **フル権限**: すべてのツール（デフォルト）

### Git操作の制御

- `http-proxy`モード: ローカルプロキシ経由（現在の設定）
- `mcp`モード: Model Context Protocol経由

### デバッグ情報の制御

- `--debug`フラグで詳細ログを有効化
- `--log-level`でログレベルを調整
- 本番環境では`info`または`warn`推奨

## ローカルテスト用設定

開発・テスト時の設定例：

```bash
environment-manager task-run \
  --local-testing \
  --debug \
  --verbose-claude-logs \
  --session-mode new \
  --upgrade-claude-code=false \
  --session test_session_123
```

## 参考情報

### ヘルプコマンド

```bash
# environment-manager全体のヘルプ
/usr/local/bin/environment-manager --help

# task-runコマンドのヘルプ
/usr/local/bin/environment-manager task-run --help
```

### バージョン確認

```bash
# environment-managerバージョン
/usr/local/bin/environment-manager --version

# Claudeバージョン
/opt/node22/bin/claude --version  # (現在の環境では制限あり)
```

## 制限事項と注意点

1. **Claude CLIの直接実行制限**
   - `claude`コマンドは直接実行できない（環境変数依存）
   - `environment-manager`経由での起動が必須

2. **最小化されたソースコード**
   - `cli.js`はminified（難読化済み）
   - デバッグには制限あり

3. **環境依存**
   - クラウド環境（`cloud_default`）に特化
   - ローカル環境での動作は要設定

4. **セッション管理**
   - セッションIDが必須
   - 複数セッションの同時実行には注意

## まとめ

Claude Codeは`environment-manager`によって管理され、豊富なオプションでカスタマイズ可能です。主要なオプション：

| カテゴリ | オプション | 用途 |
|---------|-----------|------|
| セッション | `--session-mode` | new/resume/setup-only |
| ツール制限 | `--allowed-tools` | 実行可能ツールの制限 |
| アップグレード | `--upgrade-claude-code` | 自動更新の制御 |
| Git | `--git-mode` | http-proxy/mcp |
| デバッグ | `--debug`, `--log-level` | ログレベル制御 |
| テスト | `--local-testing` | ローカル開発用 |

現在の環境では、`resume`モードで既存セッションを再開し、自動アップグレードを無効化して実行されています。
