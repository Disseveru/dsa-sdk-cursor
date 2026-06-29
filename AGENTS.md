# Agent instructions

## Cursor Cloud specific instructions

Build, test, and deploy run in **Cursor Cloud Agents** — not GitHub Actions (billing may block Actions on this repo).

### Build (required before merge)

```bash
./scripts/cursor-build.sh
```

### Deploy GitHub Pages (after merge to `master`)

```bash
./scripts/cursor-deploy-pages.sh
```

### Frontend dev server

```bash
cd frontend && npm run dev
```

### Agent keeper (optional, server-side)

```bash
cp agent/.env.example agent/.env   # set ETH_NODE_URL, PUBLIC_ADDRESS
npm run agent:dry
```

### Secrets

Set in Cursor Cloud Agents → Secrets (not committed):

- `VITE_WALLETCONNECT_PROJECT_ID` — WalletConnect Cloud project ID for mobile MetaMask

### PR checklist

1. Run `./scripts/cursor-build.sh` and confirm it passes
2. Do not re-enable GitHub Actions push triggers for build/deploy
3. After merging to `master`, run `./scripts/cursor-deploy-pages.sh` to publish the phone app URL
