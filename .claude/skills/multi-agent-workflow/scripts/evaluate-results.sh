#!/bin/bash
# Evaluate and compare worker implementations

set -e

# Default values
WORKTREES=""
CRITERIA="correctness,quality,performance,tests"
OUTPUT="evaluation-report.md"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --worktrees)
      WORKTREES="$2"
      shift 2
      ;;
    --criteria)
      CRITERIA="$2"
      shift 2
      ;;
    --output)
      OUTPUT="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --worktrees PATHS       Space-separated worktree paths (required)"
      echo "  --criteria METRICS      Comma-separated evaluation criteria"
      echo "                          (default: correctness,quality,performance,tests)"
      echo "  --output FILE           Output report file (default: evaluation-report.md)"
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
if [ -z "$WORKTREES" ]; then
  echo "Error: --worktrees is required"
  exit 1
fi

# Convert criteria to array
IFS=',' read -ra CRITERIA_ARRAY <<< "$CRITERIA"

echo "Evaluating worker implementations..."
echo "Worktrees: $WORKTREES"
echo "Criteria: ${CRITERIA_ARRAY[*]}"
echo "Output: $OUTPUT"
echo ""

# Initialize report
cat > "$OUTPUT" << 'EOF'
# Multi-Agent Workflow - Evaluation Report

## Overview

This report compares implementations from multiple worker agents.

EOF

echo "Generated at: $(date -Iseconds)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Evaluate each worktree
WORKTREE_ARRAY=($WORKTREES)
for i in "${!WORKTREE_ARRAY[@]}"; do
  WORKTREE="${WORKTREE_ARRAY[$i]}"
  WORKER_ID=$((i + 1))

  echo "Evaluating Worker $WORKER_ID: $WORKTREE"

  if [ ! -d "$WORKTREE" ]; then
    echo "⚠️  Warning: Worktree not found: $WORKTREE"
    continue
  fi

  # Get worker status
  STATUS_FILE="$WORKTREE/.worker-status.json"
  if [ -f "$STATUS_FILE" ]; then
    STATUS=$(cat "$STATUS_FILE")
  else
    STATUS="{}"
  fi

  # Get branch info
  cd "$WORKTREE"
  BRANCH=$(git branch --show-current)
  COMMIT_COUNT=$(git rev-list --count HEAD)
  LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%ar)")

  # Count files changed
  FILES_CHANGED=$(git diff --name-only HEAD~$((COMMIT_COUNT - 1)) 2>/dev/null | wc -l || echo "0")

  # Get code statistics
  LINES_ADDED=$(git diff --shortstat HEAD~$((COMMIT_COUNT - 1)) 2>/dev/null | grep -oP '\d+(?= insertion)' || echo "0")
  LINES_DELETED=$(git diff --shortstat HEAD~$((COMMIT_COUNT - 1)) 2>/dev/null | grep -oP '\d+(?= deletion)' || echo "0")

  # Check for tests
  TEST_FILES=$(find . -name "*.test.*" -o -name "*.spec.*" | wc -l)

  # Write to report
  cat >> "$OUTPUT" << SECTION

---

## Worker $WORKER_ID

### Basic Information
- **Worktree**: \`$WORKTREE\`
- **Branch**: \`$BRANCH\`
- **Last Commit**: $LAST_COMMIT

### Statistics
- **Commits**: $COMMIT_COUNT
- **Files Changed**: $FILES_CHANGED
- **Lines Added**: $LINES_ADDED
- **Lines Deleted**: $LINES_DELETED
- **Test Files**: $TEST_FILES

### Worker Status
\`\`\`json
$STATUS
\`\`\`

### Changed Files
\`\`\`
$(git diff --name-status HEAD~$((COMMIT_COUNT - 1)) 2>/dev/null || echo "No changes")
\`\`\`

### Commit History
\`\`\`
$(git log --oneline HEAD~$((COMMIT_COUNT - 1))..HEAD 2>/dev/null || echo "No commits")
\`\`\`

SECTION

  echo "✅ Worker $WORKER_ID evaluated"
  echo ""
done

# Add evaluation criteria section
cat >> "$OUTPUT" << 'EOF'

---

## Evaluation Criteria

Compare the implementations above based on the following criteria:

EOF

for criterion in "${CRITERIA_ARRAY[@]}"; do
  echo "### ${criterion^}" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  echo "**Worker 1**: [Score/Notes]" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  echo "**Worker 2**: [Score/Notes]" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  echo "**Worker 3**: [Score/Notes]" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
  echo "" >> "$OUTPUT"
done

# Add recommendation section
cat >> "$OUTPUT" << 'EOF'

---

## Recommendation

### Selected Implementation
**Winner**: Worker [X]

### Rationale
[Explain why this implementation was selected based on the evaluation criteria]

### Action Items
- [ ] Merge selected implementation into manager branch
- [ ] Document key decisions from selected approach
- [ ] Archive other implementations for reference
- [ ] Clean up worktrees

### Merge Command
```bash
# From manager branch
git merge --no-ff worker-X/[task-id]
```

EOF

cd - > /dev/null

echo "✅ Evaluation complete!"
echo ""
echo "Report saved to: $OUTPUT"
echo ""
echo "Next steps:"
echo "1. Review the evaluation report"
echo "2. Select the best implementation"
echo "3. Merge the selected implementation"
echo "4. Clean up worktrees"
