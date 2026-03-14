import type { Address } from "viem";
import type { Agent, GameState } from "../agent.js";

/** Cooperative strategy: optimize for collective outcome, buy only to prevent monopolies */
export class CooperativeAgent implements Agent {
  name = "Cooperative";
  address: Address;

  constructor(address: Address) {
    this.address = address;
  }

  decideBuy(state: GameState): boolean {
    if (state.spacePrice === 0 || state.cash < state.spacePrice) return false;

    // Buy only if another player is close to completing a color group
    // For MVP: buy if affordable and we have surplus cash
    return state.cash > state.spacePrice * 2;
  }

  decideBuild(state: GameState): number[] {
    // Only build if it helps the poorest player (in Prosperity, rent goes to Treasury)
    if (state.mode === "Prosperity") {
      // Building increases rent → more to Treasury → dividends help poorest
      const positions: number[] = [];
      for (const prop of state.properties) {
        if (
          prop.owner === this.address &&
          prop.houses < 4 &&
          state.cash >= 100 // Keep reserve
        ) {
          positions.push(prop.position);
        }
      }
      return positions;
    }
    return []; // Don't build in Monopolist mode (rent hurts others)
  }

  proposeSwitch(state: GameState): boolean {
    // Always propose switch to Prosperity
    return state.mode === "Monopolist";
  }

  voteOnModeSwitch(state: GameState): boolean {
    // Always vote for Prosperity mode
    return state.mode === "Monopolist";
  }
}
