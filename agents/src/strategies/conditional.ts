import type { Address } from "viem";
import type { Agent, GameState } from "../agent.js";
import { HOUSE_COST, MAX_HOUSES, ZERO_ADDRESS } from "../agent.js";

/**
 * Conditional cooperator — Fischbacher, Gachter & Fehr (2001).
 * ~50% of humans in public goods experiments.
 * Analogous to Tit-for-Tat (Axelrod tournaments).
 *
 * - Buy if majority of other players bought on their last turn
 * - Build if majority of other players built on their last turn
 * - Vote with majority from last vote
 * - Mirror group behavior on jail buyout
 */
export class ConditionalAgent implements Agent {
  name: string;
  strategyName = "Conditional";
  address: Address;

  // Track what others did last round
  private othersBoughtLastRound = 0;
  private othersTotalLastRound = 0;
  private othersBuiltLastRound = 0;
  private lastVoteMajorityWasProsperity = false;

  constructor(name: string, address: Address) {
    this.name = name;
    this.address = address;
  }

  /** Call between rounds to update observations */
  updateObservations(othersBought: number, othersBuilt: number, othersTotal: number, majorityVotedProsperity: boolean) {
    this.othersBoughtLastRound = othersBought;
    this.othersBuiltLastRound = othersBuilt;
    this.othersTotalLastRound = othersTotal;
    this.lastVoteMajorityWasProsperity = majorityVotedProsperity;
  }

  decideBuy(state: GameState): boolean {
    if (state.spacePrice === 0 || state.myCash < state.spacePrice) return false;

    // First round: default to buying (nice start, like Tit-for-Tat)
    if (state.round === 0) return true;

    // Mirror majority: buy if majority of others bought
    if (this.othersTotalLastRound === 0) return true;
    return this.othersBoughtLastRound > this.othersTotalLastRound / 2;
  }

  decideBuild(state: GameState): number[] {
    if (state.round === 0) return []; // Wait to observe first

    // Mirror: build if majority of others built
    if (this.othersTotalLastRound === 0) return [];
    if (this.othersBuiltLastRound <= this.othersTotalLastRound / 2) return [];

    const positions: number[] = [];
    for (const prop of state.properties) {
      if (prop.owner === this.address && prop.houses < MAX_HOUSES && state.myCash >= HOUSE_COST) {
        positions.push(prop.position);
        break; // Conservative: one at a time
      }
    }
    return positions;
  }

  decidePropose(_state: GameState): boolean {
    return false; // Conditional cooperators follow, they don't lead
  }

  decideVote(state: GameState): boolean {
    // Vote with majority from last vote
    // If last majority voted for Prosperity (i.e., voted to switch when Monopolist), mirror that
    return this.lastVoteMajorityWasProsperity
      ? state.mode === "Monopolist"  // Vote to switch to Prosperity
      : state.mode === "Prosperity"; // Vote to switch to Monopolist
  }

  decideJailBuyout(state: GameState, buyoutCost: number): boolean {
    // Mirror what others would do: buy out if cash is above average
    const avgCash = state.players.reduce((sum, p) => sum + p.cash, 0) / state.players.length;
    return state.myCash >= buyoutCost && state.myCash > avgCash;
  }
}
