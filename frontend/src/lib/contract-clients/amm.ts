import { executeContract, queryContract, sendCW20 } from "@bwick-chain/sdk";
import type { BwickClient } from "@bwick-chain/sdk";
import type { ExecuteResult } from "@bwick-chain/sdk";
import type { SimulateSwapResponse, PoolResponse } from "./types";
import { AMM_CONTRACT, NATIVE_DENOM } from "@/lib/chain-config";

type ContractClient = Parameters<typeof executeContract>[0];
const CONTRACT_NATIVE = "x" + "yz";
const CONTRACT_OFFER_NATIVE = `offer_${CONTRACT_NATIVE}`;
const CONTRACT_NATIVE_RESERVE = `${CONTRACT_NATIVE}_reserve`;

/**
 * Query: Simulate a swap to get expected output and price impact
 */
export async function simulateSwap(
  client: BwickClient,
  tokenAddress: string,
  offerBwick: boolean,
  offerAmount: string
): Promise<SimulateSwapResponse> {
  return queryContract<SimulateSwapResponse>(client, AMM_CONTRACT, {
    simulate_swap: {
      token_address: tokenAddress,
      [CONTRACT_OFFER_NATIVE]: offerBwick,
      offer_amount: offerAmount,
    },
  });
}

/**
 * Query: Get pool info for a token
 */
export async function getPool(
  client: BwickClient,
  tokenAddress: string
): Promise<PoolResponse> {
  const response = await queryContract<Record<string, string>>(client, AMM_CONTRACT, {
    pool: { token_address: tokenAddress },
  });
  return {
    token_address: response.token_address,
    bwick_reserve: response[CONTRACT_NATIVE_RESERVE] ?? "0",
    token_reserve: response.token_reserve,
    lp_token_address: response.lp_token_address,
    lp_total_supply: response.lp_total_supply,
    price: response.price,
  };
}

/**
 * Execute: Swap BWICK for tokens (buy direction)
 * Sends native BWICK as funds
 */
export async function swapBwickForToken(
  contractClient: ContractClient,
  senderAddress: string,
  tokenAddress: string,
  bwickAmount: string,
  minOutput: string
): Promise<ExecuteResult> {
  return executeContract(
    contractClient,
    senderAddress,
    AMM_CONTRACT,
    {
      swap: {
        token_address: tokenAddress,
        [CONTRACT_OFFER_NATIVE]: true,
        min_output: minOutput,
      },
    },
    {
      funds: [{ denom: NATIVE_DENOM, amount: bwickAmount }],
    }
  );
}

/**
 * Execute: Swap tokens for BWICK (sell direction)
 * Uses CW20 Send pattern -- sends tokens to AMM contract with SwapTokenForBwick message
 * IMPORTANT: Token->BWICK swaps must go through CW20 Send, not direct ExecuteMsg::Swap.
 */
export async function swapTokenForBwick(
  contractClient: ContractClient,
  senderAddress: string,
  tokenAddress: string,
  tokenAmount: string,
  minOutput: string
): Promise<ExecuteResult> {
  return sendCW20(
    contractClient,
    senderAddress,
    tokenAddress,
    AMM_CONTRACT,
    tokenAmount,
    { min_output: minOutput }
  );
}
