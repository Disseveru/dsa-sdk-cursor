import { useState } from 'react';
import { Wallet, LogOut, ChevronDown, Copy, ExternalLink, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { connectWallet, disconnectWallet, onAccountsChanged, onChainChanged } from '@/services/wallet';
import { getDSAAccounts } from '@/services/dsa';
import { shortenAddress } from '@/utils/format';
import { CHAIN_NAMES } from '@/utils/constants';

export function ConnectButton() {
  const { wallet, setWallet, setDSAAccounts, setActiveDSA } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setError(null);
      setWallet({ isConnecting: true });

      const { address, chainId, balance } = await connectWallet();
      setWallet({ address, chainId, balance, isConnected: true, isConnecting: false });

      try {
        const accounts = await getDSAAccounts(address);
        setDSAAccounts(accounts);
        if (accounts.length > 0) {
          setActiveDSA(accounts[0]);
        }
      } catch {
        // DSA account fetch can fail silently - user can create one later
      }

      onAccountsChanged((accounts) => {
        const accs = accounts as string[];
        if (accs.length === 0) {
          handleDisconnect();
        } else {
          setWallet({ address: accs[0] });
        }
      });

      onChainChanged(() => {
        window.location.reload();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setWallet({ isConnecting: false });
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setWallet({
      address: null,
      chainId: null,
      balance: '0',
      isConnected: false,
      isConnecting: false,
    });
    setDSAAccounts([]);
    setActiveDSA(null);
    setShowDropdown(false);
  };

  const handleCopy = async () => {
    if (wallet.address) {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="relative">
        <button
          onClick={handleConnect}
          disabled={wallet.isConnecting}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {wallet.isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </>
          )}
        </button>
        {error && (
          <div className="absolute top-full right-0 mt-2 w-72 p-3 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red text-xs">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-4 py-2.5 glass-card-hover cursor-pointer"
      >
        <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
        <div className="text-left">
          <div className="text-sm font-medium text-white">
            {shortenAddress(wallet.address!)}
          </div>
          <div className="text-xs text-dark-300">
            {wallet.chainId ? CHAIN_NAMES[wallet.chainId] || `Chain ${wallet.chainId}` : ''}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-dark-300 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 glass-card p-3 z-50 animate-fade-in">
            <div className="px-3 py-2 mb-2">
              <div className="text-xs text-dark-300 mb-1">Balance</div>
              <div className="text-lg font-bold text-white">
                {parseFloat(wallet.balance).toFixed(4)} ETH
              </div>
            </div>
            <div className="border-t border-dark-600 my-2" />
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-700 transition-colors text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4 text-dark-300" />}
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
            <a
              href={`https://etherscan.io/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-700 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4 text-dark-300" />
              View on Explorer
            </a>
            <div className="border-t border-dark-600 my-2" />
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent-red/10 transition-colors text-sm text-accent-red"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
}
