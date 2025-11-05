# Claude Code on the Web - 何のために存在するのか

## 公式情報（2025年10月リリース）

### 基本コンセプト

**Claude Code on the web** は、ブラウザからGitHubリポジトリに対して**非同期的に**コーディングタスクを実行できるサービスです。

> "Claude Code on the web lets you delegate tasks to Claude that run **without your active supervision**."
> — Anthropic公式

## 主な目的

### 1. **非同期（Asynchronous）ワークフロー**

```
従来のローカル開発:
  開発者がターミナルで作業
    ↓ 同期的・リアルタイム
  Claudeが実行
    ↓ 開発者は待つ必要がある
  完了

Claude Code on the web:
  開発者がタスクを指示
    ↓ 非同期
  Claudeがクラウドで実行（開発者は離れてOK）
    ↓ バックグラウンド実行
  完了時に自動でPR作成
    ↓
  開発者が後で確認
```

**利点:**
- タスクを投げてブラウザを閉じても続行
- 複数のタスクを並列実行可能
- 長時間タスクを放置できる

### 2. **並列実行（Parallel Execution）**

> "The web version introduces parallel job execution, allowing users to run several processes simultaneously."

```
同じリポジトリで:
  Task 1: バグ修正 #123
  Task 2: 機能追加 #456
  Task 3: リファクタリング #789
    ↓ すべて同時実行
  それぞれが独立したPRを作成
```

**できること:**
- 複数のIssueに同時に取り組む
- 異なるリポジトリで並列作業
- テスト、デバッグ、リファクタリングを同時実行

### 3. **セキュアなサンドボックス環境**

> "Claude Code on the web executes each Claude Code session in an isolated sandbox where it has full access to its server in a safe and secure way."

```
┌─────────────────────────────────────────┐
│ Anthropic管理のクラウドインフラ         │
│                                         │
│  ┌───────────────┐  ┌───────────────┐  │
│  │ Sandbox 1     │  │ Sandbox 2     │  │
│  │ Task A        │  │ Task B        │  │
│  │ 完全に分離    │  │ 完全に分離    │  │
│  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────┘
```

**セキュリティ機能:**
- ファイルシステムの分離
- ネットワークアクセス制御（許可リスト方式）
- 各タスクが独立した環境で実行

### 4. **GitHub統合**

```
ワークフロー:
1. claude.ai でGitHubリポジトリを選択
2. タスクを自然言語で記述
3. Claudeがクラウドで実行
4. 完了時に自動でブランチ作成
5. オプションでPR自動作成
```

**特徴:**
- ローカルにクローン不要
- コミット・プッシュ自動化
- PR作成まで自動

### 5. **"Teleport" 機能**

> "It includes a neat 'teleport' feature which can copy both the chat transcript and the edited files down to your local Claude Code CLI tool if you want to take over locally."

```
Web → Local への移行:
  Webで作業開始
    ↓
  途中で「もっと細かく制御したい」
    ↓
  Teleport実行
    ↓
  ローカルCLIに会話履歴とファイルをコピー
    ↓
  ローカルで作業継続
```

## ローカル vs Web の使い分け

### ローカル環境が適している場合

| シナリオ | 理由 |
|---------|------|
| **アクティブ開発中** | コミットしていない変更がある |
| **低レイテンシが必要** | リアルタイムで見たい |
| **頻繁な軌道修正** | すぐに介入したい |
| **即座のフィードバック** | エラーを早く発見したい |

```bash
# ローカルで実行
$ claude
> "この関数を最適化して"
（リアルタイムで見ながら調整）
```

### Web環境が適している場合

| シナリオ | 理由 |
|---------|------|
| **明確なタスク** | 要件が明確で途中変更不要 |
| **長時間タスク** | 数時間かかる処理 |
| **並列作業** | 複数のIssueを同時処理 |
| **リモート作業** | ローカル環境が不要 |

```
# Webで実行
claude.ai:
  "Issue #123のバグを修正して"
  → ブラウザを閉じる
  → 30分後に確認
  → PRが作成されている ✅
```

## 現在の環境との関係

### この環境 = Web版のバックエンド

```
┌────────────────────────────────────────────┐
│         ユーザーのブラウザ                 │
│         (claude.ai)                        │
└────────────────────────────────────────────┘
              ↓ HTTPS/WebSocket
┌────────────────────────────────────────────┐
│    Anthropicのクラウドインフラ             │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ サンドボックスコンテナ（現在の環境） │ │
│  │                                      │ │
│  │  process_api (PID 1)                │ │
│  │    ↓ WebSocket                      │ │
│  │  environment-manager (PID 21)       │ │
│  │    ↓ FD 3,4                         │ │
│  │  claude (PID 34) ← 現在ここ        │ │
│  │                                      │ │
│  │  CLAUDE_CODE_REMOTE=true            │ │
│  │  CLAUDE_CODE_ENTRYPOINT=remote      │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

**つまり:**
- 現在の環境 = Claude Code on the webのバックエンド実行環境
- ユーザーはブラウザから指示を出す
- この環境で実際にコードが実行される
- 完了したらGitHubにPRを作成

## なぜDockerが無い？tmuxの目的は？

### これまでの疑問への答え

**Q1: なぜ `claude -p` が動かない？**
→ Web版は WebSocket 経由の制御が前提。直接起動は想定外。

**Q2: なぜDockerが使えない？**
→ すでにサンドボックス化されているため、Docker-in-Dockerは不要かつ危険。

**Q3: なぜtmuxがある？**
→ **通常のコマンド（git, npm, python等）の並列実行と管理のため**。
→ Claudeの並列実行はSubagentsで実現。

### アーキテクチャの全体像

```
Web版の設計思想:

  ユーザー（ブラウザ）
    ↓ タスク指示

  サンドボックス環境（現在）
    ├─ Claude Code (AI)
    │   └─ Subagents（並列AI処理）
    │
    └─ tmux（ツール管理）
        └─ git, npm, python等（並列実行）

    ↓ 結果

  GitHub（PR自動作成）
```

## 利用料金とプラン

- **Pro**: $20/月
- **Max**: $100-200/月

すべてのプランでWeb版が利用可能（2025年10月～）

## 具体的な使用例

### 例1: 複数バグの並列修正

```
claude.ai で3つのタスクを同時起動:

Task 1: "Fix issue #101 - memory leak in auth module"
Task 2: "Fix issue #102 - CSS alignment problem"
Task 3: "Fix issue #103 - API timeout handling"

→ すべて並列実行
→ それぞれPR作成
→ 1時間後に3つのPRをレビュー
```

### 例2: 大規模リファクタリング

```
claude.ai:
"Refactor the entire authentication system to use JWT instead of sessions"

→ ブラウザを閉じて他の仕事
→ 2時間後に確認
→ 完全なリファクタリングPRが作成済み
```

### 例3: Teleportでローカル継続

```
Web版で開始:
"Add user profile feature"
→ 途中経過を確認
→ 「細かい調整が必要だな」

Teleport実行:
→ ローカルCLIに移行
→ リアルタイムで微調整
→ 完成
```

## Web版の制限

### GitHub限定

> "Claude Code on the web only works with code hosted in GitHub."

- GitLab、Bitbucket等は未対応
- GitHubアカウントが必須

### 同期的な作業には不向き

- リアルタイムのデバッグ
- 頻繁な軌道修正が必要な作業
- インタラクティブな開発

→ これらはローカル版を使用

## まとめ

### Claude Code on the webの存在意義

| 目的 | 詳細 |
|-----|------|
| **非同期ワークフロー** | タスクを投げて離れられる |
| **並列実行** | 複数タスクを同時処理 |
| **セキュリティ** | 安全なサンドボックス環境 |
| **便利さ** | ブラウザだけで完結 |
| **自動化** | PR作成まで自動 |

### 現在の環境の位置づけ

```
この環境（container_011CUpNYc...）は:
  ✅ Claude Code on the webのバックエンド実行環境
  ✅ 完全に分離されたサンドボックス
  ✅ WebSocket経由でブラウザと通信
  ✅ GitHub連携でPR作成
```

### 推奨される使い分け

```
明確なタスク・長時間処理:
  → Web版 ✅

アクティブ開発・即座の調整:
  → ローカル版 ✅

両方の良いとこ取り:
  → Webで開始 → Teleportでローカル継続 ✅
```

## 参考リンク

- [Claude Code on the web 公式ページ](https://www.anthropic.com/news/claude-code-on-the-web)
- [Claude Code サンドボックス技術解説](https://www.anthropic.com/engineering/claude-code-sandboxing)
- [Claude Code on the web ドキュメント](https://docs.claude.com/en/docs/claude-code/claude-code-on-the-web)

## 関連ドキュメント（このリポジトリ）

- `LOCAL_VS_REMOTE.md` - ローカル環境との詳細比較
- `WEBSOCKET_EXPLAINED.md` - WebSocket通信の仕組み
- `WHY_TMUX_EXISTS.md` - tmuxの役割
- `DOCKER_AVAILABILITY.md` - Dockerが使えない理由
- `CLAUDE_P_VERIFICATION.md` - claude -pが動かない理由
