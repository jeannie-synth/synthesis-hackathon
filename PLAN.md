# The Landlord's Game — Implementation Plan

## Goal

**Win The Synthesis hackathon** in the "Agents that Cooperate" track, with potential for Open Track and partner bounties.

## What Wins This Competition

From the ceremony and hackathon docs, submissions are judged by **agentic judges** that build a knowledge graph across all submissions, then surface recommendations to human partners. This means:

1. **Ship working code** — deployed, runnable, verifiable on-chain
2. **Demonstrate meaningful agent contribution** — the collaboration process matters
3. **On-chain artifacts** — more = stronger (contracts, attestations, ERC-8004)
4. **Clear thesis with provable results** — data showing rules shape cooperation
5. **Open source** — all code public by deadline
6. **Partner tool integration** — unlocks up to 10 partner track bounties ($80K+ prize pool)

## Our Thesis

Same agents, same board, two rule sets → radically different outcomes. Economic structure determines whether agents cooperate or compete. Demonstrated through measurable divergence in wealth inequality (Gini), property concentration, game duration, and agent behavior.

## Theoretical Framework

The game is Elizabeth Magie's 1903 Landlord's Game — the original that became Monopoly. Magie designed it with two rule sets to demonstrate Georgist economics: same board, different rules, different outcomes. We replicate this with AI agents.

### Agent Archetypes (grounded in literature)

Agent strategies are drawn from experimental economics and game theory:

- **Extractive** — Marjorie Kelly's extractive ownership archetype (The Divine Right of Capital). Maximizes personal accumulation. Analogous to "Always Defect" in iterated prisoner's dilemma.
- **Generative** — Kelly's generative ownership archetype (Owning Our Future). Invests in commons, prioritizes collective outcome. Analogous to "Always Cooperate."
- **Conditional** — Fischbacher, Gachter & Fehr's conditional cooperator (2001). ~50% of humans in public goods experiments. Matches group behavior with slight self-serving bias. Analogous to Tit-for-Tat (Axelrod tournaments).
- **Free Rider** — Fischbacher's free rider type. ~30% of humans. Minimizes contribution, maximizes extraction from commons. Votes based on recent cash flow, not ideology.
- **Pavlov** — Nowak & Sigmund's "Win-Stay, Lose-Shift" (1993). Most human-like adaptive strategy. Repeats actions that produced good outcomes, switches when outcomes deteriorate.

### Key theoretical sources

- **Kate Raworth** — Doughnut Economics (2017). Degenerative/divisive vs regenerative/distributive design matrix.
- **Marjorie Kelly** — Owning Our Future (2012). Five dimensions of extractive vs generative ownership: Purpose, Membership, Governance, Finance, Networks.
- **Elinor Ostrom** — Governing the Commons (1990). Conditional cooperators vs rational egoists. Institutional rules determine which type dominates.
- **Robert Axelrod** — The Evolution of Cooperation (1984). Tit-for-Tat wins iterated prisoner's dilemma. Properties of winning strategies: nice, provocable, forgiving, clear.
- **Fischbacher, Gachter & Fehr** — "Are People Conditionally Cooperative?" (2001). Empirical behavioral types in public goods games: conditional cooperators (~50%), free riders (~30%), hump cooperators (~14%).
- **Nowak & Sigmund** — "A strategy of win-stay, lose-shift that outperforms tit-for-tat" (1993). Pavlov as dominant adaptive strategy.
- **Ernst Fehr & Simon Gachter** — "Altruistic punishment in humans" (Nature, 2002). Humans pay personal costs to punish free riders.

### References

- Veritasium — "What Game Theory Reveals About Life" (Axelrod's Prisoner's Dilemma tournament): https://www.youtube.com/watch?v=mScpHTIi-kM
- Raworth, K. — Doughnut Economics: Seven Ways to Think Like a 21st-Century Economist (2017)
- Kelly, M. — Owning Our Future: The Emerging Ownership Revolution (2012)
- Ostrom, E. — Governing the Commons: The Evolution of Institutions for Collective Action (1990)
- Axelrod, R. — The Evolution of Cooperation (1984)

## Timeline

| Date | Day | Focus |
|------|-----|-------|
| Mar 13 | 1 | Infrastructure + architecture lock |
| Mar 14 | 2 | Contract hardening + E2E single game |
| Mar 15 | 3 | Tournament runner + agent strategies |
| Mar 16 | 4 | Base Sepolia deployment |
| Mar 17 | 5 | Phase 2: voting + office hours |
| Mar 18 | 6 | Phase 3: signaling + full tournament suite |
| Mar 19 | 7 | On-chain final runs + partner integrations |
| Mar 20 | 8 | Results analysis + documentation |
| Mar 21 | 9 | **Initial deadline** — submit |
| Mar 22 | 10 | **Final deadline** — polish + resubmit if needed |

**Burn rate**: 4-6 hrs/day = 40-60 hours total. Days 9-10 are buffer/polish.

---

## Architecture

### Two Parallel Boards
- Board A: Monopolist rules | Board B: Prosperity rules
- **5 agents per board** (contract supports 2-6, no change needed)
- 5 twin pairs: one twin on each board
- Direct twin comparison = clean controlled experiment

### Agent Taxonomy (5 Twin Pairs) — LOCKED

| # | Strategy | Buy | Build | Vote (Phase 2) |
|---|----------|-----|-------|-----------------|
| 1 | **Extractive** | If cash ≥ price (always) | All owned properties, if cash ≥ $50 | Always Monopolist |
| 2 | **Generative** | If cash ≥ 2× price | Only in Prosperity mode, if cash ≥ $100 | Always Prosperity |
| 3 | **Conditional** | If majority of other players bought on their last turn | If majority of other players built on their last turn | Votes with majority from last vote |
| 4 | **Free Rider** | Never | Never | If cash trending up → keep current mode. If cash trending down → vote to switch. |
| 5 | **Pavlov** | If last buy decision led to cash increase → repeat. If cash decreased → flip. | Same win-stay/lose-shift logic | If current mode is working (cash rising) → keep. If not → switch. |

**Design principles**:
- Only Extractive (Monopolist) and Generative (Prosperity) have hardwired votes. Conditional, Free Rider, and Pavlov vote based on game dynamics → political outcomes are emergent.
- 5 agents per board = odd number, all votes resolve.
- Identical agent composition on both boards = any outcome difference is attributable to the rules.
- In Phase 4 (strategy evolution), agents choose from these 5 strategies based on past performance. The convergence pattern reveals which archetype the rule set rewards.

**Stretch: LLM Agent Layer**
- For mainnet showcase games, replace hardcoded logic with Claude API calls (Haiku, ~$0.02/game)
- Each agent gets a persona prompt based on its archetype
- LLM reasons about decisions given game state
- Logged reasoning becomes part of submission narrative
- Benchmarks remain hardcoded for reproducibility

### Two Deployment Modes (Day 6 Pivot)

**Batch Tournament** (Sepolia, our 5 agents):
- Orchestrator holds all keys, creates games, drives all turns, writes JSON logs
- Feature flags control behavior: `VOTING`, `SIGNALING`, `EVOLUTION`
- Phase is derived metadata — which flags were active
- Produces controlled experimental data for the thesis
- Signaling + evolution are orchestrator-only features (coordinating our agents)

**Open Mainnet Game** (Base Mainnet, any agent):
- **Contract is the server.** No orchestrator needed.
- Each agent is their own client — calls contract functions directly via skill file
- Viewer polls `getFullState()` for spectating
- Skill file documents the client interface (join, play, rules)
- Voting is a per-game flag in `createGame(votingEnabled)` — works natively
- Signaling/evolution don't apply — agents bring their own strategy, no coordinator

### Phased Build (Each Phase = Stronger Submission)
- **Phase 1 (must-have)**: Fixed-rule parallel boards, benchmark data → *proves thesis*
- **Phase 2 (should-have)**: Mode-switching votes, propose costs turn → *political dynamics*
- **Phase 3 (batch only)**: Pre-vote signaling, agents may lie → *trust/betrayal metrics*
 - **Phase 4 (batch only)**: Strategy evolution, agent memory → *emergent adaptation*. Per-game strategy selection: agents choose different strategies for Monopolist vs Prosperity games, preventing selection bias against ideological archetypes.
- **Open Game (must-have)**: Skill file + mainnet deploy → *any agent can play, real cooperation*

### Tournament Structure
| ID | Starting Rules | Voting | Signaling | Evolution | Games | Phase |
|----|---------------|--------|-----------|-----------|-------|-------|
| A | Monopolist | No | No | No | 100 | 1 |
| B | Prosperity | No | No | No | 100 | 1 |
| C | Monopolist | Yes | Yes | No | 100 | 2+3 |
| D | Prosperity | Yes | Yes | No | 100 | 2+3 |
| E | Monopolist | Yes | Yes | Yes | 100 | 4 |
| F | Prosperity | Yes | Yes | Yes | 100 | 4 |

### Metrics (What We Measure)
| Metric | What It Shows | Phase | Status |
|--------|---------------|-------|--------|
| Gini coefficient (on net worth) | Wealth inequality divergence | 1 | Done |
| Herfindahl index | Property concentration | 1 | Done |
| Rounds to completion | Game duration under each rule set | 1 | Done |
| Twin divergence | Same strategy, different rules → different outcomes | 1 | Done |
| Treasury flow rate | Redistribution dynamics | 1 | Done |
| Jail events per strategy | Commons exploitation detection (Free Rider signal) | 1 | Done |
| Buy/build counts per strategy | Behavioral differences across rule sets | 1 | Done |
| Proposal count + pass rate | Political activity under each rule set | 1 | Done |
| Performance table + dominance flip | Which strategy wins under which rules | 1 | Done |
| Liquidation events | Economic crises per game | 1 | Parked (needs tx receipt parsing) |
| Gini curve over rounds | When inequality emerges (time-series) | 1 | Streamlit (from roundSnapshots) |
| Treasury curve over rounds | Redistribution dynamics over time | 1 | Streamlit (from roundSnapshots) |
| Rank volatility | Wealth mobility vs lock-in | 1 | Streamlit (from roundSnapshots) |
| Nash/payoff heatmap | Strategy payoff matrix (5 × 2) | 3 | Placeholder |
| Mode switch frequency | Political instability | 2 | — |
| Promise-keeping rate | Signal vs actual vote | 3 | — |
| Strategy convergence | What agents learn to become | 4 | — |

### Data Pipeline & Visualization — LOCKED

**Design principle**: Every game event → structured JSON log → any downstream consumer.

The JSON log schema is the contract between the game engine and all visualization/analysis layers. Provision the data now, build the views later.

**Layer 1 — Structured event logs** (Day 2, in orchestrator logger)
- One JSON file per game, directory per tournament
- Schema mirrors the 16 Solidity events + game metadata (mode, agents, round, timestamps)
- Consistent schema enables any frontend to consume: Streamlit, HTML, pixel art, agentic judges

**Layer 2 — CDP SQL API verification** (Day 4, with Sepolia deploy)
- Coinbase Developer Platform SQL API: query `base.events` table to verify on-chain events match local logs
- Free, Base-native, no infrastructure — deepens Base partner integration beyond "just deploying"
- Claim: we use Base for chain AND data

**Layer 3 — Streamlit dashboard** (Day 5-6)
- Python/Streamlit consuming JSON logs from Layer 1
- Analytical charts: Gini curves over time, wealth distributions, twin-pair divergence, property heatmaps, treasury flow
- Single-game replay view for human judges

**Layer 4 — HTML5 replay viewer** (Day 3, done)
- SVG board with Orli's art, animated dice, player tokens, event ticker
- Loads JSON game logs, step-through playback
- Spectator tool for judges — NOT a play interface (agents play via contract directly)

**Layer 5 — Open game skill file** (Day 7, the multiplier)
- Documents contract interface for any AI agent to play on mainnet
- Self-organizing lobby: scan for open games → join or create
- Turns our project into infrastructure other hackathon agents use

**Why this matters**: The hackathon has no data infrastructure bounty despite being about AI agents that feed off data. Rather than complain, we demonstrate the gap by filling it. Our submission shows a clean data pipeline (on-chain events → structured logs → SQL verification → analytical dashboards → thesis-proving visualizations). When the data proves the thesis, we make the case explicitly: data infrastructure is not optional for agent cooperation.

### Partner Integrations (Competition Leverage)
| Partner | Integration | Track Touched | Effort |
|---------|------------|---------------|--------|
| Base | Deploy on Base + CDP SQL API for data verification | Primary chain + data | Done + Day 4 |
| Self Protocol | Agent identity attestation via self-agent-id + ERC-8004 | Agents that Trust | Medium |
| ENS | Name agents with Goldi's domains | Agents that Trust | Low |
| Commit-reveal | Secret ballots (no external dep) | Agents that Keep Secrets | Medium |

---

## Work Streams (Parallelizable)

| Stream | Focus | Can Run In |
|--------|-------|-----------|
| C | Contracts — Foundry, Solidity, tests, deployment (LOCKED — no changes unless bug) | Own session |
| T | TypeScript — orchestrator, agents, chain wiring | Own session (needs ABI from C) |
| V | Visualization — Streamlit dashboard, data pipeline | Own session (needs JSON logs from T) |
| D | Docs, analysis, submission artifacts | Own session (needs results from T+V) |

---

## Day 1 — Mar 13: Infrastructure + Architecture Lock

### Step 1: Pull ethskills ✅
- [x] Fetched: wallets, ship, gas, l2s, standards, tools
- [x] Key findings: ERC-8004 registries at known addresses, Base cheapest L2, Foundry+viem confirmed

### Step 2: Wallet & Sepolia ETH ✅ (partial)
- [x] Generated deployer wallet → `0xBCD313e25c7bAd1f91EaED3CA05bc53ff466C289`
- [x] Private key in `.env` (gitignored)
- [x] Base Sepolia RPC configured
- [x] Coinbase Wallet extension set up in Orion browser
- [ ] **IN PROGRESS**: Sepolia faucet drip (Goldi working manually, 24hr cycle)

### Step 3: Strategy Design Session ✅
- [x] Reviewed existing 3 strategies against economic literature
- [x] Researched: Doughnut Economics, Marjorie Kelly, Axelrod, Fischbacher/Fehr, Ostrom, Pavlov
- [x] Designed 5 archetypes grounded in experimental economics
- [x] Locked agent taxonomy (see Architecture section above)
- [x] Theoretical framework documented

### Step 4: Code Review + Contract/TS Work (NEXT — after Goldi review)
- [ ] Goldi reviews scaffolded contracts, agents, orchestrator
- [x] Extract ABI → `agents/src/chain/abi.ts` (unblocks all TS work)
- [ ] Expand contract test coverage (rent, bankruptcy, treasury, win conditions, jail)
- [x] Add `getFullState()` batch view function
- [ ] Begin TypeScript wiring: setup.ts, game-loop.ts

### Milestone: Wallet funded, architecture locked ✅, code review + implementation next

---

## Day 2 — Mar 14 (TODAY): Contract Review + E2E Game

### Goal: Goldi reviews scaffolded code. Start parallel sessions. First game on Anvil.

**Session 1 (this session)**: Goldi reviews code, strategic decisions, plan coordination
**Session 2 (Stream C)**: Contract hardening — ABI extraction, expand tests, getFullState()
**Session 3 (Stream T)**: TypeScript wiring — setup.ts, game-loop.ts against Anvil

### Stream C tasks (parallel session) — ✅ COMPLETE (Session 3)
- [x] **Refactor to multi-game contract**: `mapping(uint256 => Game) public games`, `nextGameId` counter
  - Wrap all per-game state into `Game` struct (players, properties, treasury, round, etc.)
  - Per-game mappings (`properties`, `hasVotedOnSwitch`) become `mapping(uint256 => mapping(...))` keyed by gameId
  - `createGame(uint256 tournamentId, GameMode mode, address[] players)` returns `gameId`
  - All functions take `gameId` as first param
  - All events include `gameId`; `GameCreated` includes `tournamentId` and player addresses
  - `joinGame(uint256 gameId)` for mainnet open registration
- [x] Replace bankruptcy with debt-jail mechanic (both modes):
  - No player elimination. Cash floors at $0. No debt (can't go negative).
  - Can't pay rent/tax → forced property liquidation: properties return to unowned at face value, proceeds pay creditor first, debtor keeps change
  - If after liquidating ALL properties still can't pay → creditor gets whatever was available, debtor goes to jail with $0
  - Destitute players stay in game: Monopolist lifeline = GO salary only. Prosperity lifeline = GO salary + treasury dividends.
  - `_deduct()` returns actual amount deducted; callers credit only that (fixes money-creation bug)
  - Post-hackathon enhancement: player-to-player property sale instead of return-to-unowned
- [x] Board changes:
  - Add second utility: pos 22 → "Aqua Pura Water Co." ($150, Utility) — replaces Community Chest
  - Add windfall space: one Community Chest → "Community Bounty" — collect $50 (both modes)
  - Add expense space: one Chance → "Family Emergency" — pay $50 (Monopolist: to bank, Prosperity: to treasury)
  - Remaining Chance/Community Chest stay as no-ops (5 dead spaces out of 40)
- [x] Mode-conditional space behavior:
  - Lord Blueblood's Estate (pos 17): Prosperity → FreeParking (public park, no rent)
  - GoToJail (pos 30): Prosperity → commons exploitation check (see jail rules below)
  - Monopoly bonus: already Monopolist-only ✓
- [x] Jail redesign (mode-dependent):
  - Monopolist: landing on GoToJail always sends to jail. 3-turn duration (punitive). Buyout option: pay `JAIL_FEE * (MAX_JAIL_TURNS - turnsInJail)` to leave early ($150/$100/$50). Rich buy freedom, poor wait it out.
  - Prosperity: GoToJail triggers jail ONLY if player has received dividends AND `round - lastContributionRound >= playerCount` (free riding the commons). 1-turn duration (rehabilitative). No buyout.
  - Track `lastContributionRound` per player — updated on any treasury contribution (buy, rent, tax)
  - Track `dividendsReceived` per player — incremented on dividend distribution
- [x] Simplify `_nextTurn()`: no bankruptcy skipping needed. `turnsTaken++`, simple modular index, `round++` on wraparound to player 0
- [x] Add `getFullState(uint256 gameId)` batch view function
- [x] Add `modeSwitchCount` per game
- [x] Win conditions redesign:
  - Net worth = cash + property face values + (houses × HOUSE_COST). No more cash-only threshold.
  - Monopolist: first player to net worth threshold wins
  - Prosperity: poorest player's net worth reaches threshold wins (collective)
  - Thresholds as configurable params in `createGame()`, not constants. Original Magie values as defaults, tunable per game.
  - No MAX_ROUNDS — games end on win condition only (known end = gameable)
- [x] Mode switch redesign (Option C — propose-and-risk):
  - Proposer calls `proposeModeSwitch()` → all other players vote → outcome determines if proposer rolls or loses turn
  - Vote passes: mode switches, proposer rolls normally
  - Vote rejected: proposer's turn ends (`_nextTurn()`)
  - Propose must happen before roll (enforced in contract)
  - Jailed players CAN propose (nothing to lose — political action from prison)
  - No vote timer for hackathon (orchestrator guarantees all votes submitted)
  - Post-hackathon (mainnet): add block-based vote deadline, abstain = vote against (status quo bias)
- [x] Complete event redesign (19 events, all include gameId):
  - GameCreated(gameId, tournamentId, mode, players[], thresholds)
  - TurnStarted(gameId, player, round, turnsTaken)
  - PlayerMoved(gameId, player, fromPos, toPos, dice1, dice2)
  - SalaryCollected(gameId, player, amount, newCash)
  - PropertyBought(gameId, player, position, propertyName, price, newCash)
  - RentPaid(gameId, payer, recipient, position, amount, payerNewCash, recipientNewCash)
  - RentToTreasury(gameId, payer, position, amount, payerNewCash, newTreasuryBalance)
  - TaxPaid(gameId, player, position, amount, newCash, newTreasuryBalance)
  - HouseBuilt(gameId, player, position, totalHouses, newCash)
  - TreasuryDividend(gameId, treasuryBefore, amountPerPlayer, playerCount)
  - DividendCollected(gameId, player, amount, newCash)
  - PropertyLiquidated(gameId, player, position, faceValue, creditor, remainingDebt)
  - SentToJail(gameId, player, reason: GoToJail/CantPayDebt/CommonsExploitation)
  - ReleasedFromJail(gameId, player, method: Waited/PaidBuyout, turnsMissed, feePaid)
  - ModeSwitchProposed(gameId, proposer, currentMode, proposedMode)
  - ModeSwitchVote(gameId, voter, inFavor, votesFor, votesAgainst)
  - ModeSwitched(gameId, oldMode, newMode, round, votesFor, votesAgainst)
  - ModeSwitchRejected(gameId, proposer, round, votesFor, votesAgainst)
  - GameWon(gameId, winner, mode, round, turnsTaken, winnerNetWorth, allPlayerNetWorths[], finalTreasury)
  - Removed: PlayerBankrupt (no bankruptcy), DebtForgiven (no debt forgiveness)
- [ ] Integrate Pyth Entropy for fair dice — DEFERRED to Day 7 (using keccak256 with proper 2d6 for now)
- [x] Expand contract tests to 46 (rent, treasury, win conditions, jail, multi-game, liquidation, mode switch)
- [x] Extract ABI → `agents/src/chain/abi.ts` (LAST — after all contract changes are done)

### Stream T tasks (parallel session) — ✅ COMPLETE (Session 3)
- [x] `npm install` in agents/ and orchestrator/
- [x] Wire ABI into agents/src/chain/contracts.ts
- [x] Update Agent interface: decideBuy, decideBuild, decidePropose, decideVote, decideJailBuyout
- [x] Delete old strategies (MonopolistAgent, CooperativeAgent, BalancedAgent)
- [x] Implement all 5 strategies: Extractive, Generative, Conditional, FreeRider, Pavlov
- [x] Implement setup.ts: deploy via viem, create games on both boards
- [x] Implement game-loop.ts: full turn flow with proposal/vote/roll/buy/build/jail
- [x] Define structured JSON log schema in logger.ts
- [x] Game loop writes one JSON file per game to `data/games/` directory

### Milestone: ✅ `npx tsx src/index.ts` completes two games on Anvil, writes structured JSON logs, prints Gini comparison

---

## Day 3 — Mar 15 (TODAY): Tournament Runner + Metrics Expansion

- [x] tournament.ts: multi-game loop, fresh deploy per game, result aggregation
- [x] metrics.ts: Herfindahl, treasury flow, twin divergence, rounds to completion
- [x] results.ts: JSON + CSV output, console summary
- [x] All 5 strategies implemented (done in Session 3)
- [x] Agent factory: strategies/index.ts with createAgentSet() (done in Session 3)
- [x] Metrics expansion: event counters (jail/buy/build/proposals per strategy from turnLogs)
- [x] Performance table + dominance flip analysis across rule sets
- [x] Nash/payoff heatmap placeholder for Phase 3 (5 strategies x 2 rule sets)
- [x] Gini computed on net worth (not just cash) — fixes inequality measurement
- [x] Streamlit dashboard layout proposed (docs/streamlit-layout.md) — discuss before implementing
- [x] HTML5 replay viewer: SVG board, dice animation, player cards, annotations, event ticker
- [x] Fix game loop proposal/rejection handling (bugs 1+2) — votingEnabled gate + proposal restructure
- [x] Fix Generative proposal frequency (bug 1) — self-preserving proposal logic replaces blind ideology
- [x] Fix ghost roll [0,0] (bug 3) — dice=null when uninitialized
- [x] Fix rollAndMove revert loop (bug 5) — robust recovery: detect jail/alreadyRolled, force-advance turn
- [x] Validate all 5 agents with clean 2-game run on fresh Anvil
- [ ] Run 30-game tournament (15 Monopolist + 15 Prosperity) — on Sepolia, not Anvil

### Bugs fixed (Day 4, Session 5)
1. ~~Generative always proposes in Monopolist~~ → Phase 1: votingEnabled=false skips proposals entirely. Phase 2: self-preserving logic (propose only when below avg NW + conditions changed)
2. ~~FreeRider infinite loop after rejected proposal~~ → votingEnabled gate eliminates in Phase 1. Phase 2: proposal restructure with proposed flag + state verification
3. ~~Ghost roll [0,0] on first turn~~ → dice=null when lastDice1/lastDice2 both 0
4. ~~Agent name matching in event counters~~ → fixed in Day 3
5. ~~rollAndMove revert loop~~ → robust recovery detects PlayerInJail (→ waitInJail) and AlreadyRolled (→ endTurn) instead of naive continue

### Contract patches (Day 4)
- votingEnabled flag: Phase 1 games disable proposals at contract level, Phase 2+ enables
- Vote tie fix: proposer's implicit +1 vote at resolution time (odd total, no ties)
- Prosperity winner: richest player wins (same incentive both modes, clean experiment)
- hasRolled in getFullState: orchestrator can diagnose stuck turns

### Strategy redesign (Day 4)
- Proposal decisions separated from voting ideology: "what you believe" (vote direction) vs "when you act" (self-preservation)
- Ideologists (Generative/Extractive): propose when below average NW + conditions changed since last proposal
- Pragmatists (Conditional/FreeRider/Pavlov): only propose after observing political action from others
- All agents get turnNumber logging for turn boundary tracking

### Validation results (Day 4, fresh Anvil)
- Monopolist: Extractive wins at NW 2016, 51 rounds, Gini 0.0916
- Prosperity: Generative wins at NW 1314, 11 rounds, Gini 0.0302
- Gini divergence: 0.0615 (Monopolist more unequal) — thesis confirmed
- All 5 agents participate, no revert loops, both games complete with winners

### Decisions made
- Time-series extraction (Gini curves, treasury curves) happens in Streamlit from raw JSON logs, not in metrics.ts
- Performance table + dominance flip analysis for strategy comparison (not full Nash equilibria)
- Liquidation counter parked (contract handles automatically, no turn log yet — needs tx receipt parsing)
- Streamlit + Plotly confirmed as viz stack (Days 5-6)
- Phase 1 = no voting (authoritarian rules). Phase 2 = voting enabled (democratic). Phase 3 = signaling (off-chain). Phase 4 = evolution (off-chain). One contract deploy covers all phases.
- turnNumber in flat TurnLog (hackathon decision; correct arch is nested Turn{actions[]})
- Gini thresholds for proposal triggers: parked for Phase 2 tuning after Phase 1 data

### Milestone: All bugs fixed, validated on Anvil, ready for Sepolia deploy

---

## Day 4 — Mar 16: Bug Fixes + Base Sepolia Deployment

- [x] Contract patches: votingEnabled flag, vote tie fix, Prosperity winner, hasRolled view
- [x] Game loop fixes: votingEnabled gate, proposal restructure, ghost roll, rollAndMove recovery
- [x] Strategy redesign: self-preserving proposals (ideologists vs pragmatists)
- [x] TypeScript wiring: ABI, types, setup.ts, tournament.ts, index.ts, logger.ts (turnNumber)
- [x] Validation: 2 clean games on fresh Anvil, both complete with winners
- [ ] Generate agent mnemonic, add to .env
- [ ] Deploy + verify on Base Sepolia
- [ ] Fund agent wallets (0.01 ETH each from deployer)
- [ ] Run Phase 1 tournament on Sepolia (15 Monopolist + 15 Prosperity, votingEnabled=false)
- [ ] CDP SQL API: query `base.events` to verify on-chain events match local JSON logs
- [ ] Document Base data integration (chain + CDP SQL = deeper partner claim)

### Phase 2 known issues (next session)
1. Conditional updateObservations() never called — defaults to first-round behavior
2. Phase 2 E2E validation needed (VOTING=true on Sepolia)

### Milestone: Contract live on Base Sepolia, Phase 1 tournament with on-chain provenance

---

## Day 5 — Mar 17: Contract Event Completeness + Receipt-Driven Orchestrator

**Planned**: Phase 2 voting + Streamlit dashboard
**Actual**: Deeper infrastructure work required — contract event completeness + orchestrator rewrite

- [x] Contract: `_finishTurn()` replaces `_nextTurn()` — universal turn-end with `TurnEnded` event
- [x] Contract: 4 new events (`TurnEnded`, `ContributionMade`, `LiquidationSettled`, enriched `ReleasedFromJail`, `TreasuryDividend`)
- [x] Contract: Treasury remainder preserved (was zeroing integer division dust)
- [x] Contract: Dice seed includes `block.number`
- [x] Contract: `forge build` passes
- [x] Orchestrator: Receipt-driven state (`applyReceipt` handles all 22 events)
- [x] Orchestrator: Wait-and-resync error handling (no recovery writes)
- [x] Orchestrator: `NonceManager` per wallet (nonce advanced only after confirmed receipt)
- [x] Orchestrator: `OrchestratorLog` JSONL telemetry
- [x] Orchestrator: FY shuffle for turn order bias elimination
- [x] ~~Orchestrator: WebSocket transport for Sepolia~~ — REVERTED Day 8: Alchemy drops WS on long games, switched back to HTTP
- [x] Orchestrator: Board space cache
- [x] ABI re-extracted (76 entries)
- [x] Default network flipped to base-sepolia
- [x] `npx tsc --noEmit` passes
- [ ] **BLOCKED**: Sepolia E2E validation (Alchemy free tier stale reads)
- [ ] Phase 2 voting E2E — deferred to Day 6
- [ ] Streamlit dashboard — deferred to Day 6

### Sepolia deploy history (Day 5)
| Address | Status |
|---------|--------|
| `0x2f9240...` | New contract, `createGame` nonce collision |
| `0xb73a17...` | Game loop ran 101 turns but revert storm |
| `0xb496b1...` | Timeout on first rollAndMove |
| `0x1c8cf9...` | Deploy OK, createGame gas estimation failure |

### Milestone: Architecture complete, compiles, not yet validated end-to-end on Sepolia

---

## Day 6 — Mar 18: Phase 3 — Signaling + Full Suite + Dashboard Polish

- [x] signalIntent() on Agent interface (off-chain) — completed Day 7, Session 13
- [x] Per-strategy honesty behavior — completed Day 7, Session 13
- [x] Promise-keeping metric — completed Day 7, Session 13
- [ ] Run Phase 2+3 tournaments on Sepolia (15+15 games each)
- [ ] Cross-tournament analysis (Phase 1 vs Phase 2 vs Phase 3)
- [ ] **Stream V**: Streamlit dashboard v2 — twin-pair comparisons, property heatmaps, treasury flow, single-game replay, promise-keeping charts

### Milestone: Phase 1-3 tournament data, all metrics, preliminary findings, full analytical dashboard

### Day 6 Actuals — Session 9 (parallel session — no code changes to core systems)

- [x] Full architecture walkthrough (contract, rent math, agents, voting, data pipeline)
- [x] Deployment architecture locked: no DB, HTML + wallet glue, Fly.io, CDP SQL → Streamlit only
- [x] Three data paths defined (orchestrator→JSON→viewer, CDP SQL→Streamlit, contract as truth)
- [x] Submission text drafted (`docs/submission-draft.md`) — all Devfolio fields + results template
- [x] CDP SQL API verified live: auth works, `base_sepolia.events` confirmed, schema documented
- [x] 8 verification queries written (`docs/cdp-sql-queries.md`)
- [x] CDP SQL test script working (`scripts/test-cdp-sql.mjs`)
- [x] Turn order bias solution: Fisher-Yates per game, twin pairs share shuffle
- [x] Viewer priority corrected to Tier 0 for submission (human judges have final say)
- [x] Metrics refactor deferred (orchestrator keeps computing for hackathon, Streamlit post-deadline)
- [x] CONVERSATION_LOG.md updated with Session 9

### Day 6 Actuals — Session 10 (diagnostic + orchestrator fixes)

- [x] Diagnosed endTurn revert loop: silent on-chain reverts (receipt.status unchecked)
- [x] Fixed writeContract to detect reverted receipts and throw
- [x] Diagnosed gas estimation failure: dice change between simulation and execution
- [x] Fixed with 500K fixed gas limit (covers worst-case _processLanding paths)
- [x] Fixed parseRevertReason to walk viem's full error tree
- [x] Confirmed contract `0xda1557...` is latest and correct (nextGameId=11, Day 5 features)
- [x] Confirmed deployer funded (0.615 ETH), all 5 agents funded (0.005 ETH each)
- [x] Confirmed 6 post-0xda1557 deploys are zombie retries (CONTRACT_ADDRESS wasn't set)
- [x] Commit `19def39`
- [x] Fixed createGame gas (1M fixed limit in setup.ts)
- [x] **Sepolia test games PASSED** — 2 games (Monopolist + Prosperity), both completed, thesis confirmed on-chain
- [x] Gini divergence 0.3260 on Sepolia (Monopolist 0.3623 vs Prosperity 0.0363)
- [x] 8 transient errors / ~400+ txs — all recovered on retry, zero logic bugs
- [ ] Phase 1 tournament on Sepolia (15+15 games)

### Day 6 Milestone: Phase 1 development COMPLETE. Moving to tournament phase.

### Day 6 Actuals — Session 11 (Streamlit dashboard + submission FAQ)

- [x] Fetched and analyzed submission FAQ from `synthesis.devfolio.co/submission/skill.md`
- [x] Streamlit dashboard built: 4 pages (Thesis, Strategy Performance, Game Dynamics, Single Game Explorer)
- [x] Docker service: `streamlit/Dockerfile` (Python 3.12-slim), separate `dashboard` service in docker-compose
- [x] Dashboard live on localhost:8501, reading existing tournament JSON data
- [x] Anvil validation run started in separate Docker container (receipt-driven orchestrator)
- [ ] Add metric explanations to dashboard (Gini, Herfindahl, twin divergence)
- [ ] Redeploy contract to Sepolia (latest with TurnEnded events)

### Day 6 Decisions
- CDP SQL wires to Streamlit only — not to viewer. Viewer consumes JSON logs.
- Live spectator = orchestrator writes JSON incrementally, viewer polls. Lag is aesthetic.
- Alchemy Smart WebSockets: production feature for external spectators, not hackathon.
- Metrics stay in orchestrator for hackathon. Gini extraction to shared util worth doing anytime.
- "Monopolist" naming stays as hackathon quirk — consistent everywhere including contract enum.
- Streamlit runs in separate Docker service for dev; unified Fly.io container for production (deferred to deployment phase).

---

## Day 7 — Mar 19: Tournaments + Viewer Live Play + Phase 3+4 Dev

### Sepolia tournaments (sequential, unattended — ~8-12 hrs total)
- [x] Phase 1 tournament completes
- [ ] Top up agent wallets from deployer if needed (check after Phase 2)
- [ ] Phase 2 tournament: 15+15 games, `VOTING=true` — **RUNNING** (launched after commit `12be1f8`)
- [ ] Phase 3 tournament: 15+15 games, signaling enabled (~3-4 hrs)
- [ ] (Stretch) Phase 4 tournament: 15+15 games, evolution (~3-4 hrs, may push overnight)

### Day 8 fixes (all complete, committed `12be1f8`)
- [x] Bug fix: WebSocket transport drops → HTTP-only (`createTransport()`, WS path commented out)
- [x] Bug fix: Vote deadlock → proposal + resolution blocks, catch-all vote reverts, chain resync
- [x] Bug fix: Empty error strings → `ERROR_SELECTORS` map (17 custom errors, 4-byte hex)
- [x] 1-pair Sepolia validation: Games 20+21 completed, Gini 0.2571 vs 0.0369, dominance flip confirmed
- [ ] Validate mode switch mechanism on Anvil (force 3/5 agents to vote yes — confirm mode flips)

### Tournament data labeling
- tournamentId: 100 (Phase 1), 200 (Phase 2), 300 (Phase 3), 400 (Phase 4)
- Directory: `data/games/phase{N}-sepolia/`
- Tournament runner takes `PHASE=N` env var → sets tournamentId and directory name
- Streamlit reads directory name prefix → knows the phase

### Jeannie (parallel with tournaments)

**Phase 3+4 TypeScript** (must complete before Phase 3 tournament starts):
- [x] Phase 3: `signalIntent()` on Agent interface — returns intended vote before proposal (Day 7, Session 13)
- [x] Phase 3: per-strategy honesty (Extractive lies, Generative honest, Conditional mirrors, FreeRider lies, Pavlov follows outcome) (Day 7, Session 13)
- [x] Phase 3: promise-keeping metric in tournament runner (signal vs actual vote comparison) (Day 7, Session 13)
- [ ] Phase 4: strategy reassignment between games based on net worth ranking from previous game (design discussion needed — rank per-board, not averaged)
- [x] Anvil-validate Phase 2 (`VOTING=true`, 1 game) — 28 proposals, 13 passed, game completes (Day 7, Session 13)
- [x] Anvil-validate Phase 3 (1 game pair with signaling) — promise-keeping rates: Extractive 0%, Generative 100%, Pavlov 100%, FreeRider 48%, Conditional 14% (Day 7, Session 13)
- [ ] Phase 4: Anvil validation (deferred — needs evolution design)
- [ ] Tournament runner: phase labeling → metadata in tournament JSON (design revised — no PHASE env var, no directory coupling)

**Open Game Skill File** (THE multiplier — invites all hackathon agents to play):
- [ ] Write `skill.md` — teaches any agent how to play The Landlord's Game on Base Mainnet
- [ ] Includes: contract address, ABI (key functions), join/create flow, turn actions, rules summary
- [ ] Self-organizing lobby: agent scans for open game → joinGame() if found, createGame() if not
- [ ] (Optional) Add `findOpenGame()` view function to contract (~10 lines Solidity) for one-call discovery
- [ ] Validate joinGame() flow on Anvil (agent 1 creates, agent 2 joins, both play to completion)
- [ ] Host skill file at a public URL (GitHub raw, or via repo GitHub Pages)
- [ ] Share in hackathon Telegram once mainnet is live

**Viewer live spectator mode**:
- [x] Drop ethers.js CDN dependency — replaced with zero-dependency vanilla JS ABI decoder (Day 8, Session 15)
- [x] Fix ABI offset bug — skip Solidity's leading tuple wrapper word (Day 8, Session 15)
- [x] Live board renders via `eth_call` polling, no external scripts (verified on gameId=18, base-sepolia)
- [ ] Live ticker (action feed) — needs state-diff detection in `pollLive()` (non-critical, cosmetic)
- [ ] (Stretch) Wallet connection + action buttons for human play

**Streamlit phase awareness**:
- [ ] Directory selector shows phase label (Phase 1/2/3/4)
- [ ] Cross-phase comparison page: Gini by phase, strategy rankings by phase
- [ ] Phase 2+ pages: proposal counts, pass rates, mode switch frequency, voting coalitions
- [ ] Phase 3+ pages: promise-keeping rates by strategy, signal accuracy
- [ ] Phase 4 page: strategy convergence chart, adaptation rates
- [x] Metric explanations (Gini, Herfindahl, twin divergence, treasury, dominance flip, rounds)

### Goldi
- [ ] Top up agent wallets (check balances after Phase 1)
- [ ] Review Phase 2 Anvil validation results
- [ ] ERC-8004 NFT self-custody transfer (15-min window, wallet verification + challenge signature)

### Milestone: Phase 1+2 data in hand. Phase 3+4 code validated. Viewer has live play mode. Dashboard is phase-aware.

---

## Day 8 — Mar 20: Super Tournament (Autonomous Agents) + Mainnet + Submission

### Super Tournament — 5 Autonomous Claude Code Agents

**Concept**: Each of our 5 agent wallets becomes an independent Claude Code instance.
No orchestrator. Each agent reads `docs/skill-demo.md`, calls the contract directly,
chooses its own strategy each round, and explains its reasoning.

**Protocol**: 5 rounds × 3 game pairs × 2 modes = 30 games, all with `votingEnabled=true`

Round flow:
1. Agent 0 creates 3 Monopolist + 3 Prosperity games (tournamentId = 500 + round number)
2. Agents 1-4 join each game via `joinGame`
3. All 5 agents play all 6 games to completion (poll `getFullState`, act on their turn)
4. All agents review on-chain results (`getFullState` for completed games)
5. Each agent chooses a strategy **per game** (Monopolist and Prosperity separately) and logs reasoning
6. Round 1: choose based on strategy descriptions alone (STRATEGY_ORDER defaults)
7. Rounds 2-5: choose based on observed on-chain performance data

**Per-game strategy selection** (Day 9 decision): Agents choose different strategies for Monopolist vs Prosperity games. This prevents selection bias against ideological strategies (Extractive dominates Monopolist but fails in Prosperity → rational agent averaging both would never pick it). Per-game choice IS the thesis: rational agents adapt behavior to the rule set.

**Artifacts to create** (Jeannie, before running):
- [ ] `docs/skill-demo.md` — internal skill file: game rules + ABI + 5 strategy descriptions (from TS source) + super tournament protocol + how to read past results
- [ ] `docs/agent-prompts/agent-0.md` through `agent-4.md` — launch prompts for 5 Claude Code terminals
- [ ] Each prompt: wallet index, HD path, env var, role (creator vs joiner), skill-demo.md reference

**Gas estimate** (30 games total):
- Per game: ~33M gas (~$0.05-0.10 on Base)
- 30 games: ~$1.50-3.00 total gas
- Per agent wallet: ~0.005 ETH each
- Deployer: ~0.01 ETH (deploy + fund wallets)
- **Total: ~0.035 ETH**

### Phase A: Sepolia validation (FIRST — before mainnet)
- [x] Run 1 super tournament round on Sepolia (1 game pair, voting enabled) — Games 35+36, tournamentId=501
- [x] Verify: all 5 agents can create/play/complete games — validated
- [x] Verify: SC dynamics (voting, mode switching, jail, signaling) — all pass
- [x] Fix issues: dotenv import, esbuild platform, STRATEGY_ORDER defaults
- [ ] Verify: agents can read completed game states and choose strategies (Rounds 2+ — deferred to mainnet)

### Phase B: Mainnet deployment
- [ ] Goldi funds deployer wallet on Base Mainnet (~0.035 ETH)
- [ ] Deploy contract to Base Mainnet (same locked contract)
- [ ] Fund 5 agent wallets on mainnet from deployer (0.005 ETH each)
- [ ] Record mainnet contract address
- [ ] Update `docs/skill.md` with mainnet contract address
- [ ] Update viewer with mainnet contract address

### Phase C: Mainnet super tournament
- [ ] Run full 5-round super tournament on mainnet (30 games)
- [ ] Viewer live play: verify spectating works against mainnet
- [ ] Collect strategy evolution data (which strategies agents converge on per mode)

### Hosting
- [ ] Viewer: deploy to GitHub Pages (single HTML file, 5 min)
- [ ] Dashboard: deploy to Streamlit Community Cloud (connects to GitHub repo, 10 min)
- [ ] (Deferred post-hackathon) Unified Fly.io Dockerfile

### Documentation
- [ ] README.md: architecture, how to run, results section with real data
- [ ] Fill `docs/submission-draft.md` — all placeholders replaced with actual Gini ratios, dominance flips, findings
- [ ] CONVERSATION_LOG.md: complete narrative for judges
- [ ] PROJECT_DIARY.md: entries through Day 8

### Submission prep
- [ ] Finalize `submissionMetadata` fields (agentFramework, agentHarness, model, skills, tools)
- [ ] Select 4 showcase games (1 per phase, best examples) for viewer pre-loading
- [ ] Record 2-min demo video (screen recording: viewer replay + live play + dashboard)

### Goldi
- [ ] Fund deployer on Base Mainnet (~0.035 ETH)
- [ ] Moltbook post (publish)
- [ ] Make repo public
- [ ] Review submission text, README, conversation log
- [ ] Review showcase game selections

### Milestone: Super tournament validated on Sepolia. Mainnet live. All artifacts hosted. Submission package complete.

---

## Day 9 — Mar 21: Initial Deadline — Submit

- [ ] Submit via Devfolio API (`POST /projects` with all required fields)
- [ ] Include: conversationLog, submissionMetadata, repoURL, trackUUIDs, deployedURL, videoURL
- [ ] Publish: `POST /projects/:uuid/publish`
- [ ] Verify: `GET /projects/:uuid` returns `status: "publish"`
- [ ] Verify: project appears in `GET /projects` listing
- [ ] Smoke test: viewer URL works, dashboard URL works, repo is public, mainnet contract responds
- [ ] Phase 4 tournament if not completed (last chance for data)

### Milestone: Submitted and verified.

---

## Day 10 — Mar 22: Final Deadline — Polish + Resubmit

- [ ] Address any issues found after initial submission
- [ ] Update submission with video URL if recorded on Day 9
- [ ] Run additional mainnet showcase games if gas allows
- [ ] Final Streamlit polish with complete data
- [ ] Update `POST /projects/:uuid` with any improvements
- [ ] Final smoke test all URLs

---

## Critical Path (Revised Day 7)

```
JEANNIE (Day 7-8):           skill-demo.md ──→ agent prompts ──→ Sepolia validation ──→ fix issues
                              (now)             (now)              (today)                (today)

SEPOLIA SUPER (Day 8):       1-round validation ──→ fix ──→ (optional: full 5 rounds)
                              ~1 hr                  TBD      ~4 hrs

MAINNET (Day 8):             Goldi funds ──→ Deploy ──→ Fund wallets ──→ Super tournament (5 rounds)
                              (Goldi)         15 min      10 min          ~4 hrs (autonomous agents)

HOSTING (Day 8):             GitHub Pages (viewer) + Streamlit Cloud (dashboard)

GOLDI (parallel):            Fund mainnet → NFT transfer → Moltbook → Repo public → Review
                              (Day 8)        (Day 7)        (Day 8)    (Day 8)       (Day 8)

SUBMIT (Day 9):              Devfolio API → Verify → Smoke test
```

### What's parallelizable RIGHT NOW
1. **skill-demo.md + agent prompts** — file creation, no chain dependency
2. **Batch Sepolia tournaments** — Phase 2 running, Phase 3 queued (orchestrator)
3. **Viewer + Streamlit polish** — independent of super tournament

### What's sequential
- Super tournament Sepolia validation → fix issues → mainnet deployment → mainnet super tournament
- Submission: needs all artifacts ready

### Minimum viable submission (if time runs out)
- **Floor**: Phase 1+2 Sepolia data + dashboard + viewer replay + submission text
- **Strong**: + Phase 3 signaling + super tournament on Sepolia + mainnet contract live
- **Full**: + 5-round mainnet super tournament with strategy evolution data

**Cut order**: Mainnet super tournament rounds 2-5 first, then Phase 3 batch, then Streamlit polish.

---

## Closed Design Questions

### Agent Wallet Architecture — RESOLVED (Day 2)
- **Hackathon tournament**: Mnemonic HD derivation stays as-is. Works, ships, reproducible.
- **Mainnet open game**: Add `joinGame(uint256 gameId)` function alongside `createGame()`. Creator sets max players, others join themselves. `msg.sender` is the identity. Both modes coexist: closed for tournament, open for mainnet.
- **Wallet derivation**: Leave mnemonic + HD as-is. For mainnet, the question dissolves — players bring their own wallets.
- **When**: `joinGame()` is a Day 7 task (mainnet prep). No changes to wallet derivation needed.

### Data Infrastructure & Visualization — RESOLVED (Day 2)
- **Decision**: Structured JSON logs are the data contract between game engine and all consumers.
- **Layers**: JSON logs (Day 2) → CDP SQL verification (Day 4) → Streamlit dashboard (Day 5-6) → pixel art stretch (Day 8).
- **Strategy**: No data infrastructure bounty exists. We demonstrate the gap by filling it, then make the case explicitly when the data proves the thesis.
- **Base integration deepened**: Chain deployment + CDP SQL API = data partner, not just hosting partner.

### Multi-Game Contract & Twin Architecture — RESOLVED (Day 2)
- **Problem**: Deploying a fresh contract per game = spam on-chain (100 deploys per tournament). Also unclear whether twins share wallet addresses.
- **Solution**: Single contract with `mapping(uint256 => Game) public games` and `nextGameId` counter. One deploy, unlimited games. Pattern proven in production (RumbleDeck/Fleppa.io).
- **Tournament IDs on-chain**: `createGame(uint256 tournamentId, ...)` — links games to experimental conditions. CDP SQL can query all games in a tournament directly. Verifiable, not just orchestrator metadata.
- **Twin wallets — same address, sequential boards**: 5 wallets, not 10. Same address plays under Monopolist rules in game N, then Prosperity rules in game N+1. Twin identity is self-evident on-chain — anyone can see 0xABC played both rule sets. No metadata trust needed.
- **Sequential boards are fine**: Games take seconds on Anvil. Parallel nonce management for 10 wallets adds complexity with no real speed benefit.
- **On-chain vs off-chain split**:
  - On-chain: gameId, tournamentId, mode, player addresses
  - Off-chain (orchestrator JSON): strategy labels, tournament config, agent decision reasoning

### Dice Randomness — RESOLVED (Day 2)
- **Problem**: Current dice uses `keccak256(block.prevrandao, ...)` — deterministic per block. A player/bot can simulate the hash and delay transactions to get favorable rolls. Fine for Anvil and hackathon (we control all agents), exploitable on mainnet.
- **Solution**: Swap to **Pyth Entropy** — already on Base, lightweight commit-reveal VRF, just gas + small protocol fee. Pyth handles the reveal callback.
- **Bonus — proper 2d6 distribution**: Current formula (`% 11 + 2`) gives flat 2-12. Real dice are bell-curved (7 most common). With Pyth: `(rand % 6 + 1) + ((rand / 6) % 6 + 1)`. Changes game dynamics — mid-board positions become more likely landing spots.
- **When**: Day 2 Stream C — integrate into the contract before ABI extraction. No reason to defer; the contract is still malleable.
- **Upgradeability**: Not needed. All changes (Pyth dice, `joinGame()`, bug fixes, events) go into v1 before ABI locks the interface.

---

## Risk Register

### Resolved risks
| Risk | Resolution |
|------|-----------|
| ~~Sepolia faucet limits~~ | Deployer has 0.615 ETH, agents funded |
| ~~Game loops forever~~ | Receipt-driven orchestrator + wait-and-resync |
| ~~Gas exceeds budget~~ | Fixed gas limits (500K writes, 1M createGame) |
| ~~Strategy design too long~~ | 5 strategies locked Day 1, validated Day 4 |
| ~~_nextTurn() round bug~~ | Replaced with _finishTurn() + TurnEnded event |

### Active risks (Days 7-10)
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Agent wallets run dry mid-tournament | Blocks Sepolia tournaments | Check after Phase 1, top up from deployer |
| Phase 2 voting bugs on Sepolia | Blocks Phase 2 data | Anvil validation tonight catches bugs first |
| Overnight tournament crashes | Lose 8 hrs of tournament time | Error recovery built in; add process wrapper |
| Streamlit Cloud deploy fails | No live dashboard URL | Fall back to screenshots in video |
| NFT transfer fails | Can't publish submission | Attempt Day 7, retry through Day 9 |
| Phase 3+4 dev takes too long | No Phase 3/4 data | Phase 2 is already strong; cut 4 first, then 3 |
| Mainnet gas costs higher than expected | Limits showcase games | Budget 0.01 ETH for 2 games; Base L2 is cheap |
| Viewer wallet integration breaks | No live play demo | Fall back to replay mode; JSON viewer still works |

---

## What "Done" Looks Like (Submission Checklist)

### Must-have (submission gates)
- [ ] ERC-8004 NFT self-custody transfer complete
- [ ] Moltbook post published with post URL
- [ ] Repo public on GitHub
- [ ] Devfolio submission published with all required fields
- [ ] conversationLog field populated (PROJECT_DIARY.md + CONVERSATION_LOG.md)

### Core deliverables
- [x] Smart contract deployed on Base Sepolia (0xda1557c9...)
- [ ] Smart contract deployed on Base Mainnet
- [ ] 30+ games on Sepolia (Phase 1 tournament)
- [ ] Open game skill file — any hackathon agent can play via `joinGame()`
- [x] 5 agent strategies, 5 twin pairs, 2 parallel boards
- [x] Measurable thesis: Gini divergence confirmed (0.3260 on Sepolia test)
- [x] Structured JSON game logs
- [x] CDP SQL API verification queries written and tested
- [x] Streamlit dashboard with 4 pages + metric explanations
- [ ] Viewer hosted on GitHub Pages (spectator/replay mode)
- [ ] Dashboard hosted on Streamlit Community Cloud
- [ ] README.md with architecture, results, how to run
- [ ] Results documented with real data (not placeholders)
- [ ] 2-min demo video (optional but valuable)
- [ ] Hackathon Telegram announcement inviting agents to play

### Strong additions (Phase 2+)
- [ ] Phase 2 tournament data (voting dynamics, political coalitions)
- [ ] Phase 3 tournament data (signaling, promise-keeping metrics)
- [ ] Cross-phase comparison in dashboard
- [ ] Dominance flip analysis with real data

### Stretch
- [ ] Phase 4 tournament data (strategy evolution, convergence)
- [ ] Partner integrations: Self Protocol, ENS
- [ ] Viewer live play mode for humans (wallet + action buttons)
- [ ] Pre-game lobby UI for organizing open games

---

## Final Status — Day 10, March 22, 2026

### What shipped

| Deliverable | Status | Notes |
|-------------|--------|-------|
| Smart contract (Sepolia) | SHIPPED | 3 contracts, 73+ games |
| Smart contract (Mainnet) | SHIPPED | 0x496cf1..., 18+ games |
| Phase 1: Fixed rules | SHIPPED | 30 games, Gini divergence confirmed |
| Phase 2: Voting | SHIPPED | 13/30 games (infra failures), voting dynamics captured |
| Phase 3: Signaling | SHIPPED | 2 Sepolia games + Round 3 mainnet with shared signal file |
| Phase 4: Strategy evolution | SHIPPED | Mainnet super tournament — LLM agents with free choice |
| 5 agent strategies | SHIPPED | Extractive, Generative, Conditional, FreeRider, Pavlov |
| Receipt-driven orchestrator | SHIPPED | Zero stale-read failures |
| LLM agent tournament | SHIPPED | 5 Claude Code agents, 3 rounds, 18 mainnet games |
| Agent debrief | SHIPPED | 20-question qualitative reflection, all 5 agents responded |
| HTML5 viewer | SHIPPED | Replay mode with showcase games |
| Streamlit dashboard | SHIPPED | 4 pages, metric explanations |
| Skill file (open game) | SHIPPED | docs/skill.md, any agent can play |
| ERC-8004 identity | SHIPPED | Transferred to deployer wallet |
| Data integrity audit | SHIPPED | All claims verified against data |
| CONVERSATION_LOG.md | SHIPPED | Full collaboration narrative |
| README.md | SHIPPED | Thesis, architecture, results, invitation |

### What we skipped

| Planned | Why skipped |
|---------|-------------|
| 15+15 Phase 2 games | Deployer nonce drift killed 17/30. 13 sufficient. |
| Partner integrations (ENS, Self, Celo, Status L2) | No time, no honest claim without real integration |
| MetaMask Delegation | msg.sender incompatibility with player tracking |
| OpenServ integration | Didn't use their SDK |
| 5-round super tournament | Reduced to 3 — voting makes games longer |
| 2-min demo video | Time spent on data integrity instead |
| Nash equilibrium formal analysis | Hackathon scope, not academic |
| Viewer live ticker | Nice-to-have, not critical |

### Submission checklist

- [x] ERC-8004 NFT self-custody transfer
- [ ] Moltbook post published
- [x] Repo public on GitHub
- [ ] Devfolio submission published
- [x] conversationLog populated (CONVERSATION_LOG.md)
- [x] Smart contract on Mainnet
- [x] 70+ Sepolia games + 18 mainnet games
- [x] Open game skill file
- [x] Viewer with showcase games
- [x] Dashboard with 4 pages
- [x] Data integrity audit
- [x] Agent debrief (qualitative data)
