import {
  createPublicClient,
  createWalletClient,
  http,
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

export function createClient(
  network: "anvil" | "base-sepolia",
  rpcUrl?: string
): PublicClient<Transport, Chain> {
  const chain = getChain(network);
  return createPublicClient({
    chain,
    transport: http(rpcUrl ?? chain.rpcUrls.default.http[0]),
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
    transport: http(rpcUrl ?? chain.rpcUrls.default.http[0]),
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
  const transport = http(rpcUrl ?? chain.rpcUrls.default.http[0]);

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
