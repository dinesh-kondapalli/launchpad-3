"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTokens } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/mock-data";

export const TOKENS_QUERY_KEY = ["tokens"] as const;

export function useTokens() {
  return useQuery({
    queryKey: TOKENS_QUERY_KEY,
    queryFn: fetchTokens,
    staleTime: 30_000,       // 30s - SSE updates in between
    refetchInterval: 60_000, // Fallback: refetch every 60s if SSE disconnects
    enabled: !USE_MOCK_DATA,
  });
}
