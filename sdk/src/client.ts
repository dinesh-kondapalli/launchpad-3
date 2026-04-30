import { StargateClient } from "@cosmjs/stargate";
import { BwickChainConfig, DEFAULT_CONFIG } from "./types/chain.js";

export interface BwickClient {
  readonly config: Required<BwickChainConfig>;
  readonly stargate: StargateClient;
  getChainId(): Promise<string>;
  getHeight(): Promise<number>;
  disconnect(): void;
}

export async function createClient(
  config: BwickChainConfig
): Promise<BwickClient> {
  const fullConfig: Required<BwickChainConfig> = {
    rpcEndpoint: config.rpcEndpoint,
    restEndpoint:
      config.restEndpoint ?? config.rpcEndpoint.replace(/:\d+$/, ":1317"),
    chainId: config.chainId ?? DEFAULT_CONFIG.chainId!,
    prefix: config.prefix ?? DEFAULT_CONFIG.prefix!,
  };

  const stargate = await StargateClient.connect(fullConfig.rpcEndpoint);

  return {
    config: fullConfig,
    stargate,
    async getChainId() {
      return stargate.getChainId();
    },
    async getHeight() {
      return stargate.getHeight();
    },
    disconnect() {
      stargate.disconnect();
    },
  };
}
