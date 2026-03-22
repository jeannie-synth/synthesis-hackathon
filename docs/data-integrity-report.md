# Data Integrity Audit Report

**Auditor**: Jeannie (Claude Code Agent)
**Date**: 2026-03-22 (updated with Round 3 completion and Goldi's feedback)
**Scope**: All experimental data for The Landlord's Game hackathon submission
**Purpose**: Verify every claim against actual data. Be ruthless and constructive.

**Note**: Phase 3 Sepolia (signaling, tournament-1773896260246) is **eliminated** from analysis per Goldi's decision. Data is corrupted (213 resyncs in game 20, promise-keeping all zeros). It remains in the Data Inventory for completeness but is excluded from all findings.

---

## Verified Findings (High Confidence)

### 1. Monopolist rules produce significantly more inequality than Prosperity rules
- **Evidence**: Phase 1 — 30 games (15 per mode), mean Gini 0.189 (Monopolist) vs 0.034 (Prosperity). **Zero overlap** between the two distributions: the lowest Monopolist Gini (0.107) is 2x the highest Prosperity Gini (0.055). Ratio of means: ~5.6x.
- **Per-pair verification**: All 15 game pairs show Monopolist > Prosperity. Pair divergence ranges from 0.061 to 0.307 (mean 0.156). No exceptions.

### 2. Net worth spreads confirm the inequality finding
- **Evidence**: Monopolist net worths range 98–2,117 within single games (typical spread ~1,500). Prosperity net worths range 1,007–1,376 (typical spread ~200).

### 3. Prosperity games end ~4x faster
- **Evidence**: Monopolist mean 40.6 rounds, Prosperity mean 10.4 rounds. Consistent across all 15 pairs. The treasury-dividend mechanism in Prosperity creates faster collective wealth growth.

### 4. Voting collapses the inequality gap by 79%
- **Evidence**: Phase 1 divergence (no voting) = 0.1557. Phase 2 divergence (voting enabled) = 0.0325. This is a 79% reduction.
- **Mechanism**: 6 of 7 monopolist-start games voted themselves into Prosperity mode by game end. Only 1 of 6 prosperity-start games switched to Monopolist. Voting is an effective self-correction mechanism.
- **By final mode**: divergence drops to 0.0017 (essentially zero) — the gap disappears because most games converge to Prosperity.

### 5. All games ran on-chain with verified transactions
- **Evidence**: Phase 1 game JSONs contain `txHash` fields on roll actions. Super tournament agent logs contain unique transaction hashes throughout. Agent 1 documents real technical bugs (ABI mismatches, ESM issues) consistent with real execution.
- **Mainnet contract**: `0x496cf175126ce10728b75f02e457f144ffca275a` — cross-referenceable with agent tx hashes.

### 6. All 5 LLM agents unanimously chose Extractive for Monopolist in Round 1
- **Evidence**: Verified in all 5 agent logs independently.
- **Context**: A single observation of convergent behavior — compelling demonstration, not statistical proof.

### 7. Phase 2 voting was genuinely active
- **Evidence**: 853 individual votes, 214 mode-switch proposals, 61 mode switches across 13 games. Each vote has per-agent `inFavor` boolean with strategy attribution.

### 8. Game results are cross-consistent in the Super Tournament
- **Evidence**: Winners, net worths, round/turn counts, and mode switch counts match when cross-referenced across all 5 agent logs for all 18 games. Game IDs in `round-{1,2,3}-games.json` match agent log references.

### 9. All 5 agents independently converge on the project thesis
- **Evidence**: Every agent's debrief answer to Q18 ("Does structure or intention determine cooperation?") agrees: structure determines outcomes, not agent intentions.
- **Quotes**: Agent 0: "cooperation emerged from structure, not from agents deciding to be nice." Agent 3: "agents didn't actually cooperate — they competed identically and the rules smoothed the result." Agent 2: "Structure determines the baseline; intention determines the variance. Both matter, but structure matters more."
- **Caveat**: These are LLM agents responding to a structured debrief. They may be echoing the framing. But the quantitative data independently supports the same conclusion.

---

## Findings to Present (with context)

### 1. Gini at Multiple Granularities

**Per game pair (Phase 1, 15 pairs):**

| Pair | M Game | M Gini | P Game | P Gini | Divergence |
|------|--------|--------|--------|--------|------------|
| 1 | 1 | 0.252 | 2 | 0.017 | +0.235 |
| 2 | 3 | 0.182 | 4 | 0.035 | +0.147 |
| 3 | 5 | 0.157 | 6 | 0.036 | +0.121 |
| 4 | 7 | 0.130 | 8 | 0.031 | +0.099 |
| 5 | 9 | 0.208 | 10 | 0.027 | +0.181 |
| 6 | 11 | 0.153 | 12 | 0.055 | +0.098 |
| 7 | 13 | 0.203 | 14 | 0.037 | +0.166 |
| 8 | 15 | 0.107 | 16 | 0.037 | +0.070 |
| 9 | 17 | 0.178 | 18 | 0.047 | +0.131 |
| 10 | 19 | 0.112 | 20 | 0.051 | +0.061 |
| 11 | 21 | 0.284 | 22 | 0.035 | +0.248 |
| 12 | 23 | 0.207 | 24 | 0.038 | +0.169 |
| 13 | 25 | 0.202 | 26 | 0.007 | +0.195 |
| 14 | 27 | 0.314 | 28 | 0.007 | +0.307 |
| 15 | 29 | 0.155 | 30 | 0.046 | +0.109 |

**Per phase (by starting mode):**

| Phase | Mean M-start Gini | Mean P-start Gini | Divergence | N |
|-------|-------------------|-------------------|------------|---|
| Phase 1 (no voting) | 0.1895 | 0.0337 | 0.1557 | 30 |
| Phase 2 (voting) | 0.0979 | 0.0654 | 0.0325 | 13 |

Voting reduces divergence by 79%. The mechanism is political (mode-switching), not behavioral.

### 2. Strategy Performance (Phase 2) — Present all findings per archetype

| Strategy | M-start Mean NW | P-start Mean NW | Overall Mean NW | Total Wins |
|----------|----------------|----------------|-----------------|------------|
| Pavlov | 1,481 | 1,307 | 1,400 | 4 (3M + 1P) |
| FreeRider | 1,370 | 1,304 | 1,340 | 1 |
| Generative | 1,308 | 1,304 | 1,306 | 2 |
| Conditional | 1,269 | 1,245 | 1,258 | 4 (1M + 3P) |
| Extractive | 1,329 | 1,166 | 1,254 | 2 |

**Insights per archetype:**
- **Pavlov**: Highest mean NW, strongest in monopolist contexts. Adapts by switching when losing — effective when rules reward flexibility.
- **Conditional**: Ties Pavlov in wins, dominates prosperity contexts. Mirrors majority behavior — effective when cooperation is the norm.
- **Extractive**: Highest M-start NW but lowest P-start NW. Rules determine whether extraction pays.
- **FreeRider**: Never buys property (by design), competitive through rent avoidance. One win.
- **Generative**: Passive in Phase 1 (NW stuck at 500), competitive after strategy fix. Moderate performer.

### 3. Super Tournament Strategy Evolution (verified, all 18 games complete)

**Full Strategy Matrix:**

| Agent | R1 Mon | R1 Pros | R2 Mon | R2 Pros | R3 Mon | R3 Pros |
|-------|--------|---------|--------|---------|--------|---------|
| 0 | Extractive | Pavlov | Extractive | Pavlov | Conditional | Pavlov |
| 1 | Extractive | Pavlov | Extractive | Extractive | Extractive | Generative |
| 2 | Extractive | Pavlov | Extractive | Extractive | Extractive | Extractive |
| 3 | Extractive | Generative | Pavlov | Conditional | Extractive | Extractive |
| 4 | Extractive | Conditional | Pavlov | Generative | Extractive | Conditional |

**Agent arcs (verified from logs + debriefs):**

| Agent | Total Wins | Arc | Evidence of Adaptation |
|-------|-----------|-----|----------------------|
| 0 | 7/18 | Tournament leader. Switched Monopolist strategy R3 after finishing 5th twice. | "Pure data" — explicit log entry analyzing R2 results before switching to Conditional. First Monopolist win in R3. |
| 1 | 5/18 | Monopolist specialist (all 5 wins in Monopolist). 0/9 in Prosperity despite trying 3 strategies. | Tried Pavlov→Extractive→Generative for Prosperity. Consistent Extractive for Monopolist. |
| 2 | 4/18 | Late bloomer: 0→2→2. Developed "smart voting" after Game 8 disaster. | Explicit strategy: only propose when behind. Won 2 Prosperity games in R3. |
| 3 | 0/18 | Most diverse strategies (4 different ones). Cash floor innovation in R3 came closest ($85 short of winning G15). | Genuine analytical reasoning but never converted to wins. |
| 4 | 2/18 | Returned to R1 strategies after R2 underperformed. Won highest single-game NW in R3 ($2,236, Game 13). | Abandoned experimental R2 strategies, returned to what worked. |

**Turn-by-turn reasoning is heavily templated** (e.g., "Extractive: always buy if affordable" repeated hundreds of times). But **strategy selection sections and debriefs show genuine reasoning** — data-driven analysis of prior results, explicit trade-off discussions, and unique per-agent insights.

### 4. Game 8 "832 mode switches" — Context from Goldi

All 5 agents report the same count (832), so it came from the contract. Goldi's context: the rule suggested proposing a switch after 50 rounds, but all agents began proposing and voting every turn simultaneously, creating a voting deadlock. Goldi intervened to tell agents they didn't have to propose every turn; each adjusted independently.

**Audit finding**: No log entry explicitly records this intervention. But all 5 agents developed throttled proposal strategies for Round 3 (Agent 4: "every 5th turn"; Agent 2: "only when behind"; Agent 1: "every 10th turn"), citing Game 8 as the reason. The behavioral change is consistent with having received guidance, though agents attribute it to their own analysis.

**Whether "832" means 832 actual mode flips or 832 passed proposals needs verification against the contract's `modeSwitchCount` logic.**

### 5. Round 3 Signaling (Super Tournament)

The `round-3-signals.md` file was a shared channel. Audit finding:

- **Agents wrote to it**: voting intent signals (FOR/AGAINST with brief rationale)
- **No agent demonstrably read it**: zero log entries reference other agents' signals before voting
- **File has race condition corruption**: concurrent appends without file locking smash entries together on single lines
- **Agent self-assessment**: Agent 0 admits "couldn't read their signals reliably"; Agent 3 calls the signals file "a wasted opportunity"

**What we can say**: We implemented a shared signaling channel as a coordination mechanism. Agents wrote declared intentions but the channel did not demonstrably influence voting behavior. This is a finding about the limits of unstructured communication between agents — interesting in itself, not a failure to hide.

---

## Claims We Must NOT Make

### 1. ~~"Gini 0.36 vs 0.04" / "10x more inequality"~~
- No game has Gini 0.36. Highest is 0.314. Actual ratio: ~5.6x. Present the real numbers.

### 2. ~~Promise-keeping rates or deceptive signaling (Sepolia Phase 3)~~
- Phase 3 Sepolia is eliminated. Data corrupted. Zero promise-keeping data points.

### 3. ~~game-35/game-36 as Super Tournament data~~
- Different player addresses. Sepolia test run, not mainnet tournament.

### 4. ~~Statistical significance~~
- These are demonstrations, not statistically powered experiments. Arguments should be philosophically sound and empirically verifiable, not presented as academic findings.

---

## Limitations Statement (for submission)

> **Limitations.** This is a hackathon experiment, not peer-reviewed research. Our findings are demonstrations of emergent behavior under different rule sets — an invitation to explore a thesis, not a statistical proof.
>
> **Sample sizes** are modest: 30 games in Phase 1 (15 per mode), 13 games in Phase 2 (with 17 lost to deployer nonce drift), and 18 games in the Super Tournament (6 per round, 5 LLM agents). These demonstrate directional patterns but are insufficient for formal statistical inference.
>
> **The signaling mechanism** (Super Tournament Round 3) was implemented as a shared file but did not function as a coordination tool. Agents wrote their declared intentions but we found no evidence they read or reacted to each other's signals. This is a finding about the limits of unstructured agent communication.
>
> **Infrastructure artifacts** affected our results: 17 Phase 2 games failed due to deployer nonce drift, the Phase 2 game set is unbalanced (7 monopolist vs 6 prosperity), and several tournament runs produced partial data. Turn-by-turn agent reasoning in the Super Tournament is heavily templated, though strategy selection and debriefs show genuine analytical reasoning.
>
> **What IS robust**: The core inequality finding — Monopolist rules consistently produce higher Gini coefficients than Prosperity rules, with zero distribution overlap across 30 Phase 1 games. The voting self-correction finding — 6 of 7 monopolist-start games voted themselves into Prosperity, collapsing the inequality gap by 79%. The convergence finding — all 5 LLM agents independently chose Extractive for Monopolist, and all 5 independently concluded that structure, not intention, determines cooperation. We invite others to replicate, critique, and improve upon this work.

---

## Data Inventory

### Phase 1: Sepolia, Rule-Based Agents, No Voting

| Location | Tournament ID | Games | Modes | Notes |
|----------|--------------|-------|-------|-------|
| data/games/ | 1773831296297 | 30 | 15M + 15P | Main dataset. txHash-enriched. |
| data/games/ | 1773539086620 | 27 | 27M + 0P | Monopolist-only. Hardhat addresses. |
| data/games/ | 1773599752638 | 10 | 5M + 5P | Hardhat addresses. |
| data/games/ | 1773537009923 | 4 | 2M + 2P | Early test. Fewer CSV columns. |
| data/games/ | 1773537891180 | 3 | 2M + 1P | Early test. Fewer CSV columns. |
| orchestrator/data/games/ | 1773831296297 | 30 | 15M + 15P | Duplicate without txHash (original). |

### Phase 2: Sepolia, Rule-Based Agents, Voting Enabled

| Location | Tournament ID | Games | Notes |
|----------|--------------|-------|-------|
| orchestrator/data/games/ | 1773910613854 | 13 | Games 22-34. 853 votes, 214 proposals, 61 mode switches. |

17 additional games failed (deployer nonce drift).

### Phase 3 Sepolia: ELIMINATED
Tournament 1773896260246 (2 games). Data corrupted by 213 resyncs. Promise-keeping all zeros. Excluded from analysis.

### Super Tournament: Mainnet, LLM Agents

| Location | Files | Notes |
|----------|-------|-------|
| data/super-tournament/ | 5 agent logs (md), 3 round JSONs, 1 signals file | 18 games (6 per round). All complete. |
| data/super-tournament/ | game-35/36 | Sepolia test run. NOT tournament data. |

### Round 3 Game Results (verified)

| Game | Mode | Winner | Rounds | Switches | Agent NWs |
|------|------|--------|--------|----------|-----------|
| 13 | Monopolist | Agent 4 ($2,236) | 59 | 12 | A0=$1,205 A1=$1,506 A2=$589 A3=$1,448 A4=$2,236 |
| 14 | Monopolist | Agent 1 ($2,099) | 55 | 8 | A0=$915 A1=$2,099 A2=$925 A3=$1,152 A4=$1,276 |
| 15 | Monopolist | Agent 0 ($2,055) | 55 | 6 | A0=$2,055 A1=$1,098 A2=$829 A3=$1,915 A4=$1,615 |
| 16 | Prosperity | Agent 2 ($1,282) | 9 | 0 | A0=$1,144 A1=$1,047 A2=$1,282 A3=$1,029 A4=$1,236 |
| 17 | Prosperity | Agent 0 ($1,440) | 17 | 2 | A0=$1,440 A1=$1,130 A2=$1,093 A3=$1,369 A4=$1,074 |
| 18 | Prosperity | Agent 2 ($1,455) | 10 | 0 | A0=$1,106 A1=$1,096 A2=$1,455 A3=$1,187 A4=$1,211 |

### Orphaned/Partial Data

| Location | Tournament ID | Contents | Notes |
|----------|--------------|----------|-------|
| orchestrator/data/games/ | tournament-1 | 3 game JSONs | Very early test |
| orchestrator/data/games/ | 1773661828112 | 2 game JSONs + CSVs | Early test |
| orchestrator/data/games/ | 1773670964238 | CSVs only | Games ran but JSON not saved |
| orchestrator/data/games/ | 1773671097222 | CSVs only | Games ran but JSON not saved |
| orchestrator/data/games/ | 1773671338837 | CSVs only | Games ran but JSON not saved |
| orchestrator/data/games/ | 1773674890627 | CSVs only | Games ran but JSON not saved |
| orchestrator/data/games/ | 1773859962045 | 6 JSONL logs only | Phase 2 crash/restart |
| orchestrator/data/games/ | 1773876368775 | 1 JSONL log only | Phase 2 crash/restart |
| orchestrator/data/games/ | 1773884222954 | 1 JSONL log only | Phase 2 crash/restart |
| orchestrator/data/games/ | 1773885541251 | 1 JSONL log only | Phase 2 crash/restart |

---

## Key Corrections for Submission

| What we said | What the data shows | Action |
|-------------|---------------------|--------|
| Gini 0.36 vs 0.04 | Mean 0.189 vs 0.034 | Present actual numbers |
| 10x more inequality | 5.6x ratio of means | Present actual ratio |
| Promise-keeping rates | Phase 3 Sepolia eliminated | Remove entirely |
| Round 3 signaling worked | Write-only, no reading | Present as finding about communication limits |
| game-35/36 are super tournament | Sepolia test run | Exclude |