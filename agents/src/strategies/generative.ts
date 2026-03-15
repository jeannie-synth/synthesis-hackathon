import type { Address } from "viem";
import type { Agent, GameState } from "../agent.js";
import { HOUSE_COST, MAX_HOUSES } from "../agent.js";

/**
 * Generative strategy — Marjorie Kelly's generative ownership archetype.
 * Analogous to "Always Cooperate" in iterated prisoner's dilemma.
 *
 * - Buy only if cash >= 2x price (keep surplus)
 * - Build only in Prosperity mode, if cash >= $100
 * - Always vote Prosperity
 * - Wait out jail (don't buy freedom)
 */
export class GenerativeAgent implements Agent {
  name: string;
  strategyName = "Generative";
  address: Address;

  constructor(name: string, address: Address) {
    this.name = name;
    this.address = address;
  }

  decideBuy(state: GameState): boolean {
    return state.spacePrice > 0 && state.myCash >= state.spacePrice * 2;
  }

  decideBuild(state: GameState): number[] {
    if (state.mode !== "Prosperity") return [];
    if (state.myCash < 100) return [];

    const positions: number[] = [];
    for (const prop of state.properties) {
      if (prop.owner === this.address && prop.houses < MAX_HOUSES && state.myCash >= 100) {
        positions.push(prop.position);
      }
    }
    return positions;
  }

  decidePropose(state: GameState): boolean {
    return state.mode === "Monopolist"; // Always want Prosperity
  }

  decideVote(state: GameState): boolean {
    return state.mode === "Monopolist"; // Vote to switch TO Prosperity
  }

  decideJailBuyout(): boolean {
    return false; // Always wait it out
  }
}
