export { connectKeplr, KEPLR_ICON, type ConnectKeplrOptions } from "./keplr.js";
export { connectLeap, LEAP_ICON, type ConnectLeapOptions } from "./leap.js";
export { connectBwickWallet, BWICK_WALLET_ICON, type ConnectBwickWalletOptions } from "./bwick-wallet.js";
export { connectDirect, type ConnectDirectOptions } from "./direct.js";
export { showWalletModal, type WalletModalOptions } from "./modal.js";
export { isKeplrAvailable, isLeapAvailable, isBwickWalletAvailable, getAvailableWallets } from "./detect.js";
export { getBwickChainInfo } from "./chain-info.js";
export type { WalletConnection, WalletType, WalletProvider, ChainInfo } from "./types.js";
