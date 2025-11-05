#!/usr/bin/env python3
"""
Git worktreeとClaude Code --dangerously-skip-permissionを使った
高度な並列実行システム

各ワーカーは独立したgit worktreeで動作し、Claudeインスタンスを持つ
"""
import subprocess
import time
import json
import os
from pathlib import Path
from datetime import datetime

class GitWorktreeClaudeManager:
    def __init__(self, base_repo_path, base_branch="main"):
        self.base_repo_path = Path(base_repo_path).resolve()
        self.base_branch = base_branch
        self.worktrees = {}
        self.workers = {}
        self.worktree_base = self.base_repo_path.parent / "claude_worktrees"

    def setup_worktree_directory(self):
        """worktree用のベースディレクトリを作成"""
        self.worktree_base.mkdir(exist_ok=True)
        print(f"✓ Worktree base directory: {self.worktree_base}")

    def create_worktree(self, worker_id, branch_name=None):
        """
        新しいgit worktreeを作成

        Args:
            worker_id: ワーカーID
            branch_name: ブランチ名（Noneの場合は新規作成）
        """
        if branch_name is None:
            branch_name = f"worker-{worker_id}-{int(time.time())}"

        worktree_path = self.worktree_base / f"worktree_{worker_id}"

        # 既存のworktreeを削除
        if worktree_path.exists():
            subprocess.run(['git', 'worktree', 'remove', '-f', str(worktree_path)],
                          cwd=self.base_repo_path, stderr=subprocess.DEVNULL)

        # 新しいworktreeを作成
        # -b オプションで新しいブランチを作成
        result = subprocess.run(
            ['git', 'worktree', 'add', '-b', branch_name, str(worktree_path), self.base_branch],
            cwd=self.base_repo_path,
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            self.worktrees[worker_id] = {
                'path': str(worktree_path),
                'branch': branch_name,
                'created_at': datetime.now().isoformat()
            }
            print(f"✓ Created worktree for worker '{worker_id}'")
            print(f"  Path: {worktree_path}")
            print(f"  Branch: {branch_name}")
            return worktree_path
        else:
            print(f"✗ Failed to create worktree: {result.stderr}")
            return None

    def create_tmux_session(self, worker_id, worktree_path):
        """
        worktree用のtmuxセッションを作成
        """
        session_name = f"claude_{worker_id}"

        # 既存セッションを削除
        subprocess.run(['tmux', 'kill-session', '-t', session_name],
                      stderr=subprocess.DEVNULL)

        # 新規セッション作成（worktreeディレクトリで開始）
        result = subprocess.run(
            ['tmux', 'new-session', '-d', '-s', session_name,
             '-c', str(worktree_path), '-x', '200', '-y', '50'],
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            print(f"✓ Created tmux session '{session_name}' in {worktree_path}")
            return session_name
        else:
            print(f"✗ Failed to create tmux session: {result.stderr}")
            return None

    def start_claude_in_session(self, worker_id, session_name, task_prompt):
        """
        tmuxセッション内でClaude Codeを起動

        --dangerously-skip-permission オプションを使用
        """
        print(f"Starting Claude in session '{session_name}'...")

        # Claude起動コマンド（プロンプト付き）
        # --dangerously-skip-permissionを試す
        claude_cmd = f'claude --dangerously-skip-permission "{task_prompt}" 2>&1 | tee /tmp/claude_{worker_id}.log'

        subprocess.run(['tmux', 'send-keys', '-t', session_name,
                       claude_cmd, 'C-m'])

        self.workers[worker_id] = {
            'session': session_name,
            'task': task_prompt,
            'status': 'running',
            'log_file': f'/tmp/claude_{worker_id}.log',
            'started_at': datetime.now().isoformat()
        }

        print(f"✓ Claude started for worker '{worker_id}'")
        print(f"  Task: {task_prompt[:60]}...")
        print(f"  Log: /tmp/claude_{worker_id}.log")

    def send_command_to_session(self, session_name, command):
        """セッションにコマンドを送信"""
        subprocess.run(['tmux', 'send-keys', '-t', session_name,
                       command, 'C-m'])

    def capture_session_output(self, session_name, lines=50):
        """セッションの出力を取得"""
        result = subprocess.run(['tmux', 'capture-pane', '-t', session_name,
                                '-p', '-S', f'-{lines}'],
                               capture_output=True, text=True)
        return result.stdout

    def get_worker_log(self, worker_id):
        """ワーカーのログファイルを読む"""
        if worker_id not in self.workers:
            return None

        log_file = self.workers[worker_id]['log_file']
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                return f.read()
        return None

    def cleanup_worktree(self, worker_id):
        """worktreeをクリーンアップ"""
        if worker_id in self.worktrees:
            worktree_path = self.worktrees[worker_id]['path']
            subprocess.run(['git', 'worktree', 'remove', '-f', worktree_path],
                          cwd=self.base_repo_path, stderr=subprocess.DEVNULL)
            print(f"✓ Removed worktree for worker '{worker_id}'")

    def cleanup_session(self, worker_id):
        """tmuxセッションをクリーンアップ"""
        if worker_id in self.workers:
            session_name = self.workers[worker_id]['session']
            subprocess.run(['tmux', 'kill-session', '-t', session_name],
                          stderr=subprocess.DEVNULL)
            print(f"✓ Killed session for worker '{worker_id}'")

    def list_worktrees(self):
        """git worktreeのリストを表示"""
        result = subprocess.run(['git', 'worktree', 'list'],
                               cwd=self.base_repo_path,
                               capture_output=True, text=True)
        return result.stdout

    def get_status_summary(self):
        """全体のステータスサマリー"""
        return {
            'worktrees': self.worktrees,
            'workers': self.workers,
            'timestamp': datetime.now().isoformat()
        }


def test_claude_with_skip_permission():
    """--dangerously-skip-permissionオプションをテスト"""
    print("=" * 70)
    print("Testing Claude with --dangerously-skip-permission")
    print("=" * 70)
    print()

    # テストセッション作成
    session_name = "claude_skip_test"
    subprocess.run(['tmux', 'kill-session', '-t', session_name],
                  stderr=subprocess.DEVNULL)
    subprocess.run(['tmux', 'new-session', '-d', '-s', session_name])

    # 様々なオプションでClaudeを試す
    test_commands = [
        'claude --help 2>&1 | head -20',
        'claude --version 2>&1',
        'echo "List files" | claude 2>&1 | head -20',
    ]

    for i, cmd in enumerate(test_commands, 1):
        print(f"\nTest {i}: {cmd}")
        subprocess.run(['tmux', 'send-keys', '-t', session_name,
                       f'timeout 5 {cmd} || echo "TIMEOUT"', 'C-m'])
        time.sleep(6)

        result = subprocess.run(['tmux', 'capture-pane', '-t', session_name, '-p'],
                               capture_output=True, text=True)
        lines = [l for l in result.stdout.split('\n') if l.strip()][-10:]
        print('\n'.join(lines))

    subprocess.run(['tmux', 'kill-session', '-t', session_name],
                  stderr=subprocess.DEVNULL)


def demonstrate_worktree_system():
    """Git worktree + tmux + Claude システムのデモ"""
    print()
    print("=" * 70)
    print("Git Worktree + Tmux + Claude Parallel System")
    print("=" * 70)
    print()

    # 現在のディレクトリをリポジトリとして使用
    current_repo = Path.cwd()

    # 現在のブランチを取得
    result = subprocess.run(['git', 'branch', '--show-current'],
                           capture_output=True, text=True, cwd=current_repo)
    current_branch = result.stdout.strip()

    print(f"Using base branch: {current_branch}")
    manager = GitWorktreeClaudeManager(current_repo, base_branch=current_branch)

    # セットアップ
    manager.setup_worktree_directory()
    print()

    # 複数のタスクを定義
    tasks = [
        {
            'id': 'feature1',
            'task': 'Create a hello world Python script'
        },
        {
            'id': 'feature2',
            'task': 'Create a simple README file'
        },
        {
            'id': 'feature3',
            'task': 'List all Python files in current directory'
        }
    ]

    print("Creating worktrees and starting workers...")
    print()

    for task in tasks:
        worker_id = task['id']

        # 1. Worktreeを作成
        worktree_path = manager.create_worktree(worker_id)
        if not worktree_path:
            continue

        # 2. Tmuxセッションを作成
        session_name = manager.create_tmux_session(worker_id, worktree_path)
        if not session_name:
            continue

        # 3. Claudeを起動（--dangerously-skip-permissionを試す）
        # manager.start_claude_in_session(worker_id, session_name, task['task'])

        # 代わりに、通常のコマンドを実行してデモ
        print(f"Setting up worker '{worker_id}' with task: {task['task']}")
        manager.send_command_to_session(session_name, f'echo "Worker {worker_id} initialized"')
        manager.send_command_to_session(session_name, 'git status')
        manager.send_command_to_session(session_name, 'pwd')

        manager.workers[worker_id] = {
            'session': session_name,
            'task': task['task'],
            'status': 'ready'
        }

    print()
    print("Waiting for workers to initialize...")
    time.sleep(3)

    # 各ワーカーの状態を確認
    print()
    print("=" * 70)
    print("Worker Status")
    print("=" * 70)
    print()

    for worker_id in manager.workers:
        session_name = manager.workers[worker_id]['session']
        output = manager.capture_session_output(session_name, 30)

        print(f"--- Worker: {worker_id} ---")
        print(f"Session: {session_name}")
        print(f"Task: {manager.workers[worker_id]['task']}")
        print()
        lines = [l for l in output.split('\n') if l.strip()][-10:]
        print('\n'.join(lines))
        print()

    # Git worktreeのリストを表示
    print("=" * 70)
    print("Git Worktrees")
    print("=" * 70)
    print(manager.list_worktrees())

    # ステータスサマリー
    print("=" * 70)
    print("Status Summary")
    print("=" * 70)
    print(json.dumps(manager.get_status_summary(), indent=2))

    print()
    print("=" * 70)
    print("System Information")
    print("=" * 70)
    print(f"Base repository: {manager.base_repo_path}")
    print(f"Worktree directory: {manager.worktree_base}")
    print(f"Active workers: {len(manager.workers)}")
    print()
    print("To view a worker session:")
    print("  tmux attach -t claude_<worker_id>")
    print()
    print("To view worktree:")
    print("  cd", manager.worktree_base / "worktree_<worker_id>")
    print()
    print("Note: Cleanup is NOT performed automatically.")
    print("      Worktrees and sessions remain for inspection.")
    print("=" * 70)

    return manager


if __name__ == "__main__":
    # --dangerously-skip-permission オプションのテスト
    test_claude_with_skip_permission()

    # Git worktreeシステムのデモ
    manager = demonstrate_worktree_system()

    print()
    print("Demo complete! Workers are still running.")
    print()
