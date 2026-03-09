export interface WalletState {
  address: string | null;
  chainId: number | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
}

export interface DSAAccount {
  id: number;
  address: string;
  version: number;
}

export interface TokenBalance {
  symbol: string;
  name: string;
  address: string;
  balance: string;
  balanceUSD: string;
  decimals: number;
  icon?: string;
}

export interface ArbitrageOpportunity {
  id: string;
  tokenIn: string;
  tokenOut: string;
  buyDex: string;
  sellDex: string;
  buyPrice: string;
  sellPrice: string;
  spread: string;
  estimatedProfit: string;
  estimatedGas: string;
  netProfit: string;
  flashLoanAmount: string;
  confidence: 'high' | 'medium' | 'low';
  timestamp: number;
  status: 'detected' | 'executing' | 'completed' | 'failed';
}

export interface LiquidatablePosition {
  id: string;
  protocol: 'aave' | 'compound' | 'maker';
  borrower: string;
  collateralToken: string;
  debtToken: string;
  collateralAmount: string;
  debtAmount: string;
  healthFactor: string;
  liquidationThreshold: string;
  estimatedReward: string;
  estimatedGas: string;
  netReward: string;
  status: 'available' | 'executing' | 'completed' | 'missed';
  timestamp: number;
}

export interface AgentConfig {
  arbitrageEnabled: boolean;
  liquidationEnabled: boolean;
  maxGasPrice: string;
  minProfitThreshold: string;
  minLiquidationReward: string;
  protocols: string[];
  autoExecute: boolean;
  slippageTolerance: string;
}

export interface AgentLog {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'trade';
  message: string;
  details?: string;
  txHash?: string;
}

export interface AgentStats {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfit: string;
  totalGasSpent: string;
  netProfit: string;
  uptime: number;
  isRunning: boolean;
}

export type Page = 'dashboard' | 'arbitrage' | 'liquidation' | 'agent' | 'settings';
