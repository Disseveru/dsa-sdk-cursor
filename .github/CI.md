# CI / CD in Cursor

GitHub Actions are **disabled** for build and deploy on this repo (account billing limits). All workflow runs happen in **Cursor Cloud Agents**.

## Commands

| Task | Command |
|------|---------|
| Build frontend | `./scripts/cursor-build.sh` |
| Deploy GitHub Pages | `./scripts/cursor-deploy-pages.sh` |
| Dev server | `cd frontend && npm run dev` |

See [AGENTS.md](../AGENTS.md) for full agent instructions.

## Manual GitHub Actions

The deploy workflow is manual-only (`workflow_dispatch`) as a fallback. Prefer Cursor scripts above.
