#!/bin/bash
# Setup git worktrees for multi-agent parallel development

set -e

# Default values
NUM_WORKERS=3
TASK_ID=""
BASE_BRANCH=""
WORKTREE_DIR=".worktrees"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --base-branch)
      BASE_BRANCH="$2"
      shift 2
      ;;
    --num-workers)
      NUM_WORKERS="$2"
      shift 2
      ;;
    --task-id)
      TASK_ID="$2"
      shift 2
      ;;
    --worktree-dir)
      WORKTREE_DIR="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --base-branch BRANCH    Base branch name for manager (required)"
      echo "  --num-workers N         Number of worker worktrees to create (default: 3)"
      echo "  --task-id ID            Task identifier for branch naming (required)"
      echo "  --worktree-dir DIR      Directory for worktrees (default: .worktrees)"
      echo "  -h, --help              Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate required parameters
if [ -z "$BASE_BRANCH" ]; then
  echo "Error: --base-branch is required"
  exit 1
fi

if [ -z "$TASK_ID" ]; then
  echo "Error: --task-id is required"
  exit 1
fi

# Get the root directory of the git repository
GIT_ROOT=$(git rev-parse --show-toplevel)
WORKTREE_PATH="$GIT_ROOT/$WORKTREE_DIR"

# Create worktree directory if it doesn't exist
mkdir -p "$WORKTREE_PATH"

echo "Setting up multi-agent workflow..."
echo "Base branch: $BASE_BRANCH"
echo "Task ID: $TASK_ID"
echo "Number of workers: $NUM_WORKERS"
echo "Worktree directory: $WORKTREE_PATH"
echo ""

# Get current branch and commit
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse HEAD)

echo "Current branch: $CURRENT_BRANCH"
echo "Current commit: $CURRENT_COMMIT"
echo ""

# Create manager branch if it doesn't exist
if git show-ref --verify --quiet "refs/heads/$BASE_BRANCH"; then
  echo "Manager branch '$BASE_BRANCH' already exists"
else
  echo "Creating manager branch: $BASE_BRANCH"
  git branch "$BASE_BRANCH" "$CURRENT_COMMIT"
fi

# Create worker worktrees
WORKTREE_PATHS=()
for i in $(seq 1 $NUM_WORKERS); do
  WORKER_BRANCH="worker-${i}/${TASK_ID}"
  WORKER_WORKTREE="$WORKTREE_PATH/worker-${i}"

  echo "Creating worker $i..."
  echo "  Branch: $WORKER_BRANCH"
  echo "  Worktree: $WORKER_WORKTREE"

  # Remove existing worktree if it exists
  if [ -d "$WORKER_WORKTREE" ]; then
    echo "  Removing existing worktree..."
    git worktree remove "$WORKER_WORKTREE" --force 2>/dev/null || true
  fi

  # Remove existing branch if it exists
  if git show-ref --verify --quiet "refs/heads/$WORKER_BRANCH"; then
    echo "  Removing existing branch..."
    git branch -D "$WORKER_BRANCH" 2>/dev/null || true
  fi

  # Create new worktree with new branch
  git worktree add -b "$WORKER_BRANCH" "$WORKER_WORKTREE" "$CURRENT_COMMIT"

  WORKTREE_PATHS+=("$WORKER_WORKTREE")
  echo ""
done

# Create metadata file for the workflow
METADATA_FILE="$WORKTREE_PATH/workflow-metadata.json"
cat > "$METADATA_FILE" << EOF
{
  "task_id": "$TASK_ID",
  "base_branch": "$BASE_BRANCH",
  "num_workers": $NUM_WORKERS,
  "created_at": "$(date -Iseconds)",
  "current_branch": "$CURRENT_BRANCH",
  "current_commit": "$CURRENT_COMMIT",
  "workers": [
$(for i in $(seq 1 $NUM_WORKERS); do
    echo "    {"
    echo "      \"id\": $i,"
    echo "      \"branch\": \"worker-${i}/${TASK_ID}\","
    echo "      \"worktree\": \"${WORKTREE_PATH}/worker-${i}\","
    echo "      \"status\": \"initialized\""
    if [ $i -lt $NUM_WORKERS ]; then
      echo "    },"
    else
      echo "    }"
    fi
  done)
  ]
}
EOF

echo "✅ Multi-agent workflow setup complete!"
echo ""
echo "Metadata saved to: $METADATA_FILE"
echo ""
echo "Worker worktrees created:"
for path in "${WORKTREE_PATHS[@]}"; do
  echo "  - $path"
done
echo ""
echo "Next steps:"
echo "1. Launch worker agents in each worktree"
echo "2. Launch observer agent to monitor progress"
echo "3. Evaluate results and select best implementation"
echo "4. Merge selected implementation into $BASE_BRANCH"
