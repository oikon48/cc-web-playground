#!/usr/bin/env python3
"""
tmuxを通じてClaude Codeと対話するコントローラー
"""
import subprocess
import time
import re

class ClaudeTmuxController:
    def __init__(self, session_name="claude_session"):
        self.session_name = session_name

    def create_session(self):
        """新しいtmuxセッションを作成"""
        # 既存セッションを削除
        subprocess.run(['tmux', 'kill-session', '-t', self.session_name],
                      stderr=subprocess.DEVNULL)

        # 新規セッション作成
        subprocess.run(['tmux', 'new-session', '-d', '-s', self.session_name,
                       '-x', '200', '-y', '50'])
        time.sleep(1)

    def send_keys(self, keys):
        """tmuxセッションにキーを送信"""
        subprocess.run(['tmux', 'send-keys', '-t', self.session_name,
                       keys, 'C-m'])

    def capture_pane(self):
        """tmuxセッションの出力を取得"""
        result = subprocess.run(['tmux', 'capture-pane', '-t', self.session_name,
                                '-p', '-S', '-100'],
                               capture_output=True, text=True)
        return result.stdout

    def wait_for_pattern(self, pattern, timeout=30, interval=1):
        """特定のパターンが出力に現れるまで待機"""
        start_time = time.time()
        while time.time() - start_time < timeout:
            output = self.capture_pane()
            if re.search(pattern, output, re.MULTILINE | re.DOTALL):
                return True, output
            time.sleep(interval)
        return False, None

    def start_claude(self):
        """Claudeを起動"""
        print(f"Starting Claude in tmux session: {self.session_name}")
        self.send_keys('claude')
        time.sleep(3)

    def send_task(self, task):
        """Claudeにタスクを送信"""
        print(f"Sending task: {task[:50]}...")
        self.send_keys(task)

    def get_output(self):
        """現在の出力を取得"""
        return self.capture_pane()


def test_tmux_communication():
    """tmux通信のテスト"""
    print("=== Testing Tmux Communication ===\n")

    controller = ClaudeTmuxController("test_session")
    controller.create_session()

    # 簡単なコマンドをテスト
    print("Test 1: Echo command")
    controller.send_keys('echo "Hello from Tmux Controller"')
    time.sleep(1)
    output = controller.get_output()
    print(output[-200:])  # 最後の200文字

    print("\nTest 2: Multiple commands")
    controller.send_keys('pwd')
    time.sleep(1)
    controller.send_keys('date')
    time.sleep(1)
    output = controller.get_output()
    print(output[-300:])

    # Claude起動テスト（対話的なので難しいが試す）
    print("\n\nTest 3: Attempting to start Claude...")
    print("(Note: Claude is interactive and may require TTY)")
    controller.send_keys('timeout 5 claude --version 2>&1 || echo "Claude requires interactive TTY"')
    time.sleep(6)
    output = controller.get_output()
    print(output[-400:])

    print("\n=== Test Complete ===")
    print(f"To view session: tmux attach -t {controller.session_name}")

    # セッションを維持（デバッグ用）
    return controller


def demonstrate_parallel_tasks():
    """tmuxで複数のタスクを並列実行するデモ"""
    print("\n=== Demonstrating Parallel Task Execution ===\n")

    tasks = [
        ("task1", "echo 'Task 1: Analyzing codebase...' && sleep 2 && find . -name '*.py' | wc -l"),
        ("task2", "echo 'Task 2: Checking git history...' && sleep 2 && git log --oneline | head -5"),
        ("task3", "echo 'Task 3: Running tests...' && sleep 2 && echo 'Test simulation complete'"),
    ]

    controllers = []

    # 各タスク用のセッションを作成
    for task_name, command in tasks:
        controller = ClaudeTmuxController(task_name)
        controller.create_session()
        controller.send_keys(command)
        controllers.append((task_name, controller))
        print(f"Started {task_name}")

    # 少し待ってから結果を収集
    print("\nWaiting for tasks to complete...")
    time.sleep(4)

    print("\n=== Task Results ===\n")
    for task_name, controller in controllers:
        output = controller.get_output()
        print(f"--- {task_name} ---")
        print(output[-200:])
        print()

    return controllers


if __name__ == "__main__":
    print("Claude Tmux Controller Test\n")
    print("This script demonstrates controlling processes via tmux")
    print("=" * 60 + "\n")

    # テスト実行
    controller = test_tmux_communication()

    # 並列タスクのデモ
    task_controllers = demonstrate_parallel_tasks()

    print("\n" + "=" * 60)
    print("All sessions are still running.")
    print("Use 'tmux list-sessions' to see them")
    print("Use 'tmux attach -t <session_name>' to view")
