import type { Spell } from './dsa-spells'

/**
 * Convert spell step array into a dsa-connect Spell instance and cast it.
 */
export async function castSpellSteps(dsa: any, steps: Spell[]): Promise<string> {
  const spells = dsa.Spell()
  for (const step of steps) {
    spells.add(step)
  }
  return dsa.cast(spells)
}

/**
 * Estimate gas for a spell sequence without broadcasting.
 */
export async function estimateSpellGas(dsa: any, steps: Spell[]): Promise<string | null> {
  const spells = dsa.Spell()
  for (const step of steps) {
    spells.add(step)
  }
  try {
    return await dsa.estimateCastGas(spells)
  } catch {
    return null
  }
}
