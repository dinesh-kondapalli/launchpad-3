"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchToken } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/mock-data";

export const TOKEN_DETAIL_QUERY_KEY = (address: string) =>
  ["token", address] as const;

export function useTokenDetail(address: string) {
  return useQuery({
    queryKey: TOKEN_DETAIL_QUERY_KEY(address),
    queryFn: () => fetchToken(address),
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: !!address && !USE_MOCK_DATA,
  });
}
