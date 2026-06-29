import { useState } from 'react'
import { useDSA } from '../hooks/useDSA'

export function SetupWizard() {
  const { hasAccount, isLoading, createAccount, error: dsaError } = useDSA()
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

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
