import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type BwickClient } from "../client.js";
import { getBalance, getAllBalances } from "./balance.js";
import { BWICK_DENOM } from "../types/coin.js";

describe("balance queries", () => {
  let client: BwickClient | null = null;
  // Test address from genesis or localnet
  const testAddress = "bwick1cyyzpxplxdzkeea7kwsydadg87357qnalx9dqz";

  beforeAll(async () => {
    try {
      client = await createClient({
        rpcEndpoint: "http://localhost:26657",
      });
    } catch {
      // Node not running - tests will skip gracefully
      client = null;
    }
  });

  afterAll(() => {
    client?.disconnect();
  });

  it("should get native balance", async () => {
    if (!client) {
      console.log("Skipping: local node not running");
      return;
    }

    const balance = await getBalance(client, testAddress);
    expect(balance.denom).toBe(BWICK_DENOM);
    expect(typeof balance.amount).toBe("string");
    expect(BigInt(balance.amount)).toBeGreaterThanOrEqual(0n);
  });

  it("should get all balances", async () => {
    if (!client) {
      console.log("Skipping: local node not running");
      return;
    }

    const balances = await getAllBalances(client, testAddress);
    expect(Array.isArray(balances)).toBe(true);
    // Each balance should have denom and amount
    for (const bal of balances) {
      expect(bal.denom).toBeDefined();
      expect(bal.amount).toBeDefined();
    }
  });

  it("should return zero balance for new address", async () => {
    if (!client) {
      console.log("Skipping: local node not running");
      return;
    }

    // Random address that likely has no balance
    const emptyAddress = "bwick1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqdpz7hp";
    const balance = await getBalance(client, emptyAddress);
    expect(balance.denom).toBe(BWICK_DENOM);
    expect(balance.amount).toBe("0");
  });
});
