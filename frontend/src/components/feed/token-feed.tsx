"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react";
import { useSSEFeed } from "@/hooks/use-sse";
import { useTokens } from "@/hooks/use-tokens";
import { useBwickPrice } from "@/hooks/use-bwick-price";
import { DEFAULT_TOKEN_SUPPLY } from "@/lib/chain-config";
import { formatUsd } from "@/lib/utils";
import type { TokenListItem } from "@/lib/api";

type SortMode = "activity" | "newest" | "reserves";

export function TokenFeed() {
  const [sortMode, setSortMode] = useState<SortMode>("activity");
  const { data: tokens = [], error } = useTokens();
  const { bwickPriceUsd } = useBwickPrice();

  useSSEFeed();

  const sortedTokens = useMemo(
    () => sortTokens(tokens, sortMode),
    [tokens, sortMode],
  );

  return (
    <div className="min-h-[calc(100dvh-6rem)] w-full bg-background">
      <div className="overflow-hidden bg-card">
      <section className="relative overflow-hidden bg-background px-3 py-6 text-center sm:py-8">
        <Link href="/create" className="inline-block text-xl font-bold leading-none hover:text-primary hover:underline sm:text-2xl">
          [lay your first brick]
        </Link>
        <div className="mx-auto mt-6 grid w-fit grid-cols-[88px_minmax(0,320px)] items-center gap-3 text-left sm:grid-cols-[96px_340px]">
          <div className="aspect-square overflow-hidden bg-primary">
            <div className="flex h-full items-center justify-center text-4xl font-black text-primary-foreground">B</div>
          </div>
          <div className="min-w-0 space-y-2">
            <p className="inline-block bg-primary px-3 py-1 text-sm font-black uppercase text-primary-foreground sm:text-base">
              King of the Stack
            </p>
            <p className="text-sm font-bold">Bwick brick (ticker: $BRICK)</p>
            <p className="text-xs text-muted-foreground">created by dev - market cap: 0.00K - replies: 0</p>
          </div>
        </div>
        <div className="mx-auto mt-5 flex max-w-[470px] gap-2">
          <input
            type="search"
            placeholder="search for token"
            className="h-10 flex-1 border border-muted bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <button type="button" className="bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            search
          </button>
        </div>
      </section>

      {error ? (
        <div className="border-b border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load BWICK launch data.
        </div>
      ) : null}

      <section className="bg-card">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 py-4 sm:px-16">
          <div className="flex h-8 items-start gap-4">
            <button type="button" className="py-1 text-sm leading-none text-muted-foreground hover:text-foreground">
              Following
            </button>
            <button type="button" className="border-b-4 border-primary px-0 py-1 text-sm font-bold leading-none text-foreground">
              Terminal
            </button>
          </div>
          <div className="flex h-8 items-start gap-2">
            <span className="py-1 text-xs leading-none text-muted-foreground">sort:</span>
            <div className="relative">
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="h-8 w-[132px] appearance-none rounded-none border-0 bg-primary px-3 pr-7 text-xs font-bold capitalize text-primary-foreground outline-none focus-visible:outline-none focus-visible:ring-0 [&_option]:bg-card [&_option]:text-foreground [&_option:checked]:bg-primary [&_option:checked]:text-primary-foreground"
              >
                <option value="activity">featured</option>
                <option value="newest">newest</option>
                <option value="reserves">reserves</option>
              </select>
              <CaretDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-primary-foreground" />
            </div>
          </div>
        </div>

        {sortedTokens.length === 0 ? (
          <p className="px-3 py-3 text-sm text-muted-foreground sm:px-16">No launches available.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 px-3 pb-8 sm:grid-cols-2 sm:px-16 xl:grid-cols-3">
            {sortedTokens.map((token, index) => (
              <LaunchTile
                key={`${token.address}-${index}`}
                token={token}
                bwickPriceUsd={bwickPriceUsd}
              />
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}

function LaunchTile({
  token,
  bwickPriceUsd,
}: {
  token: TokenListItem;
  bwickPriceUsd: number;
}) {
  const previewImage = getDisplayImage(token);

  return (
    <Link
      href={`/token/${token.address}`}
      className="group grid min-h-[132px] grid-cols-[128px_1fr] gap-4 bg-card transition-colors hover:bg-accent/45"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#ffd1b9]">
        {previewImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={previewImage}
            alt={token.symbol ?? "token"}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            onError={(event) => {
              (event.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="grid h-full place-items-center px-2 text-center text-[12px] leading-snug text-muted-foreground">
            unable to display image
          </div>
        )}
      </div>

      <div className="min-w-0 pt-0.5">
        <div className="min-w-0">
          <h4 className="truncate text-base font-bold leading-tight text-foreground">
            {token.name ?? "Unnamed token"}
          </h4>
          <p className="truncate text-[11px] text-muted-foreground">
            created by <span className="text-primary">{truncate(token.creator ?? token.address, 5)}</span>
          </p>
          <p className="truncate text-[11px] font-bold text-primary">
            market cap: {formatMarketCap(token, bwickPriceUsd)} {token.graduated ? "[badge: live]" : ""}
          </p>
          <p className="text-[11px] text-muted-foreground">replies: {token.trade_count_24h ?? 0}</p>
        </div>

        <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-muted-foreground">
          <span className="font-bold text-foreground">{token.name ?? token.symbol ?? "Token"} (ticker: {token.symbol ?? "TOKEN"}):</span>{" "}
          {token.description ?? "freshly stacked on the BWICK bonding curve"}
        </p>
      </div>
    </Link>
  );
}

function truncate(value: string, size: number): string {
  if (value.length <= size * 2) return value;
  return `${value.slice(0, size)}...${value.slice(-size)}`;
}

function getDisplayImage(token: TokenListItem): string {
  if (token.image) return token.image;
  return "";
}

function sortTokens(tokens: TokenListItem[], mode: SortMode): TokenListItem[] {
  if (mode === "newest") {
    return [...tokens].sort(
      (left, right) => (right.created_height ?? 0) - (left.created_height ?? 0),
    );
  }

  if (mode === "reserves") {
    return [...tokens].sort(
      (left, right) => Number(right.bwick_reserves) - Number(left.bwick_reserves),
    );
  }

  return [...tokens].sort(
    (left, right) => (right.trade_count_24h ?? 0) - (left.trade_count_24h ?? 0),
  );
}

function formatMarketCap(token: TokenListItem, bwickPriceUsd: number): string {
  const cap = Number(token.current_price) * DEFAULT_TOKEN_SUPPLY * bwickPriceUsd;
  return formatUsd(cap);
}
