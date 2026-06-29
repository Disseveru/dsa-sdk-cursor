require('dotenv').config({ path: require('path').join(__dirname, '.env') })

module.exports = {
  ethNodeUrl: process.env.ETH_NODE_URL || 'https://eth.llamarpc.com',
  privateKey: process.env.PRIVATE_KEY,
  publicAddress: process.env.PUBLIC_ADDRESS,
  dsaId: process.env.DSA_ID ? Number(process.env.DSA_ID) : null,

  scanIntervalMs: Number(process.env.SCAN_INTERVAL_MS || 30_000),
  minProfitUsd: Number(process.env.MIN_PROFIT_USD || 5),
  slippagePercent: Number(process.env.SLIPPAGE_PERCENT || 2),
  minBorrowDai: Number(process.env.MIN_BORROW_DAI || 20),
  dryRun: process.env.DRY_RUN !== 'false',
  enableArbitrage: process.env.ENABLE_ARBITRAGE !== 'false',
  enableLiquidations: process.env.ENABLE_LIQUIDATIONS !== 'false',
}
