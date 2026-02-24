'use client';

import { useState, useEffect } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { getWalletService, type WalletConnectionState } from '@/lib/hedera';

export function WalletConnect() {
  const [walletState, setWalletState] = useState<WalletConnectionState>({
    isConnected: false,
    accountId: null,
    network: 'testnet',
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const walletService = getWalletService();

  useEffect(() => {
    // Update state from wallet service on mount
    setWalletState(walletService.getState());
  }, [walletService]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const state = await walletService.connect();
      setWalletState(state);
    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to connect wallet. Please make sure you have a Hedera wallet extension installed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await walletService.disconnect();
      setWalletState({
        isConnected: false,
        accountId: null,
        network: 'testnet',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  if (walletState.isConnected && walletState.accountId) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
          {walletState.accountId}
        </div>
        <button
          onClick={handleDisconnect}
          className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-accent transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
