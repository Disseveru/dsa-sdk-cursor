import {
  Wallet,
  TrendingUp,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Plus,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { shortenAddress, formatTimeAgo } from '@/utils/format';

export function Dashboard() {
  const {
    wallet,
    dsaAccounts,
    activeDSA,
    agentStats,
    agentLogs,
    arbitrageOpportunities,
    liquidatablePositions,
    setCurrentPage,
  } = useStore();

  if (!wallet.isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center max-w-lg animate-fade-in">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Welcome to <span className="gradient-text">SpellCaster</span>
          </h1>
          <p className="text-dark-300 mb-8 leading-relaxed">
            Your autonomous DeFi agent for flash loan arbitrage and liquidations.
            Connect your wallet to get started — no coding required.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-4 text-center">
              <ArrowUpRight className="w-6 h-6 text-accent-blue mx-auto mb-2" />
              <div className="text-xs text-dark-300">Flash Loan Arbitrage</div>
            </div>
            <div className="glass-card p-4 text-center">
              <ShieldAlert className="w-6 h-6 text-accent-orange mx-auto mb-2" />
              <div className="text-xs text-dark-300">Auto Liquidations</div>
            </div>
            <div className="glass-card p-4 text-center">
              <Activity className="w-6 h-6 text-accent-green mx-auto mb-2" />
              <div className="text-xs text-dark-300">AI Agent</div>
            </div>
          </div>
          <p className="text-xs text-dark-400">
            Connect your wallet using the button in the top right corner
          </p>
        </div>
      </div>
    );
  }

  const recentLogs = agentLogs.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Wallet Balance"
          value={`${parseFloat(wallet.balance).toFixed(4)} ETH`}
          icon={<Wallet className="w-5 h-5 text-accent-blue" />}
          iconBg="bg-accent-blue/10"
        />
        <StatCard
          label="Net Profit"
          value={`${agentStats.netProfit} ETH`}
          change={agentStats.totalTrades > 0 ? `${agentStats.successfulTrades}/${agentStats.totalTrades} trades` : 'No trades yet'}
          changeType={parseFloat(agentStats.netProfit) > 0 ? 'positive' : 'neutral'}
          icon={<TrendingUp className="w-5 h-5 text-accent-green" />}
          iconBg="bg-accent-green/10"
        />
        <StatCard
          label="Arb Opportunities"
          value={arbitrageOpportunities.filter(o => o.status === 'detected').length}
          change="Live scanning"
          changeType="neutral"
          icon={<ArrowUpRight className="w-5 h-5 text-accent-purple" />}
          iconBg="bg-accent-purple/10"
        />
        <StatCard
          label="Liquidatable"
          value={liquidatablePositions.filter(p => p.status === 'available').length}
          change="Monitoring positions"
          changeType="neutral"
          icon={<ShieldAlert className="w-5 h-5 text-accent-orange" />}
          iconBg="bg-accent-orange/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <button
              onClick={() => setCurrentPage('agent')}
              className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
            >
              View All
            </button>
          </div>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-dark-400 text-sm">
              No activity yet. Start the AI Agent to begin scanning.
            </div>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-dark-700/30 hover:bg-dark-700/50 transition-colors"
                >
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    log.type === 'success' ? 'bg-accent-green' :
                    log.type === 'error' ? 'bg-accent-red' :
                    log.type === 'warning' ? 'bg-accent-orange' :
                    'bg-accent-blue'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-100 truncate">{log.message}</p>
                    <p className="text-xs text-dark-400">{formatTimeAgo(log.timestamp)}</p>
                  </div>
                  {log.txHash && (
                    <a
                      href={`https://etherscan.io/tx/${log.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent-blue hover:underline flex-shrink-0"
                    >
                      Tx
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">DSA Accounts</h2>
          </div>
          {dsaAccounts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-dark-400 mb-3">No DSA accounts found</p>
              <button className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 mx-auto">
                <Plus className="w-3.5 h-3.5" />
                Create DSA
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {dsaAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`px-3 py-3 rounded-xl border transition-colors cursor-pointer ${
                    activeDSA?.id === account.id
                      ? 'border-accent-blue/30 bg-accent-blue/5'
                      : 'border-dark-600 hover:border-dark-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">DSA #{account.id}</div>
                      <div className="text-xs text-dark-400 font-mono">{shortenAddress(account.address)}</div>
                    </div>
                    <div className="text-xs text-dark-400">v{account.version}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCurrentPage('arbitrage')}
              className="p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-accent-blue/30 transition-all group"
            >
              <ArrowUpRight className="w-6 h-6 text-accent-blue mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-white">Scan Arbitrage</div>
              <div className="text-xs text-dark-400">Find profitable trades</div>
            </button>
            <button
              onClick={() => setCurrentPage('liquidation')}
              className="p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-accent-orange/30 transition-all group"
            >
              <ShieldAlert className="w-6 h-6 text-accent-orange mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-white">Monitor Positions</div>
              <div className="text-xs text-dark-400">Find liquidatable loans</div>
            </button>
            <button
              onClick={() => setCurrentPage('agent')}
              className="p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-accent-green/30 transition-all group"
            >
              <Activity className="w-6 h-6 text-accent-green mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-white">Start Agent</div>
              <div className="text-xs text-dark-400">Autonomous trading</div>
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className="p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-accent-purple/30 transition-all group"
            >
              <ArrowDownRight className="w-6 h-6 text-accent-purple mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-white">Configure</div>
              <div className="text-xs text-dark-400">Agent settings</div>
            </button>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Agent Performance</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-300">Total Trades</span>
              <span className="text-sm font-medium text-white">{agentStats.totalTrades}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-300">Success Rate</span>
              <span className="text-sm font-medium text-white">
                {agentStats.totalTrades > 0
                  ? `${((agentStats.successfulTrades / agentStats.totalTrades) * 100).toFixed(1)}%`
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-300">Total Profit</span>
              <span className="text-sm font-medium text-accent-green">{agentStats.totalProfit} ETH</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-300">Gas Spent</span>
              <span className="text-sm font-medium text-accent-orange">{agentStats.totalGasSpent} ETH</span>
            </div>
            <div className="border-t border-dark-600 pt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-dark-200">Net Profit</span>
              <span className={`text-base font-bold ${
                parseFloat(agentStats.netProfit) >= 0 ? 'text-accent-green' : 'text-accent-red'
              }`}>
                {agentStats.netProfit} ETH
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
