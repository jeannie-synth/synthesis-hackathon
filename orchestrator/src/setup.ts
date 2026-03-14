/**
 * Setup — deploy contract and create agent wallets.
 * * 1. Derive 5 agent wallets from mnemonic (HD paths m/44'/60'/0'/0/{0..4})
 * 2. Fund each agent wallet with gas ETH from deployer
 * 3. Deploy LandlordsGame contract
 * 4. Call createGame() with the 5 agent addresses
 *
 * The deployer wallet (PRIVATE_KEY) is the game master.
 * Agents each have their own wallet, own nonce, own on-chain identity.
 * No token needed — game economy is internal (uint256 in contract storage).
 * Agents only spend real ETH on gas.
 */

import { createClient, createAgentWallet, deriveAgentWallets, NUM_AGENTS } from "../../agents/src/chain/client.js";
import { parseEther, type Address } from "viem";

/** Minimum gas balance per agent — enough for ~500 transactions on Base */
const AGENT_GAS_FUND = parseEther("0.005");

export interface SetupResult {
  deployer: Address;
  agents: { name: string; address: Address }[];
  contractAddress: Address;
}

export async function setup(
  network: "anvil" | "base-sepolia",
  deployerKey: `0x${string}`,
  mnemonic: string,
  rpcUrl?: string,
): Promise<SetupResult> {
  const publicClient = createClient(network, rpcUrl);
  const { account: deployerAccount, wallet: deployerWallet } = createAgentWallet(deployerKey, network, rpcUrl);

  console.log(`Deployer: ${deployerAccount.address}`);

  // 1. Derive agent wallets
  const agentWallets = deriveAgentWallets(mnemonic, network, rpcUrl);

  for (const { name, account } of agentWallets) {
    console.log(`Agent ${name}: ${account.address}`);
  }

  // 2. Fund agent wallets from deployer
  for (const { name, account } of agentWallets) {
    const balance = await publicClient.getBalance({ address: account.address });
    if (balance < AGENT_GAS_FUND) {
      const needed = AGENT_GAS_FUND - balance;
      const hash = await deployerWallet.sendTransaction({
        to: account.address,
        value: needed,
      });
      console.log(`Funded ${name} with ${needed} wei — tx: ${hash}`);
    } else {
      console.log(`${name} already funded (${balance} wei)`);
    }
  }

  // 3. Deploy contract — TODO: wire up after contract compilation
  // const contractAddress = await deployContract(deployerWallet, ...);
  const contractAddress = "0x0" as Address; // placeholder

  // 4. Create game — TODO: call createGame() with agent addresses
  // const agentAddresses = agentWallets.map(a => a.account.address);
  // await createGame(contractAddress, agentAddresses);

  return {
    deployer: deployerAccount.address,
    agents: agentWallets.map(({ name, account }) => ({
      name,
      address: account.address,
    })),
    contractAddress,
  };
}