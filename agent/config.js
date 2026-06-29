require('dotenv').config({ path: require('path').join(__dirname, '.env') })

const Web3 = require('web3')

const PRIVATE_KEY_ENV_KEYS = [
  'PRIVATE_KEY',
  'EOA_PRIVATE_KEY',
  'PRIVATE_KEY_2',
  'CDP_PRIVATE_KEY',
]

function resolvePrivateKey() {
  for (const key of PRIVATE_KEY_ENV_KEYS) {
    const raw = process.env[key]
    if (!raw) continue
    try {
      const pk = raw.startsWith('0x') ? raw : `0x${raw}`
      Web3.utils.toChecksumAddress(
        Web3.eth.accounts.privateKeyToAccount(pk).address
      )
      return pk
    } catch {
      // try next key
    }
  }
  return null
}

function addressFromPrivateKey(privateKey) {
  if (!privateKey) return null
  return Web3.eth.accounts.privateKeyToAccount(privateKey).address
}

const privateKey = resolvePrivateKey()

module.exports = {
  ethNodeUrl:
    process.env.ETH_NODE_URL ||
    process.env.MAINNET_RPC_URL ||
    'https://ethereum.publicnode.com',
  privateKey,
  publicAddress: process.env.PUBLIC_ADDRESS || addressFromPrivateKey(privateKey),
  dsaId: process.env.DSA_ID ? Number(process.env.DSA_ID) : null,

  scanIntervalMs: Number(process.env.SCAN_INTERVAL_MS || 30_000),
  minProfitUsd: Number(process.env.MIN_PROFIT_USD || 5),
  slippagePercent: Number(process.env.SLIPPAGE_PERCENT || 2),
  minBorrowDai: Number(process.env.MIN_BORROW_DAI || 20),
  dryRun: process.env.DRY_RUN !== 'false',
  enableArbitrage: process.env.ENABLE_ARBITRAGE !== 'false',
  enableLiquidations: process.env.ENABLE_LIQUIDATIONS !== 'false',
}
