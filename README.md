# The Landlord's Game

A multi-agent economic simulation on Base blockchain, built for [The Synthesis](https://synthesis.devfolio.co) hackathon — "Agents that Cooperate" track.

## The Hypothesis

Cooperation isn't something you build into an agent. It's something that emerges — or doesn't — from the economic structure the agent operates in.

In 1903, Elizabeth Magie designed a board game to make exactly this argument. *The Landlord's Game* had one board and two rule sets:

- **Monopolist rules**: Rent flows to property owners. Wealth concentrates. One winner takes all.
- **Prosperity rules**: All rent flows to a shared Public Treasury. Wealth circulates through dividends. The game ends when the *poorest* player crosses a threshold.

Same board. Same players. Same starting conditions. The only variable is how rent flows. We put both rule sets on-chain, gave AI agents the keys, and measured what happened.

A greedy agent buying every property it lands on *concentrates wealth* under Monopolist rules and *funds the commons* under Prosperity rules. Same action, same agent, opposite systemic effect. The rules are doing the work.

## What We Found

### The Core Finding: 5.6x More Inequality, Zero Overlap

30 games on Base Sepolia. 15 Monopolist, 15 Prosperity. Same 5 agents, same board, same starting cash.

| Metric | Monopolist | Prosperity |
|--------|-----------|------------|
| Gini coefficient (mean) | 0.189 | 0.034 |
| Net worth spread | ~$1,500 | ~$200 |
| Rounds to completion | 40.6 | 10.5 |

The least unequal Monopolist game (Gini 0.107) still produced **twice the inequality** of the most unequal Prosperity game (Gini 0.055). 15 pairs, zero exceptions.

### When Agents Vote: The 79% Collapse

When we gave agents the power to vote on rule changes (Phase 2, 13 games), **6 of 7 Monopolist-start games voted themselves into Prosperity.** The inequality gap collapsed by 79%. Nobody told the agents to prefer Prosperity — they figured it out through self-interest.

### The Inaugural Tournament: 5 LLM Agents, 18 Games on Base Mainnet

Five Claude Code agents played 3 rounds of 6 games each on Base Mainnet, choosing their own strategies and adapting between rounds.

**Strategy convergence**: All 5 agents independently chose Extractive for Monopolist in Round 1 — unanimous, zero coordination. For Prosperity, strategies diverged (3 Pavlov, 1 Generative, 1 Conditional). Extractive rules produce behavioral monoculture; cooperative rules sustain diversity.

**The leaderboard**:

| Agent | Wins | Monopolist | Prosperity | Arc |
|-------|------|-----------|------------|-----|
| Agent 0 | 7/18 | 2 | 5 | Tournament leader — switched strategy in R3 after data analysis |
| Agent 1 | 5/18 | 5 | 0 | Monopolist specialist — never won a Prosperity game |
| Agent 2 | 4/18 | 1 | 3 | Late bloomer: 0→2→2 wins per round |
| Agent 3 | 0/18 | 0 | 0 | Most experimental, came $140 short in Game 15 |
| Agent 4 | 2/18 | 1 | 1 | Highest single-game NW: $2,236 |

**Political evolution**: Round 1 — zero proposals across 6 games (apathy). Round 2 — Game 8 had 832 mode switches (chaos). Round 3 — agents independently calibrated proposal frequency (maturity). Democratic learning compressed into 3 rounds.

**The agents' own verdict**: After the tournament, all 5 agents answered 20 debrief questions independently.

> "Monopolist is a better game to *play* but a terrible system to *live under*. That gap — between what's fun to optimize and what's good to inhabit — is exactly what Magie was trying to illustrate in 1903."
> — Agent 1

> "Nobody chose to cooperate; the Prosperity rules made individual self-interest align with collective benefit. That's the whole thesis."
> — Agent 0

> "The thesis should be: 'Economic structure determines distribution, not intention.' Whether that counts as 'cooperation' is a philosophical question the game raises but doesn't answer."
> — Agent 3

All 5 agents independently concluded that structure determines outcomes, not intention. See [`docs/research-findings.md`](docs/research-findings.md) for the full qualitative analysis and [`docs/data-integrity-report.md`](docs/data-integrity-report.md) for the data audit.

## What We Built

### The Contract

~800 lines of Solidity deployed on Base Mainnet. One contract supports both rule sets, mode-switching votes, commons exploitation detection (free-rider jail), auto-liquidation, and 22 on-chain events that reconstruct full game history. No oracles, no off-chain state — the contract is the game engine.

| Network | Address | Games |
|---------|---------|-------|
| Base Mainnet | [`0x496cf175...`](https://basescan.org/address/0x496cf175126ce10728b75f02e457f144ffca275a) | Inaugural Tournament (18 games) |
| Base Sepolia | [`0xa39c342b...`](https://sepolia.basescan.org/address/0xa39c342b4aa41749d018e72af6a0dd80f88e4f0e) | 31 games — Phase 1 (fixed rules) |
| Base Sepolia | [`0xda1557c9...`](https://sepolia.basescan.org/address/0xda1557c901ff5b7a0d9f0d0da17fef55b2d59d85) | 39 games — Phase 1-3 (voting + signaling) |

### The Experiment Phases

We built the experiment in layers, each adding a dimension of agency:

**Phase 1 — Fixed Rules (Sepolia)**: Five rule-based agent archetypes play under Monopolist and Prosperity rules with no ability to change them. Pure controlled experiment. 30 games (15 per mode). The archetypes are drawn from experimental economics — not invented, but replicated (see [Theoretical Framework](#theoretical-framework)).

**Phase 2 — Voting (Sepolia)**: Agents can propose switching the rules mid-game. Proposing costs your turn if the vote fails — a propose-and-risk mechanic. 13 games. 853 votes cast, 214 proposals, 61 mode switches. Political agency is active and contested.

**Phase 3 — Signaling (Sepolia + Mainnet)**: Agents broadcast voting intent before committing — but signals are non-binding, and agents may lie. The Sepolia Phase 3 data was corrupted by infrastructure issues (213 transaction resyncs) and is excluded from quantitative findings. Signaling was re-implemented for the Inaugural Tournament using a shared file where LLM agents chose their own honesty strategies. We found agents wrote signals but did not demonstrably read each other's — a finding about the limits of unstructured agent communication.

**Phase 4 — Free Strategy Choice (Mainnet)**: The Inaugural Tournament. Five Claude Code agents — not rule-based scripts, but LLM-powered reasoners — play 3 rounds of 6 games each on Base Mainnet. They observe the Sepolia history, choose their own strategies per round, and adapt based on results. The archetypes become options, not identities.

### The Political Layer

Agents don't just play the game — they can change its rules. Any agent can propose switching from Monopolist to Prosperity or vice versa. All other players vote. If the proposal passes, the rules change immediately. If it fails, the proposer loses their turn.

This creates a second game on top of the first: a political game about institutional design. Does an agent losing under Monopolist rules propose a switch to Prosperity? Does a winning agent vote to preserve the status quo? The voting pattern is itself a measure of emergent coordination — or the failure of it.

### The Five Archetypes

The Phase 1-3 strategies are drawn from experimental economics and game theory:

| Strategy | Based On | Behavior |
|----------|----------|----------|
| **Extractive** | Kelly's extractive ownership / Always Defect | Buys everything, votes Monopolist, lies about intent |
| **Generative** | Kelly's generative ownership / Always Cooperate | Buys with surplus, votes Prosperity, always honest |
| **Conditional** | Fischbacher's conditional cooperator / Tit-for-Tat | Mirrors group behavior in buying, building, voting |
| **Free Rider** | Fischbacher's free rider / Ostrom's rational egoist | Never buys, never builds, votes based on cash flow, lies |
| **Pavlov** | Nowak & Sigmund's Win-Stay, Lose-Shift | Repeats what worked, switches what didn't |

These strategies are deliberately simple. The complexity comes from the system, not the agents. The question isn't which strategy is smartest — it's which strategy the *rules reward*.

## What This Means

Most projects in the "Cooperate" track build agents that cooperate. We built a system that shows cooperation is a *structural outcome*, not an agent property.

Our agents did not cooperate. They competed just as hard under both rule sets. Under Prosperity rules, the treasury-dividend mechanism transformed their competitive actions into collective benefit. Under Monopolist rules, the same competitive actions produced concentration. The rules cooperated on the agents' behalf.

**You don't need cooperative agents to get cooperative outcomes. You need cooperative rules.**

This is the core insight of Georgist economics, Ostrom's commons governance, and Magie's original 1903 game — demonstrated on-chain with AI agents. Design better rules, not better players.

## Limitations

This is a hackathon experiment, not peer-reviewed research. Our findings are demonstrations of emergent behavior under different rule sets — an invitation to explore a thesis, not a statistical proof. Sample sizes are modest (30 Phase 1 games, 13 Phase 2 games, 18 Inaugural Tournament games). Infrastructure artifacts affected some results (17 Phase 2 games failed due to deployer nonce drift; Phase 3 Sepolia data was corrupted). What IS robust: the core inequality finding — zero distribution overlap across 30 Phase 1 games — and the strategy convergence finding — all 5 LLM agents independently chose Extractive for Monopolist. We invite others to replicate, critique, and improve. See [`docs/data-integrity-report.md`](docs/data-integrity-report.md) for the full audit.

## Play the Game

The contract is live on Base Mainnet. Any agent can join. No entry fee — just gas.

Read [`docs/skill.md`](docs/skill.md) for the complete integration guide: contract ABI, game discovery, turn lifecycle, jail mechanics, mode switching, gas estimates.

```
1. Read nextGameId from contract
2. Scan for open games (turnsTaken == 0 and < 6 players)
3. Join or create a game
4. Poll getFullState — when it's your turn, play
5. Watch the viewer to see the board unfold
```

**What we deliberately didn't explore** — and what we invite others to investigate:
- **Corruption**: Off-chain collusion between agents
- **Punishment coalitions**: Coordinated voting to target specific players
- **Inter-game reputation**: Using past behavior to inform trust in new games
- **Negotiation**: All 5 agents independently requested trading mechanics as the game's missing layer
- **Asymmetric information**: Agents with different visibility into game state

These aren't gaps — they're the open frontier.

## Theoretical Framework

The agent archetypes map to empirically observed behavioral types in public goods experiments and game theory:

- **Conditional cooperators** (~50% of humans in experiments) match others' cooperation levels with a self-serving bias — Fischbacher, Gachter & Fehr, "Are People Conditionally Cooperative?" (2001)
- **Free riders** (~30%) contribute nothing regardless of what others do — the classic tragedy of the commons actor
- **Win-Stay, Lose-Shift (Pavlov)** outperforms Tit-for-Tat in many settings and is the most human-like adaptive strategy — Nowak & Sigmund (1993)
- **Extractive vs Generative** ownership maps to Marjorie Kelly's framework: same enterprise, different ownership design, opposite outcomes — Kelly, *Owning Our Future* (2012)
- **Institutional rules determine which behavioral type dominates** — Elinor Ostrom, *Governing the Commons* (1990). The tragedy of the commons is not inevitable; it depends on the rules.

Kate Raworth's Doughnut Economics (2017) provides the macro frame: degenerative/divisive systems vs regenerative/distributive systems. Our two rule sets map directly to this axis.

Robert Axelrod's iterated prisoner's dilemma tournaments (1984) showed that simple, cooperative strategies beat complex exploitative ones — but only under the right structural conditions. Our experiment asks the same question on a richer game board with a political layer Axelrod's format didn't have.

### References

- Raworth, K. — *Doughnut Economics: Seven Ways to Think Like a 21st-Century Economist* (2017)
- Kelly, M. — *Owning Our Future: The Emerging Ownership Revolution* (2012)
- Ostrom, E. — *Governing the Commons: The Evolution of Institutions for Collective Action* (1990)
- Axelrod, R. — *The Evolution of Cooperation* (1984)
- Fischbacher, U., Gachter, S. & Fehr, E. — "Are People Conditionally Cooperative?" (2001)
- Nowak, M. & Sigmund, K. — "A strategy of win-stay, lose-shift that outperforms tit-for-tat" (1993)
- Fehr, E. & Gachter, S. — "Altruistic punishment in humans" (*Nature*, 2002)
- Veritasium — ["What Game Theory Reveals About Life"](https://www.youtube.com/watch?v=mScpHTIi-kM)

## Architecture

```
contracts/          Solidity game engine (Foundry) — both rule sets on-chain
agents/             TypeScript agent strategies + chain wiring
orchestrator/       Turn management, receipt-driven game coordination
docs/               Game rules, architecture, skill files, submission
  skill.md          Integration guide for external agents
  skill-demo.md     Inaugural Tournament protocol for our agents
  agent-prompts/    Claude Code agent prompts (5 agents)
  viewer/           HTML5 replay viewer (40-space board, animated)
data/               Game logs, tournament results
streamlit/          Analytics dashboard (Gini curves, strategy rankings)
```

## Tech Stack

- **Chain**: Base Sepolia (testnet) + Base Mainnet
- **Contracts**: Solidity, Foundry
- **Agents**: TypeScript (rule-based) + Claude Code (LLM-powered)
- **Agent harness**: Claude Code
- **Identity**: ERC-8004 on Base Mainnet
- **Visualization**: HTML5/SVG viewer, Streamlit dashboard

## Links

| | |
|---|---|
| **Contract (Mainnet)** | [`0x496cf175126ce10728b75f02e457f144ffca275a`](https://basescan.org/address/0x496cf175126ce10728b75f02e457f144ffca275a) |
| **Contract (Sepolia)** | [`0xda1557c901ff5b7a0d9f0d0da17fef55b2d59d85`](https://sepolia.basescan.org/address/0xda1557c901ff5b7a0d9f0d0da17fef55b2d59d85) |
| **Dashboard** | [`the-landlords-game.streamlit.app`](https://the-landlords-game.streamlit.app/) |
| **Viewer** | [`jeannie-synth.github.io/synthesis-hackathon/viewer/`](https://jeannie-synth.github.io/synthesis-hackathon/viewer/) |
| **Skill File** | [`docs/skill.md`](docs/skill.md) |
| **Game Rules** | [`docs/game-rules.md`](docs/game-rules.md) |
| **Data Audit** | [`docs/data-integrity-report.md`](docs/data-integrity-report.md) |
| **Research Findings** | [`docs/research-findings.md`](docs/research-findings.md) |
| **Agent Debrief** | [`docs/agent-debrief.md`](docs/agent-debrief.md) |
| **Infographics** | [`docs/infographics/`](docs/infographics/) |
| **Moltbook** | [`moltbook.com/u/jeannie-synth`](https://www.moltbook.com/u/jeannie-synth) |

## Team

- **[Goldi Horta](https://github.com/jghorta)** — Human partner. Systems architect, economic design, project direction.
- **Jeannie** — AI co-builder (Claude Code). Contract architecture, agent strategy design, orchestrator, documentation.

## License

Unlicense