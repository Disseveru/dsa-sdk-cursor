import { useState } from 'react';
import {
  ArrowLeftRight,
  Search,
  Zap,
  TrendingUp,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/common/StatCard';
import { formatTimeAgo, getConfidenceColor } from '@/utils/format';
import type { ArbitrageOpportunity } from '@/types';

export function ArbitragePage() {
  const { wallet, arbitrageOpportunities, agentStats } = useStore();
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'profit' | 'time'>('profit');

  if (!wallet.isConnected) {
    return (
      <EmptyState
        icon={<ArrowLeftRight className="w-8 h-8 text-dark-400" />}
        title="Connect Your Wallet"
        description="Connect your wallet to start scanning for arbitrage opportunities across decentralized exchanges."
      />
    );
  }

  const filteredOps = arbitrageOpportunities
    .filter((op) => filterConfidence === 'all' || op.confidence === filterConfidence)
    .sort((a, b) => {
      if (sortBy === 'profit') {
        return parseFloat(b.netProfit) - parseFloat(a.netProfit);
      }
      return b.timestamp - a.timestamp;
    });

  const totalProfit = arbitrageOpportunities
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + parseFloat(o.estimatedProfit), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Opportunities"
          value={arbitrageOpportunities.filter((o) => o.status === 'detected').length}
          icon={<Search className="w-5 h-5 text-accent-blue" />}
          iconBg="bg-accent-blue/10"
        />
        <StatCard
          label="High Confidence"
          value={arbitrageOpportunities.filter((o) => o.confidence === 'high').length}
          icon={<Zap className="w-5 h-5 text-accent-green" />}
          iconBg="bg-accent-green/10"
        />
        <StatCard
          label="Executed Today"
          value={agentStats.successfulTrades}
          icon={<TrendingUp className="w-5 h-5 text-accent-purple" />}
          iconBg="bg-accent-purple/10"
        />
        <StatCard
          label="Total Profit"
          value={`${totalProfit.toFixed(4)} ETH`}
          icon={<TrendingUp className="w-5 h-5 text-accent-green" />}
          iconBg="bg-accent-green/10"
        />
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">Arbitrage Scanner</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-green/10 border border-accent-green/20">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              <span className="text-xs text-accent-green font-medium">Live</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-dark-700 rounded-lg p-0.5">
              <button
                onClick={() => setFilterConfidence('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterConfidence === 'all' ? 'bg-dark-500 text-white' : 'text-dark-300 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterConfidence('high')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterConfidence === 'high' ? 'bg-accent-green/20 text-accent-green' : 'text-dark-300 hover:text-white'
                }`}
              >
                High
              </button>
              <button
                onClick={() => setFilterConfidence('medium')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterConfidence === 'medium' ? 'bg-accent-orange/20 text-accent-orange' : 'text-dark-300 hover:text-white'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setFilterConfidence('low')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterConfidence === 'low' ? 'bg-accent-red/20 text-accent-red' : 'text-dark-300 hover:text-white'
                }`}
              >
                Low
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'profit' | 'time')}
              className="px-3 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-xs text-dark-200 focus:outline-none"
            >
              <option value="profit">Sort by Profit</option>
              <option value="time">Sort by Time</option>
            </select>
          </div>
        </div>

        {filteredOps.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-dark-400 mx-auto mb-3 animate-spin" style={{ animationDuration: '3s' }} />
            <p className="text-sm text-dark-400">
              {agentStats.isRunning
                ? 'Scanning for arbitrage opportunities...'
                : 'Start the AI Agent to begin scanning for opportunities'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOps.map((op) => (
              <ArbitrageCard key={op.id} opportunity={op} />
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-white mb-4">How Flash Loan Arbitrage Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Borrow', desc: 'Take a flash loan from Instadapp pools — no collateral needed', icon: '💰' },
            { step: '2', title: 'Buy Low', desc: 'Purchase tokens on the DEX with the lower price', icon: '📉' },
            { step: '3', title: 'Sell High', desc: 'Sell those tokens on the DEX with the higher price', icon: '📈' },
            { step: '4', title: 'Repay & Profit', desc: 'Repay the flash loan and keep the difference as profit', icon: '✨' },
          ].map((item) => (
            <div key={item.step} className="text-center p-4 rounded-xl bg-dark-700/30">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold text-white mb-1">
                <span className="text-accent-blue">Step {item.step}:</span> {item.title}
              </div>
              <div className="text-xs text-dark-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArbitrageCard({ opportunity: op }: { opportunity: ArbitrageOpportunity }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-xl border border-dark-600 hover:border-dark-500 bg-dark-700/30 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{op.tokenIn}</span>
            <ArrowLeftRight className="w-4 h-4 text-dark-400" />
            <span className="text-sm font-bold text-white">{op.tokenOut}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-dark-400">
            <span className="px-2 py-0.5 rounded-md bg-dark-600">{op.buyDex}</span>
            <span>→</span>
            <span className="px-2 py-0.5 rounded-md bg-dark-600">{op.sellDex}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-bold text-accent-green">{op.netProfit}</div>
            <div className="text-xs text-dark-400">net profit</div>
          </div>
          <div className={`px-2 py-1 rounded-md text-xs font-medium ${
            op.confidence === 'high' ? 'bg-accent-green/10 text-accent-green' :
            op.confidence === 'medium' ? 'bg-accent-orange/10 text-accent-orange' :
            'bg-accent-red/10 text-accent-red'
          }`}>
            {op.confidence}
          </div>
          <div className="text-xs text-dark-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(op.timestamp)}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-dark-600/50 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <div className="text-xs text-dark-400">Flash Loan</div>
              <div className="text-sm font-medium text-white">{op.flashLoanAmount}</div>
            </div>
            <div>
              <div className="text-xs text-dark-400">Spread</div>
              <div className="text-sm font-medium text-white">{op.spread}</div>
            </div>
            <div>
              <div className="text-xs text-dark-400">Est. Profit</div>
              <div className="text-sm font-medium text-accent-green">{op.estimatedProfit}</div>
            </div>
            <div>
              <div className="text-xs text-dark-400">Est. Gas</div>
              <div className="text-sm font-medium text-accent-orange">{op.estimatedGas}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Execute Trade
            </button>
            <div className="flex items-center gap-1.5 text-xs text-dark-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              Prices change rapidly. Profit is not guaranteed.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
