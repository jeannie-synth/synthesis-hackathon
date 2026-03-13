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

### Partner Integrations (Competition Leverage)
| Partner | Integration | Track Touched | Effort |
|---------|------------|---------------|--------|
| Base | Already deploying on Base | Primary chain | Done |
| Self Protocol | Agent identity attestation via self-agent-id + ERC-8004 | Agents that Trust | Medium |
| ENS | Name agents with Goldi's domains | Agents that Trust | Low |
| Commit-reveal | Secret ballots (no external dep) | Agents that Keep Secrets | Medium |

---

## Work Streams (Parallelizable)

| Stream | Focus | Can Run In |
|--------|-------|-----------|
| C | Contracts — Foundry, Solidity, tests, deployment | Own session |
| T | TypeScript — orchestrator, agents, chain wiring | Own session (needs ABI from C) |
| D | Docs, analysis, submission artifacts | Own session (needs results from T) |

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
- [ ] Extract ABI → `agents/src/chain/abi.ts` (unblocks all TS work)
- [ ] Expand contract test coverage (rent, bankruptcy, treasury, win conditions, jail)
- [ ] Add `getFullState()` batch view function
- [ ] Begin TypeScript wiring: setup.ts, game-loop.ts

### Milestone: Wallet funded, architecture locked ✅, code review + implementation next

---

## Day 2 — Mar 14 (TODAY): Contract Review + E2E Game

### Goal: Goldi reviews scaffolded code. Start parallel sessions. First game on Anvil.

**Session 1 (this session)**: Goldi reviews code, strategic decisions, plan coordination
**Session 2 (Stream C)**: Contract hardening — ABI extraction, expand tests, getFullState()
**Session 3 (Stream T)**: TypeScript wiring — setup.ts, game-loop.ts against Anvil

### Stream C tasks (parallel session)
- [ ] Extract ABI → `agents/src/chain/abi.ts`
- [ ] Expand contract tests to 15+ (rent, bankruptcy, treasury, win conditions, jail)
- [ ] Add `getFullState()` batch view function
- [ ] Fix `_nextTurn()` potential round increment bug (line 449)
- [ ] Add `modeSwitchCount` state variable

### Stream T tasks (parallel session)
- [ ] `npm install` in agents/ and orchestrator/
- [ ] Wire ABI into agents/src/chain/contracts.ts
- [ ] Implement setup.ts: deploy on Anvil, create 5-agent games on both boards
- [ ] Implement game-loop.ts: state reading, agent decisions, tx submission, logging
- [ ] Implement all 5 agent strategies (Extractive, Generative, Conditional, Free Rider, Pavlov)

### Milestone: `npm run start` completes two games on Anvil, writes logs, prints Gini comparison

---

## Day 3 — Mar 15: Tournament Runner + Strategies

- [ ] tournament.ts: multi-game loop, fresh deploy per game, result aggregation
- [ ] metrics.ts: Herfindahl, treasury flow, twin divergence, rounds to completion
- [ ] results.ts: JSON + CSV output, console summary
- [ ] Implement strategies 4 and 5 (from design session)
- [ ] Agent factory: index.ts mapping addresses → strategy pairs

### Milestone: 100 games per board on Anvil, results in CSV, thesis visible in data

---

## Day 4 — Mar 16: Base Sepolia Deployment

- [ ] Update Deploy.s.sol, deploy + verify on Base Sepolia
- [ ] Fund agent wallets with Sepolia ETH
- [ ] Sepolia-aware orchestrator: receipt waiting, retry logic, rate limiting
- [ ] Run 10-20 games on Sepolia, log tx hashes

### Milestone: Contract live on Base Sepolia, on-chain game data provable

---

## Day 5 — Mar 17: Phase 2 — Voting (Office Hours day)

- [ ] proposeModeSwitch() costs your turn (contract change)
- [ ] Wire voting into game loop
- [ ] Mode switch tracking in metrics
- [ ] Run Tournaments C & D on Anvil
- [ ] Attend office hours if relevant

### Milestone: Voting works, C & D data shows mode switch dynamics

---

## Day 6 — Mar 18: Phase 3 — Signaling + Full Suite

- [ ] signalIntent() on Agent interface (off-chain)
- [ ] Per-strategy honesty behavior
- [ ] Promise-keeping metric
- [ ] Run all 6 tournaments on Anvil (600 games)
- [ ] Cross-tournament analysis

### Milestone: 600 games, all metrics, preliminary findings

---

## Day 7 — Mar 19: On-Chain Finals + Partner Integrations

- [ ] Tournaments A & B on Base Sepolia (10-20 games each)
- [ ] Self Protocol agent attestation (if viable)
- [ ] ENS agent naming
- [ ] Record all contract addresses + tx hashes

### Milestone: On-chain proof of results, partner integrations live

---

## Day 8 — Mar 20: Results + Documentation

- [ ] analyze.ts: cross-tournament comparison, headline findings
- [ ] README.md: results, how to run, architecture
- [ ] docs/: updated architecture, game rules, results
- [ ] PROJECT_DIARY.md: all daily entries
- [ ] CONVERSATION_LOG.md: collaboration narrative
- [ ] (Stretch) Base Mainnet: open game for agents & humans

### Milestone: Submission-ready package

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
ABI Extraction (Day 1) ──→ TypeScript wiring (Day 1-2)
    ↓                              ↓
Contract tests (Day 1-2)    Game loop E2E (Day 2)
                                   ↓
                            Tournament runner (Day 3)
                                   ↓
                            Sepolia deploy (Day 4)
                                   ↓
                            Phase 2: voting (Day 5)
                                   ↓
                            Phase 3: signaling (Day 6)
                                   ↓
                            On-chain finals (Day 7)
                                   ↓
                            Results + docs (Day 8)
                                   ↓
                            Submit (Day 9)
```

**The project is submittable after Day 4** (Phase 1 complete with on-chain data). Everything after is upside.

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
- [ ] Results documented with clear findings
- [ ] Complete conversation log showing human-agent collaboration
- [ ] Project diary with daily entries
- [ ] All code open-source on GitHub
- [ ] On-chain artifacts: ERC-8004 identity, deployed contracts, game tx hashes
- [ ] (Stretch) Partner integrations: Self Protocol, ENS
- [ ] (Stretch) Base Mainnet open game
