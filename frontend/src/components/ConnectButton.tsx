import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`
    return (
      <button
        onClick={() => disconnect()}
        className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border 
                   rounded-lg hover:bg-surface-muted transition-colors text-sm font-mono"
      >
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        {truncated}
      </button>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending || connectors.length === 0}
      className="px-4 py-2 bg-accent hover:bg-accent-muted disabled:opacity-50 
                 rounded-lg font-medium text-sm transition-colors"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
