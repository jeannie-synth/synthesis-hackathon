# The Inaugural Tournament: 5 AI Agents, 18 Games, 3 Rounds — In Numbers

## What Is This?

Five LLM-powered AI agents played The Landlord's Game on Base mainnet over 3 rounds in the Inaugural Tournament. Unlike Phase 1-2 (fixed strategies), these agents could **choose their own strategy** each round and **vote to switch rule sets** during games. Each round had 3 Monopolist and 3 Prosperity games. All moves were on-chain.

## Round 1: The Unanimous Choice

Every agent independently chose **Extractive** for Monopolist games. Five AI minds, zero coordination, same conclusion: when the rules reward extraction, extract.

For Prosperity games, strategies diverged: 3 chose Pavlov, 1 chose Generative, 1 chose Conditional.

## The Strategy Matrix

| Agent | R1 Mon | R1 Pros | R2 Mon | R2 Pros | R3 Mon | R3 Pros |
|-------|--------|---------|--------|---------|--------|---------|
| 0 | Extractive | Pavlov | Extractive | Pavlov | Conditional | Pavlov |
| 1 | Extractive | Pavlov | Extractive | Extractive | Extractive | Generative |
| 2 | Extractive | Pavlov | Extractive | Extractive | Extractive | Extractive |
| 3 | Extractive | Generative | Pavlov | Conditional | Extractive | Extractive |
| 4 | Extractive | Conditional | Pavlov | Generative | Extractive | Conditional |

Monopolist: 5/5 Extractive in Round 1, but by Round 3, strategies diverge as agents learn from results.
Prosperity: Wide experimentation across all 3 rounds. No consensus strategy.

## The Leaderboard

| Agent | Wins | Mono Wins | Pros Wins | Signature Move |
|-------|------|-----------|-----------|----------------|
| Agent 0 | 7/18 | 2 | 5 | Switched to Conditional in R3 after 5th-place finishes |
| Agent 1 | 5/18 | 5 | 0 | Monopolist specialist — never won a Prosperity game |
| Agent 2 | 4/18 | 2 | 2 | Late bloomer: 0 wins R1, then 2+2 |
| Agent 3 | 0/18 | 0 | 0 | Most experimental, came $140 short in Game 15 |
| Agent 4 | 2/18 | 1 | 1 | Highest single-game NW: $2,236 (Game 13) |

## Key Stats

- **18 games completed** on Base mainnet (9 Monopolist, 9 Prosperity)
- **All moves on-chain** — every roll, buy, build, vote is a Base mainnet transaction
- **Longest game**: Game 13 — 59 rounds, 299 turns, 12 mode switches
- **Shortest game**: Game 16 — 9 rounds, 46 turns, 0 mode switches
- **Most dramatic game**: Game 8 — 832 mode-switch events in 55 rounds (a voting deadlock)
- **Highest individual net worth**: $2,236 (Agent 4, Game 13)
- **Most consistent winner**: Agent 0 — won in both modes, adapted strategy based on data

## The Pattern

Round 1: Everyone extracts. Round 2: Some experiment. Round 3: Data-driven choices.

The tournament leader (Agent 0) won by **adapting** — not by finding the best strategy, but by switching strategies when the data said the current one wasn't working.
