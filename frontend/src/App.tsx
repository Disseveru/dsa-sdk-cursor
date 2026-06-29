import { useAccount, useConnect } from 'wagmi'
import { ConnectButton } from './components/ConnectButton'
import { Dashboard } from './components/Dashboard'
import { NetworkGuard } from './components/NetworkGuard'
import { getPreferredConnector } from './lib/wallet'

const METAMASK_PLAY_STORE = 'https://play.google.com/store/apps/details?id=io.metamask'
const METAMASK_APP_STORE = 'https://apps.apple.com/app/metamask-blockchain-wallet/id1438144202'

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
  const noConnector = connectors.length === 0

  const handleConnect = () => {
    if (noConnector) return
    const connector = getPreferredConnector(connectors)
    if (connector) connect({ connector })
  }

  return (
    <div className="space-y-8 pt-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Quick Setup</h2>
        <p className="text-gray-400 text-base">Three taps and you are ready. No coding.</p>
      </div>

      <div className="flex justify-center gap-2">
        <div className="h-2 w-8 rounded-full bg-accent" />
        <div className="h-2 w-2 rounded-full bg-surface-muted" />
        <div className="h-2 w-2 rounded-full bg-surface-muted" />
      </div>

      <div className="bg-surface-elevated border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center text-lg font-bold">1</span>
          <div>
            <h3 className="text-lg font-semibold">Get MetaMask on your phone</h3>
            <p className="text-sm text-gray-400">Free app for Android or iPhone</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          MetaMask is your digital wallet. You need it to connect and earn. Install it, create a wallet,
          and add a small amount of ETH for transaction fees.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={METAMASK_PLAY_STORE}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 text-center rounded-xl bg-surface-muted border border-border
                       text-white font-medium text-base active:scale-[0.98] transition-transform"
          >
            Android — Play Store
          </a>
          <a
            href={METAMASK_APP_STORE}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 text-center rounded-xl bg-surface-muted border border-border
                       text-white font-medium text-base active:scale-[0.98] transition-transform"
          >
            iPhone — App Store
          </a>
        </div>
        <button
          onClick={handleConnect}
          disabled={isPending || noConnector}
          className="w-full py-4 rounded-xl bg-accent text-surface font-semibold text-base
                     active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {isPending ? 'Connecting...' : noConnector ? 'Wallet unavailable' : 'I have MetaMask — Connect Wallet'}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center leading-relaxed px-4">
        You need a small amount of ETH in your wallet for transaction fees.
        Never share your secret recovery phrase with anyone.
      </p>
    </div>
  )
}

export default App
