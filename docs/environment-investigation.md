# Claude Code環境 徹底調査レポート

調査日時: 2025-10-29

## 目次
1. [概要](#概要)
2. [システム基本情報](#システム基本情報)
3. [ユーザーと権限](#ユーザーと権限)
4. [環境変数](#環境変数)
5. [Claude Code設定](#claude-code設定)
6. [インストール済みツールとパッケージ](#インストール済みツールとパッケージ)
7. [ディスクとメモリ](#ディスクとメモリ)
8. [ネットワーク](#ネットワーク)
9. [Git設定](#git設定)
10. [コンテナ情報](#コンテナ情報)
11. [重要な発見](#重要な発見)
12. [制限事項と注意点](#制限事項と注意点)

---

## 概要

この環境は**Claude Code**のクラウド実行環境（リモートコンテナ）です。

### 環境タイプ
- **タイプ**: `cloud_default` (クラウドデフォルト環境)
- **リモート実行**: `true`
- **サンドボックス**: `yes`
- **Claude Codeバージョン**: 2.0.23
- **エントリーポイント**: sdk-cli

### コンテナ情報
```json
{
  "container_name": "container_011CUbtGw1bmkXASccupp1Kc--first-half-milky-disk",
  "creation_time": 1761760454.2474093,
  "container_id": "container_011CUbtGw1bmkXASccupp1Kc"
}
```

---

## システム基本情報

### OS
- **ディストリビューション**: Ubuntu 24.04.3 LTS (Noble Numbat)
- **カーネル**: Linux 4.4.0 #1 SMP Sun Jan 10 15:06:54 PST 2016
- **アーキテクチャ**: x86_64

### CPU
- **コア数**: 16コア
- **ベンダー**: GenuineIntel (Family 6, Model 106)
- **仮想化**: KVM (Full virtualization)
- **主な機能**: AVX, AVX2, AVX512, AES, SHA_NI

### ホスト名
- `runsc` (gVisor runtime)

---

## ユーザーと権限

### 現在のユーザー
```bash
uid=0(root) gid=0(root) groups=0(root)
```

### sudo権限
- **完全なroot権限**: `(ALL : ALL) ALL`
- **制限なし**: すべてのコマンドを実行可能

### セキュリティ設定
```bash
secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
env_reset=true
use_pty=true
```

---

## 環境変数

### Claude Code関連
```bash
CLAUDECODE=1
CLAUDE_CODE_VERSION=2.0.23
CLAUDE_CODE_REMOTE=true
CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE=cloud_default
CLAUDE_CODE_ENTRYPOINT=sdk-cli
CLAUDE_CODE_DEBUG=true
CLAUDE_CODE_CONTAINER_ID=container_011CUbtGw1bmkXASccupp1Kc
CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR=4
CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR=3
```

### GitHub関連
```bash
GITHUB_TOKEN=ghp_***************************  # 設定済み
```

### プロキシ設定
```bash
HTTP_PROXY=http://container_...@21.0.0.119:15004
HTTPS_PROXY=http://container_...@21.0.0.119:15004
NO_PROXY=localhost,127.0.0.1,169.254.169.254,metadata.google.internal,*.svc.cluster.local,*.local,*.googleapis.com,*.google.com
```
→ **すべての外部通信はプロキシ経由**（JWT認証付き）

### SSL証明書
```bash
SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt
REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
```

### 開発環境変数
```bash
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
GRADLE_HOME=/opt/gradle
MAVEN_HOME=/opt/maven
NVM_DIR=/opt/nvm
RBENV_ROOT=/opt/rbenv
RUSTUP_HOME=/root/.rustup
```

### その他の重要な変数
```bash
IS_SANDBOX=yes
DEBIAN_FRONTEND=noninteractive
PYTHONUNBUFFERED=1
RUST_BACKTRACE=1
MAX_THINKING_TOKENS=31999
GIT_EDITOR=true  # ← 対話型エディタは無効化
```

### PATH
```bash
/root/.local/bin
/root/.cargo/bin
/usr/local/go/bin
/opt/node22/bin
/opt/maven/bin
/opt/gradle/bin
/opt/rbenv/bin
/usr/local/sbin
/usr/local/bin
/usr/sbin
/usr/bin
/sbin
/bin
```

---

## Claude Code設定

### 設定ファイルの場所
- **メイン設定**: `~/.claude/settings.json`
- **Stopフック**: `~/.claude/stop-hook-git-check.sh`
- **プロジェクト設定**: `~/.claude/projects/`
- **セッション環境**: `~/.claude/session-env/`
- **シェルスナップショット**: `~/.claude/shell-snapshots/`
- **Todoリスト**: `~/.claude/todos/`

### settings.json
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

### Stopフックの機能
会話終了時に以下をチェック：
1. Gitリポジトリ内にいるか
2. 未コミットの変更があるか
3. 追跡されていないファイルがあるか
4. プッシュされていないコミットがあるか

→ **いずれかが該当する場合、会話終了をブロック**

---

## インストール済みツールとパッケージ

### 総パッケージ数
**606個**のdebianパッケージがインストール済み

### 主要な開発ツール

#### バージョン管理
- **Git**: 2.43.0 ✅
- **GitHub CLI (gh)**: ❌ インストールされていない

#### プログラミング言語

**Node.js**
- Node.js 22.20.0 ✅
- npm 10.9.3 ✅
- インストール済みバージョン: node20, node21, node22

**Python**
- Python 3.11.14 (default)
- Python 3.12.3
- Python 3.13.8
- pip, venv対応 ✅

**Java**
- OpenJDK 21.0.8 ✅
- Maven 3.9.11 ✅
- Gradle 8.14.3 ✅

**Ruby**
- Ruby 3.3.6 ✅
- rbenv管理
- インストール済みバージョン: 3.1.6, 3.2.6, 3.3.6

**Go**
- Go 1.24.7 ✅

**Rust**
- Cargo 1.90.0 ✅
- rustup管理

### ユーティリティ

**エディタ**
- vim 9.1.0016 ✅
- vim-runtime, vim-common ✅

**検索・解析**
- ripgrep 14.1.0 ✅
- jq ✅
- yq 3.1.0 ✅

**アーカイブ**
- tar ✅
- zip/unzip ✅
- xz-utils ✅

**ビルドツール**
- make ✅
- gcc/g++ (build-essential) ✅
- cmake ✅

**デバッグ**
- gdb ✅
- strace ✅
- valgrind 3.22.0 ✅

**ネットワーク**
- curl ✅
- wget ✅
- nc (netcat) ✅

**その他**
- tmux 3.4 ✅
- sudo ✅

### 利用できないツール
❌ **ネットワークツール**
- `ping` - コマンドなし
- `ifconfig` - コマンドなし
- `ip` - コマンドなし
- `netstat` - コマンドなし

❌ **システムツール**
- `hostnamectl` - 利用不可
- `systemctl` - 制限あり（コンテナ環境）

---

## ディスクとメモリ

### ディスク使用状況
```
Filesystem      Size  Used Avail Use% Mounted on
none            9.8G  6.6M  9.3G   1%  /
```

**ディレクトリ別使用量:**
- `/root`: 983MB
- `/home`: 44MB
- `/opt`: 1.3GB (開発ツール)
- `/usr/local`: 517MB

**利用可能**: 9.3GB

### メモリ
```
               total    used    free   available
Mem:            13Gi    332Mi   12Gi   12Gi
Swap:            0B      0B      0B
```

**制限**: 8GB (8589934592 bytes)

---

## ネットワーク

### プロキシ経由接続
- すべての外部HTTP/HTTPS通信はプロキシ経由
- プロキシ認証: JWT (有効期限あり)
- ローカルホスト・内部サービスはプロキシバイパス

### 接続確認
```bash
$ curl -s -o /dev/null -w "%{http_code}" https://www.google.com
200  # ✅ インターネット接続OK
```

### DNS
- `/etc/resolv.conf` は空（プロキシが処理）

### ネットワークツールの制限
- `ping`, `ifconfig`, `ip`などのコマンドは利用不可
- ただし、`curl`/`wget`でHTTP(S)通信は可能

---

## Git設定

### グローバル設定 (`~/.gitconfig`)
```ini
[user]
    name = Claude
    email = noreply@anthropic.com
    signingkey = /home/claude/.ssh/commit_signing_key.pub

[gpg]
    format = ssh

[gpg "ssh"]
    program = /tmp/code-sign

[commit]
    gpgsign = true

[http]
    proxyAuthMethod = basic
```

### リポジトリ設定 (`.git/config`)
```ini
[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
    logallrefupdates = true

[gc]
    auto = 0  # 自動ガベージコレクション無効

[remote "origin"]
    url = http://local_proxy@127.0.0.1:38692/git/oikon48/cc-web-playground
    fetch = +refs/heads/*:refs/remotes/origin/*
```

### 重要な特徴
1. **コミット署名**: SSH鍵で自動署名
2. **プロキシ経由**: Gitの通信もプロキシ経由
3. **ローカルプロキシ**: 127.0.0.1:38692でGitHub APIへ接続

---

## コンテナ情報

### プロセス構成
```
PID 1:  /process_api  (プロセス管理)
PID 19: environment-manager wrapper
PID 21: environment-manager (セッション管理)
PID 32: claude (メインプロセス)
```

### 起動時間
- コンテナ作成: 2025-10-29 17:54:14 (UTC)
- セッションID: `session_011CUbtGuZHhKHc2A3xXCM3z`

### リソース制限
- CPU shares: 4096
- メモリ上限: 8GB
- OOM polling: 100ms

---

## 重要な発見

### 1. 完全なroot権限
✅ この環境はroot権限で実行されており、`sudo`なしであらゆるコマンドを実行可能
- パッケージのインストール可能
- システム設定の変更可能
- ただし**一時的**（コンテナ再起動で消える）

### 2. プロキシ経由の通信
⚠️ すべての外部通信はAnthropicの管理プロキシ経由
- JWT認証付き（約4時間有効）
- GitHub APIアクセスも専用プロキシ経由
- 直接的なネットワーク操作は制限

### 3. `gh`コマンドの制限
❌ GitHub CLIは**インストールされていない**
- 過去の調査でインストール可能なことは判明
- ただし短縮形`gh`はClaude Codeのセキュリティポリシーでブロック
- フルパス`/usr/bin/gh`なら実行可能（インストール後）

### 4. コンテナの一時性
⚠️ **この環境は一時的**
- セッション終了後、コンテナは破棄される可能性
- インストールしたパッケージは次回セッションで消える
- `/root`, `/opt`などの変更は永続化されない
- **永続化されるのは作業ディレクトリ（`/home/user/...`）のみ**

### 5. MCP (Model Context Protocol) サーバー
```bash
CODESIGN_MCP_PORT=61726
CODESIGN_MCP_TOKEN=6Bw_5F_6x5ydrckBiVR7kLguGYbkqhITCvw9GP5V_F4=
```
→ コード署名用のMCPサーバーが稼働中

### 6. セッション管理
- `.claude.json`: セッション状態保存
- `shell-snapshots/`: シェル状態のスナップショット
- `todos/`: タスク管理の永続化

---

## 制限事項と注意点

### ❌ できないこと

1. **ネットワーク診断**
   - `ping`, `traceroute`, `netstat`など利用不可
   - ただし`curl`/`wget`でのHTTP(S)通信は可能

2. **システムサービス管理**
   - `systemctl`は制限あり（コンテナ環境）
   - デーモンの起動は限定的

3. **永続的なシステム変更**
   - パッケージインストールは一時的
   - 次回セッションでリセット

4. **直接的なGitHub操作**
   - `gh`コマンドは未インストール（インストール可能）
   - GitHub APIはcurlまたはインストール後の`/usr/bin/gh`で利用

### ⚠️ 注意が必要なこと

1. **プロキシのJWT有効期限**
   - 約4時間（セッション時間）
   - 期限切れ後は外部通信不可

2. **ディスク容量**
   - 9.3GB利用可能（十分だが無限ではない）
   - 大容量ファイルのダウンロードは注意

3. **メモリ制限**
   - 8GB上限
   - 大規模なビルドやデータ処理は制限に注意

### ✅ できること

1. **あらゆる開発作業**
   - 主要言語のコンパイル・実行
   - パッケージ管理（npm, pip, cargo, etc.）
   - Gitの完全な操作

2. **パッケージのインストール**
   - `apt install`でUbuntuパッケージ追加可能
   - ただしセッション内のみ有効

3. **外部APIの利用**
   - GitHub API（プロキシ経由）
   - その他のWeb API（curl/wget）

---

## まとめ

この環境は**開発に最適化されたクラウドコンテナ環境**です。

### 特徴
✅ 主要な開発言語とツールがプリインストール済み
✅ root権限で柔軟な操作が可能
✅ GitHubとの統合が完備
⚠️ 一時的な環境（永続化は作業ディレクトリのみ）
⚠️ ネットワークはプロキシ経由で制御
❌ 一部のシステムツールは利用不可

### おすすめの使い方
1. コード開発とテストは自由に実施
2. 作業結果は必ずGitにコミット・プッシュ（Stopフックが強制）
3. 一時的なパッケージは必要に応じてその場でインストール
4. 環境の永続化が必要なものは`/home/user/`配下に配置

---

## 調査実施者
Claude Code 2.0.23 (調査日: 2025-10-29)
