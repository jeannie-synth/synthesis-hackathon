import { setup, createGame } from "./setup.js";
import { runGameLoop } from "./game-loop.js";
import { saveGameLog, gini } from "./logger.js";
import { createAgentSet } from "../../agents/src/strategies/index.js";
import type { Address } from "viem";

async function main() {
  const network = (process.env.NETWORK as "anvil" | "base-sepolia") ?? "anvil";
  const rpcUrl = process.env.RPC_URL;

  // Anvil defaults — use account 9 as deployer (accounts 0-4 are agents via mnemonic)
  const anvilDeployerKey = "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6" as `0x${string}`;
  const anvilDefaultMnemonic = "test test test test test test test test test test test junk";

  // Use Anvil defaults for local dev, .env keys for Sepolia
  const key = network === "anvil"
    ? anvilDeployerKey
    : (process.env.PRIVATE_KEY as `0x${string}`);
  const seed = network === "anvil"
    ? anvilDefaultMnemonic
    : (process.env.AGENT_MNEMONIC as string);

  console.log("=== The Landlord's Game — Orchestrator ===");
  console.log(`Network: ${network}\n`);

  // 1. Setup: deploy contract, derive wallets
  const { publicClient, deployerWallet, agentWallets, contractAddress } = await setup(network, key, seed, rpcUrl);

  const playerAddresses = agentWallets.map(w => w.address) as Address[];
  const playerWallets = agentWallets.map(w => w.wallet);

  // 2. Create agents (5 strategies)
  const agents = createAgentSet(playerAddresses);

  // 3. Create two games: Monopolist and Prosperity (same 5 agents)
  console.log("\nCreating games...");
  const votingEnabled = process.env.VOTING === "true";
  const gameIdM = await createGame(publicClient, deployerWallet, contractAddress, 1, 0, playerAddresses, 0, 0, votingEnabled);
  const gameIdP = await createGame(publicClient, deployerWallet, contractAddress, 1, 1, playerAddresses, 0, 0, votingEnabled);

  // 4. Run games sequentially (same wallets, no nonce conflicts)
  const logM = await runGameLoop({
    publicClient,
    contractAddress,
    gameId: gameIdM,
    agents,
    agentWallets: playerWallets,
  });

  // Reset agent state for second game
  const agents2 = createAgentSet(playerAddresses);

  const logP = await runGameLoop({
    publicClient,
    contractAddress,
    gameId: gameIdP,
    agents: agents2,
    agentWallets: playerWallets,
  });

  // 5. Save logs
  const logDir = "data/games/tournament-1";
  saveGameLog(logM, logDir);
  saveGameLog(logP, logDir);

  // 6. Print comparison
  console.log("\n=== RESULTS COMPARISON ===");
  console.log(`Monopolist — Gini: ${logM.result?.giniCoefficient.toFixed(4)}, Rounds: ${logM.result?.rounds}, Winner: ${logM.result?.winner}`);
  console.log(`Prosperity — Gini: ${logP.result?.giniCoefficient.toFixed(4)}, Rounds: ${logP.result?.rounds}, Winner: ${logP.result?.winner}`);

  if (logM.result && logP.result) {
    const giniDiff = logM.result.giniCoefficient - logP.result.giniCoefficient;
    console.log(`\nGini divergence: ${giniDiff.toFixed(4)} (${giniDiff > 0 ? "Monopolist more unequal" : "Prosperity more unequal"})`);
    console.log(`\nMonopolist net worths: [${logM.result.netWorths.join(", ")}]`);
    console.log(`Prosperity net worths: [${logP.result.netWorths.join(", ")}]`);
  }
}

main().catch(console.error);
