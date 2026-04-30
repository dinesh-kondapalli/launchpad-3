export interface Coin {
  denom: string;
  amount: string;
}

// BWICK uses 6 decimals like Solana
export const BWICK_DECIMALS = 6;
export const BWICK_DENOM = "ubwick";

export function formatBwick(amount: string): string {
  const value = BigInt(amount);
  const whole = value / BigInt(10 ** BWICK_DECIMALS);
  const frac = value % BigInt(10 ** BWICK_DECIMALS);
  return `${whole}.${frac.toString().padStart(BWICK_DECIMALS, "0")}`;
}

export function parseBwick(amount: string): string {
  const [whole, frac = ""] = amount.split(".");
  const fracPadded = frac.padEnd(BWICK_DECIMALS, "0").slice(0, BWICK_DECIMALS);
  return (
    BigInt(whole) * BigInt(10 ** BWICK_DECIMALS) + BigInt(fracPadded)
  ).toString();
}
