import type { Address } from "viem";

/** Game state visible to agents for decision-making */
export interface GameState {
  mode: "Monopolist" | "Prosperity";
  round: number;
  currentPosition: number;
  cash: number;
  players: PlayerState[];
  properties: PropertyState[];
  treasury: number;
  spaceName: string;
  spaceType: string;
  spacePrice: number;
  inJail: boolean;
}

export interface PlayerState {
  address: Address;
  cash: number;
  position: number;
  bankrupt: boolean;
}

export interface PropertyState {
  owner: Address;
  houses: number;
  position: number;
}

/** All agents implement this interface */
export interface Agent {
  name: string;
  address: Address;

  /** Should we buy the property we just landed on? */
  decideBuy(state: GameState): boolean;

  /** Which properties should we build houses on? Returns positions. */
  decideBuild(state: GameState): number[];

  /** Should we propose a mode switch? */
  proposeSwitch(state: GameState): boolean;

  /** How do we vote on a proposed mode switch? */
  voteOnModeSwitch(state: GameState): boolean;
}
