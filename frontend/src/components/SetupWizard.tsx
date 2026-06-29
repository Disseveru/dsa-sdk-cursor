import { useState } from 'react'
import { useConnect, useAccount } from 'wagmi'
import { useDSA } from '../hooks/useDSA'

const METAMASK_PLAY_STORE = 'https://play.google.com/store/apps/details?id=io.metamask'

type Step = 1 | 2 | 3 | 4

export function SetupWizard({ onComplete }: { onComplete: () => void }) {
  const { isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { hasAccount, isLoading, createAccount } = useDSA()
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const step: Step = !isConnected ? 1 : !hasAccount ? 2 : 3

  const handleConnect = () => {
    const wc = connectors.find((c) => c.id === 'walletConnect') ?? connectors[0]
    if (wc) connect({ connector: wc })
  }

  const handleCreateAccount = async () => {
    setIsCreating(true)
    setCreateError(null)
    try {
      await createAccount()
      onComplete()
    } catch {
      setCreateError('Could not set up account. Make sure you have a little ETH for gas fees.')
    } finally {
      setIsCreating(false)
    }
  }

  if (hasAccount && isConnected) {
    return null
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Quick Setup</h2>
        <p className="text-gray-400 text-base">Three taps and you are ready. No coding.</p>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              s <= step ? 'w-8 bg-accent' : 'w-2 bg-surface-muted'
            }`}
          />
        ))}
      </div>

      {/* Step 1: MetaMask */}
      {step === 1 && (
        <div className="bg-surface-elevated border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center text-lg font-bold">1</span>
            <div>
              <h3 className="text-lg font-semibold">Get MetaMask on your phone</h3>
              <p className="text-sm text-gray-400">Free app from the Play Store</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            MetaMask is your digital wallet. You need it to connect and earn. Install it, create a wallet,
            and add a small amount of ETH for transaction fees.
          </p>
          <a
            href={METAMASK_PLAY_STORE}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 text-center rounded-xl bg-surface-muted border border-border
                       text-white font-medium text-base active:scale-[0.98] transition-transform"
          >
            Open Play Store
          </a>
          <button
            onClick={handleConnect}
            disabled={isPending}
            className="w-full py-4 rounded-xl bg-accent text-surface font-semibold text-base
                       active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {isPending ? 'Connecting...' : 'I have MetaMask — Connect Wallet'}
          </button>
        </div>
      )}

      {/* Step 2: Create account */}
      {step === 2 && (
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
          {createError && (
            <p className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">{createError}</p>
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
      )}
    </div>
  )
}
