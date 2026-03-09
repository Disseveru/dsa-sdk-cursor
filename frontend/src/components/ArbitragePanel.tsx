import { useState } from 'react'

export function ArbitragePanel() {
  const [isRunning, setIsRunning] = useState(false)

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
        The agent finds price differences across protocols (e.g. DAI vs USDC) and executes 
        profitable swaps using instant flash loans. No upfront capital required—only gas.
      </p>
      <button
        onClick={() => setIsRunning(!isRunning)}
        disabled
        className="w-full py-3 rounded-lg font-medium transition-colors
                   bg-accent/20 text-accent cursor-not-allowed opacity-60"
        title="AI agent integration coming soon"
      >
        {isRunning ? 'Stop Scanning' : 'Enable Arbitrage (Coming Soon)'}
      </button>
    </div>
  )
}
