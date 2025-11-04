# Multi-Agent Workflow Skill

A sophisticated Claude Code skill for parallel development using multiple AI agents working concurrently in isolated git worktrees.

## Quick Start

### 1. Set up the workflow

```bash
./.claude/skills/multi-agent-workflow/scripts/setup-worktrees.sh \
  --base-branch "claude/multi-agent-$(date +%s)" \
  --num-workers 3 \
  --task-id "my-feature"
```

This creates:
- Manager branch for your current session
- 3 isolated git worktrees (worker-1, worker-2, worker-3)
- Metadata file tracking the workflow

### 2. Launch worker agents

From your current (manager) session, use the Task tool to launch workers:

```
I want to implement [FEATURE] using 3 different approaches:

Approach 1: [Description]
Approach 2: [Description]
Approach 3: [Description]

Please launch 3 worker agents in parallel, each in their respective worktree.
Also launch an observer agent to monitor their progress.
```

The manager (you) will then use Task tool to:
- Launch Worker 1 in `.worktrees/worker-1/`
- Launch Worker 2 in `.worktrees/worker-2/`
- Launch Worker 3 in `.worktrees/worker-3/`
- Launch Observer to monitor all workers

### 3. Observer monitors and reports

The Observer agent will:
- Check worker progress periodically
- Run quality checks on completed implementations
- Generate comprehensive comparison report

### 4. Evaluate and select

Review the Observer's report and select the best implementation:

```bash
./.claude/skills/multi-agent-workflow/scripts/evaluate-results.sh \
  --worktrees ".worktrees/worker-1 .worktrees/worker-2 .worktrees/worker-3" \
  --criteria "correctness,quality,performance,tests" \
  --output "evaluation-report.md"
```

### 5. Merge selected implementation

```bash
./.claude/skills/multi-agent-workflow/scripts/merge-selected.sh \
  --worker-id 2 \
  --manager-branch "claude/multi-agent-1234567890" \
  --metadata ".worktrees/workflow-metadata.json"
```

### 6. Clean up

```bash
./.claude/skills/multi-agent-workflow/scripts/cleanup-worktrees.sh \
  --metadata ".worktrees/workflow-metadata.json"
```

## Directory Structure

```
.claude/skills/multi-agent-workflow/
├── SKILL.md                        # Main skill documentation
├── README.md                       # This file
├── scripts/
│   ├── setup-worktrees.sh         # Initialize workflow
│   ├── launch-worker.sh           # Prepare worker launch
│   ├── evaluate-results.sh        # Compare implementations
│   ├── merge-selected.sh          # Merge winner
│   └── cleanup-worktrees.sh       # Clean up after workflow
└── templates/
    ├── worker-prompt.md           # Worker agent prompt template
    └── observer-prompt.md         # Observer agent prompt template
```

## Workflow Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Manager Session                      │
│           (Current Claude Code session)              │
│                                                      │
│  • Orchestrates workflow                            │
│  • Distributes tasks to workers                     │
│  • Evaluates results                                │
│  • Selects and merges best implementation           │
└───────────┬─────────────────────────────────────────┘
            │
            ├──────────────┬──────────────┬────────────┐
            ▼              ▼              ▼            ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐
    │  Worker 1 │  │  Worker 2 │  │  Worker 3 │  │Observer │
    │           │  │           │  │           │  │  Agent  │
    │Approach A │  │Approach B │  │Approach C │  │         │
    │           │  │           │  │           │  │Monitors │
    │Worktree 1 │  │Worktree 2 │  │Worktree 3 │  │Workers  │
    │Branch W1  │  │Branch W2  │  │Branch W3  │  │         │
    └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬────┘
          │              │              │              │
          └──────────────┴──────────────┴──────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Comparison Report   │
                    │  • Worker 1: ⭐⭐⭐⭐   │
                    │  • Worker 2: ⭐⭐⭐⭐⭐ │
                    │  • Worker 3: ⭐⭐⭐    │
                    │  Winner: Worker 2    │
                    └──────────────────────┘
```

## Example Use Cases

### Use Case 1: Algorithm Selection

**Scenario**: Implement a data processing pipeline

**Setup**:
```bash
./scripts/setup-worktrees.sh \
  --base-branch "claude/pipeline-implementation" \
  --num-workers 3 \
  --task-id "data-pipeline"
```

**Approaches**:
- Worker 1: Stream processing with RxJS
- Worker 2: Batch processing with async/await
- Worker 3: Hybrid stream + batch approach

**Evaluation Criteria**:
- Performance benchmarks
- Memory usage
- Code complexity
- Error handling

### Use Case 2: UI Component Design

**Scenario**: Create a complex form component

**Setup**:
```bash
./scripts/setup-worktrees.sh \
  --base-branch "claude/form-component" \
  --num-workers 3 \
  --task-id "user-form"
```

**Approaches**:
- Worker 1: Controlled components with React Hook Form
- Worker 2: Uncontrolled components with refs
- Worker 3: Formik with Yup validation

**Evaluation Criteria**:
- Bundle size
- Accessibility (a11y)
- Developer experience
- Performance

### Use Case 3: Bug Fix Exploration

**Scenario**: Fix a complex race condition

**Setup**:
```bash
./scripts/setup-worktrees.sh \
  --base-branch "claude/race-condition-fix" \
  --num-workers 2 \
  --task-id "fix-race-condition"
```

**Approaches**:
- Worker 1: Add mutex locks
- Worker 2: Refactor to eliminate shared state

**Evaluation Criteria**:
- Correctness
- Performance impact
- Code simplicity
- Maintainability

## Scripts Reference

### setup-worktrees.sh

Creates git worktrees and initializes the multi-agent workflow.

**Options**:
- `--base-branch NAME` - Manager branch name (required)
- `--num-workers N` - Number of workers (default: 3)
- `--task-id ID` - Task identifier (required)
- `--worktree-dir DIR` - Worktree directory (default: .worktrees)

**Example**:
```bash
./scripts/setup-worktrees.sh \
  --base-branch "claude/my-feature-$(date +%s)" \
  --num-workers 3 \
  --task-id "implement-feature-x"
```

### launch-worker.sh

Prepares worker agent launch information.

**Options**:
- `--worktree PATH` - Path to worker worktree (required)
- `--task DESCRIPTION` - Task description (required)
- `--approach STRATEGY` - Implementation approach (required)
- `--worker-id ID` - Worker identifier (required)

**Example**:
```bash
./scripts/launch-worker.sh \
  --worktree ".worktrees/worker-1" \
  --task "Implement user authentication" \
  --approach "Use JWT with Redis session storage" \
  --worker-id 1
```

### evaluate-results.sh

Evaluates and compares worker implementations.

**Options**:
- `--worktrees PATHS` - Space-separated worktree paths (required)
- `--criteria METRICS` - Comma-separated criteria (default: correctness,quality,performance,tests)
- `--output FILE` - Output report file (default: evaluation-report.md)

**Example**:
```bash
./scripts/evaluate-results.sh \
  --worktrees ".worktrees/worker-1 .worktrees/worker-2 .worktrees/worker-3" \
  --criteria "correctness,performance,maintainability" \
  --output "my-evaluation.md"
```

### merge-selected.sh

Merges the selected worker implementation into the manager branch.

**Options**:
- `--worker-id ID` - Worker ID to merge (required)
- `--manager-branch NAME` - Manager branch name (required)
- `--metadata FILE` - Workflow metadata file (required)
- `--no-cleanup` - Don't clean up worktrees after merge

**Example**:
```bash
./scripts/merge-selected.sh \
  --worker-id 2 \
  --manager-branch "claude/my-feature-1234567890" \
  --metadata ".worktrees/workflow-metadata.json"
```

### cleanup-worktrees.sh

Cleans up worktrees and branches after workflow completion.

**Options**:
- `--metadata FILE` - Workflow metadata file (required)
- `--force` - Don't ask for confirmation
- `--no-archive` - Don't archive metadata

**Example**:
```bash
./scripts/cleanup-worktrees.sh \
  --metadata ".worktrees/workflow-metadata.json"
```

## Best Practices

### Task Design
1. **Clear Scope**: Define exact boundaries for implementations
2. **Distinct Approaches**: Ensure each worker uses a meaningfully different strategy
3. **Measurable Criteria**: Set objective evaluation metrics
4. **Realistic Size**: Size tasks for 30min-2hr completion per worker

### Worker Management
1. **Isolation**: Workers operate in separate worktrees
2. **Clear Instructions**: Provide specific implementation guidance
3. **Resource Limits**: Consider computational resources
4. **Progress Updates**: Monitor via status files

### Observer Configuration
1. **Monitoring Frequency**: Balance responsiveness and overhead
2. **Quality Gates**: Define automated checks (tests, linting)
3. **Reporting Format**: Structure for easy comparison
4. **Early Detection**: Flag critical failures early

### Evaluation Process
1. **Objective Metrics**: Prioritize quantifiable measurements
2. **Code Review**: Manually review final candidates
3. **Testing**: Run comprehensive test suites
4. **Documentation**: Require approach documentation
5. **Hybrid Solutions**: Consider combining strengths

## Troubleshooting

### Workers Can't Access Worktree

**Problem**: Worker agent can't change to worktree directory

**Solution**:
- Verify worktree was created: `git worktree list`
- Check permissions: `ls -la .worktrees/`
- Use absolute paths when launching workers

### Observer Can't Find Status Files

**Problem**: Observer reports missing status files

**Solution**:
- Check workers created `.worker-status.json`
- Verify observer is looking in correct worktree paths
- Ensure workers have write permissions

### Merge Conflicts

**Problem**: Merge conflicts when merging worker implementation

**Solution**:
- Review conflicts carefully
- Consider if workers modified unexpected files
- May need to manually resolve and commit
- Might indicate task scope was too broad

### Evaluation Unclear

**Problem**: No clear winner among implementations

**Solution**:
- Refine evaluation criteria
- Run additional specific comparisons
- Consider hybrid approach
- Consult with user on priorities

## Tips

- Start with 2-3 workers for first workflow
- Document criteria before launching workers
- Use observer for early issue detection
- Archive all implementations, not just winner
- Consider time budget for workers
- Test evaluation criteria on sample code first

## Integration

This skill works well with:
- **parallel-explore**: Use to identify implementation approaches first
- **code-review**: Apply to worker implementations before selection
- **testing**: Ensure comprehensive test coverage in all workers

## License

Part of Claude Code skills library.
