import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NATIVE_SYMBOL } from "./chain-config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// BWICK has 6 decimals: 1 BWICK = 1,000,000 ubwick
const UBWICK_DECIMALS = 6;
const UBWICK_MULTIPLIER = 10 ** UBWICK_DECIMALS;

/**
 * Convert display BWICK amount to micro-unit string for contract calls.
 * Example: "1.5" -> "1500000"
 */
export function toUbwick(bwickAmount: string): string {
  const num = Number(bwickAmount);
  if (isNaN(num) || num <= 0) return "0";
  return Math.floor(num * UBWICK_MULTIPLIER).toString();
}

/**
 * Convert micro-unit string to display BWICK number.
 * Example: "1500000" -> 1.5
 */
export function fromUbwick(ubwickAmount: string): number {
  const num = Number(ubwickAmount);
  if (isNaN(num)) return 0;
  return num / UBWICK_MULTIPLIER;
}

/**
 * Format a native micro-unit amount as a human-readable BWICK string.
 * Example: "1500000" -> "1.50 BWICK"
 */
export function formatBwickAmount(ubwickAmount: string): string {
  const num = fromUbwick(ubwickAmount);
  if (num === 0) return `0 ${NATIVE_SYMBOL}`;
  if (num < 0.001) return `${num.toExponential(2)} ${NATIVE_SYMBOL}`;
  if (num < 1) return `${num.toFixed(6)} ${NATIVE_SYMBOL}`;
  if (num < 1000) return `${num.toFixed(2)} ${NATIVE_SYMBOL}`;
  if (num < 1_000_000) return `${(num / 1000).toFixed(1)}K ${NATIVE_SYMBOL}`;
  return `${(num / 1_000_000).toFixed(2)}M ${NATIVE_SYMBOL}`;
}

/**
 * Format a token amount (also 6 decimals for CW20 tokens) as human-readable string.
 * Example: "1500000" -> "1.50"
 */
export function formatTokenAmount(amount: string): string {
  const num = Number(amount) / UBWICK_MULTIPLIER;
  if (num === 0) return "0";
  if (num < 0.01) return num.toExponential(2);
  if (num < 1000) return num.toFixed(2);
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Format a number as a USD string.
 */
export function formatUsd(usdAmount: number): string {
  if (usdAmount === 0) return "$0.00";
  if (usdAmount < 0.0001) return `$${usdAmount.toExponential(2)}`;
  if (usdAmount < 0.01) return `$${usdAmount.toFixed(6)}`;
  if (usdAmount < 1) return `$${usdAmount.toFixed(4)}`;
  if (usdAmount < 1000) return `$${usdAmount.toFixed(2)}`;
  if (usdAmount < 1_000_000) return `$${(usdAmount / 1000).toFixed(1)}K`;
  if (usdAmount < 1_000_000_000) return `$${(usdAmount / 1_000_000).toFixed(2)}M`;
  return `$${(usdAmount / 1_000_000_000).toFixed(2)}B`;
}

/**
 * Format a ubwick amount as a USD string using oracle price.
 */
export function formatUbwickAsUsd(ubwickAmount: string, bwickPriceUsd: number): string {
  return formatUsd(fromUbwick(ubwickAmount) * bwickPriceUsd);
}

/**
 * Compute minimum output with slippage tolerance using BigInt for precision.
 * slippagePercent is in percentage (e.g., 1 = 1%, 0.5 = 0.5%).
 * Example: computeMinOutput("1000000", 1) -> "990000"
 */
export function computeMinOutput(
  simulatedOutput: string,
  slippagePercent: number
): string {
  const output = BigInt(simulatedOutput);
  // Convert slippage% to basis points: 1% = 100 bps
  // Multiply by 100 to support 0.1% precision
  const slippageBps = Math.round(slippagePercent * 100);
  const minOutput = (output * BigInt(10000 - slippageBps)) / BigInt(10000);
  return minOutput.toString();
}
