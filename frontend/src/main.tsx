import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config/wagmi'
import App from './App'
import { AgentProvider } from './context/AgentContext'
import { DSAProvider } from './context/DSAContext'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DSAProvider>
          <AgentProvider>
            <App />
          </AgentProvider>
        </DSAProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
