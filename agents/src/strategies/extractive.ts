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

  private lastProposalNetWorth = -1;

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
    if (state.mode !== "Prosperity") return false; // Only push toward Monopolist
    // Self-preservation: only propose when falling behind
    const avgNetWorth = state.players.reduce((s, p) => s + p.netWorth, 0) / state.players.length;
    if (state.myNetWorth >= avgNetWorth) return false;
    if (state.myNetWorth === this.lastProposalNetWorth) return false;
    this.lastProposalNetWorth = state.myNetWorth;
    return true;
  }

  decideVote(state: GameState): boolean {
    return state.mode === "Prosperity"; // Vote to switch TO Monopolist
  }

  decideJailBuyout(_state: GameState, buyoutCost: number): boolean {
    return _state.myCash >= buyoutCost; // Always pay if affordable
  }
}
