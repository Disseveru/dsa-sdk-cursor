export const SUPPORTED_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
  { symbol: 'WETH', name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
  { symbol: 'LINK', name: 'Chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18 },
  { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18 },
  { symbol: 'AAVE', name: 'Aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18 },
  { symbol: 'COMP', name: 'Compound', address: '0xc00e94Cb662C3520282E6f5717214004A7f26888', decimals: 18 },
];

export const SUPPORTED_PROTOCOLS = [
  { id: 'aave', name: 'Aave V2', icon: '🏦', color: '#B6509E' },
  { id: 'compound', name: 'Compound', icon: '🟢', color: '#00D395' },
  { id: 'maker', name: 'MakerDAO', icon: '🏭', color: '#1AAB9B' },
];

export const SUPPORTED_DEXES = [
  { id: 'uniswap', name: 'Uniswap', connector: 'uniswap' },
  { id: '1inch', name: '1inch', connector: 'oneInch' },
  { id: 'kyber', name: 'Kyber', connector: 'kyber' },
  { id: 'oasis', name: 'Oasis', connector: 'oasis' },
  { id: 'curve', name: 'Curve', connector: 'curve' },
];

export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Goerli Testnet',
  137: 'Polygon',
  42161: 'Arbitrum One',
  10: 'Optimism',
};

export const DSA_CONNECTORS = {
  BASIC: 'basic',
  AUTH: 'auth',
  COMPOUND: 'compound',
  MAKER: 'maker',
  AAVE: 'aave',
  AAVE_V2: 'aave_v2',
  INSTAPOOL: 'instapool',
  INSTAPOOL_V2: 'instapool_v2',
  UNISWAP: 'uniswap',
  ONE_INCH: 'oneInch',
  KYBER: 'kyber',
  OASIS: 'oasis',
  CURVE: 'curve',
  DYDX: 'dydx',
  DYDX_FLASH: 'dydx_flash',
} as const;
