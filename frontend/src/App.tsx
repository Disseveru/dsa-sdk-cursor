import { useAccount } from 'wagmi'
import { ConnectButton } from './components/ConnectButton'
import { Dashboard } from './components/Dashboard'
import { NetworkGuard } from './components/NetworkGuard'
import { SetupWizard } from './components/SetupWizard'

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
          <SetupWizard />
        )}
      </main>
    </div>
  )
}

export default App
