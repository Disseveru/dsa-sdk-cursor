import { buildDaiPegArbitrageSpell, buildMakerWithdrawLiquidatedSpell, type Spell } from './dsa-spells'

export type ArbitrageOpportunity = {
  type: 'dai-peg-arbitrage'
  description: string
  borrowAmount: number
  usdcReceived: number
  estimatedProfitUsd: number
  profitable: boolean
  spellSteps: Spell[]
}

export type LiquidationCandidate = {
  type: 'maker-vault' | 'compound-liquidation'
  protocol: string
  vaultId?: number
  borrower?: string
  debtToken?: string
  debtAmount?: number
  healthRatio?: number
  liquidationRatio?: number
  liquidatedCol?: number
  isUnhealthy?: boolean
  hasLiquidatedCollateral?: boolean
  spellSteps: Spell[] | null
  needsQuote?: boolean
}

export type ScanResult = {
  arbitrage: ArbitrageOpportunity | { error: string } | null
  liquidations: LiquidationCandidate[]
}

export async function scanArbitrage(
  dsa: any,
  { slippagePercent = 2, minBorrowDai = 20, minProfitUsd = 5 } = {},
): Promise<ArbitrageOpportunity | { error: string } | null> {
  const borrowAmount = minBorrowDai
  const borrowAmtInWei = dsa.tokens.fromDecimal(borrowAmount, 'dai')

  let buyAmount
  try {
    buyAmount = await dsa.oasis.getBuyAmount('USDC', 'DAI', borrowAmount, slippagePercent)
  } catch (err: any) {
    return { error: err?.message || 'Oasis quote failed' }
  }

  const estimatedProfitUsd = buyAmount.buyAmt - borrowAmount

  return {
    type: 'dai-peg-arbitrage',
    description: `Flash borrow ${borrowAmount} DAI, swap to USDC, open Maker vault, repay`,
    borrowAmount,
    usdcReceived: buyAmount.buyAmt,
    estimatedProfitUsd,
    profitable: estimatedProfitUsd >= minProfitUsd,
    spellSteps: buildDaiPegArbitrageSpell({
      borrowAmountWei: borrowAmtInWei,
      buyUnitAmt: buyAmount.unitAmt,
    }),
  }
}

export async function scanLiquidations(dsa: any, address?: string): Promise<LiquidationCandidate[]> {
  const target = address || dsa.instance?.address
  if (!target) return []

  const candidates: LiquidationCandidate[] = []

  try {
    const vaults = await dsa.maker.getVaults(target)
    for (const [vaultId, vault] of Object.entries(vaults || {}) as [string, any][]) {
      if (!vault.debt || vault.debt <= 0) continue
      const isUnhealthy = vault.status >= vault.liquidation
      if (isUnhealthy || vault.liquidatedCol > 0) {
        candidates.push({
          type: 'maker-vault',
          protocol: 'maker',
          vaultId: Number(vaultId),
          borrower: vault.owner,
          debtAmount: vault.debt,
          healthRatio: vault.status,
          liquidationRatio: vault.liquidation,
          liquidatedCol: vault.liquidatedCol,
          isUnhealthy,
          hasLiquidatedCollateral: vault.liquidatedCol > 0,
          spellSteps: vault.liquidatedCol > 0
            ? buildMakerWithdrawLiquidatedSpell({
                vaultId: Number(vaultId),
                amountWei: dsa.tokens.fromDecimal(vault.liquidatedCol, vault.token.toLowerCase()),
              })
            : null,
        })
      }
    }
  } catch {
    // Maker scan failed — continue with compound
  }

  try {
    const position = await dsa.compound.getPosition(target)
    const healthFactor = position.totalBorrowInEth
      ? position.maxBorrowLimitInEth / position.totalBorrowInEth
      : Infinity

    if (healthFactor < 1 && position.totalBorrowInEth > 0) {
      for (const [token, data] of Object.entries(position) as [string, any][]) {
        if (!data?.borrow || data.borrow <= 0) continue
        candidates.push({
          type: 'compound-liquidation',
          protocol: 'compound',
          borrower: target,
          debtToken: token,
          debtAmount: data.borrow,
          healthRatio: healthFactor,
          spellSteps: null,
          needsQuote: true,
        })
      }
    }
  } catch {
    // Compound scan failed
  }

  return candidates
}

export async function runFullScan(
  dsa: any,
  address: string | undefined,
  options: { slippagePercent?: number; minBorrowDai?: number; minProfitUsd?: number; enableArbitrage?: boolean; enableLiquidations?: boolean } = {},
): Promise<ScanResult> {
  const { enableArbitrage = true, enableLiquidations = true, ...scanOpts } = options

  const [arbitrage, liquidations] = await Promise.all([
    enableArbitrage ? scanArbitrage(dsa, scanOpts) : Promise.resolve(null),
    enableLiquidations ? scanLiquidations(dsa, address) : Promise.resolve([]),
  ])

  return { arbitrage, liquidations }
}
