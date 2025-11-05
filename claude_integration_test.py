#!/usr/bin/env python3
"""
実際にClaude Codeと対話を試みる統合テスト

このスクリプトはいくつかのアプローチを試します：
1. Claudeをtmux内で起動
2. 出力を監視
3. コマンドを送信して応答を取得
"""
import subprocess
import time
import sys
import re

class ClaudeIntegration:
    def __init__(self):
        self.session_name = "claude_integration_test"

    def setup_session(self):
        """tmuxセッションをセットアップ"""
        print("Setting up tmux session...")
        # 既存セッションを削除
        subprocess.run(['tmux', 'kill-session', '-t', self.session_name],
                      stderr=subprocess.DEVNULL)

        # 新規セッション作成（大きめのサイズ）
        result = subprocess.run(['tmux', 'new-session', '-d', '-s', self.session_name,
                       '-x', '250', '-y', '60'],
                       capture_output=True, text=True)

        if result.returncode == 0:
            print(f"✓ Session '{self.session_name}' created")
            return True
        else:
            print(f"✗ Failed to create session: {result.stderr}")
            return False

    def send_keys(self, keys, add_enter=True):
        """セッションにキーを送信"""
        if add_enter:
            subprocess.run(['tmux', 'send-keys', '-t', self.session_name,
                           keys, 'C-m'])
        else:
            subprocess.run(['tmux', 'send-keys', '-t', self.session_name,
                           keys])

    def capture_output(self, lines=100):
        """セッションの出力を取得"""
        result = subprocess.run(['tmux', 'capture-pane', '-t', self.session_name,
                                '-p', '-S', f'-{lines}'],
                               capture_output=True, text=True)
        return result.stdout

    def wait_for_pattern(self, pattern, timeout=30, interval=0.5):
        """特定のパターンが出現するまで待機"""
        print(f"Waiting for pattern: {pattern[:50]}...")
        start = time.time()
        while time.time() - start < timeout:
            output = self.capture_output()
            if re.search(pattern, output, re.MULTILINE | re.DOTALL):
                print("✓ Pattern found!")
                return True, output
            time.sleep(interval)
        print("✗ Pattern not found (timeout)")
        return False, None

    def test_basic_commands(self):
        """基本コマンドのテスト"""
        print("\n--- Testing basic commands ---")
        self.send_keys('echo "Test 1: Basic echo"')
        time.sleep(0.5)
        output = self.capture_output(20)
        print("Output:", output[-200:])

    def try_claude_startup(self):
        """Claudeの起動を試みる"""
        print("\n--- Attempting to start Claude ---")
        print("Sending 'claude' command...")

        # 環境変数を設定してClaudeを起動
        # TERM変数を設定してターミナル互換性を確保
        self.send_keys('export TERM=xterm-256color')
        time.sleep(0.5)

        self.send_keys('claude 2>&1')
        print("Waiting for Claude to start...")

        # Claudeの起動を待つ（プロンプトやウェルカムメッセージを探す）
        for i in range(10):
            time.sleep(2)
            output = self.capture_output(50)
            print(f"\n--- Output check {i+1} ---")
            print(output[-500:] if output else "(empty)")

            # Claudeが起動したか確認（プロンプトや特定のメッセージを探す）
            if 'claude' in output.lower() or '>' in output or 'assistant' in output.lower():
                print("\n✓ Possible Claude activity detected!")
                return True

        return False

    def try_claude_with_prompt(self):
        """プロンプトを直接渡してClaudeを実行"""
        print("\n--- Testing Claude with direct prompt ---")

        # Claudeがプロンプトを引数として受け取れるかテスト
        self.send_keys('echo "Hello Claude" | timeout 10 claude 2>&1 || echo "TIMEOUT_OR_ERROR"')
        time.sleep(12)
        output = self.capture_output()
        print("Output:")
        print(output[-800:])

    def test_claude_version_or_help(self):
        """Claudeのバージョンやヘルプを取得"""
        print("\n--- Testing Claude version/help ---")

        commands = [
            'claude --version 2>&1 | head -20',
            'claude -h 2>&1 | head -20',
            'claude help 2>&1 | head -20'
        ]

        for cmd in commands:
            print(f"\nTrying: {cmd}")
            self.send_keys(f'timeout 5 {cmd} || echo "CMD_TIMEOUT"')
            time.sleep(6)
            output = self.capture_output(30)
            relevant = '\n'.join([l for l in output.split('\n') if l.strip()][-20:])
            print(relevant)

    def check_claude_api_availability(self):
        """Claude APIが利用可能かチェック"""
        print("\n--- Checking Claude API availability ---")

        # 環境変数をチェック
        self.send_keys('env | grep -i claude || echo "No Claude env vars"')
        time.sleep(1)
        output = self.capture_output(20)
        print(output[-300:])

        # APIキーの存在チェック（値は表示しない）
        self.send_keys('[ -n "$ANTHROPIC_API_KEY" ] && echo "API key exists" || echo "No API key"')
        time.sleep(1)
        output = self.capture_output(20)
        print(output[-200:])


def main():
    print("=" * 70)
    print("Claude Integration Test")
    print("=" * 70)
    print()
    print("This script attempts to integrate with Claude Code via tmux")
    print()

    integration = ClaudeIntegration()

    # セッションをセットアップ
    if not integration.setup_session():
        print("Failed to setup session. Exiting.")
        return 1

    # 基本コマンドのテスト
    integration.test_basic_commands()

    # Claude環境のチェック
    integration.check_claude_api_availability()

    # Claudeのバージョン/ヘルプをテスト
    integration.test_claude_version_or_help()

    # Claudeの起動を試みる
    # integration.try_claude_startup()

    # 直接プロンプトを渡すテスト
    # integration.try_claude_with_prompt()

    print("\n" + "=" * 70)
    print("Integration Test Complete")
    print("=" * 70)
    print()
    print(f"Session '{integration.session_name}' is still running.")
    print(f"To view: tmux attach -t {integration.session_name}")
    print(f"To kill: tmux kill-session -t {integration.session_name}")
    print()
    print("Note: Claude Code is designed for interactive use.")
    print("For programmatic usage, consider:")
    print("  1. Claude API (via HTTP)")
    print("  2. Claude SDK (Python/TypeScript)")
    print("  3. Custom automation with screen/tmux capture")
    print()

    return 0


if __name__ == "__main__":
    sys.exit(main())
