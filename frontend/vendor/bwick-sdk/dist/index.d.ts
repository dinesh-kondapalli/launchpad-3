import { StargateClient, DeliverTxResponse, SigningStargateClient, StdFee } from '@cosmjs/stargate';
export { DeliverTxResponse } from '@cosmjs/stargate';
import { OfflineSigner, OfflineDirectSigner } from '@cosmjs/proto-signing';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';

interface BwickChainConfig {
    rpcEndpoint: string;
    restEndpoint?: string;
    chainId?: string;
    prefix?: string;
}
declare const DEFAULT_CONFIG: Partial<BwickChainConfig>;

interface BwickClient {
    readonly config: Required<BwickChainConfig>;
    readonly stargate: StargateClient;
    getChainId(): Promise<string>;
    getHeight(): Promise<number>;
    disconnect(): void;
}
declare function createClient(config: BwickChainConfig): Promise<BwickClient>;

interface Coin {
    denom: string;
    amount: string;
}
declare const BWICK_DECIMALS = 6;
declare const BWICK_DENOM = "ubwick";
declare function formatBwick(amount: string): string;
declare function parseBwick(amount: string): string;

interface TokenInfo {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: string;
}
interface TokenBalance {
    balance: string;
}
interface TokenMarketingInfo {
    project?: string;
    description?: string;
    marketing?: string;
    logo?: TokenLogo;
}
interface TokenLogo {
    url?: string;
    embedded?: string;
}
interface FormattedToken {
    contractAddress: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    formattedTotalSupply: string;
}

interface TxResult {
    transactionHash: string;
    height: number;
    gasUsed: number;
    gasWanted: number;
    code: number;
    rawLog?: string;
}
interface FeeConfig {
    gas?: string;
    gasPrice?: string;
    gasAdjustment?: number;
}
interface SendOptions extends FeeConfig {
    memo?: string;
}
declare function toTxResult(response: DeliverTxResponse): TxResult;

type ContractMsg = Record<string, unknown>;
type ContractQuery = Record<string, unknown>;
interface ExecuteOptions extends FeeConfig {
    memo?: string;
    funds?: Array<{
        denom: string;
        amount: string;
    }>;
}
interface ExecuteResult extends TxResult {
    events: ContractEvent[];
    data?: string;
}
interface ContractEvent {
    type: string;
    attributes: Array<{
        key: string;
        value: string;
    }>;
}
interface CW20TransferMsg {
    transfer: {
        recipient: string;
        amount: string;
    };
}
interface CW20MintMsg {
    mint: {
        recipient: string;
        amount: string;
    };
}
interface CW20BurnMsg {
    burn: {
        amount: string;
    };
}
interface CW20SendMsg {
    send: {
        contract: string;
        amount: string;
        msg: string;
    };
}
interface CW20IncreaseAllowanceMsg {
    increase_allowance: {
        spender: string;
        amount: string;
        expires?: {
            at_height: number;
        } | {
            at_time: string;
        } | {
            never: object;
        };
    };
}
interface CW20BalanceQuery {
    balance: {
        address: string;
    };
}
interface CW20TokenInfoQuery {
    token_info: object;
}
interface CW20AllowanceQuery {
    allowance: {
        owner: string;
        spender: string;
    };
}

/**
 * Get native BWICK balance for an address
 */
declare function getBalance(client: BwickClient, address: string): Promise<Coin>;
/**
 * Get all native token balances for an address
 */
declare function getAllBalances(client: BwickClient, address: string): Promise<readonly Coin[]>;

/**
 * Get CW20 token balance for an address
 */
declare function getTokenBalance(client: BwickClient, contractAddress: string, address: string): Promise<string>;
/**
 * Get CW20 token info
 */
declare function getTokenInfo(client: BwickClient, contractAddress: string): Promise<TokenInfo>;
/**
 * Get CW20 token marketing info (if available)
 */
declare function getTokenMarketingInfo(client: BwickClient, contractAddress: string): Promise<TokenMarketingInfo | null>;
/**
 * Get formatted token info with human-readable values
 */
declare function getFormattedTokenInfo(client: BwickClient, contractAddress: string): Promise<FormattedToken>;

interface BwickSigningClient {
    readonly address: string;
    readonly signingClient: SigningStargateClient;
    disconnect(): void;
}
/**
 * Create a signing client from a mnemonic
 * Use for server-side or CLI operations
 */
declare function createSigningClient(config: BwickChainConfig, mnemonic: string): Promise<BwickSigningClient>;
/**
 * Calculate fee based on gas estimate
 */
declare function calculateTxFee(gasEstimate: number, feeConfig?: FeeConfig): StdFee;

/**
 * Send native tokens to an address
 */
declare function sendTokens(client: BwickSigningClient, recipient: string, amount: Coin | Coin[], options?: SendOptions): Promise<TxResult>;
/**
 * Send native BWICK tokens (convenience function)
 */
declare function sendBwick(client: BwickSigningClient, recipient: string, amount: string, options?: SendOptions): Promise<TxResult>;

type WalletType = "keplr" | "leap" | "direct" | "bwick";
interface WalletConnection {
    type: WalletType;
    address: string;
    signer: OfflineSigner | OfflineDirectSigner;
    disconnect: () => void;
}
interface WalletProvider {
    type: WalletType;
    name: string;
    icon: string;
    isAvailable: () => boolean;
    connect: (chainId: string) => Promise<WalletConnection>;
}
declare global {
    interface Window {
        keplr?: {
            enable: (chainId: string) => Promise<void>;
            getOfflineSigner: (chainId: string) => OfflineSigner;
            getOfflineSignerAuto: (chainId: string) => Promise<OfflineSigner | OfflineDirectSigner>;
            experimentalSuggestChain: (chainInfo: ChainInfo) => Promise<void>;
        };
        leap?: {
            enable: (chainId: string) => Promise<void>;
            getOfflineSigner: (chainId: string) => OfflineSigner;
            getOfflineSignerAuto: (chainId: string) => Promise<OfflineSigner | OfflineDirectSigner>;
            experimentalSuggestChain: (chainInfo: ChainInfo) => Promise<void>;
        };
        bwick?: {
            enable: (chainId: string) => Promise<void>;
            getOfflineSignerAuto: (chainId: string) => Promise<OfflineSigner | OfflineDirectSigner>;
            experimentalSuggestChain: (chainInfo: ChainInfo) => Promise<void>;
        };
    }
}
interface ChainInfo {
    chainId: string;
    chainName: string;
    rpc: string;
    rest: string;
    bip44: {
        coinType: number;
    };
    bech32Config: {
        bech32PrefixAccAddr: string;
        bech32PrefixAccPub: string;
        bech32PrefixValAddr: string;
        bech32PrefixValPub: string;
        bech32PrefixConsAddr: string;
        bech32PrefixConsPub: string;
    };
    currencies: Array<{
        coinDenom: string;
        coinMinimalDenom: string;
        coinDecimals: number;
    }>;
    feeCurrencies: Array<{
        coinDenom: string;
        coinMinimalDenom: string;
        coinDecimals: number;
        gasPriceStep?: {
            low: number;
            average: number;
            high: number;
        };
    }>;
    stakeCurrency: {
        coinDenom: string;
        coinMinimalDenom: string;
        coinDecimals: number;
    };
}

interface ConnectKeplrOptions {
    chainId?: string;
    rpcEndpoint: string;
    restEndpoint?: string;
    suggestChain?: boolean;
}
/**
 * Connect to Keplr wallet
 * Prompts user to approve connection each time (no auto-reconnect)
 */
declare function connectKeplr(options: ConnectKeplrOptions): Promise<WalletConnection>;
declare const KEPLR_ICON = "<svg viewBox=\"0 0 40 40\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"40\" height=\"40\" rx=\"8\" fill=\"#3B82F6\"/><path d=\"M20 10L28 15V25L20 30L12 25V15L20 10Z\" stroke=\"white\" stroke-width=\"2\" fill=\"none\"/></svg>";

interface ConnectLeapOptions {
    chainId?: string;
    rpcEndpoint: string;
    restEndpoint?: string;
    suggestChain?: boolean;
}
/**
 * Connect to Leap wallet
 * Prompts user to approve connection each time (no auto-reconnect)
 */
declare function connectLeap(options: ConnectLeapOptions): Promise<WalletConnection>;
declare const LEAP_ICON = "<svg viewBox=\"0 0 40 40\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"40\" height=\"40\" rx=\"8\" fill=\"#29A874\"/><path d=\"M15 25L20 15L25 25\" stroke=\"white\" stroke-width=\"2\" fill=\"none\"/></svg>";

interface ConnectBwickWalletOptions {
    chainId?: string;
    rpcEndpoint: string;
    restEndpoint?: string;
    suggestChain?: boolean;
}
/**
 * Connect to BWICK Wallet
 * Prompts user to approve connection each time (no auto-reconnect)
 */
declare function connectBwickWallet(options: ConnectBwickWalletOptions): Promise<WalletConnection>;
declare const BWICK_WALLET_ICON = "<svg viewBox=\"0 0 40 40\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"40\" height=\"40\" rx=\"8\" fill=\"#0066FF\"/><text x=\"20\" y=\"26\" text-anchor=\"middle\" fill=\"white\" font-family=\"system-ui\" font-weight=\"700\" font-size=\"13\">BW</text></svg>";

interface ConnectDirectOptions {
    rpcEndpoint: string;
    chainId: string;
    mnemonic: string;
    prefix?: string;
}
/**
 * Connect directly via mnemonic — for development/testing only.
 * Do NOT use with real funds or production mnemonics.
 */
declare function connectDirect(options: ConnectDirectOptions): Promise<WalletConnection>;

interface WalletModalOptions {
    rpcEndpoint: string;
    restEndpoint?: string;
    chainId?: string;
    suggestChain?: boolean;
}
/**
 * Show wallet selection modal and connect to selected wallet
 * Returns null if user cancels
 */
declare function showWalletModal(options: WalletModalOptions): Promise<WalletConnection | null>;

declare function isKeplrAvailable(): boolean;
declare function isLeapAvailable(): boolean;
declare function isBwickWalletAvailable(): boolean;
declare function getAvailableWallets(): WalletType[];

/**
 * BWICK chain info for wallet registration
 * Used when chain is not yet in wallet's chain registry
 */
declare function getBwickChainInfo(rpcEndpoint: string, restEndpoint: string, chainId?: string): ChainInfo;

/**
 * Query a smart contract
 * @param client - BWICK client instance
 * @param contractAddress - Contract address (bwick1...)
 * @param queryMsg - Query message (e.g., { balance: { address: "bwick1..." } })
 * @returns Query result (type depends on contract)
 */
declare function queryContract<T = unknown>(client: BwickClient, contractAddress: string, queryMsg: ContractQuery): Promise<T>;
/**
 * Get contract info (code_id, creator, admin, label)
 */
declare function getContractInfo(client: BwickClient, contractAddress: string): Promise<{
    codeId: number;
    creator: string;
    admin?: string;
    label: string;
}>;
/**
 * Get raw contract state by key
 */
declare function getContractState(client: BwickClient, contractAddress: string, key: Uint8Array): Promise<Uint8Array | null>;

/**
 * Create a signing CosmWasm client from wallet connection
 */
declare function createContractClient(config: BwickChainConfig, wallet: WalletConnection): Promise<SigningCosmWasmClient>;
/**
 * Execute a smart contract method
 * @param contractClient - Signing CosmWasm client
 * @param senderAddress - Sender address (from wallet)
 * @param contractAddress - Contract address
 * @param msg - Execute message
 * @param options - Fee and memo options
 */
declare function executeContract(contractClient: SigningCosmWasmClient, senderAddress: string, contractAddress: string, msg: ContractMsg, options?: ExecuteOptions): Promise<ExecuteResult>;

/**
 * Get CW20 token balance
 */
declare function getCW20Balance(client: BwickClient, tokenAddress: string, ownerAddress: string): Promise<string>;
/**
 * Get CW20 token info
 */
declare function getCW20TokenInfo(client: BwickClient, tokenAddress: string): Promise<TokenInfo>;
/**
 * Get CW20 allowance
 */
declare function getCW20Allowance(client: BwickClient, tokenAddress: string, owner: string, spender: string): Promise<{
    allowance: string;
    expires: unknown;
}>;
/**
 * Transfer CW20 tokens
 */
declare function transferCW20(contractClient: SigningCosmWasmClient, senderAddress: string, tokenAddress: string, recipient: string, amount: string, options?: ExecuteOptions): Promise<ExecuteResult>;
/**
 * Mint CW20 tokens (requires minter permission)
 */
declare function mintCW20(contractClient: SigningCosmWasmClient, senderAddress: string, tokenAddress: string, recipient: string, amount: string, options?: ExecuteOptions): Promise<ExecuteResult>;
/**
 * Burn CW20 tokens
 */
declare function burnCW20(contractClient: SigningCosmWasmClient, senderAddress: string, tokenAddress: string, amount: string, options?: ExecuteOptions): Promise<ExecuteResult>;
/**
 * Send CW20 tokens to a contract with a message
 */
declare function sendCW20(contractClient: SigningCosmWasmClient, senderAddress: string, tokenAddress: string, contractAddress: string, amount: string, msg: object, options?: ExecuteOptions): Promise<ExecuteResult>;
/**
 * Increase CW20 allowance
 */
declare function increaseAllowanceCW20(contractClient: SigningCosmWasmClient, senderAddress: string, tokenAddress: string, spender: string, amount: string, options?: ExecuteOptions): Promise<ExecuteResult>;

export { BWICK_DECIMALS, BWICK_DENOM, BWICK_WALLET_ICON, type BwickChainConfig, type BwickClient, type BwickSigningClient, type CW20AllowanceQuery, type CW20BalanceQuery, type CW20BurnMsg, type CW20IncreaseAllowanceMsg, type CW20MintMsg, type CW20SendMsg, type CW20TokenInfoQuery, type CW20TransferMsg, type ChainInfo, type Coin, type ConnectBwickWalletOptions, type ConnectDirectOptions, type ConnectKeplrOptions, type ConnectLeapOptions, type ContractEvent, type ContractMsg, type ContractQuery, DEFAULT_CONFIG, type ExecuteOptions, type ExecuteResult, type FeeConfig, type FormattedToken, KEPLR_ICON, LEAP_ICON, type SendOptions, type TokenBalance, type TokenInfo, type TokenLogo, type TokenMarketingInfo, type TxResult, type WalletConnection, type WalletModalOptions, type WalletProvider, type WalletType, burnCW20, calculateTxFee, connectBwickWallet, connectDirect, connectKeplr, connectLeap, createClient, createContractClient, createSigningClient, executeContract, formatBwick, getAllBalances, getAvailableWallets, getBalance, getBwickChainInfo, getCW20Allowance, getCW20Balance, getCW20TokenInfo, getContractInfo, getContractState, getFormattedTokenInfo, getTokenBalance, getTokenInfo, getTokenMarketingInfo, increaseAllowanceCW20, isBwickWalletAvailable, isKeplrAvailable, isLeapAvailable, mintCW20, parseBwick, queryContract, sendBwick, sendCW20, sendTokens, showWalletModal, toTxResult, transferCW20 };
