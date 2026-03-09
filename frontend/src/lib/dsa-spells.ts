/**
 * DSA Spell Builders for Arbitrage & Liquidations
 * These are used by the AI agent to construct and cast spells.
 */

export type Spell = {
  connector: string
  method: string
  args: (string | number)[]
}

/**
 * Example: Flash loan arbitrage spell (DAI/USDC)
 * Borrow DAI -> Swap to USDC -> Open vault -> Deposit -> Borrow DAI -> Repay
 */
export function buildArbitrageSpell(params: {
  borrowToken: string
  borrowAmountWei: string
  swapToken: string
  buyAmountWei: string
  vaultType: string
}): Spell[] {
  const { borrowToken, borrowAmountWei, swapToken, buyAmountWei, vaultType } = params

  return [
    { connector: 'instapool', method: 'flashBorrow', args: [borrowToken, borrowAmountWei, 0, 0] },
    { connector: 'oasis', method: 'sell', args: [swapToken, borrowToken, borrowAmountWei, buyAmountWei, 0, 0] },
    { connector: 'maker', method: 'open', args: [vaultType] },
    { connector: 'maker', method: 'deposit', args: [0, -1, 0, 0] },
    { connector: 'maker', method: 'borrow', args: [0, borrowAmountWei, 0, 0] },
    { connector: 'instapool', method: 'flashPayback', args: [borrowToken, 0, 0] },
  ]
}

/**
 * Example: Liquidate a Maker vault
 * Uses the maker connector's liquidate method
 */
export function buildLiquidationSpell(params: {
  vaultId: number
  tokenAddress: string
  amountWei: string
}): Spell[] {
  const { vaultId, tokenAddress, amountWei } = params

  return [
    { connector: 'maker', method: 'liquidate', args: [vaultId, tokenAddress, amountWei, 0, 0] },
  ]
}
