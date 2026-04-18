"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCandles, type Timeframe } from "@/lib/api";
import { getMockCandles, USE_MOCK_DATA } from "@/lib/mock-data";

export const CANDLES_QUERY_KEY = (address: string, timeframe: Timeframe) =>
  ["candles", address, timeframe] as const;

export function useCandles(tokenAddress: string, timeframe: Timeframe) {
  return useQuery({
    queryKey: CANDLES_QUERY_KEY(tokenAddress, timeframe),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return getMockCandles(tokenAddress, timeframe, 300);
      }

      try {
        return await fetchCandles(tokenAddress, timeframe, 300);
      } catch {
        return getMockCandles(tokenAddress, timeframe, 300);
      }
    },
    staleTime: 60_000,       // 1 minute (matches candle update frequency)
    refetchInterval: 60_000, // Auto-refresh every minute for live data
    enabled: !!tokenAddress,
  });
}
