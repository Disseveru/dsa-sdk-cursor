import { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Zap,
  Clock,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/common/StatCard';
import { shortenAddress, formatTimeAgo, getHealthFactorColor } from '@/utils/format';
import type { LiquidatablePosition } from '@/types';

export function LiquidationPage() {
  const { wallet, liquidatablePositions, agentStats } = useStore();
  const [filterProtocol, setFilterProtocol] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'health' | 'reward'>('reward');

  if (!wallet.isConnected) {
    return (
      <EmptyState
        icon={<ShieldAlert className="w-8 h-8 text-dark-400" />}
        title="Connect Your Wallet"
        description="Connect your wallet to start monitoring undercollateralized positions across lending protocols."
      />
    );
  }

  const filteredPositions = liquidatablePositions
    .filter((pos) => filterProtocol === 'all' || pos.protocol === filterProtocol)
    .sort((a, b) => {
      if (sortBy === 'health') {
        return parseFloat(a.healthFactor) - parseFloat(b.healthFactor);
      }
      return parseFloat(b.netReward) - parseFloat(a.netReward);
    });

  const availableCount = liquidatablePositions.filter((p) => p.status === 'available').length;
  const totalRewards = liquidatablePositions
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.netReward), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Liquidatable Positions"
          value={availableCount}
          icon={<ShieldAlert className="w-5 h-5 text-accent-orange" />}
          iconBg="bg-accent-orange/10"
        />
        <StatCard
          label="Critical (HF < 0.9)"
          value={liquidatablePositions.filter((p) => parseFloat(p.healthFactor) < 0.9).length}
          icon={<AlertTriangle className="w-5 h-5 text-accent-red" />}
          iconBg="bg-accent-red/10"
        />
        <StatCard
          label="Executed"
          value={liquidatablePositions.filter((p) => p.status === 'completed').length}
          icon={<Zap className="w-5 h-5 text-accent-green" />}
          iconBg="bg-accent-green/10"
        />
        <StatCard
          label="Total Rewards"
          value={`${totalRewards.toFixed(4)} ETH`}
          icon={<DollarSign className="w-5 h-5 text-accent-green" />}
          iconBg="bg-accent-green/10"
        />
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">Liquidation Monitor</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/20">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse" />
              <span className="text-xs text-accent-orange font-medium">Monitoring</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-dark-700 rounded-lg p-0.5">
              {['all', 'aave', 'compound', 'maker'].map((protocol) => (
                <button
                  key={protocol}
                  onClick={() => setFilterProtocol(protocol)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                    filterProtocol === protocol
                      ? 'bg-dark-500 text-white'
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  {protocol}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'health' | 'reward')}
              className="px-3 py-1.5 bg-dark-700 border border-dark-500 rounded-lg text-xs text-dark-200 focus:outline-none"
            >
              <option value="reward">Sort by Reward</option>
              <option value="health">Sort by Health Factor</option>
            </select>
          </div>
        </div>

        {filteredPositions.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-dark-400 mx-auto mb-3 animate-spin" style={{ animationDuration: '3s' }} />
            <p className="text-sm text-dark-400">
              {agentStats.isRunning
                ? 'Monitoring health factors across lending protocols...'
                : 'Start the AI Agent to begin monitoring positions'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPositions.map((position) => (
              <LiquidationCard key={position.id} position={position} />
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-white mb-4">How Liquidation Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Health Factor Drops',
              desc: 'When a borrower\'s collateral value falls below the liquidation threshold, their position becomes liquidatable.',
              icon: '📊',
            },
            {
              title: 'Flash Loan & Repay',
              desc: 'We borrow funds via flash loan, repay part of the borrower\'s debt, and receive their collateral at a discount.',
              icon: '⚡',
            },
            {
              title: 'Collect Reward',
              desc: 'The liquidation bonus (typically 5-15% of the repaid debt) is your profit after gas costs.',
              icon: '💎',
            },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl bg-dark-700/30 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
              <div className="text-xs text-dark-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiquidationCard({ position: pos }: { position: LiquidatablePosition }) {
  const [expanded, setExpanded] = useState(false);
  const hfNum = parseFloat(pos.healthFactor);
  const hfColor = getHealthFactorColor(hfNum);
  const hfWidth = Math.min(Math.max(hfNum * 100, 0), 100);

  return (
    <div
      className="rounded-xl border border-dark-600 hover:border-dark-500 bg-dark-700/30 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
            pos.protocol === 'aave' ? 'bg-purple-500/10 text-purple-400' :
            pos.protocol === 'compound' ? 'bg-green-500/10 text-green-400' :
            'bg-teal-500/10 text-teal-400'
          }`}>
            {pos.protocol}
          </div>
          <div>
            <div className="text-sm text-white font-mono">{shortenAddress(pos.borrower)}</div>
            <div className="text-xs text-dark-400">{pos.collateralToken}/{pos.debtToken}</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className={`text-sm font-bold ${hfColor}`}>HF: {pos.healthFactor}</div>
            <div className="w-20 h-1.5 bg-dark-600 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  hfNum <= 0.9 ? 'bg-accent-red' : hfNum <= 1.0 ? 'bg-accent-orange' : 'bg-accent-green'
                }`}
                style={{ width: `${hfWidth}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-accent-green">{pos.netReward}</div>
            <div className="text-xs text-dark-400">reward</div>
          </div>
          <div className="text-dark-400">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-dark-600/50 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <div className="text-xs text-dark-400">Collateral</div>
              <div className="text-sm font-medium text-white">{pos.collateralAmount}</div>
            </div>
            <div>
              <div className="text-xs text-dark-400">Debt</div>
              <div className="text-sm font-medium text-white">{pos.debtAmount}</div>
            </div>
            <div>
              <div className="text-xs text-dark-400">Est. Reward</div>
              <div className="text-sm font-medium text-accent-green">{pos.estimatedReward}</div>
            </div>
            <div>
              <div className="text-xs text-dark-400">Est. Gas</div>
              <div className="text-sm font-medium text-accent-orange">{pos.estimatedGas}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-success text-xs px-4 py-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Execute Liquidation
            </button>
            <div className="flex items-center gap-1.5 text-xs text-dark-400">
              <Clock className="w-3.5 h-3.5" />
              Detected {formatTimeAgo(pos.timestamp)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
