import type { ChainInfo } from "./types.js";

/**
 * BWICK chain info for wallet registration
 * Used when chain is not yet in wallet's chain registry
 */
export function getBwickChainInfo(rpcEndpoint: string, restEndpoint: string, chainId?: string): ChainInfo {
  const id = chainId ?? "bwick-1";
  const isTestnet = id.includes("testnet");
  return {
    chainId: id,
    chainName: isTestnet ? "BWICK Testnet" : "BWICK Chain",
    rpc: rpcEndpoint,
    rest: restEndpoint,
    bip44: { coinType: 118 }, // Cosmos coin type
    bech32Config: {
      bech32PrefixAccAddr: "bwick",
      bech32PrefixAccPub: "bwickpub",
      bech32PrefixValAddr: "bwickvaloper",
      bech32PrefixValPub: "bwickvaloperpub",
      bech32PrefixConsAddr: "bwickvalcons",
      bech32PrefixConsPub: "bwickvalconspub",
    },
    currencies: [
      {
        coinDenom: "BWICK",
        coinMinimalDenom: "ubwick",
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "BWICK",
        coinMinimalDenom: "ubwick",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "BWICK",
      coinMinimalDenom: "ubwick",
      coinDecimals: 6,
    },
  };
}
