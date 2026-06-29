import { useAccount } from 'wagmi'
import { useDSA } from '../hooks/useDSA'
import { SetupWizard } from './SetupWizard'
import { SimpleEarnPanel } from './SimpleEarnPanel'

export function Dashboard() {
  const { address } = useAccount()
  const { hasAccount, isLoading, error } = useDSA()

  return (
    <div className="space-y-6">
      {!hasAccount ? (
        <SetupWizard />
      ) : (
        <>
          <div className="flex items-center gap-3 bg-surface-elevated border border-border rounded-xl p-4">
            <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-accent">Account ready</p>
              <p className="text-xs text-gray-500 truncate">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">{error}</p>
          )}

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-surface-elevated rounded-2xl" />
              <div className="h-20 bg-surface-elevated rounded-2xl" />
            </div>
          ) : (
            <SimpleEarnPanel />
          )}
        </>
      )}
    </div>
  )
}
