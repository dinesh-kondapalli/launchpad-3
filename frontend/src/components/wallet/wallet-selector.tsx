"use client";

import { useCallback, useState, type ReactNode } from "react";
import { isKeplrAvailable, isLeapAvailable, isBwickWalletAvailable, type WalletType } from "@bwick-chain/sdk";
import { useWalletStore } from "@/stores/wallet-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface WalletSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
}

export function WalletSelector({ open, onOpenChange, trigger }: WalletSelectorProps) {
  const connect = useWalletStore((s) => s.connect);
  const isConnecting = useWalletStore((s) => s.isConnecting);
  const error = useWalletStore((s) => s.error);

  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState("");

  const keplrAvailable = open && isKeplrAvailable();
  const leapAvailable = open && isLeapAvailable();
  const bwickAvailable = open && isBwickWalletAvailable();

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setShowMnemonic(false);
        setMnemonic("");
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const handleConnect = useCallback(
    async (type: WalletType, mnemonicValue?: string) => {
      await connect(type, mnemonicValue);
      const state = useWalletStore.getState();
      if (!state.error) {
        onOpenChange(false);
      }
    },
    [connect, onOpenChange]
  );

  const handleDirectConnect = useCallback(async () => {
    if (!mnemonic.trim()) return;
    await handleConnect("direct", mnemonic.trim());
  }, [mnemonic, handleConnect]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem]">
        <div className="mb-4 space-y-1">
          <h3 className="text-base font-semibold text-foreground">Connect Wallet</h3>
          <p className="text-sm text-muted-foreground">Select a wallet to connect to new network.</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="lg"
            className="justify-between h-14 text-base"
            disabled={!keplrAvailable || isConnecting}
            onClick={() => handleConnect("keplr")}
          >
            <span>Keplr</span>
            {!keplrAvailable && (
              <span className="text-xs text-muted-foreground">Not installed</span>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="justify-between h-14 text-base"
            disabled={!leapAvailable || isConnecting}
            onClick={() => handleConnect("leap")}
          >
            <span>Leap</span>
            {!leapAvailable && (
              <span className="text-xs text-muted-foreground">Not installed</span>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="justify-between h-14 text-base"
            disabled={!bwickAvailable || isConnecting}
            onClick={() => handleConnect("bwick")}
          >
            <span>new Wallet</span>
            {!bwickAvailable && (
              <span className="text-xs text-muted-foreground">Not installed</span>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {!showMnemonic ? (
            <Button
              variant="outline"
              size="lg"
              className="justify-between h-14 text-base"
              disabled={isConnecting}
              onClick={() => setShowMnemonic(true)}
            >
              <span>Test Wallet</span>
              <span className="text-xs text-muted-foreground">Mnemonic</span>
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                rows={3}
                placeholder="Enter mnemonic phrase..."
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                disabled={isConnecting}
              />
              <Button
                size="sm"
                disabled={!mnemonic.trim() || isConnecting}
                onClick={handleDirectConnect}
              >
                Connect
              </Button>
            </div>
          )}
        </div>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        {isConnecting && (
          <p className="text-center text-sm text-muted-foreground">
            Connecting...
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
