# tmuxを使ったClaude Code統合実験レポート

## 実験日時
2025-11-05

## 実験目的
tmux内でClaude Codeを起動し、tmuxの通信を通してClaudeを操作できるかを検証する。

---

## 実験結果サマリー

### ✅ 成功した項目

1. **tmux基本通信**
   - tmuxセッションの作成・管理が正常に動作
   - `tmux send-keys`でコマンドを送信可能
   - `tmux capture-pane`で出力を取得可能

2. **並列タスク管理システム**
   - 複数のtmuxセッションで異なるタスクを同時実行
   - 4つのワーカーが独立して動作
   - 結果の収集と統合が成功

3. **Pythonによる制御自動化**
   - tmuxを制御するPythonラッパーの実装
   - タスクの割り当てと監視システムの構築
   - 複数ワーカーの管理フレームワークの実証

### ⚠️ 制限事項

1. **Claude Code対話型制御の制限**
   - Claude Codeは対話型TTYを必要とし、非対話モードでの起動が困難
   - `claude --help`や`claude --version`も対話セッションを要求
   - タイムアウト付きコマンドでも応答が得られない

2. **環境情報**
   - `CLAUDE_CODE_VERSION=2.0.25`
   - `CLAUDE_CODE_REMOTE=true`
   - `ANTHROPIC_API_KEY`は未設定

---

## 実装したツール

### 1. `tmux_test_script.sh`
シェルスクリプトによる並列タスク実行デモ

**機能:**
- 4つのtmuxペインを作成
- 異なるタスクを並列実行
- 結果を自動収集

**実行結果:**
```bash
✓ 4つのタスクが並列実行
✓ ファイルリスト、Git情報、システム情報、ディスク使用量を収集
```

### 2. `claude_tmux_controller.py`
Pythonによるtmux制御ライブラリ

**機能:**
- tmuxセッション管理のPythonラッパー
- コマンド送信と出力取得のAPI
- パターン待機機能

**使用例:**
```python
controller = ClaudeTmuxController("session_name")
controller.create_session()
controller.send_keys('echo "Hello"')
output = controller.capture_pane()
```

### 3. `multi_claude_manager.py`
複数ワーカー管理システム

**機能:**
- 複数のtmuxワーカーセッションを管理
- タスクの割り当てと追跡
- ステータス監視と結果収集

**実行結果:**
```
✓ 4つのワーカーセッション作成
  - analyzer: Python ファイル解析
  - git_info: Git 履歴情報
  - file_stats: ファイル統計
  - documentation: ドキュメント検索

✓ 3つのClaude模擬ワーカー
  - refactor: 認証モジュールのリファクタリング
  - tests: ユニットテスト作成
  - docs: APIドキュメント生成
```

### 4. `claude_integration_test.py`
Claude Code統合テスト

**機能:**
- Claude Codeとの統合を試みる
- 環境変数の確認
- バージョン・ヘルプコマンドのテスト

**発見事項:**
- Claude Codeは対話型TTYが必須
- リモートモードで動作中
- 非対話的な実行は困難

---

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│         マスタープロセス (Python)         │
│  - タスク管理                            │
│  - ワーカー制御                          │
│  - 結果統合                              │
└────────┬────────────────────────────────┘
         │
         ├──────────┬──────────┬──────────┐
         │          │          │          │
    ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼────┐
    │ tmux   │ │ tmux   │ │ tmux   │ │ tmux   │
    │ Worker1│ │ Worker2│ │ Worker3│ │ Worker4│
    │        │ │        │ │        │ │        │
    │ Task A │ │ Task B │ │ Task C │ │ Task D │
    └────────┘ └────────┘ └────────┘ └────────┘
```

---

## 技術的詳細

### tmux通信プロトコル

**コマンド送信:**
```bash
tmux send-keys -t <session_name> '<command>' C-m
```

**出力取得:**
```bash
tmux capture-pane -t <session_name> -p -S -100
```

**セッション管理:**
```bash
tmux new-session -d -s <session_name> -x 200 -y 50
tmux kill-session -t <session_name>
tmux list-sessions
```

### Pythonラッパー実装

```python
class TmuxWorkerManager:
    def create_worker(self, worker_id, task_description):
        """新しいワーカーを作成"""
        session_name = f"{self.base_session_name}_{worker_id}"
        subprocess.run(['tmux', 'new-session', '-d', '-s', session_name])

    def send_command(self, worker_id, command):
        """ワーカーにコマンドを送信"""
        subprocess.run(['tmux', 'send-keys', '-t', session_name,
                       command, 'C-m'])

    def get_worker_output(self, worker_id):
        """ワーカーの出力を取得"""
        result = subprocess.run(['tmux', 'capture-pane', '-t', session_name,
                                '-p', '-S', '-100'],
                               capture_output=True, text=True)
        return result.stdout
```

---

## 実用的な使用シナリオ

### シナリオ1: コードベース解析の並列化
```python
tasks = [
    ('analyzer', 'find . -name "*.py" | xargs wc -l'),
    ('linter', 'pylint **/*.py'),
    ('type_checker', 'mypy .'),
    ('formatter', 'black --check .')
]

for task_id, command in tasks:
    manager.create_worker(task_id, command)
    manager.send_command(task_id, command)
```

### シナリオ2: テストスイートの分散実行
```python
test_groups = [
    'pytest tests/unit/',
    'pytest tests/integration/',
    'pytest tests/e2e/',
    'pytest tests/performance/'
]

for i, test_cmd in enumerate(test_groups):
    manager.create_worker(f'test_{i}', test_cmd)
```

### シナリオ3: 継続的監視
```python
# 長時間実行タスクの監視
manager.send_command('watcher', 'tail -f app.log')
while True:
    output = manager.get_worker_output('watcher')
    if 'ERROR' in output:
        alert_admin(output)
```

---

## Claude Code統合の課題と代替案

### 課題
1. **対話型制約**: Claude Codeは対話型TTYが必須
2. **自動化の制限**: コマンドライン引数での非対話実行が困難
3. **応答タイミング**: プロンプトの出現を検出する必要がある

### 代替案

#### 案1: Claude API直接使用
```python
import anthropic

client = anthropic.Anthropic(api_key="...")
response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": "タスク内容"}]
)
```

**メリット:**
- プログラマティックな制御
- 並列実行が容易
- 明確なAPI

**デメリット:**
- Claude Codeの機能（ツール使用など）が使えない
- セッション管理が必要

#### 案2: Expectベースの自動化
```bash
#!/usr/bin/expect
spawn claude
expect ">"
send "タスクを実行\r"
expect "完了"
```

**メリット:**
- 対話型アプリケーションの自動化に特化

**デメリット:**
- パターンマッチングが脆弱
- デバッグが困難

#### 案3: 画面スクレイピング
tmux capture-paneで定期的に出力を監視し、パターンマッチング

**メリット:**
- 既存ツールを使用
- 柔軟性が高い

**デメリット:**
- レスポンスタイムが遅い
- エラー処理が複雑

---

## Git Worktree統合（追加実装）

### 実装の詳細
ユーザーからの提案により、Git worktreeを使った高度なシステムを実装しました。

**利点:**
- 各ワーカーが独立したgit worktreeで動作
- 同時に複数のブランチで作業可能
- 変更が自動的に別ブランチにコミット
- マージによる統合が容易

**実装例:**
```python
# 3つの独立したworktreeを作成
- task_python_analysis → feature/python-analysis
- task_markdown_docs → feature/markdown-docs
- task_git_stats → feature/git-stats

# 各タスクが独立して実行され、結果をコミット
```

**実行結果:**
```
✓ 3つのworktreeを作成
✓ 各worktreeで独立したタスクを実行
✓ すべてのタスクが成功（7/7 commands）
✓ 各ブランチに変更をコミット
```

### --dangerously-skip-permissionオプション
このオプションは存在しますが、Claude Codeは依然として対話型TTYを必要とします。
非対話モードでの実行は困難でした。

## 結論

### できること ✅
1. **tmuxベースの並列タスク管理**: 完全に機能
2. **複数ワーカーの制御**: Python経由で可能
3. **結果の収集と統合**: 自動化可能
4. **長時間実行タスクの監視**: 実装可能
5. **Git worktreeによる独立した作業環境**: 完璧に動作
6. **並列ブランチ開発**: 実用的なワークフロー確立

### できないこと ❌
1. **Claude Code対話セッションの完全自動化**: 技術的制約
2. **非対話モードでのClaude実行**: サポートされていない
3. **プロンプトへの直接的な応答**: 検出が困難

### 推奨アプローチ 🎯

**実用的なClaude並列実行には:**

1. **Claude API使用**: 真の並列実行と制御
   ```python
   # 複数タスクを並列でAPIに送信
   with ThreadPoolExecutor(max_workers=4) as executor:
       futures = [executor.submit(call_claude_api, task)
                 for task in tasks]
   ```

2. **tmuxは補助ツールとして**: 長時間タスクの監視、ログ収集

3. **ハイブリッドアプローチ**:
   - Claude APIでタスク実行
   - tmuxで環境分離とプロセス管理
   - Pythonで全体のオーケストレーション

---

## 生成されたファイル

1. `tmux_test_script.sh` - シェルスクリプトデモ（基本的な並列実行）
2. `claude_tmux_controller.py` - Python制御ライブラリ（tmux操作の基本）
3. `multi_claude_manager.py` - ワーカー管理システム（複数ワーカー制御）
4. `claude_integration_test.py` - 統合テスト（Claude起動テスト）
5. `advanced_claude_parallel.py` - Git worktree + tmux統合システム
6. `complete_workflow_demo.py` - 完全ワークフローデモ（実用例）
7. `TMUX_CLAUDE_INTEGRATION_REPORT.md` - 本レポート

---

## 次のステップ

1. **Claude API統合の実装**
2. **エージェントフレームワークの構築**
3. **タスク分散アルゴリズムの最適化**
4. **エラーハンドリングと再試行ロジック**
5. **Webダッシュボードの開発**

---

## 実行方法

### 並列タスクデモ
```bash
./tmux_test_script.sh
```

### Python制御システム
```bash
python3 claude_tmux_controller.py
```

### マルチワーカーマネージャー
```bash
python3 multi_claude_manager.py
```

### Claude統合テスト
```bash
python3 claude_integration_test.py
```

### セッション確認
```bash
tmux list-sessions
tmux attach -t <session_name>
```

---

## 参考情報

- **tmux**: https://github.com/tmux/tmux
- **Claude API**: https://docs.anthropic.com/
- **Python subprocess**: https://docs.python.org/3/library/subprocess.html

---

**実験者注記:**
この実験により、tmuxを使った並列タスク管理システムは実用的であることが証明されました。
ただし、Claude Codeの直接制御には技術的制約があり、プログラマティックな使用には
Claude APIの利用が推奨されます。tmuxはプロセス管理とログ収集のツールとして
価値があります。
