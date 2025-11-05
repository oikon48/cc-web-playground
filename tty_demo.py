#!/usr/bin/env python3
"""
対話型TTYの説明デモ

このスクリプトはTTY環境の違いを実演します
"""
import sys
import os

print("=" * 60)
print("対話型TTY (Terminal TeletYpe) とは？")
print("=" * 60)
print()

# 1. TTYチェック
print("【1. 現在の環境チェック】")
print(f"  stdin (標準入力) is TTY: {sys.stdin.isatty()}")
print(f"  stdout (標準出力) is TTY: {sys.stdout.isatty()}")
print(f"  stderr (標準エラー) is TTY: {sys.stderr.isatty()}")
print()

# 2. 環境変数
print("【2. ターミナル関連の環境変数】")
term = os.environ.get('TERM', '(未設定)')
print(f"  TERM: {term}")
print(f"  TERM説明: ターミナルの種類（色やカーソル制御の能力）")
print()

# 3. 対話型TTYが必要な機能
print("【3. 対話型TTYが必要な機能の例】")
print()

# 例1: カラー出力
print("  ■ カラー出力（ANSI エスケープシーケンス）")
if sys.stdout.isatty():
    # TTYの場合、カラーコードを使用
    print("    \033[31m赤色\033[0m \033[32m緑色\033[0m \033[34m青色\033[0m")
    print("    ↑ カラーで表示される")
else:
    # TTYでない場合
    print("    赤色 緑色 青色")
    print("    ↑ カラーコードが効かない（または文字化け）")
print()

# 例2: カーソル制御
print("  ■ カーソル制御")
print("    プログレスバーや動的更新に必要")
print("    例: [####------] 40% → [##########] 100%")
print("    （同じ行を上書き更新）")
print()

# 例3: 対話的入力
print("  ■ 対話的入力")
print("    ユーザーの確認を待つ: 'Continue? [y/n]'")
print("    パスワード入力（エコーバックなし）")
print()

# 4. Claude Codeの例
print("【4. Claude Codeが対話型TTYを必要とする理由】")
print()
print("  Claude Codeは以下の機能を使います：")
print("  • カラフルなUI表示")
print("  • プログレスバー（動的更新）")
print("  • ユーザー確認プロンプト")
print("  • リアルタイムストリーミング出力")
print()
print("  これらはすべて対話型TTYでないと動作しません！")
print()

# 5. 実験での問題
print("【5. あなたの実験で起きたこと】")
print()
print("  実行したコマンド:")
print("    claude -p 'prompt' > output.log")
print()
print("  問題:")
print("    • > output.log でリダイレクト")
print("    • stdoutがファイル（TTYじゃない）")
print("    • Claudeは「TTYじゃない！」と気づく")
print("    • UIを初期化できず、何も出力しない")
print()

# 6. 対話型と非対話型の比較
print("【6. 対話型 vs 非対話型の比較】")
print()
print("┌────────────────┬──────────────┬──────────────┐")
print("│                │  対話型TTY   │  非対話型    │")
print("├────────────────┼──────────────┼──────────────┤")
print("│ 実行方法       │ ./script     │ ./script > f │")
print("│ ユーザー入力   │ 可能         │ 不可         │")
print("│ カラー表示     │ 可能         │ 不可/化ける  │")
print("│ カーソル制御   │ 可能         │ 不可         │")
print("│ Claude Code    │ 動作する     │ 動作しない   │")
print("└────────────────┴──────────────┴──────────────┘")
print()

# 7. 解決方法
print("【7. 対話型TTYを確保する方法】")
print()
print("  方法1: 直接実行")
print("    $ claude")
print("    → あなたのターミナルが対話型TTY")
print()
print("  方法2: tmuxやscreenを使う")
print("    $ tmux new-session -s my_session")
print("    $ claude")
print("    → tmuxが仮想TTYを提供")
print()
print("  方法3: ptyを使う（Pythonから）")
print("    import pty")
print("    pty.spawn(['claude'])")
print("    → プログラムから仮想TTYを作成")
print()
print("  ❌ 方法X: リダイレクトやパイプ（動かない）")
print("    $ claude > output.log    # TTYじゃない！")
print("    $ echo 'hi' | claude     # TTYじゃない！")
print()

# 8. 結論
print("【8. 結論】")
print()
print("  対話型TTY = ユーザーとプログラムが会話できる環境")
print()
print("  必要な場面:")
print("  • リアルタイムでユーザーとやり取りするプログラム")
print("  • リッチなUI（色、カーソル移動、動的更新）")
print("  • Claude Code、vim、less、topなど")
print()
print("  不要な場面:")
print("  • バッチ処理")
print("  • 自動化スクリプト")
print("  • パイプラインの一部")
print()

print("=" * 60)
print("デモ完了！")
print("=" * 60)
