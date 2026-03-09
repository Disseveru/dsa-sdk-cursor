import {
  LayoutDashboard,
  ArrowLeftRight,
  ShieldAlert,
  Bot,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Page } from '@/types';

const NAV_ITEMS: { id: Page; label: string; icon: typeof LayoutDashboard; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & balances' },
  { id: 'arbitrage', label: 'Arbitrage', icon: ArrowLeftRight, description: 'Flash loan arb scanner' },
  { id: 'liquidation', label: 'Liquidations', icon: ShieldAlert, description: 'Position monitor' },
  { id: 'agent', label: 'AI Agent', icon: Bot, description: 'Autonomous trading' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Configuration' },
];

export function Sidebar() {
  const { currentPage, setCurrentPage, sidebarOpen, setSidebarOpen, agentStats } = useStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-30 flex flex-col bg-dark-800/80 backdrop-blur-xl border-r border-dark-600/50 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center gap-3 px-5 h-16 border-b border-dark-600/50">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div className="animate-fade-in">
            <div className="text-base font-bold text-white tracking-tight">SpellCaster</div>
            <div className="text-[10px] text-dark-300 uppercase tracking-widest">DeFi Agent</div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-accent-blue/15 to-accent-purple/15 text-white border border-accent-blue/20'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent-blue' : ''}`} />
                {item.id === 'agent' && agentStats.isRunning && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-green animate-pulse" />
                )}
              </div>
              {sidebarOpen && (
                <div className="text-left animate-fade-in">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-[10px] text-dark-400">{item.description}</div>
                </div>
              )}
              {!sidebarOpen && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-dark-700 rounded-lg text-sm text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-700/50 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {sidebarOpen && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
