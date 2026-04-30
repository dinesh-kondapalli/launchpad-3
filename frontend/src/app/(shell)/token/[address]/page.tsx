"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowSquareOut, CaretDown, CaretUp, ShieldCheck } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TradingChartSkeleton } from "@/components/trading/trading-chart-skeleton";
import { useCurveProgress } from "@/hooks/use-curve-progress";
import { useTokenDetail } from "@/hooks/use-token-detail";
import { useTokenTrades } from "@/hooks/use-token-trades";
import { useBwickPrice } from "@/hooks/use-bwick-price";
import { DEFAULT_TOKEN_SUPPLY, NATIVE_SYMBOL } from "@/lib/chain-config";
import { formatUsd } from "@/lib/utils";

const TradingChart = dynamic(
  () =>
    import("@/components/trading/trading-chart").then(
      (mod) => mod.TradingChart,
    ),
  {
    ssr: false,
    loading: () => <TradingChartSkeleton />,
  },
);

export default function TokenDetailPage() {
  const params = useParams();
  const tokenAddress = params.address as string;

  const tokenQuery = useTokenDetail(tokenAddress);
  const progressQuery = useCurveProgress(tokenAddress);
  const tradesQuery = useTokenTrades(tokenAddress, 20);
  const { bwickPriceUsd } = useBwickPrice();

  const token = tokenQuery.data;
  const progress = useMemo(
    () =>
      progressQuery.data
        ? progressQuery.data
        : token
          ? {
              tokens_sold: "0",
              tokens_remaining: "0",
              bwick_reserves: token.bwick_reserves,
              graduation_threshold: "0",
              progress_percent: token.graduated ? 100 : 0,
              current_price: token.current_price,
              graduated: token.graduated,
            }
          : null,
    [progressQuery.data, token],
  );

  const tokenStats = useMemo(() => {
    if (!token || !progress) {
      return {
        price: formatUsd(0),
        marketCap: formatUsd(0),
        liquidity: formatUsd(0),
        oneHour: 0,
        sixHour: 0,
        twentyFourHour: 0,
      };
    }

    const marketCapUsd = Number(token.current_price) * DEFAULT_TOKEN_SUPPLY * bwickPriceUsd;
    const liquidityUsd = (Number(progress.bwick_reserves) / 1_000_000) * bwickPriceUsd;

    return {
      price: formatUsd(Number(token.current_price) * bwickPriceUsd),
      marketCap: formatUsd(marketCapUsd),
      liquidity: formatUsd(liquidityUsd),
      oneHour: 0,
      sixHour: 0,
      twentyFourHour: 0,
    };
  }, [progress, token, bwickPriceUsd]);

  const feedEntries = useMemo(() => {
    if (tradesQuery.data && tradesQuery.data.length > 0) {
      return tradesQuery.data.map((trade) => ({
        id: trade.tx_hash,
        side: trade.action === "buy" ? "Buy" : "Sell",
        amountNative: Number(trade.bwick_amount) / 1_000_000,
        trader: trade.trader,
        time: trade.time,
      }));
    }

    return [];
  }, [tradesQuery.data]);

  if (tokenQuery.isLoading) {
    return <TradingChartSkeleton />;
  }

  if (!token || !progress) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-6 py-16">
        <div className="max-w-md space-y-3 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Token not found</h1>
          <p className="text-sm text-muted-foreground">
            This token is not available on the BWICK launchpad yet, or the chain query failed.
          </p>
        </div>
      </div>
    );
  }

  const reserve = Number(progress.bwick_reserves) / 1_000_000;
  const threshold = Number(progress.graduation_threshold) / 1_000_000;
  const toGraduate = Math.max(0, threshold - reserve);
  const creatorRewards = reserve * 0.027;

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="container mx-auto grid h-full w-full grid-cols-1 divide-x divide-border lg:grid-cols-12">
        <div className="min-h-screen lg:col-span-7">
          <div className="border-b border-border p-4 md:px-6 md:py-4">
            <div className="flex flex-wrap justify-between gap-3 md:gap-4">
              <div className="flex flex-row gap-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-sm border border-border bg-card lg:size-14">
                  {token.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={token.image}
                      alt={token.name ?? "token"}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        (event.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-foreground">
                      {(token.symbol ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <h1 className="flex w-full max-w-[280px] items-center gap-2 text-xl font-bold leading-tight md:max-w-[420px] lg:text-2xl">
                    <span className="min-w-0 truncate">{token.name ?? "Unknown Token"}</span>
                    <Badge className="rounded-sm border border-border bg-card px-1.5 py-0 text-[10px] text-foreground">
                      Agent
                    </Badge>
                  </h1>

                  <div className="flex flex-wrap items-center gap-1 text-[10px] font-medium text-muted-foreground md:gap-1.5 md:text-xs">
                    <span>{(token.symbol ?? "TOKEN").toUpperCase()}</span>
                    <span className="text-border">·</span>
                    <span>{truncate(tokenAddress, 4)}</span>
                    <span className="text-border">·</span>
                    <span>{truncate(token.creator ?? "creator", 5)}</span>
                    <span className="text-border">·</span>
                    <span>{formatRelative(token.first_seen_at, token.created_height)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-3 -mr-px"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, transparent 0, transparent 6px, rgba(143,166,193,0.35) 6px, rgba(143,166,193,0.35) 7px)",
            }}
          >
            <StatCell label="Price" value={tokenStats.price} />
            <StatCell label="Market Cap" value={tokenStats.marketCap} />
            <StatCell label="Liquidity" value={tokenStats.liquidity} />
            <ChangeCell label="1H" change={tokenStats.oneHour} />
            <ChangeCell label="6H" change={tokenStats.sixHour} />
            <ChangeCell label="24H" change={tokenStats.twentyFourHour} />
          </div>

          <div className="border-y border-border">
            <div className="p-2.5">
              <TradingChart tokenAddress={tokenAddress} />
            </div>
          </div>

          <div className="border-t border-border px-4 py-3 md:border-b md:border-t-0 md:px-6">
            <div className="mb-2 mt-1 flex items-center gap-2">
                <ShieldCheck size={14} weight="bold" className="text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Token audit</span>
            </div>

            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              <AuditRow label="Mint authority disabled" value="Unavailable" />
              <AuditRow label="Freeze authority disabled" value="Unavailable" />
              <AuditRow label="Top 10 holders" value="Unavailable" />
              <AuditRow label="Dev balance" value="Unavailable" />
            </div>
          </div>

          <p className="border-t border-border p-4 text-xs text-muted-foreground md:px-8">
            Metaplex.com is operated by Metaplex Global as an interface for interacting with decentralized protocols.
            Token launches are conducted by third parties, and Metaplex Global does not issue or endorse tokens.
            Participation is subject to the Terms of Use.
          </p>
        </div>

        <div className="h-full max-w-xl px-4 py-4 md:px-6 md:py-2 lg:col-span-5">
          <section className="my-4 space-y-1 lg:sticky lg:top-4">
            <section className="space-y-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    Bonding Curve Progress
                    <span className="inline-flex size-2 rounded-full bg-primary" />
                  </p>
                  <p className="text-6xl font-bold tracking-tight tabular-nums lg:text-7xl">
                    {progress.progress_percent.toFixed(1)}
                    <span className="ml-1.5 text-sm tracking-wide text-muted-foreground">%</span>
                  </p>
                </div>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-none bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.max(progress.progress_percent, 1)}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-1 text-xs font-medium tabular-nums md:text-sm">
                <span>{reserve.toFixed(2)} {NATIVE_SYMBOL}</span>
                <span className="text-muted-foreground">{toGraduate.toFixed(0)} {NATIVE_SYMBOL} to graduate</span>
              </div>
            </section>

            <div className="mt-4 border-t border-dashed border-border pt-4">
              <Button className="h-12 w-full rounded-sm bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90">
                Connect Wallet
              </Button>
            </div>

            <div className="mt-4 space-y-2.5 rounded-md border border-border bg-card p-3">
              <p className="text-xs font-semibold text-muted-foreground md:text-sm">Creator Rewards</p>

              <div className="inline-flex items-center gap-2">
                <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-card">
                  {token.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={token.image} alt={token.name ?? "token"} className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <h3 className="text-xs font-medium capitalize text-foreground md:text-sm">
                  {truncate(token.creator ?? "Creator", 6)}
                </h3>

                <Badge className="rounded-sm border border-border bg-card px-1.5 py-0 text-[10px] text-foreground">
                  Agent
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p className="font-medium">Total rewards</p>
                <p className="font-semibold tabular-nums text-foreground">{creatorRewards.toFixed(4)} {NATIVE_SYMBOL}</p>
              </div>
            </div>

            <div className="mt-3 border-t border-dashed border-border pt-3">
              <h3 className="-mb-1 text-xs font-semibold text-muted-foreground md:text-sm">Recent Activity</h3>

              <div className="divide-y divide-dashed divide-border">
                {feedEntries.length === 0 ? (
                  <div className="py-6 text-sm text-muted-foreground">No trades yet on BWICK.</div>
                ) : feedEntries.map((entry) => {
                  const isBuy = entry.side === "Buy";
                  return (
                    <div key={entry.id} className="flex flex-row items-start justify-between gap-1 py-3">
                      <div className="space-y-0.5">
                        <p className="font-mono text-sm text-muted-foreground">{truncate(entry.trader, 5)}</p>
                        <p className="flex items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground">
                          {new Date(entry.time).toLocaleString()}
                          <ArrowSquareOut size={12} weight="bold" />
                        </p>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <span
                          className={
                            isBuy
                              ? "font-mono text-sm font-medium tabular-nums text-primary"
                              : "font-mono text-sm font-medium tabular-nums text-destructive"
                          }
                        >
                          {isBuy ? "+" : "-"}
                          {entry.amountNative.toFixed(6)} {NATIVE_SYMBOL}
                        </span>
                        <p className="text-xs font-medium text-muted-foreground">{isBuy ? "Bought" : "Sold"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-r border-border bg-background p-2.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground md:text-sm">{value}</span>
    </div>
  );
}

function ChangeCell({ label, change }: { label: string; change: number }) {
  const positive = change >= 0;
  return (
    <div className="flex flex-col -space-y-0.5 border-b border-r border-border bg-background px-2.5 py-2 text-sm">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span
        className={
          positive
            ? "flex items-center gap-0.5 font-medium text-primary"
            : "flex items-center gap-0.5 font-medium text-destructive"
        }
      >
        {positive ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
        {Math.abs(change).toFixed(2)}%
      </span>
    </div>
  );
}

function AuditRow({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-xs">
      <span className="cursor-help border-b border-dashed border-border font-medium tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="flex items-center gap-1.5 font-medium text-foreground">
        {value}
        <span className={good ? "text-primary" : "text-destructive"}>{good ? "✓" : "✕"}</span>
      </span>
    </div>
  );
}

function truncate(value: string, size: number): string {
  if (value.length <= size * 2) return value;
  return `${value.slice(0, size)}...${value.slice(-size)}`;
}

function formatRelative(value?: string | null, createdHeight?: number | null): string {
  if (createdHeight) return `Block ${createdHeight}`;
  if (!value) return "Awaiting block time";
  const target = new Date(value).getTime();
  if (!Number.isFinite(target)) return "Awaiting block time";
  const hours = Math.max(1, Math.floor((Date.now() - target) / (1000 * 60 * 60)));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
