"use client";

import { useTokenHolders } from "@/hooks/use-token-holders";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_TOKEN_SUPPLY } from "@/lib/chain-config";

interface TokenHoldersProps {
  tokenAddress: string;
  tokenSymbol: string;
}

const DEFAULT_TOKEN_SUPPLY_MICRO = DEFAULT_TOKEN_SUPPLY * 1_000_000;

export function TokenHolders({ tokenAddress, tokenSymbol }: TokenHoldersProps) {
  const { data: holders, isLoading } = useTokenHolders(tokenAddress);

  return (
    <div className="h-full">
      <h2 className="mb-3 text-lg font-semibold text-foreground">
        Holders
        {holders && holders.length > 0 && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({holders.length})
          </span>
        )}
      </h2>
      <div className="min-h-[22rem] overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border bg-background/80">
                <th className="w-10 px-4 py-3 text-left font-medium text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Address
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Balance
                </th>
                <th className="w-20 px-4 py-3 text-right font-medium text-muted-foreground">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24 ml-auto" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-12 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {!isLoading && holders && holders.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No holders yet
                  </td>
                </tr>
              )}

              {holders?.map((holder, i) => {
                const pct =
                  (Number(holder.balance) / DEFAULT_TOKEN_SUPPLY_MICRO) * 100;
                return (
                  <tr
                    key={holder.address}
                    className="border-b border-border transition-colors hover:bg-accent/40"
                  >
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {truncateAddress(holder.address)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                      {formatBalance(holder.balance)} {tokenSymbol}
                    </td>
                    <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                      {pct < 0.01 ? "<0.01" : pct.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatBalance(micro: string): string {
  const num = Number(micro) / 1_000_000;
  if (num === 0) return "0";
  if (num < 0.01) return num.toExponential(2);
  if (num < 1000) return num.toFixed(2);
  if (num < 1_000_000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1_000_000).toFixed(2)}M`;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 20) return addr;
  return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
}
