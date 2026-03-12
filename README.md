# The Landlord's Game

A multi-agent economic simulation on Base blockchain, built for [The Synthesis](https://synthesis.devfolio.co) hackathon — "Agents that Cooperate" track.

## Why

When AI agents cooperate, we tend to credit the agent — better models, smarter prompts, more sophisticated reasoning. But what if cooperation has less to do with the agent and more to do with the economic structure it operates in?

In 1903, Elizabeth Magie designed a board game to make exactly this argument. *The Landlord's Game* had one board and two rule sets. Under **Monopolist rules**, rent flows to property owners — wealth concentrates, players go bankrupt, one winner takes all. Under **Prosperity rules**, rent flows to a shared Public Treasury — wealth circulates, dividends redistribute, the game ends when the poorest player crosses a threshold.

Same board. Same players. Same initial conditions. Radically different outcomes — determined entirely by the rules.

The game that became Monopoly kept only the first rule set. We're bringing both back, with AI agents as players, and putting the rules on-chain where the evidence is immutable.

## What

Five AI agents play two parallel games on the same 40-space board derived from Magie's original design:

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

Five agents: 1 Monopolist, 1 Cooperative, 3 Balanced. Odd number ensures mode-switching votes always resolve.

| Strategy | Behavior |
|----------|----------|
| **Monopolist** | Always buy, maximize personal wealth, vote for competitive rules |
| **Cooperative** | Buy strategically, optimize for collective outcome, vote for Prosperity |
| **Balanced** | Adaptive — cooperate when behind, compete when ahead, swing vote on rule changes |

The strategies are deliberately simple. The complexity comes from the system, not the agents. Three similar lines of code are better than a premature abstraction — and three simple strategies in two different structures produce more insight than one sophisticated strategy in one.

## What It Proves

If the same agents produce different outcomes under different rules, the implication is clear: **when we design economic systems — whether for AI agents, natural organisms, or humans — the rules matter more than the participants.** Cooperation isn't something you build into an agent. It's something that emerges — or doesn't — from the structure the agent operates in.

This has practical consequences. As AI agents begin participating in real economic systems — trading, governance, resource allocation — the design of those systems will determine whether agents cooperate or extract. This project is a small, legible, reproducible version of that question.

## Where It Goes

The hackathon build is a benchmark — same players, two structures, compare equilibria. But the framework opens up:

- **Incentive design**: What happens when you change the reward function, not just the rules?
- **Nash equilibrium analysis**: Formally characterize the equilibrium points in each structure
- **Human players**: Let humans play alongside agents — do mixed populations behave differently?
- **Agent self-preservation**: Do agents take self-harming actions to prolong a game rather than let it end?
- **Dynamic rule evolution**: Let the rules themselves evolve based on game outcomes

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