#!/bin/bash
# Clean up multi-agent workflow worktrees and branches

set -e

# Default values
METADATA_FILE=""
FORCE=false
ARCHIVE=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --metadata)
      METADATA_FILE="$2"
      shift 2
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --no-archive)
      ARCHIVE=false
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --metadata FILE    Workflow metadata file (required)"
      echo "  --force            Don't ask for confirmation"
      echo "  --no-archive       Don't archive metadata before cleanup"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate required parameters
if [ -z "$METADATA_FILE" ]; then
  echo "Error: --metadata is required"
  exit 1
fi

# Check if metadata file exists
if [ ! -f "$METADATA_FILE" ]; then
  echo "Error: Metadata file not found: $METADATA_FILE"
  exit 1
fi

# Extract workflow information
TASK_ID=$(grep -oP '"task_id":\s*"\K[^"]+' "$METADATA_FILE")
WORKER_COUNT=$(grep -oP '"num_workers":\s*\K\d+' "$METADATA_FILE")
WORKTREE_DIR=$(dirname "$METADATA_FILE")

echo "Multi-Agent Workflow Cleanup"
echo "============================"
echo "Task ID: $TASK_ID"
echo "Workers: $WORKER_COUNT"
echo "Worktree directory: $WORKTREE_DIR"
echo ""

# List what will be cleaned up
echo "The following will be removed:"
echo ""
echo "Worktrees:"
for i in $(seq 1 "$WORKER_COUNT"); do
  WORKER_WORKTREE="$WORKTREE_DIR/worker-${i}"
  if [ -d "$WORKER_WORKTREE" ]; then
    echo "  - $WORKER_WORKTREE"
  fi
done

echo ""
echo "Branches:"
for i in $(seq 1 "$WORKER_COUNT"); do
  BRANCH="worker-${i}/${TASK_ID}"
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    echo "  - $BRANCH"
  fi
done

echo ""
echo "Metadata:"
echo "  - $METADATA_FILE"

# Confirm cleanup
if [ "$FORCE" = false ]; then
  echo ""
  read -p "Proceed with cleanup? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled"
    exit 0
  fi
fi

# Archive metadata if requested
if [ "$ARCHIVE" = true ]; then
  ARCHIVE_DIR="$WORKTREE_DIR/archive"
  mkdir -p "$ARCHIVE_DIR"
  ARCHIVE_FILE="$ARCHIVE_DIR/workflow-${TASK_ID}-$(date +%Y%m%d-%H%M%S).json"
  cp "$METADATA_FILE" "$ARCHIVE_FILE"
  echo "✅ Metadata archived to: $ARCHIVE_FILE"
fi

# Remove worktrees
echo ""
echo "Removing worktrees..."
for i in $(seq 1 "$WORKER_COUNT"); do
  WORKER_WORKTREE="$WORKTREE_DIR/worker-${i}"
  if [ -d "$WORKER_WORKTREE" ]; then
    echo "  Removing: $WORKER_WORKTREE"
    git worktree remove "$WORKER_WORKTREE" --force 2>/dev/null || true
  fi
done

# Remove branches
echo ""
echo "Removing branches..."
for i in $(seq 1 "$WORKER_COUNT"); do
  BRANCH="worker-${i}/${TASK_ID}"
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    echo "  Deleting: $BRANCH"
    git branch -D "$BRANCH" 2>/dev/null || true
  fi
done

# Remove metadata file
rm -f "$METADATA_FILE"

# Remove worktree directory if empty
if [ -d "$WORKTREE_DIR" ] && [ -z "$(ls -A "$WORKTREE_DIR" 2>/dev/null | grep -v '^archive$')" ]; then
  echo ""
  echo "Worktree directory is empty (excluding archive)"
  read -p "Remove worktree directory? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Keep archive directory
    if [ -d "$WORKTREE_DIR/archive" ]; then
      mv "$WORKTREE_DIR/archive" "$(dirname "$WORKTREE_DIR")/worktree-archive"
      rm -rf "$WORKTREE_DIR"
      mv "$(dirname "$WORKTREE_DIR")/worktree-archive" "$WORKTREE_DIR/archive"
    else
      rm -rf "$WORKTREE_DIR"
    fi
    echo "✅ Worktree directory removed"
  fi
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Note: If you merged a worker implementation, that branch may still exist."
echo "You can manually delete it with:"
echo "  git branch -D worker-X/${TASK_ID}"
