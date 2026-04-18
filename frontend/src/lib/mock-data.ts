import type {
  CandleResponse,
  CurveProgress,
  Timeframe,
  TokenListItem,
  TokenTrade,
} from "@/lib/api";

export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const MOCK_TOKENS: TokenListItem[] = [
  {
    address: "new1alpha9q8w7e6r5t4y3u2i1o0p",
    name: "Aurora Foundry",
    symbol: "AUR",
    image: null,
    description: "AI-native tooling for creators launching autonomous brands.",
    creator: "new1makerx0l8q9w2e5r7t",
    source: "launchpad",
    graduated: false,
    created_at: isoHoursAgo(1),
    first_seen_at: isoHoursAgo(1),
    current_price: "0.00194",
    xyz_reserves: "18600000",
    volume_24h: "49500000",
    trade_count_24h: 154,
  },
  {
    address: "new1beta4r6t8y1u3i5o7p9a2s4d",
    name: "Pilot Grid",
    symbol: "PGRD",
    image: null,
    description: "Infrastructure credits for autonomous deployment pipelines.",
    creator: "new1pilot9m2n6b4v8c3x",
    source: "launchpad",
    graduated: false,
    created_at: isoHoursAgo(3),
    first_seen_at: isoHoursAgo(3),
    current_price: "0.00133",
    xyz_reserves: "16200000",
    volume_24h: "42000000",
    trade_count_24h: 98,
  },
  {
    address: "new1gamma5t7y9u2i4o6p8a1s3d5",
    name: "Drift Room",
    symbol: "DRFT",
    image: null,
    description: "Collaborative onchain narratives and world-building drops.",
    creator: "new1drift2q6w9e4r7t1y",
    source: "launchpad",
    graduated: false,
    created_at: isoHoursAgo(5),
    first_seen_at: isoHoursAgo(5),
    current_price: "0.00112",
    xyz_reserves: "10900000",
    volume_24h: "36600000",
    trade_count_24h: 83,
  },
  {
    address: "new1delta6y8u1i3o5p7a9s2d4f6",
    name: "Signal Harbor",
    symbol: "SHBR",
    image: null,
    description: "Realtime sentiment streams from curated trading collectives.",
    creator: "new1signal6m3n8b4v2c1",
    source: "launchpad",
    graduated: false,
    created_at: isoHoursAgo(8),
    first_seen_at: isoHoursAgo(8),
    current_price: "0.00087",
    xyz_reserves: "7500000",
    volume_24h: "23900000",
    trade_count_24h: 61,
  },
  {
    address: "new1echo7u9i2o4p6a8s1d3f5g7",
    name: "Nexus Bloom",
    symbol: "NBLM",
    image: null,
    description: "Toolkit for tokenized membership and gated growth loops.",
    creator: "new1nexus7q2w6e9r4t8",
    source: "launchpad",
    graduated: true,
    created_at: isoHoursAgo(13),
    first_seen_at: isoHoursAgo(13),
    current_price: "0.00384",
    xyz_reserves: "27400000",
    volume_24h: "76200000",
    trade_count_24h: 228,
  },
  {
    address: "new1foxtrot8i1o3p5a7s9d2f4g6",
    name: "Vector Lane",
    symbol: "VLAN",
    image: null,
    description: "Pricing rails for creator-owned ad inventory auctions.",
    creator: "new1vector9q5w2e8r1t7",
    source: "launchpad",
    graduated: true,
    created_at: isoHoursAgo(22),
    first_seen_at: isoHoursAgo(22),
    current_price: "0.00299",
    xyz_reserves: "22100000",
    volume_24h: "68800000",
    trade_count_24h: 207,
  },
  {
    address: "new1golf9o2p4a6s8d1f3g5h7",
    name: "Bright Syndicate",
    symbol: "BRGT",
    image: null,
    description: "Collective curation market for trend-driven token launches.",
    creator: "new1bright2q9w5e3r7t",
    source: "launchpad",
    graduated: true,
    created_at: isoHoursAgo(31),
    first_seen_at: isoHoursAgo(31),
    current_price: "0.00251",
    xyz_reserves: "17900000",
    volume_24h: "50200000",
    trade_count_24h: 176,
  },
  {
    address: "new1hotel1p3a5s7d9f2g4h6j8",
    name: "Orbit Canvas",
    symbol: "ORBC",
    image: null,
    description: "Multiformat launchpad media engine for token storytelling.",
    creator: "new1orbit4q8w1e6r3t9",
    source: "launchpad",
    graduated: true,
    created_at: isoHoursAgo(40),
    first_seen_at: isoHoursAgo(40),
    current_price: "0.00214",
    xyz_reserves: "14200000",
    volume_24h: "41900000",
    trade_count_24h: 133,
  },
  {
    address: "new1india2a4s6d8f1g3h5j7k9",
    name: "Delta Courtyard",
    symbol: "DYRD",
    image: null,
    description: "Community-owned launch calendars with reputation routing.",
    creator: "new1delta3q7w4e8r2t6",
    source: "launchpad",
    graduated: false,
    created_at: isoHoursAgo(16),
    first_seen_at: isoHoursAgo(16),
    current_price: "0.00066",
    xyz_reserves: "4900000",
    volume_24h: "17600000",
    trade_count_24h: 48,
  },
  {
    address: "new1juliet3s5d7f9g2h4j6k8l1",
    name: "Quantum Relay",
    symbol: "QREL",
    image: null,
    description: "Orderflow relay layer for bonded token markets.",
    creator: "new1quant8q3w6e1r5t9",
    source: "launchpad",
    graduated: false,
    created_at: isoHoursAgo(28),
    first_seen_at: isoHoursAgo(28),
    current_price: "0.00058",
    xyz_reserves: "3700000",
    volume_24h: "13200000",
    trade_count_24h: 41,
  },
];

const DEFAULT_PROGRESS: CurveProgress = {
  tokens_sold: "453000000",
  tokens_remaining: "547000000",
  xyz_reserves: "1220000",
  graduation_threshold: "26436000",
  progress_percent: 3.56,
  current_price: "0.00112",
  graduated: false,
};

const MOCK_PROGRESS: Record<string, CurveProgress> = {
  [MOCK_TOKENS[0].address]: {
    ...DEFAULT_PROGRESS,
    progress_percent: 3.56,
    current_price: MOCK_TOKENS[0].current_price,
  },
  [MOCK_TOKENS[1].address]: {
    ...DEFAULT_PROGRESS,
    progress_percent: 4.88,
    xyz_reserves: "1460000",
    current_price: MOCK_TOKENS[1].current_price,
  },
  [MOCK_TOKENS[2].address]: {
    ...DEFAULT_PROGRESS,
    progress_percent: 2.71,
    xyz_reserves: "980000",
    current_price: MOCK_TOKENS[2].current_price,
  },
};

export function getMockTokenByAddress(address: string): TokenListItem {
  const byExact = MOCK_TOKENS.find((item) => item.address === address);
  if (byExact) return byExact;

  const fromHash = hashString(address) % MOCK_TOKENS.length;
  const base = MOCK_TOKENS[fromHash];
  return { ...base, address };
}

export function getMockCurveProgress(address: string): CurveProgress {
  return MOCK_PROGRESS[address] ?? {
    ...DEFAULT_PROGRESS,
    current_price: getMockTokenByAddress(address).current_price,
    progress_percent: 2.4 + (hashString(address) % 360) / 100,
  };
}

export function getMockTokenTrades(address: string): TokenTrade[] {
  const seed = hashString(address);
  const entries = Array.from({ length: 14 }).map((_, index) => {
    const id = seed + index * 9_971;
    const isBuy = index % 3 !== 0;
    const xyzAmount = 90_000 + (id % 700_000);
    const tokenAmount = 180_000 + (id % 540_000);
    return {
      time: new Date(Date.now() - (index + 1) * 14 * 60 * 1000).toISOString(),
      tx_hash: `MOCK${id.toString(16).toUpperCase().slice(0, 10)}`,
      action: isBuy ? "buy" : "sell",
      trader: `new1${id.toString(36).padStart(12, "0")}`,
      xyz_amount: String(xyzAmount),
      token_amount: String(tokenAmount),
      fee: String(Math.floor(xyzAmount * 0.0035)),
    } satisfies TokenTrade;
  });

  return entries;
}

const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 300,
  "1h": 3600,
  "1d": 86400,
};

export function getMockCandles(
  tokenAddress: string,
  timeframe: Timeframe,
  limit = 300,
): CandleResponse {
  const interval = TIMEFRAME_SECONDS[timeframe];
  const count = Math.min(limit, timeframe === "1d" ? 120 : 180);
  const now = Math.floor(Date.now() / 1000);
  const start = now - count * interval;

  let seed = hashString(`${tokenAddress}:${timeframe}`);
  let price = 100_000 + (seed % 240_000);

  const candles: CandleResponse["candles"] = [];
  for (let index = 0; index < count; index++) {
    seed = nextSeed(seed);
    const drift = ((seed % 1_000) / 1_000 - 0.5) * 0.14;
    const open = price;
    const close = Math.max(20_000, Math.round(open * (1 + drift)));

    seed = nextSeed(seed);
    const spreadHigh = 1 + ((seed % 1_000) / 1_000) * 0.06;
    seed = nextSeed(seed);
    const spreadLow = 1 - ((seed % 1_000) / 1_000) * 0.06;

    const high = Math.round(Math.max(open, close) * spreadHigh);
    const low = Math.max(10_000, Math.round(Math.min(open, close) * spreadLow));

    seed = nextSeed(seed);
    const volume = 120_000 + (seed % 2_900_000);

    candles.push({
      time: new Date((start + index * interval) * 1000).toISOString(),
      open: String(open),
      high: String(high),
      low: String(Math.min(low, open, close)),
      close: String(close),
      volume: String(volume),
      trade_count: 2 + (seed % 18),
    });

    price = close;
  }

  return {
    token_address: tokenAddress,
    timeframe,
    candles,
  };
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function nextSeed(seed: number): number {
  return (seed * 1_664_525 + 1_013_904_223) >>> 0;
}
