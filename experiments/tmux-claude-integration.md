# tmux内でのClaude Code統合実験

## 実験日時
2025-11-05

## 目的
tmux内でClaude Codeを起動し、tmux通信を通してタスクを割り振ることが可能かを検証する。

## 実施手順

### 1. git worktreeの作成
```bash
git worktree add /tmp/claude-worktree-test -b claude/test-worktree-$(date +%s)
```

### 2. tmuxセッションの作成
```bash
tmux new-session -d -s claude_worktree -c /tmp/claude-worktree-test
```

### 3. Claude Codeの起動
```bash
tmux send-keys -t claude_worktree "claude --dangerously-skip-permission" Enter
```

### 4. 入力の送信
```bash
tmux send-keys -t claude_worktree "hello, can you hear me?" Enter
```

### 5. 出力の確認
```bash
tmux capture-pane -t claude_worktree -p -S -50
```

## 実験結果

### 成功した項目
- ✅ git worktree内でClaudeプロセスを起動できる
- ✅ `--dangerously-skip-permission`オプションで権限チェックを回避
- ✅ tmux経由で入力送信が可能
- ✅ 複数のClaudeインスタンスが同時に実行可能

### 問題点
- ❌ Claude Codeがインタラクティブプロンプトを表示しない
- ❌ 入力を送信しても応答が得られない
- ❌ Claudeが初期化を完了しない（または出力をバッファリング中）

## 技術的な詳細

### プロセス構造（確認済み）
```
bash(13900)---node(14405)-+-{node}(14407)
                          |-{node}(14408)
                          |-{node}(14409)
                          |-{node}(14410)
                          |-{node}(14411)
                          |-{node}(14412)
                          |-{node}(14413)
                          |-{node}(14414)
                          |-{node}(14415)
                          `-{node}(14416)
```

### ファイルディスクリプタ
```
0 -> /dev/pts/2  # stdin
1 -> /dev/pts/2  # stdout
2 -> /dev/pts/2  # stderr
```

すべてのI/Oが正しくtmuxのpseudo-terminalに接続されていることを確認。

### tmuxペインの出力
```
root@runsc:/tmp/claude-worktree-test# claude --dangerously-skip-permission
hello, can you hear me?
Test message from outside
```

/dev/pts/2への直接書き込みは成功し、tmuxペインに表示されることを確認したが、Claude自体からの出力は得られなかった。

## 推測される原因

1. **TTY設定の問題**: Claude Codeがインタラクティブモードで特定のTTY設定や端末機能を要求している可能性
2. **初期化の遅延**: Claude APIへの接続や設定ロード時に無限待機状態になっている
3. **バッファリング**: 出力が完全にバッファリングされ、flush されていない
4. **対話型前提**: Claude Codeが完全に対話型のREPLとして設計されており、非同期な入力を想定していない

## 今後の改善案

### 短期的なアプローチ
1. **環境変数の調整**: `TERM=xterm-256color`など明示的に設定
2. **stdbuf使用**: `stdbuf -o0 claude`で出力バッファリングを無効化
3. **タイムアウト付き待機**: より長い初期化時間を許容

### 中期的なアプローチ
1. **expect/pty**: expectスクリプトやptyパッケージを使用した高度なTTYエミュレーション
2. **scriptコマンド**: `script -c "claude" /dev/null`で完全なTTYセッションをシミュレート
3. **デバッグモード**: Claudeのログレベルを上げて初期化プロセスを追跡

### 長期的なアプローチ
1. **非対話モード**: Claudeに非対話モードがあれば使用（要ドキュメント確認）
2. **APIレベルの統合**: Claude CLIではなく、Anthropic APIを直接使用
3. **カスタムラッパー**: Claude Codeの動作を制御するカスタムラッパースクリプト

## 結論

**技術的には可能だが、現時点では実用的ではない**

- tmux内でClaudeプロセスを起動し、入力を送信することは技術的に可能
- しかし、Claudeがインタラクティブプロンプトを表示せず応答しないため、実用的なタスク割り振りは困難
- 複数のClaude Codeインスタンスを同時に実行できることは実証された
- git worktreeと組み合わせることで、同じリポジトリで並行作業の基盤は整っている

## 次のステップ

1. Claude Codeのドキュメントで非対話モードやバッチモードの有無を確認
2. expectやptyを使った高度なTTYエミュレーションを試す
3. 別のアプローチとして、Claude Code APIやMCPサーバーの活用を検討
4. コミュニティやGitHubのissueで同様の試みがないか調査

## 参考情報

- Claude Code実行オプション: `--dangerously-skip-permission`
- 使用したgit機能: `git worktree`
- tmux機能: `send-keys`, `capture-pane`, `pipe-pane`
