"use client";

import { useQuery } from "@tanstack/react-query";

export const XYZ_PRICE_QUERY_KEY = ["xyz-price"] as const;

interface PriceResponse {
  price: number;
  source: "oracle";
}

async function fetchXyzPrice(): Promise<PriceResponse> {
  const res = await fetch("/api/xyz-price");
  if (!res.ok) throw new Error("Failed to fetch BWICK price");
  return res.json();
}

export function useXyzPrice() {
  const query = useQuery({
    queryKey: [...XYZ_PRICE_QUERY_KEY],
    queryFn: fetchXyzPrice,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return {
    ...query,
    /** BWICK price in USD. Defaults to 0 while loading or when oracle is unset. */
    xyzPriceUsd: query.data?.price ?? 0,
    /** Where the price came from */
    priceSource: query.data?.source ?? "oracle",
  };
}
