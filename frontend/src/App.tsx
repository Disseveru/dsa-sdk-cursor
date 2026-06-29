import { useAccount, useConnect } from 'wagmi'
import { ConnectButton } from './components/ConnectButton'
import { Dashboard } from './components/Dashboard'
import { NetworkGuard } from './components/NetworkGuard'
import { getPreferredConnector } from './lib/wallet'

function App() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-surface text-white safe-bottom">
      <header className="border-b border-border sticky top-0 z-50 bg-surface/95 backdrop-blur-sm safe-top">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-surface" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-base">DeFi Auto-Earn</h1>
              <p className="text-xs text-gray-400">No coding needed</p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {isConnected ? (
          <NetworkGuard>
            <Dashboard />
          </NetworkGuard>
        ) : (
          <WelcomeSection />
        )}
      </main>
    </div>
  )
}

function WelcomeSection() {
  const { connect, connectors, isPending } = useConnect()

  const handleConnect = () => {
    const connector = getPreferredConnector(connectors)
    if (connector) connect({ connector })
  }

  return (
    <div className="space-y-8 pt-4">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold leading-tight">
          Earn from crypto<br />
          <span className="text-accent">on your phone</span>
        </h2>
        <p className="text-gray-400 text-base leading-relaxed px-2">
          This app finds money-making opportunities and handles everything for you.
          No computer. No coding. Just your phone and MetaMask.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { n: '1', text: 'Install MetaMask from the Play Store' },
          { n: '2', text: 'Connect your wallet below' },
          { n: '3', text: 'Turn on Auto-Earn and tap Earn when ready' },
        ].map((item) => (
          <div key={item.n} className="flex items-center gap-4 bg-surface-elevated border border-border rounded-xl p-4">
            <span className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold shrink-0">
              {item.n}
            </span>
            <p className="text-sm text-gray-300">{item.text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleConnect}
        disabled={isPending}
        className="w-full py-4 rounded-xl bg-accent text-surface font-bold text-lg
                   active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {isPending ? 'Opening MetaMask...' : 'Connect Wallet'}
      </button>

      <p className="text-xs text-gray-500 text-center leading-relaxed px-4">
        You need a small amount of ETH in your wallet for transaction fees.
        Never share your secret recovery phrase with anyone.
      </p>
    </div>
  )
}

export default App
