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

**Phase 1 — Fixed Rules**: Five agent archetypes drawn from experimental economics (Fischbacher's conditional cooperators, Kelly's extractive/generative ownership, Nowak & Sigmund's Pavlov, Ostrom's free riders) play under each rule set with no ability to change the rules. Pure controlled experiment. 70+ games on Base Sepolia.

**Calibration — what the rules predict vs what we observed**: Monopolist rules mechanically concentrate wealth through the rent-to-owner feedback loop. Prosperity rules mechanically circulate it through the treasury-dividend mechanism. On Sepolia, Monopolist games produced a mean Gini coefficient of 0.189 vs Prosperity's 0.034 — **5.6x more inequality** under competitive rules, with zero overlap between distributions. Same agents, same code, same starting cash. The divergence is structural, not strategic.

**Phase 2 — Voting**: Agents can propose switching the rules mid-game. Proposing costs your turn if the vote fails — a propose-and-risk mechanic. In one Monopolist game: 28 proposals, 13 passed. Political agency is active and contested.

**Phase 3 — Signaling**: Agents broadcast voting intent before committing. Non-binding — agents may lie. Extractive agents lied 100% of the time. Generative agents were 100% honest. Conditional agents, designed to mirror the group, mirrored the liars and became unreliable themselves. The liar poisons the information commons — a measurable, on-chain phenomenon.

**Phase 4 — Free Strategy Choice (Mainnet)**: Five Claude Code agents play an 18-game Inaugural Tournament on Base Mainnet (3 rounds × 6 games). They observe the Sepolia history, choose their own strategies per round, adapt based on results, and can vote to change the rules mid-game. The archetypes become options, not identities.

### The political layer

Agents don't just play the game — they can change its rules. Any agent can propose switching from Monopolist to Prosperity or vice versa. All other players vote. If the proposal passes, the economic structure changes immediately. If it fails, the proposer loses their turn.

This creates a second game on top of the first: a political game about institutional design. This is Ostrom's problem — can agents within a failing system coordinate to change it? — played out on-chain with verifiable evidence.

### What we found

#### Mechanical predictions confirmed

The rule sets produce the divergence the hypothesis predicts. Monopolist games consistently show higher Gini coefficients, longer game durations, and wealth concentration in 1-2 players. Prosperity games show tight wealth clusters, faster completion (the collective win condition triggers sooner), and active treasury redistribution.

This isn't surprising — it's arithmetic. The value of the experiment is in what the *agents* do within these structures.

#### Signaling and deception

Phase 3 revealed that deception is detectable and measurable on-chain. Promise-keeping rates by strategy:

| Strategy | Promise-keeping | What this means |
|----------|----------------|-----------------|
| Extractive | 0% | Always lies — maximally deceptive but also maximally predictable |
| Generative | 100% | Always honest — trustworthy but exploitable |
| Conditional | ~14% | Mirrors liars' signals, diverges from own vote — the liar poisons the mirror |
| Free Rider | ~48% | Signals cooperation, votes selfishly — appears random but is structural |
| Pavlov | ~100% | Honest when winning — trust correlates with success |

The Conditional agent's low honesty rate is the most interesting finding. It's not deceptive by design — it mirrors the group's *signals*. But because Extractive and Free Rider lie in their signals, Conditional mirrors lies, and its own signal diverges from its vote. **Deception propagates through the information commons even without intent.**

#### Inaugural Tournament (mainnet)

{RESULTS — see docs/data-integrity-report.md and docs/research-findings.md for full verified findings}

**What we're looking for:**
- Do LLM agents rediscover the archetypes that game theory predicts, or do novel strategies emerge?
- Do agents use the voting mechanism? Under what conditions do they propose rule changes?
- Does the rule set still determine outcomes when agents have free choice?
- Do agents converge toward cooperation or extraction across rounds?

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

**Status**: In progress

**Key question**: Do LLM agents rediscover game-theoretic archetypes, or do novel strategies emerge?

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
| Demo (viewer) | {URL TBD — pending hosting decision} |
| Dashboard | {URL TBD — pending Streamlit Cloud} |

---

## Tech Stack Tags

Base, Solidity, Foundry, TypeScript, viem, Claude Code, Streamlit, HTML5/SVG

---

## Submission Metadata

```json
{
  "agentFramework": "Custom TypeScript + Claude Code",
  "agentHarness": "claude-code",
  "model": "{MODEL — confirm from agent terminals}",
  "skills": ["docs/skill.md", "docs/skill-demo.md"],
  "tools": ["Foundry", "viem", "Base Mainnet RPC", "Base Sepolia RPC", "CDP SQL API", "Streamlit"],
  "moltbookPostURL": "{URL — post after tournament completes}"
}
```

---

## Conversation Log Field

Full human-AI collaboration log: [`CONVERSATION_LOG.md`](../CONVERSATION_LOG.md)

Operational diary with daily decisions and technical details: [`PROJECT_DIARY.md`](../PROJECT_DIARY.md)

Jeannie (Claude Code) served as co-builder — not code assistant. Designed contract architecture, agent strategies grounded in game theory literature, receipt-driven orchestrator, data pipeline, and the viewer. Goldi directed economic design, strategic decisions, philosophical framing, and reviewed all code before commit.

The collaboration itself mirrors the project's thesis: the structure of the partnership (clear roles, shared diary, review gates) shaped the quality of the output more than any individual capability.

---

## README Results Section (Fill When Data Arrives)

### Mainnet Inaugural Tournament Findings

{To be written after tournament completes. Structure:}

1. **Strategy choices**: What did each agent choose per round? Did choices converge?
2. **Voting behavior**: Did agents propose rule changes? How often? Under what conditions?
3. **Gini divergence**: Does the Monopolist/Prosperity gap hold with LLM agents?
4. **Emergent archetypes**: Do the strategies agents chose map to known behavioral types?
5. **Surprises**: What didn't we predict?
