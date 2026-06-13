#!/usr/bin/env bash
# Install skills from https://github.com/boraoztunc/skills into this project's .cursor/skills/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
VENDOR="$ROOT/.vendor/boraoztunc-skills"
REPO="https://github.com/boraoztunc/skills.git"

mkdir -p "$ROOT/.vendor"
if [ -d "$VENDOR/.git" ]; then
  git -C "$VENDOR" pull --ff-only
else
  git clone --depth 1 "$REPO" "$VENDOR"
fi

for dir in "$VENDOR"/*/; do
  name="$(basename "$dir")"
  if [ -f "$dir/SKILL.md" ]; then
    ln -sfn ".vendor/boraoztunc-skills/$name" "$ROOT/$name"
    echo "linked: $name"
  fi
done

echo "Done. $(ls -1 "$ROOT" | grep -v '^\.vendor$' | wc -l | tr -d ' ') skills in $ROOT"
