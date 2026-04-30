import type { WalletType } from "./types.js";

export function isKeplrAvailable(): boolean {
  return typeof window !== "undefined" && !!window.keplr;
}

export function isLeapAvailable(): boolean {
  return typeof window !== "undefined" && !!window.leap;
}

export function isBwickWalletAvailable(): boolean {
  return typeof window !== "undefined" && !!window.bwick;
}

export function getAvailableWallets(): WalletType[] {
  const wallets: WalletType[] = [];
  if (isKeplrAvailable()) wallets.push("keplr");
  if (isLeapAvailable()) wallets.push("leap");
  if (isBwickWalletAvailable()) wallets.push("bwick");
  return wallets;
}
