#!/bin/bash
# tmuxで複数のタスクを並列実行するテストスクリプト

# セッション名
SESSION="parallel_tasks"

# 既存のセッションを削除
tmux kill-session -t $SESSION 2>/dev/null

# 新しいセッションを作成
tmux new-session -d -s $SESSION -n "task_manager"

# ウィンドウを分割して複数のペインを作成
tmux split-window -h -t $SESSION
tmux split-window -v -t $SESSION:0.0
tmux split-window -v -t $SESSION:0.2

# 各ペインにタスクを割り当て
# ペイン0: ファイルリスト作成
tmux send-keys -t $SESSION:0.0 'echo "Task 1: Listing files..." && ls -la > /tmp/task1_output.txt && echo "Task 1 completed" && cat /tmp/task1_output.txt' C-m

# ペイン1: Git情報取得
tmux send-keys -t $SESSION:0.1 'echo "Task 2: Git status..." && git status > /tmp/task2_output.txt 2>&1 && echo "Task 2 completed" && cat /tmp/task2_output.txt' C-m

# ペイン2: システム情報取得
tmux send-keys -t $SESSION:0.2 'echo "Task 3: System info..." && uname -a > /tmp/task3_output.txt && echo "Task 3 completed" && cat /tmp/task3_output.txt' C-m

# ペイン3: ディスク使用量
tmux send-keys -t $SESSION:0.3 'echo "Task 4: Disk usage..." && df -h > /tmp/task4_output.txt && echo "Task 4 completed" && cat /tmp/task4_output.txt' C-m

echo "Tmux session '$SESSION' created with 4 parallel tasks"
echo "To view: tmux attach -t $SESSION"
echo "Waiting for tasks to complete..."

# タスクが完了するまで待機
sleep 3

# 各ペインの出力を収集
echo -e "\n=== Collecting Results ==="
for i in {1..4}; do
    if [ -f /tmp/task${i}_output.txt ]; then
        echo -e "\n--- Task $i Output ---"
        cat /tmp/task${i}_output.txt
    fi
done

# セッションの状態を表示
echo -e "\n=== Tmux Session Status ==="
tmux list-panes -t $SESSION -F "Pane #{pane_index}: #{pane_current_command}"
