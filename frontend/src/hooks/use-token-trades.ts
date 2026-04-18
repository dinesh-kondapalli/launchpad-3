"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTokenTrades, TOKEN_TRADES_QUERY_KEY } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/mock-data";

export function useTokenTrades(tokenAddress: string, limit: number = 20) {
  return useQuery({
    queryKey: [...TOKEN_TRADES_QUERY_KEY(tokenAddress), limit],
    queryFn: () => fetchTokenTrades(tokenAddress, limit),
    staleTime: 15_000,
    refetchInterval: 30_000,
    enabled: !!tokenAddress && !USE_MOCK_DATA,
  });
}
