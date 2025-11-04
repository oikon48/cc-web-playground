#!/bin/bash
# Prepare worker agent launch information

set -e

# Default values
WORKTREE=""
TASK=""
APPROACH=""
WORKER_ID=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --worktree)
      WORKTREE="$2"
      shift 2
      ;;
    --task)
      TASK="$2"
      shift 2
      ;;
    --approach)
      APPROACH="$2"
      shift 2
      ;;
    --worker-id)
      WORKER_ID="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --worktree PATH         Path to worker worktree (required)"
      echo "  --task DESCRIPTION      Task description (required)"
      echo "  --approach STRATEGY     Implementation approach (required)"
      echo "  --worker-id ID          Worker identifier (required)"
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
if [ -z "$WORKTREE" ]; then
  echo "Error: --worktree is required"
  exit 1
fi

if [ -z "$TASK" ]; then
  echo "Error: --task is required"
  exit 1
fi

if [ -z "$APPROACH" ]; then
  echo "Error: --approach is required"
  exit 1
fi

if [ -z "$WORKER_ID" ]; then
  echo "Error: --worker-id is required"
  exit 1
fi

# Get absolute path
WORKTREE_ABS=$(realpath "$WORKTREE")

# Check if worktree exists
if [ ! -d "$WORKTREE_ABS" ]; then
  echo "Error: Worktree directory does not exist: $WORKTREE_ABS"
  exit 1
fi

# Get worker branch name
cd "$WORKTREE_ABS"
WORKER_BRANCH=$(git branch --show-current)

echo "Preparing worker agent launch..."
echo "Worker ID: $WORKER_ID"
echo "Worktree: $WORKTREE_ABS"
echo "Branch: $WORKER_BRANCH"
echo "Task: $TASK"
echo "Approach: $APPROACH"
echo ""

# Create worker instruction file
INSTRUCTION_FILE="$WORKTREE_ABS/.worker-instructions.md"
cat > "$INSTRUCTION_FILE" << EOF
# Worker Agent Instructions

## Worker Information
- **Worker ID**: $WORKER_ID
- **Branch**: $WORKER_BRANCH
- **Worktree**: $WORKTREE_ABS

## Task
$TASK

## Implementation Approach
$APPROACH

## Instructions

1. **Working Directory**: You are working in an isolated git worktree at \`$WORKTREE_ABS\`
2. **Branch**: You are on branch \`$WORKER_BRANCH\`
3. **Task**: Implement the task described above using the specified approach
4. **Testing**: Write comprehensive tests for your implementation
5. **Documentation**: Document your approach and key decisions
6. **Commit**: Commit your changes with clear, descriptive commit messages

## Deliverables

Your implementation should include:
- [ ] Core implementation following the specified approach
- [ ] Unit tests with good coverage
- [ ] Integration tests if applicable
- [ ] Documentation of design decisions
- [ ] Performance considerations (if applicable)
- [ ] Edge case handling
- [ ] Error handling

## Evaluation Criteria

Your implementation will be evaluated on:
- **Correctness**: Does it solve the problem correctly?
- **Code Quality**: Is the code clean, readable, and maintainable?
- **Performance**: Is it efficient?
- **Test Coverage**: Are tests comprehensive?
- **Documentation**: Is the approach well-documented?
- **Robustness**: Does it handle edge cases and errors?

## Important Notes

- You are working in an isolated worktree, so your changes won't affect other workers
- Focus on your assigned approach - don't try to implement multiple approaches
- Commit early and often
- If you encounter blockers, document them clearly
- Your final commit should be production-ready

## Ready to Start?

Change directory to your worktree:
\`\`\`bash
cd $WORKTREE_ABS
\`\`\`

Then begin implementing the task using the specified approach.

---
Generated at: $(date -Iseconds)
EOF

# Create worker status file
STATUS_FILE="$WORKTREE_ABS/.worker-status.json"
cat > "$STATUS_FILE" << EOF
{
  "worker_id": "$WORKER_ID",
  "branch": "$WORKER_BRANCH",
  "worktree": "$WORKTREE_ABS",
  "status": "initialized",
  "task": "$TASK",
  "approach": "$APPROACH",
  "started_at": "$(date -Iseconds)",
  "last_updated": "$(date -Iseconds)"
}
EOF

echo "✅ Worker preparation complete!"
echo ""
echo "Instruction file: $INSTRUCTION_FILE"
echo "Status file: $STATUS_FILE"
echo ""
echo "To launch this worker agent, use the Task tool with subagent_type=general-purpose:"
echo ""
echo "Task prompt:"
echo "---"
cat << PROMPT
You are Worker Agent $WORKER_ID in a multi-agent parallel development workflow.

Working directory: $WORKTREE_ABS
Branch: $WORKER_BRANCH

Task: $TASK

Approach: $APPROACH

Read the detailed instructions at: $INSTRUCTION_FILE

Then implement the task following the specified approach.
Commit your work when complete and update the status file at: $STATUS_FILE
PROMPT
echo "---"
