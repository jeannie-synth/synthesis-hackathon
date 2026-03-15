import { writeFileSync, mkdirSync } from "fs";
import type { Address } from "viem";
import type { Agent } from "../../agents/src/agent.js";

export interface GameLog {
  gameId: number;
  mode: string;
  playerAddresses: Address[];
  turns: TurnLog[];
  roundSnapshots: RoundSnapshot[];
  result: GameResult | null;
}

export interface TurnLog {
  agent: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: number;
}

export interface RoundSnapshot {
  round: number;
  players: { address: string; cash: number; position: number; inJail: boolean; netWorth: number }[];
  treasury: number;
  mode: string;
}

export interface GameResult {
  winner: Address;
  mode: string;
  rounds: number;
  turnsTaken: number;
  giniCoefficient: number;
  finalBalances: number[];
  netWorths: number[];
  treasuryFinal: number;
}

/** Calculate Gini coefficient from an array of values */
export function gini(values: number[]): number {
  const n = values.length;
  if (n === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  if (mean === 0) return 0;

  let sumDiff = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sumDiff += Math.abs(sorted[i] - sorted[j]);
    }
  }

  return sumDiff / (2 * n * n * mean);
}

export function createGameLog(gameId: number, mode: string, playerAddresses: Address[]): GameLog {
  return { gameId, mode, playerAddresses, turns: [], roundSnapshots: [], result: null };
}

export function addTurnLog(log: GameLog, agent: string, action: string, details: Record<string, unknown>) {
  log.turns.push({ agent, action, details, timestamp: Date.now() });
}

export function addRoundSnapshot(log: GameLog, rawState: any, agents: Agent[]) {
  const players = rawState.players.map((p: any, i: number) => ({
    address: p.addr,
    cash: Number(p.cash),
    position: Number(p.position),
    inJail: p.inJail,
    netWorth: Number(p.cash), // Simplified — full net worth calculated elsewhere
  }));

  log.roundSnapshots.push({
    round: Number(rawState.round),
    players,
    treasury: Number(rawState.treasury),
    mode: rawState.mode === 0 ? "Monopolist" : "Prosperity",
  });
}

export function finalizeGame(log: GameLog, result: GameResult) {
  log.result = result;
}

/** Write game log to JSON file */
export function saveGameLog(log: GameLog, dir: string) {
  mkdirSync(dir, { recursive: true });
  const filename = `${dir}/game-${log.gameId}-${log.mode.toLowerCase()}.json`;
  writeFileSync(filename, JSON.stringify(log, null, 2));
  console.log(`  Log saved: ${filename}`);
}
