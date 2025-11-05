#!/usr/bin/env python3
"""
tmux経由でClaudeと対話する高度なスクリプト
"""
import subprocess
import time
import re

def send_to_tmux(session, keys, add_enter=True):
    """tmuxセッションにキーを送信"""
    cmd = ['tmux', 'send-keys', '-t', session, keys]
    if add_enter:
        cmd.append('C-m')
    subprocess.run(cmd)

def capture_tmux(session, lines=100):
    """tmuxセッションの出力を取得"""
    result = subprocess.run(
        ['tmux', 'capture-pane', '-t', session, '-p', '-S', f'-{lines}'],
        capture_output=True,
        text=True
    )
    return result.stdout

def capture_tmux_with_escapes(session):
    """エスケープシーケンス付きでキャプチャ"""
    result = subprocess.run(
        ['tmux', 'capture-pane', '-t', session, '-p', '-e'],
        capture_output=True,
        text=True
    )
    return result.stdout

def wait_for_output_change(session, initial_output, timeout=60):
    """出力が変化するまで待機"""
    start = time.time()
    while time.time() - start < timeout:
        current = capture_tmux(session)
        if current != initial_output:
            return True, current
        time.sleep(2)
    return False, None

print("=" * 70)
print("tmux経由でClaudeと強制的に対話する実験")
print("=" * 70)
print()

session = "claude_forced"

# 既存セッションをクリーンアップ
print("🧹 既存セッションをクリーンアップ...")
subprocess.run(['tmux', 'kill-session', '-t', session], stderr=subprocess.DEVNULL)

# 新しいセッションを作成
print("✨ 新しいtmuxセッションを作成...")
subprocess.run(['tmux', 'new-session', '-d', '-s', session, '-x', '200', '-y', '50'])
time.sleep(1)

# Claudeを起動
print("🚀 Claudeを起動中...")
send_to_tmux(session, 'claude')
print("   待機中（20秒）...")
time.sleep(20)

# 初期画面をキャプチャ
initial = capture_tmux(session)
print("\n📸 初期画面:")
print("-" * 70)
print(initial[-500:] if len(initial) > 500 else initial)
print("-" * 70)

# プロンプトを送信
print("\n📤 プロンプトを送信: 'Create a file named test123.txt with content Hello'")
send_to_tmux(session, 'Create a file named test123.txt with content Hello')
time.sleep(2)

# Enterを送信
print("⏎ Enterキーを送信...")
send_to_tmux(session, '', add_enter=True)

# 出力の変化を監視
print("⏳ Claudeの応答を待機中（最大60秒）...")
changed, new_output = wait_for_output_change(session, initial, timeout=60)

if changed:
    print("\n✅ 出力が変化しました！")
    print("=" * 70)
    print("新しい出力:")
    print("=" * 70)
    print(new_output[-1000:])
else:
    print("\n⚠️ タイムアウト: 出力が変化しませんでした")
    print("現在の画面:")
    print(capture_tmux(session))

# ファイルが作成されたか確認
print("\n🔍 ファイル test123.txt の存在確認...")
result = subprocess.run(['ls', '-la', 'test123.txt'], capture_output=True, text=True)
if result.returncode == 0:
    print("✅ ファイルが作成されました！")
    print(result.stdout)
    content_result = subprocess.run(['cat', 'test123.txt'], capture_output=True, text=True)
    print("📄 ファイル内容:")
    print(content_result.stdout)
else:
    print("❌ ファイルは作成されませんでした")

# 最終状態
print("\n📊 最終状態:")
print(f"セッション '{session}' はまだ実行中です")
print(f"確認コマンド: tmux attach -t {session}")
print("\n" + "=" * 70)
