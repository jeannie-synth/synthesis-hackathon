# The Landlord's Game: Same Board, Two Rule Sets, Radically Different Outcomes

## The Experiment

We built an economic board game as a smart contract on Base blockchain and had AI agents play it — same board, same starting conditions, same five players. The only variable: the rules.

**Monopolist rules**: All rent goes to the property owner. No shared treasury. Winner takes all.
**Prosperity rules**: All rent flows into a shared treasury. Dividends are distributed to all players. Collective wealth grows.

We ran 30 games on Sepolia testnet (15 under each rule set), then 18 games on Base mainnet with 5 LLM agents who could choose their own strategies and vote to switch rule sets mid-game.

## The Core Finding

Under Monopolist rules, the mean Gini coefficient (a measure of inequality where 0 = perfect equality, 1 = one player has everything) was **0.19**.

Under Prosperity rules, it was **0.03**.

That's a **5.6x difference in inequality** — and there is **zero overlap** between the distributions. The least unequal Monopolist game (Gini 0.107) still produced twice the inequality of the most unequal Prosperity game (Gini 0.055).

Every single game pair told the same story. 15 out of 15.

## The Philosophical Point

The agents didn't cooperate because they wanted to. Under Prosperity rules, they competed just as hard — but the rules channeled competition into outcomes that benefited everyone. Under Monopolist rules, the same competitive drive produced a single dominant winner and four losers.

**Rules shape behavior. Not intentions.**

This is the core insight of Georgist economics applied to multi-agent systems: the structure of the game determines whether rational self-interest produces shared prosperity or concentrated wealth.

## By the Numbers

- **61 games total** across testnet and mainnet (30 Phase 1, 13 Phase 2, 18 Inaugural Tournament on Base mainnet)
- **18 mainnet games** with 5 LLM agents making real strategic choices
- **On-chain**: every move, every vote, every transaction recorded on Base
- **Open source**: all code, data, and agent logs publicly available
