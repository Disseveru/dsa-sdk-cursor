#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

"$ROOT/scripts/cursor-build.sh"

DIST="$ROOT/frontend/dist"
if [[ ! -d "$DIST" ]] || [[ -z "$(ls -A "$DIST" 2>/dev/null)" ]]; then
  echo "Build output missing at frontend/dist" >&2
  exit 1
fi

echo "==> Deploying to gh-pages branch"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "master" ]]; then
  echo "Refusing to deploy from $CURRENT_BRANCH; merge to master first." >&2
  exit 1
fi

WORKTREE="$ROOT/.gh-pages-deploy"
cleanup() {
  git worktree remove --force "$WORKTREE" 2>/dev/null || rm -rf "$WORKTREE"
  git worktree prune 2>/dev/null || true
}
trap cleanup EXIT

git worktree prune 2>/dev/null || true
rm -rf "$WORKTREE"
git worktree add --detach "$WORKTREE" HEAD

pushd "$WORKTREE" >/dev/null
git checkout --orphan gh-pages-deploy 2>/dev/null || git checkout --orphan gh-pages-deploy
git rm -rf . 2>/dev/null || true
cp -a "$DIST"/. .
touch .nojekyll
git add -A
git -c user.name="Cursor Agent" -c user.email="agent@cursor.com" commit -m "Deploy GitHub Pages from Cursor"
git push -f origin HEAD:gh-pages
popd >/dev/null

echo "==> Live at https://disseveru.github.io/dsa-sdk-cursor/"
