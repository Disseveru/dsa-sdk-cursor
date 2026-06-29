import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { getPreferredConnector } from '../lib/wallet'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="px-3 py-2 bg-surface-elevated border border-border rounded-lg text-xs text-gray-400
                   active:bg-surface-muted transition-colors"
      >
        Disconnect
      </button>
    )
  }

  const handleConnect = () => {
    const connector = getPreferredConnector(connectors)
    if (connector) connect({ connector })
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending || connectors.length === 0}
      className="px-4 py-2 bg-accent text-surface rounded-lg font-medium text-sm
                 active:scale-[0.98] transition-transform disabled:opacity-50"
    >
      {isPending ? 'Connecting...' : 'Connect'}
    </button>
  )
}
