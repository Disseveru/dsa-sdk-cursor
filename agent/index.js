#!/usr/bin/env node
/**
 * DeFi Automation Agent
 * Scans for flash-loan arbitrage and liquidation opportunities, then casts DSA spells.
 *
 * Usage:
 *   cp agent/.env.example agent/.env   # configure RPC + keys
 *   npm run agent                      # start keeper
 *   npm run agent:dry                  # scan only, no transactions
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') })

const Web3 = require('web3')
const DSA = require('../src/index')
const config = require('./config')
const { scanDaiPegArbitrage } = require('./scanner/arbitrage')
const { scanLiquidations } = require('./scanner/liquidations')
const { executeSpell } = require('./executor')

function log(msg, data) {
  const ts = new Date().toISOString()
  if (data !== undefined) {
    console.log(`[${ts}] ${msg}`, data)
  } else {
    console.log(`[${ts}] ${msg}`)
  }
}

async function createDsa() {
  const web3 = new Web3(new Web3.providers.HttpProvider(config.ethNodeUrl))

  const dsaOpts = { web3 }
  if (config.privateKey) {
    dsaOpts.mode = 'node'
    dsaOpts.privateKey = config.privateKey
  }

  const dsa = new DSA(dsaOpts)

  if (config.dsaId) {
    await dsa.setInstance(config.dsaId)
    log(`Using DSA #${config.dsaId}`)
  } else if (config.publicAddress) {
    const accounts = await dsa.getAccounts(config.publicAddress)
    if (accounts?.length) {
      await dsa.setInstance(accounts[0].id)
      log(`Auto-selected DSA #${accounts[0].id} for ${config.publicAddress}`)
    } else {
      log('No DSA found for address. Create one via the frontend or dsa.build()')
    }
  }

  return dsa
}

async function runScanCycle(dsa) {
  const results = { arbitrage: null, liquidations: [] }

  if (config.enableArbitrage) {
    results.arbitrage = await scanDaiPegArbitrage(dsa, {
      slippagePercent: config.slippagePercent,
      minBorrowDai: config.minBorrowDai,
      minProfitUsd: config.minProfitUsd,
    })

    if (results.arbitrage?.error) {
      log('Arbitrage scan error', results.arbitrage.error)
    } else if (results.arbitrage?.profitable) {
      log('Arbitrage opportunity found', {
        profit: `$${results.arbitrage.estimatedProfitUsd.toFixed(2)}`,
        borrow: `${results.arbitrage.borrowAmount} DAI`,
      })

      if (!config.dryRun && dsa.instance?.address) {
        const result = await executeSpell(dsa, results.arbitrage.spellSteps, { dryRun: false })
        log('Arbitrage spell cast', result)
      } else {
        const preview = await executeSpell(dsa, results.arbitrage.spellSteps, { dryRun: true })
        log('Arbitrage dry-run preview', preview)
      }
    } else if (results.arbitrage) {
      log('No profitable arbitrage', {
        estimatedProfit: `$${results.arbitrage.estimatedProfitUsd?.toFixed(2) ?? '0'}`,
        minRequired: `$${config.minProfitUsd}`,
      })
    }
  }

  if (config.enableLiquidations) {
    results.liquidations = await scanLiquidations(dsa, config.publicAddress)

    const actionable = results.liquidations.filter((c) => c.spellSteps && !c.needsQuote)
    if (actionable.length) {
      log(`Found ${actionable.length} actionable liquidation(s)`, actionable.map((c) => ({
        type: c.type,
        vaultId: c.vaultId,
        borrower: c.borrower,
      })))

      for (const candidate of actionable) {
        if (!config.dryRun && dsa.instance?.address) {
          const result = await executeSpell(dsa, candidate.spellSteps, { dryRun: false })
          log('Liquidation spell cast', result)
        } else {
          const preview = await executeSpell(dsa, candidate.spellSteps, { dryRun: true })
          log('Liquidation dry-run preview', preview)
        }
      }
    } else if (results.liquidations.length) {
      log(`Found ${results.liquidations.length} unhealthy position(s) (quotes needed or monitoring only)`)
    } else {
      log('No liquidation candidates')
    }
  }

  return results
}

async function main() {
  log('Starting DeFi Automation Agent', {
    dryRun: config.dryRun,
    arbitrage: config.enableArbitrage,
    liquidations: config.enableLiquidations,
    interval: `${config.scanIntervalMs}ms`,
  })

  const dsa = await createDsa()

  await runScanCycle(dsa)

  if (process.argv.includes('--once')) {
    log('Single scan complete')
    return
  }

  setInterval(() => {
    runScanCycle(dsa).catch((err) => log('Scan cycle error', err.message))
  }, config.scanIntervalMs)

  log(`Agent running. Scanning every ${config.scanIntervalMs / 1000}s. Press Ctrl+C to stop.`)
}

main().catch((err) => {
  console.error('Agent failed to start:', err)
  process.exit(1)
})
