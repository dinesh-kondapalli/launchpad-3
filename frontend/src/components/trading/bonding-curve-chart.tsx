"use client";

import { useCurveProgress } from "@/hooks/use-curve-progress";
import { useBwickPrice } from "@/hooks/use-bwick-price";
import { formatUsd } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface BondingCurveChartProps {
  tokenAddress: string;
}

export function BondingCurveChart({ tokenAddress }: BondingCurveChartProps) {
  const { data: progress, isLoading } = useCurveProgress(tokenAddress);
  const { bwickPriceUsd } = useBwickPrice();

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-full rounded-sm" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!progress) return null;

  if (progress.graduated) {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Bonding Curve</h3>
          <Badge variant="secondary">Graduated</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          This token has graduated to the AMM. The bonding curve is now closed.
        </p>
      </div>
    );
  }

  const bwickReserves = Number(progress.bwick_reserves);
  const gradThreshold = Number(progress.graduation_threshold);
  const progressPct = Math.min(progress.progress_percent, 100);

  const raisedUsd = (bwickReserves / 1e6) * bwickPriceUsd;
  const thresholdUsd = (gradThreshold / 1e6) * bwickPriceUsd;

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Bonding Curve Progress</h3>
        <span className="text-xs font-mono font-medium text-foreground">
          {progressPct.toFixed(1)}%
        </span>
      </div>

      <div className="h-5 w-full overflow-hidden rounded-sm bg-muted">
        <div
          className="h-full rounded-sm bg-primary transition-all duration-500"
          style={{ width: `${Math.max(progressPct, 0.5)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatUsd(raisedUsd)} raised</span>
        <span>{formatUsd(thresholdUsd)} to graduate</span>
      </div>
    </div>
  );
}
