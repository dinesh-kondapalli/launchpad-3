// Use local proxy paths in the browser to avoid CORS issues
export const RPC_ENDPOINT =
  typeof window !== "undefined"
    ? `${window.location.origin}/rpc`
    : (process.env.NEXT_PUBLIC_RPC_ENDPOINT ?? "http://174.138.87.223:26657");

export const REST_ENDPOINT =
  typeof window !== "undefined"
    ? `${window.location.origin}/rest`
    : (process.env.NEXT_PUBLIC_REST_ENDPOINT ?? "http://174.138.87.223:1317");

export const CHAIN_ID =
  process.env.NEXT_PUBLIC_CHAIN_ID ?? "bwick-1";

export const NATIVE_DENOM = "ubwick";
export const NATIVE_SYMBOL = "BWICK";
export const LAUNCHPAD_CONTRACT =
  process.env.NEXT_PUBLIC_LAUNCHPAD_CONTRACT ??
  "bwick1qg5ega6dykkxc307y25pecuufrjkxkaggkkxh7nad0vhyhtuhw3sg09vt0";
export const AMM_CONTRACT =
  process.env.NEXT_PUBLIC_AMM_CONTRACT ??
  "bwick1wug8sewp6cedgkmrmvhl3lf3tulagm9hnvy8p0rppz9yjw0g4wtql49ren";

export const DEFAULT_TOKEN_SUPPLY = 1_000_000_000;
