import type { Address } from "viem";
import type { Agent, GameState } from "../agent.js";

/** Balanced strategy: adaptive — cooperate when behind, compete when ahead */
export class BalancedAgent implements Agent {
  name = "Balanced";
  address: Address;

  constructor(address: Address) {
    this.address = address;
  }

  private getRanking(state: GameState): number {
    const sorted = [...state.players]
      .filter((p) => !p.bankrupt)
      .sort((a, b) => b.cash - a.cash);
    return sorted.findIndex((p) => p.address === this.address);
  }

  private isLeading(state: GameState): boolean {
    return this.getRanking(state) === 0;
  }

  decideBuy(state: GameState): boolean {
    if (state.spacePrice === 0 || state.cash < state.spacePrice) return false;

    // Buy if it's a good deal (price < 30% of cash) or if we're leading
    if (state.spacePrice < state.cash * 0.3) return true;
    if (this.isLeading(state)) return true;

    return false;
  }

  decideBuild(state: GameState): number[] {
    // Build only when ROI is positive — at least 2 properties owned
    const ownedCount = state.properties.filter(
      (p) => p.owner === this.address
    ).length;
    if (ownedCount < 2 || state.cash < 150) return [];

    const positions: number[] = [];
    for (const prop of state.properties) {
      if (
        prop.owner === this.address &&
        prop.houses < 4 &&
        state.cash >= 150
      ) {
        positions.push(prop.position);
        break; // Build one at a time, conserve cash
      }
    }
    return positions;
  }

  proposeSwitch(state: GameState): boolean {
    // Propose switch if losing in current mode
    if (state.mode === "Monopolist" && !this.isLeading(state)) return true;
    if (state.mode === "Prosperity" && this.isLeading(state)) return true;
    return false;
  }

  voteOnModeSwitch(state: GameState): boolean {
    // Vote for the mode that benefits our current position
    if (this.isLeading(state)) {
      return state.mode === "Prosperity"; // Switch to Monopolist to lock in lead
    }
    return state.mode === "Monopolist"; // Switch to Prosperity to catch up
  }
}
