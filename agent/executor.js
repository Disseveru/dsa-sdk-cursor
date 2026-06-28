const { toDsaSpell } = require('./spells')

/**
 * Cast a spell sequence via the DSA SDK.
 * @param {object} dsa - Initialized DSA instance with setInstance() called
 * @param {Array} spellSteps - Array of { connector, method, args }
 * @param {object} options - { dryRun, gasPrice }
 */
async function executeSpell(dsa, spellSteps, { dryRun = true, gasPrice } = {}) {
  if (!spellSteps?.length) {
    throw new Error('No spell steps provided')
  }

  const spells = toDsaSpell(dsa, spellSteps)

  if (dryRun) {
    const gas = await dsa.estimateCastGas(spells).catch(() => null)
    return {
      dryRun: true,
      spellCount: spellSteps.length,
      estimatedGas: gas,
      steps: spellSteps,
    }
  }

  const castParams = gasPrice ? { gasPrice } : {}
  const txHash = await dsa.cast(spells, castParams)
  return { dryRun: false, txHash, steps: spellSteps }
}

module.exports = { executeSpell }
