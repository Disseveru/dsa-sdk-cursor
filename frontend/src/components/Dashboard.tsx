import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useDSA } from '../hooks/useDSA'
import { SetupWizard } from './SetupWizard'
import { SimpleEarnPanel } from './SimpleEarnPanel'

export function Dashboard() {
  const { address } = useAccount()
  const { hasAccount, isLoading } = useDSA()
  const [setupDone, setSetupDone] = useState(false)

  const showWizard = !hasAccount && !setupDone

  return (
    <div className="space-y-6">
      {showWizard ? (
        <SetupWizard onComplete={() => setSetupDone(true)} />
      ) : (
        <>
          {hasAccount && (
            <div className="flex items-center gap-3 bg-surface-elevated border border-border rounded-xl p-4">
              <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-accent">Account ready</p>
                <p className="text-xs text-gray-500 truncate">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            </div>
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
