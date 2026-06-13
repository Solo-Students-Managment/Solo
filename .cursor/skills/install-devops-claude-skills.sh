#!/usr/bin/env bash
# Install skills from https://github.com/ahmedasmar/devops-claude-skills into this project's .cursor/skills/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
VENDOR="$ROOT/.vendor/devops-claude-skills"
REPO="https://github.com/ahmedasmar/devops-claude-skills.git"

SKILLS=(
  iac-terraform
  k8s-troubleshooter
  aws-cost-optimization
  ci-cd
  gitops-workflows
  monitoring-observability
)

mkdir -p "$ROOT/.vendor"
if [ -d "$VENDOR/.git" ]; then
  git -C "$VENDOR" pull --ff-only
else
  git clone --depth 1 "$REPO" "$VENDOR"
fi

for skill in "${SKILLS[@]}"; do
  if [ -f "$VENDOR/$skill/skills/SKILL.md" ]; then
    ln -sfn ".vendor/devops-claude-skills/$skill/skills" "$ROOT/$skill"
    echo "linked: $skill"
  else
    echo "skip (missing SKILL.md): $skill" >&2
  fi
done

echo "Done. ${#SKILLS[@]} DevOps skills in $ROOT"
