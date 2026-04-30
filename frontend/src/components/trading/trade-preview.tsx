"use client";

import { formatTokenAmount, formatUsd, fromUbwick } from "@/lib/utils";
import { useBwickPrice } from "@/hooks/use-bwick-price";

interface TradePreviewProps {
  /** Estimated output amount in micro-units */
  estimatedOutput: string;
  /** Minimum output after slippage in micro-units */
  minOutput: string;
  /** Fee amount in micro-units */
  feeAmount: string;
  /** Current slippage percentage */
  slippagePercent: number;
  /** Output denomination label (e.g., "BWICK" or token symbol) */
  outputDenom: string;
  /** Whether output is in ubwick (true) or token micro-units (false) */
  outputIsBwick: boolean;
  /** New price after trade (optional, decimal BWICK string) */
  newPrice?: string;
  /** Price impact percentage (optional, for AMM swaps) */
  priceImpact?: string;
}

export function TradePreview({
  estimatedOutput,
  minOutput,
  feeAmount,
  slippagePercent,
  outputDenom,
  outputIsBwick,
  newPrice,
  priceImpact,
}: TradePreviewProps) {
  const { bwickPriceUsd } = useBwickPrice();

  const formatOutput = outputIsBwick
    ? (v: string) => formatUsd(fromUbwick(v) * bwickPriceUsd)
    : formatTokenAmount;

  const feeUsd = formatUsd(fromUbwick(feeAmount) * bwickPriceUsd);
  const newPriceUsd = newPrice
    ? formatUsd(Number(newPrice) * bwickPriceUsd)
    : null;

  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">You receive (est.)</span>
        <span className="font-mono text-foreground">
          {formatOutput(estimatedOutput)} {!outputIsBwick && outputDenom}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">
          Min after slippage ({slippagePercent}%)
        </span>
        <span className="font-mono text-foreground">
          {formatOutput(minOutput)} {!outputIsBwick && outputDenom}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Fee</span>
        <span className="font-mono text-foreground">{feeUsd}</span>
      </div>
      {priceImpact && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price impact</span>
          <span className="font-mono text-foreground">{priceImpact}%</span>
        </div>
      )}
      {newPriceUsd && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">New price</span>
          <span className="font-mono text-foreground">{newPriceUsd}</span>
        </div>
      )}
    </div>
  );
}
