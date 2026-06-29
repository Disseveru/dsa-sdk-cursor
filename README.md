# DeFi Smart Account SDK + Automation Agent

This repo contains the archived [Instadapp DSA SDK](https://github.com/Instadapp/dsa-connect) plus a **flash-loan automation agent** for arbitrage and liquidations.

## Components

| Path | Description |
|------|-------------|
| `src/` | Legacy DSA SDK (spell casting, protocol resolvers) |
| `agent/` | Node.js keeper — scans and casts spells autonomously |
| `frontend/` | React UI — wallet-connected agent with spell casting |
| `guides/MakerDao.md` | Reference recipe for DAI peg arbitrage |

## Quick Start

### Browser UI

```bash
cd frontend && npm install && npm run dev
```

Connect wallet → create DSA → enable arbitrage or liquidations.

### Node Keeper

```bash
npm install --ignore-scripts
cd agent && npm install
cp agent/.env.example agent/.env   # set ETH_NODE_URL + PUBLIC_ADDRESS
npm run agent:dry                  # scan only
npm run agent                      # continuous keeper
```

See [agent/README.md](agent/README.md) for full configuration.

### Phone app (GitHub Pages)

**https://disseveru.github.io/dsa-sdk-cursor/** — see [START_HERE.md](START_HERE.md).

Build and deploy run in **Cursor Cloud Agents** (not GitHub Actions):

```bash
./scripts/cursor-build.sh
./scripts/cursor-deploy-pages.sh   # after merge to master
```

See [AGENTS.md](AGENTS.md).

## Spell Recipes

- **Arbitrage**: Instapool flash borrow → Oasis swap → Maker vault → flash payback
- **Liquidations**: Maker `withdrawLiquidated`, Compound flash-loan liquidation

> **Note**: The core SDK is archived. The frontend uses `dsa-connect`; the agent uses the local `src/` SDK.

## License

MIT
