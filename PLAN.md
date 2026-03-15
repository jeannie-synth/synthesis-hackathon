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

### Phased Build (Each Phase = Stronger Submission)
- **Phase 1 (must-have)**: Fixed-rule parallel boards, 100 games, benchmark data → *proves thesis*
- **Phase 2 (should-have)**: Mode-switching votes, propose costs turn → *"can machines keep promises" answer*
- **Phase 3 (could-have)**: Pre-vote signaling, agents may lie → *trust/betrayal metrics*
- **Phase 4 (stretch)**: Strategy evolution, agent memory → *emergent adaptation*

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
| Metric | What It Shows | Phase |
|--------|---------------|-------|
| Gini coefficient | Wealth inequality divergence | 1 |
| Herfindahl index | Property concentration | 1 |
| Rounds to completion | Game duration under each rule set | 1 |
| Twin divergence | Same strategy, different rules → different outcomes | 1 |
| Treasury flow rate | Redistribution dynamics | 1 |
| Mode switch frequency | Political instability | 2 |
| Promise-keeping rate | Signal vs actual vote | 3 |
| Strategy convergence | What agents learn to become | 4 |

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
- Stretch: human-playable mode via Streamlit UI (board state display, click-to-act, tx submission)

**Layer 4 — Pixel art board replay** (Day 8, stretch)
- HTML5 canvas or simple web app replaying games from JSON logs
- 40-space board, colored tokens, property markers
- Pure charm — for the submission narrative

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
| C | Contracts — Foundry, Solidity, tests, deployment | Own session |
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

## Day 3 — Mar 15 (TODAY): Tournament Runner

- [ ] tournament.ts: multi-game loop, fresh deploy per game, result aggregation
- [ ] metrics.ts: Herfindahl, treasury flow, twin divergence, rounds to completion
- [ ] results.ts: JSON + CSV output, console summary
- [x] All 5 strategies implemented (done in Session 3)
- [x] Agent factory: strategies/index.ts with createAgentSet() (done in Session 3)

### Milestone: 100 games per board on Anvil, results in CSV, thesis visible in data

---

## Day 4 — Mar 16: Base Sepolia Deployment + Data Verification

- [ ] Update Deploy.s.sol, deploy + verify on Base Sepolia
- [ ] Fund agent wallets with Sepolia ETH
- [ ] Sepolia-aware orchestrator: receipt waiting, retry logic, rate limiting
- [ ] Run 10-20 games on Sepolia, log tx hashes
- [ ] CDP SQL API: query `base.events` to verify on-chain events match local JSON logs
- [ ] Document Base data integration (chain + CDP SQL = deeper partner claim)

### Milestone: Contract live on Base Sepolia, on-chain data verified via CDP SQL API

---

## Day 5 — Mar 17: Phase 2 — Voting + Streamlit Dashboard (Office Hours day)

- [ ] proposeModeSwitch() costs your turn (contract change)
- [ ] Wire voting into game loop
- [ ] Mode switch tracking in metrics
- [ ] Run Tournaments C & D on Anvil
- [ ] Attend office hours if relevant
- [ ] **Stream V**: Streamlit dashboard v1 — reads JSON logs, displays Gini curves + wealth distributions

### Milestone: Voting works, C & D data shows mode switch dynamics, dashboard visualizes results

---

## Day 6 — Mar 18: Phase 3 — Signaling + Full Suite + Dashboard Polish

- [ ] signalIntent() on Agent interface (off-chain)
- [ ] Per-strategy honesty behavior
- [ ] Promise-keeping metric
- [ ] Run all 6 tournaments on Anvil (600 games)
- [ ] Cross-tournament analysis
- [ ] **Stream V**: Streamlit dashboard v2 — twin-pair comparisons, property heatmaps, treasury flow, single-game replay

### Milestone: 600 games, all metrics, preliminary findings, full analytical dashboard

---

## Day 7 — Mar 19: On-Chain Finals + Partner Integrations + Mainnet Hardening

- [ ] Tournaments A & B on Base Sepolia (10-20 games each)
- [ ] Self Protocol agent attestation (if viable)
- [ ] ENS agent naming
- [ ] Record all contract addresses + tx hashes
- [ ] Verify Pyth Entropy + joinGame() work on Sepolia (already in contract from Day 2)

### Milestone: On-chain proof of results, partner integrations live, mainnet-ready contract

---

## Day 8 — Mar 20: Results + Documentation + Visualization Polish

- [ ] analyze.ts: cross-tournament comparison, headline findings
- [ ] README.md: results, how to run, architecture
- [ ] docs/: updated architecture, game rules, results
- [ ] PROJECT_DIARY.md: all daily entries
- [ ] CONVERSATION_LOG.md: collaboration narrative
- [ ] (Stretch) Base Mainnet: open game for agents & humans
- [ ] (Stretch) Streamlit human-playable mode: board state display, click-to-act, tx submission
- [ ] (Stretch) Pixel art board replay from JSON logs (HTML5 canvas)

### Milestone: Submission-ready package with analytical dashboard

---

## Day 9 — Mar 21: Initial Deadline

- [ ] Final code review with Goldi
- [ ] All tests green
- [ ] Clean up repo
- [ ] Submit

---

## Day 10 — Mar 22: Final Deadline

- [ ] Address any feedback from initial submission
- [ ] Phase 4 (evolution) if time allows
- [ ] Final polish + resubmit

---

## Critical Path

```
Wallet + Faucet (Day 1)
    ↓
ABI Extraction (Day 2) ──→ TypeScript wiring (Day 2)
    ↓                              ↓
Contract tests (Day 2)      Game loop E2E + JSON logs (Day 2)
                                   ↓
                            Tournament runner (Day 3)
                                   ↓
                            Sepolia deploy + CDP SQL (Day 4)
                                   ↓                ↓
                            Phase 2: voting    Streamlit v1 (Day 5)
                                   ↓                ↓
                            Phase 3: signaling Streamlit v2 (Day 6)
                                   ↓
                            On-chain finals + joinGame() (Day 7)
                                   ↓
                            Results + docs + viz polish (Day 8)
                                   ↓
                            Submit (Day 9)
```

**The project is submittable after Day 4** (Phase 1 complete with on-chain data + CDP verification). Everything after is upside.

**Stream V (visualization) is independently parallelizable after Day 3** — it only needs JSON log files from completed tournament runs.

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

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Sepolia faucet limits | Blocks Day 4 | Start dripping Day 1, Anvil for bulk |
| Game loops forever | Blocks Day 2 | MAX_ROUNDS cap, test win conditions Day 1 |
| Gas exceeds budget | Blocks on-chain runs | 10-20 on-chain, rest on Anvil |
| Strategy design takes too long | Blocks Day 3 | Start with 3 existing + 2 simple variants |
| Commit-reveal too complex | Blocks Day 5 | Skip — simple voting suffices |
| Phase 4 not reached | Weakens submission | Phases 1-3 already answer track question |
| _nextTurn() round bug | Corrupts game data | Test + fix Day 1 |

---

## What "Done" Looks Like (Submission Checklist)

- [ ] Smart contract deployed + verified on Base Sepolia
- [ ] 200+ games run (Anvil), 20+ games on-chain (Sepolia)
- [ ] 5 agent strategies, 5 twin pairs, 2 parallel boards
- [ ] Measurable thesis: Gini divergence between rule sets
- [ ] Metrics: Gini, Herfindahl, treasury flow, twin divergence, (+ voting/signaling if Phase 2-3)
- [ ] Structured JSON game logs for all tournament runs
- [ ] CDP SQL API verification of on-chain events vs local logs
- [ ] Streamlit dashboard with analytical visualizations (Gini curves, twin-pair comparisons)
- [ ] Results documented with clear findings
- [ ] Complete conversation log showing human-agent collaboration
- [ ] Project diary with daily entries
- [ ] All code open-source on GitHub
- [ ] On-chain artifacts: ERC-8004 identity, deployed contracts, game tx hashes
- [ ] (Stretch) Partner integrations: Self Protocol, ENS
- [ ] (Stretch) Base Mainnet open game with joinGame() for external players
- [ ] (Stretch) Streamlit human-playable mode
- [ ] (Stretch) Pixel art board replay
