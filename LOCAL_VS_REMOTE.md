# ローカル環境 vs リモート環境の違い

## 現在の環境（リモート環境）

### 環境変数で判明した事実

```bash
CLAUDE_CODE_REMOTE=true
CLAUDE_CODE_ENTRYPOINT=remote
CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE=cloud_default

# 重要：FD 3,4の指定
CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR=3
CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR=4
```

### アーキテクチャ

```
┌─────────────────────────────────────────┐
│        リモート環境（現在）             │
│                                         │
│  process_api (PID 1)                   │
│    ↓ WebSocket (port 2024)             │
│  environment-manager (PID 21)          │
│    ↓ pipe (FD 3,4 を作成)             │
│  claude (PID 34) ← FD 3,4 を継承      │
│    ✅ WebSocket認証成功                │
└─────────────────────────────────────────┘
          ↓
    インターネット経由
          ↓
┌─────────────────────────────────────────┐
│     ユーザーのローカルマシン            │
│    (ブラウザ or CLIクライアント)        │
└─────────────────────────────────────────┘
```

### なぜ claude -p が動かないのか？

リモート環境では：
1. **必須：environment-manager が起動する必要がある**
2. environment-managerが FD 3, 4 を準備
3. これらのFDを継承してClaudeが起動

直接 `claude -p` を実行すると：
- environment-managerを経由しない
- FD 3, 4 が存在しない
- WebSocket認証ができない
- **何も出力されない**

## ローカル環境（通常のインストール）

### 推測されるアーキテクチャ

```
┌─────────────────────────────────────────┐
│     ユーザーのローカルマシン            │
│                                         │
│  ユーザーのターミナル                   │
│    ↓ 直接実行                          │
│  claude or claude -p                   │
│    ↓                                   │
│  認証トークン：                         │
│    - ~/.claude/config から読み取り     │
│    - または環境変数から                │
│    - またはキーチェーンから            │
│    ✅ ローカルファイルベースの認証      │
│                                         │
│  API通信：                              │
│    - 直接 Anthropic API へHTTPS通信    │
│    - WebSocketは不要                   │
└─────────────────────────────────────────┘
```

### ローカル環境で動く理由

**1. 認証方法が異なる**

リモート環境:
```bash
# FD経由でリアルタイム認証
FD 3 → WebSocket認証パイプ（動的）
FD 4 → OAuthトークンパイプ（動的）
```

ローカル環境:
```bash
# ファイルベース認証
~/.claude/config.json          # 設定ファイル
~/.claude/auth_token           # 認証トークン
または
ANTHROPIC_API_KEY=sk-xxx       # 環境変数
```

**2. 起動プロセスが異なる**

| リモート環境 | ローカル環境 |
|-------------|-------------|
| process_api → environment-manager → claude | ターミナル → claude |
| WebSocketで通信 | HTTPSで直接API通信 |
| FD 3,4 が必須 | 設定ファイルから認証 |
| `claude -p` ❌ 動かない | `claude -p` ✅ 動く |

**3. 出力方法が異なる**

リモート環境:
- TTYが必須（対話型前提）
- 出力はWebSocketで転送される
- リダイレクトは機能しない

ローカル環境:
- TTYがなくても動作可能
- stdout/stderrに直接出力
- リダイレクトが機能する

## 具体例

### ローカルマシンでの動作（予想）

```bash
# ターミナルで直接実行
$ claude -p "What is 2+2?"
4

# リダイレクトも機能
$ claude -p "Hello" > output.txt
$ cat output.txt
Hello! How can I help you today?

# tmuxでも動作する
$ tmux new-session -d -s test
$ tmux send-keys -t test 'claude -p "test"' C-m
$ tmux capture-pane -t test -p
test response here...
```

### リモート環境での動作（現在）

```bash
# 直接実行 - 動かない
$ claude -p "What is 2+2?"
（何も出力されない - FD 3,4 がないため）

# 現在のClaude内から - 動く
Claude内で: Task tool を使用してsubagentsを起動
結果: ✅ 正常に動作（FD 3,4を継承）
```

## 検証：現在の環境がリモートであることの証拠

### 1. 環境変数
```bash
$ env | grep CLAUDE_CODE_REMOTE
CLAUDE_CODE_REMOTE=true
CLAUDE_CODE_ENTRYPOINT=remote
```

### 2. プロセスツリー
```bash
$ ps aux | grep -E "process_api|environment-manager"
root 1    process_api --addr 0.0.0.0:2024
root 21   environment-manager
root 34   claude
```

### 3. FD指定
```bash
$ env | grep FILE_DESCRIPTOR
CLAUDE_CODE_WEBSOCKET_AUTH_FILE_DESCRIPTOR=3
CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR=4
```

### 4. Proxy設定（リモート環境特有）
```bash
$ env | grep PROXY
HTTP_PROXY=http://container_container_011CUpNY...
HTTPS_PROXY=http://container_container_011CUpNY...
```

## なぜこのアーキテクチャ？

### リモート環境（サンドボックス化）の利点

1. **セキュリティ**
   - ユーザーのローカルマシンから隔離
   - コンテナ内で実行
   - リソース制限が可能

2. **統一された実行環境**
   - すべてのユーザーが同じ環境
   - 依存関係の問題なし
   - OSの違いを吸収

3. **リアルタイム制御**
   - WebSocketで双方向通信
   - ブラウザから直接操作可能
   - 実行中のフィードバック

### ローカル環境の利点

1. **オフライン動作可能**
   - インターネット接続不要（API呼び出し以外）
   - ローカルファイルに直接アクセス

2. **柔軟性**
   - `claude -p` などの非対話モード
   - スクリプトからの呼び出しが容易
   - tmux統合も可能

3. **低レイテンシ**
   - ネットワーク遅延なし
   - すべてローカルで完結

## まとめ

### 質問：「通常のローカルだと何で動くの？」

**回答:**

ローカル環境では、Claude Codeは異なる認証方式を使用しています：

| 項目 | リモート環境（現在） | ローカル環境 |
|-----|-------------------|------------|
| **認証** | FD 3,4 経由（動的） | 設定ファイル（静的） |
| **通信** | WebSocket | HTTPS API |
| **起動** | environment-manager必須 | 直接起動可能 |
| **claude -p** | ❌ 動かない | ✅ 動く |
| **tmux統合** | ❌ 動かない | ✅ 動く |
| **リダイレクト** | ❌ 動かない | ✅ 動く |

**結論:**
- 現在の環境は **リモートサンドボックス環境**
- `CLAUDE_CODE_REMOTE=true` が決定的な証拠
- FD 3,4 を使ったWebSocket認証が必須
- ローカル環境なら `claude -p` や tmux統合が動作する
- **アーキテクチャの違いにより、実現可能なことが異なる**

## 今後の可能性

### リモート環境で並列タスクを実行するには

ローカル環境の利便性をリモート環境で実現するには：

```python
# ✅ Subagentsを使用（現在唯一の方法）
# FD 3,4を継承するため動作する
task_tool.invoke({
    "subagent_type": "general-purpose",
    "description": "Parallel task",
    "prompt": "Your task here"
})
```

### ローカル環境（もし使える場合）

```bash
# ✅ これらすべてが動作する
claude -p "prompt"
echo "prompt" | claude
tmux send-keys 'claude' C-m

# スクリプト化も可能
for task in task1 task2 task3; do
  claude -p "$task" > output_$task.txt &
done
wait
```

## 関連ドキュメント

- `WEBSOCKET_EXPLAINED.md` - WebSocket通信アーキテクチャ
- `CLAUDE_P_VERIFICATION.md` - claude -p 検証結果
- `TMUX_CLAUDE_INTEGRATION_REPORT.md` - tmux統合レポート
