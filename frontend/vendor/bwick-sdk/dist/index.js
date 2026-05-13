// src/client.ts
import { StargateClient } from "@cosmjs/stargate";

// src/types/chain.ts
var DEFAULT_CONFIG = {
  chainId: "bwick-1",
  prefix: "bwick"
};

// src/client.ts
async function createClient(config) {
  const fullConfig = {
    rpcEndpoint: config.rpcEndpoint,
    restEndpoint: config.restEndpoint ?? config.rpcEndpoint.replace(/:\d+$/, ":1317"),
    chainId: config.chainId ?? DEFAULT_CONFIG.chainId,
    prefix: config.prefix ?? DEFAULT_CONFIG.prefix
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
    }
  };
}

// src/types/coin.ts
var BWICK_DECIMALS = 6;
var BWICK_DENOM = "ubwick";
function formatBwick(amount) {
  const value = BigInt(amount);
  const whole = value / BigInt(10 ** BWICK_DECIMALS);
  const frac = value % BigInt(10 ** BWICK_DECIMALS);
  return `${whole}.${frac.toString().padStart(BWICK_DECIMALS, "0")}`;
}
function parseBwick(amount) {
  const [whole, frac = ""] = amount.split(".");
  const fracPadded = frac.padEnd(BWICK_DECIMALS, "0").slice(0, BWICK_DECIMALS);
  return (BigInt(whole) * BigInt(10 ** BWICK_DECIMALS) + BigInt(fracPadded)).toString();
}

// src/types/transaction.ts
function toTxResult(response) {
  return {
    transactionHash: response.transactionHash,
    height: response.height,
    gasUsed: Number(response.gasUsed),
    gasWanted: Number(response.gasWanted),
    code: response.code,
    rawLog: response.rawLog
  };
}

// src/queries/balance.ts
async function getBalance(client, address) {
  const coin = await client.stargate.getBalance(address, BWICK_DENOM);
  return {
    denom: coin.denom,
    amount: coin.amount
  };
}
async function getAllBalances(client, address) {
  const balances = await client.stargate.getAllBalances(address);
  return balances.map((b) => ({ denom: b.denom, amount: b.amount }));
}

// src/queries/token.ts
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
var cwClientCache = /* @__PURE__ */ new Map();
async function getCwClient(client) {
  const endpoint = client.config.rpcEndpoint;
  let cwClient = cwClientCache.get(endpoint);
  if (!cwClient) {
    cwClient = await CosmWasmClient.connect(endpoint);
    cwClientCache.set(endpoint, cwClient);
  }
  return cwClient;
}
async function getTokenBalance(client, contractAddress, address) {
  const cwClient = await getCwClient(client);
  const result = await cwClient.queryContractSmart(contractAddress, {
    balance: { address }
  });
  return result.balance;
}
async function getTokenInfo(client, contractAddress) {
  const cwClient = await getCwClient(client);
  return cwClient.queryContractSmart(contractAddress, {
    token_info: {}
  });
}
async function getTokenMarketingInfo(client, contractAddress) {
  try {
    const cwClient = await getCwClient(client);
    return await cwClient.queryContractSmart(contractAddress, {
      marketing_info: {}
    });
  } catch {
    return null;
  }
}
async function getFormattedTokenInfo(client, contractAddress) {
  const info = await getTokenInfo(client, contractAddress);
  const divisor = BigInt(10 ** info.decimals);
  const supply = BigInt(info.total_supply);
  const whole = supply / divisor;
  const frac = supply % divisor;
  return {
    contractAddress,
    name: info.name,
    symbol: info.symbol,
    decimals: info.decimals,
    totalSupply: info.total_supply,
    formattedTotalSupply: `${whole}.${frac.toString().padStart(info.decimals, "0")}`
  };
}

// src/transactions/signing.ts
import { SigningStargateClient, GasPrice, calculateFee } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
var DEFAULT_GAS_PRICE = `0.025${BWICK_DENOM}`;
var DEFAULT_GAS_ADJUSTMENT = 1.3;
async function createSigningClient(config, mnemonic) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
    mnemonic,
    { prefix: config.prefix ?? "bwick" }
  );
  const [account] = await wallet.getAccounts();
  const address = account.address;
  const signingClient = await SigningStargateClient.connectWithSigner(
    config.rpcEndpoint,
    wallet,
    {
      gasPrice: GasPrice.fromString(DEFAULT_GAS_PRICE)
    }
  );
  return {
    address,
    signingClient,
    disconnect() {
      signingClient.disconnect();
    }
  };
}
function calculateTxFee(gasEstimate, feeConfig) {
  const gasPrice = GasPrice.fromString(
    feeConfig?.gasPrice ?? DEFAULT_GAS_PRICE
  );
  const gasAdjustment = feeConfig?.gasAdjustment ?? DEFAULT_GAS_ADJUSTMENT;
  const adjustedGas = Math.ceil(gasEstimate * gasAdjustment);
  return calculateFee(adjustedGas, gasPrice);
}

// src/transactions/send.ts
async function sendTokens(client, recipient, amount, options) {
  const coins = Array.isArray(amount) ? amount : [amount];
  let fee;
  if (options?.gas === "auto" || !options?.gas) {
    const gasEstimate = await client.signingClient.simulate(
      client.address,
      [
        {
          typeUrl: "/cosmos.bank.v1beta1.MsgSend",
          value: {
            fromAddress: client.address,
            toAddress: recipient,
            amount: coins
          }
        }
      ],
      options?.memo
    );
    fee = calculateTxFee(gasEstimate, options);
  } else {
    fee = calculateTxFee(parseInt(options.gas, 10), options);
  }
  const result = await client.signingClient.sendTokens(
    client.address,
    recipient,
    coins,
    fee,
    options?.memo
  );
  return toTxResult(result);
}
async function sendBwick(client, recipient, amount, options) {
  return sendTokens(
    client,
    recipient,
    { denom: BWICK_DENOM, amount },
    options
  );
}

// src/wallet/chain-info.ts
function getBwickChainInfo(rpcEndpoint, restEndpoint, chainId) {
  const id = chainId ?? "bwick-1";
  const isTestnet = id.includes("testnet");
  return {
    chainId: id,
    chainName: isTestnet ? "BWICK Testnet" : "BWICK Chain",
    rpc: rpcEndpoint,
    rest: restEndpoint,
    bip44: { coinType: 118 },
    // Cosmos coin type
    bech32Config: {
      bech32PrefixAccAddr: "bwick",
      bech32PrefixAccPub: "bwickpub",
      bech32PrefixValAddr: "bwickvaloper",
      bech32PrefixValPub: "bwickvaloperpub",
      bech32PrefixConsAddr: "bwickvalcons",
      bech32PrefixConsPub: "bwickvalconspub"
    },
    currencies: [
      {
        coinDenom: "BWICK",
        coinMinimalDenom: "ubwick",
        coinDecimals: 6
      }
    ],
    feeCurrencies: [
      {
        coinDenom: "BWICK",
        coinMinimalDenom: "ubwick",
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.04
        }
      }
    ],
    stakeCurrency: {
      coinDenom: "BWICK",
      coinMinimalDenom: "ubwick",
      coinDecimals: 6
    }
  };
}

// src/wallet/detect.ts
function isKeplrAvailable() {
  return typeof window !== "undefined" && !!window.keplr;
}
function isLeapAvailable() {
  return typeof window !== "undefined" && !!window.leap;
}
function isBwickWalletAvailable() {
  return typeof window !== "undefined" && !!window.bwick;
}
function getAvailableWallets() {
  const wallets = [];
  if (isKeplrAvailable()) wallets.push("keplr");
  if (isLeapAvailable()) wallets.push("leap");
  if (isBwickWalletAvailable()) wallets.push("bwick");
  return wallets;
}

// src/wallet/keplr.ts
async function connectKeplr(options) {
  if (!isKeplrAvailable()) {
    throw new Error("Keplr wallet not found. Please install Keplr extension.");
  }
  const keplr = window.keplr;
  const chainId = options.chainId ?? "bwick-1";
  const restEndpoint = options.restEndpoint ?? options.rpcEndpoint.replace(/:\d+$/, ":1317");
  if (options.suggestChain !== false) {
    try {
      const chainInfo = getBwickChainInfo(options.rpcEndpoint, restEndpoint, chainId);
      await keplr.experimentalSuggestChain(chainInfo);
    } catch (error) {
      console.debug("Chain suggestion failed (may already exist):", error);
    }
  }
  await keplr.enable(chainId);
  const signer = await keplr.getOfflineSignerAuto(chainId);
  const accounts = await signer.getAccounts();
  if (accounts.length === 0) {
    throw new Error("No accounts found in Keplr");
  }
  return {
    type: "keplr",
    address: accounts[0].address,
    signer,
    disconnect: () => {
    }
  };
}
var KEPLR_ICON = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#3B82F6"/><path d="M20 10L28 15V25L20 30L12 25V15L20 10Z" stroke="white" stroke-width="2" fill="none"/></svg>`;

// src/wallet/leap.ts
async function connectLeap(options) {
  if (!isLeapAvailable()) {
    throw new Error("Leap wallet not found. Please install Leap extension.");
  }
  const leap = window.leap;
  const chainId = options.chainId ?? "bwick-1";
  const restEndpoint = options.restEndpoint ?? options.rpcEndpoint.replace(/:\d+$/, ":1317");
  if (options.suggestChain !== false) {
    try {
      const chainInfo = getBwickChainInfo(options.rpcEndpoint, restEndpoint, chainId);
      await leap.experimentalSuggestChain(chainInfo);
    } catch (error) {
      console.debug("Chain suggestion failed (may already exist):", error);
    }
  }
  await leap.enable(chainId);
  const signer = await leap.getOfflineSignerAuto(chainId);
  const accounts = await signer.getAccounts();
  if (accounts.length === 0) {
    throw new Error("No accounts found in Leap");
  }
  return {
    type: "leap",
    address: accounts[0].address,
    signer,
    disconnect: () => {
    }
  };
}
var LEAP_ICON = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#29A874"/><path d="M15 25L20 15L25 25" stroke="white" stroke-width="2" fill="none"/></svg>`;

// src/wallet/bwick-wallet.ts
async function connectBwickWallet(options) {
  if (!isBwickWalletAvailable()) {
    throw new Error("BWICK Wallet not found. Please install the BWICK Wallet extension.");
  }
  const wallet = window.bwick;
  const chainId = options.chainId ?? "bwick-1";
  const restEndpoint = options.restEndpoint ?? options.rpcEndpoint.replace(/:\d+$/, ":1317");
  if (options.suggestChain !== false) {
    try {
      const chainInfo = getBwickChainInfo(options.rpcEndpoint, restEndpoint, chainId);
      await wallet.experimentalSuggestChain(chainInfo);
    } catch (error) {
      console.debug("Chain suggestion failed (may already exist):", error);
    }
  }
  await wallet.enable(chainId);
  const signer = await wallet.getOfflineSignerAuto(chainId);
  const accounts = await signer.getAccounts();
  if (accounts.length === 0) {
    throw new Error("No accounts found in BWICK Wallet");
  }
  return {
    type: "bwick",
    address: accounts[0].address,
    signer,
    disconnect: () => {
    }
  };
}
var BWICK_WALLET_ICON = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#0066FF"/><text x="20" y="26" text-anchor="middle" fill="white" font-family="system-ui" font-weight="700" font-size="13">BW</text></svg>`;

// src/wallet/direct.ts
import { DirectSecp256k1HdWallet as DirectSecp256k1HdWallet2 } from "@cosmjs/proto-signing";
async function connectDirect(options) {
  const wallet = await DirectSecp256k1HdWallet2.fromMnemonic(
    options.mnemonic,
    { prefix: options.prefix ?? "bwick" }
  );
  const [account] = await wallet.getAccounts();
  return {
    type: "direct",
    address: account.address,
    signer: wallet,
    disconnect: () => {
    }
  };
}

// src/wallet/modal.ts
var WALLET_CONFIG = {
  keplr: { name: "Keplr", icon: KEPLR_ICON },
  leap: { name: "Leap", icon: LEAP_ICON },
  direct: { name: "Direct", icon: "" },
  bwick: { name: "BWICK Wallet", icon: BWICK_WALLET_ICON }
};
async function showWalletModal(options) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("showWalletModal requires a browser environment");
  }
  const availableWallets = getAvailableWallets();
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    const modal = document.createElement("div");
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      min-width: 320px;
      max-width: 400px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    `;
    const title = document.createElement("h2");
    title.textContent = "Connect Wallet";
    title.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
    `;
    modal.appendChild(title);
    const walletList = document.createElement("div");
    walletList.style.cssText = `display: flex; flex-direction: column; gap: 12px;`;
    const wallets = [
      { type: "keplr", ...WALLET_CONFIG.keplr, available: availableWallets.includes("keplr") },
      { type: "leap", ...WALLET_CONFIG.leap, available: availableWallets.includes("leap") },
      { type: "bwick", ...WALLET_CONFIG.bwick, available: availableWallets.includes("bwick") }
    ];
    const cleanup = () => {
      document.body.removeChild(overlay);
    };
    wallets.forEach((wallet) => {
      const button = document.createElement("button");
      button.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border: 1px solid ${wallet.available ? "#e5e5e5" : "#f0f0f0"};
        border-radius: 8px;
        background: ${wallet.available ? "white" : "#f9f9f9"};
        cursor: ${wallet.available ? "pointer" : "not-allowed"};
        opacity: ${wallet.available ? "1" : "0.5"};
        transition: border-color 0.2s, background 0.2s;
        font-size: 16px;
        color: #1a1a1a;
      `;
      if (wallet.available) {
        button.onmouseover = () => {
          button.style.borderColor = "#3B82F6";
          button.style.background = "#f8faff";
        };
        button.onmouseout = () => {
          button.style.borderColor = "#e5e5e5";
          button.style.background = "white";
        };
      }
      const icon = document.createElement("span");
      icon.innerHTML = wallet.icon;
      icon.style.cssText = `width: 32px; height: 32px;`;
      icon.querySelector("svg")?.setAttribute("width", "32");
      icon.querySelector("svg")?.setAttribute("height", "32");
      const name = document.createElement("span");
      name.textContent = wallet.name;
      name.style.cssText = `flex: 1; text-align: left; font-weight: 500;`;
      const status = document.createElement("span");
      status.textContent = wallet.available ? "" : "Not installed";
      status.style.cssText = `font-size: 12px; color: #888;`;
      button.appendChild(icon);
      button.appendChild(name);
      button.appendChild(status);
      if (wallet.available) {
        button.onclick = async () => {
          try {
            button.textContent = "Connecting...";
            button.disabled = true;
            const connectFn = wallet.type === "keplr" ? connectKeplr : wallet.type === "leap" ? connectLeap : connectBwickWallet;
            const connection = await connectFn(options);
            cleanup();
            resolve(connection);
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Connection failed";
            button.textContent = errorMsg;
            setTimeout(() => {
              button.textContent = "";
              button.appendChild(icon);
              button.appendChild(name);
              button.appendChild(status);
              button.disabled = false;
            }, 2e3);
          }
        };
      }
      walletList.appendChild(button);
    });
    modal.appendChild(walletList);
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
      margin-top: 16px;
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 8px;
      background: #f0f0f0;
      cursor: pointer;
      font-size: 14px;
      color: #666;
    `;
    cancelBtn.onmouseover = () => {
      cancelBtn.style.background = "#e5e5e5";
    };
    cancelBtn.onmouseout = () => {
      cancelBtn.style.background = "#f0f0f0";
    };
    cancelBtn.onclick = () => {
      cleanup();
      resolve(null);
    };
    modal.appendChild(cancelBtn);
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(null);
      }
    };
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  });
}

// src/contracts/query.ts
import { CosmWasmClient as CosmWasmClient2 } from "@cosmjs/cosmwasm-stargate";
var cwClientCache2 = /* @__PURE__ */ new Map();
async function getCwClient2(client) {
  const endpoint = client.config.rpcEndpoint;
  let cwClient = cwClientCache2.get(endpoint);
  if (!cwClient) {
    cwClient = await CosmWasmClient2.connect(endpoint);
    cwClientCache2.set(endpoint, cwClient);
  }
  return cwClient;
}
async function queryContract(client, contractAddress, queryMsg) {
  const cwClient = await getCwClient2(client);
  return cwClient.queryContractSmart(contractAddress, queryMsg);
}
async function getContractInfo(client, contractAddress) {
  const cwClient = await getCwClient2(client);
  const info = await cwClient.getContract(contractAddress);
  return {
    codeId: info.codeId,
    creator: info.creator,
    admin: info.admin,
    label: info.label
  };
}
async function getContractState(client, contractAddress, key) {
  const cwClient = await getCwClient2(client);
  return cwClient.queryContractRaw(contractAddress, key);
}

// src/contracts/execute.ts
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice as GasPrice2 } from "@cosmjs/stargate";
async function createContractClient(config, wallet) {
  return SigningCosmWasmClient.connectWithSigner(
    config.rpcEndpoint,
    wallet.signer,
    {
      gasPrice: GasPrice2.fromString(`0.025${BWICK_DENOM}`)
    }
  );
}
async function executeContract(contractClient, senderAddress, contractAddress, msg, options) {
  let fee;
  if (!options?.gas || options.gas === "auto") {
    const gasEstimate = await contractClient.simulate(
      senderAddress,
      [
        {
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: {
            sender: senderAddress,
            contract: contractAddress,
            msg: new TextEncoder().encode(JSON.stringify(msg)),
            funds: options?.funds ?? []
          }
        }
      ],
      options?.memo
    );
    fee = calculateTxFee(gasEstimate, options);
  } else {
    fee = calculateTxFee(parseInt(options.gas, 10), options);
  }
  const result = await contractClient.execute(
    senderAddress,
    contractAddress,
    msg,
    fee,
    options?.memo,
    options?.funds
  );
  const events = result.events.map((e) => ({
    type: e.type,
    attributes: e.attributes.map((a) => ({
      key: a.key,
      value: a.value
    }))
  }));
  const wasmEvent = result.events.find((e) => e.type === "wasm");
  const dataAttr = wasmEvent?.attributes.find((a) => a.key === "_contract_address" || a.key === "data");
  const data = dataAttr?.value;
  return {
    transactionHash: result.transactionHash,
    height: result.height,
    gasUsed: Number(result.gasUsed),
    gasWanted: Number(result.gasWanted),
    code: 0,
    // Success if we got here
    events,
    data
  };
}

// src/contracts/cw20.ts
async function getCW20Balance(client, tokenAddress, ownerAddress) {
  const result = await queryContract(client, tokenAddress, {
    balance: { address: ownerAddress }
  });
  return result.balance;
}
async function getCW20TokenInfo(client, tokenAddress) {
  return queryContract(client, tokenAddress, {
    token_info: {}
  });
}
async function getCW20Allowance(client, tokenAddress, owner, spender) {
  return queryContract(client, tokenAddress, {
    allowance: { owner, spender }
  });
}
async function transferCW20(contractClient, senderAddress, tokenAddress, recipient, amount, options) {
  return executeContract(
    contractClient,
    senderAddress,
    tokenAddress,
    {
      transfer: { recipient, amount }
    },
    options
  );
}
async function mintCW20(contractClient, senderAddress, tokenAddress, recipient, amount, options) {
  return executeContract(
    contractClient,
    senderAddress,
    tokenAddress,
    {
      mint: { recipient, amount }
    },
    options
  );
}
async function burnCW20(contractClient, senderAddress, tokenAddress, amount, options) {
  return executeContract(
    contractClient,
    senderAddress,
    tokenAddress,
    {
      burn: { amount }
    },
    options
  );
}
async function sendCW20(contractClient, senderAddress, tokenAddress, contractAddress, amount, msg, options) {
  const encodedMsg = Buffer.from(JSON.stringify(msg)).toString("base64");
  return executeContract(
    contractClient,
    senderAddress,
    tokenAddress,
    {
      send: {
        contract: contractAddress,
        amount,
        msg: encodedMsg
      }
    },
    options
  );
}
async function increaseAllowanceCW20(contractClient, senderAddress, tokenAddress, spender, amount, options) {
  return executeContract(
    contractClient,
    senderAddress,
    tokenAddress,
    {
      increase_allowance: { spender, amount }
    },
    options
  );
}
export {
  BWICK_DECIMALS,
  BWICK_DENOM,
  BWICK_WALLET_ICON,
  DEFAULT_CONFIG,
  KEPLR_ICON,
  LEAP_ICON,
  burnCW20,
  calculateTxFee,
  connectBwickWallet,
  connectDirect,
  connectKeplr,
  connectLeap,
  createClient,
  createContractClient,
  createSigningClient,
  executeContract,
  formatBwick,
  getAllBalances,
  getAvailableWallets,
  getBalance,
  getBwickChainInfo,
  getCW20Allowance,
  getCW20Balance,
  getCW20TokenInfo,
  getContractInfo,
  getContractState,
  getFormattedTokenInfo,
  getTokenBalance,
  getTokenInfo,
  getTokenMarketingInfo,
  increaseAllowanceCW20,
  isBwickWalletAvailable,
  isKeplrAvailable,
  isLeapAvailable,
  mintCW20,
  parseBwick,
  queryContract,
  sendBwick,
  sendCW20,
  sendTokens,
  showWalletModal,
  toTxResult,
  transferCW20
};
//# sourceMappingURL=index.js.map