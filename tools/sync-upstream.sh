#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CUSTOM_BRANCH="${CUSTOM_BRANCH:-selfhost/dev}"
ORIGIN_REMOTE="${ORIGIN_REMOTE:-origin}"
UPSTREAM_REMOTE="${UPSTREAM_REMOTE:-upstream}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-dev}"
PUSH_AFTER_REBASE="${PUSH_AFTER_REBASE:-0}"
ALLOW_DIRTY="${ALLOW_DIRTY:-0}"

if [[ "$ALLOW_DIRTY" != "1" ]]; then
  git diff --quiet || {
    echo "Refusing to sync with unstaged changes in the working tree."
    exit 1
  }

  git diff --cached --quiet || {
    echo "Refusing to sync with staged but uncommitted changes."
    exit 1
  }
fi

if ! git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1; then
  git remote add "$UPSTREAM_REMOTE" https://github.com/gethomepage/homepage.git
fi

git fetch --prune "$UPSTREAM_REMOTE" "$UPSTREAM_BRANCH"
if git ls-remote --exit-code "$ORIGIN_REMOTE" "refs/heads/$CUSTOM_BRANCH" >/dev/null 2>&1; then
  git fetch --prune "$ORIGIN_REMOTE" "$CUSTOM_BRANCH"
  git checkout -B "$CUSTOM_BRANCH" "$ORIGIN_REMOTE/$CUSTOM_BRANCH"
else
  echo "Remote branch $ORIGIN_REMOTE/$CUSTOM_BRANCH does not exist yet; using the local branch."
  git checkout "$CUSTOM_BRANCH"
fi

if git merge-base --is-ancestor "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH" HEAD; then
  echo "$CUSTOM_BRANCH is already up to date with $UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
else
  trap 'git rebase --abort >/dev/null 2>&1 || true' ERR
  git rebase "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
  trap - ERR
  echo "Rebased $CUSTOM_BRANCH onto $UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
fi

if [[ "$PUSH_AFTER_REBASE" == "1" ]]; then
  git push --force-with-lease "$ORIGIN_REMOTE" "HEAD:$CUSTOM_BRANCH"
fi
