const { buildMakerWithdrawLiquidatedSpell, buildCompoundLiquidationSpell, TOKENS } = require('../spells')

/**
 * Find Maker vaults eligible for liquidation (health ratio above liquidation threshold).
 * Scans a known address or the DSA instance address.
 */
async function scanMakerVaults(dsa, address) {
  const target = address || dsa.instance?.address
  if (!target) return []

  let vaults
  try {
    vaults = await dsa.maker.getVaults(target)
  } catch {
    return []
  }

  const candidates = []
  for (const [vaultId, vault] of Object.entries(vaults || {})) {
    if (!vault.debt || vault.debt <= 0) continue

    const healthRatio = vault.status
    const liquidationRatio = vault.liquidation
    const isUnhealthy = healthRatio >= liquidationRatio

    if (isUnhealthy || vault.liquidatedCol > 0) {
      candidates.push({
        type: 'maker-vault',
        protocol: 'maker',
        vaultId: Number(vaultId),
        owner: vault.owner,
        collateral: vault.colName,
        debt: vault.debt,
        healthRatio,
        liquidationRatio,
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

  return candidates
}

/**
 * Find Compound positions with health factor below 1 (liquidatable).
 */
async function scanCompoundPositions(dsa, address) {
  const target = address || dsa.instance?.address
  if (!target) return []

  let position
  try {
    position = await dsa.compound.getPosition(target)
  } catch {
    return []
  }

  const candidates = []
  const healthFactor = position.totalBorrowInEth
    ? position.maxBorrowLimitInEth / position.totalBorrowInEth
    : Infinity

  if (healthFactor < 1 && position.totalBorrowInEth > 0) {
    for (const [token, data] of Object.entries(position)) {
      if (!data.borrow || data.borrow <= 0) continue

      const debtToken = data.address || TOKENS.dai
      const debtAmountWei = dsa.tokens.fromDecimal(data.borrow, token)

      candidates.push({
        type: 'compound-liquidation',
        protocol: 'compound',
        borrower: target,
        debtToken: token,
        debtAmount: data.borrow,
        healthFactor,
        spellSteps: buildCompoundLiquidationSpell({
          debtToken,
          debtAmountWei,
          collateralToken: TOKENS.usdc,
          borrower: target,
          buyUnitAmt: '0', // Must be resolved at execution time via oasis quote
        }),
        needsQuote: true,
      })
    }
  }

  return candidates
}

async function scanLiquidations(dsa, address) {
  const [maker, compound] = await Promise.all([
    scanMakerVaults(dsa, address),
    scanCompoundPositions(dsa, address),
  ])
  return [...maker, ...compound]
}

module.exports = {
  scanMakerVaults,
  scanCompoundPositions,
  scanLiquidations,
}
