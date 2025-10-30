# Claude Code on the Web - 調査資料集

このディレクトリには、**Claude Code on the Web**環境に関する包括的な調査資料が格納されています。

---

## 📚 ドキュメント一覧

### 🟢 完了済み調査（Completed Investigations）

#### [01. 環境全体の概要](./01-environment-overview.md)
**調査日**: 2025-10-29

Claude Code環境の基本情報を網羅的に調査したレポート。

**主な内容**:
- システム基本情報（OS、CPU、メモリ）
- ユーザー権限とセキュリティ設定
- 環境変数の詳細解析
- Claude Code設定とフック機構
- インストール済みツール一覧
- Git設定とコンテナ情報
- 制限事項と注意点

**対象読者**: Claude Code on the Webを初めて使う開発者

---

#### [02. コンテナライフサイクルの詳細](./02-container-lifecycle.md)
**調査日**: 2025-10-29

gVisorベースのコンテナ環境の能力と制限を深掘り調査。

**主な内容**:
- コンテナランタイム環境（gVisor/runsc）
- リソース制限（CPU 4コア、メモリ8GB、ディスク9.8GB）
- ファイルシステム構造（9pプロトコル）
- ネットワーク能力とプロキシ経由通信
- セキュリティ（Capabilities、Seccomp）
- パッケージ管理とプロセス管理
- データ永続性の特性
- ベストプラクティスとトラブルシューティング

**対象読者**: システムアーキテクチャを理解したい上級者

---

#### [03. ghコマンド制限と回避策](./03-gh-command-workaround.md)
**調査日**: 2025-10-29

GitHub CLI (`gh`) コマンドの実行制限の原因調査と解決方法。

**主な内容**:
- `gh`コマンドブロックの原因分析
- インストール方法（apt経由）
- パターンマッチングによる制限の詳細
- 回避方法（フルパス指定、エイリアス、ラッパースクリプト）
- GitHub API直接利用の代替案
- 推奨される使用方法

**対象読者**: GitHub統合を活用したい開発者

---

#### [05. データ永続化の境界線](./05-data-persistence-boundaries.md)
**調査日**: 2025-10-30

セッション間で永続化されるデータの完全な調査。

**主な内容**:
- 永続化されるディレクトリ（`/home/user/`, `~/.claude/`）
- エフェメラルディレクトリ（`/tmp/`, `/root/`, `/opt/`等）
- `.claude/`ディレクトリの詳細構造と役割
- シンボリックリンクの挙動テスト
- ベストプラクティスとデータ損失回避策
- 次回セッションでの検証項目

**対象読者**: データ損失を回避したいすべての開発者

---

#### [Claude Code起動オプション詳細](./claude-startup-options.md)
**調査日**: 2025-10-30（更新版）

Claude Codeの起動オプション、環境変数、システム設定の徹底調査。

**主な内容**:
- プロセス構造の完全解明（process_api → environment-manager → claude）
- Claude CLIの全起動パラメータ（17種類のツール、デバッグオプション等）
- 環境変数の詳細（CLAUDE_CODE_*, MAX_THINKING_TOKENS=31999等）
- 設定ファイルスキーマの完全ドキュメント化
- フックシステムの全7種類のイベントタイプ
- フィーチャーフラグ（Statsigゲート）
- システムプロンプトの内容（Git操作ルール等）
- MCPサーバー詳細（CodeSign, Context7）
- デバッグ機能とログ確認方法

**対象読者**: Claude Codeのシステム設定を理解したいすべての開発者

---

#### [11. 起動オプション調査方法論](./11-startup-options-investigation-methodology.md)
**調査日**: 2025-10-30

Claude Code設定調査の具体的な方法と、ユーザーカスタマイズ可能な設定の完全ガイド。

**主な内容**:
- プロセス情報の調査方法（`ps`, `pstree`, `/proc/*/cmdline`）
- 環境変数の調査方法（`/proc/*/environ`, `env`）
- 設定ファイルの探索と解析（`find`, JSON Schema）
- ログファイルの活用方法（`/tmp/claude-code.log`）
- **ユーザーがカスタマイズ可能な設定の完全リスト**
  - パーミッション設定（⭐⭐⭐⭐⭐）
  - フック設定（⭐⭐⭐⭐⭐）
  - 環境変数（⭐⭐⭐⭐）
  - MCP設定（⭐⭐⭐⭐）
- 調査結果の検証方法
- 設定変更のベストプラクティス

**対象読者**: 設定をカスタマイズしたい開発者、調査手法を学びたい方

---

### 🟡 計画中（Planned）

#### [04. 今後の調査計画](./04-future-investigation-plan.md)
**作成日**: 2025-10-30

追加で調査すべき仕様と優先度別ロードマップ。

**主な内容**:
- 15カテゴリの追加調査項目
- 優先度別ロードマップ（P0〜P3）
- 調査方法のガイドライン
- ドキュメント作成テンプレート

**対象読者**: 深掘り調査を行いたい貢献者

---

## 🎯 調査の目的

### 1. 実用的な開発環境として活用する
Claude Code on the Webの能力と制限を理解し、効果的に使いこなす

### 2. トラブルシューティングの迅速化
問題発生時に参照できる詳細な資料を提供

### 3. ベストプラクティスの確立
実験と検証に基づいた推奨パターンを文書化

### 4. コミュニティへの貢献
知見を共有し、他の開発者を支援

---

## 📖 ドキュメントの読み方

### 初めての方
1. **[01-environment-overview.md](./01-environment-overview.md)** から読み始める
2. 基本的な環境の理解を得る
3. 必要に応じて他のドキュメントを参照

### 特定の問題を解決したい方
- **ghコマンドが使えない** → [03-gh-command-workaround.md](./03-gh-command-workaround.md)
- **パフォーマンスが悪い** → [02-container-lifecycle.md](./02-container-lifecycle.md) のリソース制限セクション
- **データが消えた** → [02-container-lifecycle.md](./02-container-lifecycle.md) のデータ永続性セクション
- **ネットワークエラー** → [02-container-lifecycle.md](./02-container-lifecycle.md) のネットワーク能力セクション

### システムを深く理解したい方
1. [01-environment-overview.md](./01-environment-overview.md) - 全体像
2. [02-container-lifecycle.md](./02-container-lifecycle.md) - 技術詳細
3. [03-gh-command-workaround.md](./03-gh-command-workaround.md) - 具体的な問題解決
4. [04-future-investigation-plan.md](./04-future-investigation-plan.md) - 今後の探索

---

## 🔍 調査の方法論

すべての調査は以下のプロセスで実施されています：

### 1. 情報収集（Gather）
- 環境変数、ファイルシステム、プロセス情報の収集
- 公式ドキュメント・スキーマの解析
- 既存リソースのサーベイ

### 2. 実験（Experiment）
- 仮説の立案と検証
- 制御された実験の実施
- 複数パターンのテスト

### 3. 検証（Verify）
- 再現性の確認
- 異なる条件での動作確認
- エッジケースの探索

### 4. 文書化（Document）
- 詳細な結果の記録
- ベストプラクティスの抽出
- トラブルシューティングガイドの作成

---

## 📊 調査カバレッジ

### ✅ 完了（Completed）

| カテゴリ | カバレッジ | ドキュメント |
|---------|-----------|------------|
| システム基本情報 | ████████░░ 80% | 01, 02 |
| ユーザー権限 | ██████████ 100% | 01, 02 |
| 環境変数 | ██████████ 100% | 01, 02 |
| コンテナ技術 | ████████░░ 80% | 02 |
| ファイルシステム | ███████░░░ 70% | 02 |
| ネットワーク | ██████░░░░ 60% | 01, 02 |
| Git設定 | ████████░░ 80% | 01, 03 |
| パッケージ管理 | ███████░░░ 70% | 01, 02 |
| セキュリティ | ███████░░░ 70% | 02 |
| コマンド制限 | ████████░░ 80% | 03 |
| Claude Code設定 | ██████░░░░ 60% | 01 |

### 🔄 今後調査予定（Planned）

| カテゴリ | 優先度 | 推定工数 | 計画ドキュメント |
|---------|-------|---------|----------------|
| セッション管理 | P0 | 4h | 04 |
| データ永続化 | P0 | 3h | 04 |
| レート制限 | P0 | 2h | 04 |
| パフォーマンス測定 | P1 | 6h | 04 |
| ツール実行ポリシー | P1 | 3h | 04 |
| パッケージマネージャー | P1 | 3h | 04 |
| MCP詳細 | P2 | 4h | 04 |
| Hooksシステム | P2 | 3h | 04 |
| 他10項目 | P2-P3 | 可変 | 04 |

---

## 🛠️ 活用例

### ケース1: 新規プロジェクトのセットアップ

```bash
# 01と02を読んで環境を理解
# → 必要なパッケージをインストール

apt update && apt install -y gh jq vim
alias gh="/usr/bin/gh"  # 03の知見を活用
export GH_TOKEN="${GITHUB_TOKEN}"

# プロジェクト開始
git clone ...
```

### ケース2: パフォーマンス問題の診断

```bash
# 02のリソース制限セクションを参照
free -h  # メモリ確認
df -h    # ディスク確認
ps aux --sort=-%mem | head -10  # メモリ使用プロセス確認
```

### ケース3: データ永続化の確認

```bash
# 02のデータ永続性セクションを参照
# ~/.claude/ 配下は永続化される
# /tmp は揮発性

# 重要な設定は~/.bashrcに
echo 'export MY_VAR="value"' >> ~/.bashrc
```

### ケース4: GitHub統合

```bash
# 03のghコマンド回避策を活用
GH_TOKEN="${GITHUB_TOKEN}" /usr/bin/gh pr create \
  --repo owner/repo \
  --title "Title" \
  --body "Body"
```

---

## 🤝 貢献方法

このドキュメント集は継続的に改善されています。

### 貢献の仕方

1. **誤りの報告**: Issue作成またはPR送信
2. **調査の追加**: [04-future-investigation-plan.md](./04-future-investigation-plan.md)の項目を調査
3. **ベストプラクティス追加**: 実践で得た知見を共有
4. **翻訳**: 英語版ドキュメントの作成

### 新しい調査ドキュメントの追加手順

1. `04-future-investigation-plan.md`から調査項目を選択
2. 調査を実施（テンプレートを使用）
3. `docs/05-xxx.md`のように番号付きで保存
4. このREADME.mdにリンクを追加
5. PR作成

---

## 📚 関連リソース

### 公式ドキュメント
- [Claude Code 公式ドキュメント](https://docs.claude.com/en/docs/claude-code)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)

### 技術情報
- [gVisor Documentation](https://gvisor.dev/docs/)
- [9P Protocol](https://en.wikipedia.org/wiki/9P_(protocol))
- [Linux Capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html)

### GitHub API
- [GitHub REST API](https://docs.github.com/en/rest)
- [GitHub CLI Manual](https://cli.github.com/manual/)

---

## 📞 サポート

### 質問・議論
- プロジェクトのIssueで質問を投稿
- Discussionsで議論

### バグ報告
- 再現手順を含めたIssueを作成
- 該当する調査ドキュメントを参照

---

## 📝 更新履歴

| 日付 | 更新内容 | 担当 |
|------|---------|------|
| 2025-10-30 | 起動オプション詳細調査、調査方法論追加（11番） | Claude |
| 2025-10-30 | ドキュメント構成の整理、04追加 | Claude |
| 2025-10-29 | 01〜03の調査完了 | Claude |

---

## ライセンス

このドキュメント集は、プロジェクトのライセンスに従います。

---

**最終更新**: 2025-10-30
**メンテナ**: Claude (Anthropic)
**フィードバック**: Issueまたはプルリクエストでお願いします
