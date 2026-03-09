# AGENTS.md

## Cursor Cloud specific instructions

This repo contains two independent npm projects—no workspace manager (Lerna/Turborepo/etc.) is used.

### Project structure

| Path | Description | Dev command | Port |
|---|---|---|---|
| `/workspace` (root) | Archived Instadapp DSA SDK (webpack 4) | `NODE_OPTIONS=--openssl-legacy-provider npm run dev-server` | 8080 |
| `/workspace/frontend` | React + TypeScript + Vite + Tailwind DeFi Automation UI | `npm run dev` | 3000 |

### Key caveats

- **Root SDK requires `NODE_OPTIONS=--openssl-legacy-provider`** for any webpack command (`build`, `build-dev`, `dev-server`) because webpack 4 uses md4 hashing which is unsupported by the OpenSSL version shipped with Node 18+.
- **Root SDK build (`npm run build`) has a pre-existing case-sensitivity bug**: `src/index.js` imports `./resolvers/chainLink.js` but the file is named `chainlink.js` (lowercase `l`). The build emits `dsa.min.js` but exits with error code 2.
- **Frontend lint script (`npm run lint`) will fail** because `eslint` is not listed in `devDependencies`. TypeScript type-checking (`npx tsc --noEmit`) works and should be used instead.
- **No automated test suites exist** in either project; there are no test scripts or testing dependencies.
- **Wallet connection** in the frontend requires an injected Web3 wallet (MetaMask). Without one, buttons are interactive but connection fails silently (no console errors).
- The frontend uses `dsa-connect` (the newer Instadapp SDK from npm), not the root `dsa-sdk` source.
- `.env` files are copied from `.env.example`. The root SDK `.env` expects `ETH_NODE_URL` for Node.js mode. The frontend `.env` has `VITE_REOWN_PROJECT_ID` (optional, for WalletConnect).
