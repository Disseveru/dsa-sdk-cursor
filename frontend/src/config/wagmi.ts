import { mainnet } from 'wagmi/chains'
import { createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

if (!projectId && import.meta.env.PROD) {
  console.warn(
    'VITE_WALLETCONNECT_PROJECT_ID is not set. Set it in Cursor Secrets or frontend/.env before deploying.',
  )
}

export const config = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: projectId || '00000000000000000000000000000000',
      showQrModal: true,
      metadata: {
        name: 'DeFi Auto-Earn',
        description: 'Earn from arbitrage and liquidations — no coding needed',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://disseveru.github.io/dsa-sdk-cursor',
        icons: ['https://avatars.githubusercontent.com/u/1'],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
  },
})
