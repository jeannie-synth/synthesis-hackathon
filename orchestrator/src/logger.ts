export interface GameLog {
  mode: string;
  rounds: RoundLog[];
  result: GameResult | null;
}

export interface RoundLog {
  round: number;
  turns: TurnLog[];
  snapshot: PlayerSnapshot[];
  treasury: number;
}

export interface TurnLog {
  player: string;
  action: string;
  details: Record<string, unknown>;
}

export interface PlayerSnapshot {
  address: string;
  cash: number;
  position: number;
  properties: number;
  bankrupt: boolean;
}

export interface GameResult {
  winner: string;
  mode: string;
  rounds: number;
  giniCoefficient: number;
  finalBalances: number[];
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

export function createGameLog(mode: string): GameLog {
  return { mode, rounds: [], result: null };
}
