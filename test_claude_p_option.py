#!/usr/bin/env python3
"""
claude -p オプションを使った詳細なテスト
"""
import subprocess
import time
import os
from pathlib import Path

def test_claude_p_option():
    """claude -p オプションをテスト"""
    print("=" * 70)
    print("Testing 'claude -p' option")
    print("=" * 70)
    print()

    # テスト1: 単純なプロンプト
    print("Test 1: Simple prompt")
    print("-" * 70)

    session = "claude_p_simple"
    subprocess.run(['tmux', 'kill-session', '-t', session], stderr=subprocess.DEVNULL)
    subprocess.run(['tmux', 'new-session', '-d', '-s', session, '-x', '200', '-y', '50'])

    # シンプルなプロンプトを送信
    cmd = 'claude -p "What is 2+2?" > /tmp/claude_test1.log 2>&1 &'
    print(f"Running: {cmd}")
    subprocess.run(['tmux', 'send-keys', '-t', session, cmd, 'C-m'])

    print("Waiting 30 seconds...")
    time.sleep(30)

    # 結果を確認
    if Path('/tmp/claude_test1.log').exists():
        with open('/tmp/claude_test1.log') as f:
            content = f.read()
            print("✓ Log file created!")
            print(f"Content ({len(content)} bytes):")
            print(content[:500] if content else "(empty)")
    else:
        print("✗ Log file not created")

    # プロセスを確認
    result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
    claude_procs = [line for line in result.stdout.split('\n') if 'claude -p' in line and 'grep' not in line]
    print(f"\nClaude processes: {len(claude_procs)}")
    for proc in claude_procs[:3]:
        print(f"  {proc[:100]}")

    print("\n" + "=" * 70)

    # テスト2: 環境変数を設定して試す
    print("\nTest 2: With TERM environment variable")
    print("-" * 70)

    session2 = "claude_p_term"
    subprocess.run(['tmux', 'kill-session', '-t', session2], stderr=subprocess.DEVNULL)
    subprocess.run(['tmux', 'new-session', '-d', '-s', session2])

    cmd2 = 'TERM=dumb claude -p "Hello" > /tmp/claude_test2.log 2>&1 &'
    print(f"Running: {cmd2}")
    subprocess.run(['tmux', 'send-keys', '-t', session2, cmd2, 'C-m'])

    print("Waiting 30 seconds...")
    time.sleep(30)

    if Path('/tmp/claude_test2.log').exists():
        with open('/tmp/claude_test2.log') as f:
            content = f.read()
            print("✓ Log file created!")
            print(f"Content ({len(content)} bytes):")
            print(content[:500] if content else "(empty)")
    else:
        print("✗ Log file not created")

    print("\n" + "=" * 70)

    # テスト3: タイムアウト付きで実行
    print("\nTest 3: With timeout")
    print("-" * 70)

    session3 = "claude_p_timeout"
    subprocess.run(['tmux', 'kill-session', '-t', session3], stderr=subprocess.DEVNULL)
    subprocess.run(['tmux', 'new-session', '-d', '-s', session3])

    cmd3 = 'timeout 25 claude -p "Say OK" > /tmp/claude_test3.log 2>&1'
    print(f"Running: {cmd3}")
    subprocess.run(['tmux', 'send-keys', '-t', session3, cmd3, 'C-m'])

    print("Waiting 30 seconds...")
    time.sleep(30)

    # tmux画面を確認
    result = subprocess.run(['tmux', 'capture-pane', '-t', session3, '-p'],
                           capture_output=True, text=True)
    print("Tmux output:")
    print(result.stdout[-500:] if result.stdout else "(empty)")

    if Path('/tmp/claude_test3.log').exists():
        with open('/tmp/claude_test3.log') as f:
            content = f.read()
            print("\n✓ Log file created!")
            print(f"Content ({len(content)} bytes):")
            print(content[:500] if content else "(empty)")
    else:
        print("\n✗ Log file not created")

    print("\n" + "=" * 70)
    print("Test Complete")
    print("=" * 70)

    # クリーンアップ
    for proc in claude_procs:
        pid = proc.split()[1]
        try:
            subprocess.run(['kill', pid], stderr=subprocess.DEVNULL)
        except:
            pass


if __name__ == "__main__":
    test_claude_p_option()
