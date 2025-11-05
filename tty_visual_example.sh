#!/bin/bash
# 対話型TTYの視覚的デモ

echo "=================================================="
echo "対話型TTYの視覚的デモ"
echo "=================================================="
echo

# 例1: 対話型プログラムの例
echo "【例1】対話型プログラムを試してみる"
echo
echo "1. Python対話モード（対話型TTYが必要）"
echo "   $ python"
echo "   >>> print('Hello')"
echo "   Hello"
echo "   >>> _  ← カーソルが待機"
echo

echo "2. vim エディタ（対話型TTYが必要）"
echo "   $ vim file.txt"
echo "   [画面全体を制御、カーソル移動]"
echo

echo "3. top コマンド（対話型TTYが必要）"
echo "   $ top"
echo "   [リアルタイム更新、カラー表示]"
echo

echo "4. Claude Code（対話型TTYが必要）"
echo "   $ claude"
echo "   [リッチなUI、カラー、プログレスバー]"
echo

# 例2: 非対話型での実行
echo "【例2】非対話型で実行するとどうなる？"
echo
echo "■ Pythonをリダイレクト"
echo "  $ echo 'print(123)' | python"
echo "  → 結果: 123"
echo "  → 動作: OK（単純な入出力）"
echo

echo "■ vimをリダイレクト"
echo "  $ echo 'i' | vim file.txt"
echo "  → 結果: エラーまたはハング"
echo "  → 理由: TTYがないと起動できない"
echo

echo "■ Claudeをリダイレクト"
echo "  $ claude -p 'hello' > output.log"
echo "  → 結果: 何も出力されない（0バイト）"
echo "  → 理由: TTYがないとUIを初期化できない"
echo

# 例3: TTYチェックの仕組み
echo "【例3】プログラムがTTYをチェックする方法"
echo
echo "C言語の例:"
echo "  if (isatty(STDIN_FILENO)) {"
echo "    printf(\"対話型モード\\n\");"
echo "  } else {"
echo "    printf(\"バッチモード\\n\");"
echo "  }"
echo

echo "Pythonの例:"
echo "  import sys"
echo "  if sys.stdin.isatty():"
echo "    print('対話型モード')"
echo "  else:"
echo "    print('バッチモード')"
echo

# 例4: 実際にチェック
echo "【例4】現在の環境をチェック"
echo
echo "このスクリプトの実行環境:"

if [ -t 0 ]; then
    echo "  stdin: TTY ✓"
else
    echo "  stdin: TTY ではない ✗"
fi

if [ -t 1 ]; then
    echo "  stdout: TTY ✓"
else
    echo "  stdout: TTY ではない ✗"
fi

if [ -t 2 ]; then
    echo "  stderr: TTY ✓"
else
    echo "  stderr: TTY ではない ✗"
fi

echo

# 例5: 実践例
echo "【例5】実際に試してみよう"
echo
echo "次のコマンドで違いを体験できます:"
echo
echo "1. TTY環境で実行:"
echo "   $ python3"
echo "   （Ctrl+Dで終了）"
echo
echo "2. 非TTY環境で実行:"
echo "   $ echo 'print(123)' | python3"
echo "   （すぐ終了、対話できない）"
echo

# まとめ
echo "【まとめ】"
echo
echo "対話型TTY = あなたとプログラムがリアルタイムで会話"
echo
echo "  人間 ⟷ TTY ⟷ プログラム"
echo "         ↑"
echo "   双方向通信が可能"
echo
echo "非対話型 = 一方通行の通信"
echo
echo "  ファイル → プログラム → ファイル"
echo "              ↑"
echo "       会話はできない"
echo

echo "=================================================="
echo "Claude Codeは対話型TTYが必須！"
echo "だから 'claude -p' > file.log は動かない"
echo "=================================================="
