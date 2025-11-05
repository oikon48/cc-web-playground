#!/usr/bin/env python3
"""
tmuxを使って複数のClaude Codeインスタンス（またはワーカー）を管理するマネージャー

このスクリプトは以下を実証します：
1. 複数のtmuxセッションで異なるタスクを並列実行
2. 各セッションの状態を監視
3. 結果を収集して統合
"""
import subprocess
import time
import json
from datetime import datetime
from pathlib import Path

class TmuxWorkerManager:
    def __init__(self, base_session_name="worker"):
        self.base_session_name = base_session_name
        self.workers = {}

    def create_worker(self, worker_id, task_description):
        """新しいワーカーセッションを作成"""
        session_name = f"{self.base_session_name}_{worker_id}"

        # 既存セッションを削除
        subprocess.run(['tmux', 'kill-session', '-t', session_name],
                      stderr=subprocess.DEVNULL)

        # 新規セッション作成
        subprocess.run(['tmux', 'new-session', '-d', '-s', session_name,
                       '-x', '200', '-y', '50'])

        self.workers[worker_id] = {
            'session_name': session_name,
            'task': task_description,
            'status': 'created',
            'start_time': datetime.now().isoformat(),
            'output': ''
        }

        return session_name

    def send_command(self, worker_id, command):
        """ワーカーにコマンドを送信"""
        if worker_id not in self.workers:
            raise ValueError(f"Worker {worker_id} not found")

        session_name = self.workers[worker_id]['session_name']
        subprocess.run(['tmux', 'send-keys', '-t', session_name,
                       command, 'C-m'])
        self.workers[worker_id]['status'] = 'running'

    def get_worker_output(self, worker_id):
        """ワーカーの出力を取得"""
        if worker_id not in self.workers:
            return None

        session_name = self.workers[worker_id]['session_name']
        result = subprocess.run(['tmux', 'capture-pane', '-t', session_name,
                                '-p', '-S', '-100'],
                               capture_output=True, text=True)
        output = result.stdout
        self.workers[worker_id]['output'] = output
        return output

    def check_worker_complete(self, worker_id):
        """ワーカーのタスクが完了したかチェック"""
        output = self.get_worker_output(worker_id)
        # プロンプトが戻ってきたら完了とみなす
        if output and output.strip().endswith('#'):
            return True
        return False

    def get_all_outputs(self):
        """全ワーカーの出力を取得"""
        outputs = {}
        for worker_id in self.workers:
            outputs[worker_id] = self.get_worker_output(worker_id)
        return outputs

    def cleanup(self):
        """全セッションをクリーンアップ"""
        for worker_id, worker_info in self.workers.items():
            subprocess.run(['tmux', 'kill-session', '-t',
                           worker_info['session_name']],
                          stderr=subprocess.DEVNULL)

    def get_status_summary(self):
        """ワーカーの状態サマリーを取得"""
        summary = {
            'total_workers': len(self.workers),
            'workers': {}
        }
        for worker_id, worker_info in self.workers.items():
            summary['workers'][worker_id] = {
                'task': worker_info['task'],
                'status': worker_info['status'],
                'session': worker_info['session_name']
            }
        return summary


def demonstrate_multi_worker_system():
    """複数ワーカーシステムのデモンストレーション"""
    print("=" * 70)
    print("Multi-Worker Task Manager with Tmux")
    print("=" * 70)
    print()

    manager = TmuxWorkerManager("claude_worker")

    # 複数のタスクを定義
    tasks = [
        {
            'id': 'analyzer',
            'description': 'Analyze Python files in project',
            'command': '''echo "=== Code Analysis Worker ===" && \
echo "Analyzing Python files..." && \
find . -name "*.py" -type f | head -10 && \
echo "Analysis complete" && \
find . -name "*.py" | wc -l > /tmp/worker_analyzer.txt && \
echo "Result: $(cat /tmp/worker_analyzer.txt) Python files found"'''
        },
        {
            'id': 'git_info',
            'description': 'Extract git information',
            'command': '''echo "=== Git Info Worker ===" && \
echo "Getting git info..." && \
git log --oneline --all | head -10 > /tmp/worker_git.txt && \
git branch -a >> /tmp/worker_git.txt && \
echo "Git info complete" && \
echo "Recent commits: $(git log --oneline | wc -l)"'''
        },
        {
            'id': 'file_stats',
            'description': 'Collect file statistics',
            'command': '''echo "=== File Stats Worker ===" && \
echo "Collecting file stats..." && \
ls -la | wc -l > /tmp/worker_stats.txt && \
du -sh . >> /tmp/worker_stats.txt && \
echo "Stats collection complete" && \
cat /tmp/worker_stats.txt'''
        },
        {
            'id': 'documentation',
            'description': 'Check documentation files',
            'command': '''echo "=== Documentation Worker ===" && \
echo "Checking documentation..." && \
find . -name "*.md" -type f > /tmp/worker_docs.txt && \
echo "Found $(cat /tmp/worker_docs.txt | wc -l) markdown files" && \
cat /tmp/worker_docs.txt | head -5'''
        }
    ]

    # ワーカーを作成してタスクを割り当て
    print("Creating workers and assigning tasks...")
    print()
    for task in tasks:
        session = manager.create_worker(task['id'], task['description'])
        print(f"✓ Worker '{task['id']}': {task['description']}")
        print(f"  Session: {session}")

    print()
    print("Starting all tasks...")
    print()

    # 全タスクを開始
    for task in tasks:
        manager.send_command(task['id'], task['command'])

    # タスクの実行を待機
    print("Waiting for tasks to complete...")
    time.sleep(5)

    # 結果を収集
    print()
    print("=" * 70)
    print("Task Results")
    print("=" * 70)
    print()

    outputs = manager.get_all_outputs()
    for worker_id, output in outputs.items():
        print(f"--- Worker: {worker_id} ---")
        print(f"Task: {manager.workers[worker_id]['task']}")
        print()
        # 最後の部分を表示
        lines = output.split('\n')
        relevant_lines = [l for l in lines if l.strip()][-15:]
        print('\n'.join(relevant_lines))
        print()

    # ステータスサマリー
    print("=" * 70)
    print("Status Summary")
    print("=" * 70)
    summary = manager.get_status_summary()
    print(json.dumps(summary, indent=2))

    # セッション一覧を表示
    print()
    print("Active tmux sessions:")
    result = subprocess.run(['tmux', 'list-sessions'],
                           capture_output=True, text=True)
    print(result.stdout)

    print()
    print("=" * 70)
    print("To view a worker session:")
    print("  tmux attach -t <session_name>")
    print()
    print("To kill all worker sessions:")
    print("  tmux kill-session -t claude_worker_analyzer")
    print("  (repeat for each worker)")
    print("=" * 70)

    return manager


def simulate_claude_task_distribution():
    """Claudeタスク分散のシミュレーション"""
    print()
    print("=" * 70)
    print("Simulating Claude Task Distribution")
    print("=" * 70)
    print()
    print("In a real scenario, each worker would be a Claude instance")
    print("receiving different parts of a larger task.")
    print()

    manager = TmuxWorkerManager("claude_sim")

    # Claudeに割り振るようなタスクをシミュレート
    claude_tasks = [
        {
            'id': 'refactor',
            'prompt': 'Refactor authentication module',
            'command': 'echo "Claude Worker 1: Refactoring authentication..." && sleep 2 && echo "Refactoring complete - 5 functions updated"'
        },
        {
            'id': 'tests',
            'prompt': 'Write unit tests for API endpoints',
            'command': 'echo "Claude Worker 2: Writing tests..." && sleep 2 && echo "Tests complete - 12 test cases added"'
        },
        {
            'id': 'docs',
            'prompt': 'Generate API documentation',
            'command': 'echo "Claude Worker 3: Generating docs..." && sleep 2 && echo "Documentation complete - API reference updated"'
        }
    ]

    for task in claude_tasks:
        manager.create_worker(task['id'], task['prompt'])
        print(f"Assigned to Worker '{task['id']}': {task['prompt']}")
        manager.send_command(task['id'], task['command'])

    print()
    print("All Claude workers are processing their tasks...")
    time.sleep(3)

    print()
    outputs = manager.get_all_outputs()
    for worker_id, output in outputs.items():
        print(f"\nWorker '{worker_id}' result:")
        lines = [l for l in output.split('\n') if l.strip()][-5:]
        print('\n'.join(lines))

    return manager


if __name__ == "__main__":
    # メインデモ
    manager1 = demonstrate_multi_worker_system()

    # Claudeタスク分散シミュレーション
    manager2 = simulate_claude_task_distribution()

    print()
    print("=" * 70)
    print("Demo Complete!")
    print("=" * 70)
    print()
    print("This demonstrates how tmux can be used to:")
    print("  1. Create multiple isolated worker environments")
    print("  2. Distribute tasks across workers")
    print("  3. Monitor progress in real-time")
    print("  4. Collect and aggregate results")
    print()
    print("In a production system, each worker would be a Claude instance")
    print("processing different parts of a complex development task.")
    print()
