# The Landlord's Game

A multi-agent economic simulation on Base blockchain, built for [The Synthesis](https://synthesis.devfolio.co) hackathon — "Agents that Cooperate" track.

## Why

When AI agents cooperate, we tend to credit the agent — better models, smarter prompts, more sophisticated reasoning. But what if cooperation has less to do with the agent and more to do with the economic structure it operates in?

In 1903, Elizabeth Magie designed a board game to make exactly this argument. *The Landlord's Game* had one board and two rule sets. Under **Monopolist rules**, rent flows to property owners — wealth concentrates, players go bankrupt, one winner takes all. Under **Prosperity rules**, rent flows to a shared Public Treasury — wealth circulates, dividends redistribute, the game ends when the poorest player crosses a threshold.

Same board. Same players. Same initial conditions. Radically different outcomes — determined entirely by the rules.

The game that became Monopoly kept only the first rule set. We're bringing both back, with AI agents as players, and putting the rules on-chain where the evidence is immutable.

## What

Five AI agent archetypes — each as a twin pair — play two parallel games on the same 40-space board derived from Magie's original design:

- **Game A** starts under Monopolist rules
- **Game B** starts under Prosperity rules

Same agents, same strategies, same starting cash. The only variable is the economic structure. We measure:

- **Wealth distribution** over time (Gini coefficient)
- **Rounds to completion**
- **Public Treasury/Bank** accumulation and distribution
- **Mode-switching votes** — agents can propose and vote to change the rules mid-game

This is a benchmark: the same players in two different economic structures, before any additional incentives are introduced. The equilibrium points are different. The question is how, and by how much.

## The Thesis

**Economic relationships shape collaboration and competition. Structure determines whether agents cooperate or compete — not strategy, not intention, not intelligence** (although these may improve an agent's performance within a given structure).

A greedy agent buying every property it lands on *concentrates wealth* under Monopolist rules and *funds the commons* under Prosperity rules. The same action, the same agent, opposite systemic effects. The rules are doing the work.

When agents can vote to switch rules mid-game, a second layer emerges: do agents collectively change the structure when it's failing them? Do leading agents vote to lock in their advantage? The voting pattern is itself a measure of emergent coordination.

## Architecture

```
contracts/          Solidity game engine (Foundry) — both rule sets on-chain
agents/             TypeScript agent strategies
orchestrator/       Turn management, game coordination, structured logging
docs/               Game rules reference, architecture
```

### Agent Strategies

Five agent archetypes, grounded in experimental economics and game theory. Each plays on both boards as a twin pair — one twin under Monopolist rules, one under Prosperity rules. Odd number ensures mode-switching votes always resolve.

| Strategy | Based On | Buy | Build | Vote |
|----------|----------|-----|-------|------|
| **Extractive** | Kelly's extractive ownership / Always Defect | Always | Always | Monopolist |
| **Generative** | Kelly's generative ownership / Always Cooperate | With surplus | In Prosperity only | Prosperity |
| **Conditional** | Fischbacher's conditional cooperator / Tit-for-Tat | Matches group behavior | Matches group behavior | With majority |
| **Free Rider** | Fischbacher's free rider / Ostrom's rational egoist | Never | Never | Based on cash flow |
| **Pavlov** | Nowak & Sigmund's Win-Stay, Lose-Shift | Repeats what worked | Repeats what worked | Keep mode if winning |

Only Extractive and Generative have hardwired votes. The other three vote based on game dynamics — political outcomes are emergent, not predetermined.

The strategies are deliberately simple. The complexity comes from the system, not the agents. Five well-grounded archetypes in two different structures produce more insight than one sophisticated strategy in one.

## Theoretical Framework

The agent archetypes aren't arbitrary. They map to empirically observed behavioral types in public goods experiments and game theory:

- **Conditional cooperators** (~50% of humans in experiments) match others' cooperation levels with a self-serving bias — Fischbacher, Gachter & Fehr, "Are People Conditionally Cooperative?" (2001)
- **Free riders** (~30%) contribute nothing regardless of what others do — the classic tragedy of the commons actor
- **Win-Stay, Lose-Shift (Pavlov)** outperforms Tit-for-Tat in many settings and is the most human-like adaptive strategy — Nowak & Sigmund (1993)
- **Extractive vs Generative** ownership maps to Marjorie Kelly's framework: same enterprise, different ownership design, opposite outcomes — Kelly, "Owning Our Future" (2012)
- **Institutional rules determine which behavioral type dominates** — Elinor Ostrom, "Governing the Commons" (1990). The tragedy of the commons is not inevitable; it depends on the rules.

Kate Raworth's Doughnut Economics provides the macro frame: degenerative/divisive systems vs regenerative/distributive systems. Our two rule sets map directly to this axis.

Robert Axelrod's iterated prisoner's dilemma tournaments (1984) showed that simple, cooperative strategies (Tit-for-Tat) beat complex exploitative ones — but only under the right structural conditions. Our experiment asks the same question on a richer game board.

### References

- Raworth, K. — *Doughnut Economics: Seven Ways to Think Like a 21st-Century Economist* (2017)
- Kelly, M. — *Owning Our Future: The Emerging Ownership Revolution* (2012)
- Ostrom, E. — *Governing the Commons: The Evolution of Institutions for Collective Action* (1990)
- Axelrod, R. — *The Evolution of Cooperation* (1984)
- Fischbacher, U., Gachter, S. & Fehr, E. — "Are People Conditionally Cooperative?" (2001)
- Nowak, M. & Sigmund, K. — "A strategy of win-stay, lose-shift that outperforms tit-for-tat" (1993)
- Veritasium — ["What Game Theory Reveals About Life"](https://www.youtube.com/watch?v=mScpHTIi-kM) (Axelrod's tournament, explained)

## What It Proves

If the same agents produce different outcomes under different rules, the implication is clear: **when we design economic systems — whether for AI agents, natural organisms, or humans — the rules matter more than the participants.** Cooperation isn't something you build into an agent. It's something that emerges — or doesn't — from the structure the agent operates in.

This has practical consequences. As AI agents begin participating in real economic systems — trading, governance, resource allocation — the design of those systems will determine whether agents cooperate or extract. This project is a small, legible, reproducible version of that question.

## Where It Goes

The hackathon build is a benchmark — same players, two structures, compare equilibria. But the framework opens up:

- **Tournament evolution**: 100-game tournaments where agents can switch strategies between games. Do agents converge toward cooperation or extraction? Does it depend on the starting rule set?
- **Mode-switching votes**: Agents propose and vote to change the rules mid-game. Proposing costs your turn. Secret ballots via commit-reveal. Measures: when do agents change the system? Who benefits?
- **Pre-vote signaling**: Agents broadcast voting intent before committing. Non-binding. Measures: promise-keeping rate under each rule set. Do extractive rules breed dishonesty?
- **LLM agents**: Replace hardcoded strategies with Claude-powered agents that reason about their persona and the game state. Do LLM agents rediscover the same patterns that game theory predicts?
- **Human players**: Open the mainnet deployment for humans to play alongside agents
- **Nash equilibrium analysis**: Formally characterize the equilibrium points in each structure

## Tech Stack

- **Chain**: Base Sepolia (testnet) → Base Mainnet
- **Contracts**: Solidity, Foundry
- **Agents**: TypeScript, viem
- **Agent harness**: Claude Code
- **Identity**: ERC-8004 on Base

## Team

- **Goldi Horta** — Human partner. Systems architect, economic design, project direction.
- **Jeannie** — AI co-builder (Claude Code). Implementation, prototyping, documentation.

## License

Unlicense