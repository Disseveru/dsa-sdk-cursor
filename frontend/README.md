# DeFi Automation Frontend

A clean, user-friendly interface for non-coding users to access DeFi automation—arbitrage via flash loans and liquidation rewards—powered by an AI agent and the Instadapp DSA (DeFi Smart Account) SDK.

## Features

- **Connect Wallet** — Simple one-click connection for MetaMask and other injected wallets
- **Smart Account (DSA)** — Creates and manages Instadapp DSAs for spell execution
- **Arbitrage** — AI agent monitors for profitable price differences and executes via flash loans
- **Liquidations** — AI agent liquidates underwater positions and collects rewards
- **Autonomous Operation** — Toggle the AI agent on/off; it handles everything when enabled

## Prerequisites

- Node.js 18+
- A Web3 wallet (MetaMask, etc.) with ETH for gas

## Getting Started

```bash
# Install dependencies
cd frontend && npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your wallet.

## Environment

Optional: Create `.env` with:
- `VITE_WALLETCONNECT_PROJECT_ID` — For WalletConnect (future)

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind
- **Wallet**: wagmi + viem (Ethereum mainnet)
- **DeFi**: Instadapp dsa-connect SDK for spell casting
- **Agent**: `src/context/AgentContext.tsx` — scans and casts spells via wallet
- **Spell builders**: `src/lib/dsa-spells.ts` — flash loan arbitrage and liquidation recipes
- **Node keeper**: `../agent/` — autonomous backend agent (see `agent/README.md`)

## How It Works

1. User connects wallet (needs ETH for gas)
2. User creates a DSA if they don't have one
3. User enables arbitrage and/or liquidations from the dashboard
4. Agent scans every 30s for opportunities (Oasis quotes, Maker/Compound health)
5. When profitable, user clicks "Cast Spell" or the Node keeper auto-executes

## Node Keeper (Autonomous Mode)

For 24/7 operation without a browser:

```bash
cp agent/.env.example agent/.env
npm run agent:dry    # scan only
npm run agent        # continuous keeper
```

## Risk Disclaimer

DeFi involves significant risk. Flash loan arbitrage and liquidations can fail due to:
- Slippage and front-running
- Gas costs exceeding profits
- Smart contract bugs

Only use funds you can afford to lose. You are responsible for your own due diligence.

## License

MIT
