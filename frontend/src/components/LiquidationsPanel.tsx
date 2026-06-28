import { useAgent } from '../context/AgentContext'
import type { LiquidationCandidate } from '../lib/agent-scanner'

export function LiquidationsPanel() {
  const {
    liquidationsEnabled,
    setLiquidationsEnabled,
    isScanning,
    lastScan,
    executeSpell,
    logs,
    setActive,
  } = useAgent()

  const candidates = (lastScan?.liquidations || []).filter(
    (c): c is LiquidationCandidate & { spellSteps: NonNullable<LiquidationCandidate['spellSteps']> } =>
      !!c.spellSteps,
  )

  const unhealthy = lastScan?.liquidations?.filter((c) => c.isUnhealthy || c.needsQuote) || []

  const handleToggle = () => {
    if (!liquidationsEnabled) {
      setActive(true)
      setLiquidationsEnabled(true)
    } else {
      setLiquidationsEnabled(false)
    }
  }

  const handleExecute = async (candidate: LiquidationCandidate) => {
    if (!candidate.spellSteps) return
    const label = candidate.type === 'maker-vault'
      ? `Maker vault #${candidate.vaultId} withdrawal`
      : `Compound liquidation of ${candidate.borrower?.slice(0, 8)}...`
    await executeSpell(candidate.spellSteps, label)
  }

  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Liquidations</h2>
          <p className="text-sm text-gray-400">Collect rewards for liquidating underwater positions.</p>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Scans Maker vaults and Compound positions for unhealthy collateral ratios.
        When liquidated collateral is available, the agent can cast withdrawal spells via flash loans.
      </p>

      {liquidationsEnabled && (candidates.length > 0 || unhealthy.length > 0) && (
        <div className="mb-4 p-3 rounded-lg bg-surface-muted border border-border text-sm space-y-2">
          {candidates.map((c) => (
            <div key={`${c.type}-${c.vaultId || c.borrower}`} className="flex items-center justify-between gap-2">
              <span className="text-amber-400">
                {c.type === 'maker-vault'
                  ? `Vault #${c.vaultId}: ${c.liquidatedCol} liquidated col`
                  : `${c.debtToken} debt: ${c.debtAmount}`}
              </span>
              <button
                onClick={() => handleExecute(c)}
                disabled={isScanning}
                className="px-3 py-1 text-xs rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30
                           disabled:opacity-50"
              >
                Cast Spell
              </button>
            </div>
          ))}
          {unhealthy.filter((c) => !c.spellSteps).map((c) => (
            <p key={`watch-${c.vaultId || c.borrower}`} className="text-gray-500">
              Monitoring {c.protocol} position (health: {c.healthRatio?.toFixed(2)})
            </p>
          ))}
        </div>
      )}

      <button
        onClick={handleToggle}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          liquidationsEnabled
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
        }`}
      >
        {liquidationsEnabled ? 'Stop Scanning' : 'Enable Liquidations'}
      </button>

      {liquidationsEnabled && logs.length > 0 && (
        <div className="mt-4 max-h-32 overflow-y-auto text-xs space-y-1">
          {logs.slice(0, 5).map((log) => (
            <p key={log.id} className={
              log.level === 'error' ? 'text-red-400' :
              log.level === 'success' ? 'text-accent' :
              log.level === 'warn' ? 'text-amber-400' : 'text-gray-500'
            }>
              [{log.time}] {log.message}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
