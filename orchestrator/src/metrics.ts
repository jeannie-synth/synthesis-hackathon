/**
 * metrics.ts — Tournament-level metrics for The Landlord's Game
 *
 * Extends the per-game Gini coefficient with:
 * - Herfindahl index (property concentration)
 * - Treasury flow rate (total treasury contributions per round)
 * - Twin divergence (same strategy, different rules → different outcomes)
 * - Rounds to completion stats
 */

import type { GameLog, GameResult } from "./logger.js";
import { gini } from "./logger.js";

/** Per-game metrics computed from a GameLog */
export interface GameMetrics {
  gameId: number;
  mode: string;
  rounds: number;
  turnsTaken: number;
  gini: number;
  herfindahl: number;
  treasuryFlowRate: number;
  netWorths: number[];
  finalBalances: number[];
  treasuryFinal: number;
  winner: string;
  propertiesPerPlayer: number[];
  // Event counters (extracted from turnLogs)
  jailEvents: number[];       // jail entries per strategy
  liquidationEvents: number;  // total liquidations
  buyCount: number[];         // purchases per strategy
  buildCount: number[];       // houses built per strategy
  proposalCount: number;      // mode switch proposals
  proposalPassCount: number;  // proposals that passed
  // Phase 3: Signaling metrics
  signalCount: number[];      // total signals per strategy
  promiseKept: number[];      // signals matching actual votes per strategy
}

/** Aggregate stats for a set of games (one tournament) */
export interface TournamentMetrics {
  tournamentId: string;
  mode: string;
  gamesPlayed: number;
  gini: AggStat;
  herfindahl: AggStat;
  rounds: AggStat;
  treasuryFlowRate: AggStat;
  netWorthByStrategy: { strategy: string; stat: AggStat }[];
  winsByStrategy: { strategy: string; wins: number; winRate: number }[];
  // Event counter aggregates
  jailEventsByStrategy: { strategy: string; stat: AggStat }[];
  liquidationEvents: AggStat;
  buyCountByStrategy: { strategy: string; stat: AggStat }[];
  buildCountByStrategy: { strategy: string; stat: AggStat }[];
  proposals: AggStat;
  proposalPassRate: number;
  // Phase 3: Signaling metrics
  promiseKeepingByStrategy: { strategy: string; rate: number; total: number }[];
}

/** Twin divergence: compare same strategy across two rule sets */
export interface TwinDivergence {
  strategy: string;
  monopolistMeanNetWorth: number;
  prosperityMeanNetWorth: number;
  divergence: number; // prosperity - monopolist (positive = prosperity benefits this strategy)
  monopolistMeanRank: number;
  prosperityMeanRank: number;
}

export interface AggStat {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
}

const STRATEGY_NAMES = ["Extractive", "Generative", "Conditional", "FreeRider", "Pavlov"];

// ─── Event extraction from turnLogs ─────────────────────────────────

/** Extract event counters from a GameLog's turn entries */
function extractEventCounters(log: GameLog): {
  jailEvents: number[];
  liquidationEvents: number;
  buyCount: number[];
  buildCount: number[];
  proposalCount: number;
  proposalPassCount: number;
  signalCount: number[];
  promiseKept: number[];
} {
  const n = STRATEGY_NAMES.length;
  const jailEvents = new Array(n).fill(0);
  const buyCount = new Array(n).fill(0);
  const buildCount = new Array(n).fill(0);
  const signalCount = new Array(n).fill(0);
  const promiseKept = new Array(n).fill(0);
  let liquidationEvents = 0;
  let proposalCount = 0;
  let proposalPassCount = 0;

  for (const turn of log.turns) {
    const idx = STRATEGY_NAMES.findIndex(s => turn.agent.startsWith(s));
    if (idx < 0) continue;

    switch (turn.action) {
      case "jailWait":
      case "jailBuyout":
        jailEvents[idx]++;
        break;
      case "buy":
        buyCount[idx]++;
        break;
      case "build":
        buildCount[idx]++;
        break;
      case "proposeModeSwitch":
        proposalCount++;
        break;
      case "proposalPassed":
        proposalPassCount++;
        break;
      case "vote":
        // Phase 3: Track promise-keeping from vote details
        if (turn.details.keptPromise !== undefined) {
          signalCount[idx]++;
          if (turn.details.keptPromise) promiseKept[idx]++;
        }
        break;
    }
  }

  return { jailEvents, liquidationEvents, buyCount, buildCount, proposalCount, proposalPassCount, signalCount, promiseKept };
}

// ─── Per-game metrics ────────────────────────────────────────────────

/** Herfindahl index for property concentration (0 = equal, 1 = monopoly) */
export function herfindahl(propertyCounts: number[]): number {
  const total = propertyCounts.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  let sum = 0;
  for (const count of propertyCounts) {
    const share = count / total;
    sum += share * share;
  }
  return sum;
}

/** Count properties owned by each player from a GameLog result */
function countProperties(log: GameLog): number[] {
  // Use the last round snapshot's player addresses to determine ownership
  // Properties are in the log's round snapshots — but we don't track property ownership there
  // Instead, derive from result netWorths vs finalBalances (net worth = cash + property values + houses)
  // This is approximate — exact counts would need contract state
  // For now, return empty array (filled in computeGameMetrics from contract state if available)
  return new Array(log.playerAddresses.length).fill(0);
}

/** Treasury flow rate: average treasury gain per round */
function treasuryFlowRate(log: GameLog): number {
  const result = log.result;
  if (!result || result.rounds === 0) return 0;
  return result.treasuryFinal / result.rounds;
}

/** Compute per-game metrics from a GameLog */
export function computeGameMetrics(log: GameLog, propertyCounts?: number[]): GameMetrics {
  const result = log.result!;
  const propCounts = propertyCounts ?? countProperties(log);
  const events = extractEventCounters(log);

  return {
    gameId: log.gameId,
    mode: log.mode,
    rounds: result.rounds,
    turnsTaken: result.turnsTaken,
    gini: result.giniCoefficient,
    herfindahl: herfindahl(propCounts),
    treasuryFlowRate: treasuryFlowRate(log),
    netWorths: result.netWorths,
    finalBalances: result.finalBalances,
    treasuryFinal: result.treasuryFinal,
    winner: result.winner,
    propertiesPerPlayer: propCounts,
    ...events,
  };
}

// ─── Aggregate stats ─────────────────────────────────────────────────

function aggStat(values: number[]): AggStat {
  if (values.length === 0) return { mean: 0, median: 0, std: 0, min: 0, max: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 1
    ? sorted[Math.floor(n / 2)]
    : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const variance = sorted.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);

  return { mean, median, std, min: sorted[0], max: sorted[n - 1] };
}

/** Compute aggregate tournament metrics from a set of game metrics */
export function computeTournamentMetrics(
  tournamentId: string,
  mode: string,
  games: GameMetrics[],
): TournamentMetrics {
  const giniStat = aggStat(games.map(g => g.gini));
  const herfStat = aggStat(games.map(g => g.herfindahl));
  const roundsStat = aggStat(games.map(g => g.rounds));
  const flowStat = aggStat(games.map(g => g.treasuryFlowRate));

  // Net worth by strategy (indexed by position = strategy order)
  const netWorthByStrategy = STRATEGY_NAMES.map((strategy, i) => ({
    strategy,
    stat: aggStat(games.map(g => g.netWorths[i])),
  }));

  // Wins by strategy — match winner address to player index
  const winCounts = new Array(STRATEGY_NAMES.length).fill(0);
  for (const game of games) {
    // Find which player index won
    // winner is an address — we need to match against netWorths order
    // Since games use the same player addresses in the same order, the winner address
    // maps to a strategy index
    const winnerIdx = games[0]?.netWorths.length > 0
      ? findWinnerIndex(game)
      : -1;
    if (winnerIdx >= 0) winCounts[winnerIdx]++;
  }

  const winsByStrategy = STRATEGY_NAMES.map((strategy, i) => ({
    strategy,
    wins: winCounts[i],
    winRate: games.length > 0 ? winCounts[i] / games.length : 0,
  }));

  // Event counter aggregates
  const jailEventsByStrategy = STRATEGY_NAMES.map((strategy, i) => ({
    strategy,
    stat: aggStat(games.map(g => g.jailEvents[i])),
  }));

  const liquidationEventsStat = aggStat(games.map(g => g.liquidationEvents));

  const buyCountByStrategy = STRATEGY_NAMES.map((strategy, i) => ({
    strategy,
    stat: aggStat(games.map(g => g.buyCount[i])),
  }));

  const buildCountByStrategy = STRATEGY_NAMES.map((strategy, i) => ({
    strategy,
    stat: aggStat(games.map(g => g.buildCount[i])),
  }));

  const proposalsStat = aggStat(games.map(g => g.proposalCount));
  const totalProposals = games.reduce((s, g) => s + g.proposalCount, 0);
  const totalPassed = games.reduce((s, g) => s + g.proposalPassCount, 0);
  const proposalPassRate = totalProposals > 0 ? totalPassed / totalProposals : 0;

  // Phase 3: Promise-keeping rates per strategy
  const promiseKeepingByStrategy = STRATEGY_NAMES.map((strategy, i) => {
    const totalSignals = games.reduce((s, g) => s + g.signalCount[i], 0);
    const totalKept = games.reduce((s, g) => s + g.promiseKept[i], 0);
    return {
      strategy,
      rate: totalSignals > 0 ? totalKept / totalSignals : 0,
      total: totalSignals,
    };
  });

  return {
    tournamentId,
    mode,
    gamesPlayed: games.length,
    gini: giniStat,
    herfindahl: herfStat,
    rounds: roundsStat,
    treasuryFlowRate: flowStat,
    netWorthByStrategy,
    winsByStrategy,
    jailEventsByStrategy,
    liquidationEvents: liquidationEventsStat,
    buyCountByStrategy,
    buildCountByStrategy,
    proposals: proposalsStat,
    proposalPassRate,
    promiseKeepingByStrategy,
  };
}

/** Find winner index by highest net worth (winner address matching) */
function findWinnerIndex(game: GameMetrics): number {
  // The winner is the player with highest net worth in Monopolist mode,
  // or the game that achieved collective threshold in Prosperity mode.
  // Either way, use the max net worth player as winner index.
  let maxIdx = 0;
  let maxNW = game.netWorths[0];
  for (let i = 1; i < game.netWorths.length; i++) {
    if (game.netWorths[i] > maxNW) {
      maxNW = game.netWorths[i];
      maxIdx = i;
    }
  }
  return maxIdx;
}

// ─── Twin divergence ─────────────────────────────────────────────────

/** Compute twin divergence: compare each strategy's performance across two rule sets */
export function computeTwinDivergence(
  monopolistGames: GameMetrics[],
  prosperityGames: GameMetrics[],
): TwinDivergence[] {
  return STRATEGY_NAMES.map((strategy, i) => {
    const mNetWorths = monopolistGames.map(g => g.netWorths[i]);
    const pNetWorths = prosperityGames.map(g => g.netWorths[i]);

    const mMean = mNetWorths.length > 0
      ? mNetWorths.reduce((a, b) => a + b, 0) / mNetWorths.length
      : 0;
    const pMean = pNetWorths.length > 0
      ? pNetWorths.reduce((a, b) => a + b, 0) / pNetWorths.length
      : 0;

    // Mean rank (1 = richest, 5 = poorest)
    const mRanks = monopolistGames.map(g => rankOf(g.netWorths, i));
    const pRanks = prosperityGames.map(g => rankOf(g.netWorths, i));

    const mMeanRank = mRanks.length > 0
      ? mRanks.reduce((a, b) => a + b, 0) / mRanks.length
      : 0;
    const pMeanRank = pRanks.length > 0
      ? pRanks.reduce((a, b) => a + b, 0) / pRanks.length
      : 0;

    return {
      strategy,
      monopolistMeanNetWorth: mMean,
      prosperityMeanNetWorth: pMean,
      divergence: pMean - mMean,
      monopolistMeanRank: mMeanRank,
      prosperityMeanRank: pMeanRank,
    };
  });
}

/** Rank of player i in descending net worth (1 = richest) */
function rankOf(netWorths: number[], playerIndex: number): number {
  const val = netWorths[playerIndex];
  let rank = 1;
  for (let j = 0; j < netWorths.length; j++) {
    if (j !== playerIndex && netWorths[j] > val) rank++;
  }
  return rank;
}

// ─── Performance table + dominance analysis ─────────────────────────

export interface StrategyPerformance {
  strategy: string;
  monopolistMeanNetWorth: number;
  prosperityMeanNetWorth: number;
  monopolistRank: number;   // 1 = highest earner
  prosperityRank: number;
  dominatesUnder: "Monopolist" | "Prosperity" | "Both" | "Neither";
}

/** Compute performance table: which strategy earns most under each rule set?
 *  Dominance flip (top performer changes between rule sets) = thesis proved. */
export function computePerformanceTable(
  monopolistGames: GameMetrics[],
  prosperityGames: GameMetrics[],
): StrategyPerformance[] {
  const mMeans = STRATEGY_NAMES.map((_, i) => {
    const vals = monopolistGames.map(g => g.netWorths[i]);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });

  const pMeans = STRATEGY_NAMES.map((_, i) => {
    const vals = prosperityGames.map(g => g.netWorths[i]);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });

  // Rank by mean net worth (1 = highest)
  const mRanked = [...mMeans].map((v, i) => ({ i, v })).sort((a, b) => b.v - a.v);
  const pRanked = [...pMeans].map((v, i) => ({ i, v })).sort((a, b) => b.v - a.v);

  const mRanks = new Array(STRATEGY_NAMES.length);
  const pRanks = new Array(STRATEGY_NAMES.length);
  mRanked.forEach((entry, rank) => { mRanks[entry.i] = rank + 1; });
  pRanked.forEach((entry, rank) => { pRanks[entry.i] = rank + 1; });

  return STRATEGY_NAMES.map((strategy, i) => {
    const isTopM = mRanks[i] === 1;
    const isTopP = pRanks[i] === 1;
    const dominatesUnder = isTopM && isTopP ? "Both"
      : isTopM ? "Monopolist"
      : isTopP ? "Prosperity"
      : "Neither";

    return {
      strategy,
      monopolistMeanNetWorth: mMeans[i],
      prosperityMeanNetWorth: pMeans[i],
      monopolistRank: mRanks[i],
      prosperityRank: pRanks[i],
      dominatesUnder,
    };
  });
}

// ─── Nash / payoff placeholder ──────────────────────────────────────
//
// Phase 3 TODO: Strategy payoff heatmap
// Dimensions: 5 strategies × 2 rule sets
// Each cell = mean net worth for that strategy under that rule set
// The thesis shows up as a dominance flip: the top-performing strategy
// changes between Monopolist and Prosperity columns.
// With voting/signaling data (Phase 3), this extends to include
// political payoffs (proposal success rate, vote alignment reward).
// Visualization: Streamlit heatmap with diverging colormap.
//

export { aggStat, STRATEGY_NAMES };