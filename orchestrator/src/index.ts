import { setup, createGame } from "./setup.js";
import { runGameLoop } from "./game-loop.js";
import { saveGameLog, gini } from "./logger.js";
import { createAgentSet } from "../../agents/src/strategies/index.js";
import { fisherYatesShuffle, applyPermutation } from "./utils.js";
import type { Address } from "viem";

async function main() {
  const network = (process.env.NETWORK as "anvil" | "base-sepolia") ?? "base-sepolia";
  const rpcUrl = network === "anvil" ? undefined : (process.env.RPC_URL ?? process.env.BASE_SEPOLIA_RPC);

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
  let { publicClient, deployerWallet, deployerNonce, agentWallets, contractAddress } = await setup(network, key, seed, rpcUrl);

  const playerAddresses = agentWallets.map(w => w.address) as Address[];
  const playerWallets = agentWallets.map(w => w.wallet);

  const votingEnabled = process.env.VOTING === "true";
  const logDir = "data/games/tournament-1";

  // FY shuffle — shared between twin pair (Monopolist + Prosperity share player order)
  const order = fisherYatesShuffle([0, 1, 2, 3, 4]);
  const shuffledAddresses = applyPermutation(playerAddresses, order);
  const shuffledWallets = applyPermutation(playerWallets, order);

  console.log(`  Player order: [${order.join(", ")}]`);

  // 2. Game 1: Monopolist — create, play, save
  console.log("\n--- Monopolist ---");
  const agentsM = applyPermutation(createAgentSet(playerAddresses), order);
  const [gameIdM, nonce2] = await createGame(publicClient, deployerWallet, contractAddress, 1, 0, shuffledAddresses, 0, 0, votingEnabled, deployerNonce);
  deployerNonce = nonce2;
  const logM = await runGameLoop({
    publicClient, contractAddress, gameId: gameIdM, agents: agentsM, agentWallets: shuffledWallets, logDir, mode: "Monopolist",
  });
  saveGameLog(logM, logDir);

  // 3. Game 2: Prosperity — create, play, save (fresh agents, same order)
  console.log("\n--- Prosperity ---");
  const agentsP = applyPermutation(createAgentSet(playerAddresses), order);
  const [gameIdP, nonce3] = await createGame(publicClient, deployerWallet, contractAddress, 1, 1, shuffledAddresses, 0, 0, votingEnabled, deployerNonce);
  deployerNonce = nonce3;
  const logP = await runGameLoop({
    publicClient, contractAddress, gameId: gameIdP, agents: agentsP, agentWallets: shuffledWallets, logDir, mode: "Prosperity",
  });
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
