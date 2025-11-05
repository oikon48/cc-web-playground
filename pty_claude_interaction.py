#!/usr/bin/env python3
"""
pty（仮想TTY）を使ってClaudeと直接対話する

これが最も強力なアプローチです
"""
import pty
import os
import sys
import time
import select
import subprocess

def interact_with_claude_via_pty():
    """ptyを使ってClaudeと対話"""
    print("=" * 70)
    print("pty（仮想TTY）経由でClaudeと対話")
    print("=" * 70)
    print()

    print("🔧 仮想TTYを作成してClaudeを起動します...")
    print()

    # マスター（制御側）とスレーブ（Claude側）のTTYを作成
    master, slave = pty.openpty()

    # Claudeプロセスを起動
    print("🚀 Claudeプロセスを起動中...")
    claude_process = subprocess.Popen(
        ['claude'],
        stdin=slave,
        stdout=slave,
        stderr=slave,
        close_fds=True
    )

    print(f"✓ Claudeプロセス起動（PID: {claude_process.pid}）")
    print()

    # スレーブ側は閉じる（プロセスが使用中）
    os.close(slave)

    # 初期出力を待つ
    print("⏳ Claudeの初期化を待機中...")
    time.sleep(5)

    # 出力を読み取る
    output_buffer = b""
    timeout_count = 0
    max_timeout = 10

    while timeout_count < max_timeout:
        readable, _, _ = select.select([master], [], [], 1.0)

        if readable:
            try:
                chunk = os.read(master, 4096)
                if chunk:
                    output_buffer += chunk
                    print(f"📥 受信: {len(chunk)} バイト")
                    timeout_count = 0  # リセット
                else:
                    break
            except OSError:
                break
        else:
            timeout_count += 1
            print(f"⏱️  タイムアウト {timeout_count}/{max_timeout}")

    print()
    print("=" * 70)
    print("初期出力:")
    print("=" * 70)
    try:
        decoded = output_buffer.decode('utf-8', errors='replace')
        print(decoded)
    except Exception as e:
        print(f"デコードエラー: {e}")
        print("Raw bytes:", output_buffer[:500])
    print("=" * 70)
    print()

    # プロンプトを送信
    prompt = "What is 2+2? Please respond briefly.\\n"
    print(f"📤 プロンプトを送信: {prompt.strip()}")
    os.write(master, prompt.encode('utf-8'))

    # 応答を待つ
    print("⏳ 応答を待機中（30秒）...")
    time.sleep(30)

    # 応答を読み取る
    response_buffer = b""
    timeout_count = 0
    max_timeout = 15

    while timeout_count < max_timeout:
        readable, _, _ = select.select([master], [], [], 2.0)

        if readable:
            try:
                chunk = os.read(master, 4096)
                if chunk:
                    response_buffer += chunk
                    print(f"📥 応答受信: {len(chunk)} バイト")
                    timeout_count = 0
                else:
                    break
            except OSError:
                break
        else:
            timeout_count += 1

    print()
    print("=" * 70)
    print("Claudeの応答:")
    print("=" * 70)
    if response_buffer:
        try:
            decoded = response_buffer.decode('utf-8', errors='replace')
            print(decoded)
        except Exception as e:
            print(f"デコードエラー: {e}")
            print("Raw bytes:", response_buffer[:1000])
    else:
        print("（応答なし）")
    print("=" * 70)

    # クリーンアップ
    print()
    print("🧹 クリーンアップ中...")
    claude_process.terminate()
    try:
        claude_process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        claude_process.kill()

    os.close(master)
    print("✓ 完了")

if __name__ == "__main__":
    try:
        interact_with_claude_via_pty()
    except KeyboardInterrupt:
        print("\n\n中断されました")
    except Exception as e:
        print(f"\n\nエラー: {e}")
        import traceback
        traceback.print_exc()
