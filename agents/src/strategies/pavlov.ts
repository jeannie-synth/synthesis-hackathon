import type { Address } from "viem";
import type { Agent, GameState } from "../agent.js";
import { HOUSE_COST, MAX_HOUSES } from "../agent.js";

/**
 * Pavlov — Nowak & Sigmund's "Win-Stay, Lose-Shift" (1993).
 * Most human-like adaptive strategy.
 *
 * Repeats actions that produced good outcomes (cash increased).
 * Switches when outcomes deteriorate (cash decreased).
 *
 * Multi-turn memory: compares current cash to 3 turns ago for cleaner signals.
 */
export class PavlovAgent implements Agent {
  name: string;
  strategyName = "Pavlov";
  address: Address;

  private cashHistory: number[] = [500]; // Track cash over time
  private lastBought = false;
  private lastBuilt = false;
  private lastVotedForSwitch = false;
  private lastPaidBuyout = false;
  // Pragmatist: only propose after observing political action
  private hasObservedProposal = false;
  private lastProposalNetWorth = -1;

  constructor(name: string, address: Address) {
    this.name = name;
    this.address = address;
  }

  private isWinning(state: GameState): boolean {
    this.cashHistory.push(state.myCash);
    // Compare to 3 turns ago (or earliest available)
    const lookback = Math.max(0, this.cashHistory.length - 4);
    return state.myCash >= this.cashHistory[lookback];
  }

  decideBuy(state: GameState): boolean {
    if (state.spacePrice === 0 || state.myCash < state.spacePrice) return false;

    const winning = this.isWinning(state);

    // Win-stay, lose-shift
    if (winning) {
      // Keep doing what we did last time
      return this.lastBought;
    } else {
      // Flip: if we bought last time and lost, don't buy. If we didn't buy and lost, try buying.
      this.lastBought = !this.lastBought;
      return this.lastBought;
    }
  }

  decideBuild(state: GameState): number[] {
    const winning = state.myCash >= (this.cashHistory[Math.max(0, this.cashHistory.length - 4)] ?? 500);

    let shouldBuild: boolean;
    if (winning) {
      shouldBuild = this.lastBuilt;
    } else {
      this.lastBuilt = !this.lastBuilt;
      shouldBuild = this.lastBuilt;
    }

    if (!shouldBuild) return [];

    const positions: number[] = [];
    for (const prop of state.properties) {
      if (prop.owner === this.address && prop.houses < MAX_HOUSES && state.myCash >= HOUSE_COST) {
        positions.push(prop.position);
        break; // One at a time
      }
    }
    return positions;
  }

  /** Pragmatist: call when any proposal is observed */
  observeProposal() {
    this.hasObservedProposal = true;
  }

  decidePropose(state: GameState): boolean {
    if (!this.hasObservedProposal) return false; // Don't lead
    // Lose-shift: propose switch if current mode isn't working
    const lookback = Math.max(0, this.cashHistory.length - 4);
    if (state.myCash >= (this.cashHistory[lookback] ?? 500)) return false; // Winning — stay
    if (state.myNetWorth === this.lastProposalNetWorth) return false; // Nothing changed
    this.lastProposalNetWorth = state.myNetWorth;
    return true;
  }

  decideVote(state: GameState): boolean {
    const winning = state.myCash >= (this.cashHistory[Math.max(0, this.cashHistory.length - 4)] ?? 500);

    if (winning) {
      return this.lastVotedForSwitch; // Stay with what worked
    } else {
      this.lastVotedForSwitch = !this.lastVotedForSwitch;
      return this.lastVotedForSwitch;
    }
  }

  decideJailBuyout(state: GameState, buyoutCost: number): boolean {
    if (state.myCash < buyoutCost) return false;

    const winning = state.myCash >= (this.cashHistory[Math.max(0, this.cashHistory.length - 4)] ?? 500);
    if (winning) {
      return this.lastPaidBuyout;
    } else {
      this.lastPaidBuyout = !this.lastPaidBuyout;
      return this.lastPaidBuyout;
    }
  }
}
