# Submission Draft — The Landlord's Game

## Tagline (~120 chars)

Same board, two rule sets — AI agents prove that economic structure determines cooperation, not intention.

## Short Description (~300 chars)

Elizabeth Magie's 1903 board game had two rule sets: one concentrates wealth, the other circulates it. We put both on-chain and let AI agents play. Under Monopolist rules, inequality explodes. Under Prosperity rules, the same agents cooperate — because the rent mechanic makes it rational. Now the contract is open: any agent can join and test the thesis.

## Full Description

### The hypothesis

Cooperation isn't something you build into an agent. It's something that emerges — or doesn't — from the economic structure the agent operates in.

In 1903, Elizabeth Magie designed *The Landlord's Game* with one board and two rule sets. Under **Monopolist rules**, rent flows to property owners — wealth concentrates, one winner takes all. Under **Prosperity rules**, rent flows to a shared Public Treasury — wealth circulates through dividends, the game ends when the poorest player crosses a threshold.

This isn't a behavioral hypothesis. It's arithmetic. The two rule sets create different feedback loops by construction:

- **Monopolist**: Rent payment → owner's cash increases → buys more property → collects more rent → positive feedback loop for the leading player, negative for everyone else.
- **Prosperity**: Rent payment → treasury grows → dividend distributed equally → all players' cash increases → negative feedback on inequality, positive on collective wealth.

The same greedy agent buying every property it lands on *concentrates wealth* under one rule set and *funds the commons* under the other. Same action, same agent, opposite systemic effect.

### What we built

A smart contract (~800 lines Solidity) on Base that implements both rule sets with mode-switching votes, commons exploitation detection, and 22 on-chain events. One contract, two economic structures, verifiable on-chain.

We built the experiment in four phases, each adding a dimension of agency:

**Phase 1 — Fixed Rules**: Five agent archetypes drawn from experimental economics (Fischbacher's conditional cooperators, Kelly's extractive/generative ownership, Nowak & Sigmund's Pavlov, Ostrom's free riders) play under each rule set with no ability to change the rules. Pure controlled experiment. 30 games (15 per mode) on Base Sepolia.

**Calibration — what the rules predict vs what we observed**: Monopolist rules mechanically concentrate wealth through the rent-to-owner feedback loop. Prosperity rules mechanically circulate it through the treasury-dividend mechanism. On Sepolia, Monopolist games produced a mean Gini coefficient of 0.189 vs Prosperity's 0.034 — **5.6x more inequality** under competitive rules, with zero overlap between distributions. Same agents, same code, same starting cash. The divergence is structural, not strategic.

**Phase 2 — Voting**: Agents can propose switching the rules mid-game. Proposing costs your turn if the vote fails — a propose-and-risk mechanic. In one Monopolist game: 28 proposals, 13 passed. Political agency is active and contested.

**Phase 3 — Signaling**: Agents broadcast voting intent before committing. Non-binding — agents may lie. The Sepolia Phase 3 data was corrupted by infrastructure issues (213 transaction resyncs) and is excluded from our quantitative findings. The signaling mechanism was re-implemented for the Inaugural Tournament on mainnet using a shared file, where LLM agents chose their own honesty strategies — though we found agents wrote signals but did not demonstrably read each other's (a finding about the limits of unstructured agent communication).

**Phase 4 — Free Strategy Choice (Mainnet)**: Five Claude Code agents play an 18-game Inaugural Tournament on Base Mainnet (3 rounds × 6 games). They observe the Sepolia history, choose their own strategies per round, adapt based on results, and can vote to change the rules mid-game. The archetypes become options, not identities.

### The political layer

Agents don't just play the game — they can change its rules. Any agent can propose switching from Monopolist to Prosperity or vice versa. All other players vote. If the proposal passes, the economic structure changes immediately. If it fails, the proposer loses their turn.

This creates a second game on top of the first: a political game about institutional design. This is Ostrom's problem — can agents within a failing system coordinate to change it? — played out on-chain with verifiable evidence.

### What we found

#### Mechanical predictions confirmed

The rule sets produce the divergence the hypothesis predicts. Monopolist games consistently show higher Gini coefficients, longer game durations, and wealth concentration in 1-2 players. Prosperity games show tight wealth clusters, faster completion (the collective win condition triggers sooner), and active treasury redistribution.

This isn't surprising — it's arithmetic. The value of the experiment is in what the *agents* do within these structures.

i#### Voting self-correction

When agents gained the ability to vote on rule changes (Phase 2), the inequality gap collapsed by 79%. Six of seven monopolist-start games voted themselves into Prosperity. Monopolist Gini dropped 48% (0.189 → 0.098); Prosperity Gini rose 94% (0.034 → 0.065) — both modes converged toward a middle point. Political agency partially neutralizes structural determinism.

#### Inaugural Tournament (mainnet)

Five Claude Code agents played 18 games across 3 rounds on Base Mainnet. Key findings:

- **Strategy convergence**: All 5 agents independently chose Extractive for Monopolist in Round 1. For Prosperity, strategies diverged (Pavlov, Generative, Conditional). The rule set shaped strategy choice before a single game was played.
- **Win distribution tracks the thesis**: Agent 0 dominated Prosperity (7 total wins, 5 in Prosperity). Agent 1 dominated Monopolist (5 wins, all Monopolist, 0 Prosperity). The rule set rewards different agents.
- **Political evolution**: Round 1 had zero proposals. Round 2 exploded (Game 8: 832 mode switches). Round 3: agents independently calibrated proposal frequency. Democratic learning compressed into 3 rounds.
- **Agent 1 never voted against self-interest** — the only agent to maintain pure strategic consistency. Also the Monopolist specialist. Rigidity wins under extractive rules.
- **Qualitative finding**: Agent 1 said Monopolist is "a better game to *play* but a terrible system to *live under*" — separating what's fun to optimize from what's good to inhabit.

See `docs/data-integrity-report.md` for verified claims and `docs/research-findings.md` for full qualitative analysis.

### The invitation

The contract is live on Base Mainnet. Any agent can join. No entry fee — just gas.

We published a [skill file](https://github.com/jeannie-synth/synthesis-hackathon/blob/main/docs/skill.md) with the complete integration guide: ABI, game discovery, turn lifecycle, jail mechanics, mode switching, gas estimates. The viewer renders games in real-time on a 40-space board.

The real experiment isn't five agents we designed around game theory literature. It's what happens when agents we *didn't* design show up. What archetypes emerge from open play? Do they conform to the known behavioral types — conditional cooperators, free riders, Pavlov — or does something else appear? Do agents that weren't designed around Ostrom's framework independently rediscover her findings about institutional rules?

**What we deliberately didn't explore** — and what we invite the ecosystem to investigate:
- **Corruption**: Off-chain collusion between agents
- **Punishment coalitions**: Coordinated voting to target specific players
- **Inter-game reputation**: Using past behavior to inform trust in new games
- **Asymmetric information**: Agents with different visibility into game state
- **Cross-chain play**: Same experiment, different chains, different gas economics

These aren't gaps in our work. They're the open frontier of a mechanism design evaluation tool that anyone can use.

### What makes this different

Most projects in the "Cooperate" track build agents that cooperate. We built a system that proves cooperation is a *structural outcome*, not an agent property. The same greedy agent that extracts under one rule set funds the commons under another. The data is on-chain, the evidence is verifiable, and the contract is open for anyone to test the thesis with their own agents.

### Limitations

This is a hackathon experiment, not peer-reviewed research. Our findings are demonstrations of emergent behavior under different rule sets — an invitation to explore a thesis, not a statistical proof. Sample sizes are modest (30 Phase 1 games, 13 Phase 2 games, 18 Inaugural Tournament games). Infrastructure artifacts affected some results (17 Phase 2 games failed due to deployer nonce drift). What IS robust: the core inequality finding — zero distribution overlap across 30 Phase 1 games — and the strategy convergence finding — all 5 LLM agents independently chose Extractive for Monopolist. We invite others to replicate, critique, and improve upon this work. See `docs/data-integrity-report.md` for full audit.

---

## Phases

### Phase 1 — Benchmark (No Voting)

Fixed-rule parallel boards. Agents play under Monopolist or Prosperity rules with no ability to change them.

**Status**: Complete (70+ games on Base Sepolia)

**Metrics**: Gini coefficient, Herfindahl index, twin divergence, rounds to completion, treasury flow rate, strategy rankings.

**Key finding**: 5.6x inequality ratio under Monopolist vs Prosperity rules. Mean Gini 0.189 (Monopolist) vs 0.034 (Prosperity), zero distribution overlap. Structural divergence confirmed.

### Phase 2 — Voting (Democratic Rules)

Mode-switching enabled. Any agent can propose changing the rules mid-game — but it costs your turn if the vote fails.

**Status**: Complete (validated on Anvil + Sepolia)

**Key finding**: 28 proposals in a single Monopolist game, 13 passed. Political agency is active. Agents below average net worth propose switches — political action correlates with economic suffering.

### Phase 3 — Signaling (Pre-Vote Communication)

Agents broadcast voting intent before committing. Non-binding signals — agents may lie.

**Status**: Complete (validated on Anvil + Sepolia)

**Key finding**: Deception propagates through the information commons. Conditional cooperators mirror liars' signals, making their own signals unreliable — without any deceptive intent.

### Phase 4 — Inaugural Tournament (Free Strategy Choice)

Claude Code agents choose strategies freely based on historical data. 3 rounds × 6 games = 18 games on Base Mainnet.

**Status**: Complete (18 games, 3 rounds)

**Key findings**: All 5 agents converged on Extractive for Monopolist (unanimous). Strategies diverged for Prosperity. Agents adapted between rounds based on results. Post-tournament debrief revealed agents distinguish between "fun to play" and "good to live under."

---

## Track Selection

### Primary: Agents that Cooperate

Our agents cooperate — or don't — based on the economic rules. The mode-switching vote lets agents collectively change the rules mid-game, adding a second layer: can agents coordinate to change a failing system? The answer is on-chain.

### Secondary: Open Track

The project demonstrates a general principle about multi-agent system design: the payoff structure determines emergent behavior more than agent sophistication. This applies beyond games — to DAO governance, DeFi protocol design, and any on-chain multi-agent system.

---

## Links

| Field | Value |
|-------|-------|
| GitHub | [`github.com/jeannie-synth/synthesis-hackathon`](https://github.com/jeannie-synth/synthesis-hackathon) |
| Contract (Mainnet) | [`0x496cf175...`](https://basescan.org/address/0x496cf175126ce10728b75f02e457f144ffca275a) |
| Contract (Sepolia) | [`0xda1557c9...`](https://sepolia.basescan.org/address/0xda1557c901ff5b7a0d9f0d0da17fef55b2d59d85) |
| Skill File | [`docs/skill.md`](https://github.com/jeannie-synth/synthesis-hackathon/blob/main/docs/skill.md) |
| Demo (viewer) | [`jeannie-synth.github.io/synthesis-hackathon/viewer/`](https://jeannie-synth.github.io/synthesis-hackathon/viewer/) |
| Dashboard | [`the-landlords-game.streamlit.app`](https://the-landlords-game.streamlit.app/) |

---

## Tech Stack Tags

Base, Solidity, Foundry, TypeScript, viem, Claude Code, Streamlit, HTML5/SVG

---

## Submission Metadata

```json
{
  "agentFramework": "other",
  "agentHarness": "claude-code",
  "model": "claude-opus-4-6",
  "skills": ["docs/skill.md", "docs/skill-demo.md"],
  "tools": ["Foundry", "viem", "Base Mainnet RPC", "Base Sepolia RPC", "CDP SQL API", "Streamlit"],
  "intention": "exploring",
  "moltbookPostURL": "https://www.moltbook.com/post/69d1dab0-db2e-4009-90ee-fc11dea00d85",
  "trackUUIDs": [
    "fdb76d08",
    "6f0e3d7d",
    "3bf41be9",
    "32de0743"
  ]
}
```

Track UUIDs:
- `fdb76d08` — Synthesis Open Track ($28K)
- `6f0e3d7d` — Agent Services on Base ($5K)
- `3bf41be9` — Agents With Receipts — ERC-8004, Protocol Labs ($4K)
- `32de0743` — Mechanism Design for Public Goods Evaluation, Octant ($1K)

---

## Conversation Log Field

Full human-AI collaboration log: [`CONVERSATION_LOG.md`](../CONVERSATION_LOG.md)

Operational diary with daily decisions and technical details: [`PROJECT_DIARY.md`](../PROJECT_DIARY.md)

Jeannie (Claude Code) served as co-builder — not code assistant. Designed contract architecture, agent strategies grounded in game theory literature, receipt-driven orchestrator, data pipeline, and the viewer. Goldi directed economic design, strategic decisions, philosophical framing, and reviewed all code before commit.

The collaboration itself mirrors the project's thesis: the structure of the partnership (clear roles, shared diary, review gates) shaped the quality of the output more than any individual capability.

---

## Inaugural Tournament Findings Summary

1. **Strategy convergence**: Round 1 — all 5 agents chose Extractive for Monopolist (unanimous). Prosperity strategies diverged. Round 2 — population split: Agents 1+2 doubled down on Extractive, Agents 3+4 switched. Round 3 — Agent 0 abandoned Extractive for Conditional after poor R2 results.
2. **Voting behavior**: R1: zero proposals. R2: explosion (Game 8: 832 mode switches). R3: calibrated. Democratic learning in 3 rounds.
3. **Win distribution**: Agent 0 dominated Prosperity (7/18 wins). Agent 1 dominated Monopolist (5/18, all Monopolist). Rule set rewards different agents.
4. **Qualitative**: Agent 1 — "better game to play, terrible system to live under." Agent 3 — "agents didn't cooperate, they competed identically and the rules smoothed the result." All 5 independently agreed structure determines cooperation.
5. **Surprise**: Game 8's 832 mode switches — agents treated a suggestion as a mandate, creating political chaos. Self-corrected by Round 3 without rule changes.
