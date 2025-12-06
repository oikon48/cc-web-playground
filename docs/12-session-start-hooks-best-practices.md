# SessionStart Hooks ベストプラクティス - Claude Code on the Web 最大活用ガイド

**作成日**: 2025-12-06
**目的**: SessionStart Hooksを使用してClaude Code on the Webを最大限に活用するための実践的なガイド

## 概要

SessionStart hooksは、Claude Codeがセッションを開始または再開するときに実行されるフックです。これを活用することで、開発環境の自動セットアップ、コンテキストの注入、依存関係のインストールなどを自動化できます。

### SessionStartのトリガー

| Matcher | 説明 |
|---------|------|
| `startup` | 新規セッション開始時 |
| `resume` | `--resume`, `--continue`, `/resume`からの再開時 |
| `clear` | `/clear`からの呼び出し時 |
| `compact` | 自動/手動コンパクト時 |

### 重要な環境変数

| 変数名 | 説明 |
|--------|------|
| `CLAUDE_CODE_REMOTE` | Web環境では`"true"`、ローカルでは未設定 |
| `CLAUDE_PROJECT_DIR` | プロジェクトルートディレクトリの絶対パス |
| `CLAUDE_ENV_FILE` | 環境変数を永続化するためのファイルパス（SessionStartのみ） |

---

## 実践的なユースケース

### 1. GitHub CLI (gh) の自動インストール

**参照**: [BerryKuipers/claude-code-toolkit](https://github.com/BerryKuipers/claude-code-toolkit)

Web環境でのみghコマンドを自動インストールするスクリプト：

#### `.claude/settings.json`

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/install-gh-cli.sh"
          }
        ]
      }
    ]
  }
}
```

#### `.claude/hooks/install-gh-cli.sh`

```bash
#!/bin/bash
# Install GitHub CLI on Claude Code web sessions
# Installs to ~/.local/bin (no root required)

set -e

# Check if gh is already installed
if command -v gh &> /dev/null; then
  echo "✅ GitHub CLI already installed: $(gh --version | head -n1)"
  exit 0
fi

# Only install in remote (web) environments
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  echo "ℹ️ Skipping gh CLI installation (not in remote environment)"
  exit 0
fi

echo "📦 Installing GitHub CLI from GitHub releases..."

# Detect architecture
ARCH=$(uname -m)
case "$ARCH" in
  x86_64) GH_ARCH="amd64" ;;
  aarch64|arm64) GH_ARCH="arm64" ;;
  *) echo "❌ Unsupported architecture: $ARCH"; exit 1 ;;
esac

# Get latest version from GitHub API
GH_VERSION=$(curl -s https://api.github.com/repos/cli/cli/releases/latest | grep '"tag_name"' | cut -d'"' -f4 | sed 's/v//')

if [ -z "$GH_VERSION" ]; then
  echo "⚠️ Failed to fetch latest version"
  exit 0
fi

# Download from github.com
GH_URL="https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_linux_${GH_ARCH}.tar.gz"
GH_TARBALL="/tmp/gh_${GH_VERSION}_linux_${GH_ARCH}.tar.gz"

curl -fsSL "$GH_URL" -o "$GH_TARBALL"
tar xzf "$GH_TARBALL" -C /tmp

# Install to user-local bin (no root required)
USER_BIN="$HOME/.local/bin"
mkdir -p "$USER_BIN"
install -m 755 "/tmp/gh_${GH_VERSION}_linux_${GH_ARCH}/bin/gh" "$USER_BIN/"

# Add to PATH
if [[ ":$PATH:" != *":$USER_BIN:"* ]]; then
  export PATH="$USER_BIN:$PATH"
fi

# Persist PATH for session
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo "export PATH=\"$USER_BIN:\$PATH\"" >> "$CLAUDE_ENV_FILE"
fi

echo "✅ GitHub CLI installed successfully: $(gh --version | head -n1)"
rm -f "$GH_TARBALL"
rm -rf "/tmp/gh_${GH_VERSION}_linux_${GH_ARCH}"
exit 0
```

---

### 2. コンテキスト自動注入

セッション開始時にプロジェクト固有の指示やスキルをClaudeのコンテキストに注入：

**参照**: [udecode/dotai](https://github.com/udecode/dotai)

#### `.claude/hooks/session-context.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
CONTEXT_FILE="$PROJECT_DIR/.claude/CONTEXT.md"

if [ -f "$CONTEXT_FILE" ]; then
  # Read and escape content for JSON
  context_content=$(cat "$CONTEXT_FILE" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')

  # Output as JSON for additionalContext
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "<PROJECT_CONTEXT>\n${context_content}\n</PROJECT_CONTEXT>"
  }
}
EOF
fi

exit 0
```

---

### 3. マルチエージェント通信セットアップ

**参照**: [aannoo/claude-hook-comms](https://github.com/aannoo/claude-hook-comms)

複数のClaude Codeインスタンス間でリアルタイム通信を実現：

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "if [ \"$CLAUDE_CODE_REMOTE\" = \"true\" ]; then pip install -q --no-cache-dir hcom; hcom sessionstart; fi"
      }]
    }]
  }
}
```

---

### 4. 環境変数の永続化

`CLAUDE_ENV_FILE`を使用して、セッション中のすべてのBashコマンドで利用可能な環境変数を設定：

```bash
#!/bin/bash
# SessionStart hook for environment setup

if [ -n "$CLAUDE_ENV_FILE" ]; then
  # Node.js バージョン設定
  echo 'export NODE_ENV=development' >> "$CLAUDE_ENV_FILE"

  # パス追加
  echo 'export PATH="./node_modules/.bin:$PATH"' >> "$CLAUDE_ENV_FILE"

  # プロジェクト固有の設定
  echo "export PROJECT_ROOT=\"$CLAUDE_PROJECT_DIR\"" >> "$CLAUDE_ENV_FILE"
fi

exit 0
```

---

### 5. エージェントインボックスチェック

**参照**: [sunholo-data/ailang](https://github.com/sunholo-data/ailang)

セッション開始時に未読メッセージやアクティブなスプリントを表示：

```bash
#!/bin/bash
# Check for unread messages and active sprints

MESSAGES_JSON=$(your-messages-cli list --unread --json 2>/dev/null || echo "[]")
UNREAD_COUNT=$(echo "$MESSAGES_JSON" | jq 'length' 2>/dev/null || echo "0")

if [ "$UNREAD_COUNT" -gt 0 ]; then
  jq -n --arg count "$UNREAD_COUNT" \
    '{"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "📬 You have \($count) unread messages"}}'
fi

exit 0
```

---

## 設定ファイルの構成

### 推奨ディレクトリ構造

```
project/
├── .claude/
│   ├── settings.json          # フック設定
│   ├── hooks/
│   │   ├── session-start.sh   # SessionStart hook
│   │   ├── install-gh-cli.sh  # gh CLI インストール
│   │   └── context-loader.sh  # コンテキスト注入
│   └── CONTEXT.md             # プロジェクトコンテキスト
```

### 完全な settings.json 例

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/install-gh-cli.sh"
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/context-loader.sh"
          }
        ]
      },
      {
        "matcher": "resume",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/context-loader.sh"
          }
        ]
      }
    ]
  }
}
```

---

## 重要な注意点

### Web環境の制限

1. **セッション永続性**: Web版ではセッション終了で環境がリセットされる
2. 2. **ghコマンドの制限**: 短縮形`gh`はブロックされるが、フルパス`/usr/bin/gh`は実行可能
   3. 3. **ネットワーク制限**: 一部のドメインはプロキシでブロックされる可能性
     
      4. ### ベストプラクティス
     
      5. 1. **冪等性**: スクリプトは複数回実行しても安全であること
         2. 2. **フェイルセーフ**: エラー時もexit 0で終了し、Claudeの動作をブロックしない
            3. 3. **ログ出力**: デバッグのために適切なログを出力
               4. 4. **環境チェック**: `CLAUDE_CODE_REMOTE`で環境を判別
                 
                  5. ---
                 
                  6. ## 参考リンク
                 
                  7. - [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
                     - - [BerryKuipers/claude-code-toolkit](https://github.com/BerryKuipers/claude-code-toolkit)
                       - - [aannoo/claude-hook-comms](https://github.com/aannoo/claude-hook-comms)
                         - - [udecode/dotai](https://github.com/udecode/dotai)
                           - - [towry/dots](https://github.com/towry/dots)
                             - - [gabriel-dehan/claude_hooks](https://github.com/gabriel-dehan/claude_hooks)
                              
                               - ---

                               ## 関連ドキュメント

                               - [03-gh-command-workaround.md](./03-gh-command-workaround.md) - GitHub CLI の詳細な調査
                               - - [09-gh-cli-complete-investigation.md](./09-gh-cli-complete-investigation.md) - gh CLI 完全ガイド
                                 - - [10-ccusage-hook-setup.md](./10-ccusage-hook-setup.md) - Stop Hook の設定例
                                  
                                   - ---

                                   **作成日**: 2025-12-06
                                   **ステータス**: 調査完了
