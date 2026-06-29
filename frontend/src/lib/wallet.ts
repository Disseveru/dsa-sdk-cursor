import type { Connector } from 'wagmi'

/** Prefer MetaMask in-app browser; fall back to WalletConnect on mobile Chrome. */
export function getPreferredConnector(connectors: readonly Connector[]) {
  const hasInjected =
    typeof window !== 'undefined' && Boolean((window as Window & { ethereum?: unknown }).ethereum)

  if (hasInjected) {
    const injected = connectors.find((c) => c.id === 'injected')
    if (injected) return injected
  }

  return connectors.find((c) => c.id === 'walletConnect') ?? connectors[0]
}
