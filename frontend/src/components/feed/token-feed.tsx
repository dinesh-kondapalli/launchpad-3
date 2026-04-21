"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CaretDown, Circle, Flame, GraduationCap } from "@phosphor-icons/react";
import { useSSEFeed } from "@/hooks/use-sse";
import { useTokens } from "@/hooks/use-tokens";
import { useXyzPrice } from "@/hooks/use-xyz-price";
import { DEFAULT_TOKEN_SUPPLY, RPC_ENDPOINT, REST_ENDPOINT, CHAIN_ID } from "@/lib/chain-config";
import { formatUsd } from "@/lib/utils";
import type { TokenListItem } from "@/lib/api";
import { getConfig } from "@/lib/contract-clients/launchpad";

type SortMode = "activity" | "newest" | "reserves";

const TILE_BACKGROUNDS = [
  "#5a6e8a",
  "#637894",
  "#4d6280",
  "#7389a7",
  "#44546e",
  "#596f8d",
];

const MIN_TICKER_ITEMS = 44;

export function TokenFeed() {
  const [sortMode, setSortMode] = useState<SortMode>("activity");
  const { data: tokens = [], error } = useTokens();
  const { xyzPriceUsd } = useXyzPrice();
  const { data: launchpadConfig } = useQuery({
    queryKey: ["launchpad-config"],
    queryFn: async () => {
      const { createClient } = await import("@xyz-chain/sdk");
      const readClient = await createClient({
        rpcEndpoint: RPC_ENDPOINT,
        restEndpoint: REST_ENDPOINT,
        chainId: CHAIN_ID,
      });
      try {
        return await getConfig(readClient);
      } finally {
        readClient.disconnect();
      }
    },
    staleTime: 60_000,
  });

  useSSEFeed();

  const sortedTokens = useMemo(
    () => sortTokens(tokens, sortMode),
    [tokens, sortMode],
  );

  const liveTokens = sortedTokens.filter((token) => !token.graduated);
  const graduatedTokens = sortedTokens.filter((token) => token.graduated);
  const trendingTokens = sortedTokens;

  const tickerItems = useMemo(() => buildTickerItems(sortedTokens), [sortedTokens]);
  const loopingTickerItems = useMemo(
    () => [...tickerItems, ...tickerItems].map((item, index) => ({
      ...item,
      key: `${item.key}-loop-${index}`,
    })),
    [tickerItems],
  );

  return (
    <div className="overflow-hidden border-x border-b border-border bg-background pb-2">
      <section className="relative overflow-hidden border-y border-border">
        {loopingTickerItems.length > 0 ? (
          <div className="overflow-hidden">
            <div className="token-ticker-track flex w-max">
              {loopingTickerItems.map((item) => (
                <Link
                  key={item.key}
                  href={`/token/${item.token.address}`}
                  className="inline-flex h-9 items-center gap-2 border-r border-border px-3 text-xs text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-sm border border-border bg-card text-[9px] font-semibold text-muted-foreground">
                    {(item.token.symbol ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="font-semibold text-foreground">{item.token.symbol ?? "TOKEN"}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 text-xs text-muted-foreground">
            No BWICK launches yet.
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background via-background/95 to-transparent shadow-[20px_0_24px_-20px_rgba(40,55,80,0.55)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background via-background/95 to-transparent shadow-[-20px_0_24px_-20px_rgba(40,55,80,0.55)]"
        />
      </section>

      {error ? (
        <div className="border-b border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load BWICK launch data.
        </div>
      ) : null}

      <TokenRowSection
        title="Live Now"
        icon={
          <span className="relative inline-flex h-2.5 w-2.5">
            <span className="live-dot-spread absolute inset-0 rounded-full bg-primary/25" />
            <Circle size={10} weight="fill" className="relative z-[1] text-primary" />
          </span>
        }
        iconPlain
        tokens={liveTokens}
        xyzPriceUsd={xyzPriceUsd}
        graduationThreshold={launchpadConfig?.graduation_threshold}
        sortMode={sortMode}
        onSortChange={setSortMode}
      />

      <TokenRowSection
        title="Graduated"
        icon={<GraduationCap size={16} weight="regular" className="text-foreground" />}
        tokens={graduatedTokens}
        xyzPriceUsd={xyzPriceUsd}
        graduationThreshold={launchpadConfig?.graduation_threshold}
        sortMode={sortMode}
        onSortChange={setSortMode}
      />

      <TokenRowSection
        title="Trending"
        icon={<Flame size={16} weight="regular" className="text-foreground" />}
        tokens={trendingTokens}
        xyzPriceUsd={xyzPriceUsd}
        graduationThreshold={launchpadConfig?.graduation_threshold}
        sortMode={sortMode}
        onSortChange={setSortMode}
      />
    </div>
  );
}

function TokenRowSection({
  title,
  icon,
  iconPlain,
  tokens,
  xyzPriceUsd,
  graduationThreshold,
  sortMode,
  onSortChange,
}: {
  title: string;
  icon: React.ReactNode;
  iconPlain?: boolean;
  tokens: TokenListItem[];
  xyzPriceUsd: number;
  graduationThreshold?: string;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: 1 | -1) => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollBy({ left: direction * 420, behavior: "smooth" });
  };

  return (
    <section className="overflow-hidden border-b border-border bg-background last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            {iconPlain ? (
              <span className="inline-flex h-6 w-6 items-center justify-center text-foreground">{icon}</span>
            ) : (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm border border-border bg-card text-foreground">
                {icon}
              </span>
            )}
            <h3 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{title}</h3>
          </div>

          <div className="inline-flex items-center gap-2 border-l border-border pl-4">
            <span className="text-sm text-muted-foreground">Sort by</span>
            <div className="relative">
              <select
                value={sortMode}
                onChange={(event) => onSortChange(event.target.value as SortMode)}
                className="h-8 w-[148px] appearance-none rounded-sm border border-border bg-background pl-3 pr-8 text-sm capitalize text-foreground outline-none focus:border-primary focus-visible:outline-none focus-visible:ring-0"
              >
                <option value="activity">24h trades</option>
                <option value="newest">Recently launched</option>
                <option value="reserves">Reserves</option>
              </select>
              <CaretDown
                size={12}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-card text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label={`Scroll ${title} left`}
          >
            <ArrowLeft size={14} weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-card text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label={`Scroll ${title} right`}
          >
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </div>

      {tokens.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No launches available.</p>
      ) : (
        <div ref={scrollerRef} className="no-scrollbar overflow-x-auto">
          <div className="flex min-w-max">
            {tokens.map((token, index) => (
              <LaunchTile
                key={`${token.address}-${index}`}
                token={token}
                xyzPriceUsd={xyzPriceUsd}
                graduationThreshold={graduationThreshold}
                tileIndex={index}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function LaunchTile({
  token,
  xyzPriceUsd,
  graduationThreshold,
  tileIndex,
}: {
  token: TokenListItem;
  xyzPriceUsd: number;
  graduationThreshold?: string;
  tileIndex: number;
}) {
  const reserve = Number(token.xyz_reserves) / 1_000_000;
  const threshold = Number(graduationThreshold || "0") / 1_000_000;
  const progress = token.graduated
    ? 100
    : threshold > 0
      ? Math.min(100, (reserve / threshold) * 100)
      : 0;
  const fallbackBackground = TILE_BACKGROUNDS[tileIndex % TILE_BACKGROUNDS.length];
  const previewImage = getDisplayImage(token, tileIndex);
  const initial = (token.symbol ?? "?").slice(0, 1).toUpperCase();

  return (
    <Link
      href={`/token/${token.address}`}
      className="group block w-[340px] border-r border-border bg-background transition-colors hover:bg-accent first:border-l"
    >
      <div className="relative aspect-[1.7] w-full border-b border-border" style={{ background: fallbackBackground }}>
        <div className="grid h-full place-items-center text-4xl font-black tracking-tight text-primary-foreground/75">
          {initial}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewImage}
          alt={token.symbol ?? "token"}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onError={(event) => {
            (event.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      <div className="space-y-2.5 p-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-card text-[9px] font-semibold text-foreground">
            {(token.symbol ?? "?").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-[18px] font-semibold leading-tight text-foreground md:text-[20px]">
              {token.name ?? "Unnamed token"}
            </h4>
            <p className="truncate text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              {token.symbol ?? "TOKEN"} - Bonding Curve
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Bonding Curve Progress:</span>
            <span className="font-mono text-xs text-foreground">{progress.toFixed(2)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(progress, 2)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-border pt-2.5 text-xs">
          <Metric label="FDV" value={formatMarketCap(token, xyzPriceUsd)} />
          <Metric label="Mkt Cap" value={formatMarketCap(token, xyzPriceUsd)} />
          <Metric
            label="Trades"
            value={String(token.trade_count_24h ?? 0)}
          />
        </div>
      </div>
    </Link>
  );
}

function Metric({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}:</p>
      <p className={`mt-1 truncate font-mono text-[12px] text-foreground ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}

function buildTickerItems(tokens: TokenListItem[]) {
  if (tokens.length === 0) return [];
  const baseTokens = tokens;
  const repeats = Math.max(2, Math.ceil(MIN_TICKER_ITEMS / baseTokens.length));
  const expanded = Array.from({ length: repeats }).flatMap((_, repeatIndex) =>
    baseTokens.map((token) => ({
      token,
      key: `${token.address}-${repeatIndex}`,
    })),
  );

  return expanded;
}

function getDisplayImage(token: TokenListItem, tileIndex: number): string {
  if (token.image) return token.image;
  const seed = encodeURIComponent(`${token.address}-${token.symbol ?? tileIndex}`);
  return `https://picsum.photos/seed/${seed}/1200/700`;
}

function sortTokens(tokens: TokenListItem[], mode: SortMode): TokenListItem[] {
  if (mode === "newest") {
    return [...tokens].sort(
      (left, right) => (right.created_height ?? 0) - (left.created_height ?? 0),
    );
  }

  if (mode === "reserves") {
    return [...tokens].sort(
      (left, right) => Number(right.xyz_reserves) - Number(left.xyz_reserves),
    );
  }

  return [...tokens].sort(
    (left, right) => (right.trade_count_24h ?? 0) - (left.trade_count_24h ?? 0),
  );
}

function formatMarketCap(token: TokenListItem, xyzPriceUsd: number): string {
  const cap = Number(token.current_price) * DEFAULT_TOKEN_SUPPLY * xyzPriceUsd;
  return formatUsd(cap);
}
