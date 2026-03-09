import { ethers } from 'ethers';

let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;

export async function connectWallet(): Promise<{
  address: string;
  chainId: number;
  balance: string;
}> {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('No wallet detected. Please install MetaMask or another Web3 wallet.');
  }

  const accounts = (await window.ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];

  provider = new ethers.providers.Web3Provider(window.ethereum as ethers.providers.ExternalProvider);
  signer = provider.getSigner();

  const address = accounts[0];
  const network = await provider.getNetwork();
  const balance = await provider.getBalance(address);

  return {
    address,
    chainId: network.chainId,
    balance: ethers.utils.formatEther(balance),
  };
}

export async function disconnectWallet(): Promise<void> {
  provider = null;
  signer = null;
}

export function getProvider(): ethers.providers.Web3Provider | null {
  return provider;
}

export function getSigner(): ethers.Signer | null {
  return signer;
}

export async function getBalance(address: string): Promise<string> {
  if (!provider) throw new Error('Wallet not connected');
  const balance = await provider.getBalance(address);
  return ethers.utils.formatEther(balance);
}

export async function getGasPrice(): Promise<string> {
  if (!provider) throw new Error('Wallet not connected');
  const gasPrice = await provider.getGasPrice();
  return ethers.utils.formatUnits(gasPrice, 'gwei');
}

export function onAccountsChanged(callback: (accounts: string[]) => void): void {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', ((...args: unknown[]) => callback(args[0] as string[])) as (...args: unknown[]) => void);
  }
}

export function onChainChanged(callback: (chainId: string) => void): void {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', ((...args: unknown[]) => callback(args[0] as string)) as (...args: unknown[]) => void);
  }
}

export function removeListeners(): void {
  if (window.ethereum) {
    window.ethereum.removeAllListeners?.('accountsChanged');
    window.ethereum.removeAllListeners?.('chainChanged');
  }
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeAllListeners?: (event: string) => void;
      isMetaMask?: boolean;
    };
  }
}
