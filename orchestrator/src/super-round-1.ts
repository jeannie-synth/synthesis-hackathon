/**
 * Super Tournament — Round 1 (Sepolia Validation Only)
 *
 * This script was used to validate SC dynamics on Sepolia before mainnet.
 * The mainnet super tournament runs via independent Claude Code terminal
 * agents (see docs/agent-prompts/agent-0.md through agent-4.md), NOT
 * through this orchestrator script.
 *
 * Sepolia validation results (Day 9, 2026-03-21):
 * - Game 35 (Monopolist): 41 rounds, Gini 0.1020, 19 mode switches
 * - Game 36 (Prosperity): 10 rounds, Gini 0.0189
 * - All SC dynamics validated: voting, mode switching, jail, signaling
 */

import "dotenv/config";
import { writeFileSync, mkdirSync } from "fs";
import { setup, createGame } from "./setup.js";
import { runGameLoop, resetBoardCache } from "./game-loop.js";
import { saveGameLog, gini } from "./logger.js";
import { createAgent, STRATEGY_ORDER, type StrategyName } from "../../agents/src/strategies/index.js";
import { fisherYatesShuffle, applyPermutation } from "./utils.js";
import type { Address } from "viem";
import type { Agent } from "../../agents/src/agent.js";

const ROUND = 1;
const TOURNAMENT_ID = 500 + ROUND;
const LOG_DIR = "data/super-tournament";
const GAMES_FILE = `${LOG_DIR}/round-${ROUND}-games.json`;
const AGENT_LOG_FILE = `${LOG_DIR}/agent-0-log.md`;

// Agent 0's chosen strategy for Round 1
const AGENT_0_STRATEGY: StrategyName = "Conditional";

// All 5 agents' strategies — Agent 0 chooses, others keep defaults from STRATEGY_ORDER
const STRATEGIES: StrategyName[] = STRATEGY_ORDER.map((s, i) =>
  i === 0 ? AGENT_0_STRATEGY : s
);

async function main() {
  const network = "base-sepolia" as const;
  const rpcUrl = process.env.BASE_SEPOLIA_RPC;
  const key = process.env.PRIVATE_KEY as `0x${string}`;
  const seed = process.env.OLD_AGENT_MNEMONIC ?? process.env.AGENT_MNEMONIC as string;

  console.log("=== Super Tournament — Round 1 (Sepolia Validation) ===");
  console.log(`Agent 0 strategy: ${AGENT_0_STRATEGY}\n`);

  // 1. Setup
  let { publicClient, deployerWallet, deployerNonce, agentWallets, contractAddress } = await setup(network, key, seed, rpcUrl);

  const playerAddresses = agentWallets.map(w => w.address) as Address[];
  const playerWallets = agentWallets.map(w => w.wallet);

  // FY shuffle — shared between twin pair
  const order = fisherYatesShuffle([0, 1, 2, 3, 4]);
  const shuffledAddresses = applyPermutation(playerAddresses, order);
  const shuffledWallets = applyPermutation(playerWallets, order);

  console.log(`  Player order: [${order.join(", ")}]`);

  // Create agents with chosen strategies
  function createAgents(): Agent[] {
    return STRATEGIES.map((strategy, i) =>
      createAgent(strategy, `Agent${i}-${strategy}`, playerAddresses[i])
    );
  }

  mkdirSync(LOG_DIR, { recursive: true });

  // 2. Create Monopolist game
  console.log("\n--- Creating Monopolist game ---");
  const [gameIdM, nonce2] = await createGame(
    publicClient, deployerWallet, contractAddress,
    TOURNAMENT_ID, 0, shuffledAddresses, 0, 0, true, deployerNonce
  );
  deployerNonce = nonce2;

  // 3. Create Prosperity game
  console.log("\n--- Creating Prosperity game ---");
  const [gameIdP, nonce3] = await createGame(
    publicClient, deployerWallet, contractAddress,
    TOURNAMENT_ID, 1, shuffledAddresses, 0, 0, true, deployerNonce
  );
  deployerNonce = nonce3;

  // 4. Write game IDs
  const gamesData = {
    round: ROUND,
    monopolist: Number(gameIdM),
    prosperity: Number(gameIdP),
    tournamentId: TOURNAMENT_ID,
    agent0Strategy: AGENT_0_STRATEGY,
  };
  writeFileSync(GAMES_FILE, JSON.stringify(gamesData, null, 2));
  console.log(`\nGame IDs written to ${GAMES_FILE}:`);
  console.log(JSON.stringify(gamesData, null, 2));

  // 5. Write Agent 0 strategy log
  const strategyLog = `# Agent 0 — Super Tournament Log

## Round ${ROUND}
**Strategy chosen**: ${AGENT_0_STRATEGY}
**Reasoning**: Round 1 — no prior data. Conditional (Tit-for-Tat) is the Axelrod tournament winner: starts cooperative, adapts to group behavior. Best information-gathering strategy when the meta is unknown. Mirrors what others do — if they cooperate, I cooperate; if they defect, I defect.

`;
  writeFileSync(AGENT_LOG_FILE, strategyLog);
  console.log(`\nAgent 0 log written to ${AGENT_LOG_FILE}`);

  // 6. Play Monopolist game
  console.log("\n=== Playing Monopolist game ===");
  const agentsM = applyPermutation(createAgents(), order);
  const logM = await runGameLoop({
    publicClient, contractAddress, gameId: gameIdM,
    agents: agentsM, agentWallets: shuffledWallets,
    logDir: LOG_DIR, mode: "Monopolist",
  });
  saveGameLog(logM, LOG_DIR);

  // Reset board cache between games
  resetBoardCache();

  // 7. Play Prosperity game
  console.log("\n=== Playing Prosperity game ===");
  const agentsP = applyPermutation(createAgents(), order);
  const logP = await runGameLoop({
    publicClient, contractAddress, gameId: gameIdP,
    agents: agentsP, agentWallets: shuffledWallets,
    logDir: LOG_DIR, mode: "Prosperity",
  });
  saveGameLog(logP, LOG_DIR);

  // 8. Results
  console.log("\n=== ROUND 1 RESULTS ===");
  console.log(`Monopolist game ${gameIdM}: Gini ${logM.result?.giniCoefficient.toFixed(4)}, Rounds ${logM.result?.rounds}, Winner ${logM.result?.winner}`);
  console.log(`Prosperity game ${gameIdP}: Gini ${logP.result?.giniCoefficient.toFixed(4)}, Rounds ${logP.result?.rounds}, Winner ${logP.result?.winner}`);

  if (logM.result && logP.result) {
    const giniDiff = logM.result.giniCoefficient - logP.result.giniCoefficient;
    console.log(`\nGini divergence: ${giniDiff.toFixed(4)} (${giniDiff > 0 ? "Monopolist more unequal" : "Prosperity more unequal"})`);
    console.log(`\nMonopolist net worths: [${logM.result.netWorths.join(", ")}]`);
    console.log(`Prosperity net worths: [${logP.result.netWorths.join(", ")}]`);

    // Find Agent 0's results
    const agent0AddrLower = playerAddresses[0].toLowerCase();
    const mPlayers = logM.result.netWorths;
    const pPlayers = logP.result.netWorths;

    // Agent 0 is at its shuffled index position
    const agent0ShuffledIdx = order.indexOf(0);
    const agent0MNW = mPlayers[agent0ShuffledIdx];
    const agent0PNW = pPlayers[agent0ShuffledIdx];

    // Rank calculation
    const mRanked = [...mPlayers].sort((a, b) => b - a);
    const pRanked = [...pPlayers].sort((a, b) => b - a);
    const mRank = mRanked.indexOf(agent0MNW) + 1;
    const pRank = pRanked.indexOf(agent0PNW) + 1;

    const mWon = logM.result.winner.toLowerCase() === agent0AddrLower;
    const pWon = logP.result.winner.toLowerCase() === agent0AddrLower;

    // Append results to agent log
    const resultsLog = `**Results**: Monopolist game ${gameIdM}: ${mWon ? "won" : "lost"}, final NW $${agent0MNW}, rank ${mRank}/5. Prosperity game ${gameIdP}: ${pWon ? "won" : "lost"}, final NW $${agent0PNW}, rank ${pRank}/5.
**Observations**: Gini divergence ${giniDiff.toFixed(4)}. Monopolist NW spread: [${logM.result.netWorths.join(", ")}]. Prosperity NW spread: [${logP.result.netWorths.join(", ")}].
`;
    const { readFileSync } = await import("fs");
    const existingLog = readFileSync(AGENT_LOG_FILE, "utf-8");
    writeFileSync(AGENT_LOG_FILE, existingLog + resultsLog);
  }

  console.log("\n=== Round 1 complete ===");
}

main().catch(console.error);
