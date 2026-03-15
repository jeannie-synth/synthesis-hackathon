/**
 * results.ts — Tournament result output: JSON, CSV, console summary
 */

import { writeFileSync, mkdirSync } from "fs";
import type { TournamentMetrics, TwinDivergence, GameMetrics, AggStat } from "./metrics.js";

// ─── JSON output ─────────────────────────────────────────────────────

export interface TournamentOutput {
  timestamp: string;
  tournaments: TournamentMetrics[];
  twinDivergence: TwinDivergence[];
  games: { monopolist: GameMetrics[]; prosperity: GameMetrics[] };
}

export function saveTournamentJSON(output: TournamentOutput, dir: string): string {
  mkdirSync(dir, { recursive: true });
  const path = `${dir}/tournament-results.json`;
  writeFileSync(path, JSON.stringify(output, null, 2));
  return path;
}

// ─── CSV output ──────────────────────────────────────────────────────

export function saveGameCSV(games: GameMetrics[], dir: string, filename: string): string {
  mkdirSync(dir, { recursive: true });
  const path = `${dir}/${filename}`;

  const strategies = ["Extractive", "Generative", "Conditional", "FreeRider", "Pavlov"];
  const headers = [
    "gameId", "mode", "rounds", "turnsTaken", "gini", "herfindahl", "treasuryFlowRate", "treasuryFinal",
    ...strategies.map(s => `netWorth_${s}`),
    ...strategies.map(s => `cash_${s}`),
    "winner",
  ];

  const rows = games.map(g => [
    g.gameId, g.mode, g.rounds, g.turnsTaken,
    g.gini.toFixed(4), g.herfindahl.toFixed(4),
    g.treasuryFlowRate.toFixed(2), g.treasuryFinal,
    ...g.netWorths.map(nw => nw),
    ...g.finalBalances.map(b => b),
    g.winner,
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  writeFileSync(path, csv);
  return path;
}

export function saveTwinCSV(twins: TwinDivergence[], dir: string): string {
  mkdirSync(dir, { recursive: true });
  const path = `${dir}/twin-divergence.csv`;

  const headers = [
    "strategy",
    "monopolistMeanNetWorth", "prosperityMeanNetWorth", "divergence",
    "monopolistMeanRank", "prosperityMeanRank",
  ];

  const rows = twins.map(t => [
    t.strategy,
    t.monopolistMeanNetWorth.toFixed(0), t.prosperityMeanNetWorth.toFixed(0),
    t.divergence.toFixed(0),
    t.monopolistMeanRank.toFixed(2), t.prosperityMeanRank.toFixed(2),
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  writeFileSync(path, csv);
  return path;
}

// ─── Console summary ─────────────────────────────────────────────────

function fmtStat(s: AggStat, decimals = 4): string {
  return `${s.mean.toFixed(decimals)} (med ${s.median.toFixed(decimals)}, std ${s.std.toFixed(decimals)}, range ${s.min.toFixed(decimals)}–${s.max.toFixed(decimals)})`;
}

export function printTournamentSummary(t: TournamentMetrics): void {
  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  Tournament ${t.tournamentId} — ${t.mode} (${t.gamesPlayed} games)`);
  console.log(`╠══════════════════════════════════════════════════════╣`);
  console.log(`║  Gini:             ${fmtStat(t.gini)}`);
  console.log(`║  Herfindahl:       ${fmtStat(t.herfindahl)}`);
  console.log(`║  Rounds:           ${fmtStat(t.rounds, 0)}`);
  console.log(`║  Treasury flow:    ${fmtStat(t.treasuryFlowRate, 2)}`);
  console.log(`║`);
  console.log(`║  Net worth by strategy:`);
  for (const { strategy, stat } of t.netWorthByStrategy) {
    console.log(`║    ${strategy.padEnd(12)} ${fmtStat(stat, 0)}`);
  }
  console.log(`║`);
  console.log(`║  Wins by strategy:`);
  for (const { strategy, wins, winRate } of t.winsByStrategy) {
    const bar = "█".repeat(Math.round(winRate * 20));
    console.log(`║    ${strategy.padEnd(12)} ${String(wins).padStart(3)} (${(winRate * 100).toFixed(0)}%) ${bar}`);
  }
  console.log(`╚══════════════════════════════════════════════════════╝`);
}

export function printHeadlineComparison(
  monopolist: TournamentMetrics,
  prosperity: TournamentMetrics,
  twins: TwinDivergence[],
): void {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  HEADLINE COMPARISON: Monopolist vs Prosperity`);
  console.log(`${"═".repeat(60)}`);

  console.log(`\n  Gini (wealth inequality):`);
  console.log(`    Monopolist: ${monopolist.gini.mean.toFixed(4)}  |  Prosperity: ${prosperity.gini.mean.toFixed(4)}  |  Divergence: ${(monopolist.gini.mean - prosperity.gini.mean).toFixed(4)}`);

  console.log(`\n  Rounds to completion:`);
  console.log(`    Monopolist: ${monopolist.rounds.mean.toFixed(0)}  |  Prosperity: ${prosperity.rounds.mean.toFixed(0)}`);

  console.log(`\n  Treasury flow ($/round):`);
  console.log(`    Monopolist: ${monopolist.treasuryFlowRate.mean.toFixed(2)}  |  Prosperity: ${prosperity.treasuryFlowRate.mean.toFixed(2)}`);

  console.log(`\n  Mean net worth by strategy (same agents, different rules):`);
  console.log(`    ${"Strategy".padEnd(14)} ${"Monopolist".padStart(12)} ${"Prosperity".padStart(12)} ${"Divergence".padStart(12)}`);
  console.log(`    ${"─".repeat(50)}`);
  for (const twin of twins) {
    const sign = twin.divergence >= 0 ? "+" : "";
    console.log(`    ${twin.strategy.padEnd(14)} ${twin.monopolistMeanNetWorth.toFixed(0).padStart(12)} ${twin.prosperityMeanNetWorth.toFixed(0).padStart(12)} ${(sign + twin.divergence.toFixed(0)).padStart(12)}`);
  }

  console.log(`\n  Mean rank by strategy (1=richest, 5=poorest):`);
  console.log(`    ${"Strategy".padEnd(14)} ${"Monopolist".padStart(12)} ${"Prosperity".padStart(12)}`);
  console.log(`    ${"─".repeat(38)}`);
  for (const twin of twins) {
    console.log(`    ${twin.strategy.padEnd(14)} ${twin.monopolistMeanRank.toFixed(2).padStart(12)} ${twin.prosperityMeanRank.toFixed(2).padStart(12)}`);
  }

  // Thesis verdict
  const giniDivergence = monopolist.gini.mean - prosperity.gini.mean;
  console.log(`\n  THESIS: "${giniDivergence > 0 ? "Monopolist rules produce greater inequality" : "Prosperity rules produce greater inequality"}"`);
  console.log(`  Gini divergence: ${giniDivergence.toFixed(4)} across ${monopolist.gamesPlayed + prosperity.gamesPlayed} games`);
  console.log(`${"═".repeat(60)}\n`);
}