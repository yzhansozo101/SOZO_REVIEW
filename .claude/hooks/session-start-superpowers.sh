#!/usr/bin/env bash
# SessionStart hook: inject the using-superpowers SKILL.md content as additionalContext
# so the agent uses superpowers skills from the very first turn.
#
# Adapted from obra/superpowers' session-start hook for project-level install.

set -euo pipefail

# Resolve project root from this script's location (script lives in .claude/hooks/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SKILL_FILE="${PROJECT_ROOT}/.claude/skills/using-superpowers/SKILL.md"

if [ ! -f "${SKILL_FILE}" ]; then
  # No skill file → output empty additionalContext (graceful no-op)
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":""}}'
  exit 0
fi

# Read SKILL.md and emit JSON via jq for safe escaping (handles quotes, newlines, etc.)
jq -n --rawfile content "${SKILL_FILE}" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $content
  }
}'
