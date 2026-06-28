const { buildDaiPegArbitrageSpell } = require('../spells')

/**
 * Scan for DAI peg arbitrage opportunities (DAI > $1 via Oasis quote).
 * Returns null when no profitable opportunity is found.
 */
async function scanDaiPegArbitrage(dsa, { slippagePercent = 2, minBorrowDai = 20, minProfitUsd = 5 } = {}) {
  const borrowAmount = minBorrowDai
  const borrowAmtInWei = dsa.tokens.fromDecimal(borrowAmount, 'dai')

  let buyAmount
  try {
    buyAmount = await dsa.oasis.getBuyAmount('USDC', 'DAI', borrowAmount, slippagePercent)
  } catch (err) {
    return { error: `Oasis quote failed: ${err.message}` }
  }

  const usdcReceived = buyAmount.buyAmt
  const daiBorrowed = borrowAmount
  const spreadUsd = usdcReceived - daiBorrowed
  const estimatedProfitUsd = spreadUsd

  const opportunity = {
    type: 'dai-peg-arbitrage',
    description: `Flash borrow ${borrowAmount} DAI, swap to USDC, open Maker vault, repay`,
    borrowAmount,
    usdcReceived,
    estimatedProfitUsd,
    slippagePercent,
    buyUnitAmt: buyAmount.unitAmt,
    profitable: estimatedProfitUsd >= minProfitUsd,
    spellSteps: buildDaiPegArbitrageSpell({
      borrowAmountWei: borrowAmtInWei,
      buyUnitAmt: buyAmount.unitAmt,
    }),
  }

  return opportunity
}

module.exports = { scanDaiPegArbitrage }
