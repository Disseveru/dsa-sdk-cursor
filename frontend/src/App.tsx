import { useAccount, useConnect } from 'wagmi'
import { ConnectButton } from './components/ConnectButton'
import { Dashboard } from './components/Dashboard'

function App() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-surface text-white">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-surface/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-6 h-6 text-surface" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-lg">DeFi Automation</h1>
              <p className="text-xs text-gray-400">Arbitrage & Liquidations</p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {isConnected ? (
          <Dashboard />
        ) : (
          <WelcomeSection />
        )}
      </main>
    </div>
  )
}

function WelcomeSection() {
  const { connect, connectors, isPending } = useConnect()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="max-w-xl space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold">
          DeFi for <span className="text-accent">Everyone</span>
        </h2>
        <p className="text-gray-400 text-lg">
          Access arbitrage opportunities and liquidation rewards through an AI-powered agent. 
          No coding required — just connect your wallet and let the automation work for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="px-6 py-3 bg-accent hover:bg-accent-muted disabled:opacity-50 
                         rounded-lg font-medium transition-colors"
            >
              {isPending ? 'Connecting...' : `Connect ${connector.name}`}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 pt-4">
          You'll need ETH for gas to execute transactions. Make sure your wallet is funded.
        </p>
      </div>
    </div>
  )
}

export default App
