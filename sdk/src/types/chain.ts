export interface BwickChainConfig {
  rpcEndpoint: string;
  restEndpoint?: string;
  chainId?: string; // defaults to "bwick-1"
  prefix?: string; // defaults to "bwick"
}

export const DEFAULT_CONFIG: Partial<BwickChainConfig> = {
  chainId: "bwick-1",
  prefix: "bwick",
};
