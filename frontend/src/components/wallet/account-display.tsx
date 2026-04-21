"use client";

import { useCallback } from "react";
import { useWalletStore } from "@/stores/wallet-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NATIVE_SYMBOL } from "@/lib/chain-config";

function truncateAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function AccountDisplay() {
  const address = useWalletStore((s) => s.address);
  const balance = useWalletStore((s) => s.balance);
  const walletType = useWalletStore((s) => s.walletType);
  const disconnect = useWalletStore((s) => s.disconnect);

  const handleCopyAddress = useCallback(async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
    }
  }, [address]);

  if (!address) return null;

  const walletName =
    walletType === "keplr"
      ? "Keplr"
      : walletType === "leap"
        ? "Leap"
        : walletType === "xyz"
          ? "XYZ Wallet"
          : "Direct";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="font-mono text-sm text-foreground">
          <span>{truncateAddress(address)}</span>
          {balance && (
            <>
              <span className="mx-1.5 text-border">|</span>
              <span>{balance} {NATIVE_SYMBOL}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Connected via {walletName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyAddress}>
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={disconnect}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
