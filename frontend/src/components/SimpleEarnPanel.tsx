import { useState } from 'react'
import { useAgent } from '../context/AgentContext'
import { useDSA } from '../hooks/useDSA'
import type { ArbitrageOpportunity } from '../lib/agent-scanner'

export function SimpleEarnPanel() {
  const {
    arbitrageEnabled,
    liquidationsEnabled,
    setArbitrageEnabled,
    setLiquidationsEnabled,
    setActive,
    isScanning,
    lastScan,
    executeSpell,
    logs,
  } = useAgent()
  const { hasAccount } = useDSA()
  const [isExecuting, setIsExecuting] = useState(false)

  const isOn = arbitrageEnabled || liquidationsEnabled

  const opportunity = lastScan?.arbitrage && !('error' in lastScan.arbitrage)
    ? (lastScan.arbitrage as ArbitrageOpportunity)
    : null

  const handleMasterToggle = () => {
    if (isOn) {
      setArbitrageEnabled(false)
      setLiquidationsEnabled(false)
      setActive(false)
    } else {
      setActive(true)
      setArbitrageEnabled(true)
      setLiquidationsEnabled(true)
    }
  }

  const handleEarn = async () => {
    if (!opportunity?.spellSteps) return
    setIsExecuting(true)
    try {
      await executeSpell(opportunity.spellSteps, 'arbitrage')
    } finally {
      setIsExecuting(false)
    }
  }

  if (!hasAccount) return null

  return (
    <div className="space-y-4">
      {/* Main toggle */}
      <div className="bg-surface-elevated border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">Auto-Earn</h2>
            <p className="text-sm text-gray-400 mt-1">
              {isScanning ? 'Looking for opportunities...' : isOn ? 'Watching the market' : 'Turn on to start'}
            </p>
          </div>
          <button
            onClick={handleMasterToggle}
            className={`relative w-16 h-9 rounded-full transition-colors shrink-0 ${
              isOn ? 'bg-accent' : 'bg-surface-muted'
            }`}
            aria-label={isOn ? 'Turn off auto-earn' : 'Turn on auto-earn'}
          >
            <span
              className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all ${
                isOn ? 'left-8' : 'left-1'
              }`}
            />
          </button>
        </div>

        {isOn && (
          <div className="space-y-3 pt-2 border-t border-border">
            <EarnOption
              label="Price differences"
              description="Borrow instantly, trade, keep profit"
              enabled={arbitrageEnabled}
              onToggle={() => {
                setActive(true)
                setArbitrageEnabled(!arbitrageEnabled)
              }}
              color="accent"
            />
            <EarnOption
              label="Recover collateral"
              description="Withdraw collateral from your own liquidated positions"
              enabled={liquidationsEnabled}
              onToggle={() => {
                setActive(true)
                setLiquidationsEnabled(!liquidationsEnabled)
              }}
              color="amber"
            />
          </div>
        )}
      </div>

      {/* Opportunity card */}
      {isOn && opportunity?.profitable && (
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-accent font-semibold text-lg">Opportunity found!</p>
            <p className="text-gray-300 text-sm mt-1">
              Estimated profit: about ${opportunity.estimatedProfitUsd.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleEarn}
            disabled={isExecuting || isScanning}
            className="w-full py-4 rounded-xl bg-accent text-surface font-bold text-lg
                       active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {isExecuting ? 'Confirm in MetaMask...' : 'Earn Now'}
          </button>
          <p className="text-xs text-gray-500 text-center">
            MetaMask will ask you to approve. Gas fees and protocol fees apply.
          </p>
        </div>
      )}

      {/* Activity feed */}
      {isOn && logs.length > 0 && (
        <div className="bg-surface-elevated border border-border rounded-2xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Recent activity</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {logs.slice(0, 8).map((log) => (
              <p
                key={log.id}
                className={`text-sm ${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'success' ? 'text-accent' :
                  log.level === 'warn' ? 'text-amber-400' : 'text-gray-500'
                }`}
              >
                {log.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Safety note */}
      <div className="bg-surface-muted/50 border border-border rounded-2xl p-4">
        <p className="text-sm text-gray-400 leading-relaxed">
          <strong className="text-gray-300">Good to know:</strong> Earnings are not guaranteed.
          Only use money you can afford to lose. Gas fees apply to every transaction.
        </p>
      </div>
    </div>
  )
}

function EarnOption({
  label,
  description,
  enabled,
  onToggle,
  color,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
  color: 'accent' | 'amber'
}) {
  const activeClass = color === 'accent' ? 'bg-accent' : 'bg-amber-500'
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 p-3 rounded-xl
                 bg-surface-muted/50 active:bg-surface-muted transition-colors text-left"
    >
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className={`w-12 h-7 rounded-full relative transition-colors ${enabled ? activeClass : 'bg-surface-muted'}`}>
        <span
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${
            enabled ? 'left-5' : 'left-0.5'
          }`}
        />
      </div>
    </button>
  )
}
