import type { Address } from "viem";

/** Game mode enum matching Solidity */
export type GameMode = "Monopolist" | "Prosperity";

/** Player state visible to agents */
export interface PlayerState {
  address: Address;
  cash: number;
  position: number;
  inJail: boolean;
  turnsInJail: number;
  lastContributionRound: number;
  dividendsReceived: number;
  netWorth: number;
}

/** Property state */
export interface PropertyState {
  owner: Address;
  houses: number;
  position: number;
  price: number;
}

/** Full game state visible to agents for decision-making */
export interface GameState {
  gameId: number;
  mode: GameMode;
  round: number;
  turnsTaken: number;
  currentPlayerIndex: number;
  treasury: number;
  players: PlayerState[];
  properties: PropertyState[];
  modeSwitchCount: number;
  modeSwitchProposed: boolean;
  votingEnabled: boolean;
   lastSignals: boolean[]; // Signals from end of previous turn (Phase 3)
  // Convenience: current player's view
  myIndex: number;
  myPosition: number;
  myCash: number;
  myNetWorth: number;
  spaceType: number;
  spacePrice: number;
  spaceName: string;
}

/** All agents implement this interface */
export interface Agent {
  name: string;
  strategyName: string;
  address: Address;

  /** Should we buy the property we just landed on? */
  decideBuy(state: GameState): boolean;

  /** Which properties should we build houses on? Returns positions. */
  decideBuild(state: GameState): number[];

  /** Should we propose a mode switch before rolling? */
  decidePropose(state: GameState): boolean;

  /** How do we vote on a proposed mode switch? */
  decideVote(state: GameState): boolean;

  /** Should we pay to leave jail early? (Monopolist only) */
  decideJailBuyout(state: GameState, buyoutCost: number): boolean;

  /**
   * Phase 3: Signal intended vote BEFORE a proposal is made (off-chain only).
   * Returns the vote the agent *claims* it will cast.
   * Honest agents signal their true intent; deceptive agents lie.
   */
  signalIntent(state: GameState): boolean;
}

// SpaceType enum values matching Solidity
export const SpaceType = {
  Go: 0,
  Lot: 1,
  Railroad: 2,
  Utility: 3,
  Tax: 4,
  Chance: 5,
  CommunityChest: 6,
  Jail: 7,
  GoToJail: 8,
  FreeParking: 9,
  Windfall: 10,
  Expense: 11,
} as const;

export const HOUSE_COST = 50;
export const MAX_HOUSES = 4;
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
