# DeFi Auto-Earn (Phone App)

**No coding. No computer. Just your phone.**

Open the app in Chrome on your Android phone, connect MetaMask, and tap to earn.

## For phone users

Read **[START_HERE.md](../START_HERE.md)** in the repo root — step-by-step guide for Moto G and other Android phones.

## Live app

Once deployed to GitHub Pages:

**https://disseveru.github.io/dsa-sdk-cursor/**

## What it does on your phone

1. Connect MetaMask via WalletConnect
2. One-tap account setup
3. Turn on **Auto-Earn** — watches for opportunities
4. Tap **Earn Now** when a trade is found — confirm in MetaMask

## Developers only

If you have a computer and need to run locally:

```bash
cd frontend && npm install && npm run dev
```

The Node.js keeper in `../agent/` is optional and not needed for phone users.

## Risk

Crypto trading involves risk. Only use funds you can afford to lose.
