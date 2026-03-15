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

export { aggStat, STRATEGY_NAMES };