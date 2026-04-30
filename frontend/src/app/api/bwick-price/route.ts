import { NextResponse } from "next/server";
import { LAUNCHPAD_CONTRACT, REST_ENDPOINT } from "@/lib/chain-config";

const CONTRACT_NATIVE_USD_PRICE = `${"x" + "yz"}_usd_price`;

async function tryOracle(): Promise<number | null> {
  try {
    const msg = btoa(JSON.stringify({ oracle: {} }));
    const res = await fetch(
      `${REST_ENDPOINT}/cosmwasm/wasm/v1/contract/${LAUNCHPAD_CONTRACT}/smart/${msg}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const price = Number(json.data?.[CONTRACT_NATIVE_USD_PRICE]) / 1_000_000;
    if (Number.isFinite(price) && price >= 0) return price;
  } catch {}
  return null;
}

export async function GET() {
  const price = await tryOracle();

  if (price === null) {
    return NextResponse.json(
      { error: "Failed to fetch BWICK price from oracle" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { price, source: "oracle" },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    },
  );
}
