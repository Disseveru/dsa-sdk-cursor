/**
 * DSA spell builders for flash-loan arbitrage and liquidations.
 * Used by both the Node.js keeper agent and the browser frontend.
 */

const TOKENS = {
  dai: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  eth: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
}

/**
 * DAI peg arbitrage (Short DAI recipe from guides/MakerDao.md)
 * Flash borrow DAI → swap to USDC → open vault → deposit → borrow DAI → repay
 */
function buildDaiPegArbitrageSpell({
  borrowToken = TOKENS.dai,
  borrowAmountWei,
  swapToken = TOKENS.usdc,
  buyUnitAmt,
  vaultType = 'USDC-A',
}) {
  return [
    { connector: 'instapool', method: 'flashBorrow', args: [borrowToken, borrowAmountWei, 0, 0] },
    { connector: 'oasis', method: 'sell', args: [swapToken, borrowToken, borrowAmountWei, buyUnitAmt, 0, 0] },
    { connector: 'maker', method: 'open', args: [vaultType] },
    { connector: 'maker', method: 'deposit', args: [0, -1, 0, 0] },
    { connector: 'maker', method: 'borrow', args: [0, borrowAmountWei, 0, 0] },
    { connector: 'instapool', method: 'flashPayback', args: [borrowToken, 0, 0] },
  ]
}

/**
 * Generic flash-loan arbitrage: borrow → swap → repay
 * Use when you already hold the repayment asset or have a closing step.
 */
function buildFlashSwapArbitrageSpell({
  borrowToken,
  borrowAmountWei,
  buyToken,
  buyUnitAmt,
}) {
  return [
    { connector: 'instapool', method: 'flashBorrow', args: [borrowToken, borrowAmountWei, 0, 0] },
    { connector: 'oasis', method: 'sell', args: [buyToken, borrowToken, borrowAmountWei, buyUnitAmt, 0, 0] },
    { connector: 'instapool', method: 'flashPayback', args: [borrowToken, 0, 0] },
  ]
}

/**
 * Withdraw collateral from a Maker vault that has been liquidated.
 */
function buildMakerWithdrawLiquidatedSpell({ vaultId, amountWei }) {
  return [
    { connector: 'maker', method: 'withdrawLiquidated', args: [vaultId, amountWei, 0, 0] },
  ]
}

/**
 * Compound liquidation with flash loan.
 * Borrow debt token → liquidate → swap collateral → repay flash loan.
 */
function buildCompoundLiquidationSpell({
  debtToken,
  debtAmountWei,
  collateralToken,
  borrower,
  buyUnitAmt,
}) {
  return [
    { connector: 'instapool', method: 'flashBorrow', args: [debtToken, debtAmountWei, 0, 0] },
    {
      connector: 'compound',
      method: 'liquidate',
      args: [borrower, debtToken, collateralToken, debtAmountWei, 0, 0],
    },
    {
      connector: 'oasis',
      method: 'sell',
      args: [debtToken, collateralToken, buyUnitAmt, debtAmountWei, 0, 0],
    },
    { connector: 'instapool', method: 'flashPayback', args: [debtToken, 0, 0] },
  ]
}

function toDsaSpell(dsa, spellSteps) {
  const spells = dsa.Spell()
  for (const step of spellSteps) {
    spells.add(step)
  }
  return spells
}

module.exports = {
  TOKENS,
  buildDaiPegArbitrageSpell,
  buildFlashSwapArbitrageSpell,
  buildMakerWithdrawLiquidatedSpell,
  buildCompoundLiquidationSpell,
  toDsaSpell,
}
