"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurveProgress } from "@/lib/api";
import { USE_MOCK_DATA } from "@/lib/mock-data";

export function useCurveProgress(tokenAddress: string) {
  return useQuery({
    queryKey: ["curve-progress", tokenAddress],
    queryFn: () => fetchCurveProgress(tokenAddress),
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: !!tokenAddress && !USE_MOCK_DATA,
  });
}
