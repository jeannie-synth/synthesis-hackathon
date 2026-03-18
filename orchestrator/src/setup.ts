import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { parseEther, type Address } from "viem";
import { createClient, createAgentWallet, deriveAgentWallets } from "../../agents/src/chain/client.js";
import { LANDLORDS_GAME_ABI } from "../../agents/src/chain/abi.js";
import { getNextNonce } from "./utils.js";

const AGENT_GAS_FUND = parseEther("0.005"); // 0.005 ETH per agent — enough for ~100+ game turns

export interface SetupResult {
  publicClient: any;
  deployerWallet: any;
  deployerNonce: number;
  agentWallets: { name: string; address: Address; wallet: any }[];
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
    console.log(`  Agent ${name}: ${account.address}`);
  }

  // 2. Fund agents (Anvil accounts are pre-funded, but Sepolia needs this)
  // Explicit nonce tracking for deployer — live RPCs return stale nonces between rapid txs
  let deployerNonce = await getNextNonce(publicClient, deployerAccount.address);

  if (network === "base-sepolia") {
    for (const { name, account } of agentWallets) {
      const balance = await publicClient.getBalance({ address: account.address });
      if (balance < AGENT_GAS_FUND) {
        const needed = AGENT_GAS_FUND - balance;
        const hash = await (deployerWallet as any).sendTransaction({
          to: account.address,
          value: needed,
          account: deployerAccount,
          nonce: deployerNonce++,
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  Funded ${name} with ${needed} wei`);
      }
    }
  }

  // 3. Use existing contract or deploy new one
  const existingAddress = (process.env.CONTRACT_ADDRESS || undefined) as Address | undefined;
  let contractAddress: Address;
  if (existingAddress) {
    contractAddress = existingAddress;
    console.log(`  Using existing contract: ${contractAddress}`);
  } else {
    console.log("Deploying LandlordsGame...");
    const bytecode = getBytecode();
    const deployHash = await (deployerWallet as any).deployContract({
      abi: LANDLORDS_GAME_ABI,
      bytecode,
      account: deployerAccount,
      nonce: deployerNonce++,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
    contractAddress = receipt.contractAddress!;
    console.log(`  Contract deployed: ${contractAddress}`);
  }

  return {
    publicClient,
    deployerWallet,
    deployerNonce,
    agentWallets: agentWallets.map(({ name, account, wallet }) => ({
      name,
      address: account.address,
      wallet,
    })),
    contractAddress,
  };
}

function getBytecode(): `0x${string}` {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const artifactPath = resolve(__dirname, "../../contracts/out/LandlordsGame.sol/LandlordsGame.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));
  return artifact.bytecode.object as `0x${string}`;
}

/** Create a game on the deployed contract.
 *  Pass deployerNonce for explicit nonce tracking; returns [gameId, nextNonce]. */
export async function createGame(
  publicClient: any,
  deployerWallet: any,
  contractAddress: Address,
  tournamentId: number,
  mode: 0 | 1, // 0 = Monopolist, 1 = Prosperity
  playerAddresses: Address[],
  monopolistThreshold = 0,
  prosperityThreshold = 0,
  votingEnabled = false,
  deployerNonce?: number,
): Promise<[bigint, number]> {
  const nonce = deployerNonce ?? await getNextNonce(publicClient, deployerWallet.account.address);
  const hash = await deployerWallet.writeContract({
    address: contractAddress,
    abi: LANDLORDS_GAME_ABI,
    functionName: "createGame",
    args: [
      BigInt(tournamentId), mode, playerAddresses,
      BigInt(monopolistThreshold), BigInt(prosperityThreshold), votingEnabled,
    ],
    account: deployerWallet.account,
    nonce,
    gas: 1_000_000n, // createGame initializes 5 players + 40 properties — needs generous gas
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === "reverted") {
    throw new Error(`createGame tx reverted (nonce=${nonce}, hash=${hash})`);
  }
  if (!receipt.logs || receipt.logs.length === 0) {
    throw new Error(`createGame tx has no logs (status=${receipt.status}, nonce=${nonce}, hash=${hash})`);
  }

  // Parse GameCreated event — gameId is first indexed topic
  const gameCreatedLog = receipt.logs[0];
  const gameId = BigInt(gameCreatedLog.topics[1]!);
  console.log(`  Game ${gameId} created (tournament ${tournamentId}, mode ${mode === 0 ? "Monopolist" : "Prosperity"})`);
  return [gameId, nonce + 1];
}
