import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { parseEther, type Address } from "viem";
import { createClient, createAgentWallet, deriveAgentWallets } from "../../agents/src/chain/client.js";
import { LANDLORDS_GAME_ABI } from "../../agents/src/chain/abi.js";

const AGENT_GAS_FUND = parseEther("0.01");

/** Simple deployer nonce tracker — avoids stale nonce reads on public Sepolia RPCs */
let deployerNonce: number | undefined;
async function getDeployerNonce(publicClient: any, address: string): Promise<number> {
  if (deployerNonce === undefined) {
    deployerNonce = Number(await publicClient.getTransactionCount({ address }));
  }
  return deployerNonce++;
}

export interface SetupResult {
  publicClient: any;
  deployerWallet: any;
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
  if (network === "base-sepolia") {
    for (const { name, account } of agentWallets) {
      const balance = await publicClient.getBalance({ address: account.address });
      if (balance < AGENT_GAS_FUND) {
        const needed = AGENT_GAS_FUND - balance;
        const nonce = await getDeployerNonce(publicClient, deployerAccount.address);
        const hash = await (deployerWallet as any).sendTransaction({
          to: account.address,
          value: needed,
          account: deployerAccount,
          nonce,
        });
        await publicClient.waitForTransactionReceipt({ hash });
        console.log(`  Funded ${name} with ${needed} wei`);
      }
    }
  }

  // 3. Deploy contract
  console.log("Deploying LandlordsGame...");
  const bytecode = getBytecode();
  const deployNonce = network === "base-sepolia"
    ? await getDeployerNonce(publicClient, deployerAccount.address)
    : undefined;
  const deployHash = await (deployerWallet as any).deployContract({
    abi: LANDLORDS_GAME_ABI,
    bytecode,
    account: deployerAccount,
    ...(deployNonce !== undefined ? { nonce: deployNonce } : {}),
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
  const contractAddress = receipt.contractAddress!;
  console.log(`  Contract deployed: ${contractAddress}`);

  return {
    publicClient,
    deployerWallet,
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

/** Create a game on the deployed contract */
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
): Promise<bigint> {
  const nonce = await getDeployerNonce(publicClient, deployerWallet.account.address);
  const hash = await deployerWallet.writeContract({
    address: contractAddress,
    abi: LANDLORDS_GAME_ABI,
    functionName: "createGame",
    args: [
      BigInt(tournamentId),
      mode,
      playerAddresses,
      BigInt(monopolistThreshold),
      BigInt(prosperityThreshold),
      votingEnabled,
    ],
    account: deployerWallet.account,
    nonce,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  // Parse GameCreated event to get gameId
  const gameCreatedLog = receipt.logs[0];
  // gameId is the first indexed topic (after event signature)
  const gameId = BigInt(gameCreatedLog.topics[1]!);
  console.log(`  Game ${gameId} created (tournament ${tournamentId}, mode ${mode === 0 ? "Monopolist" : "Prosperity"})`);
  return gameId;
}
