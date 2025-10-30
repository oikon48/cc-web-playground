#!/usr/bin/env bash
# Stop Hook: Display Claude Code token usage statistics
# This hook runs when a conversation ends to show token usage

set -euo pipefail

# Output to stderr to display as Stop hook feedback (like git-check hook)
{
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Claude Code Token Usage Report"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Run ccusage with statusline mode (compact display)
    if command -v npx &> /dev/null; then
        npx --yes ccusage@latest statusline 2>/dev/null || {
            echo "ℹ️  ccusage statusline failed, showing daily report instead..."
            npx --yes ccusage@latest daily 2>/dev/null || {
                echo "⚠️  ccusage is not available"
            }
        }
    else
        echo "⚠️  npx is not available, cannot run ccusage"
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
} >&2
