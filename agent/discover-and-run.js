#!/usr/bin/env node
/**
 * Discover wallets from cloud secrets, find DSA accounts, scan & execute opportunities.
 *
 * Usage:
 *   npm run agent:discover        # dry run (default)
 *   DRY_RUN=false npm run agent:discover
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') })

const Web3 = require('web3')
const DSA = require('../src/index')
const config = require('./config')
const { scanDaiPegArbitrage } = require('./scanner/arbitrage')
const { scanLiquidations } = require('./scanner/liquidations')
const { executeSpell } = require('./executor')

const SECRET_KEYS = [
  'PRIVATE_KEY',
  'EOA_PRIVATE_KEY',
  'PRIVATE_KEY_2',
  'CDP_PRIVATE_KEY',
]

function collectWallets() {
  const wallets = []
  const seen = new Set()

  for (const key of SECRET_KEYS) {
    const raw = process.env[key]
    if (!raw) continue
    try {
      const pk = raw.startsWith('0x') ? raw : `0x${raw}`
      const acct = new Web3().eth.accounts.privateKeyToAccount(pk)
      if (seen.has(acct.address.toLowerCase())) continue
      seen.add(acct.address.toLowerCase())
      wallets.push({ label: key, address: acct.address, privateKey: pk })
    } catch (err) {
      console.warn(`Skipping ${key}: ${err.message}`)
    }
  }

  return wallets
}

async function getEthBalance(web3, address) {
  const wei = await web3.eth.getBalance(address)
  return Number(web3.utils.fromWei(wei, 'ether'))
}

async function discoverDsaAccounts(dsa, address) {
  try {
    return await dsa.getAccounts(address)
  } catch {
    return []
  }
}

async function scanWallet(wallet, { dryRun, rpcUrl }) {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))
  const dsa = new DSA({ web3, mode: 'node', privateKey: wallet.privateKey })

  const ethBalance = await getEthBalance(web3, wallet.address)
  const accounts = await discoverDsaAccounts(dsa, wallet.address)

  console.log(`\n=== ${wallet.label} (${wallet.address}) ===`)
  console.log(`ETH balance: ${ethBalance.toFixed(6)}`)
  console.log(
    `DSA accounts: ${
      accounts.length
        ? accounts.map((a) => `#${a.id} ${a.address}`).join(', ')
        : 'none'
    }`
  )

  if (!accounts.length) {
    return { wallet, ethBalance, accounts: [], results: null }
  }

  const primary = accounts[0]
  await dsa.setInstance(primary.id)
  console.log(`Using DSA #${primary.id} at ${primary.address}`)

  const [arbitrage, liquidations] = await Promise.all([
    scanDaiPegArbitrage(dsa, {
      slippagePercent: config.slippagePercent,
      minBorrowDai: config.minBorrowDai,
      minProfitUsd: config.minProfitUsd,
    }),
    scanLiquidations(dsa, wallet.address),
  ])

  console.log(
    'Arbitrage:',
    arbitrage?.error ||
      (arbitrage?.profitable
        ? `PROFITABLE $${arbitrage.estimatedProfitUsd.toFixed(2)}`
        : `not profitable ($${arbitrage?.estimatedProfitUsd?.toFixed(2) ?? '0'})`)
  )

  const actionable = (liquidations || []).filter((c) => c.spellSteps && !c.needsQuote)
  const monitor = (liquidations || []).filter((c) => !c.spellSteps || c.needsQuote)
  console.log(`Liquidations: ${actionable.length} actionable, ${monitor.length} monitor-only`)

  for (const c of actionable) {
    console.log(
      `  - ${c.type} vault=${c.vaultId ?? 'n/a'} liquidatedCol=${c.liquidatedCol ?? 'n/a'}`
    )
  }
  for (const c of monitor) {
    console.log(
      `  - ${c.type} health=${c.healthFactor?.toFixed?.(3) ?? 'n/a'} (needs quote or monitoring)`
    )
  }

  const executions = []

  if (arbitrage?.profitable && arbitrage.spellSteps) {
    const result = await executeSpell(dsa, arbitrage.spellSteps, { dryRun })
    console.log(dryRun ? 'Arbitrage dry-run:' : 'Arbitrage executed:', result)
    executions.push({ type: 'arbitrage', result })
  }

  for (const candidate of actionable) {
    const result = await executeSpell(dsa, candidate.spellSteps, { dryRun })
    console.log(
      dryRun ? `Liquidation dry-run (${candidate.type}):` : `Liquidation executed (${candidate.type}):`,
      result
    )
    executions.push({ type: candidate.type, result })
  }

  return { wallet, ethBalance, accounts, dsa, arbitrage, liquidations, executions }
}

async function main() {
  const dryRun = config.dryRun
  const rpcUrl = config.ethNodeUrl

  console.log('Discovering wallets from cloud secrets...')
  const wallets = collectWallets()
  if (!wallets.length) {
    console.error('No valid private keys found in environment')
    process.exit(1)
  }
  console.log(`Found ${wallets.length} wallet(s)`)
  console.log(`RPC: ${rpcUrl}`)
  console.log(`Dry run: ${dryRun}`)

  const summaries = []
  for (const wallet of wallets) {
    summaries.push(await scanWallet(wallet, { dryRun, rpcUrl }))
  }

  console.log('\n=== Summary ===')
  for (const s of summaries) {
    console.log(
      `${s.wallet.label}: ${s.accounts?.length || 0} DSA(s), ${s.ethBalance?.toFixed(6) || 0} ETH`
    )
  }

  const withExecutions = summaries.filter((s) => s.executions?.length)
  if (withExecutions.length) {
    console.log(
      `Executed or previewed ${withExecutions.reduce((n, s) => n + s.executions.length, 0)} spell(s)`
    )
  } else {
    console.log('No immediately executable opportunities found on mainnet.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
