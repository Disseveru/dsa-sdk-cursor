import { useAgent } from '../context/AgentContext'

export function AutomationStatus() {
  const {
    isActive,
    setActive,
    arbitrageEnabled,
    liquidationsEnabled,
    isScanning,
    scanNow,
    logs,
  } = useAgent()

  const monitoring = arbitrageEnabled || liquidationsEnabled

  return (
    <div className="bg-surface-elevated border border-border rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-2">AI Agent</h3>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${monitoring ? 'text-accent' : 'text-gray-500'}`}>
          {isScanning ? 'Scanning...' : monitoring ? 'Monitoring' : 'Paused'}
        </span>
        <button
          onClick={() => setActive(!isActive)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isActive ? 'bg-accent' : 'bg-surface-muted'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
              isActive ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {monitoring
          ? `Arbitrage: ${arbitrageEnabled ? 'on' : 'off'} · Liquidations: ${liquidationsEnabled ? 'on' : 'off'}`
          : 'Enable arbitrage or liquidations below'}
      </p>

      {isActive && (
        <button
          onClick={scanNow}
          disabled={isScanning}
          className="mt-2 text-xs px-2 py-1 rounded bg-surface-muted text-gray-400 hover:text-white
                     disabled:opacity-50 transition-colors"
        >
          Scan now
        </button>
      )}

      {logs.length > 0 && (
        <div className="mt-2 max-h-20 overflow-y-auto">
          <p className="text-xs text-gray-600 truncate">{logs[0].message}</p>
        </div>
      )}
    </div>
  )
}
