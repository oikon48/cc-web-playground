#!/bin/bash
# Merge selected worker implementation into manager branch

set -e

# Default values
WORKER_ID=""
MANAGER_BRANCH=""
METADATA_FILE=""
CLEANUP=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --worker-id)
      WORKER_ID="$2"
      shift 2
      ;;
    --manager-branch)
      MANAGER_BRANCH="$2"
      shift 2
      ;;
    --metadata)
      METADATA_FILE="$2"
      shift 2
      ;;
    --no-cleanup)
      CLEANUP=false
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --worker-id ID          Worker ID to merge (required)"
      echo "  --manager-branch NAME   Manager branch name (required)"
      echo "  --metadata FILE         Workflow metadata file (required)"
      echo "  --no-cleanup            Don't clean up worktrees after merge"
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
if [ -z "$WORKER_ID" ]; then
  echo "Error: --worker-id is required"
  exit 1
fi

if [ -z "$MANAGER_BRANCH" ]; then
  echo "Error: --manager-branch is required"
  exit 1
fi

if [ -z "$METADATA_FILE" ]; then
  echo "Error: --metadata is required"
  exit 1
fi

# Check if metadata file exists
if [ ! -f "$METADATA_FILE" ]; then
  echo "Error: Metadata file not found: $METADATA_FILE"
  exit 1
fi

# Extract worker information from metadata
TASK_ID=$(grep -oP '"task_id":\s*"\K[^"]+' "$METADATA_FILE")
WORKER_BRANCH="worker-${WORKER_ID}/${TASK_ID}"

echo "Merging selected implementation..."
echo "Worker ID: $WORKER_ID"
echo "Worker Branch: $WORKER_BRANCH"
echo "Manager Branch: $MANAGER_BRANCH"
echo "Metadata: $METADATA_FILE"
echo ""

# Verify worker branch exists
if ! git show-ref --verify --quiet "refs/heads/$WORKER_BRANCH"; then
  echo "Error: Worker branch does not exist: $WORKER_BRANCH"
  exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Switch to manager branch
echo "Switching to manager branch: $MANAGER_BRANCH"
git checkout "$MANAGER_BRANCH"

# Show what will be merged
echo ""
echo "Changes to be merged:"
git diff --stat "$MANAGER_BRANCH..$WORKER_BRANCH"
echo ""

# Confirm merge
read -p "Proceed with merge? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Merge cancelled"
  git checkout "$CURRENT_BRANCH"
  exit 0
fi

# Perform merge
echo "Merging $WORKER_BRANCH into $MANAGER_BRANCH..."
MERGE_MSG="Merge worker-${WORKER_ID} implementation for ${TASK_ID}

Selected from multi-agent workflow as the best implementation.
Worker branch: $WORKER_BRANCH

This merge brings in the implementation using approach:
[Approach description - update from evaluation report]

Evaluation highlights:
- [Highlight 1]
- [Highlight 2]
- [Highlight 3]
"

git merge --no-ff "$WORKER_BRANCH" -m "$MERGE_MSG"

echo ""
echo "✅ Merge completed successfully!"
echo ""

# Show merge result
git log -1 --stat

# Clean up worktrees if requested
if [ "$CLEANUP" = true ]; then
  echo ""
  read -p "Clean up worktrees? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleaning up worktrees..."

    # Extract worktree directory from metadata
    WORKTREE_DIR=$(dirname "$(dirname "$METADATA_FILE")")

    # Get all worker worktrees
    WORKER_COUNT=$(grep -oP '"num_workers":\s*\K\d+' "$METADATA_FILE")

    for i in $(seq 1 "$WORKER_COUNT"); do
      WORKER_WORKTREE="$WORKTREE_DIR/worker-${i}"
      BRANCH="worker-${i}/${TASK_ID}"

      if [ -d "$WORKER_WORKTREE" ]; then
        echo "Removing worktree: $WORKER_WORKTREE"
        git worktree remove "$WORKER_WORKTREE" --force 2>/dev/null || true
      fi

      # Keep the selected worker branch, remove others
      if [ "$i" -ne "$WORKER_ID" ]; then
        if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
          echo "Deleting branch: $BRANCH"
          git branch -D "$BRANCH" 2>/dev/null || true
        fi
      fi
    done

    # Archive metadata
    ARCHIVE_DIR="$WORKTREE_DIR/archive"
    mkdir -p "$ARCHIVE_DIR"
    ARCHIVE_FILE="$ARCHIVE_DIR/workflow-${TASK_ID}-$(date +%Y%m%d-%H%M%S).json"
    cp "$METADATA_FILE" "$ARCHIVE_FILE"
    echo "Metadata archived to: $ARCHIVE_FILE"

    rm -f "$METADATA_FILE"

    echo "✅ Cleanup complete!"
  else
    echo "Skipping cleanup. Worktrees remain available for reference."
  fi
fi

echo ""
echo "Next steps:"
echo "1. Review the merged changes"
echo "2. Run tests to verify everything works"
echo "3. Push to remote: git push -u origin $MANAGER_BRANCH"
echo ""
echo "To view the selected worker branch:"
echo "  git log $WORKER_BRANCH"
echo ""
echo "To compare with other workers:"
for i in $(seq 1 "$WORKER_COUNT"); do
  if [ "$i" -ne "$WORKER_ID" ]; then
    echo "  git diff $WORKER_BRANCH worker-${i}/${TASK_ID}"
  fi
done
