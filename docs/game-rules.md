# The Landlord's Game — Rules Reference

> Based on Elizabeth Magie's 1903 patent and published rules. Simplified for simulation.

## Overview

The Landlord's Game is played on a 40-space board. Players move clockwise by rolling two dice. The board contains properties (lots), railroads, utilities, and special spaces. The game can be played under two rule sets.

## Board Layout (40 Spaces)

| # | Space | Type |
|---|-------|------|
| 0 | Mother Earth (GO) | Start — collect salary |
| 1 | Poverty Place | Lot — $60 |
| 2 | Community Chest | Card |
| 3 | Easy Street | Lot — $60 |
| 4 | Absolute Necessity | Tax — $50 |
| 5 | Soakum Lighting Co. | Utility — $150 |
| 6 | Lonely Lane | Lot — $100 |
| 7 | Chance | Card |
| 8 | Boomtown | Lot — $100 |
| 9 | Slambang Trolley | Railroad — $200 |
| 10 | Jail (visiting) | Safe |
| 11 | Beggarman's Court | Lot — $120 |
| 12 | Rubeville | Lot — $120 |
| 13 | The Bowery | Lot — $140 |
| 14 | Legacy | Card |
| 15 | Rickety Row | Lot — $140 |
| 16 | Grand Boulevard Railroad | Railroad — $200 |
| 17 | Lord Blueblood's Estate | Lot — $160 |
| 18 | Chance | Card |
| 19 | Crooked Lane | Lot — $160 |
| 20 | Public Park | Free — no action |
| 21 | La Swelle Hotel | Lot — $180 |
| 22 | Community Chest | Card |
| 23 | Gambling Den | Lot — $180 |
| 24 | Broken Leg Railroad | Railroad — $200 |
| 25 | Calamity Avenue | Lot — $200 |
| 26 | Chance | Card |
| 27 | Easy Money | Lot — $220 |
| 28 | Luxury Tax | Tax — $75 |
| 29 | Wall Street | Lot — $220 |
| 30 | Go to Jail | Action |
| 31 | Fairhope Avenue | Lot — $240 |
| 32 | Arden Avenue | Lot — $240 |
| 33 | Community Chest | Card |
| 34 | Franceswayland Avenue | Lot — $260 |
| 35 | Coxeyville Short Line | Railroad — $200 |
| 36 | Chance | Card |
| 37 | The Estates | Lot — $300 |
| 38 | Supertax | Tax — $100 |
| 39 | Prosperity Place | Lot — $400 |

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
- **Jail**: Go to Jail sends you to space 10. Skip one turn or pay $50 to leave.

### Win Condition
- First player to accumulate **$2,000**, OR
- Last player remaining (all others bankrupt)

### Bankruptcy
When a player cannot pay rent or tax, they are eliminated. Properties return to unowned.

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

### Win Condition
- The **poorest player** reaches **$1,000**

### No Bankruptcy
Players cannot go bankrupt. If a player cannot pay, their balance goes to $0 and they continue playing. The Treasury dividend mechanism provides recovery.

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

## Pre-Vote Signaling (Phase 3 — Off-Chain)

At the end of each turn (after turn 0), all agents broadcast a **signal** of how they intend to vote if a proposal is made. Signals are non-binding — agents may lie.

- **Honest strategies** (Generative, Pavlov when winning): signal matches actual vote
- **Deceptive strategies** (Extractive, FreeRider): signal opposite of actual vote or signal cooperation while voting selfishly
- **Mirroring strategies** (Conditional): mirror the majority signal from others

The **promise-keeping rate** = (signals matching actual votes) / total signals, per strategy. This measures trustworthiness and reveals how deception propagates through the agent ecosystem.

## Simplifications for Simulation

- No mortgaging (simplifies state)
- No trading between players (removes negotiation complexity — stretch goal)
- No Community Chest / Chance card effects (spaces are "no action" in MVP)
- Dice are two d6 (2-12 range), no doubles mechanic
- No auction on unpurchased properties
