# Claude Code on the Web - 追加調査計画

**作成日**: 2025-10-30
**ステータス**: 計画中

---

## 目次

1. [概要](#概要)
2. [既に調査済みの項目](#既に調査済みの項目)
3. [追加調査項目](#追加調査項目)
4. [優先度別調査ロードマップ](#優先度別調査ロードマップ)
5. [調査方法のガイドライン](#調査方法のガイドライン)

---

## 概要

このドキュメントは、Claude Code on the Web環境について**今後調査すべき仕様**をまとめた計画書です。

### 既存調査の成果

既に以下の3つの包括的な調査が完了しています：

- **[01-environment-overview.md](./01-environment-overview.md)** - 環境全体の概要
- **[02-container-lifecycle.md](./02-container-lifecycle.md)** - コンテナのライフサイクル詳細
- **[03-gh-command-workaround.md](./03-gh-command-workaround.md)** - ghコマンドの制限と回避策

これらを踏まえ、**Web環境特有の仕様**や**実運用で重要な項目**について、さらに深掘り調査を行う計画です。

---

## 既に調査済みの項目

### ✅ 完了している調査内容

| カテゴリ | 調査項目 | ドキュメント |
|---------|---------|------------|
| **システム基本情報** | OS、カーネル、CPU、メモリ、ディスク | 01, 02 |
| **ユーザー権限** | root権限、sudo、Linux Capabilities | 01, 02 |
| **環境変数** | Claude Code関連、GitHub、プロキシ設定 | 01, 02 |
| **コンテナ情報** | gVisor、プロセス構成、リソース制限 | 02 |
| **ファイルシステム** | 9p、マウントポイント、書き込み権限 | 02 |
| **ネットワーク** | プロキシ経由通信、接続性、DNS | 01, 02 |
| **Git設定** | 署名、プロキシ、リポジトリ設定 | 01 |
| **パッケージ管理** | apt、インストール済みツール | 01, 02 |
| **セキュリティ** | Capabilities、Seccomp、gVisor隔離 | 02 |
| **コマンド制限** | ghコマンドのブロックと回避策 | 03 |
| **Claude Code設定** | hooks、settings.json、停止フック | 01 |

---

## 追加調査項目

### 🌐 1. Webインターフェース統合とプロトコル

**目的**: ブラウザとコンテナ間の通信メカニズムを理解する

#### 調査項目

- [ ] **WebSocketプロトコル詳細**
  - ポート2024の通信内容解析
  - メッセージフォーマット（JSON構造）
  - 認証メカニズム（FD 3のWebSocket Auth）
  - ハートビート・キープアライブの挙動

- [ ] **ファイル転送メカニズム**
  - ブラウザ↔コンテナ間のファイルアップロード/ダウンロード
  - 大容量ファイルの扱い
  - バイナリファイルのエンコーディング
  - 転送速度の測定

- [ ] **ターミナル出力ストリーミング**
  - リアルタイム出力の実装方式
  - バッファリング戦略
  - ANSI エスケープシーケンスの処理
  - 日本語等マルチバイト文字の扱い

- [ ] **ブラウザ側技術スタック**
  - 使用されているライブラリ（XtermJS等）
  - クライアント側のJavaScript実装
  - WebAssemblyの使用有無
  - ブラウザストレージの利用

**調査方法**:
```bash
# WebSocket通信の監視
lsof -i :2024
netstat -tulpn | grep 2024

# process_apiのログ確認
ps aux | grep process_api
ls -la /proc/$(pgrep process_api)/fd/
```

---

### 🔌 3. MCP (Model Context Protocol) の詳細

**目的**: MCPサーバーの拡張性とカスタマイズ方法を理解する

#### 調査項目

- [ ] **利用可能なMCPサーバーリスト**
  - デフォルトで起動しているサーバー
  - 利用可能だが未起動のサーバー
  - サーバーの機能一覧

- [ ] **CodeSign MCPサーバー**
  - ポート: `$CODESIGN_MCP_PORT` (61726等)
  - 認証トークン: `$CODESIGN_MCP_TOKEN`
  - エンドポイント仕様
  - 署名プロセスの詳細

- [ ] **カスタムMCPサーバー**
  - 追加インストール方法
  - 設定ファイルの記述方法
  - ポート割り当てルール
  - セキュリティ制限

- [ ] **MCPプロトコル仕様**
  - JSON-RPC仕様への準拠度
  - メッセージフォーマット
  - エラーハンドリング

**調査方法**:
```bash
# MCPサーバーの確認
env | grep MCP
netstat -tulpn | grep $CODESIGN_MCP_PORT

# MCPサーバーへの接続テスト
curl -H "Authorization: Bearer $CODESIGN_MCP_TOKEN" \
  http://localhost:$CODESIGN_MCP_PORT/health

# プロセス確認
ps aux | grep mcp
```

---

### 🔐 4. 認証とトークン管理

**目的**: 各種トークンのライフサイクルと更新メカニズムを理解する

#### 調査項目

- [ ] **OAuth Token File Descriptor**
  - `CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR=4` の詳細
  - FDからのトークン読み取り方法
  - トークンの形式（JWT等）
  - 有効期限と更新タイミング

- [ ] **プロキシJWT認証**
  - プロキシトークンの構造解析
  - 有効期限の確認（現在約4時間と推測）
  - 自動更新メカニズムの有無
  - 期限切れ時の挙動

- [ ] **GitHub Token管理**
  - `GITHUB_TOKEN`の取得元
  - トークンスコープの確認
  - 複数アカウント切り替え方法
  - トークン更新・無効化

- [ ] **認証フロー全体**
  - ユーザーログイン → トークン発行の流れ
  - トークンのストレージ（ブラウザ側）
  - セキュリティベストプラクティス

**調査方法**:
```bash
# File Descriptor確認
ls -la /proc/self/fd/4
cat /proc/self/fd/4 2>/dev/null | head -c 100

# GitHub Tokenスコープ確認
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user \
  -i | grep -i x-oauth-scopes

# プロキシトークンの解析
echo $HTTPS_PROXY | grep -oP '(?<=http://).*(?=@)'
```

---

### 📊 5. パフォーマンス特性の定量測定

**目的**: 実用上のパフォーマンス制約を数値で把握する

#### 調査項目

- [ ] **コンテナ起動時間**
  - コールドスタート（初回起動）の時間
  - ウォームスタート（再接続）の時間
  - 起動ボトルネックの特定

- [ ] **コマンド実行レイテンシ**
  - 単純コマンド（`echo`等）の応答時間
  - 複雑コマンド（`git status`等）の応答時間
  - ネットワーク経由コマンド（`curl`等）の応答時間

- [ ] **ファイルI/O性能**
  - シーケンシャル読み書き速度
  - ランダムアクセス速度
  - 9pファイルシステムのオーバーヘッド

- [ ] **ネットワーク性能**
  - プロキシ経由のレイテンシ増加
  - スループット測定（ダウンロード/アップロード）
  - DNS解決時間

- [ ] **リソース制限下の性能**
  - メモリ使用率が高い時のCPU性能
  - ディスク使用率が高い時の書き込み速度
  - 多プロセス実行時の性能劣化

**調査方法**:
```bash
# コマンド実行時間測定
time echo "test"
time git status
time curl -o /dev/null https://www.google.com

# ファイルI/O測定
dd if=/dev/zero of=/tmp/testfile bs=1M count=100
dd if=/tmp/testfile of=/dev/null bs=1M

# ネットワーク速度測定
curl -o /dev/null -w "%{speed_download}\n" \
  https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso
```

---

### 💾 6. データ永続化の境界線

**目的**: セッション間で保持されるデータの完全な理解

#### 調査項目

- [ ] **永続化されるディレクトリの完全リスト**
  - `/home/user/` 配下
  - `~/.claude/` 配下の詳細
  - その他の永続化パス

- [ ] **`.claude/` ディレクトリの詳細**
  - 各サブディレクトリの役割
  - 同期タイミング（リアルタイム/遅延）
  - 同期失敗時の挙動

- [ ] **非Git管理ファイルの永続化**
  - プロジェクトディレクトリ内の`.gitignore`ファイル
  - `.env`ファイルなどの秘密情報
  - ビルド成果物（`node_modules`等）

- [ ] **セッション間でのファイル保持テスト**
  - 各ディレクトリにテストファイルを配置
  - セッション終了→再開後の確認
  - 永続化の信頼性検証

- [ ] **シンボリックリンクの扱い**
  - リンクの永続化
  - リンク先の永続化
  - 相対/絶対パスの違い

**調査方法**:
```bash
# テストファイル作成
echo "test" > /home/user/test-home.txt
echo "test" > /tmp/test-tmp.txt
echo "test" > /root/test-root.txt
echo "test" > ~/.claude/test-claude.txt

# 次回セッションで確認
ls -la /home/user/test-home.txt
ls -la /tmp/test-tmp.txt
ls -la /root/test-root.txt
ls -la ~/.claude/test-claude.txt
```

---

### 🪝 8. Hooksシステムの全容

**目的**: すべてのフックイベントと活用方法を理解する

#### 調査項目

- [ ] **利用可能なフックイベント**
  - `Stop`以外のフック一覧
  - 各フックのトリガータイミング
  - フックの実行コンテキスト

- [ ] **フック実行順序**
  - 複数フック設定時の優先度
  - 並列/直列実行
  - 依存関係の設定

- [ ] **フックの制限事項**
  - 実行タイムアウト時間
  - 使用可能なコマンド制限
  - 環境変数のスコープ

- [ ] **フック失敗時の挙動**
  - エラー時のフォールバック
  - リトライ機構
  - ユーザーへの通知方法

- [ ] **高度なフック活用例**
  - pre-commit風の自動テスト
  - 環境セットアップ自動化
  - セキュリティチェック

**調査方法**:
```bash
# settings.jsonのスキーマ確認
curl -s https://json.schemastore.org/claude-code-settings.json | jq

# フックのテスト
cat > ~/.claude/test-hook.sh << 'EOF'
#!/bin/bash
echo "Hook executed at $(date)"
exit 0
EOF
chmod +x ~/.claude/test-hook.sh
```

---

### 🛠️ 9. ツール実行ポリシーの詳細

**目的**: ブロックされるコマンドの完全な理解と体系的な回避策

#### 調査項目

- [ ] **ブロックパターンの完全リスト**
  - `gh`以外のブロックコマンド
  - 正規表現パターンの推測
  - ホワイトリストの存在確認

- [ ] **ブロックメカニズムの実装**
  - クライアント側（ブラウザ）のチェック
  - サーバー側（process_api）のチェック
  - チェックのタイミング

- [ ] **ツール承認UI**
  - ブラウザでの承認プロンプト
  - 承認履歴の保存
  - 一括承認の方法

- [ ] **バイパス方法の体系化**
  - フルパス指定の有効範囲
  - エイリアスの効果
  - ラッパースクリプトの推奨パターン

- [ ] **セキュリティポリシーの根拠**
  - 危険なコマンドの定義
  - 対話型コマンドの制限理由
  - ポリシーのカスタマイズ可否

**調査方法**:
```bash
# 各種コマンドのテスト
commands=("gh" "docker" "kubectl" "terraform" "ansible" "ssh")
for cmd in "${commands[@]}"; do
  echo -n "Testing $cmd: "
  $cmd --version 2>&1 | head -1
done

# フルパス vs 短縮形の比較
gh --version
/usr/bin/gh version
```

---

### 🌍 10. ネットワーク制限の詳細

**目的**: アクセス可能なネットワークリソースの完全な把握

#### 調査項目

- [ ] **アクセス可能/不可能なドメイン**
  - ホワイトリスト/ブラックリストの存在
  - 地域制限（GeoIP）
  - CDNへのアクセス

- [ ] **ポート制限**
  - アウトバウンド許可ポート一覧
  - インバウンドポートの完全ブロック確認
  - 特殊ポート（SMTP, FTP等）

- [ ] **プロキシバイパス条件**
  - `NO_PROXY`の詳細解析
  - ローカルホストの定義
  - 内部ドメインの範囲

- [ ] **WebSocket接続**
  - wss://への接続可否
  - WebSocketプロキシ対応
  - 接続維持時間

- [ ] **DNS詳細**
  - DNS over HTTPS使用確認
  - DNSサーバーの特定
  - DNS解決のロギング

**調査方法**:
```bash
# 各種ポートへの接続テスト
for port in 22 25 80 443 3306 5432 8080; do
  echo -n "Port $port: "
  timeout 2 bash -c "echo >/dev/tcp/www.google.com/$port" && echo "OPEN" || echo "BLOCKED"
done

# NO_PROXY詳細確認
echo $NO_PROXY | tr ',' '\n'

# DNS解決テスト
getent hosts github.com
nslookup github.com
dig github.com
```

---

### 📦 11. パッケージマネージャーの動作

**目的**: パッケージインストールの効率化と永続化戦略

#### 調査項目

- [ ] **aptキャッシュ動作**
  - `/var/cache/apt`の永続性
  - キャッシュヒット率の向上方法
  - ローカルミラーの設定可否

- [ ] **npm/yarn/pnpm**
  - グローバルキャッシュの場所
  - キャッシュの永続化
  - オフラインモードの利用

- [ ] **pip/Poetry/uv**
  - パッケージキャッシュの永続化
  - Virtualenvの推奨配置
  - requirements.txtの自動インストール

- [ ] **プライベートレジストリ**
  - .npmrcの設定
  - 認証情報の保存方法
  - プロキシ経由のアクセス

- [ ] **バイナリキャッシュ**
  - コンパイル済みバイナリの共有
  - クロスセッションでのキャッシュ利用

**調査方法**:
```bash
# aptキャッシュ確認
du -sh /var/cache/apt
ls -la /var/cache/apt/archives

# npmキャッシュ確認
npm config get cache
du -sh $(npm config get cache)

# pipキャッシュ確認
pip cache dir
pip cache info
```

---

### 🔄 12. ブランチとGit操作の制限

**目的**: Git操作のベストプラクティスと制限事項の把握

#### 調査項目

- [ ] **プッシュ可能なブランチ命名規則**
  - `claude/` プレフィックスの必須性
  - セッションID接尾辞の検証
  - カスタムブランチ名の可否

- [ ] **強制プッシュの可否**
  - `git push --force`の実行結果
  - `--force-with-lease`の推奨度
  - mainブランチへの保護

- [ ] **GPG/SSH署名**
  - 自動署名のメカニズム詳細
  - `/tmp/code-sign`の実装
  - 署名検証プロセス

- [ ] **Git LFS**
  - LFSのサポート状況
  - 大容量ファイルの扱い
  - ストレージ制限

- [ ] **サブモジュール**
  - サブモジュールの初期化
  - 再帰的クローン
  - プロキシ経由のアクセス

**調査方法**:
```bash
# ブランチ名テスト
git checkout -b test-branch-without-prefix
git push origin test-branch-without-prefix

# Git LFS確認
git lfs version
git lfs install

# サブモジュール確認
git submodule add https://github.com/some/repo.git test-submodule
git submodule update --init --recursive
```

---

### 🖥️ 13. ブラウザ側の要件と制限

**目的**: クライアント環境の最小要件と推奨環境の理解

#### 調査項目

- [ ] **サポートブラウザ**
  - Chrome/Edge/Safari/Firefoxのバージョン
  - モバイルブラウザの対応
  - プライベートブラウジングモード

- [ ] **必要帯域幅**
  - 最小帯域幅の測定
  - 推奨帯域幅
  - 低速回線時の挙動

- [ ] **クライアント側ストレージ**
  - LocalStorageの使用量
  - IndexedDBの利用
  - キャッシュストレージ

- [ ] **ブラウザ拡張機能の影響**
  - 広告ブロッカー
  - プライバシー拡張機能
  - 開発者ツール拡張

- [ ] **オフライン機能**
  - ServiceWorkerの有無
  - オフラインでの閲覧
  - 同期メカニズム

**調査方法**:
```javascript
// ブラウザコンソールで実行
console.log('LocalStorage usage:',
  JSON.stringify(localStorage).length);
console.log('UserAgent:', navigator.userAgent);
console.log('Connection:', navigator.connection);
```

---

### 📝 14. ログとモニタリング

**目的**: デバッグとトラブルシューティングの効率化

#### 調査項目

- [ ] **アクセス可能なログファイル**
  - システムログの場所
  - アプリケーションログ
  - ログの保存期間

- [ ] **process_apiログ**
  - ログ出力先（stdout/stderr/file）
  - ログレベルの変更方法
  - デバッグログの有効化

- [ ] **監査ログ**
  - コマンド実行履歴
  - ファイル操作履歴
  - ネットワークアクセスログ

- [ ] **デバッグモード**
  - `CLAUDE_CODE_DEBUG=true`の詳細効果
  - 追加の診断情報
  - パフォーマンスへの影響

- [ ] **メトリクス取得**
  - リソース使用状況のエクスポート
  - Prometheusフォーマット対応
  - カスタムメトリクスの追加

**調査方法**:
```bash
# ログファイル探索
find /var/log -type f -readable
journalctl --no-pager | head -100

# process_apiログ
ps aux | grep process_api
strace -p $(pgrep process_api) -e trace=write

# デバッグモード確認
env | grep DEBUG
```

---

### 🔬 15. 実験的機能とベータ機能

**目的**: 将来的な機能拡張の可能性を探る

#### 調査項目

- [ ] **フィーチャーフラグ**
  - 環境変数によるフラグ
  - 設定ファイルでのフラグ
  - 隠し機能の発見

- [ ] **実験的API**
  - ドキュメント化されていないエンドポイント
  - ベータ版機能
  - プレビュー機能

- [ ] **今後追加予定の機能**
  - ロードマップの確認
  - GitHubリポジトリのIssue/PR
  - 公式ブログ・発表

- [ ] **非公開機能の探索**
  - 設定スキーマの詳細読解
  - プロセスのコマンドライン引数
  - 環境変数の網羅的調査

**調査方法**:
```bash
# すべての環境変数をダンプ
env | sort > /tmp/all-env-vars.txt

# process_apiの引数確認
cat /proc/1/cmdline | tr '\0' '\n'

# 設定スキーマのすべてのキー
curl -s https://json.schemastore.org/claude-code-settings.json | \
  jq -r '.. | .properties? | keys[]?' | sort -u
```

---

## 優先度別調査ロードマップ

### 🟡 高優先度（P1） - 効率化・最適化

| 調査項目 | 推定工数 | 依存関係 | 備考 |
|---------|---------|---------|------|
| **5. パフォーマンス特性の定量測定** | 6h | なし | ボトルネック特定 |
| **9. ツール実行ポリシーの詳細** | 3h | 3完了 | ghコマンド問題の一般化 |
| **11. パッケージマネージャーの動作** | 3h | 6完了 | セットアップ効率化 |

**目標**: 開発効率を大幅に向上

---

### 🟢 中優先度（P2） - 拡張性・理解深化

| 調査項目 | 推定工数 | 依存関係 | 備考 |
|---------|---------|---------|------|
| **3. MCP詳細** | 4h | なし | 拡張性理解 |
| **8. Hooksシステムの全容** | 3h | なし | 自動化強化 |
| **10. ネットワーク制限の詳細** | 2h | なし | 接続トラブル解決 |
| **12. ブランチとGit操作の制限** | 2h | なし | Git運用最適化 |

**目標**: 高度な活用方法を確立

---

### 🔵 低優先度（P3） - 深掘り・研究

| 調査項目 | 推定工数 | 依存関係 | 備考 |
|---------|---------|---------|------|
| **1. Webインターフェース統合とプロトコル** | 8h | なし | 技術的興味 |
| **4. 認証とトークン管理** | 4h | なし | セキュリティ理解 |
| **13. ブラウザ側の要件と制限** | 2h | 1完了 | クライアント側理解 |
| **14. ログとモニタリング** | 3h | なし | デバッグ効率化 |
| **15. 実験的機能とベータ機能** | 不定 | すべて完了 | 発見的調査 |

**目標**: システムの深い理解と将来対応

---

## 調査方法のガイドライン

### 調査実施の原則

1. **記録を残す**
   - すべてのコマンドと結果をMarkdownで記録
   - スクリーンショットやログファイルも保存

2. **再現性を確保**
   - 調査手順をスクリプト化
   - 環境依存を明記

3. **安全第一**
   - 破壊的コマンドは慎重に
   - 重要データは事前にバックアップ（Git commit）

4. **段階的アプローチ**
   - 簡単な確認から開始
   - 複雑な実験は段階的に

### ドキュメント作成テンプレート

各調査項目について、以下の構造でドキュメント化：

```markdown
# [調査項目名] 調査レポート

## 調査日時
YYYY-MM-DD

## 目的
[この調査で明らかにしたいこと]

## 調査方法
[実行したコマンド・手順]

## 結果
[発見した事実]

## 分析
[結果の解釈・意味]

## 結論
[まとめ・推奨事項]

## 参考資料
[関連リンク・ドキュメント]
```

### 調査の進め方

#### Phase 1: 情報収集（Gather）
- 環境変数、ファイル、プロセス情報の収集
- ドキュメント・スキーマの読解
- 既存リソースのサーベイ

#### Phase 2: 実験（Experiment）
- 仮説の立案
- 制御された実験の実施
- 結果の記録

#### Phase 3: 検証（Verify）
- 再現性の確認
- 異なる条件でのテスト
- エッジケースの確認

#### Phase 4: 文書化（Document）
- 結果のまとめ
- ベストプラクティスの抽出
- トラブルシューティングガイド作成

---

## 貢献方法

このドキュメントは生きた計画書です。調査が完了したら：

1. 該当項目のチェックボックスを `[x]` にする
2. 調査レポートを `docs/` に追加
3. このドキュメントの「調査済み」セクションを更新
4. README.mdにリンクを追加

---

## 関連ドキュメント

- [01-environment-overview.md](./01-environment-overview.md) - 環境全体の概要
- [02-container-lifecycle.md](./02-container-lifecycle.md) - コンテナライフサイクル
- [03-gh-command-workaround.md](./03-gh-command-workaround.md) - ghコマンド制限
- [README.md](./README.md) - 調査資料の目次

---

**最終更新**: 2025-10-30
**次回見直し予定**: 調査項目の完了状況に応じて随時更新
