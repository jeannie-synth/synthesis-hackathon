import type { Address } from "viem";
import type { Agent, GameState } from "../agent.js";

/** Greedy strategy: maximize personal wealth, buy everything, never cooperate */
export class MonopolistAgent implements Agent {
  name = "Monopolist";
  address: Address;

  constructor(address: Address) {
    this.address = address;
  }

  decideBuy(state: GameState): boolean {
    // Always buy if we can afford it
    return state.cash >= state.spacePrice && state.spacePrice > 0;
  }

  decideBuild(state: GameState): number[] {
    // Build on any owned property where we can afford a house
    const positions: number[] = [];
    for (const prop of state.properties) {
      if (
        prop.owner === this.address &&
        prop.houses < 4 &&
        state.cash >= 50
      ) {
        positions.push(prop.position);
      }
    }
    return positions;
  }

  proposeSwitch(state: GameState): boolean {
    // Only propose switch TO Monopolist if currently Prosperity
    return state.mode === "Prosperity";
  }

  voteOnModeSwitch(state: GameState): boolean {
    // Always vote for Monopolist mode
    return state.mode === "Prosperity";
  }
}
