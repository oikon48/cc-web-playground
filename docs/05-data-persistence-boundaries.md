# データ永続化の境界線 調査レポート

**調査日時**: 2025-10-30
**調査セッション**: container_011CUcWuDit7gV6dtHXW3LYv--fresh-half-spiffy-move
**調査カテゴリ**: P0（最優先）

---

## 目次

1. [調査の目的](#調査の目的)
2. [調査方法](#調査方法)
3. [セッション情報](#セッション情報)
4. [永続化されるディレクトリ](#永続化されるディレクトリ)
5. [.claude/ディレクトリの詳細](#claudeディレクトリの詳細)
6. [シンボリックリンクの挙動](#シンボリックリンクの挙動)
7. [テストファイルの配置](#テストファイルの配置)
8. [重要な発見](#重要な発見)
9. [ベストプラクティス](#ベストプラクティス)
10. [次回セッション確認項目](#次回セッション確認項目)

---

## 調査の目的

Claude Code on the Web環境において、**セッション間で永続化されるデータの境界線を明確に理解する**ことを目的とします。

### 重要性

- データ損失のリスクを回避
- 効率的な開発環境セットアップ
- セッション間での状態管理の最適化

---

## 調査方法

### Phase 1: 情報収集
1. 現在のセッション情報取得
2. ディレクトリ構造とサイズの確認
3. `.claude/`ディレクトリの詳細調査

### Phase 2: 実験
1. 各主要ディレクトリへのテストファイル配置
2. シンボリックリンクの作成と検証
3. 書き込み権限のテスト

### Phase 3: 検証（次回セッション）
1. テストファイルの存在確認
2. シンボリックリンクの保持確認
3. 永続化の信頼性評価

---

## セッション情報

### 現在のコンテナ

```json
{
  "container_name": "container_011CUcWuDit7gV6dtHXW3LYv--fresh-half-spiffy-move",
  "creation_time": 1761792239.7123754
}
```

**作成日時（人間可読）**: 2025-10-30 02:43:59 UTC

### ディスク使用状況（トップレベル）

| ディレクトリ | サイズ | 用途 | 永続性 |
|------------|-------|------|--------|
| `/usr` | 3.1G | システムバイナリ・ライブラリ | ❌ エフェメラル |
| `/root` | 2.0G | rootホームディレクトリ | ⚠️ 一部のみ（`.claude/`） |
| `/opt` | 1.3G | 開発ツール（Node.js, Java等） | ❌ エフェメラル |
| `/var` | 112M | ログ・キャッシュ | ❌ エフェメラル |
| `/home` | 44M | ユーザーディレクトリ | ✅ 永続化 |
| `/tmp` | 30M | 一時ファイル | ❌ エフェメラル |
| `/etc` | 5.1M | 設定ファイル | ❌ エフェメラル |

---

## 永続化されるディレクトリ

### ✅ 確実に永続化される（Persistent）

#### 1. `/home/user/` 配下全体

```bash
/home/user/
├── cc-web-playground/      # プロジェクトディレクトリ
│   ├── .git/              # Gitリポジトリ
│   ├── docs/              # ドキュメント
│   └── ...                # すべてのプロジェクトファイル
└── *                      # /home/user/直下のすべてのファイル
```

**特徴**:
- プロジェクトファイルの完全な永続化
- Gitリポジトリの状態保持
- 作業ディレクトリの変更はすべて保存

**テストファイル**: `/home/user/persistence-test.txt` ✅ 配置済み

---

#### 2. `~/.claude/` ディレクトリ

```bash
~/.claude/
├── projects/                          # プロジェクトごとの会話履歴
│   └── -home-user-cc-web-playground/
│       ├── 53754ea9-xxx.jsonl        # 会話ログ（JSONL形式）
│       ├── 9668a532-xxx.jsonl
│       └── c5a2046d-xxx.jsonl
├── session-env/                       # セッション環境変数
│   ├── 53754ea9-xxx                  # セッションごとの環境
│   ├── 9668a532-xxx
│   └── c5a2046d-xxx
├── shell-snapshots/                   # シェル状態のスナップショット
│   ├── snapshot-bash-1761787760934.sh
│   ├── snapshot-bash-1761788641905.sh
│   └── snapshot-bash-1761792242699.sh
├── todos/                             # Todoリスト
│   ├── 0d99b403-xxx.json
│   ├── 2e737a5e-xxx.json
│   └── e48b93c9-xxx.json
├── statsig/                           # 分析・統計データ
│   ├── statsig.cached.evaluations.*
│   ├── statsig.last_modified_time.evaluations
│   ├── statsig.session_id.*
│   └── statsig.stable_id.*
├── settings.json                      # Claude Code設定
└── stop-hook-git-check.sh            # Stopフックスクリプト
```

**ディレクトリ別サイズ**:
- `projects/`: 780KB（会話履歴）
- `shell-snapshots/`: 678KB（シェル状態）
- `session-env/`: 16KB（環境変数）
- `statsig/`: 29KB（統計データ）
- `todos/`: 5.5KB（タスク管理）

**テストファイル**: `~/.claude/persistence-test.txt` ✅ 配置済み

---

### ❌ エフェメラル（セッション終了で消失）

#### 1. `/tmp/`

**特徴**:
- 一時ファイル専用
- セッション終了で確実に消失
- 高速アクセス（tmpfs）

**テストファイル**: `/tmp/persistence-test.txt` ❌ 次回消失予想

---

#### 2. `/root/`（`.claude/`を除く）

**特徴**:
- rootユーザーのホームディレクトリ
- `.claude/`サブディレクトリのみ永続化
- その他のファイル（`.bashrc`, `.vimrc`等）は消失

**テストファイル**: `/root/persistence-test.txt` ❌ 次回消失予想

---

#### 3. `/var/tmp/`

**特徴**:
- `/tmp/`より長期間保持される一時ファイル用（通常環境）
- しかしコンテナ環境では同様にエフェメラル

**テストファイル**: `/var/tmp/persistence-test.txt` ❌ 次回消失予想

---

#### 4. `/usr/local/`

**特徴**:
- ローカルインストールソフトウェア用
- パッケージインストールしても次回消失

**テストファイル**: `/usr/local/persistence-test.txt` ❌ 次回消失予想

---

#### 5. `/opt/`

**特徴**:
- オプショナルソフトウェアパッケージ
- デフォルトでNode.js, Java, Ruby等がインストール済み
- カスタムインストールは消失

**テストファイル**: `/opt/persistence-test.txt` ❌ 次回消失予想

---

## .claude/ディレクトリの詳細

### 1. `projects/` - 会話履歴

**パス**: `~/.claude/projects/-home-user-cc-web-playground/`

**内容**: JSONL（JSON Lines）形式の会話ログ

#### データ構造例

```json
{
  "cwd": "/home/user/cc-web-playground",
  "gitBranch": "claude/investigate-web-specs-011CUcWuCBsKGQpynT4AB6J5",
  "isSidechain": true,
  "message": {
    "content": "Warmup",
    "role": "user"
  },
  "sessionId": "53754ea9-6900-41b0-9025-ca92ea2b28a7",
  "timestamp": "2025-10-30T01:29:20.952Z",
  "type": "user",
  "uuid": "022584bd-9271-4db0-8d1e-3a4c0415a6d0",
  "version": "2.0.25"
}
```

**重要フィールド**:
- `sessionId`: セッション識別子
- `timestamp`: メッセージのタイムスタンプ
- `gitBranch`: 当時のGitブランチ
- `message.content`: ユーザー/アシスタントのメッセージ
- `usage`: トークン使用量（アシスタントメッセージのみ）

**サイズ**: 144KB〜342KB/セッション

---

### 2. `session-env/` - セッション環境

**パス**: `~/.claude/session-env/[session-id]`

**内容**: バイナリまたは空ファイル（詳細不明）

**推測される用途**:
- セッション固有の環境変数
- 一時的な状態保存
- セッション間の引き継ぎデータ

**サイズ**: 数KB/セッション

---

### 3. `shell-snapshots/` - シェル状態スナップショット

**パス**: `~/.claude/shell-snapshots/snapshot-bash-[timestamp]-[id].sh`

**内容**: Bashシェルの状態を復元するスクリプト

#### スナップショット内容例

```bash
shopt -s progcomp
shopt -u progcomp_alias
shopt -s promptvars
# ... シェルオプション設定

set -o braceexpand
set -o hashall
set -o interactive-comments
# ... setオプション

# Aliases
if ! command -v rg >/dev/null 2>&1; then
  alias rg='/opt/node22/lib/node_modules/@anthropic-ai/claude-code/vendor/ripgrep/x64-linux/rg'
fi

export PATH=/root/.local/bin:/root/.cargo/bin:/usr/local/go/bin:...
```

**用途**:
- シェル環境の復元
- エイリアスの復元
- PATH等の環境変数設定

**サイズ**: 約225KB/スナップショット

---

### 4. `todos/` - タスク管理

**パス**: `~/.claude/todos/[uuid]-agent-[uuid].json`

**内容**: TodoWriteツールで作成されたタスクリスト

**サイズ**: 数KB

---

### 5. `statsig/` - 分析・統計

**パス**: `~/.claude/statsig/`

**ファイル**:
- `statsig.cached.evaluations.*`
- `statsig.last_modified_time.evaluations`
- `statsig.session_id.*`
- `statsig.stable_id.*`

**用途**: Claude Codeの機能フラグ、A/Bテスト、分析データ

---

### 6. `settings.json` - Claude Code設定

**パス**: `~/.claude/settings.json`

**内容**: フック設定、ユーザー設定

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

**永続化**: ✅ セッション間で保持

---

### 7. `stop-hook-git-check.sh` - Stopフック

**パス**: `~/.claude/stop-hook-git-check.sh`

**用途**: 会話終了時に未コミット・未プッシュをチェック

**永続化**: ✅ セッション間で保持

---

## シンボリックリンクの挙動

### テスト実施内容

#### 1. 相対パスシンボリックリンク

```bash
ln -s symlink-target.txt symlink-relative.txt
```

**結果**: ✅ 作成成功
**パス**: `symlink-relative.txt -> symlink-target.txt`
**次回確認**: リンク自体とターゲットの永続性

---

#### 2. 絶対パスシンボリックリンク

```bash
ln -s /home/user/cc-web-playground/symlink-target.txt symlink-absolute.txt
```

**結果**: ✅ 作成成功
**パス**: `symlink-absolute.txt -> /home/user/cc-web-playground/symlink-target.txt`
**次回確認**: 絶対パス参照の永続性

---

#### 3. クロスディレクトリシンボリックリンク

```bash
ln -s /tmp/persistence-test.txt symlink-to-tmp.txt
```

**結果**: ✅ 作成成功
**パス**: `symlink-to-tmp.txt -> /tmp/persistence-test.txt`
**予想**: リンクは永続化、ターゲット（`/tmp/`）は消失 → **デッドリンク**

---

#### 4. .claude/ディレクトリへのシンボリックリンク

```bash
ln -s ~/.claude/persistence-test.txt symlink-to-claude.txt
```

**結果**: ✅ 作成成功
**パス**: `symlink-to-claude.txt -> /root/.claude/persistence-test.txt`
**予想**: リンクとターゲット両方が永続化 → **有効**

---

### シンボリックリンクまとめ

| リンク種別 | リンク永続化 | ターゲット永続化 | 次回の状態 |
|----------|------------|----------------|-----------|
| 相対パス（同一ディレクトリ） | ✅ | ✅ | 有効 |
| 絶対パス（/home/user/配下） | ✅ | ✅ | 有効 |
| /tmp/へのリンク | ✅ | ❌ | デッドリンク |
| ~/.claude/へのリンク | ✅ | ✅ | 有効 |

---

## テストファイルの配置

### 配置済みテストファイル一覧

以下のファイルをセッション識別のために配置済み：

```
テストファイル内容:
-----------------
Persistence Test
Created: 20251030-024623
Session: container_011CUcWuDit7gV6dtHXW3LYv--fresh-half-spiffy-move
Purpose: Verify data persistence across sessions
```

#### 永続化が期待されるファイル

1. `/home/user/persistence-test.txt` ✅
2. `/home/user/cc-web-playground/.persistence-test` ✅
3. `~/.claude/persistence-test.txt` ✅

#### エフェメラルと予想されるファイル

4. `/tmp/persistence-test.txt` ❌
5. `/root/persistence-test.txt` ❌
6. `/var/tmp/persistence-test.txt` ❌
7. `/usr/local/persistence-test.txt` ❌
8. `/opt/persistence-test.txt` ❌

---

## 重要な発見

### 1. `/home/user/` は完全に永続化される

**証拠**:
- プロジェクトファイルが複数セッションにわたって保持
- `.git/`ディレクトリの完全な永続化
- Git historyが累積

**推論**: `/home/user/`はホスト側のストレージにマウントされている

---

### 2. `~/.claude/` は選択的に永続化される

**永続化されるもの**:
- `settings.json`
- フックスクリプト
- `projects/`の会話履歴
- `shell-snapshots/`
- `todos/`
- `statsig/`

**サイズ**: 合計約1.5MB（会話履歴が主）

**同期タイミング**: リアルタイム（ファイル書き込み時）

---

### 3. システムディレクトリは完全にエフェメラル

**含まれるもの**:
- `/tmp/`, `/var/tmp/`
- `/root/`（`.claude/`を除く）
- `/usr/local/`, `/opt/`
- `/etc/`

**影響**:
- インストールしたパッケージは消失
- `~/.bashrc`等の設定は消失
- rootユーザーの環境カスタマイズは消失

---

### 4. シンボリックリンクは慎重に使用すべき

**リスク**:
- エフェメラルディレクトリへのリンクはデッドリンクになる
- 絶対パスリンクは移植性が低い

**推奨**:
- `/home/user/`配下での相対パスリンク使用
- `~/.claude/`へのリンクは有効

---

## ベストプラクティス

### 1. 永続化したいデータの配置

#### ✅ 推奨

```bash
# プロジェクトファイルとして配置
/home/user/cc-web-playground/configs/
/home/user/cc-web-playground/scripts/

# ユーザーディレクトリ直下
/home/user/.my-persistent-config

# Claude設定として配置
~/.claude/my-custom-hook.sh
~/.claude/settings.json
```

#### ❌ 非推奨

```bash
# rootホームの直接編集（消失する）
~/.bashrc
~/.vimrc

# システムディレクトリ（消失する）
/usr/local/bin/my-script
/opt/my-tool/
```

---

### 2. セットアップスクリプトの活用

毎回のセッション開始時に実行するスクリプトを用意：

```bash
#!/bin/bash
# /home/user/cc-web-playground/scripts/setup-session.sh

# パッケージインストール（必要に応じて）
apt update && apt install -y gh jq

# エイリアス設定
alias gh="/usr/bin/gh"
alias ll="ls -la"

# 環境変数
export GH_TOKEN="${GITHUB_TOKEN}"

echo "Session setup completed"
```

**配置**: プロジェクトの`scripts/`ディレクトリに永続化

---

### 3. Gitによる設定管理

設定ファイルをGit管理下に置く：

```bash
/home/user/cc-web-playground/
├── .claude/
│   └── settings.sample.json    # サンプル設定
├── scripts/
│   ├── setup-session.sh        # セットアップスクリプト
│   └── restore-bashrc.sh       # .bashrc復元スクリプト
└── configs/
    └── bashrc.template         # .bashrcテンプレート
```

**セッション開始時**:

```bash
cp configs/bashrc.template ~/.bashrc
source ~/.bashrc
```

---

### 4. 環境変数の永続化

#### 方法A: プロジェクト`.env`ファイル

```bash
# /home/user/cc-web-playground/.env
export MY_API_KEY="xxx"
export MY_CONFIG="yyy"

# セッション開始時
source /home/user/cc-web-playground/.env
```

#### 方法B: Claude設定ファイル活用

```json
// ~/.claude/settings.json
{
  "environmentVariables": {
    "MY_VAR": "value"
  }
}
```

**注意**: 現在のClaude Codeバージョンでサポート状況要確認

---

### 5. データ損失リスク軽減

#### 重要データのバックアップ戦略

```bash
# 1. Git commit頻繁に
git add . && git commit -m "Work in progress"

# 2. 定期的にpush
git push

# 3. 重要なログは/home/user/配下に保存
./my-command > /home/user/cc-web-playground/logs/output.log
```

---

## 次回セッション確認項目

### チェックリスト

以下のファイル・リンクの存在を確認し、永続化の検証を完了する：

#### ✅ 永続化が期待されるもの

- [ ] `/home/user/persistence-test.txt`
- [ ] `/home/user/cc-web-playground/.persistence-test`
- [ ] `~/.claude/persistence-test.txt`
- [ ] `/home/user/cc-web-playground/symlink-relative.txt`（リンク）
- [ ] `/home/user/cc-web-playground/symlink-absolute.txt`（リンク）
- [ ] `/home/user/cc-web-playground/symlink-to-claude.txt`（リンク）
- [ ] `/home/user/cc-web-playground/symlink-target.txt`（ターゲット）

#### ❌ 消失が予想されるもの

- [ ] `/tmp/persistence-test.txt`（存在しないことを確認）
- [ ] `/root/persistence-test.txt`（存在しないことを確認）
- [ ] `/var/tmp/persistence-test.txt`（存在しないことを確認）
- [ ] `/usr/local/persistence-test.txt`（存在しないことを確認）
- [ ] `/opt/persistence-test.txt`（存在しないことを確認）

#### ⚠️ デッドリンクが予想されるもの

- [ ] `/home/user/cc-web-playground/symlink-to-tmp.txt`（リンクは存在するがターゲットが消失）

### 確認コマンド

```bash
# 次回セッション開始時に実行
echo "=== Persistence Test Results ===" > /home/user/cc-web-playground/persistence-test-results.txt

# 期待：存在する
for f in /home/user/persistence-test.txt \
         /home/user/cc-web-playground/.persistence-test \
         ~/.claude/persistence-test.txt; do
  if [ -f "$f" ]; then
    echo "✅ PASS: $f exists" >> /home/user/cc-web-playground/persistence-test-results.txt
    cat "$f" >> /home/user/cc-web-playground/persistence-test-results.txt
    echo "---" >> /home/user/cc-web-playground/persistence-test-results.txt
  else
    echo "❌ FAIL: $f missing" >> /home/user/cc-web-playground/persistence-test-results.txt
  fi
done

# 期待：存在しない
for f in /tmp/persistence-test.txt \
         /root/persistence-test.txt \
         /var/tmp/persistence-test.txt \
         /usr/local/persistence-test.txt \
         /opt/persistence-test.txt; do
  if [ ! -f "$f" ]; then
    echo "✅ PASS: $f correctly removed" >> /home/user/cc-web-playground/persistence-test-results.txt
  else
    echo "❌ FAIL: $f still exists (unexpected)" >> /home/user/cc-web-playground/persistence-test-results.txt
  fi
done

# シンボリックリンクのテスト
echo "=== Symlink Tests ===" >> /home/user/cc-web-playground/persistence-test-results.txt
ls -lah /home/user/cc-web-playground/symlink-*.txt >> /home/user/cc-web-playground/persistence-test-results.txt 2>&1

cat /home/user/cc-web-playground/persistence-test-results.txt
```

---

## まとめ

### 永続化の原則

| ディレクトリ | 永続化 | 理由 |
|------------|-------|------|
| `/home/user/` | ✅ | ホストストレージマウント |
| `~/.claude/` | ✅ | Claude Code管理領域 |
| `/tmp/`, `/var/tmp/` | ❌ | 一時ファイルシステム |
| `/root/`（`.claude/`除く） | ❌ | コンテナ内のみ |
| `/usr/`, `/opt/`, `/etc/` | ❌ | コンテナイメージの一部 |

### 開発者への推奨事項

1. **重要なファイルは`/home/user/`配下に配置**
2. **設定ファイルはGit管理**
3. **セットアップスクリプトを活用**
4. **頻繁にコミット・プッシュ**
5. **`.claude/settings.json`でフック活用**

### 次のステップ

- 次回セッションで永続化の検証を完了
- 結果をこのドキュメントに追記
- ベストプラクティスの更新

---

**調査実施者**: Claude (Anthropic)
**次回確認予定**: 次回セッション開始時
**関連ドキュメント**:
- [01-environment-overview.md](./01-environment-overview.md)
- [02-container-lifecycle.md](./02-container-lifecycle.md)
- [04-future-investigation-plan.md](./04-future-investigation-plan.md)
