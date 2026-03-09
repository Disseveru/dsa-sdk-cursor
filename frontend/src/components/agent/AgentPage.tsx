import { useRef, useEffect } from 'react';
import {
  Bot,
  Play,
  Square,
  Activity,
  TrendingUp,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ExternalLink,
  Trash2,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { startAgent, stopAgent, isAgentRunning } from '@/services/agent';
import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/common/StatCard';
import { formatTimestamp, formatUptime, shortenAddress } from '@/utils/format';
import type { AgentLog } from '@/types';

export function AgentPage() {
  const {
    wallet,
    agentConfig,
    agentStats,
    agentLogs,
    addAgentLog,
    clearAgentLogs,
    setAgentStats,
    setArbitrageOpportunities,
    setLiquidatablePositions,
    setCurrentPage,
  } = useStore();
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [agentLogs.length]);

  if (!wallet.isConnected) {
    return (
      <EmptyState
        icon={<Bot className="w-8 h-8 text-dark-400" />}
        title="Connect Your Wallet"
        description="Connect your wallet to activate the AI agent for autonomous DeFi trading."
      />
    );
  }

  const handleStart = () => {
    startAgent(agentConfig, {
      onLog: addAgentLog,
      onOpportunities: (ops) => {
        setArbitrageOpportunities(ops);
      },
      onLiquidations: (positions) => {
        setLiquidatablePositions(positions);
      },
      onStats: (stats) => {
        setAgentStats(stats as Record<string, unknown> & typeof agentStats);
      },
    });
    setAgentStats({ isRunning: true });
  };

  const handleStop = () => {
    stopAgent();
    setAgentStats({ isRunning: false });
  };

  const getLogIcon = (type: AgentLog['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />;
      case 'error': return <XCircle className="w-3.5 h-3.5 text-accent-red flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-accent-orange flex-shrink-0" />;
      case 'trade': return <Zap className="w-3.5 h-3.5 text-accent-purple flex-shrink-0" />;
      default: return <Info className="w-3.5 h-3.5 text-accent-blue flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${agentStats.isRunning ? 'bg-accent-green/10' : 'bg-dark-700'}`}>
              <Bot className={`w-7 h-7 ${agentStats.isRunning ? 'text-accent-green' : 'text-dark-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">SpellCaster Agent</h2>
                {agentStats.isRunning ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-green/10 border border-accent-green/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                    <span className="text-xs text-accent-green font-medium">Running</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-600 border border-dark-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-dark-400" />
                    <span className="text-xs text-dark-400 font-medium">Stopped</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-dark-300 mt-0.5">
                Autonomous scanner for flash loan arbitrage and liquidation opportunities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {agentStats.isRunning ? (
              <button onClick={handleStop} className="btn-danger flex items-center gap-2 text-sm">
                <Square className="w-4 h-4" />
                Stop Agent
              </button>
            ) : (
              <button onClick={handleStart} className="btn-primary flex items-center gap-2 text-sm">
                <Play className="w-4 h-4" />
                Start Agent
              </button>
            )}
          </div>
        </div>

        {agentStats.isRunning && (
          <div className="mt-4 flex items-center gap-6 text-xs text-dark-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Uptime: {formatUptime(agentStats.uptime)}
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Arb: {agentConfig.arbitrageEnabled ? 'ON' : 'OFF'}
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Liq: {agentConfig.liquidationEnabled ? 'ON' : 'OFF'}
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Auto-execute: {agentConfig.autoExecute ? 'ON' : 'OFF'}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Trades"
          value={agentStats.totalTrades}
          change={`${agentStats.successfulTrades} won / ${agentStats.failedTrades} lost`}
          changeType={agentStats.successfulTrades > agentStats.failedTrades ? 'positive' : 'neutral'}
          icon={<Activity className="w-5 h-5 text-accent-blue" />}
          iconBg="bg-accent-blue/10"
        />
        <StatCard
          label="Success Rate"
          value={agentStats.totalTrades > 0
            ? `${((agentStats.successfulTrades / agentStats.totalTrades) * 100).toFixed(1)}%`
            : '—'
          }
          icon={<CheckCircle2 className="w-5 h-5 text-accent-green" />}
          iconBg="bg-accent-green/10"
        />
        <StatCard
          label="Net Profit"
          value={`${agentStats.netProfit} ETH`}
          change={`Gas: ${agentStats.totalGasSpent} ETH`}
          changeType={parseFloat(agentStats.netProfit) > 0 ? 'positive' : 'negative'}
          icon={<TrendingUp className="w-5 h-5 text-accent-purple" />}
          iconBg="bg-accent-purple/10"
        />
        <StatCard
          label="Uptime"
          value={formatUptime(agentStats.uptime)}
          icon={<Clock className="w-5 h-5 text-accent-cyan" />}
          iconBg="bg-accent-cyan/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Agent Logs</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-dark-400">{agentLogs.length} entries</span>
              <button
                onClick={clearAgentLogs}
                className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-dark-200 transition-colors"
                title="Clear logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div
            ref={logContainerRef}
            className="h-[480px] overflow-y-auto space-y-1 pr-1"
          >
            {agentLogs.length === 0 ? (
              <div className="text-center py-16 text-dark-400 text-sm">
                {agentStats.isRunning ? 'Waiting for activity...' : 'Start the agent to see logs'}
              </div>
            ) : (
              agentLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                    log.type === 'success' ? 'bg-accent-green/5 hover:bg-accent-green/10' :
                    log.type === 'error' ? 'bg-accent-red/5 hover:bg-accent-red/10' :
                    log.type === 'warning' ? 'bg-accent-orange/5 hover:bg-accent-orange/10' :
                    'hover:bg-dark-700/50'
                  }`}
                >
                  {getLogIcon(log.type)}
                  <span className="text-dark-400 flex-shrink-0">{formatTimestamp(log.timestamp)}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-dark-200">{log.message}</span>
                    {log.details && (
                      <div className="text-dark-400 mt-0.5 whitespace-pre-wrap">{log.details}</div>
                    )}
                  </div>
                  {log.txHash && (
                    <a
                      href={`https://etherscan.io/tx/${log.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-accent-blue hover:text-accent-blue/80 flex-shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-white mb-4">Quick Config</h2>
            <div className="space-y-4">
              <QuickToggle
                label="Flash Loan Arbitrage"
                sublabel="Scan DEX price differences"
                enabled={agentConfig.arbitrageEnabled}
                onChange={() =>
                  useStore.getState().setAgentConfig({ arbitrageEnabled: !agentConfig.arbitrageEnabled })
                }
              />
              <QuickToggle
                label="Liquidation Monitor"
                sublabel="Watch lending protocol health factors"
                enabled={agentConfig.liquidationEnabled}
                onChange={() =>
                  useStore.getState().setAgentConfig({ liquidationEnabled: !agentConfig.liquidationEnabled })
                }
              />
              <QuickToggle
                label="Auto-Execute"
                sublabel="Automatically execute profitable trades"
                enabled={agentConfig.autoExecute}
                onChange={() =>
                  useStore.getState().setAgentConfig({ autoExecute: !agentConfig.autoExecute })
                }
              />
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-white mb-4">Shortcuts</h2>
            <div className="space-y-2">
              <button
                onClick={() => setCurrentPage('arbitrage')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-700/50 transition-colors text-left"
              >
                <ArrowUpRight className="w-4 h-4 text-accent-blue" />
                <span className="text-sm text-dark-200">View Arbitrage Opportunities</span>
              </button>
              <button
                onClick={() => setCurrentPage('liquidation')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-700/50 transition-colors text-left"
              >
                <ShieldAlert className="w-4 h-4 text-accent-orange" />
                <span className="text-sm text-dark-200">View Liquidatable Positions</span>
              </button>
              <button
                onClick={() => setCurrentPage('settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-700/50 transition-colors text-left"
              >
                <Activity className="w-4 h-4 text-accent-purple" />
                <span className="text-sm text-dark-200">Full Agent Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickToggle({
  label,
  sublabel,
  enabled,
  onChange,
}: {
  label: string;
  sublabel: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-dark-400">{sublabel}</div>
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-accent-green' : 'bg-dark-500'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
