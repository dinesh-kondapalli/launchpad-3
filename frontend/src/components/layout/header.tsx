"use client";

import Link from "next/link";
import { ConnectButton } from "@/components/wallet/connect-button";

export function Header() {
  return (
    <header className="bg-background/95">
      <div className="flex min-h-10 w-full items-start justify-between gap-3 px-3 py-2 text-[13px] sm:px-4 sm:text-sm">
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 font-bold leading-none text-foreground" aria-label="Primary">
          <Link href="/" className="text-primary hover:underline">[home]</Link>
          <Link href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">[twitter]</Link>
          <Link href="https://t.me" target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">[telegram]</Link>
          <Link href="/docs" className="hover:text-primary hover:underline">[how it works]</Link>
        </nav>

        <nav className="flex items-center justify-end gap-2">
            <ConnectButton
              label="connect wallet"
              variant="outline"
              showIcon={false}
              className="h-auto rounded-none border-0 bg-transparent p-0 text-[13px] font-bold leading-none text-foreground shadow-none hover:bg-transparent hover:text-primary sm:text-sm"
            />
        </nav>
      </div>
    </header>
  );
}
