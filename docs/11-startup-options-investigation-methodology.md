# Claude Code起動オプション調査方法論

**調査日**: 2025-10-30
**セッション**: session_011CUdY5EvDkhnfn3Kx16rvA
**Claude Codeバージョン**: 2.0.25

---

## 目次

1. [調査の概要](#調査の概要)
2. [調査方法一覧](#調査方法一覧)
3. [プロセス情報の調査](#プロセス情報の調査)
4. [環境変数の調査](#環境変数の調査)
5. [設定ファイルの調査](#設定ファイルの調査)
6. [ログファイルの調査](#ログファイルの調査)
7. [ユーザーがカスタマイズ可能な設定](#ユーザーがカスタマイズ可能な設定)
8. [調査結果の検証方法](#調査結果の検証方法)

---

## 調査の概要

このドキュメントでは、Claude Code on the Webの起動オプション、環境変数、システム設定を調査した**具体的な方法**を記録します。

### 調査の目的

- 起動時のパラメータを特定する
- 環境変数の完全なリストを取得する
- 設定ファイルの場所と内容を把握する
- ユーザーがカスタマイズ可能な項目を明確にする

---

## 調査方法一覧

| 調査対象 | 主要コマンド | 難易度 | 所要時間 |
|---------|------------|--------|---------|
| プロセス構造 | `ps`, `pstree` | ⭐ | 5分 |
| 起動パラメータ | `/proc/*/cmdline` | ⭐⭐ | 10分 |
| 環境変数 | `/proc/*/environ` | ⭐ | 5分 |
| 設定ファイル | `find`, `cat` | ⭐ | 10分 |
| ログファイル | `tail`, `grep` | ⭐⭐ | 15分 |
| 設定スキーマ | `curl` JSON Schema | ⭐⭐ | 10分 |

---

## プロセス情報の調査

### 1. プロセス一覧の取得

#### 方法1: CPU使用率順にプロセスを表示

```bash
ps aux --sort=-%cpu | head -20
```

**出力例**:
```
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root       111  3.2  1.5 1373144 210480 ?      Sl   14:25   0:09 npm exec @upstash/context7-mcp
root         1  2.0  0.0  50188 13480 ?        Ssl  14:25   0:05 /process_api --addr 0.0.0.0:2024 ...
root        43  1.4  2.2 32912744 303924 ?     Sl   14:25   0:04 claude
```

**判明する情報**:
- PID（プロセスID）
- CPU/メモリ使用率
- 実行コマンド

#### 方法2: Claude関連プロセスのフィルタリング

```bash
ps -eo pid,comm,cmd | grep -E "(claude|process_api|node)" | head -30
```

**出力例**:
```
    1 process_api     /process_api --addr 0.0.0.0:2024 --max-ws-buffer-size 32768 ...
   21 environment-man /usr/local/bin/environment-manager task-run --stdin ...
   43 claude          claude
  111 npm exec @upsta npm exec @upstash/context7-mcp
  537 node            node /root/.npm/_npx/eea2bd7412d4593b/node_modules/.bin/context7-mcp
```

**判明する情報**:
- Claude Codeの全プロセス
- 親子関係（PIDから推測）

#### 方法3: プロセスツリーの表示

```bash
pstree -p 1 | head -50
```

**出力例**:
```
process_api(1)-+-sh(19)---environment-man(21)-+-claude(43)-+-bash(1437)
               |                              |            |-npm exec @upsta(111)-+-sh(536)---node(537)
```

**判明する情報**:
- プロセスの階層構造
- 親子関係が明確

**🎯 ポイント**: `pstree`でプロセスの依存関係を視覚的に把握できる

---

### 2. 起動パラメータの取得

#### /proc/[PID]/cmdlineを読み取る

```bash
# process_api (PID 1)
cat /proc/1/cmdline | tr '\0' '\n'
```

**出力**:
```
/process_api
--addr
0.0.0.0:2024
--max-ws-buffer-size
32768
--cpu-shares
4096
--oom-polling-period-ms
100
--memory-limit-bytes
8589934592
```

**なぜこの方法?**:
- `/proc/[PID]/cmdline`にはプロセスの起動引数が`\0`区切りで格納されている
- `tr '\0' '\n'`でnull文字を改行に変換して読みやすくする

#### environment-managerの起動パラメータ

```bash
cat /proc/21/cmdline | tr '\0' '\n'
```

**出力**:
```
/usr/local/bin/environment-manager
task-run
--stdin
--session
session_011CUdY5EvDkhnfn3Kx16rvA
--session-mode
resume-cached
--upgrade-claude-code=False
```

#### claudeプロセスの実体を確認

```bash
# 実行ファイルの確認
readlink /proc/43/exe
```

**出力**:
```
/opt/node22/bin/node
```

**判明**: claudeはNode.js 22で実行されている

```bash
# 実際のスクリプトを探す
which claude
ls -la $(which claude)
```

**出力**:
```
/opt/node22/bin/claude
lrwxrwxrwx 1 root root 52 Oct 23 19:03 /opt/node22/bin/claude -> ../lib/node_modules/@anthropic-ai/claude-code/cli.js
```

**🎯 ポイント**: シンボリックリンクを辿ることで実際のスクリプトの場所が判明

---

### 3. ログから起動コマンドを取得

```bash
head -100 /tmp/claude-code.log
```

**重要な箇所**:
```
[2025-10-30 14:25:18.346] Executing Claude Code
Command: claude
Args: [--output-format=stream-json --verbose --replay-user-messages --input-format=stream-json --debug-to-stderr --allowed-tools Task,Bash,Glob,Grep,ExitPlanMode,Read,Edit,MultiEdit,Write,NotebookEdit,WebFetch,TodoWrite,WebSearch,BashOutput,KillBash,Tmux,mcp__codesign__sign_file --disallowed-tools Bash(gh:*) --append-system-prompt ...
```

**判明する情報**:
- Claude CLIの完全な起動コマンドライン
- システムプロンプトの内容（抜粋）
- 許可/禁止されたツールのリスト

**🎯 ポイント**: ログファイルには起動時の完全なコマンドラインが記録されている

---

## 環境変数の調査

### 1. プロセスの環境変数を取得

#### 全環境変数の取得

```bash
cat /proc/43/environ | tr '\0' '\n' | sort
```

**出力例**:
```
ANTHROPIC_BASE_URL=https://api.anthropic.com
CLAUDE_CODE_CONTAINER_ID=container_011CUdY5G9939jkr1JM4igi8
CLAUDE_CODE_DEBUG=true
CLAUDE_CODE_VERSION=2.0.25
MAX_THINKING_TOKENS=31999
...
```

**なぜこの方法?**:
- `/proc/[PID]/environ`にはプロセス起動時の環境変数が保存されている
- 現在のシェルの環境変数ではなく、プロセスが実際に受け取った値を確認できる

#### CLAUDE関連のみをフィルタ

```bash
cat /proc/43/environ | tr '\0' '\n' | grep -E "^(CLAUDE|NODE|NPM|PATH)" | sort
```

**出力**:
```
CLAUDE_CODE_CONTAINER_ID=container_011CUdY5G9939jkr1JM4igi8
CLAUDE_CODE_DEBUG=true
CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR=4
CLAUDE_CODE_REMOTE=true
CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE=cloud_default
CLAUDE_CODE_VERSION=2.0.25
CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR=3
NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt
```

#### 現在のシェルの環境変数

```bash
env | grep -E "^(CLAUDE|MAX_|ANTHROPIC|DEBUG)" | sort
```

**出力**:
```
ANTHROPIC_BASE_URL=https://api.anthropic.com
CLAUDECODE=1
CLAUDE_CODE_CONTAINER_ID=container_011CUdY5G9939jkr1JM4igi8
CLAUDE_CODE_DEBUG=true
CLAUDE_CODE_ENTRYPOINT=sdk-cli
CLAUDE_CODE_VERSION=2.0.25
MAX_THINKING_TOKENS=31999
```

**🎯 ポイント**: `/proc/*/environ`と`env`の両方を確認することで、プロセス固有の環境変数とシェルの環境変数を区別できる

---

### 2. ファイルディスクリプタの確認

```bash
ls -la /proc/43/fd/ | head -20
```

**出力**:
```
lrwxrwxrwx 1 root root 0 Oct 30 14:25 0 -> pipe:[30]
lrwxrwxrwx 1 root root 0 Oct 30 14:25 1 -> pipe:[31]
lrwxrwxrwx 1 root root 0 Oct 30 14:25 2 -> pipe:[32]
lrwxrwxrwx 1 root root 0 Oct 30 14:25 3 -> pipe:[28]   # WebSocket認証
lrwxrwxrwx 1 root root 0 Oct 30 14:25 4 -> pipe:[29]   # OAuth トークン
```

**判明する情報**:
- FD 3: WebSocket認証トークン
- FD 4: OAuthトークン

**確認方法**:
```bash
ls -la /proc/43/fd/3
ls -la /proc/43/fd/4
```

**🎯 ポイント**: ファイルディスクリプタ3と4が認証情報の受け渡しに使われている

---

## 設定ファイルの調査

### 1. 設定ファイルの場所を特定

#### Claudeディレクトリの探索

```bash
ls -la ~/.claude/
```

**出力**:
```
drwxr-xr-x 1 root root 4096 Oct 30 14:29 .
drwx------ 1 root root 4096 Oct 30 14:25 ..
drwx------ 3 root root 4096 Oct 30 14:25 projects
drwxr-xr-x 3 root root 4096 Oct 30 14:29 session-env
-rw------- 1 root root  293 Oct 30 03:50 settings.json
drwxr-xr-x 2 root root 4096 Oct 30 14:25 shell-snapshots
-rwxr-xr-x 1 root root 1754 Oct 30 03:50 stop-hook-git-check.sh
```

#### 全設定ファイルの検索

```bash
find ~/.claude -type f -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.toml" 2>/dev/null
```

**出力**:
```
/root/.claude/settings.json
/root/.claude/todos/98c14842-b0f0-4c4b-af4b-83234013e831-agent-*.json
/root/.claude.json
```

**🎯 ポイント**: `find`で設定ファイルの種類を網羅的に検索

---

### 2. 設定ファイルの内容を確認

#### グローバル設定

```bash
cat ~/.claude/settings.json
```

**出力**:
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

**判明する情報**:
- Stopフックが設定されている
- スキーマのURLが記載されている

#### 内部状態ファイル

```bash
cat ~/.claude.json
```

**出力**:
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
  "sonnet45MigrationComplete": true
}
```

**判明する情報**:
- フィーチャーフラグ（Statsigゲート）
- ユーザーID
- 初回起動時刻

**🎯 ポイント**: `.claude.json`（ドットあり）には内部状態が保存されている

---

### 3. 設定スキーマの取得

```bash
curl -sL https://www.schemastore.org/claude-code-settings.json | jq '.' | head -300
```

**出力**（抜粋）:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://json.schemastore.org/claude-code-settings.json",
  "properties": {
    "permissions": {
      "type": "object",
      "properties": {
        "allow": { "type": "array" },
        "ask": { "type": "array" },
        "deny": { "type": "array" },
        "defaultMode": { "enum": ["default", "acceptEdits", "bypassPermissions", "plan"] }
      }
    },
    "hooks": {
      "type": "object",
      "properties": {
        "PreToolUse": { "type": "array" },
        "PostToolUse": { "type": "array" },
        "Stop": { "type": "array" },
        "SubagentStop": { "type": "array" }
      }
    }
  }
}
```

**判明する情報**:
- 利用可能な設定項目の完全リスト
- 各項目のデータ型と制約
- フックイベントの種類

**🎯 ポイント**: JSON Schemaから未文書化の設定オプションを発見できる

---

### 4. プロジェクト設定の確認

```bash
ls -laR ~/.claude/projects/
```

**出力**:
```
/root/.claude/projects/-home-user-cc-web-playground:
-rw-r--r-- 1 root root 336116 Oct 30 14:32 98c14842-b0f0-4c4b-af4b-83234013e831.jsonl
```

#### セッションログの確認

```bash
wc -l ~/.claude/projects/-home-user-cc-web-playground/98c14842-b0f0-4c4b-af4b-83234013e831.jsonl
head -5 ~/.claude/projects/-home-user-cc-web-playground/98c14842-b0f0-4c4b-af4b-83234013e831.jsonl
```

**出力**:
```
117 /root/.claude/projects/-home-user-cc-web-playground/98c14842-b0f0-4c4b-af4b-83234013e831.jsonl
```

**判明する情報**:
- 会話履歴が117行（117メッセージ）
- JSONL形式（1行1メッセージ）
- 思考プロセスも記録されている

---

## ログファイルの調査

### 1. ログファイルの場所特定

```bash
find /tmp -name "*claude*" 2>/dev/null | head -20
```

**出力**:
```
/tmp/claude-code.log
/tmp/claude-4088-cwd
/tmp/claude-bcc3-cwd
```

### 2. ログの内容確認

```bash
head -100 /tmp/claude-code.log
```

**重要なログエントリ**:

#### 起動情報
```
========================================
[2025-10-30 14:25:18.346] Executing Claude Code
Command: claude
Args: [--output-format=stream-json --verbose ...]
Session: session_011CUdY5EvDkhnfn3Kx16rvA
Working Dir: /home/user/cc-web-playground
========================================
```

#### 設定ファイル監視
```
[DEBUG] Watching for changes in setting files /root/.claude/settings.json, /home/user/cc-web-playground/.claude/settings.json...
```

#### 認証情報
```
[DEBUG] Successfully read OAuth token from file descriptor 4
[DEBUG] Successfully read token from file descriptor 3
```

#### スキル・プラグイン
```
[DEBUG] Found 0 plugins (0 enabled, 0 disabled)
[DEBUG] Loaded 0 skills total (managed: 0, user: 0, project: 0)
```

#### MCP起動
```
[DEBUG] MCP server "context7": Starting connection with timeout of 30000ms
```

### 3. ログのフィルタリング

```bash
tail -100 /tmp/claude-code.log | grep -E "(DEBUG|ERROR|MCP|allowed-tools|skill)"
```

**出力例**:
```
[DEBUG] Found 0 hook matchers in settings
[DEBUG] MCP server "context7": Starting connection
[DEBUG] Skills and commands included in Skill tool:
```

**🎯 ポイント**: `grep`でログをフィルタリングすることで必要な情報を素早く抽出

---

## ユーザーがカスタマイズ可能な設定

### 📝 完全カスタマイズ可能

#### 1. ~/.claude/settings.json

**設定可能項目**:

##### パーミッション設定
```json
{
  "permissions": {
    "allow": [
      "Bash(git add:*)",
      "Bash(npm run:*)",
      "Edit(/src/**/*.ts)"
    ],
    "ask": [
      "Bash(gh pr create:*)",
      "Bash(git commit:*)"
    ],
    "deny": [
      "Read(*.env)",
      "Read(/home/user/secrets/**)",
      "Bash(rm:*)",
      "Bash(curl:*)"
    ],
    "defaultMode": "default",
    "additionalDirectories": [
      "/home/user/Documents",
      "~/projects"
    ]
  }
}
```

**カスタマイズ度**: ⭐⭐⭐⭐⭐
**影響範囲**: すべてのプロジェクト

##### 環境変数設定
```json
{
  "env": {
    "ANTHROPIC_MODEL": "claude-opus-4-1",
    "ANTHROPIC_SMALL_FAST_MODEL": "claude-3-5-haiku-latest",
    "MY_CUSTOM_VAR": "value"
  }
}
```

**カスタマイズ度**: ⭐⭐⭐⭐⭐
**影響範囲**: すべてのセッション

##### フック設定
```json
{
  "hooks": {
    "PreToolUse": [
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
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "eslint --fix"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'User prompt submitted' >> /tmp/prompt-log.txt"
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

**カスタマイズ度**: ⭐⭐⭐⭐⭐
**影響範囲**: すべてのセッション

##### MCP設定
```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": [
    "memory",
    "github",
    "filesystem"
  ],
  "disabledMcpjsonServers": [
    "serena"
  ]
}
```

**カスタマイズ度**: ⭐⭐⭐⭐
**影響範囲**: MCPサーバーの有効/無効

##### その他の設定
```json
{
  "apiKeyHelper": "/bin/generate_temp_api_key.sh",
  "cleanupPeriodDays": 60,
  "includeCoAuthoredBy": false
}
```

**カスタマイズ度**: ⭐⭐⭐
**影響範囲**: API認証、データ保持期間、Git署名

---

#### 2. プロジェクト固有設定

**場所**: `/home/user/cc-web-playground/.claude/settings.json`

**優先度**: グローバル設定より優先される

**設定可能項目**: グローバル設定と同じ

**使用例**:
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run:*)",
      "Bash(git add:*)"
    ]
  },
  "env": {
    "NODE_ENV": "development"
  }
}
```

**🎯 ポイント**: プロジェクト固有の制限や環境変数を設定可能

---

### 🔒 部分的にカスタマイズ可能

#### 3. environment-managerのオプション

**カスタマイズ不可**: Web環境では制御不可
**理由**: インフラ側で起動されるため

**参考情報（ローカル環境で使用可能なオプション）**:

```bash
environment-manager task-run \
  --session my-session \
  --session-mode new \              # new/resume/resume-cached/setup-only
  --upgrade-claude-code=true \      # true/false
  --allowed-tools "Bash,Read,Write" \ # カンマ区切り
  --git-mode http-proxy \           # http-proxy/mcp
  --debug \                         # デバッグモード
  --log-level debug \               # debug/info/warn/error
  --verbose-claude-logs             # 詳細ログ
```

**カスタマイズ度**: ⭐（Web環境では不可、ローカルのみ）

---

### ❌ カスタマイズ不可

#### 4. システムレベルの設定

**完全に固定**:

```bash
# process_apiのパラメータ（変更不可）
--addr 0.0.0.0:2024
--max-ws-buffer-size 32768
--cpu-shares 4096
--oom-polling-period-ms 100
--memory-limit-bytes 8589934592
```

**理由**: インフラレベルで管理されているため

#### 5. 環境変数（システム設定）

**変更不可の環境変数**:

```bash
CLAUDE_CODE_VERSION=2.0.25               # システム管理
CLAUDE_CODE_CONTAINER_ID=container_...   # 自動割当
CLAUDE_CODE_REMOTE=true                  # 環境固定
MAX_THINKING_TOKENS=31999                # システム設定
CODESIGN_MCP_PORT=21170                  # 自動割当
CODESIGN_MCP_TOKEN=...                   # 自動生成
```

**理由**: セキュリティとリソース管理のため

---

## 調査結果の検証方法

### 1. 設定変更の確認

#### 設定ファイルを編集

```bash
# グローバル設定を編集
nano ~/.claude/settings.json
```

#### 設定の反映を確認

```bash
# 設定ファイルの監視ログを確認
tail -f /tmp/claude-code.log | grep "settings"
```

**出力例**:
```
[DEBUG] Watching for changes in setting files /root/.claude/settings.json, /home/user/cc-web-playground/.claude/settings.json...
[DEBUG] Settings file changed: /root/.claude/settings.json
```

### 2. 環境変数の確認

```bash
# 現在のセッションの環境変数
env | grep CLAUDE

# 新しいbashセッションで確認
bash -c 'env | grep CLAUDE'
```

### 3. フックの動作確認

#### テストフックを作成

```bash
cat > ~/.claude/test-hook.sh << 'EOF'
#!/bin/bash
echo "[$(date)] Test hook executed" >> /tmp/hook-test.log
exit 0
EOF
chmod +x ~/.claude/test-hook.sh
```

#### settings.jsonに追加

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/test-hook.sh"
          }
        ]
      }
    ]
  }
}
```

#### 実行結果を確認

```bash
cat /tmp/hook-test.log
```

### 4. パーミッション設定の確認

#### ログでパーミッションチェックを確認

```bash
tail -f /tmp/claude-code.log | grep -i "permission"
```

**出力例**:
```
[DEBUG] Applying permission update: Adding 1 allow rule(s) to destination 'projectSettings': ["Bash(gh:*)"]
```

---

## まとめ：調査のベストプラクティス

### 効率的な調査手順

1. **プロセス情報** → `ps`, `pstree`で全体像を把握
2. **起動パラメータ** → `/proc/*/cmdline`で詳細確認
3. **環境変数** → `/proc/*/environ`と`env`を両方確認
4. **設定ファイル** → `find`で場所を特定、`cat`で内容確認
5. **ログファイル** → `/tmp/claude-code.log`で動作確認
6. **スキーマ** → JSON Schemaで利用可能なオプションを把握

### 情報源の優先順位

| 優先度 | 情報源 | 信頼度 | 更新頻度 |
|-------|--------|--------|---------|
| 1 | `/tmp/claude-code.log` | ⭐⭐⭐⭐⭐ | リアルタイム |
| 2 | `/proc/[PID]/cmdline` | ⭐⭐⭐⭐⭐ | 起動時固定 |
| 3 | `/proc/[PID]/environ` | ⭐⭐⭐⭐⭐ | 起動時固定 |
| 4 | `~/.claude/settings.json` | ⭐⭐⭐⭐ | ユーザー編集 |
| 5 | `~/.claude.json` | ⭐⭐⭐⭐ | 自動更新 |
| 6 | JSON Schema | ⭐⭐⭐ | バージョン依存 |

### カスタマイズの推奨度

| 設定項目 | カスタマイズ度 | 影響範囲 | 推奨度 |
|---------|--------------|---------|--------|
| パーミッション | ⭐⭐⭐⭐⭐ | セキュリティ | 🟢 高 |
| フック | ⭐⭐⭐⭐⭐ | 自動化 | 🟢 高 |
| 環境変数 | ⭐⭐⭐⭐ | 動作環境 | 🟡 中 |
| MCP設定 | ⭐⭐⭐⭐ | 機能拡張 | 🟡 中 |
| cleanupPeriodDays | ⭐⭐⭐ | ストレージ | 🟡 中 |
| apiKeyHelper | ⭐⭐ | 認証 | 🔴 低 |

---

## 参考資料

- [Claude Code公式ドキュメント](https://docs.claude.com/en/docs/claude-code)
- [設定スキーマ](https://json.schemastore.org/claude-code-settings.json)
- [Linux /proc filesystem](https://man7.org/linux/man-pages/man5/proc.5.html)

---

**最終更新**: 2025-10-30
**調査者**: Claude (Anthropic)
**セッション**: session_011CUdY5EvDkhnfn3Kx16rvA
