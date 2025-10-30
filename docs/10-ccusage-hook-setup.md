# ccusage Stop Hook セットアップ

**作成日**: 2025-10-30
**目的**: チャット終了時に自動的にトークン使用量を表示する

## 概要

`ccusage` は Claude Code のトークン使用量とコストを分析する CLI ツールです。Stop Hook に統合することで、各セッション終了時に自動的に使用量レポートを表示できます。

## ccusage について

- **GitHub**: https://github.com/ryoppippi/ccusage
- **npm**: https://www.npmjs.com/package/ccusage
- **ドキュメント**: ccusage.com

### 主な機能

- **daily**: 日次のトークン使用量とコスト
- **monthly**: 月次集計レポート
- **session**: 会話セッション別の使用量
- **blocks**: 5時間の課金ウィンドウ
- **statusline**: Hook 用のコンパクト表示（ベータ版）
- **blocks --live**: リアルタイム使用量ダッシュボード

## セットアップ手順

### 1. Stop Hook スクリプトの作成

**ファイル**: `/root/.claude/stop-hook-ccusage.sh`

```bash
#!/usr/bin/env bash
# Stop Hook: Display Claude Code token usage statistics
# This hook runs when a conversation ends to show token usage

set -euo pipefail

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Claude Code Token Usage Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run ccusage with statusline mode (compact display)
if command -v npx &> /dev/null; then
    npx --yes ccusage@latest statusline 2>/dev/null || {
        echo "ℹ️  ccusage statusline failed, showing daily report instead..."
        npx --yes ccusage@latest daily 2>/dev/null || {
            echo "⚠️  ccusage is not available"
        }
    }
else
    echo "⚠️  npx is not available, cannot run ccusage"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

### 2. 実行権限の付与

```bash
chmod +x /root/.claude/stop-hook-ccusage.sh
```

### 3. settings.json への追加

**ファイル**: `/root/.claude/settings.json`

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(gh:*)"
    ]
  },
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/stop-hook-git-check.sh"
          },
          {
            "type": "command",
            "command": "~/.claude/stop-hook-ccusage.sh"
          }
        ]
      }
    ]
  }
}
```

**重要ポイント**:
- `hooks` 配列に複数の hook を追加できる
- 既存の `stop-hook-git-check.sh` はそのまま維持
- 新しい `stop-hook-ccusage.sh` を追加

## 動作確認

### 手動テスト

```bash
~/.claude/stop-hook-ccusage.sh
```

### 期待される出力

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Claude Code Token Usage Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────┬────────────────────┬──────────┬──────────┬────────────┬──────────┬────────────┬──────────┐
│ Date     │ Models             │    Input │   Output │      Cache │    Cache │      Total │     Cost │
│          │                    │          │          │     Create │     Read │     Tokens │    (USD) │
├──────────┼────────────────────┼──────────┼──────────┼────────────┼──────────┼────────────┼──────────┤
│ 2025     │ - haiku-4-5        │    5,881 │   11,392 │    399,098 │ 4,638,4… │  5,054,866 │    $2.60 │
│ 10-30    │ - sonnet-4-5       │          │          │            │          │            │          │
├──────────┼────────────────────┼──────────┼──────────┼────────────┼──────────┼────────────┼──────────┤
│ Total    │                    │    5,881 │   11,392 │    399,098 │ 4,638,4… │  5,054,866 │    $2.60 │
└──────────┴────────────────────┴──────────┴──────────┴────────────┴──────────┴────────────┴──────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 表示内容の説明

| カラム | 説明 |
|--------|------|
| **Date** | 日付（YYYY-MM-DD 形式） |
| **Models** | 使用したモデル（haiku-4-5, sonnet-4-5 など） |
| **Input** | 入力トークン数 |
| **Output** | 出力トークン数 |
| **Cache Create** | キャッシュ作成トークン数 |
| **Cache Read** | キャッシュ読み込みトークン数 |
| **Total Tokens** | 合計トークン数 |
| **Cost (USD)** | コスト（米ドル） |

### トークンの種類

1. **Input**: ユーザーからの入力とシステムプロンプト
2. **Output**: AI からの応答
3. **Cache Create**: プロンプトキャッシュの作成
4. **Cache Read**: キャッシュからの読み込み（コスト削減）

## Hook の実行タイミング

Stop Hook は以下のタイミングで実行されます：

1. **チャット終了時**: ユーザーが会話を終了したとき
2. **セッション終了時**: ブラウザを閉じたとき
3. **手動実行**: `/stop` コマンド実行時（もし実装されていれば）

## トラブルシューティング

### statusline モードが失敗する

**現象**: `❌ No input provided` エラー

**原因**: statusline モードはまだベータ版で、特定の入力形式が必要

**対処**: スクリプトは自動的に daily モードにフォールバックするため、問題なし

### npx が見つからない

**現象**: `⚠️ npx is not available, cannot run ccusage`

**原因**: Node.js がインストールされていない

**対処**:
```bash
# Node.js がインストールされているか確認
node --version
npm --version

# パスが通っているか確認
which npx
```

### Hook が実行されない

**原因**:
1. 設定ファイルの構文エラー
2. スクリプトの実行権限がない
3. 設定がまだ読み込まれていない

**対処**:
```bash
# 構文チェック
cat /root/.claude/settings.json | jq .

# 実行権限確認
ls -la /root/.claude/stop-hook-ccusage.sh

# 手動実行テスト
~/.claude/stop-hook-ccusage.sh
```

## 他の ccusage コマンド

### 月次レポート

```bash
npx ccusage@latest monthly
```

### セッション別レポート

```bash
npx ccusage@latest session
```

### リアルタイムダッシュボード

```bash
npx ccusage@latest blocks --live
```

### 特定プロジェクトのフィルタリング

```bash
npx ccusage@latest daily --instances project-name
```

## カスタマイズ

### 異なる表示モードを使用

スクリプトを編集して、異なるモードを使用できます：

```bash
# monthly レポートを表示
npx --yes ccusage@latest monthly

# session レポートを表示
npx --yes ccusage@latest session

# blocks レポートを表示
npx --yes ccusage@latest blocks
```

### 表示をシンプルにする

装飾を削除してシンプルな表示に：

```bash
#!/usr/bin/env bash
set -euo pipefail
npx --yes ccusage@latest daily 2>/dev/null
```

## 設定ファイルの永続化

**注意**: `/root/.claude/settings.json` はプロジェクトディレクトリ外にあるため、セッションをまたいで永続化されるか不明です。

### 次のセッションでの確認事項

1. Stop Hook が自動実行されるか
2. スクリプトファイルが存在するか
3. settings.json の内容が保持されているか

### バックアップ推奨

```bash
# 設定のバックアップ
cp /root/.claude/settings.json ~/settings.json.backup

# スクリプトのバックアップ
cp /root/.claude/stop-hook-ccusage.sh ~/stop-hook-ccusage.sh.backup
```

## まとめ

✅ **完了した設定**:
- Stop Hook スクリプト作成
- 実行権限付与
- settings.json への追加
- 動作確認

🎯 **効果**:
- チャット終了時に自動的にトークン使用量が表示される
- コスト管理が容易になる
- トークン消費の傾向を把握できる

📝 **次のセッションでの確認**:
- Hook が自動実行されるか
- 設定ファイルが永続化されているか

---

**作成日**: 2025-10-30
**テスト**: 手動テスト成功
**ステータス**: 動作確認済み（次セッションでの自動実行要検証）
