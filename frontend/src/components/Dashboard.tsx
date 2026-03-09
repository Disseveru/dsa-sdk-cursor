import { useAccount } from 'wagmi'
import { DSAStatus } from './DSAStatus'
import { ArbitragePanel } from './ArbitragePanel'
import { LiquidationsPanel } from './LiquidationsPanel'
import { AutomationStatus } from './AutomationStatus'

export function Dashboard() {
  const { address } = useAccount()

  return (
    <div className="space-y-8">
      {/* Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DSAStatus />
        <AutomationStatus />
        <div className="bg-surface-elevated border border-border rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Wallet</h3>
          <p className="font-mono text-sm truncate" title={address}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>

      {/* Main Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ArbitragePanel />
        <LiquidationsPanel />
      </div>

      {/* Info Footer */}
      <div className="bg-surface-muted/50 border border-border rounded-xl p-4">
        <p className="text-sm text-gray-400">
          <strong className="text-gray-300">How it works:</strong> The AI agent monitors the blockchain for profitable 
          arbitrage opportunities (price differences across DEXs) and positions eligible for liquidation. When it finds 
          one, it uses flash loans to execute the transaction—you only pay gas. Profits go to your connected wallet.
        </p>
      </div>
    </div>
  )
}
