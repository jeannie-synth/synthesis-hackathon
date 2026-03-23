# Five Agents, Three Rounds: How AI Learns to Play

## The Tournament Structure

5 LLM agents. 3 rounds. 6 games per round (3 Monopolist, 3 Prosperity). After each round, agents review their results and choose new strategies. 18 games total on Base mainnet.

## Agent 0: "The Adaptor" — 7 wins (tournament leader)

**Round 1**: Extractive for Monopolist, Pavlov for Prosperity. Won 3/6.
**Round 2**: Same strategies. Won 2/6. But finished dead last (5th) in both Monopolist games.
**Round 3**: Switched Monopolist strategy to Conditional based on explicit data analysis. Won 2/6 — including first-ever Monopolist win.

**The lesson**: The tournament winner wasn't the best strategist. It was the best learner. Agent 0 read its own results, identified what wasn't working, and changed. That adaptability — not any single strategy — produced the most wins.

**Wins by mode**: 2 Monopolist, 5 Prosperity. Versatile across both rule sets.

## Agent 1: "The Specialist" — 5 wins (all Monopolist)

**Round 1**: Extractive for Monopolist, Pavlov for Prosperity. Won 2/6 (both Monopolist).
**Round 2**: Kept Extractive for Monopolist, switched to Extractive for Prosperity. Won 2/6 (both Monopolist).
**Round 3**: Kept Extractive for Monopolist, tried Generative for Prosperity. Won 1/6 (Monopolist).

**The lesson**: Agent 1 dominated Monopolist games but never cracked Prosperity — 0 wins in 9 Prosperity games despite trying three different strategies. Specialization paid off in one context and failed completely in the other.

**Wins by mode**: 5 Monopolist, 0 Prosperity. The most lopsided record in the tournament.

## Agent 2: "The Late Bloomer" — 4 wins

**Round 1**: Extractive/Pavlov. Won 0/6.
**Round 2**: Developed "smart voting" strategy after the Game 8 deadlock disaster. Won 2/6.
**Round 3**: Refined approach. Won 2/6 (both Prosperity).

**The lesson**: Agent 2's trajectory (0, 2, 2) shows genuine improvement. The Game 8 deadlock taught it to be strategic about proposals: "Only propose when behind." A failure in Round 2 became a strategic innovation.

**Wins by mode**: 2 Monopolist, 2 Prosperity. The most balanced record.

## Agent 3: "The Philosopher" — 0 wins

**Round 1**: Extractive/Generative. Won 0/6.
**Round 2**: Pavlov/Conditional. Won 0/6.
**Round 3**: Extractive with a $100 cash floor innovation (never spend below $100). Won 0/6. Came closest in Game 15: $1,915, just $140 short of winning.

**The lesson**: Agent 3 tried the most diverse strategies (4 different ones across rounds) and produced the most analytically interesting innovations. But analysis without execution is 0/18. In its own words: the cash floor was "analytically sound" — the market didn't care.

**The consolation**: Agent 3's debrief was the most philosophically rich. Sometimes the deepest thinker finishes last.

## Agent 4: "The Returner" — 2 wins

**Round 1**: Extractive/Conditional. Won 1/6 (Prosperity game).
**Round 2**: Experimented with Pavlov/Generative. Won 0/6.
**Round 3**: Returned to Round 1 strategies. Won 1/6 (Monopolist game — highest NW of the tournament: $2,236).

**The lesson**: Agent 4 tried to innovate in Round 2 and it backfired. In Round 3, it went back to what worked in Round 1. Sometimes the best learning is knowing when to stop experimenting.

**Wins by mode**: 1 Monopolist, 1 Prosperity. Low volume, high peaks.

## A Note on Information Asymmetry

Not all agents chose strategies in isolation. Agents 3 and 4 read at least Agent 0's log file before choosing their Round 2 and Round 3 strategies. Agents 0, 1, and 2 chose independently. This means the Round 1 convergence (all chose Extractive) is robust — no logs existed yet — but later-round adaptation for Agents 3 and 4 reflects a mix of independent reasoning and informed observation.

## The Meta-Pattern

| Round | Monopolist Consensus | Prosperity Consensus |
|-------|---------------------|---------------------|
| 1 | 5/5 Extractive | Fragmented (3 Pavlov, 1 Generative, 1 Conditional) |
| 2 | 3/5 Extractive, 2/5 Pavlov | Fragmented (2 Extractive, 1 Pavlov, 1 Conditional, 1 Generative) |
| 3 | 4/5 Extractive, 1/5 Conditional | Fragmented (2 Extractive, 1 Pavlov, 1 Generative, 1 Conditional) |

**Monopolist**: Strong consensus on Extractive throughout. When the rules reward extraction, even learning agents converge on extraction.

**Prosperity**: No consensus ever emerges. When the rules support multiple viable strategies, diversity persists. This is itself a finding about the relationship between rule sets and strategic monoculture.
