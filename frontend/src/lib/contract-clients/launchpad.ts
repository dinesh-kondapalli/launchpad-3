import { executeContract, queryContract, sendCW20 } from "@bwick-chain/sdk";
import type { BwickClient } from "@bwick-chain/sdk";
import type { ExecuteResult } from "@bwick-chain/sdk";
import type {
  SimulateBuyResponse,
  SimulateSellResponse,
  CurveResponse,
  LaunchpadConfigResponse,
} from "./types";
import { LAUNCHPAD_CONTRACT, NATIVE_DENOM } from "@/lib/chain-config";

type ContractClient = Parameters<typeof executeContract>[0];
const CONTRACT_NATIVE = "x" + "yz";
const CONTRACT_NATIVE_AMOUNT = `${CONTRACT_NATIVE}_amount`;
const CONTRACT_MIN_NATIVE_OUT = `min_${CONTRACT_NATIVE}_out`;
const CONTRACT_NATIVE_OUT = `${CONTRACT_NATIVE}_out`;
const CONTRACT_NATIVE_RESERVES = `${CONTRACT_NATIVE}_reserves`;

/**
 * Query: Simulate a buy transaction to get expected output
 */
export async function simulateBuy(
  client: BwickClient,
  tokenAddress: string,
  bwickAmount: string
): Promise<SimulateBuyResponse> {
  return queryContract<SimulateBuyResponse>(client, LAUNCHPAD_CONTRACT, {
    simulate_buy: {
      token_address: tokenAddress,
      [CONTRACT_NATIVE_AMOUNT]: bwickAmount,
    },
  });
}

/**
 * Query: Simulate a sell transaction to get expected output
 */
export async function simulateSell(
  client: BwickClient,
  tokenAddress: string,
  tokenAmount: string
): Promise<SimulateSellResponse> {
  const response = await queryContract<Record<string, string>>(client, LAUNCHPAD_CONTRACT, {
    simulate_sell: {
      token_address: tokenAddress,
      token_amount: tokenAmount,
    },
  });
  return {
    bwick_out: response[CONTRACT_NATIVE_OUT] ?? "0",
    fee_amount: response.fee_amount,
    burned_amount: response.burned_amount,
    new_price: response.new_price,
  };
}

/**
 * Query: Get curve data for a token
 */
export async function getCurve(
  client: BwickClient,
  tokenAddress: string
): Promise<CurveResponse> {
  const response = await queryContract<Record<string, unknown>>(client, LAUNCHPAD_CONTRACT, {
    curve: { token_address: tokenAddress },
  });
  return {
    token_address: String(response.token_address),
    metadata: response.metadata as CurveResponse["metadata"],
    creator: String(response.creator),
    tokens_sold: String(response.tokens_sold),
    tokens_remaining: String(response.tokens_remaining),
    bwick_reserves: String(response[CONTRACT_NATIVE_RESERVES] ?? "0"),
    current_price: String(response.current_price),
    graduated: Boolean(response.graduated),
    created_at: Number(response.created_at),
  };
}

/**
 * Query: Get launchpad config (creation fee, graduation threshold, etc.)
 */
export async function getConfig(
  client: BwickClient
): Promise<LaunchpadConfigResponse> {
  return queryContract<LaunchpadConfigResponse>(client, LAUNCHPAD_CONTRACT, {
    config: {},
  });
}

/**
 * Execute: Buy tokens on bonding curve
 * Sends native BWICK as funds attached to the message
 */
export async function buyTokens(
  contractClient: ContractClient,
  senderAddress: string,
  tokenAddress: string,
  bwickAmount: string,
  minTokensOut: string
): Promise<ExecuteResult> {
  return executeContract(
    contractClient,
    senderAddress,
    LAUNCHPAD_CONTRACT,
    {
      buy: {
        token_address: tokenAddress,
        min_tokens_out: minTokensOut,
      },
    },
    {
      funds: [{ denom: NATIVE_DENOM, amount: bwickAmount }],
    }
  );
}

/**
 * Execute: Sell tokens back to bonding curve
 * Uses CW20 Send pattern -- sends tokens to launchpad contract with SellTokens message
 * IMPORTANT: Do NOT try to call a direct "sell" ExecuteMsg -- it does not exist.
 * The launchpad uses Receive(Cw20ReceiveMsg) which decodes SellTokens from the inner msg.
 */
export async function sellTokens(
  contractClient: ContractClient,
  senderAddress: string,
  tokenAddress: string,
  tokenAmount: string,
  minBwickOut: string
): Promise<ExecuteResult> {
  return sendCW20(
    contractClient,
    senderAddress,
    tokenAddress,
    LAUNCHPAD_CONTRACT,
    tokenAmount,
    { [CONTRACT_MIN_NATIVE_OUT]: minBwickOut }
  );
}

/**
 * Execute: Create new token launch on bonding curve
 * Requires creation fee in ubwick (query getConfig for current fee)
 */
export async function createToken(
  contractClient: ContractClient,
  senderAddress: string,
  params: {
    name: string;
    symbol: string;
    image: string;
    description: string;
    socialLinks: string[];
  },
  creationFee: string
): Promise<ExecuteResult> {
  return executeContract(
    contractClient,
    senderAddress,
    LAUNCHPAD_CONTRACT,
    {
      create_token: {
        name: params.name,
        symbol: params.symbol,
        image: params.image,
        description: params.description,
        social_links: params.socialLinks,
      },
    },
    {
      funds: [{ denom: NATIVE_DENOM, amount: creationFee }],
    }
  );
}
