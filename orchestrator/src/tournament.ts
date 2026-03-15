/**
 * tournament.ts — Run N games per board on Anvil, fresh agent state per game, single contract deploy
 *
 * Usage: GAMES=100 npx tsx src/tournament.ts
 */

import { setup, createGame } from "./setup.js";
import { runGameLoop } from "./game-loop.js";
import { saveGameLog } from "./logger.js";
import { createAgentSet, STRATEGY_ORDER } from "../../agents/src/strategies/index.js";
import { computeGameMetrics, computeTournamentMetrics, computeTwinDivergence, computePerformanceTable } from "./metrics.js";
import {
  saveTournamentJSON,
  saveGameCSV,
  saveTwinCSV,
  printTournamentSummary,
  printHeadlineComparison,
  printDominanceAnalysis,
} from "./results.js";
import type { GameMetrics } from "./metrics.js";
import type { Address } from "viem";
import { LANDLORDS_GAME_ABI } from "../../agents/src/chain/abi.js";

async function main() {
  const gamesPerBoard = parseInt(process.env.GAMES ?? "100", 10);
  const network = (process.env.NETWORK as "anvil" | "base-sepolia") ?? "anvil";
  const rpcUrl = process.env.RPC_URL;

  // Anvil defaults
  const anvilDeployerKey = "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6" as `0x${string}`;
  const anvilDefaultMnemonic = "test test test test test test test test test test test junk";

  const key = network === "anvil" ? anvilDeployerKey : (process.env.PRIVATE_KEY as `0x${string}`);
  const seed = network === "anvil" ? anvilDefaultMnemonic : (process.env.AGENT_MNEMONIC as string);

  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║  The Landlord's Game — Tournament Runner            ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║  Network:    ${network}`);
  console.log(`║  Games/board: ${gamesPerBoard}`);
  console.log(`║  Total games: ${gamesPerBoard * 2}`);
  console.log(`║  Strategies: ${STRATEGY_ORDER.join(", ")}`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // 1. Single deploy — all games share one contract
  const { publicClient, deployerWallet, agentWallets, contractAddress } = await setup(network, key, seed, rpcUrl);
  const playerAddresses = agentWallets.map(w => w.address) as Address[];
  const playerWallets = agentWallets.map(w => w.wallet);

  const tournamentId = Date.now();
  const logDir = `data/games/tournament-${tournamentId}`;

  const monopolistMetrics: GameMetrics[] = [];
  const prosperityMetrics: GameMetrics[] = [];

  // 2. Run Tournament A — Monopolist games
  console.log(`\n=== Tournament A: Monopolist (${gamesPerBoard} games) ===\n`);
  for (let i = 0; i < gamesPerBoard; i++) {
    const progress = `[${i + 1}/${gamesPerBoard}]`;
    try {
      // Fresh agents per game (resets Pavlov/Conditional memory)
      const agents = createAgentSet(playerAddresses);

      // Create game on-chain
      const gameId = await createGame(publicClient, deployerWallet, contractAddress, tournamentId, 0, playerAddresses);

      // Run game
      const log = await runGameLoop({
        publicClient,
        contractAddress,
        gameId,
        agents,
        agentWallets: playerWallets,
      });

      // Save individual game log
      saveGameLog(log, logDir);

      // Compute metrics
      const propCounts = await countPropertiesFromContract(publicClient, contractAddress, gameId, playerAddresses);
      const metrics = computeGameMetrics(log, propCounts);
      monopolistMetrics.push(metrics);

      console.log(`  ${progress} Monopolist game ${gameId}: Gini=${metrics.gini.toFixed(4)}, Rounds=${metrics.rounds}, HHI=${metrics.herfindahl.toFixed(4)}`);
    } catch (e: any) {
      console.error(`  ${progress} Monopolist game FAILED: ${e.message?.slice(0, 100)}`);
    }
  }

  // 3. Run Tournament B — Prosperity games
  console.log(`\n=== Tournament B: Prosperity (${gamesPerBoard} games) ===\n`);
  for (let i = 0; i < gamesPerBoard; i++) {
    const progress = `[${i + 1}/${gamesPerBoard}]`;
    try {
      // Fresh agents per game
      const agents = createAgentSet(playerAddresses);

      const gameId = await createGame(publicClient, deployerWallet, contractAddress, tournamentId, 1, playerAddresses);

      const log = await runGameLoop({
        publicClient,
        contractAddress,
        gameId,
        agents,
        agentWallets: playerWallets,
      });

      saveGameLog(log, logDir);

      const propCounts = await countPropertiesFromContract(publicClient, contractAddress, gameId, playerAddresses);
      const metrics = computeGameMetrics(log, propCounts);
      prosperityMetrics.push(metrics);

      console.log(`  ${progress} Prosperity game ${gameId}: Gini=${metrics.gini.toFixed(4)}, Rounds=${metrics.rounds}, HHI=${metrics.herfindahl.toFixed(4)}`);
    } catch (e: any) {
      console.error(`  ${progress} Prosperity game FAILED: ${e.message?.slice(0, 100)}`);
    }
  }

  // 4. Compute aggregates
  const monopolistTournament = computeTournamentMetrics("A", "Monopolist", monopolistMetrics);
  const prosperityTournament = computeTournamentMetrics("B", "Prosperity", prosperityMetrics);
  const twinDivergence = computeTwinDivergence(monopolistMetrics, prosperityMetrics);
  const performanceTable = computePerformanceTable(monopolistMetrics, prosperityMetrics);

  // 5. Print results
  printTournamentSummary(monopolistTournament);
  printTournamentSummary(prosperityTournament);
  printHeadlineComparison(monopolistTournament, prosperityTournament, twinDivergence);
  printDominanceAnalysis(performanceTable);

  // 6. Save results
  const jsonPath = saveTournamentJSON({
    timestamp: new Date().toISOString(),
    tournaments: [monopolistTournament, prosperityTournament],
    twinDivergence,
    performanceTable,
    games: { monopolist: monopolistMetrics, prosperity: prosperityMetrics },
  }, logDir);

  const csvMPath = saveGameCSV(monopolistMetrics, logDir, "monopolist-games.csv");
  const csvPPath = saveGameCSV(prosperityMetrics, logDir, "prosperity-games.csv");
  const twinPath = saveTwinCSV(twinDivergence, logDir);

  console.log(`\nResults saved:`);
  console.log(`  JSON:  ${jsonPath}`);
  console.log(`  CSV:   ${csvMPath}`);
  console.log(`  CSV:   ${csvPPath}`);
  console.log(`  Twins: ${twinPath}`);
  console.log(`  Logs:  ${logDir}/`);

  // Summary for quick reference
  console.log(`\nCompleted: ${monopolistMetrics.length + prosperityMetrics.length}/${gamesPerBoard * 2} games`);
  if (monopolistMetrics.length < gamesPerBoard || prosperityMetrics.length < gamesPerBoard) {
    console.log(`  Failed: ${(gamesPerBoard - monopolistMetrics.length) + (gamesPerBoard - prosperityMetrics.length)} games`);
  }
}

/** Count properties owned by each player from contract state */
async function countPropertiesFromContract(
  publicClient: any,
  contractAddress: Address,
  gameId: bigint,
  playerAddresses: Address[],
): Promise<number[]> {
  try {
    const state = await publicClient.readContract({
      address: contractAddress,
      abi: LANDLORDS_GAME_ABI,
      functionName: "getFullState",
      args: [gameId],
    }) as any;

    const counts = new Array(playerAddresses.length).fill(0);
    for (const prop of state.properties) {
      const idx = playerAddresses.indexOf(prop.owner);
      if (idx >= 0) counts[idx]++;
    }
    return counts;
  } catch {
    return new Array(playerAddresses.length).fill(0);
  }
}

main().catch(console.error);