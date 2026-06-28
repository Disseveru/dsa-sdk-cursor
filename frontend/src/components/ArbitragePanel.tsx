import { useAgent } from '../context/AgentContext'
import type { ArbitrageOpportunity } from '../lib/agent-scanner'

export function ArbitragePanel() {
  const {
    arbitrageEnabled,
    setArbitrageEnabled,
    isScanning,
    lastScan,
    executeSpell,
    logs,
    setActive,
  } = useAgent()

  const opportunity = lastScan?.arbitrage && !('error' in lastScan.arbitrage)
    ? (lastScan.arbitrage as ArbitrageOpportunity)
    : null

  const handleToggle = () => {
    if (!arbitrageEnabled) {
      setActive(true)
      setArbitrageEnabled(true)
    } else {
      setArbitrageEnabled(false)
    }
  }

  const handleExecute = async () => {
    if (!opportunity?.spellSteps) return
    await executeSpell(opportunity.spellSteps, 'DAI peg arbitrage')
  }

  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8V7m-8 8h8m-8 0V7m0 8v8" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Flash Loan Arbitrage</h2>
          <p className="text-sm text-gray-400">Borrow → Swap → Repay. Keep the profit.</p>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        The agent scans for DAI peg arbitrage (flash borrow DAI, swap to USDC via Oasis,
        open Maker vault, repay). No upfront capital required — only gas.
      </p>

      {opportunity && arbitrageEnabled && (
        <div className="mb-4 p-3 rounded-lg bg-surface-muted border border-border text-sm space-y-1">
          <p className={opportunity.profitable ? 'text-accent' : 'text-gray-400'}>
            {opportunity.profitable ? 'Opportunity detected' : 'Monitoring — no profit yet'}
          </p>
          <p className="text-gray-500">
            Borrow {opportunity.borrowAmount} DAI → ~{opportunity.usdcReceived.toFixed(2)} USDC
            (est. ${opportunity.estimatedProfitUsd.toFixed(2)})
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            arbitrageEnabled
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-accent hover:bg-accent-muted text-surface'
          }`}
        >
          {arbitrageEnabled ? 'Stop Scanning' : 'Enable Arbitrage'}
        </button>

        {opportunity?.profitable && arbitrageEnabled && (
          <button
            onClick={handleExecute}
            disabled={isScanning}
            className="px-4 py-3 rounded-lg font-medium bg-accent/20 text-accent hover:bg-accent/30
                       disabled:opacity-50 transition-colors"
          >
            Cast Spell
          </button>
        )}
      </div>

      {arbitrageEnabled && logs.length > 0 && (
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
