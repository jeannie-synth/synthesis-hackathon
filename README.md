# The Landlord's Game

A multi-agent economic simulation on Base blockchain, built for [The Synthesis](https://synthesis.devfolio.co) hackathon — "Agents that Cooperate" track.

## The Hypothesis

Cooperation isn't something you build into an agent. It's something that emerges — or doesn't — from the economic structure the agent operates in.

In 1903, Elizabeth Magie designed a board game to make exactly this argument. *The Landlord's Game* had one board and two rule sets:

- **Monopolist rules**: Rent flows to property owners. Wealth concentrates. One winner takes all.
- **Prosperity rules**: Rent flows to a shared Public Treasury. Wealth circulates through dividends. The game ends when the *poorest* player crosses a threshold.

Same board. Same players. Same starting conditions. The only variable is how rent flows. We put both rule sets on-chain, gave AI agents the keys, and measured what happened.

A greedy agent buying every property it lands on *concentrates wealth* under Monopolist rules and *funds the commons* under Prosperity rules. Same action, same agent, opposite systemic effect. The rules are doing the work.

## What We Built

### The Contract

~800 lines of Solidity deployed on Base Mainnet. One contract supports both rule sets, mode-switching votes, commons exploitation detection (free-rider jail), auto-liquidation, and 22 on-chain events that reconstruct full game history. No oracles, no off-chain state — the contract is the game engine.

| Network | Address | Games |
|---------|---------|-------|
| Base Mainnet | [`0x496cf175...`](https://basescan.org/address/0x496cf175126ce10728b75f02e457f144ffca275a) | Inaugural Tournament (18 games) |
| Base Sepolia | [`0xa39c342b...`](https://sepolia.basescan.org/address/0xa39c342b4aa41749d018e72af6a0dd80f88e4f0e) | 31 games — Phase 1 (fixed rules) |
| Base Sepolia | [`0xda1557c9...`](https://sepolia.basescan.org/address/0xda1557c901ff5b7a0d9f0d0da17fef55b2d59d85) | 39 games — Phase 1-3 (voting + signaling) |

### The Phases

We built the experiment in layers, each adding a dimension of agency:

**Phase 1 — Fixed Rules (Sepolia)**: Five rule-based agent archetypes play under Monopolist and Prosperity rules with no ability to change them. Pure controlled experiment. The archetypes are drawn from experimental economics — not invented, but replicated (see [Theoretical Framework](#theoretical-framework)). This establishes the baseline: do the rules mechanically produce the divergence the hypothesis predicts?

**Phase 2 — Voting (Sepolia)**: Agents can propose switching the rules mid-game. But proposing costs your turn if the vote fails — a propose-and-risk mechanic that makes political action a genuine strategic decision. Do agents exercise this power? Do they coordinate? 28 proposals in a single Monopolist game, 13 passed. Political agency is active.

**Phase 3 — Signaling (Sepolia)**: Before votes, agents broadcast their intent. But signals are non-binding — agents may lie. Extractive agents lied 100% of the time. Generative agents were 100% honest. Conditional agents, designed to mirror the group, mirrored the liars and became unreliable themselves. The liar poisons the information commons — a measurable, on-chain phenomenon.

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

## The Research Question

The Inaugural Tournament on mainnet asks: what happens when agents aren't locked into archetypes?

Five Claude Code agents observe 70+ Sepolia games, reason about what worked under each rule set, and choose their own strategies — one for Monopolist games, one for Prosperity. They can also propose and vote on rule changes mid-game. After each round, they review results and may switch strategies.

**What we're looking for:**
- Do LLM agents rediscover the archetypes that game theory predicts? Or do novel strategies emerge?
- Do agents vote to change the rules? Under what conditions?
- Does the rule set still determine outcomes when agents have free choice, or does agent sophistication override structure?
- Do agents converge toward cooperation or extraction across rounds?

**What we deliberately didn't explore** — and what we invite others to investigate:
- **Corruption**: Off-chain collusion between agents (our agents can't coordinate outside the contract)
- **Punishment coalitions**: Agents targeting specific players through coordinated voting
- **Inter-game reputation**: Using past game behavior to inform trust decisions in new games
- **Deception beyond signaling**: Strategic misrepresentation of strategy identity
- **Asymmetric information**: Agents with different visibility into game state

These aren't gaps — they're the open frontier.

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

## Results

*Inaugural Tournament complete on Base Mainnet. See `docs/data-integrity-report.md` and `docs/research-findings.md` for verified findings.*

### Sepolia Baseline (Phase 1 — Rule-Based Agents)

| Metric | Monopolist | Prosperity |
|--------|-----------|------------|
| Gini (wealth inequality, mean) | 0.189 | 0.034 |
| Rounds to completion (mean) | 40.6 | 10.5 |
| Treasury flow | 0 | Active redistribution |

Monopolist produced **5.6x more inequality** than Prosperity, with zero overlap between distributions. Same agents, same code, same starting cash. The rules did the work.

### Mainnet Inaugural Tournament

| Metric | Value |
|--------|-------|
| Rounds | 3 |
| Games per round | 6 (3 Monopolist + 3 Prosperity) |
| Total games | 18 |
| Agents | 5 Claude Code agents with free strategy choice |
| Voting | Enabled — agents can propose rule changes |

{Findings will be added here}

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
data/               Game logs, tournament results (gitignored)
streamlit/          Analytics dashboard (Gini curves, strategy rankings)
```

## Tech Stack

- **Chain**: Base Sepolia (testnet) + Base Mainnet
- **Contracts**: Solidity, Foundry
- **Agents**: TypeScript (rule-based) + Claude Code (LLM-powered)
- **Agent harness**: Claude Code
- **Identity**: ERC-8004 on Base Mainnet
- **Visualization**: HTML5/SVG viewer, Streamlit dashboard

## Team

- **[Goldi Horta](https://github.com/jghorta)** — Human partner. Systems architect, economic design, project direction.
- **Jeannie** — AI co-builder (Claude Code). Contract architecture, agent strategy design, orchestrator, documentation.

## License

Unlicense
