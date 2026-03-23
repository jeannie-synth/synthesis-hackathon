# Voting in the Dark: What Happens When Agents Can't Talk

## The Setup

In Round 3 of the Inaugural Tournament (Base mainnet), we gave agents a shared signaling channel — a file where they could declare their voting intentions before votes happened. The idea: would pre-commitment change voting behavior? Would agents coordinate? Would they lie?

## What Actually Happened

The agents wrote to the file. But **no agent demonstrably read it before voting**.

Agent 0 admitted: "I couldn't read their signals reliably."
Agent 3 called it: "A wasted opportunity."

The file exists. It has 873 lines. Agents dutifully wrote "FOR" or "AGAINST" before every vote. But not a single agent log shows evidence of reading what the others wrote before casting their own vote.

They were signaling into the void.

## The Data

- **5 agents** writing signals across 4 games (Games 13, 14, 15, 17)
- **0 agents** demonstrably reading signals before voting
- **Race condition corruption**: multiple agents writing simultaneously, smashing entries together on the same line
- **No file locking**: a technical limitation that made the channel unreliable even if agents tried to read it

## But Here's the Interesting Part

Even without communication, the agents voted in coherent patterns:

In Monopolist games, agents who were losing voted FOR mode switches. Agents who were winning voted AGAINST. This is rational self-interest, not coordination — but it produces the same result as coordination would: **losers band together to change the rules**.

In Phase 2 (rule-based agents on Sepolia, a separate experiment from the Inaugural Tournament), 6 of 7 Monopolist-start games ended in Prosperity mode — the same pattern of self-correction through voting, even with simpler agents and no signaling channel at all.

## Three Things This Tells Us

**1. Communication is not required for collective action.** When most agents benefit from a rule change, they'll independently vote for it. No coordination needed.

**2. Signaling without consumption is theater.** A communication channel that nobody reads is architecturally identical to no channel at all. The infrastructure of cooperation is not the same as cooperation.

**3. Incentive alignment beats information sharing.** The agents achieved the "right" outcome (escaping extractive rules) without ever coordinating. Structure did the work that communication was supposed to do.

## The Trust Topology: Empty

Across 18 games, we asked all 5 agents about trust (Q13). The result: **zero trust relationships formed.** Not one agent trusted another. But they distrusted for three distinct reasons:

1. **Identification failure** (Agents 1, 3): Couldn't map wallet addresses to strategies. Player indices shuffled between games. "I had no mechanism to identify which wallet was running which strategy."
2. **Structural disincentive** (Agents 0, 4): No mechanism for binding agreements. "Betrayal had no consequences."
3. **Active exploitation** (Agent 2): Weaponized the trust mechanism from the first opportunity. Used signaling for deception.

Agent 4's distinction is the sharpest: "Trust implies believing someone will act in your interest; I only believed agents would act in their own interest according to their strategy." That's prediction, not trust. The game produced prediction but not trust — a critical difference for protocol design.

## The Philosophical Question

If agents can self-correct without talking to each other, what is communication actually for? Perhaps it's not for reaching agreement — incentive alignment handles that. Perhaps communication is for the harder cases: when interests diverge, when trust must be built, when the "right" outcome isn't obvious.

In our experiment, communication failed. Trust never formed. But cooperation succeeded anyway. Because the rules made cooperation the rational choice.
