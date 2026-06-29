import { mainnet } from 'wagmi/chains'
import { createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'Bc67443847288ab3b22836c02ba280b8'

export const config = createConfig({
  chains: [mainnet],
  connectors: [
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'DeFi Auto-Earn',
        description: 'Earn from arbitrage and liquidations — no coding needed',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://disseveru.github.io/dsa-sdk-cursor',
        icons: ['https://avatars.githubusercontent.com/u/1'],
      },
    }),
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
  },
})
