import { ethers } from 'ethers';
import { getProvider, getSigner } from './wallet';
import type { DSAAccount } from '@/types';

const INDEX_CONTRACT = '0x2971AdFa57b20E5a416aE5a708A8655A9c74f723';
const LIST_CONTRACT = '0x4c8a1BEb8a87765788946D6B19C6C6355194AbEb';

const INDEX_ABI = [
  'function build(address _owner, uint accountVersion, address _origin) external returns (address _account)',
  'event LogAccountCreated(address indexed sender, address indexed owner, address indexed account, address origin)',
];

const LIST_ABI = [
  'function accounts() external view returns (uint64)',
  'function accountID(address) external view returns (uint64)',
  'function accountAddr(uint64) external view returns (address)',
  'function userLink(address) external view returns (uint64 first, uint64 last, uint64 count)',
  'function userList(address, uint64) external view returns (uint64 prev, uint64 next)',
];

const ACCOUNT_ABI = [
  'function cast(address[] calldata _targets, bytes[] calldata _datas, address _origin) external payable returns (bytes32)',
  'function version() external view returns (uint)',
];

export async function getDSAAccounts(userAddress: string): Promise<DSAAccount[]> {
  const provider = getProvider();
  if (!provider) throw new Error('Wallet not connected');

  const listContract = new ethers.Contract(LIST_CONTRACT, LIST_ABI, provider);

  try {
    const userLink = await listContract.userLink(userAddress);
    const count = userLink.count.toNumber();
    const accounts: DSAAccount[] = [];

    if (count === 0) return accounts;

    let currentId = userLink.first.toNumber();
    for (let i = 0; i < count; i++) {
      const address = await listContract.accountAddr(currentId);
      accounts.push({ id: currentId, address, version: 2 });
      if (i < count - 1) {
        const link = await listContract.userList(userAddress, currentId);
        currentId = link.next.toNumber();
      }
    }

    return accounts;
  } catch {
    return [];
  }
}

export async function buildDSA(origin: string = ethers.constants.AddressZero): Promise<string> {
  const signer = getSigner();
  if (!signer) throw new Error('Wallet not connected');

  const indexContract = new ethers.Contract(INDEX_CONTRACT, INDEX_ABI, signer);
  const ownerAddress = await signer.getAddress();

  const tx = await indexContract.build(ownerAddress, 2, origin);
  const receipt = await tx.wait();

  const event = receipt.events?.find(
    (e: ethers.Event) => e.event === 'LogAccountCreated'
  );

  return event?.args?.account || '';
}

export interface Spell {
  connector: string;
  method: string;
  args: unknown[];
}

const CONNECTOR_ADDRESSES: Record<string, string> = {
  basic: '0xe5398f279175962E56fE4c5E0b62dc7208EF36c6',
  auth: '0xd1aFF9f2aCf800C876c409100D6F39AEa93Fc3D9',
  compound: '0x33d4876A16F712f1a305C5594A5AdeDc9b7A9f14',
  aave: '0x01d0734e34B0251f46aD34d1a82c4946a5B943D9',
  aave_v2: '0x497C3765C3e84B1a5589aAb6B67D4B5C7F31e872',
  maker: '0x7c5A9bF80E5d5e4B977016e33A5f4FEb5303C23C',
  instapool: '0x06Af96BbfF1f1a36fC5E02bBf1d6A5E9C0Eb7DbE',
  instapool_v2: '0xc7bfE13D7C80d3b4E5D78B6B0795c6b7c2a6dC30',
  uniswap: '0x62EbfF47B2Ba3e47796efaE7C51676762dC961c0',
  oneInch: '0xB4B3C1a34aA3B2Cf5368AcE9204B1CC44c53F110',
  kyber: '0x7043FC2E21865c091EEae37C38E3d78B9101E1A2',
  oasis: '0xFc7e424C58c21b4B59A78050dB7Cc27B09DE6b08',
  curve: '0x72fBaDC0C78e0BBeda2AaEf57A6CB6f9D1E2a4b1',
  dydx: '0x6AF6C791c869DfA65f8A2fa042fA47D1535Bef25',
  dydx_flash: '0x4C618fDaeBCe3ED1c27C0F676693BcAd4C4D671c',
};

const CONNECTOR_ABIS: Record<string, string[]> = {
  basic: [
    'function deposit(address,uint256,uint256,uint256) external payable',
    'function withdraw(address,uint256,address,uint256,uint256) external payable',
  ],
  compound: [
    'function deposit(address,uint256,uint256,uint256) external payable',
    'function withdraw(address,uint256,uint256,uint256) external payable',
    'function borrow(address,uint256,uint256,uint256) external payable',
    'function payback(address,uint256,uint256,uint256) external payable',
    'function liquidate(address,address,address,uint256,uint256,uint256) external payable',
  ],
  aave_v2: [
    'function deposit(address,uint256,uint256,uint256) external payable',
    'function withdraw(address,uint256,uint256,uint256) external payable',
    'function borrow(address,uint256,uint256,uint256,uint256) external payable',
    'function payback(address,uint256,uint256,uint256,uint256) external payable',
  ],
  instapool_v2: [
    'function flashBorrow(address,uint256,uint256,bytes) external payable',
    'function flashPayback(address,uint256,uint256,uint256) external payable',
  ],
  uniswap: [
    'function sell(address,address,uint256,uint256,uint256,uint256) external payable',
    'function buy(address,address,uint256,uint256,uint256,uint256) external payable',
  ],
};

export function encodeSpell(spell: Spell): { target: string; data: string } {
  const target = CONNECTOR_ADDRESSES[spell.connector];
  if (!target) throw new Error(`Unknown connector: ${spell.connector}`);

  const abi = CONNECTOR_ABIS[spell.connector];
  if (!abi) throw new Error(`No ABI for connector: ${spell.connector}`);

  const iface = new ethers.utils.Interface(abi);
  const data = iface.encodeFunctionData(spell.method, spell.args);

  return { target, data };
}

export function encodeSpells(spells: Spell[]): [string[], string[]] {
  const targets: string[] = [];
  const datas: string[] = [];

  for (const spell of spells) {
    const encoded = encodeSpell(spell);
    targets.push(encoded.target);
    datas.push(encoded.data);
  }

  return [targets, datas];
}

export async function castSpells(
  dsaAddress: string,
  spells: Spell[],
  origin: string = ethers.constants.AddressZero,
  value: ethers.BigNumber = ethers.BigNumber.from(0)
): Promise<ethers.ContractTransaction> {
  const signer = getSigner();
  if (!signer) throw new Error('Wallet not connected');

  const [targets, datas] = encodeSpells(spells);
  const accountContract = new ethers.Contract(dsaAddress, ACCOUNT_ABI, signer);

  const gasEstimate = await accountContract.estimateGas.cast(targets, datas, origin, {
    value,
  });

  const tx = await accountContract.cast(targets, datas, origin, {
    value,
    gasLimit: gasEstimate.mul(120).div(100),
  });

  return tx;
}

export function buildFlashLoanArbitrageSpells(
  tokenAddress: string,
  borrowAmount: string,
  buyDexConnector: string,
  sellDexConnector: string,
  tokenIn: string,
  tokenOut: string,
): Spell[] {
  const amountWei = ethers.utils.parseEther(borrowAmount);

  return [
    {
      connector: 'instapool_v2',
      method: 'flashBorrow',
      args: [tokenAddress, amountWei, 0, '0x'],
    },
    {
      connector: buyDexConnector,
      method: 'sell',
      args: [tokenOut, tokenIn, amountWei, 0, 0, 0],
    },
    {
      connector: sellDexConnector,
      method: 'sell',
      args: [tokenIn, tokenOut, ethers.constants.MaxUint256, 0, 0, 0],
    },
    {
      connector: 'instapool_v2',
      method: 'flashPayback',
      args: [tokenAddress, amountWei, 0, 0],
    },
  ];
}

export function buildLiquidationSpells(
  protocol: 'compound' | 'aave',
  borrowerAddress: string,
  debtTokenAddress: string,
  collateralTokenAddress: string,
  repayAmount: string,
): Spell[] {
  const amountWei = ethers.utils.parseEther(repayAmount);

  const liquidationSpell: Spell = protocol === 'compound'
    ? {
        connector: 'compound',
        method: 'liquidate',
        args: [borrowerAddress, collateralTokenAddress, debtTokenAddress, amountWei, 0, 0],
      }
    : {
        connector: 'aave_v2',
        method: 'deposit',
        args: [collateralTokenAddress, amountWei, 0, 0],
      };

  return [
    {
      connector: 'instapool_v2',
      method: 'flashBorrow',
      args: [debtTokenAddress, amountWei, 0, '0x'],
    },
    liquidationSpell,
    {
      connector: 'instapool_v2',
      method: 'flashPayback',
      args: [debtTokenAddress, amountWei, 0, 0],
    },
  ];
}
