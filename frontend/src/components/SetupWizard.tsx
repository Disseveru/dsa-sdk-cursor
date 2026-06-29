import { useState } from 'react'
import { useAccount, useConnect } from 'wagmi'
import { useDSA } from '../hooks/useDSA'
import { getPreferredConnector } from '../lib/wallet'

const METAMASK_PLAY_STORE = 'https://play.google.com/store/apps/details?id=io.metamask'
const METAMASK_APP_STORE = 'https://apps.apple.com/app/metamask-blockchain-wallet/id1438144202'

export function SetupWizard() {
  const { isConnected } = useAccount()
  const { hasAccount, isLoading, createAccount, error: dsaError } = useDSA()
  const { connect, connectors, isPending } = useConnect()
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const noConnector = connectors.length === 0

  const handleConnect = () => {
    if (noConnector) return
    const connector = getPreferredConnector(connectors)
    if (connector) connect({ connector })
  }

  const handleCreateAccount = async () => {
    setIsCreating(true)
    setCreateError(null)
    try {
      await createAccount()
    } catch (err: any) {
      setCreateError(err?.message || 'Could not set up account. Make sure you have a little ETH for gas fees.')
    } finally {
      setIsCreating(false)
    }
  }

  if (hasAccount) {
    return null
  }

  if (!isConnected) {
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

  return (
    <div className="space-y-6 pb-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Quick Setup</h2>
        <p className="text-gray-400 text-base">Almost done — one more tap.</p>
      </div>

      <div className="flex justify-center gap-2">
        <div className="h-2 w-8 rounded-full bg-accent" />
        <div className="h-2 w-8 rounded-full bg-accent" />
        <div className="h-2 w-2 rounded-full bg-surface-muted" />
      </div>

      <div className="bg-surface-elevated border border-border rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center text-lg font-bold">2</span>
          <div>
            <h3 className="text-lg font-semibold">Set up your earning account</h3>
            <p className="text-sm text-gray-400">One tap — approve in MetaMask</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          This creates a secure smart account that handles flash loans and trades for you automatically.
          MetaMask will ask you to approve — tap Confirm.
        </p>
        {(createError || dsaError) && (
          <p className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">{createError || dsaError}</p>
        )}
        <button
          onClick={handleCreateAccount}
          disabled={isCreating || isLoading}
          className="w-full py-4 rounded-xl bg-accent text-surface font-semibold text-base
                     active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {isCreating ? 'Setting up...' : 'Set Up My Account'}
        </button>
      </div>
    </div>
  )
}
