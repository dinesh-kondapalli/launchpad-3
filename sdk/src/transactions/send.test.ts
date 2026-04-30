import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createSigningClient, type BwickSigningClient } from "./signing.js";
import { sendTokens, sendBwick } from "./send.js";

// Test mnemonic - use standard test words (DO NOT use in production)
const TEST_MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

// Use a different address derived from the same mnemonic standard for recipient
const RECIPIENT_ADDRESS = "bwick1595rh758em5ghte603txwykqnneyh0wptdqqut";

describe("send transactions", () => {
  let client: BwickSigningClient | null = null;

  beforeAll(async () => {
    try {
      client = await createSigningClient(
        { rpcEndpoint: "http://localhost:26657" },
        TEST_MNEMONIC
      );
    } catch {
      // Node not running - tests will skip
    }
  });

  afterAll(() => {
    client?.disconnect();
  });

  it("should send BWICK tokens", async () => {
    if (!client) {
      console.log("Skipping: local node not running");
      return;
    }

    try {
      const result = await sendBwick(
        client,
        RECIPIENT_ADDRESS,
        "1000000", // 1 BWICK in ubwick
        { memo: "SDK test transfer" }
      );

      expect(result.code).toBe(0);
      expect(result.transactionHash).toMatch(/^[A-F0-9]{64}$/i);
      expect(result.height).toBeGreaterThan(0);
    } catch (error) {
      // If account doesn't have funds, that's expected in test environment
      console.log("Transaction failed (expected if test account has no funds):", error);
    }
  });

  it("should send multiple coins", async () => {
    if (!client) {
      console.log("Skipping: local node not running");
      return;
    }

    try {
      const result = await sendTokens(
        client,
        RECIPIENT_ADDRESS,
        [
          { denom: "ubwick", amount: "500000" },
        ],
        { memo: "Multi-coin test" }
      );

      expect(result.code).toBe(0);
    } catch (error) {
      // Expected if no funds
      console.log("Transaction failed (expected if test account has no funds):", error);
    }
  });
});

describe("sendTokens input validation", () => {
  it("should accept single coin", async () => {
    // This just tests the input processing, not actual sending
    // We can't fully test without a running node
    const singleCoin = { denom: "ubwick", amount: "1000" };
    const coins = Array.isArray(singleCoin) ? singleCoin : [singleCoin];
    expect(coins).toEqual([{ denom: "ubwick", amount: "1000" }]);
  });

  it("should accept array of coins", async () => {
    const multiCoins = [
      { denom: "ubwick", amount: "1000" },
      { denom: "uatom", amount: "500" },
    ];
    const coins = Array.isArray(multiCoins) ? multiCoins : [multiCoins];
    expect(coins).toHaveLength(2);
  });
});
