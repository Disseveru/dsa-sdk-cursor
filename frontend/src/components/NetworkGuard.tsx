import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { mainnet } from 'wagmi/chains'

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  if (!isConnected || chainId === mainnet.id) {
    return <>{children}</>
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-6 space-y-4 text-center">
        <h2 className="text-lg font-semibold text-amber-300">Switch to Ethereum Mainnet</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          This app only works on Ethereum Mainnet. Tap below and approve the network switch in MetaMask.
        </p>
        <button
          onClick={() => switchChain({ chainId: mainnet.id })}
          disabled={isPending}
          className="w-full py-4 rounded-xl bg-accent text-surface font-semibold disabled:opacity-50"
        >
          {isPending ? 'Switching...' : 'Switch Network'}
        </button>
      </div>
    </div>
  )
}
