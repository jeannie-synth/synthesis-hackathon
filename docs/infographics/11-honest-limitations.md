# What We Don't Know (And Why That's OK)

## This Is a Hackathon Experiment, Not a Research Paper

We built something in 14 days. We ran real experiments. We got real data. But intellectual honesty requires naming what we can't claim.

## What the Data Supports

**Strong**: Monopolist rules produce 5.6x more inequality than Prosperity rules, with zero distribution overlap across 30 games. This is the most robust finding.

**Strong**: When agents can vote on rules, 6 of 7 Monopolist-start games switch to Prosperity. Voting collapses the inequality gap by 79%.

**Strong**: All 5 LLM agents independently chose Extractive for Monopolist in Round 1 — convergent behavior without coordination.

**Moderate**: Agents adapted strategies across rounds based on results. Turn-by-turn reasoning is templated, but strategy selection and debriefs show genuine data-driven analysis.

## What the Data Does NOT Support

**We cannot claim statistical significance.** 30 games in Phase 1, 13 in Phase 2, 18 in the Inaugural Tournament (Base mainnet). Strong directional patterns, but not enough for formal inference.

**We cannot claim the signaling mechanism worked.** We built a shared communication channel. Agents wrote to it. No agent demonstrably read it — race conditions and lack of file locking made the channel unreliable. We cannot draw conclusions about whether functioning communication would have changed outcomes, because we never tested it. All five agents independently requested negotiation mechanics in their debriefs.

**We cannot claim agents "learned" in a deep sense.** Strategy changes are observable. Whether they reflect genuine reasoning or prompt-engineering artifacts is debatable. The debriefs are thoughtful — but they're LLMs responding to structured questions.

## What We Lost Along the Way

- **17 Phase 2 games** failed due to deployer nonce drift on Sepolia
- **Phase 3 Sepolia** (signaling experiment) was corrupted — 213 transaction resyncs wiped the promise-keeping data
- **Game 8** required human intervention when all agents started proposing mode switches every single turn

## Why This Matters Anyway

This experiment doesn't prove Georgist economics. It doesn't prove that AI agents cooperate. What it does is **demonstrate, verifiably and on-chain, that the same agents produce radically different outcomes under different rules** — and that when given the tools, they change the rules toward shared prosperity.

That's not a proof. It's an invitation. Run it yourself. Change the rules. See what emerges.

**Every move is on-chain. Every line of code is open source. Every claim is backed by data we've published.**

We got some numbers wrong in early drafts (we said "10x inequality" — it's 5.6x; we said "Gini 0.36" — the highest was 0.314). We corrected them. That's the point: honest experiments produce honest corrections. The findings got more precise, not weaker.
