# The Landlord's Game — Rules Reference

> Based on Elizabeth Magie's 1903 patent and published rules. Adapted for on-chain simulation.

## Overview

The Landlord's Game is played on a 40-space board. Players move clockwise by rolling two dice. The board contains properties (lots), railroads, utilities, and special spaces. The game can be played under two rule sets — Monopolist and Prosperity — with optional mid-game mode switching via voting.

## Board Layout (40 Spaces)

| # | Space | Type | Notes |
|---|-------|------|-------|
| 0 | Mother Earth (GO) | Start | Collect $200 salary when passing |
| 1 | Poverty Place | Lot — $60 | |
| 2 | No-op | Safe | (was Community Chest) |
| 3 | Easy Street | Lot — $60 | |
| 4 | Absolute Necessity | Tax — $50 | |
| 5 | Soakum Lighting Co. | Utility — $150 | |
| 6 | Lonely Lane | Lot — $100 | |
| 7 | Family Emergency | Expense — $50 | Monopolist: to bank. Prosperity: to treasury |
| 8 | Boomtown | Lot — $100 | |
| 9 | Slambang Trolley | Railroad — $200 | |
| 10 | Jail | Safe | Visiting only (unless sent here) |
| 11 | Beggarman's Court | Lot — $120 | |
| 12 | Rubeville | Lot — $120 | |
| 13 | The Bowery | Lot — $140 | |
| 14 | Community Bounty | Windfall — $50 | Collect $50 |
| 15 | Rickety Row | Lot — $140 | |
| 16 | Grand Boulevard Railroad | Railroad — $200 | |
| 17 | Lord Blueblood's Estate | Lot — $160 | Monopolist only. Prosperity: FreeParking (no rent) |
| 18 | No-op | Safe | (was Chance) |
| 19 | Crooked Lane | Lot — $160 | |
| 20 | Public Park | Free | No action |
| 21 | La Swelle Hotel | Lot — $180 | |
| 22 | Aqua Pura Water Co. | Utility — $150 | (was Community Chest) |
| 23 | Gambling Den | Lot — $180 | |
| 24 | Broken Leg Railroad | Railroad — $200 | |
| 25 | Calamity Avenue | Lot — $200 | |
| 26 | No-op | Safe | (was Chance) |
| 27 | Easy Money | Lot — $220 | |
| 28 | Luxury Tax | Tax — $75 | |
| 29 | Wall Street | Lot — $220 | |
| 30 | Go to Jail | Action | Monopolist: always sends to jail. Prosperity: jail only if free-riding the commons |
| 31 | Fairhope Avenue | Lot — $240 | |
| 32 | Arden Avenue | Lot — $240 | |
| 33 | No-op | Safe | (was Community Chest) |
| 34 | Franceswayland Avenue | Lot — $260 | |
| 35 | Coxeyville Short Line | Railroad — $200 | |
| 36 | No-op | Safe | (was Chance) |
| 37 | The Estates | Lot — $300 | |
| 38 | Supertax | Tax — $100 | |
| 39 | Prosperity Place | Lot — $400 | |

## Rule Set 1: Monopolist

The competitive rule set. Familiar to anyone who has played Monopoly.

### Core Mechanics
- **Salary**: Collect $200 when passing Mother Earth (GO)
- **Buying**: Land on unowned lot → may buy at listed price. Money goes to the bank.
- **Rent**: Land on owned lot → pay rent to the **property owner**
- **Base rent**: 10% of purchase price
- **Houses**: Owner may build houses ($50 each, max 4). Each house adds $10 to rent.
- **Monopoly bonus**: Own all lots in a color group → base rent doubles
- **Railroads**: Rent = $25 × number of railroads owned by that player
- **Utilities**: Rent = dice roll × 4 (one utility) or dice roll × 10 (both)
- **Tax**: Pay the listed amount to the bank

### Jail (Monopolist)
- Landing on Go to Jail (position 30) → sent to Jail (position 10)
- **3-turn sentence**. Each turn: call `waitInJail()` to serve time.
- **Buyout**: `payJailBuyout()` — costs $50 × remaining turns ($150 on turn 1, $100 on turn 2, $50 on turn 3). Rich buy freedom, poor wait.
- Released automatically after 3 turns.

### Win Condition
- First player whose **net worth** reaches **$2,000**
- Net worth = cash + property face values + (houses × $50)

### No Bankruptcy
Players are never eliminated. Cash floors at $0. If a player cannot pay rent or tax:
1. Forced property liquidation: properties return to unowned at face value, proceeds pay the creditor first, player keeps the remainder
2. If after liquidating ALL properties the player still can't pay: creditor receives whatever was available, player goes to jail with $0
3. Destitute players stay in the game. Lifeline: GO salary only.

## Rule Set 2: Prosperity

The cooperative rule set. Magie's intended demonstration of Georgist economics.

### Core Mechanics
- **Salary**: Collect $200 when passing Mother Earth (GO)
- **Buying**: Land on unowned lot → may buy at listed price. Money goes to the **Public Treasury**.
- **Rent**: Land on owned lot → pay rent to the **Public Treasury** (not the owner)
- **Base rent**: 10% of purchase price
- **Houses**: Same as Monopolist (owner pays $50, each adds $10 rent — but rent goes to Treasury)
- **Railroads**: Same formula, rent to Treasury
- **Utilities**: Same formula, rent to Treasury
- **Tax**: Pay the listed amount to the **Public Treasury**
- **Treasury dividend**: When the Treasury reaches $500, it distributes equally to all players, then resets
- **No monopoly bonus**: Owning all lots in a group provides no rent multiplier

### Jail (Prosperity)
- Landing on Go to Jail (position 30) triggers jail **only if** the player has been free-riding the commons: received dividends AND hasn't contributed recently (`round - lastContributionRound >= playerCount`)
- **1-turn sentence**. Call `waitInJail()`. No buyout available.
- `payJailBuyout()` will revert with `NoBuyoutInProsperity()`.
- This is Ostrom's graduated sanction, implemented as a state machine.

### Win Condition
- The **poorest player's net worth** reaches **$1,000**
- Net worth = cash + property face values + (houses × $50)
- This is a collective win condition — the game ends when the floor rises high enough.

### No Bankruptcy
Same as Monopolist: players are never eliminated, cash floors at $0, forced liquidation if unable to pay. Destitute players stay in the game. Lifeline: GO salary + treasury dividends.

## Mode Switching (Our Addition)

This mechanic is original to our simulation — not in Magie's game.

- Any player may **propose a rule switch** before rolling (costs the turn if rejected)
- The proposer implicitly votes in favor; all other players vote
- **Passes if**: votesFor + 1 (proposer) > votesAgainst
- If approved, the game transitions to the other rule set immediately
- If rejected, the proposer's turn ends (they lose their roll)
- Properties, positions, and balances carry over
- The Public Treasury persists across switches
- Voting is enabled per-game via `votingEnabled` flag in `createGame()`

This allows emergent behavior: agents can collectively decide to change the economic system mid-game. Proposing has a cost (risking your turn), creating a strategic tradeoff between political action and economic action.

## Pre-Vote Signaling

Agents may communicate their voting intent before votes are cast. Signals are non-binding — agents may be honest or deceptive.

In the Sepolia tournament (Phases 1-3), signaling was managed by the orchestrator with hardcoded per-strategy honesty behavior. In the Inaugural Tournament on Base Mainnet, signaling used a shared file where LLM agents wrote their declared intent and could read each other's signals — choosing their own honesty strategy.

The **promise-keeping rate** = (signals matching actual votes) / total signals, per agent. This measures trustworthiness and reveals how deception propagates through the agent ecosystem.

## Simplifications for Simulation

- No mortgaging (simplifies state)
- No trading between players (removes negotiation complexity)
- No Community Chest / Chance card effects (replaced with specific spaces — see board layout)
- Dice are two d6 (2-12 range), no doubles mechanic
- No auction on unpurchased properties