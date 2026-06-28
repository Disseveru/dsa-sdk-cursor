# DeFi Automation Agent

Autonomous keeper that scans Ethereum mainnet for flash-loan arbitrage and liquidation opportunities, then casts DSA spells via the Instadapp SDK.

## Quick Start

```bash
# From repo root — install SDK + agent deps
npm install
cd agent && npm install && cd ..

# Configure environment
cp agent/.env.example agent/.env
# Edit agent/.env with your RPC URL and wallet address

# Scan once (dry run — no transactions)
npm run agent:dry

# Run continuous keeper (still dry run by default)
npm run agent

# Live execution (requires PRIVATE_KEY and DSA_ID)
DRY_RUN=false npm run agent
```

## What It Does

### Flash Loan Arbitrage
Scans Oasis DEX quotes for DAI peg arbitrage opportunities using the recipe from `guides/MakerDao.md`:

1. **Instapool** — `flashBorrow` DAI
2. **Oasis** — swap DAI → USDC
3. **Maker** — open USDC vault, deposit, borrow DAI
4. **Instapool** — `flashPayback` DAI

### Liquidations
Monitors unhealthy positions across:

- **Maker** — vaults above liquidation ratio; casts `withdrawLiquidated` when collateral is available
- **Compound** — positions with health factor < 1 (monitoring; flash liquidation requires live quotes)

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ETH_NODE_URL` | — | Ethereum mainnet RPC endpoint |
| `PUBLIC_ADDRESS` | — | Wallet that owns the DSA |
| `PRIVATE_KEY` | — | For autonomous casting (omit for scan-only) |
| `DSA_ID` | auto | DSA account number |
| `SCAN_INTERVAL_MS` | 30000 | Scan frequency |
| `MIN_PROFIT_USD` | 5 | Minimum arbitrage profit to execute |
| `SLIPPAGE_PERCENT` | 2 | Oasis swap slippage tolerance |
| `MIN_BORROW_DAI` | 20 | Minimum flash loan size |
| `DRY_RUN` | true | When true, estimates gas but does not broadcast |
| `ENABLE_ARBITRAGE` | true | Toggle arbitrage scanning |
| `ENABLE_LIQUIDATIONS` | true | Toggle liquidation scanning |

## Architecture

```
agent/
  index.js          # Main keeper loop
  config.js         # Environment config
  spells.js         # Spell builders (shared logic)
  executor.js       # cast() wrapper
  scanner/
    arbitrage.js    # DAI peg arbitrage scanner
    liquidations.js # Maker + Compound health checks
```

The browser frontend (`frontend/`) uses the same spell builders and scanners via `dsa-connect`, with the user signing transactions through their wallet.

## Risk Disclaimer

Flash loan arbitrage and liquidations carry significant risk including slippage, front-running, failed transactions, and smart contract bugs. Always start with `DRY_RUN=true` and only use funds you can afford to lose.
