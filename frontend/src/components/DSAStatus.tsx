import { useState } from 'react'
import { useDSA } from '../hooks/useDSA'

export function DSAStatus() {
  const { dsa, accounts, isLoading } = useDSA()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!dsa) return
    setIsCreating(true)
    try {
      const tx = await dsa.build({})
      console.log('DSA created:', tx)
      // Refetch accounts - in a real app you'd have a callback or event
      window.location.reload()
    } catch (err) {
      console.error('Failed to create DSA:', err)
      alert('Failed to create account. Ensure you have ETH for gas.')
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-surface-elevated border border-border rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-surface-muted rounded w-1/2 mb-2" />
        <div className="h-6 bg-surface-muted rounded w-3/4" />
      </div>
    )
  }

  const hasAccount = accounts && accounts.length > 0
  const activeAccount = accounts?.[0]

  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-2">Smart Account (DSA)</h3>
      {hasAccount ? (
        <div className="space-y-2">
          <p className="font-mono text-sm">
            Account #{activeAccount?.id} · {activeAccount?.address?.slice(0, 6)}...{activeAccount?.address?.slice(-4)}
          </p>
          <p className="text-xs text-accent">Ready for spells</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">No Smart Account yet</p>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="text-sm px-3 py-1.5 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 
                       disabled:opacity-50 transition-colors"
          >
            {isCreating ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      )}
    </div>
  )
}
