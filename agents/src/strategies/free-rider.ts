import type { Address } from "viem";
import type { Agent, GameState } from "../agent.js";

/**
 * Free Rider — Fischbacher's free rider type.
 * ~30% of humans in public goods experiments.
 * Analogous to Ostrom's rational egoist.
 *
 * - Never buys properties
 * - Never builds houses
 * - Votes based on cash trend: keep mode if cash rising, switch if falling
 * - Never pays jail buyout
 *
 * In Prosperity mode, this strategy exploits dividends without contributing.
 * The Prosperity jail mechanic (commons exploitation check) is designed to catch this.
 */
export class FreeRiderAgent implements Agent {
  name: string;
  strategyName = "FreeRider";
  address: Address;

  private previousCash: number = 500; // Starting cash

  constructor(name: string, address: Address) {
    this.name = name;
    this.address = address;
  }

  decideBuy(): boolean {
    return false; // Never buy
  }

  decideBuild(): number[] {
    return []; // Never build
  }

  decidePropose(state: GameState): boolean {
    // Propose switch only if cash is trending down
    const cashTrend = state.myCash - this.previousCash;
    this.previousCash = state.myCash;
    return cashTrend < 0;
  }

  decideVote(state: GameState): boolean {
    // If cash trending up → keep current mode (vote against switch)
    // If cash trending down → vote to switch
    const cashTrend = state.myCash - this.previousCash;
    this.previousCash = state.myCash;
    return cashTrend < 0; // Vote for switch when losing money
  }

  decideJailBuyout(): boolean {
    return false; // Never pay
  }
}
