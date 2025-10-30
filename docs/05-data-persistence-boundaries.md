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

### Phase 3: 検証（次回セッション）✅ **完了**
1. テストファイルの存在確認
2. シンボリックリンクの保持確認
3. 永続化の信頼性評価

**検証実施日**: 2025-10-30
**結果ファイル**: `persistence-test-results.txt`

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

#### 1. プロジェクトディレクトリのみ（`/home/user/cc-web-playground/`）

```bash
/home/user/cc-web-playground/  # ← このディレクトリのみ永続化
├── .git/                      # Gitリポジトリ
├── docs/                      # ドキュメント
├── .persistence-test          # ✅ 検証済み：永続化される
└── ...                        # すべてのプロジェクトファイル

/home/user/persistence-test.txt  # ❌ 検証済み：永続化されない
```

**重要**: `/home/user/`配下全体ではなく、**Gitでクローンしたプロジェクトディレクトリのみ**が永続化される

**特徴**:
- プロジェクトファイルの完全な永続化
- Gitリポジトリの状態保持
- 作業ディレクトリの変更はすべて保存
- プロジェクト外のファイルは永続化されない

**検証結果**:
- ✅ `/home/user/cc-web-playground/.persistence-test` - 永続化成功
- ❌ `/home/user/persistence-test.txt` - 永続化されず

---

#### 2. `~/.claude/` ディレクトリ（サービス管理領域）

⚠️ **重要**: この領域はClaude Code on the Webサービスが管理しており、**ユーザーが直接コントロールできない**

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

**検証結果**:
- ❌ `~/.claude/persistence-test.txt` - ユーザー作成ファイルは永続化されず
- ✅ サービス管理ファイル（settings.json等）のみ永続化

**用途**: Claude Codeの内部動作のみ。ユーザーデータの保存には使用不可

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

## 重要な発見（検証済み）

### 1. ✅ プロジェクトディレクトリのみが永続化される

**検証結果**:
- ✅ `/home/user/cc-web-playground/.persistence-test` - 永続化成功
- ❌ `/home/user/persistence-test.txt` - 永続化されず（プロジェクト外）

**結論**:
- Gitでクローンした**プロジェクトディレクトリのみ**が永続化対象
- `/home/user/`配下全体ではない
- プロジェクト外のファイルは保存されない

**実装**: プロジェクトディレクトリがホスト側のストレージにマウントされている

---

### 2. ⚠️ `~/.claude/` はサービス管理領域（ユーザーコントロール不可）

**検証結果**:
- ❌ `~/.claude/persistence-test.txt` - ユーザー作成ファイルは永続化されず
- ✅ `settings.json`、フックスクリプト等のサービス管理ファイルは永続化

**結論**:
- Claude Code on the Webサービスが管理する内部領域
- ユーザーがデータ保存目的で使用できない
- サービスの動作に必要なファイルのみ自動管理

**サイズ**: 合計約1.5MB（会話履歴が主）

---

### 3. ✅ システムディレクトリは完全にエフェメラル

**検証結果（すべて正しく削除）**:
- ✅ `/tmp/persistence-test.txt` - 削除
- ✅ `/root/persistence-test.txt` - 削除
- ✅ `/var/tmp/persistence-test.txt` - 削除
- ✅ `/usr/local/persistence-test.txt` - 削除
- ✅ `/opt/persistence-test.txt` - 削除

**影響**:
- インストールしたパッケージは消失
- `~/.bashrc`等の設定は消失
- rootユーザーの環境カスタマイズは消失

---

### 4. ✅ シンボリックリンク（プロジェクト内）は永続化される

**検証結果**:
- ✅ `symlink-relative.txt` → `symlink-target.txt` - 有効
- ✅ `symlink-absolute.txt` → `/home/user/cc-web-playground/symlink-target.txt` - 有効
- ❌ `symlink-to-tmp.txt` → `/tmp/persistence-test.txt` - デッドリンク（ターゲット消失）
- ❌ `symlink-to-claude.txt` → `~/.claude/persistence-test.txt` - デッドリンク（ターゲット消失）

**推奨**:
- プロジェクトディレクトリ内での相対パスリンク使用が安全
- エフェメラルディレクトリへのリンクは避ける

---

## ベストプラクティス（検証済み）

### 1. 永続化したいデータの配置

#### ✅ 推奨（唯一の永続化領域）

```bash
# プロジェクトディレクトリ内のみ永続化される
/home/user/cc-web-playground/configs/
/home/user/cc-web-playground/scripts/
/home/user/cc-web-playground/data/
/home/user/cc-web-playground/.env
```

**重要**: プロジェクトディレクトリ外は永続化されない

#### ❌ 非推奨（永続化されない）

```bash
# /home/user/直下（プロジェクト外は消失）
/home/user/.my-persistent-config  # ❌ 永続化されない

# ~/.claude/（サービス管理領域、ユーザー使用不可）
~/.claude/my-custom-hook.sh      # ❌ 永続化されない
~/.claude/my-data.json           # ❌ 永続化されない

# rootホームの直接編集（消失する）
~/.bashrc                         # ❌ 消失
~/.vimrc                          # ❌ 消失

# システムディレクトリ（消失する）
/usr/local/bin/my-script          # ❌ 消失
/opt/my-tool/                     # ❌ 消失
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

#### ✅ 推奨: プロジェクト`.env`ファイル（唯一の方法）

```bash
# /home/user/cc-web-playground/.env
export MY_API_KEY="xxx"
export MY_CONFIG="yyy"

# セッション開始時
source /home/user/cc-web-playground/.env
```

**重要**: プロジェクトディレクトリ内に配置することで永続化される

#### ❌ 非推奨: `~/.claude/settings.json`の利用

```json
// ~/.claude/settings.json
{
  "environmentVariables": {
    "MY_VAR": "value"
  }
}
```

**理由**: `~/.claude/`はサービス管理領域のため、ユーザーが作成したファイルは永続化されない

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

## 検証結果の詳細

### チェックリスト（完了）

#### ✅ 永続化が確認されたもの

- [x] `/home/user/cc-web-playground/.persistence-test` - **永続化成功**
- [x] `/home/user/cc-web-playground/symlink-relative.txt`（リンク） - **有効**
- [x] `/home/user/cc-web-playground/symlink-absolute.txt`（リンク） - **有効**
- [x] `/home/user/cc-web-playground/symlink-target.txt`（ターゲット） - **永続化**

#### ❌ 永続化されなかったもの（予想と異なる）

- [x] `/home/user/persistence-test.txt` - **永続化されず**（プロジェクト外）
- [x] `~/.claude/persistence-test.txt` - **永続化されず**（ユーザー作成ファイル）

#### ✅ 正しく削除されたもの

- [x] `/tmp/persistence-test.txt` - **削除確認**
- [x] `/root/persistence-test.txt` - **削除確認**
- [x] `/var/tmp/persistence-test.txt` - **削除確認**
- [x] `/usr/local/persistence-test.txt` - **削除確認**
- [x] `/opt/persistence-test.txt` - **削除確認**

#### ⚠️ デッドリンク

- [x] `/home/user/cc-web-playground/symlink-to-tmp.txt` - **デッドリンク**（ターゲット消失）
- [x] `/home/user/cc-web-playground/symlink-to-claude.txt` - **デッドリンク**（ターゲット消失）

### 検証に使用したスクリプト

完全な検証スクリプトと結果は `persistence-test-results.txt` を参照してください。

---

## まとめ（検証完了）

### 永続化の原則（検証済み）

| ディレクトリ | 永続化 | 検証結果 | 理由 |
|------------|-------|---------|------|
| `/home/user/cc-web-playground/` | ✅ | 永続化成功 | プロジェクトディレクトリのマウント |
| `/home/user/`（プロジェクト外） | ❌ | 永続化失敗 | プロジェクト外は対象外 |
| `~/.claude/`（サービス管理） | ⚠️ | 部分的 | サービスファイルのみ永続化 |
| `~/.claude/`（ユーザー作成） | ❌ | 永続化失敗 | ユーザー使用不可 |
| `/tmp/`, `/var/tmp/` | ❌ | 正しく削除 | 一時ファイルシステム |
| `/root/`（`.claude/`除く） | ❌ | 正しく削除 | コンテナ内のみ |
| `/usr/`, `/opt/`, `/etc/` | ❌ | 正しく削除 | コンテナイメージの一部 |

### 開発者への推奨事項（検証済み）

1. **すべてのファイルをプロジェクトディレクトリ内に配置**
   - `/home/user/cc-web-playground/`配下のみが永続化される
2. **設定ファイルはGit管理下に置く**
   - プロジェクト内の`configs/`, `scripts/`等に配置
3. **セットアップスクリプトを活用**
   - エフェメラルな環境を毎回セットアップ
4. **頻繁にコミット・プッシュ**
   - データ損失リスクを最小化
5. **`~/.claude/`はユーザーデータ保存に使用しない**
   - サービス管理領域のため永続化されない

### 検証状況

✅ **検証完了**: 2025-10-30
- テストファイル配置による検証実施
- 自動検証スクリプト実行
- 結果を`persistence-test-results.txt`に保存

---

**調査実施者**: Claude (Anthropic)
**調査期間**: 2025-10-30（実験） → 2025-10-30（検証完了）
**検証ステータス**: ✅ 完了

**関連ファイル**:
- `persistence-test-results.txt` - 自動検証スクリプトの実行結果

**関連ドキュメント**:
- [01-environment-overview.md](./01-environment-overview.md)
- [02-container-lifecycle.md](./02-container-lifecycle.md)
- [04-future-investigation-plan.md](./04-future-investigation-plan.md)
