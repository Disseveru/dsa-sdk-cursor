import { Bell, Fuel } from 'lucide-react';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useStore } from '@/store/useStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your DeFi positions and activity' },
  arbitrage: { title: 'Flash Loan Arbitrage', subtitle: 'Scan and execute cross-DEX arbitrage opportunities' },
  liquidation: { title: 'Liquidation Monitor', subtitle: 'Find and liquidate undercollateralized positions' },
  agent: { title: 'AI Agent', subtitle: 'Autonomous DeFi trading agent powered by Instadapp DSA' },
  settings: { title: 'Settings', subtitle: 'Configure your agent and preferences' },
};

export function Header() {
  const { currentPage, agentStats } = useStore();
  const pageInfo = PAGE_TITLES[currentPage] || PAGE_TITLES.dashboard;

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-dark-600/50 bg-dark-800/40 backdrop-blur-md">
      <div>
        <h1 className="text-lg font-bold text-white">{pageInfo.title}</h1>
        <p className="text-xs text-dark-300">{pageInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {agentStats.isRunning && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-green/10 border border-accent-green/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-xs font-medium text-accent-green">Agent Active</span>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 glass-card text-xs">
          <Fuel className="w-3.5 h-3.5 text-accent-orange" />
          <span className="text-dark-200">Gas: ~25 gwei</span>
        </div>

        <button className="relative p-2 rounded-xl hover:bg-dark-700 transition-colors">
          <Bell className="w-5 h-5 text-dark-300" />
        </button>

        <ConnectButton />
      </div>
    </header>
  );
}
