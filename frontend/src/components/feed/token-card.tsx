"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";
import type { TokenListItem } from "@/lib/api";
import { useCurveProgress } from "@/hooks/use-curve-progress";
import { useBwickPrice } from "@/hooks/use-bwick-price";
import { DEFAULT_TOKEN_SUPPLY } from "@/lib/chain-config";
import { formatUsd } from "@/lib/utils";

interface TokenCardProps {
  token: TokenListItem;
}

export function TokenCard({ token }: TokenCardProps) {
  const { data: progress } = useCurveProgress(token.address);
  const { bwickPriceUsd } = useBwickPrice();

  const progressValue = token.graduated ? 100 : progress ? Math.min(100, progress.progress_percent) : 0;

  return (
    <Link href={`/token/${token.address}`} className="block w-full touch-manipulation">
      <article className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative aspect-square w-full overflow-hidden border-b border-border bg-muted">
          {token.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={token.image}
              alt={token.symbol ?? "token"}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-primary/45">
              {(token.symbol ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          {token.graduated && (
            <span className="absolute right-2 top-2 rounded-sm border border-primary/20 bg-primary/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-foreground">
              Live
            </span>
          )}
        </div>

        <div className="space-y-3 p-3">
          <div>
            <p className="truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Created: {truncate(token.creator ?? token.address, 6)}
            </p>
            <p className="truncate pt-1 text-xl font-bold leading-tight text-foreground">
              {token.name ?? "Unknown Token"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{token.description ?? "No description"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Market Cap</p>
            <p className="font-mono text-sm font-semibold text-primary">{formatMarketCap(token, bwickPriceUsd)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              <span>{token.graduated ? "Listed" : "Seeding"}</span>
              <span>{progressValue.toFixed(0)}%</span>
            </div>
            <Progress
              value={progressValue}
            className="h-1 rounded-sm bg-muted [&>[data-slot=progress-indicator]]:bg-primary"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
            <span>{formatAge(token)}</span>
            <span className="font-mono text-foreground">{formatPrice(token.current_price, bwickPriceUsd)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function formatPrice(priceBwick: string, bwickPriceUsd: number): string {
  const usd = Number(priceBwick) * bwickPriceUsd;
  return formatUsd(usd);
}

function formatMarketCap(token: TokenListItem, bwickPriceUsd: number): string {
  const priceBwick = Number(token.current_price || "0");
  const totalSupplyTokens = DEFAULT_TOKEN_SUPPLY;
  const mcapUsd = priceBwick * totalSupplyTokens * bwickPriceUsd;
  return formatUsd(mcapUsd);
}

function formatAge(token: TokenListItem): string {
  if (token.created_height) return `Block ${token.created_height}`;
  const dateStr = token.first_seen_at;
  if (!dateStr) return "Awaiting block time";
  const date = new Date(dateStr);
  if (isNaN(date.getTime()) || date.getTime() < 86400000) return "just now";
  return formatDistanceToNow(date, { addSuffix: true });
}

function truncate(value: string, size: number): string {
  if (value.length <= size * 2) return value;
  return `${value.slice(0, size)}...${value.slice(-size)}`;
}
