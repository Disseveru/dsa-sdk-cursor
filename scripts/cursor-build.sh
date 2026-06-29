#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/frontend"

echo "==> Installing frontend dependencies"
npm ci --legacy-peer-deps

echo "==> Building frontend for GitHub Pages"
GITHUB_PAGES=true npm run build

echo "==> Build complete: frontend/dist"
