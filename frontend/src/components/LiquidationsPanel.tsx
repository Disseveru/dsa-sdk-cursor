import { useState } from 'react'

export function LiquidationsPanel() {
  const [isRunning, setIsRunning] = useState(false)

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
        When vaults or positions fall below their collateralization threshold, the agent can 
        liquidate them and earn a bonus (typically 5–13%). The agent handles the entire flow.
      </p>
      <button
        onClick={() => setIsRunning(!isRunning)}
        disabled
        className="w-full py-3 rounded-lg font-medium transition-colors
                   bg-amber-500/20 text-amber-500 cursor-not-allowed opacity-60"
        title="AI agent integration coming soon"
      >
        {isRunning ? 'Stop Scanning' : 'Enable Liquidations (Coming Soon)'}
      </button>
    </div>
  )
}
