import { useState } from 'react';
import {
  Settings,
  Fuel,
  TrendingUp,
  Shield,
  Sliders,
  Save,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { EmptyState } from '@/components/common/EmptyState';
import { SUPPORTED_PROTOCOLS, SUPPORTED_DEXES } from '@/utils/constants';

export function SettingsPage() {
  const { wallet, agentConfig, setAgentConfig } = useStore();
  const [saved, setSaved] = useState(false);

  if (!wallet.isConnected) {
    return (
      <EmptyState
        icon={<Settings className="w-8 h-8 text-dark-400" />}
        title="Connect Your Wallet"
        description="Connect your wallet to configure your agent settings."
      />
    );
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setAgentConfig({
      arbitrageEnabled: true,
      liquidationEnabled: true,
      maxGasPrice: '50',
      minProfitThreshold: '0.01',
      minLiquidationReward: '0.005',
      protocols: ['aave', 'compound'],
      autoExecute: false,
      slippageTolerance: '0.5',
    });
  };

  const toggleProtocol = (id: string) => {
    const protocols = agentConfig.protocols.includes(id)
      ? agentConfig.protocols.filter((p) => p !== id)
      : [...agentConfig.protocols, id];
    setAgentConfig({ protocols });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-accent-purple/10">
            <Sliders className="w-5 h-5 text-accent-purple" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Agent Configuration</h2>
            <p className="text-sm text-dark-300">Customize how your AI agent operates</p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Fuel className="w-4 h-4 text-accent-orange" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Gas Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-200 mb-2">Max Gas Price (gwei)</label>
                <input
                  type="number"
                  value={agentConfig.maxGasPrice}
                  onChange={(e) => setAgentConfig({ maxGasPrice: e.target.value })}
                  className="input-field"
                  placeholder="50"
                />
                <p className="text-xs text-dark-400 mt-1">Agent won't execute if gas exceeds this</p>
              </div>
              <div>
                <label className="block text-sm text-dark-200 mb-2">Slippage Tolerance (%)</label>
                <input
                  type="number"
                  value={agentConfig.slippageTolerance}
                  onChange={(e) => setAgentConfig({ slippageTolerance: e.target.value })}
                  className="input-field"
                  step="0.1"
                  placeholder="0.5"
                />
                <p className="text-xs text-dark-400 mt-1">Max acceptable price deviation</p>
              </div>
            </div>
          </section>

          <div className="border-t border-dark-600" />

          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-accent-green" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Profit Thresholds</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-200 mb-2">Min Arbitrage Profit (ETH)</label>
                <input
                  type="number"
                  value={agentConfig.minProfitThreshold}
                  onChange={(e) => setAgentConfig({ minProfitThreshold: e.target.value })}
                  className="input-field"
                  step="0.001"
                  placeholder="0.01"
                />
                <p className="text-xs text-dark-400 mt-1">Skip opportunities below this profit</p>
              </div>
              <div>
                <label className="block text-sm text-dark-200 mb-2">Min Liquidation Reward (ETH)</label>
                <input
                  type="number"
                  value={agentConfig.minLiquidationReward}
                  onChange={(e) => setAgentConfig({ minLiquidationReward: e.target.value })}
                  className="input-field"
                  step="0.001"
                  placeholder="0.005"
                />
                <p className="text-xs text-dark-400 mt-1">Skip liquidations below this reward</p>
              </div>
            </div>
          </section>

          <div className="border-t border-dark-600" />

          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-accent-blue" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Monitored Protocols</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SUPPORTED_PROTOCOLS.map((protocol) => (
                <button
                  key={protocol.id}
                  onClick={() => toggleProtocol(protocol.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    agentConfig.protocols.includes(protocol.id)
                      ? 'border-accent-blue/30 bg-accent-blue/5'
                      : 'border-dark-600 hover:border-dark-500'
                  }`}
                >
                  <span className="text-lg">{protocol.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">{protocol.name}</div>
                    <div className="text-xs text-dark-400">
                      {agentConfig.protocols.includes(protocol.id) ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="border-t border-dark-600" />

          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-accent-orange" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Execution Mode</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setAgentConfig({ autoExecute: false })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  !agentConfig.autoExecute
                    ? 'border-accent-blue/30 bg-accent-blue/5'
                    : 'border-dark-600 hover:border-dark-500'
                }`}
              >
                <div className="text-sm font-medium text-white mb-1">Manual Approval</div>
                <div className="text-xs text-dark-400">
                  Agent finds opportunities but waits for your confirmation before executing
                </div>
              </button>
              <button
                onClick={() => setAgentConfig({ autoExecute: true })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  agentConfig.autoExecute
                    ? 'border-accent-green/30 bg-accent-green/5'
                    : 'border-dark-600 hover:border-dark-500'
                }`}
              >
                <div className="text-sm font-medium text-white mb-1">Auto-Execute</div>
                <div className="text-xs text-dark-400">
                  Agent automatically executes high-confidence trades meeting your thresholds
                </div>
              </button>
            </div>
            {agentConfig.autoExecute && (
              <div className="mt-3 p-3 rounded-lg bg-accent-orange/10 border border-accent-orange/20 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-accent-orange flex-shrink-0 mt-0.5" />
                <div className="text-xs text-accent-orange">
                  Auto-execute will spend gas from your wallet without manual confirmation.
                  Make sure your profit thresholds and gas limits are properly configured.
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={handleReset} className="btn-secondary flex items-center gap-2 text-sm">
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm">
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
