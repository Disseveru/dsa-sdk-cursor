import type { AgentConfig, AgentLog, ArbitrageOpportunity, LiquidatablePosition } from '@/types';

let agentInterval: ReturnType<typeof setInterval> | null = null;
let startTime = 0;
let logCallback: ((log: AgentLog) => void) | null = null;
let opportunityCallback: ((ops: ArbitrageOpportunity[]) => void) | null = null;
let liquidationCallback: ((positions: LiquidatablePosition[]) => void) | null = null;
let statsCallback: ((stats: Record<string, unknown>) => void) | null = null;

function createLog(type: AgentLog['type'], message: string, details?: string, txHash?: string): AgentLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    type,
    message,
    details,
    txHash,
  };
}

const DEX_PAIRS = [
  { buyDex: 'Uniswap', sellDex: '1inch', tokenIn: 'DAI', tokenOut: 'ETH' },
  { buyDex: 'Uniswap', sellDex: 'Curve', tokenIn: 'USDC', tokenOut: 'DAI' },
  { buyDex: 'Kyber', sellDex: 'Uniswap', tokenIn: 'ETH', tokenOut: 'LINK' },
  { buyDex: '1inch', sellDex: 'Uniswap', tokenIn: 'WBTC', tokenOut: 'ETH' },
  { buyDex: 'Curve', sellDex: '1inch', tokenIn: 'USDT', tokenOut: 'USDC' },
  { buyDex: 'Uniswap', sellDex: 'Kyber', tokenIn: 'ETH', tokenOut: 'UNI' },
];

function generateArbitrageOpportunities(config: AgentConfig): ArbitrageOpportunity[] {
  const count = Math.floor(Math.random() * 4) + 1;
  const ops: ArbitrageOpportunity[] = [];

  for (let i = 0; i < count; i++) {
    const pair = DEX_PAIRS[Math.floor(Math.random() * DEX_PAIRS.length)];
    const buyPrice = (1000 + Math.random() * 100).toFixed(2);
    const spreadBps = (Math.random() * 50 + 5).toFixed(1);
    const sellPrice = (parseFloat(buyPrice) * (1 + parseFloat(spreadBps) / 10000)).toFixed(2);
    const flashAmount = (Math.random() * 50 + 10).toFixed(2);
    const profit = (parseFloat(flashAmount) * parseFloat(spreadBps) / 10000).toFixed(4);
    const gas = (0.005 + Math.random() * 0.02).toFixed(4);
    const net = (parseFloat(profit) - parseFloat(gas)).toFixed(4);

    if (parseFloat(net) < parseFloat(config.minProfitThreshold)) continue;

    const confidence: ArbitrageOpportunity['confidence'] =
      parseFloat(net) > 0.1 ? 'high' : parseFloat(net) > 0.03 ? 'medium' : 'low';

    ops.push({
      id: `arb-${Date.now()}-${i}`,
      tokenIn: pair.tokenIn,
      tokenOut: pair.tokenOut,
      buyDex: pair.buyDex,
      sellDex: pair.sellDex,
      buyPrice,
      sellPrice,
      spread: `${spreadBps} bps`,
      estimatedProfit: `${profit} ETH`,
      estimatedGas: `${gas} ETH`,
      netProfit: `${net} ETH`,
      flashLoanAmount: `${flashAmount} ETH`,
      confidence,
      timestamp: Date.now(),
      status: 'detected',
    });
  }

  return ops;
}

const PROTOCOLS = ['aave', 'compound', 'maker'] as const;

function generateLiquidatablePositions(config: AgentConfig): LiquidatablePosition[] {
  const count = Math.floor(Math.random() * 3);
  const positions: LiquidatablePosition[] = [];

  for (let i = 0; i < count; i++) {
    const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
    if (!config.protocols.includes(protocol)) continue;

    const healthFactor = (0.8 + Math.random() * 0.4).toFixed(3);
    if (parseFloat(healthFactor) >= 1.0) continue;

    const collateral = (Math.random() * 20 + 5).toFixed(4);
    const debt = (Math.random() * 15 + 3).toFixed(4);
    const reward = (parseFloat(debt) * 0.05 + Math.random() * 0.01).toFixed(4);
    const gas = (0.003 + Math.random() * 0.01).toFixed(4);
    const net = (parseFloat(reward) - parseFloat(gas)).toFixed(4);

    if (parseFloat(net) < parseFloat(config.minLiquidationReward)) continue;

    positions.push({
      id: `liq-${Date.now()}-${i}`,
      protocol,
      borrower: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      collateralToken: 'ETH',
      debtToken: 'DAI',
      collateralAmount: `${collateral} ETH`,
      debtAmount: `${debt} DAI`,
      healthFactor,
      liquidationThreshold: '1.0',
      estimatedReward: `${reward} ETH`,
      estimatedGas: `${gas} ETH`,
      netReward: `${net} ETH`,
      status: 'available',
      timestamp: Date.now(),
    });
  }

  return positions;
}

export function startAgent(
  config: AgentConfig,
  callbacks: {
    onLog: (log: AgentLog) => void;
    onOpportunities: (ops: ArbitrageOpportunity[]) => void;
    onLiquidations: (positions: LiquidatablePosition[]) => void;
    onStats: (stats: Record<string, unknown>) => void;
  }
): void {
  if (agentInterval) stopAgent();

  logCallback = callbacks.onLog;
  opportunityCallback = callbacks.onOpportunities;
  liquidationCallback = callbacks.onLiquidations;
  statsCallback = callbacks.onStats;
  startTime = Date.now();

  let totalTrades = 0;
  let successfulTrades = 0;
  let failedTrades = 0;
  let totalProfit = 0;
  let totalGas = 0;

  logCallback(createLog('info', 'Agent started', 'Initializing arbitrage scanner and liquidation monitor...'));
  logCallback(createLog('info', 'Configuration loaded', `Arbitrage: ${config.arbitrageEnabled ? 'ON' : 'OFF'} | Liquidation: ${config.liquidationEnabled ? 'ON' : 'OFF'} | Max Gas: ${config.maxGasPrice} gwei`));
  logCallback(createLog('info', 'Connecting to DeFi protocols', `Monitoring: ${config.protocols.join(', ').toUpperCase()}`));

  agentInterval = setInterval(() => {
    const cycle = Math.random();

    if (config.arbitrageEnabled && cycle < 0.4) {
      const ops = generateArbitrageOpportunities(config);
      if (ops.length > 0) {
        opportunityCallback?.(ops);
        logCallback?.(createLog('info', `Found ${ops.length} arbitrage opportunit${ops.length === 1 ? 'y' : 'ies'}`, ops.map(o => `${o.tokenIn}/${o.tokenOut} on ${o.buyDex}→${o.sellDex}: ${o.netProfit}`).join('\n')));

        if (config.autoExecute) {
          for (const op of ops) {
            if (op.confidence === 'high') {
              totalTrades++;
              const success = Math.random() > 0.15;
              if (success) {
                successfulTrades++;
                const profit = parseFloat(op.netProfit);
                totalProfit += profit;
                totalGas += parseFloat(op.estimatedGas);
                const fakeTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
                logCallback?.(createLog('success', `Arbitrage executed: ${op.tokenIn}/${op.tokenOut}`, `Profit: ${op.netProfit} | Flash loan: ${op.flashLoanAmount}`, fakeTxHash));
              } else {
                failedTrades++;
                logCallback?.(createLog('error', `Arbitrage failed: ${op.tokenIn}/${op.tokenOut}`, 'Transaction reverted - price moved during execution'));
              }
            }
          }
        }
      }
    }

    if (config.liquidationEnabled && cycle >= 0.4 && cycle < 0.7) {
      const positions = generateLiquidatablePositions(config);
      if (positions.length > 0) {
        liquidationCallback?.(positions);
        logCallback?.(createLog('warning', `Found ${positions.length} liquidatable position${positions.length === 1 ? '' : 's'}`, positions.map(p => `${p.protocol.toUpperCase()}: HF=${p.healthFactor} | Reward: ${p.estimatedReward}`).join('\n')));

        if (config.autoExecute) {
          for (const pos of positions) {
            totalTrades++;
            const success = Math.random() > 0.2;
            if (success) {
              successfulTrades++;
              const reward = parseFloat(pos.netReward);
              totalProfit += reward;
              totalGas += parseFloat(pos.estimatedGas);
              const fakeTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
              logCallback?.(createLog('success', `Liquidation executed on ${pos.protocol.toUpperCase()}`, `Reward: ${pos.netReward} | Borrower: ${pos.borrower.slice(0, 10)}...`, fakeTxHash));
            } else {
              failedTrades++;
              logCallback?.(createLog('error', `Liquidation failed on ${pos.protocol.toUpperCase()}`, 'Position already liquidated by another bot'));
            }
          }
        }
      }
    }

    if (cycle >= 0.7) {
      const messages = [
        'Scanning mempool for arbitrage opportunities...',
        'Monitoring health factors across lending protocols...',
        'Checking gas prices for optimal execution...',
        'Analyzing DEX price feeds...',
        'Updating token price oracles...',
        'Evaluating flash loan pool liquidity...',
      ];
      logCallback?.(createLog('info', messages[Math.floor(Math.random() * messages.length)]));
    }

    statsCallback?.({
      totalTrades,
      successfulTrades,
      failedTrades,
      totalProfit: totalProfit.toFixed(4),
      totalGasSpent: totalGas.toFixed(4),
      netProfit: (totalProfit - totalGas).toFixed(4),
      uptime: Date.now() - startTime,
      isRunning: true,
    });
  }, 3000 + Math.random() * 2000);
}

export function stopAgent(): void {
  if (agentInterval) {
    clearInterval(agentInterval);
    agentInterval = null;
  }
  logCallback?.(createLog('info', 'Agent stopped', 'All monitoring and scanning paused'));
  statsCallback?.({ isRunning: false });
}

export function isAgentRunning(): boolean {
  return agentInterval !== null;
}
