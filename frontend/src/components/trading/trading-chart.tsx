"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCandles } from "@/hooks/use-candles";
import { TradingChartCanvas } from "./trading-chart-canvas";
import { TradingChartSkeleton } from "./trading-chart-skeleton";
import {
  DEFAULT_INDICATORS,
} from "./indicator-toolbar";
import type { Timeframe } from "@/lib/api";

interface TradingChartProps {
  tokenAddress: string;
}

export function TradingChart({ tokenAddress }: TradingChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");
  const indicators = DEFAULT_INDICATORS;
  const [showMCap, setShowMCap] = useState(true);
  const { data, isLoading, error, refetch } = useCandles(
    tokenAddress,
    timeframe,
  );

  if (isLoading) {
    return <TradingChartSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Price Chart</h2>
        </div>
        <div className="flex h-[400px] items-center justify-center rounded-2xl border border-destructive/40 bg-destructive/15">
          <div className="text-center space-y-2">
            <p className="font-medium text-destructive">
              Failed to load chart
            </p>
            <p className="text-sm text-zinc-500">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasData = data && data.candles.length > 0;

  const timeframeButtons: { label: string; value?: Timeframe }[] = [
    { label: "1s" },
    { label: "15s" },
    { label: "30s" },
    { label: "1m", value: "1m" },
    { label: "5m", value: "5m" },
    { label: "15m" },
    { label: "1H", value: "1h" },
    { label: "4H" },
    { label: "1D", value: "1d" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27272a] px-2 pb-2">
        <div className="inline-flex items-center gap-0.5 rounded bg-[#191a1e] p-0.5 text-[11px] font-semibold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setShowMCap(true)}
            className={`rounded px-1.5 py-0.5 transition-colors ${showMCap ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-100"}`}
          >
            MCAP
          </button>
          <button
            type="button"
            onClick={() => setShowMCap(false)}
            className={`rounded px-1.5 py-0.5 transition-colors ${!showMCap ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-100"}`}
          >
            PRICE
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {timeframeButtons.map((button) => {
            const active = button.value && button.value === timeframe;
            return (
              <button
                key={button.label}
                type="button"
                onClick={() => {
                  if (button.value) setTimeframe(button.value);
                }}
                className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${active ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-100"}`}
              >
                {button.label}
              </button>
            );
          })}
        </div>
      </div>

      {hasData ? (
        <div className="overflow-hidden rounded-sm border border-[#27272a] bg-[#111111]">
          <TradingChartCanvas
            data={data}
            indicators={indicators}
            showMCap={showMCap}
          />
        </div>
      ) : (
        <div className="flex h-[400px] items-center justify-center rounded-sm border border-[#27272a] bg-[#111111]">
          <div className="text-center space-y-2">
            <p className="text-zinc-500">
              No trading data available yet
            </p>
            <p className="text-sm text-zinc-600">
              Chart will appear after first trade
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
