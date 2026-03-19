import {
  createPublicClient,
  createWalletClient,
  http,
  webSocket,
  type Chain,
  type PublicClient,
  type WalletClient,
  type Transport,
} from "viem";
import {
  privateKeyToAccount,
  mnemonicToAccount,
  type PrivateKeyAccount,
  type HDAccount,
} from "viem/accounts";
import { baseSepolia } from "viem/chains";

const anvil: Chain = {
  id: 31337,
  name: "Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
};

/** Agent names by derivation index */
export const AGENT_NAMES = [
  "Extractive",
  "Generative",
  "Conditional",
  "FreeRider",
  "Pavlov",
] as const;

export const NUM_AGENTS = AGENT_NAMES.length;

export function getChain(network: "anvil" | "base-sepolia"): Chain {
  return network === "anvil" ? anvil : baseSepolia;
}

/** Convert an HTTP RPC URL to its WebSocket equivalent (Alchemy, Infura pattern) */
export function toWsUrl(httpUrl: string): string | null {
  try {
    const url = new URL(httpUrl);
    if (url.protocol === "https:") {
      url.protocol = "wss:";
      return url.toString();
    }
  } catch { /* not a valid URL */ }
  return null;
}

/** Create a transport — HTTP only. WebSocket was dropped because Alchemy disconnects
 *  on long-running games (especially with voting enabled).
 *  To re-enable WebSocket, uncomment the block below. */
export function createTransport(network: "anvil" | "base-sepolia", rpcUrl?: string): Transport {
  const chain = getChain(network);
  const httpUrl = rpcUrl ?? chain.rpcUrls.default.http[0];

  // WebSocket disabled — Alchemy drops connections on long games with voting.
  // Uncomment to re-enable for faster receipt notification:
  // if (network !== "anvil") {
  //   const wsUrl = toWsUrl(httpUrl);
  //   if (wsUrl) return webSocket(wsUrl);
  // }

  return http(httpUrl);
}

export function createClient(
  network: "anvil" | "base-sepolia",
  rpcUrl?: string
): PublicClient<Transport, Chain> {
  const chain = getChain(network);
  return createPublicClient({
    chain,
    transport: createTransport(network, rpcUrl),
  });
}

export function createAgentWallet(
  privateKey: `0x${string}`,
  network: "anvil" | "base-sepolia",
  rpcUrl?: string
): { account: PrivateKeyAccount; wallet: WalletClient } {
  const chain = getChain(network);
  const account = privateKeyToAccount(privateKey);
  const wallet = createWalletClient({
    account,
    chain,
    transport: createTransport(network, rpcUrl),
  });
  return { account, wallet };
}

/**
 * Derive 5 agent wallets from a single mnemonic.
 * Path: m/44'/60'/0'/0/{0..4} (standard Ethereum HD derivation)
 *
 * Each agent gets its own address and nonce — no shared wallet.
 * The deployer key remains separate as game master.
 */
export function deriveAgentWallets(
  mnemonic: string,
  network: "anvil" | "base-sepolia",
  rpcUrl?: string
): { name: string; account: HDAccount; wallet: WalletClient }[] {
  const chain = getChain(network);
  const transport = createTransport(network, rpcUrl);

  return AGENT_NAMES.map((name, index) => {
    const account = mnemonicToAccount(mnemonic, {
      addressIndex: index,
    });
    const wallet = createWalletClient({
      account,
      chain,
      transport,
    });
    return { name, account, wallet };
  });
}
