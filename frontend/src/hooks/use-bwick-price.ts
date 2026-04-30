"use client";

import { useQuery } from "@tanstack/react-query";

export const BWICK_PRICE_QUERY_KEY = ["bwick-price"] as const;

interface PriceResponse {
  price: number;
  source: "oracle";
}

async function fetchBwickPrice(): Promise<PriceResponse> {
  const res = await fetch("/api/bwick-price");
  if (!res.ok) throw new Error("Failed to fetch BWICK price");
  return res.json();
}

export function useBwickPrice() {
  const query = useQuery({
    queryKey: [...BWICK_PRICE_QUERY_KEY],
    queryFn: fetchBwickPrice,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return {
    ...query,
    /** BWICK price in USD. Defaults to 0 while loading or when oracle is unset. */
    bwickPriceUsd: query.data?.price ?? 0,
    /** Where the price came from */
    priceSource: query.data?.source ?? "oracle",
  };
}
