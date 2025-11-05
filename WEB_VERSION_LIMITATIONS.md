# Claude Code on the Web の制限と不便な点

## ユーザーからの指摘

> "現状勝手にPushしたり、使用できるツールに制限があったり不便な点も多いのだけれど"

## 確認された制限事項

### 1. ❌ 自動Push（制御不可）

#### 問題
```bash
# git commitを実行すると...
git commit -m "Fix bug"
git push -u origin claude/branch-xxxxx
# ↑ 自動的にPushされる
```

**制御できない点:**
- Pushのタイミングを選べない
- ローカルで修正してからPushしたい場合でも強制的にPush
- 未完成のコードがリモートに上がる可能性

#### 環境設定で確認

```bash
$ git log --oneline -5
e33820c Add comprehensive explanation...
c4d76ec Add Docker availability analysis...
853320f Add explanation of tmux purpose...
0764b6b Add explanation of local vs remote...
06f9549 Add claude -p option verification...

# すべて自動的にPushされている
```

**理由:**
- Web版の設計思想：「完了したらPR作成」が前提
- セッション終了時に自動的に同期
- リモート環境なので、ローカルに保存する場所がない

### 2. ❌ Docker使用不可

```bash
$ docker --version
docker: command not found

$ docker ps
bash: docker: command not found
```

**理由:**
- この環境自体がDockerコンテナ内
- Docker-in-Docker はセキュリティ上無効化
- リソース管理の問題

**影響:**
- Dockerfileのビルドができない
- docker-composeが使えない
- コンテナベースのテストができない

### 3. ❌ claude -p 使用不可

```bash
$ claude -p "hello"
# 0バイト出力（何も起きない）
```

**理由:**
- WebSocket経由の認証（FD 3,4）が必須
- environment-managerを経由しない起動は不可
- 直接起動では認証情報がない

**影響:**
- スクリプトからClaudeを呼び出せない
- 自動化されたワークフローが組めない
- バッチ処理ができない

### 4. ❌ tmux経由でのClaude起動不可

```bash
$ tmux new-session -d -s claude_session
$ tmux send-keys -t claude_session 'claude' C-m
# プロセスは起動するが応答なし
```

**理由:**
- FD 3,4が継承されない
- WebSocket認証が失敗

**影響:**
- 複数のClaude並列起動ができない
- tmuxでClaudeを管理できない

### 5. ❌ ローカルファイルへのアクセス制限

```bash
# ローカルマシンのファイルは見えない
$ ls /home/myuser/local-project
ls: cannot access '/home/myuser/local-project': No such file or directory
```

**理由:**
- サンドボックス環境
- GitHubリポジトリのみアクセス可能

**影響:**
- ローカルの設定ファイルが使えない
- ローカルのデータベースにアクセスできない
- ローカル環境でのテストができない

### 6. ❌ 長時間セッションの不安定さ

```bash
$ env | grep CLAUDE_CODE_VERSION
CLAUDE_CODE_VERSION=2.0.25

# セッションタイムアウトの可能性
# WebSocket接続が切れる可能性
```

**影響:**
- 長時間のタスクが途中で切れる可能性
- 再接続のオーバーヘッド

### 7. ❌ GitHub専用

```bash
# GitLab、Bitbucket等は使えない
# GitHubアカウントが必須
```

**影響:**
- GitHub以外のリポジトリでは使用不可
- 社内GitLabなどが使えない

### 8. ⚠️ sudo/root権限の制限

```bash
$ sudo apt install something
# rootユーザーだが、制限あり
$ whoami
root

# しかし一部の操作は制限される可能性
```

**理由:**
- セキュリティ上の制限
- サンドボックス内のroot

### 9. ⚠️ ネットワーク制限

```bash
$ env | grep PROXY
HTTP_PROXY=http://container_container_011CUpNY...
HTTPS_PROXY=http://container_container_011CUpNY...

# すべての通信がプロキシ経由
# 特定のホストへのアクセスが制限される可能性
```

**影響:**
- 社内ネットワークへのアクセス不可
- 特定のAPIエンドポイントが使えない可能性

### 10. ⚠️ ファイルサイズ・リポジトリサイズ制限

**予想される制限:**
- 巨大なファイルの処理が遅い
- 大規模リポジトリのクローンに時間がかかる
- ストレージ制限がある可能性

## 便利な点との比較

### ✅ できること（便利）

| 機能 | 詳細 |
|-----|------|
| **GitHub連携** | ブラウザから簡単にリポジトリ選択 |
| **自動PR作成** | 完了時に自動でPR |
| **並列タスク** | 複数のIssueを同時処理 |
| **非同期実行** | ブラウザを閉じても継続 |
| **Subagents** | AI並列処理は可能 |
| **通常ツール** | git, npm, python, tmuxは使える |
| **Teleport** | ローカル環境に移行可能 |

### ❌ できないこと（不便）

| 制限 | 影響 |
|-----|------|
| **自動Push** | タイミング制御不可 |
| **Docker** | コンテナ技術使用不可 |
| **claude -p** | スクリプト化不可 |
| **tmux+Claude** | 複数Claude並列起動不可 |
| **ローカルファイル** | アクセス不可 |
| **GitHub専用** | 他のGitサービス不可 |
| **ネットワーク** | プロキシ経由・制限あり |

## 実用的な回避策

### 問題1: 自動Pushが不便

#### 回避策A: ドラフトPRを使用

```bash
# GitHub CLIが使えれば:
gh pr create --draft --title "WIP: Feature"

# または、コミットメッセージで明示:
git commit -m "WIP: Experimental changes (not ready)"
```

#### 回避策B: Teleport機能を活用

```
Web版で開始
  ↓ 途中で不安になったら
Teleport実行
  ↓
ローカルで調整・検証
  ↓
準備できたらPush
```

#### 回避策C: 小さなタスクに分割

```
大きなタスク:
  「ユーザー認証システムを実装」
  → 途中でPushされると困る

小さく分割:
  1. "ユーザーモデルを作成"
  2. "認証ミドルウェアを追加"
  3. "ログインエンドポイントを実装"
  → 各ステップでPushしてもOK
```

### 問題2: Dockerが使えない

#### 回避策A: ローカル環境を併用

```bash
# ローカルで:
docker build -t myapp .
docker push registry.example.com/myapp

# Web版で:
# Dockerイメージは使えないが、
# デプロイスクリプトやドキュメントは作成できる
```

#### 回避策B: Docker代替手段

```bash
# Dockerの用途別代替:

# 環境分離 → Git worktree
git worktree add ../worktree_feature1

# 並列実行 → tmux + Subagents
tmux new-session -d -s parallel
# + Subagentsで並列AI処理

# ビルド → 直接ツール使用
npm run build
python setup.py build
```

### 問題3: claude -pが使えない

#### 回避策: Subagentsを使用

```python
# claude -p の代わり:
task_tool.invoke({
    "subagent_type": "general-purpose",
    "description": "Task description",
    "prompt": "Detailed task prompt"
})

# 並列実行も可能:
for task in tasks:
    task_tool.invoke({
        "subagent_type": "general-purpose",
        "prompt": task
    })
```

### 問題4: ローカルファイルが見えない

#### 回避策: GitHub経由でアップロード

```bash
# ローカルで:
git add config/local-settings.json
git commit -m "Add config"
git push

# Web版で:
# リポジトリ経由でアクセス可能
```

### 問題5: GitHub専用

#### 回避策: リポジトリをミラーリング

```bash
# GitLab → GitHub ミラーリング設定
# 1. GitHubにミラーリポジトリ作成
# 2. GitLabでミラーリング設定
# 3. Web版でGitHubリポジトリを使用
# 4. 変更をGitLabに戻す
```

## いつローカル版を使うべきか

### ローカル版が明らかに優れている場合

```
✅ Docker/コンテナが必要
✅ 社内GitLab使用
✅ ローカルデータベース接続
✅ VPN経由のアクセス
✅ 頻繁なインタラクション
✅ 未コミットのコードでテスト
✅ 完全な制御が必要
```

### ローカル版の利点

```bash
# ローカルで:
$ claude
> "この関数を修正して"
（リアルタイムで確認）
（気に入らなければ即座に調整）
（満足したらコミット）
```

**Pushのタイミング:**
```bash
# ローカルなら完全に制御可能:
git commit -m "Fix"
# ここで止めてテスト
# 問題なければ:
git push
```

## Web版の改善提案（Anthropicへのフィードバック）

### 優先度高

1. **Pushタイミングの制御**
   - `--no-push` オプション
   - 明示的なPushコマンド

2. **Docker サポート**
   - 限定的でもDocker使用を許可
   - Docker-in-Docker の安全な実装

3. **GitLab/Bitbucket対応**
   - GitHub以外のGitサービス対応

### 優先度中

4. **ローカルファイルアクセス**
   - 限定的なローカルファイルのマウント

5. **セッション永続化**
   - 長時間タスクの安定性向上

6. **ネットワーク制限の緩和**
   - 特定ドメインへのアクセス許可

### 優先度低

7. **claude -p 対応**
   - スクリプト化のサポート

8. **複数Claude並列起動**
   - tmux経由での起動サポート

## 結論：Web版の位置づけ

### Web版が最適

```
✅ 明確で単純なタスク
✅ 長時間の処理
✅ 複数リポジトリの並列作業
✅ 自動PR作成が便利
✅ GitHubベースの開発
```

### ローカル版が最適

```
✅ 複雑なインタラクション
✅ Docker/コンテナ使用
✅ 完全な制御が必要
✅ 未コミットコードでのテスト
✅ Pushタイミングの制御
✅ 社内ツール使用
```

### ハイブリッドアプローチ

```
1. Web版で開始（簡単な立ち上げ）
   ↓
2. 途中で複雑になってきたら
   ↓
3. Teleportでローカルに移行
   ↓
4. ローカルで完璧に仕上げ
   ↓
5. 自分のタイミングでPush
```

## 実際の使用感

### Web版の良い点

- **楽**: ブラウザだけで完結
- **速い**: セットアップ不要
- **安全**: サンドボックス化
- **便利**: 自動PR作成

### Web版の不便な点

- **制御不足**: 自動Pushのタイミング
- **機能制限**: Docker等が使えない
- **GitHub専用**: 他のGitサービス不可
- **インタラクション不足**: リアルタイム調整が難しい

## 推奨される使い方

### シナリオ1: 小規模バグ修正

```
✅ Web版が最適

claude.ai:
"Fix issue #123 - null pointer exception in login"
→ 30分後
→ PR作成済み
→ レビュー・マージ
```

### シナリオ2: 大規模リファクタリング

```
⚠️ ローカル版推奨

$ claude
> "大規模なリファクタリングを開始"
（段階的に確認）
（テスト実行）
（問題があれば調整）
（完璧になったらコミット）
（自分のタイミングでPush）
```

### シナリオ3: Docker必須プロジェクト

```
❌ Web版不可
✅ ローカル版必須

$ claude
> "Dockerfileを修正してテスト"
$ docker build -t test .
$ docker run test
（確認してから次のステップ）
```

## まとめ

### Web版の制限は意図的な設計

**目的:**
- セキュリティ
- シンプルさ
- 非同期ワークフロー

**トレードオフ:**
- 柔軟性の犠牲
- 制御の制限
- 特定のユースケースに最適化

### 完璧なツールは存在しない

```
Web版の哲学:
  「シンプルで安全な非同期実行」
  → 一部の制御を諦める

ローカル版の哲学:
  「完全な制御と柔軟性」
  → セットアップと管理のコスト
```

### ユーザーの選択

**あなたのユースケースに応じて:**
- シンプルなタスク → Web版
- 複雑な要件 → ローカル版
- 両方を使い分ける → ハイブリッド

**不便な点は確かに存在するが、目的に合わせた設計である**

## 関連ドキュメント

- `CLAUDE_CODE_WEB_PURPOSE.md` - Web版の目的と哲学
- `LOCAL_VS_REMOTE.md` - ローカル環境との詳細比較
- `DOCKER_AVAILABILITY.md` - Docker制限の詳細
- `WHY_TMUX_EXISTS.md` - tmuxの役割
