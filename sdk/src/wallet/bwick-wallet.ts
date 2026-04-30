import type { WalletConnection } from "./types.js";
import { getBwickChainInfo } from "./chain-info.js";
import { isBwickWalletAvailable } from "./detect.js";

export interface ConnectBwickWalletOptions {
  chainId?: string;
  rpcEndpoint: string;
  restEndpoint?: string;
  suggestChain?: boolean; // Auto-suggest BWICK chain if not configured (default: true)
}

/**
 * Connect to BWICK Wallet
 * Prompts user to approve connection each time (no auto-reconnect)
 */
export async function connectBwickWallet(options: ConnectBwickWalletOptions): Promise<WalletConnection> {
  if (!isBwickWalletAvailable()) {
    throw new Error("BWICK Wallet not found. Please install the BWICK Wallet extension.");
  }

  const wallet = window.bwick!;
  const chainId = options.chainId ?? "bwick-1";
  const restEndpoint = options.restEndpoint ?? options.rpcEndpoint.replace(/:\d+$/, ":1317");

  // Try to suggest chain if not already configured
  if (options.suggestChain !== false) {
    try {
      const chainInfo = getBwickChainInfo(options.rpcEndpoint, restEndpoint, chainId);
      await wallet.experimentalSuggestChain(chainInfo);
    } catch (error) {
      // Chain may already be registered, continue
      console.debug("Chain suggestion failed (may already exist):", error);
    }
  }

  // Enable chain - this prompts user for approval
  await wallet.enable(chainId);

  // Get signer
  const signer = await wallet.getOfflineSignerAuto(chainId);
  const accounts = await signer.getAccounts();

  if (accounts.length === 0) {
    throw new Error("No accounts found in BWICK Wallet");
  }

  return {
    type: "bwick",
    address: accounts[0].address,
    signer,
    disconnect: () => {
      // BWICK Wallet doesn't have a disconnect method
      // Connection is per-session anyway
    },
  };
}

export const BWICK_WALLET_ICON = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#0066FF"/><text x="20" y="26" text-anchor="middle" fill="white" font-family="system-ui" font-weight="700" font-size="13">BW</text></svg>`;
