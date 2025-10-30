# Claude Code起動オプションとシステム設定の詳細調査

**調査日**: 2025-10-30
**セッション**: session_011CUdY5EvDkhnfn3Kx16rvA
**Claude Codeバージョン**: 2.0.25
**前回調査**: 2025-10-29 (v2.0.23)

---

## 目次

1. [概要](#概要)
2. [プロセス構造](#プロセス構造)
3. [起動パラメータ](#起動パラメータ)
4. [環境変数](#環境変数)
5. [設定ファイル](#設定ファイル)
6. [フィーチャーフラグ](#フィーチャーフラグ)
7. [システムプロンプト](#システムプロンプト)
8. [フックシステム](#フックシステム)
9. [ツールパーミッション](#ツールパーミッション)
10. [MCPサーバー](#mcpサーバー)
11. [デバッグ機能](#デバッグ機能)

---

## 概要

Claude Code on the Webは、複数のプロセスとコンポーネントから構成される複雑なシステムです。このドキュメントでは、起動時のオプション、設定、内部パラメータについて詳細に調査した結果をまとめます。

**更新内容** (2025-10-30):
- プロセス構造の完全な解明
- Claude CLIの起動パラメータ全リスト
- フックシステムの全イベントタイプ
- フィーチャーフラグとStatsigゲート
- 設定スキーマの完全なドキュメント化

---

## プロセス構造

### 主要プロセス

```
process_api (PID 1)
  └── environment-manager (PID 21)
      └── claude (PID 43) ← Node.js 22で実行
          ├── npm exec @upstash/context7-mcp (PID 111)
          │   └── node context7-mcp (PID 537)
          └── [bashセッション] (動的に生成)
```

### プロセス詳細

#### 1. process_api (PID 1)

**実行ファイル**: `/process_api`
**種類**: ELF 64-bit LSB pie executable (static-pie linked, stripped)

**起動パラメータ**:
```bash
/process_api \
  --addr 0.0.0.0:2024 \
  --max-ws-buffer-size 32768 \
  --cpu-shares 4096 \
  --oom-polling-period-ms 100 \
  --memory-limit-bytes 8589934592
```

**役割**:
- WebSocket通信の管理 (ポート2024)
- リソース制限の適用
- OOMキラーの監視

**設定値の意味**:
- `addr`: WebSocket待受アドレス
- `max-ws-buffer-size`: 32KB (WebSocketバッファ)
- `cpu-shares`: 4096 (4コア相当)
- `oom-polling-period-ms`: 100ms (メモリ監視間隔)
- `memory-limit-bytes`: 8589934592 (8GB)

#### 2. environment-manager (PID 21)

**実行ファイル**: `/usr/local/bin/environment-manager`
**種類**: ELF 64-bit LSB executable (with debug_info, not stripped)

**起動パラメータ**:
```bash
/usr/local/bin/environment-manager task-run \
  --stdin \
  --session session_011CUdY5EvDkhnfn3Kx16rvA \
  --session-mode resume-cached \
  --upgrade-claude-code=False
```

**役割**:
- セッション管理
- Claude Codeプロセスの起動と管理
- キャッシュされたセッションの復元

**利用可能なオプション** (`environment-manager task-run --help`):

| オプション | デフォルト | 説明 |
|-----------|-----------|------|
| `--session` | (必須) | セッションID |
| `--session-mode` | `new` | new/resume/resume-cached/setup-only |
| `--stdin` | - | 標準入力からJSON設定を読み取る |
| `--upgrade-claude-code` | `true` | 起動前に最新バージョンにアップグレード |
| `--allowed-tools` | (全て) | カンマ区切りで許可するツールを指定 |
| `--git-mode` | `http-proxy` | http-proxy/mcp |
| `--debug` | - | デバッグモードを有効化 |
| `--log-level` | `info` | debug/info/warn/error |
| `--verbose-claude-logs` | - | Claude Codeの詳細ログをコンソールに出力 |
| `--local-testing` | - | スタンドアロンモードで実行 |

#### 3. claude (PID 43)

**実行ファイル**: `/opt/node22/bin/node`
**実体**: Node.js 22.x
**JavaScriptエントリポイント**: `/opt/node22/lib/node_modules/@anthropic-ai/claude-code/cli.js`

**パッケージ情報**:
```json
{
  "name": "@anthropic-ai/claude-code",
  "version": "2.0.25",
  "main": "sdk.mjs",
  "bin": {
    "claude": "cli.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 起動パラメータ

Claude Codeプロセス（PID 43）の完全な起動コマンドライン：

```bash
claude \
  --output-format=stream-json \
  --verbose \
  --replay-user-messages \
  --input-format=stream-json \
  --debug-to-stderr \
  --allowed-tools Task,Bash,Glob,Grep,ExitPlanMode,Read,Edit,MultiEdit,Write,NotebookEdit,WebFetch,TodoWrite,WebSearch,BashOutput,KillBash,Tmux,mcp__codesign__sign_file \
  --disallowed-tools Bash(gh:*) \
  --append-system-prompt "[システムプロンプト内容]" \
  --add-dir /home/user/cc-web-playground \
  --sdk-url wss://api.anthropic.com/v1/session_ingress/ws/session_011CUdY5EvDkhnfn3Kx16rvA \
  --resume=https://api.anthropic.com/v1/session_ingress/session/session_011CUdY5EvDkhnfn3Kx16rvA \
  --debug
```

### パラメータ詳細

| パラメータ | 値 | 説明 |
|-----------|-----|------|
| `--output-format` | `stream-json` | 出力形式（ストリーミングJSON） |
| `--verbose` | - | 詳細ログを有効化 |
| `--replay-user-messages` | - | ユーザーメッセージの再生を有効化 |
| `--input-format` | `stream-json` | 入力形式（ストリーミングJSON） |
| `--debug-to-stderr` | - | デバッグログをstderrに出力 |
| `--allowed-tools` | (ツールリスト) | 利用可能なツールのホワイトリスト |
| `--disallowed-tools` | `Bash(gh:*)` | 禁止されたツールのブラックリスト |
| `--append-system-prompt` | (プロンプト) | システムプロンプトに追加する内容 |
| `--add-dir` | (ディレクトリパス) | 作業ディレクトリの指定 |
| `--sdk-url` | (WebSocket URL) | SDK WebSocketエンドポイント |
| `--resume` | (HTTPS URL) | セッション復元用エンドポイント |
| `--debug` | - | デバッグモードを有効化 |

### 利用可能なツール

起動時に`--allowed-tools`で指定されているツール一覧：

1. **Task** - サブエージェントの起動
2. **Bash** - シェルコマンド実行
3. **Glob** - ファイルパターンマッチング
4. **Grep** - コード検索
5. **ExitPlanMode** - プランモード終了
6. **Read** - ファイル読み取り
7. **Edit** - ファイル編集
8. **MultiEdit** - 複数ファイル一括編集
9. **Write** - ファイル書き込み
10. **NotebookEdit** - Jupyter Notebook編集
11. **WebFetch** - Web コンテンツ取得
12. **TodoWrite** - Todoリスト管理
13. **WebSearch** - Web検索
14. **BashOutput** - バックグラウンドBashの出力取得
15. **KillBash** - Bashプロセス終了
16. **Tmux** - Tmuxセッション管理
17. **mcp__codesign__sign_file** - コード署名MCPツール

---

## 環境変数

### Claude Code専用環境変数

| 変数名 | 値 | 説明 |
|-------|-----|------|
| `CLAUDE_CODE_VERSION` | `2.0.25` | Claude Codeのバージョン |
| `CLAUDE_CODE_CONTAINER_ID` | `container_011CUdY5G9939jkr1JM4igi8` | コンテナID |
| `CLAUDE_CODE_DEBUG` | `true` | **デバッグモードが有効** |
| `CLAUDE_CODE_REMOTE` | `true` | リモート環境であることを示す |
| `CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE` | `cloud_default` | 環境タイプ（クラウドデフォルト） |
| `CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR` | `4` | OAuthトークン用ファイルディスクリプタ |
| `CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR` | `3` | WebSocket認証用ファイルディスクリプタ |
| `CLAUDE_CODE_ENTRYPOINT` | `sdk-cli` | エントリポイント識別子 |
| `CLAUDECODE` | `1` | Claude Code環境フラグ |

### モデル・API設定

| 変数名 | 値 | 説明 |
|-------|-----|------|
| `ANTHROPIC_BASE_URL` | `https://api.anthropic.com` | Anthropic APIのベースURL |
| `MAX_THINKING_TOKENS` | `31999` | **最大思考トークン数** |

### プロキシ設定

| 変数名 | 値 | 説明 |
|-------|-----|------|
| `HTTPS_PROXY` | `http://container_...@21.0.0.113:15002` | HTTPSプロキシ |
| `HTTP_PROXY` | `http://container_...@21.0.0.113:15002` | HTTPプロキシ |
| `NO_PROXY` | `localhost,127.0.0.1,169.254.169.254,metadata.google.internal,*.svc.cluster.local,*.local,*.googleapis.com,*.google.com` | プロキシバイパス対象 |

### MCP設定

| 変数名 | 値 | 説明 |
|-------|-----|------|
| `CODESIGN_MCP_PORT` | `21170` | CodeSign MCPサーバーポート |
| `CODESIGN_MCP_TOKEN` | `RmDDnR4p6QZOCM-_NSHImRZwEYS6wzbBg_iM-2uWdqc=` | CodeSign MCP認証トークン |

### その他の環境設定

| 変数名 | 値 | 説明 |
|-------|-----|------|
| `IS_SANDBOX` | `yes` | サンドボックス環境フラグ |
| `CCR_TEST_GITPROXY` | `1` | GitプロキシテストフラグMCP |

---

## 設定ファイル

### 1. ~/.claude/settings.json

**場所**: `/root/.claude/settings.json`
**用途**: グローバル設定

**現在の設定内容**:
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/stop-hook-git-check.sh"
          }
        ]
      }
    ]
  }
}
```

### 2. ~/.claude.json

**場所**: `/root/.claude.json`
**用途**: 内部状態管理（自動生成）

**重要なフィールド**:
```json
{
  "installMethod": "unknown",
  "autoUpdates": true,
  "cachedStatsigGates": {
    "tengu_disable_bypass_permissions_mode": false,
    "tengu_tool_pear": false
  },
  "firstStartTime": "2025-10-30T14:25:19.836Z",
  "userID": "6420b0323f69848b78582131be30aa60f09e8f39e3f39bed36e009d0e2e693b9",
  "sonnet45MigrationComplete": true,
  "fallbackAvailableWarningThreshold": 0.5,
  "projects": {
    "/home/user/cc-web-playground": {
      "allowedTools": [],
      "mcpServers": {},
      "ignorePatterns": [],
      "hasTrustDialogAccepted": false
    }
  }
}
```

### 3. 設定スキーマ

**URL**: https://json.schemastore.org/claude-code-settings.json

**利用可能な設定オプション**:

#### パーミッション設定
```json
{
  "permissions": {
    "allow": ["Bash(git add:*)"],
    "ask": ["Bash(gh pr create:*)"],
    "deny": ["Read(*.env)", "Bash(rm:*)"],
    "defaultMode": "default|acceptEdits|bypassPermissions|plan",
    "disableBypassPermissionsMode": "disable",
    "additionalDirectories": ["/path/to/dir"]
  }
}
```

#### 環境変数設定
```json
{
  "env": {
    "ANTHROPIC_MODEL": "claude-opus-4-1",
    "ANTHROPIC_SMALL_FAST_MODEL": "claude-3-5-haiku-latest"
  }
}
```

#### MCPサーバー設定
```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["memory", "github"],
  "disabledMcpjsonServers": ["filesystem"]
}
```

#### その他の設定
```json
{
  "apiKeyHelper": "/bin/generate_temp_api_key.sh",
  "cleanupPeriodDays": 30,
  "includeCoAuthoredBy": true
}
```

---

## フィーチャーフラグ

### Statsigゲート（~/.claude.jsonに記録）

| フラグ名 | 現在値 | 説明 |
|---------|-------|------|
| `tengu_disable_bypass_permissions_mode` | `false` | バイパスパーミッションモードの無効化（現在は有効） |
| `tengu_tool_pear` | `false` | ツールPear機能（不明） |

### その他のフラグ

- `autoUpdates`: `true` - 自動アップデート有効
- `sonnet45MigrationComplete`: `true` - Sonnet 4.5への移行完了
- `fallbackAvailableWarningThreshold`: `0.5` - フォールバック警告閾値（50%）

---

## システムプロンプト

起動ログから抽出されたシステムプロンプト（`--append-system-prompt`で追加）:

```
You are Claude, an AI assistant designed to help with GitHub issues and pull requests. Think carefully as you analyze the context and respond appropriately. Here's the context for your current task:
Your task is to complete the request described in the task description.

Instructions:
1. For questions: Research the codebase and provide a detailed answer
2. For implementations: Make the requested changes, commit, and push

## Git Development Branch Requirements

You are working on the following feature branches:

 **oikon48/cc-web-playground**: Develop on branch `claude/review-research-gaps-011CUdY5EvDkhnfn3Kx16rvA`

### Important Instructions:

1. **DEVELOP** all your changes on the designated branch above
2. **COMMIT** your work with clear, descriptive commit messages
3. **PUSH** to the specified branch when your changes are complete
4. **CREATE** the branch locally if it doesn't exist yet
5. **NEVER** push to a different branch without explicit permission

Remember: All development and final pushes should go to the branches specified above.

## Git Operations

Follow these practices for git:

**For git push:**
- Always use git push -u origin <branch-name>
- CRITICAL: the branch should start with 'claude/' and end with matching session id, otherwise push will fail with 403 http code.
- Only if push fails due to network errors retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
- Example retry logic: try push, wait 2s if failed, try again, wait 4s if failed, try again, etc.

**For git fetch/pull:**
- Prefer fetching specific branches: git fetch origin <branch-name>
- If network failures occur, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
- For pulls use: git pull origin <branch-name>

The GitHub CLI (`gh`) is not available in this environment. For GitHub issues ask the user to provide the necessary information directly.
```

**注記**: このシステムプロンプトは、Web環境特有のGit操作ルールを含んでいます。

---

## フックシステム

### 利用可能なフックイベント

設定スキーマから判明した全フックイベント：

1. **PreToolUse** - ツール実行前
2. **PostToolUse** - ツール実行後
3. **Notification** - 通知時
4. **UserPromptSubmit** - ユーザープロンプト送信時
5. **Stop** - エージェント応答完了時
6. **SubagentStop** - サブエージェント応答完了時
7. **PreCompact** - コンパクション前

### フック設定例

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write",
            "timeout": 5
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/stop-hook-git-check.sh"
          }
        ]
      }
    ]
  }
}
```

### フックの動作

ログから判明した動作：
- フックマッチャーは正規表現パターンでツール名をフィルタ
- 各ツール実行前後にフックが評価される
- 現在の環境ではStopフックのみが設定されている

---

## ツールパーミッション

### パーミッションモード

| モード | 説明 |
|-------|------|
| `default` | デフォルト（通常の承認フロー） |
| `acceptEdits` | 編集を自動承認 |
| `bypassPermissions` | パーミッションをバイパス（全て許可） |
| `plan` | プランモード |

### パーミッションルールパターン

スキーマから判明した正規表現パターン：
```regex
^((Bash|BashOutput|Edit|ExitPlanMode|Glob|Grep|KillShell|NotebookEdit|Read|SlashCommand|Task|TodoWrite|WebFetch|WebSearch|Write)(\((?=.*[^)*?])[^)]+\))?|mcp__.*)$
```

### 設定例

```json
{
  "permissions": {
    "allow": [
      "Bash(git commit:*)",
      "Bash(npm run lint:*)",
      "Edit(/src/**/*.ts)"
    ],
    "ask": [
      "Bash(gh pr create:*)"
    ],
    "deny": [
      "Read(*.env)",
      "Read(//Users/alice/secrets/**)",
      "Bash(rm:*)"
    ],
    "defaultMode": "default"
  }
}
```

---

## MCPサーバー

### 起動中のMCPサーバー

#### 1. CodeSign MCP

**プロセス**: PID 43の子プロセス内で動作
**ポート**: `$CODESIGN_MCP_PORT` (21170)
**認証トークン**: `$CODESIGN_MCP_TOKEN`

**機能**:
- ファイル署名
- Git コミット署名

**利用可能なツール**:
- `mcp__codesign__sign_file` - ファイル署名ツール

#### 2. Context7 MCP

**プロセス**: `npm exec @upstash/context7-mcp` (PID 111)
**Node プロセス**: PID 537

**機能**:
- ライブラリドキュメントの取得
- コンテキスト7統合

**ログからの起動メッセージ**:
```
[DEBUG] MCP server "context7": Starting connection with timeout of 30000ms
```

### MCP設定オプション

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["memory", "github"],
  "disabledMcpjsonServers": ["filesystem"]
}
```

---

## デバッグ機能

### デバッグモードの有効化

**環境変数**: `CLAUDE_CODE_DEBUG=true`
**起動パラメータ**: `--debug`, `--debug-to-stderr`

### デバッグログの確認

**ログファイル**: `/tmp/claude-code.log`

**ログレベルと内容**:
```
[DEBUG] - デバッグ情報
[ERROR] - エラー情報
```

### 主なデバッグ情報

起動ログから判明したデバッグ情報：

1. **OAuth認証**
   ```
   [DEBUG] Successfully read OAuth token from file descriptor 4
   ```

2. **WebSocket認証**
   ```
   [DEBUG] Successfully read token from file descriptor 3
   ```

3. **設定ファイル監視**
   ```
   [DEBUG] Watching for changes in setting files /root/.claude/settings.json, /home/user/cc-web-playground/.claude/settings.json...
   ```

4. **Ripgrep検証**
   ```
   [DEBUG] Ripgrep first use test: PASSED (mode=builtin, path=/opt/node22/lib/node_modules/@anthropic-ai/claude-code/vendor/ripgrep/x64-linux/rg)
   ```

5. **フック実行**
   ```
   [DEBUG] executePreToolHooks called for tool: Bash
   [DEBUG] Getting matching hook commands for PreToolUse with query: Bash
   [DEBUG] Found 0 hook matchers in settings
   ```

6. **スキル・コマンド**
   ```
   [DEBUG] Loaded 0 skills total (managed: 0, user: 0, project: 0)
   [DEBUG] Skills and commands included in Skill tool:
   [DEBUG] Slash commands included in SlashCommand tool:
   ```

7. **セッション永続化**
   ```
   [DEBUG] Successfully persisted session log entry for session 1f33813f-ffd5-489d-b890-a97c93107c02
   ```

### シェルスナップショット

```
[DEBUG] Creating shell snapshot for bash (/bin/bash)
[DEBUG] Looking for shell config file: /root/.bashrc
[DEBUG] Snapshots directory: /root/.claude/shell-snapshots
[DEBUG] Creating snapshot at: /root/.claude/shell-snapshots/snapshot-bash-1761834320119-ej5v09.sh
```

**スナップショットディレクトリ**: `~/.claude/shell-snapshots/`

---

## ディレクトリ構造

### ~/.claude/

```
/root/.claude/
├── projects/
│   └── -home-user-cc-web-playground/
│       ├── 1f33813f-ffd5-489d-b890-a97c93107c02.jsonl  (空)
│       └── 98c14842-b0f0-4c4b-af4b-83234013e831.jsonl  (336KB, 117行)
├── session-env/
│   └── 1f33813f-ffd5-489d-b890-a97c93107c02/  (空)
├── shell-snapshots/
│   └── snapshot-bash-1761834320119-ej5v09.sh
├── statsig/
├── todos/
│   └── 98c14842-b0f0-4c4b-af4b-83234013e831-agent-*.json
├── settings.json
├── stop-hook-git-check.sh
└── .claude.json  (内部状態)
```

### セッションログ形式

プロジェクトごとのJSONLファイルに会話履歴が保存される：
- 各行が1つのメッセージ
- UUID、タイムスタンプ、モデル情報を含む
- 思考プロセス（thinking）も記録される

---

## まとめ

### 重要な発見

1. **Claude Codeはマルチプロセス構成**
   - process_api (Go?) → environment-manager → claude (Node.js)

2. **デバッグモードが有効**
   - `CLAUDE_CODE_DEBUG=true`
   - 詳細なログが `/tmp/claude-code.log` に記録

3. **最大思考トークン数**
   - `MAX_THINKING_TOKENS=31999` （約32Kトークン）

4. **リソース制限**
   - CPU: 4コア (cpu-shares 4096)
   - メモリ: 8GB
   - WebSocketバッファ: 32KB

5. **利用可能なフックイベント**
   - 7種類以上のフックポイントが存在
   - PreToolUse, PostToolUse, Stop など

6. **フィーチャーフラグ**
   - Statsigによる機能制御
   - 現在2つのゲートが確認済み

7. **MCPサーバー**
   - CodeSign MCP (署名)
   - Context7 MCP (ドキュメント取得)

8. **パーミッションシステム**
   - allow, ask, deny の3段階制御
   - 正規表現による細かい制御が可能

### セキュリティ考慮事項

- OAuthトークンはファイルディスクリプタ4から読み取り
- WebSocket認証はファイルディスクリプタ3から読み取り
- プロキシJWT認証経由で外部通信
- コンテナIDベースの識別子を使用

### 前回調査からの変更点 (v2.0.23 → v2.0.25)

- バージョンアップ（2.0.23 → 2.0.25）
- `--session-mode`に`resume-cached`が追加
- Context7 MCPサーバーが追加
- Statsigゲートの追加

### 次のステップ

- [ ] フックシステムの高度な活用例の作成
- [ ] MCPサーバーのカスタマイズ方法の調査
- [ ] パーミッションルールのベストプラクティス確立
- [ ] Statsigゲートの詳細調査

---

## 参考資料

- [Claude Code公式ドキュメント](https://docs.claude.com/en/docs/claude-code)
- [設定スキーマ](https://json.schemastore.org/claude-code-settings.json)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)

---

**最終更新**: 2025-10-30
**調査者**: Claude (Anthropic)
**セッション**: session_011CUdY5EvDkhnfn3Kx16rvA
