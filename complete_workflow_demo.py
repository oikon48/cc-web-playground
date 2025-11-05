#!/usr/bin/env python3
"""
完全なワークフローデモ：Git worktree + tmux + 並列タスク実行

このスクリプトは以下を実証：
1. 複数のgit worktreeを作成
2. 各worktreeで独立したタスクを実行
3. 結果を収集してマージ
"""
import subprocess
import time
import sys
from pathlib import Path

def run_command(cmd, cwd=None):
    """コマンドを実行して結果を返す"""
    result = subprocess.run(cmd, shell=True, cwd=cwd,
                           capture_output=True, text=True)
    return result.returncode, result.stdout, result.stderr

def create_worktree(base_repo, worktree_name, branch_name):
    """Git worktreeを作成"""
    worktree_path = base_repo.parent / "claude_worktrees" / worktree_name

    # 既存のworktreeを削除
    run_command(f'git worktree remove -f {worktree_path}', cwd=base_repo)

    # 現在のブランチを取得
    _, current_branch, _ = run_command('git branch --show-current', cwd=base_repo)
    current_branch = current_branch.strip()

    # 新しいworktreeを作成
    returncode, stdout, stderr = run_command(
        f'git worktree add -b {branch_name} {worktree_path} {current_branch}',
        cwd=base_repo
    )

    if returncode == 0:
        print(f"✓ Created worktree: {worktree_path}")
        return worktree_path
    else:
        print(f"✗ Failed to create worktree: {stderr}")
        return None

def create_and_run_task(worktree_path, task_name, commands):
    """
    Worktree内でタスクを実行

    Args:
        worktree_path: worktreeのパス
        task_name: タスク名
        commands: 実行するコマンドのリスト
    """
    print(f"\n{'='*60}")
    print(f"Executing task: {task_name}")
    print(f"Location: {worktree_path}")
    print(f"{'='*60}")

    results = []

    for i, cmd in enumerate(commands, 1):
        print(f"\n[{i}/{len(commands)}] Running: {cmd}")
        returncode, stdout, stderr = run_command(cmd, cwd=worktree_path)

        if returncode == 0:
            print(f"✓ Success")
            if stdout:
                print("Output:", stdout[:200])
        else:
            print(f"✗ Failed: {stderr[:200]}")

        results.append({
            'command': cmd,
            'returncode': returncode,
            'stdout': stdout,
            'stderr': stderr
        })

    return results

def demonstrate_parallel_workflow():
    """並列ワークフローのデモンストレーション"""
    print("=" * 70)
    print("Complete Parallel Workflow Demonstration")
    print("=" * 70)
    print()

    base_repo = Path.cwd()
    worktree_base = base_repo.parent / "claude_worktrees"
    worktree_base.mkdir(exist_ok=True)

    # タスクを定義
    tasks = [
        {
            'name': 'task_python_analysis',
            'branch': 'feature/python-analysis',
            'description': 'Analyze Python files',
            'commands': [
                'pwd',
                'echo "Analyzing Python files..."',
                'find . -name "*.py" -type f > python_files.txt',
                'cat python_files.txt',
                'wc -l python_files.txt',
                'git add python_files.txt',
                'git commit -m "Add Python files analysis" || true'
            ]
        },
        {
            'name': 'task_markdown_docs',
            'branch': 'feature/markdown-docs',
            'description': 'Collect markdown documentation',
            'commands': [
                'pwd',
                'echo "Collecting markdown files..."',
                'find . -name "*.md" -type f > markdown_files.txt',
                'head -10 markdown_files.txt',
                'wc -l markdown_files.txt',
                'git add markdown_files.txt',
                'git commit -m "Add markdown files list" || true'
            ]
        },
        {
            'name': 'task_git_stats',
            'branch': 'feature/git-stats',
            'description': 'Generate git statistics',
            'commands': [
                'pwd',
                'echo "Generating git statistics..."',
                'git log --oneline | head -10 > git_recent_commits.txt',
                'git log --pretty=format:"%an" | sort | uniq -c | sort -rn > git_contributors.txt',
                'cat git_recent_commits.txt',
                'git add git_recent_commits.txt git_contributors.txt',
                'git commit -m "Add git statistics" || true'
            ]
        }
    ]

    # 各タスクを順次実行（実際の並列実行はtmuxで可能）
    task_results = []

    for task in tasks:
        print(f"\n{'='*70}")
        print(f"Setting up: {task['name']}")
        print(f"Description: {task['description']}")
        print(f"{'='*70}")

        # 1. Worktreeを作成
        worktree_path = create_worktree(base_repo, task['name'], task['branch'])
        if not worktree_path:
            print(f"Skipping {task['name']} due to worktree creation failure")
            continue

        # 2. タスクを実行
        results = create_and_run_task(worktree_path, task['name'], task['commands'])
        task_results.append({
            'task': task['name'],
            'branch': task['branch'],
            'worktree': str(worktree_path),
            'results': results
        })

    # 結果のサマリー
    print("\n" + "="*70)
    print("TASK EXECUTION SUMMARY")
    print("="*70)

    for task_result in task_results:
        print(f"\n{task_result['task']}:")
        print(f"  Branch: {task_result['branch']}")
        print(f"  Worktree: {task_result['worktree']}")
        success_count = sum(1 for r in task_result['results'] if r['returncode'] == 0)
        total_count = len(task_result['results'])
        print(f"  Status: {success_count}/{total_count} commands successful")

    # Git worktreeリストを表示
    print("\n" + "="*70)
    print("GIT WORKTREES")
    print("="*70)
    _, worktree_list, _ = run_command('git worktree list', cwd=base_repo)
    print(worktree_list)

    # 各worktreeのブランチ状態を確認
    print("="*70)
    print("BRANCH STATUS")
    print("="*70)
    for task_result in task_results:
        worktree = task_result['worktree']
        _, status, _ = run_command('git status --short', cwd=worktree)
        _, branch, _ = run_command('git branch --show-current', cwd=worktree)
        print(f"\n{task_result['task']} ({branch.strip()}):")
        if status.strip():
            print("  Changes:", status.strip())
        else:
            print("  Status: Clean (changes committed)")

    # 使用方法を表示
    print("\n" + "="*70)
    print("NEXT STEPS")
    print("="*70)
    print("\nTo merge a branch back to main:")
    print("  cd", base_repo)
    for task_result in task_results:
        print(f"  git merge {task_result['branch']}")

    print("\nTo view a worktree:")
    for task_result in task_results:
        print(f"  cd {task_result['worktree']}")

    print("\nTo cleanup worktrees:")
    for task_result in task_results:
        worktree_name = Path(task_result['worktree']).name
        print(f"  git worktree remove {worktree_name}")

    print("\n" + "="*70)
    print("DEMONSTRATION COMPLETE")
    print("="*70)
    print()
    print("This workflow demonstrated:")
    print("  ✓ Creating multiple independent git worktrees")
    print("  ✓ Running tasks in isolated environments")
    print("  ✓ Committing changes on separate branches")
    print("  ✓ Maintaining parallel development streams")
    print()
    print("With Claude Code integration, each worktree could have")
    print("a Claude instance working on different features simultaneously!")
    print()

    return task_results

if __name__ == "__main__":
    try:
        demonstrate_parallel_workflow()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
