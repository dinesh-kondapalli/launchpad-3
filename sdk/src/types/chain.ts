export interface XYZChainConfig {
  rpcEndpoint: string;
  restEndpoint?: string;
  chainId?: string; // defaults to "bwick-1"
  prefix?: string; // defaults to "bwick"
}

export const DEFAULT_CONFIG: Partial<XYZChainConfig> = {
  chainId: "bwick-1",
  prefix: "bwick",
};
