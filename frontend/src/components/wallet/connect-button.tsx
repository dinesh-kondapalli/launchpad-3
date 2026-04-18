"use client";

import { useState } from "react";
import { Wallet } from "@phosphor-icons/react";
import { useWalletStore } from "@/stores/wallet-store";
import { Button } from "@/components/ui/button";
import { WalletSelector } from "@/components/wallet/wallet-selector";
import { AccountDisplay } from "@/components/wallet/account-display";

interface ConnectButtonProps {
  label?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  showIcon?: boolean;
}

export function ConnectButton({
  label = "Connect Wallet",
  className,
  variant = "default",
  showIcon = true,
}: ConnectButtonProps = {}) {
  const address = useWalletStore((s) => s.address);
  const isConnecting = useWalletStore((s) => s.isConnecting);
  const [selectorOpen, setSelectorOpen] = useState(false);

  if (address) {
    return <AccountDisplay />;
  }

  return (
    <WalletSelector
      open={selectorOpen}
      onOpenChange={setSelectorOpen}
      trigger={
        <Button
          onClick={() => setSelectorOpen(true)}
          disabled={isConnecting}
          variant={variant}
          className={className}
        >
          {showIcon ? <Wallet size={16} weight="fill" /> : null}
          {isConnecting ? "Connecting..." : label}
        </Button>
      }
    />
  );
}
