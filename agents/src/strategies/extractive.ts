import type { Address } from "viem";
import type { Agent, GameState } from "../agent.js";
import { HOUSE_COST, MAX_HOUSES, SpaceType } from "../agent.js";

/**
 * Extractive strategy — Marjorie Kelly's extractive ownership archetype.
 * Analogous to "Always Defect" in iterated prisoner's dilemma.
 *
 * - Always buy if cash >= price
 * - Build on all owned properties if cash >= $50
 * - Always vote Monopolist
 * - Always pay jail buyout (rich buy freedom)
 */
export class ExtractiveAgent implements Agent {
  name: string;
  strategyName = "Extractive";
  address: Address;

  constructor(name: string, address: Address) {
    this.name = name;
    this.address = address;
  }

  decideBuy(state: GameState): boolean {
    return state.myCash >= state.spacePrice && state.spacePrice > 0;
  }

  decideBuild(state: GameState): number[] {
    const positions: number[] = [];
    for (const prop of state.properties) {
      if (prop.owner === this.address && prop.houses < MAX_HOUSES && state.myCash >= HOUSE_COST) {
        positions.push(prop.position);
      }
    }
    return positions;
  }

  decidePropose(state: GameState): boolean {
    return state.mode === "Prosperity"; // Always want Monopolist
  }

  decideVote(state: GameState): boolean {
    return state.mode === "Prosperity"; // Vote to switch TO Monopolist
  }

  decideJailBuyout(_state: GameState, buyoutCost: number): boolean {
    return _state.myCash >= buyoutCost; // Always pay if affordable
  }
}
