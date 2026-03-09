import { create } from 'zustand';
import type {
  WalletState,
  DSAAccount,
  ArbitrageOpportunity,
  LiquidatablePosition,
  AgentConfig,
  AgentLog,
  AgentStats,
  Page,
} from '@/types';

interface AppStore {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;

  wallet: WalletState;
  setWallet: (wallet: Partial<WalletState>) => void;

  dsaAccounts: DSAAccount[];
  activeDSA: DSAAccount | null;
  setDSAAccounts: (accounts: DSAAccount[]) => void;
  setActiveDSA: (account: DSAAccount | null) => void;

  arbitrageOpportunities: ArbitrageOpportunity[];
  setArbitrageOpportunities: (ops: ArbitrageOpportunity[]) => void;
  updateArbitrageOpportunity: (id: string, update: Partial<ArbitrageOpportunity>) => void;

  liquidatablePositions: LiquidatablePosition[];
  setLiquidatablePositions: (positions: LiquidatablePosition[]) => void;
  updateLiquidatablePosition: (id: string, update: Partial<LiquidatablePosition>) => void;

  agentConfig: AgentConfig;
  setAgentConfig: (config: Partial<AgentConfig>) => void;

  agentLogs: AgentLog[];
  addAgentLog: (log: AgentLog) => void;
  clearAgentLogs: () => void;

  agentStats: AgentStats;
  setAgentStats: (stats: Partial<AgentStats>) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<AppStore>((set) => ({
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  wallet: {
    address: null,
    chainId: null,
    balance: '0',
    isConnected: false,
    isConnecting: false,
  },
  setWallet: (wallet) =>
    set((state) => ({ wallet: { ...state.wallet, ...wallet } })),

  dsaAccounts: [],
  activeDSA: null,
  setDSAAccounts: (accounts) => set({ dsaAccounts: accounts }),
  setActiveDSA: (account) => set({ activeDSA: account }),

  arbitrageOpportunities: [],
  setArbitrageOpportunities: (ops) => set({ arbitrageOpportunities: ops }),
  updateArbitrageOpportunity: (id, update) =>
    set((state) => ({
      arbitrageOpportunities: state.arbitrageOpportunities.map((op) =>
        op.id === id ? { ...op, ...update } : op
      ),
    })),

  liquidatablePositions: [],
  setLiquidatablePositions: (positions) => set({ liquidatablePositions: positions }),
  updateLiquidatablePosition: (id, update) =>
    set((state) => ({
      liquidatablePositions: state.liquidatablePositions.map((pos) =>
        pos.id === id ? { ...pos, ...update } : pos
      ),
    })),

  agentConfig: {
    arbitrageEnabled: true,
    liquidationEnabled: true,
    maxGasPrice: '50',
    minProfitThreshold: '0.01',
    minLiquidationReward: '0.005',
    protocols: ['aave', 'compound'],
    autoExecute: false,
    slippageTolerance: '0.5',
  },
  setAgentConfig: (config) =>
    set((state) => ({ agentConfig: { ...state.agentConfig, ...config } })),

  agentLogs: [],
  addAgentLog: (log) =>
    set((state) => ({
      agentLogs: [log, ...state.agentLogs].slice(0, 500),
    })),
  clearAgentLogs: () => set({ agentLogs: [] }),

  agentStats: {
    totalTrades: 0,
    successfulTrades: 0,
    failedTrades: 0,
    totalProfit: '0',
    totalGasSpent: '0',
    netProfit: '0',
    uptime: 0,
    isRunning: false,
  },
  setAgentStats: (stats) =>
    set((state) => ({ agentStats: { ...state.agentStats, ...stats } })),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
