# Multi-Agent Workflow - Complete Example

This document provides a complete walkthrough of using the multi-agent workflow skill.

## Scenario

You need to implement a data validation system for user input. You want to explore different approaches to find the best implementation.

## Step-by-Step Walkthrough

### Step 1: Initialize the Workflow

From your manager session (current Claude Code session):

```bash
./.claude/skills/multi-agent-workflow/scripts/setup-worktrees.sh \
  --base-branch "claude/validation-system-$(date +%s)" \
  --num-workers 3 \
  --task-id "user-input-validation"
```

**Output**:
```
Setting up multi-agent workflow...
Base branch: claude/validation-system-1699123456
Task ID: user-input-validation
Number of workers: 3
Worktree directory: /home/user/project/.worktrees

Creating worker 1...
  Branch: worker-1/user-input-validation
  Worktree: /home/user/project/.worktrees/worker-1

Creating worker 2...
  Branch: worker-2/user-input-validation
  Worktree: /home/user/project/.worktrees/worker-2

Creating worker 3...
  Branch: worker-3/user-input-validation
  Worktree: /home/user/project/.worktrees/worker-3

✅ Multi-agent workflow setup complete!
```

### Step 2: Launch Worker and Observer Agents

Now you'll launch worker agents in parallel using the Task tool. Here's what you'd say to the manager session:

**User Input**:
```
I want to implement a user input validation system using 3 different approaches:

Approach 1 (Worker 1): Schema-based validation using Zod
- Define schemas for each input type
- Use Zod's type inference
- Focus on developer experience and type safety

Approach 2 (Worker 2): Functional validators with composability
- Create small, composable validator functions
- Use function composition for complex rules
- Emphasize flexibility and testability

Approach 3 (Worker 3): Class-based validators with decorator pattern
- Use TypeScript decorators for validation rules
- Object-oriented approach with inheritance
- Focus on reusability and extensibility

Please launch 3 worker agents in parallel, each implementing their assigned approach.
Also launch an observer agent to monitor progress.

Evaluation criteria:
- Type safety and IDE support
- Code maintainability
- Performance
- Test coverage
- Ease of use for developers
```

**Manager Response**:
The manager will then use the Task tool to launch workers:

```
Task 1 (Worker 1):
Description: "Implement validation using Zod"
Prompt: "You are Worker 1. Implement user input validation using Zod schema-based approach.
Working directory: /home/user/project/.worktrees/worker-1
Branch: worker-1/user-input-validation
Read instructions: /home/user/project/.worktrees/worker-1/.worker-instructions.md"

Task 2 (Worker 2):
Description: "Implement validation using composable functions"
Prompt: "You are Worker 2. Implement user input validation using functional composable validators.
Working directory: /home/user/project/.worktrees/worker-2
Branch: worker-2/user-input-validation
Read instructions: /home/user/project/.worktrees/worker-2/.worker-instructions.md"

Task 3 (Worker 3):
Description: "Implement validation using decorators"
Prompt: "You are Worker 3. Implement user input validation using class-based decorators.
Working directory: /home/user/project/.worktrees/worker-3
Branch: worker-3/user-input-validation
Read instructions: /home/user/project/.worktrees/worker-3/.worker-instructions.md"

Task 4 (Observer):
Description: "Monitor workers and evaluate results"
Prompt: "You are the Observer. Monitor 3 workers implementing validation systems.
Metadata: /home/user/project/.worktrees/workflow-metadata.json
Workers: worker-1, worker-2, worker-3
Track progress, run quality checks, and generate comparison report."
```

### Step 3: Workers Execute in Parallel

Each worker independently:

**Worker 1 (Zod approach)**:
1. Creates `src/validation/schemas.ts`
2. Defines Zod schemas for user input
3. Implements validation functions
4. Writes tests in `src/validation/schemas.test.ts`
5. Updates `.worker-status.json`
6. Commits work

**Worker 2 (Functional approach)**:
1. Creates `src/validation/validators.ts`
2. Implements composable validator functions
3. Creates combinator functions (and, or, pipe)
4. Writes tests in `src/validation/validators.test.ts`
5. Updates `.worker-status.json`
6. Commits work

**Worker 3 (Decorator approach)**:
1. Creates `src/validation/decorators.ts`
2. Implements validation decorators
3. Creates validator classes
4. Writes tests in `src/validation/decorators.test.ts`
5. Updates `.worker-status.json`
6. Commits work

### Step 4: Observer Monitors and Reports

The Observer agent:

1. **Monitors Status** (every 2 minutes):
   ```bash
   # Check worker 1
   cat .worktrees/worker-1/.worker-status.json
   cd .worktrees/worker-1 && git log --oneline -5

   # Check worker 2
   cat .worktrees/worker-2/.worker-status.json
   cd .worktrees/worker-2 && git log --oneline -5

   # Check worker 3
   cat .worktrees/worker-3/.worker-status.json
   cd .worktrees/worker-3 && git log --oneline -5
   ```

2. **Runs Quality Checks** (when workers complete):
   ```bash
   # For each worker
   cd .worktrees/worker-1
   npm test
   npm run lint
   npm run build
   ```

3. **Generates Comparison Report**:

```markdown
# Multi-Agent Workflow - Observer Report

## Executive Summary

All 3 workers successfully implemented user input validation systems.
Recommendation: **Worker 1 (Zod approach)** - Best balance of type safety,
developer experience, and maintainability.

## Worker Implementations

### Worker 1: Schema-based (Zod)
**Status**: ✅ Completed

**Metrics**:
- Lines Changed: +245 / -12
- Test Files: 3
- Test Coverage: 94%
- Commits: 8

**Strengths**:
- Excellent TypeScript integration
- Automatic type inference
- Great error messages
- Comprehensive documentation

**Weaknesses**:
- Adds bundle size (Zod dependency)
- Learning curve for team

**Test Results**: ✅ 42/42 tests pass
**Build Status**: ✅ Success

---

### Worker 2: Functional Composable
**Status**: ✅ Completed

**Metrics**:
- Lines Changed: +198 / -8
- Test Files: 4
- Test Coverage: 97%
- Commits: 12

**Strengths**:
- Very flexible and composable
- No external dependencies
- Excellent test coverage
- Small bundle size

**Weaknesses**:
- Less TypeScript support
- Manual type definitions needed
- Steeper learning curve

**Test Results**: ✅ 58/58 tests pass
**Build Status**: ✅ Success

---

### Worker 3: Decorator Pattern
**Status**: ✅ Completed

**Metrics**:
- Lines Changed: +312 / -15
- Test Files: 2
- Test Coverage: 78%
- Commits: 6

**Strengths**:
- Clean, declarative syntax
- Object-oriented design
- Good for complex validation chains

**Weaknesses**:
- Requires experimental decorators
- More boilerplate
- Lower test coverage
- More complex setup

**Test Results**: ⚠️ 35/38 tests pass (3 failing edge cases)
**Build Status**: ✅ Success (with warnings)

## Comparative Analysis

| Criterion | Worker 1 (Zod) | Worker 2 (Functional) | Worker 3 (Decorator) | Winner |
|-----------|----------------|----------------------|---------------------|--------|
| Type Safety | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | W1 |
| Bundle Size | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | W2 |
| Developer DX | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | W1 |
| Maintainability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | W1 |
| Test Coverage | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | W2 |
| Flexibility | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | W2 |

## Recommendation

### Selected Implementation
**Winner**: Worker 1 - Schema-based (Zod)

### Rationale
While Worker 2's functional approach had excellent test coverage and no
dependencies, Worker 1's Zod implementation provides the best developer
experience with superior TypeScript integration, automatic type inference,
and excellent error messages. The bundle size increase is acceptable given
the significant DX benefits.

Worker 3's decorator approach is interesting but the experimental decorator
requirement and lower test coverage make it less suitable for production.
```

### Step 5: Manager Reviews Report

The manager receives the Observer's report and can optionally run additional evaluation:

```bash
./.claude/skills/multi-agent-workflow/scripts/evaluate-results.sh \
  --worktrees ".worktrees/worker-1 .worktrees/worker-2 .worktrees/worker-3" \
  --criteria "type-safety,performance,maintainability,bundle-size" \
  --output "detailed-evaluation.md"
```

### Step 6: Select and Merge Winner

Based on the Observer's recommendation, merge Worker 1's implementation:

```bash
./.claude/skills/multi-agent-workflow/scripts/merge-selected.sh \
  --worker-id 1 \
  --manager-branch "claude/validation-system-1699123456" \
  --metadata ".worktrees/workflow-metadata.json"
```

**Interactive Prompts**:
```
Changes to be merged:
 src/validation/schemas.ts      | 145 +++++++++++++++++++
 src/validation/schemas.test.ts |  87 +++++++++++
 src/validation/index.ts        |  13 ++
 package.json                   |   1 +
 4 files changed, 246 insertions(+)

Proceed with merge? (y/N): y

Merging worker-1/user-input-validation into claude/validation-system-1699123456...
✅ Merge completed successfully!

Clean up worktrees? (y/N): y
Cleaning up worktrees...
  Removing: .worktrees/worker-1
  Removing: .worktrees/worker-2
  Removing: .worktrees/worker-3
  Deleting branch: worker-2/user-input-validation
  Deleting branch: worker-3/user-input-validation

Metadata archived to: .worktrees/archive/workflow-user-input-validation-20241104-092030.json

✅ Cleanup complete!
```

### Step 7: Final Steps

1. **Review Merged Changes**:
   ```bash
   git log --oneline -10
   git show HEAD
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Push to Remote**:
   ```bash
   git push -u origin claude/validation-system-1699123456
   ```

4. **Create Pull Request** (if applicable):
   ```bash
   gh pr create --title "Implement user input validation system (Zod)" \
     --body "Selected from multi-agent workflow after comparing 3 approaches."
   ```

## Results

- ✅ Explored 3 different validation approaches in parallel
- ✅ Each approach fully implemented and tested independently
- ✅ Objective comparison based on multiple criteria
- ✅ Best implementation selected and merged
- ✅ Alternative approaches archived for future reference
- ✅ Total time: ~2 hours (vs ~6 hours sequentially)

## Key Takeaways

1. **Parallelization**: 3 approaches in 2 hours instead of 6+ hours sequentially
2. **Objective Comparison**: Side-by-side metrics instead of theoretical discussion
3. **Risk Reduction**: Multiple working solutions, fallback options
4. **Learning**: Documented trade-offs of each approach
5. **Best of Both Worlds**: Could combine strengths from multiple implementations

## Alternative Outcomes

### If Worker 2 Had Been Selected

If the functional approach (Worker 2) was chosen instead:
- No external dependencies
- Smaller bundle size
- More custom code to maintain
- Would need to add TypeScript types manually

### Hybrid Approach

Could also take best ideas from multiple workers:
- Use Zod's type system (Worker 1)
- Adopt composability pattern (Worker 2)
- Apply decorator syntax for common cases (Worker 3)

This is the power of multi-agent workflow: informed decisions based on actual working code!
