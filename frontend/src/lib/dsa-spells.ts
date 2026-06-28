/**
 * DSA Spell Builders for Arbitrage & Liquidations
 * Used by the automation agent to construct and cast spells.
 */

import { TOKENS } from './tokens'

export type Spell = {
  connector: string
  method: string
  args: (string | number)[]
}

/**
 * DAI peg arbitrage (Short DAI recipe from guides/MakerDao.md)
 * Flash borrow DAI → swap to USDC → open vault → deposit → borrow DAI → repay
 */
export function buildDaiPegArbitrageSpell(params: {
  borrowAmountWei: string
  buyUnitAmt: string
  borrowToken?: string
  swapToken?: string
  vaultType?: string
}): Spell[] {
  const {
    borrowToken = TOKENS.dai,
    borrowAmountWei,
    swapToken = TOKENS.usdc,
    buyUnitAmt,
    vaultType = 'USDC-A',
  } = params

  return [
    { connector: 'instapool', method: 'flashBorrow', args: [borrowToken, borrowAmountWei, 0, 0] },
    { connector: 'oasis', method: 'sell', args: [swapToken, borrowToken, borrowAmountWei, buyUnitAmt, 0, 0] },
    { connector: 'maker', method: 'open', args: [vaultType] },
    { connector: 'maker', method: 'deposit', args: [0, -1, 0, 0] },
    { connector: 'maker', method: 'borrow', args: [0, borrowAmountWei, 0, 0] },
    { connector: 'instapool', method: 'flashPayback', args: [borrowToken, 0, 0] },
  ]
}

/** @deprecated Use buildDaiPegArbitrageSpell */
export function buildArbitrageSpell(params: {
  borrowToken: string
  borrowAmountWei: string
  swapToken: string
  buyAmountWei: string
  vaultType: string
}): Spell[] {
  return buildDaiPegArbitrageSpell({
    borrowToken: params.borrowToken,
    borrowAmountWei: params.borrowAmountWei,
    swapToken: params.swapToken,
    buyUnitAmt: params.buyAmountWei,
    vaultType: params.vaultType,
  })
}

/**
 * Generic flash-loan swap arbitrage: borrow → swap → repay
 */
export function buildFlashSwapArbitrageSpell(params: {
  borrowToken: string
  borrowAmountWei: string
  buyToken: string
  buyUnitAmt: string
}): Spell[] {
  const { borrowToken, borrowAmountWei, buyToken, buyUnitAmt } = params
  return [
    { connector: 'instapool', method: 'flashBorrow', args: [borrowToken, borrowAmountWei, 0, 0] },
    { connector: 'oasis', method: 'sell', args: [buyToken, borrowToken, borrowAmountWei, buyUnitAmt, 0, 0] },
    { connector: 'instapool', method: 'flashPayback', args: [borrowToken, 0, 0] },
  ]
}

/**
 * Withdraw collateral from a Maker vault that has been liquidated.
 */
export function buildMakerWithdrawLiquidatedSpell(params: {
  vaultId: number
  amountWei: string
}): Spell[] {
  const { vaultId, amountWei } = params
  return [
    { connector: 'maker', method: 'withdrawLiquidated', args: [vaultId, amountWei, 0, 0] },
  ]
}

/**
 * Compound liquidation with flash loan.
 */
export function buildCompoundLiquidationSpell(params: {
  debtToken: string
  debtAmountWei: string
  collateralToken: string
  borrower: string
  buyUnitAmt: string
}): Spell[] {
  const { debtToken, debtAmountWei, collateralToken, borrower, buyUnitAmt } = params
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

/** @deprecated Use buildMakerWithdrawLiquidatedSpell or buildCompoundLiquidationSpell */
export function buildLiquidationSpell(params: {
  vaultId: number
  tokenAddress: string
  amountWei: string
}): Spell[] {
  return buildMakerWithdrawLiquidatedSpell({
    vaultId: params.vaultId,
    amountWei: params.amountWei,
  })
}
